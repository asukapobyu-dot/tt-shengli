/*
 * 变量存储：用 SillyTavern / TauriTavern 的数据实现原插件的 tavo.variable。
 *
 *   chat 作用域   → chatMetadata[NS]          随当前聊天文件保存（saveMetadataDebounced）
 *   global 作用域 → extensionSettings[NS].vars 全局保存（saveSettingsDebounced）
 *
 * 要点（对照 TauriTavern src/script.js）：
 *   - 切换聊天时宿主会整体替换 chat_metadata 对象，所以每次都通过 getContext() 现取，绝不缓存引用。
 *   - 没有打开的聊天，或者读/写之间聊天 ID 变了，就抛 chat_runtime_not_ready（code=conflict）。
 *     引擎原本就把这个错误当作“宿主正在切换聊天”：会放弃本次写入，不会把数据写进别的聊天。
 *   - 值一律深拷贝后存取，调用方改了返回值也不会悄悄改到存档。
 */

export const NS = 'char_physiology';

export function notReady(why) {
    const e = new Error('chat_runtime_not_ready' + (why ? '：' + why : ''));
    e.code = 'conflict';
    e.details = { reason: 'chat_runtime_not_ready', why: why || '' };
    return e;
}

const clone = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));

/** 兼容引擎的三种调用写法：(name, {scope}) / (name, 'global') / ({ name, scope }) */
export function parseArgs(a, b, c, withValue) {
    if (a && typeof a === 'object' && !Array.isArray(a)) {
        return { name: String(a.name), value: a.value, scope: scopeOf(a.scope) };
    }
    if (withValue) return { name: String(a), value: b, scope: scopeOf(c) };
    return { name: String(a), scope: scopeOf(b) };
}

export function scopeOf(o) {
    const s = typeof o === 'string' ? o : (o && o.scope);
    return s === 'global' ? 'global' : 'chat';
}

/** 当前聊天的 ID：单聊 = characters[characterId].chat；群聊 = group.chat_id */
export function currentChatId(ctx) {
    if (!ctx) return '';
    try {
        if (typeof ctx.getCurrentChatId === 'function') {
            const id = ctx.getCurrentChatId();
            if (id != null && id !== '') return String(id);
        }
    } catch (e) { /* ignore */ }
    if (ctx.chatId != null && ctx.chatId !== '') return String(ctx.chatId);
    return '';
}

/**
 * @param {{ getContext: () => any, onError?: (e:any) => void }} deps
 */
export function createVariableStore({ getContext, onError }) {
    const ctx = () => getContext();

    function chatBag(create) {
        const c = ctx();
        const id = currentChatId(c);
        const md = c && c.chatMetadata;
        if (!id || !md || typeof md !== 'object') throw notReady(id ? 'chatMetadata 不可用' : '没有打开的聊天');
        let bag = md[NS];
        if (!bag || typeof bag !== 'object' || Array.isArray(bag)) {
            if (!create) return { id, bag: null, c };
            bag = md[NS] = { v: 1, vars: {} };
        }
        if (!bag.vars || typeof bag.vars !== 'object') bag.vars = {};
        return { id, bag, c };
    }

    function globalBag(create) {
        const c = ctx();
        const es = c && c.extensionSettings;
        if (!es || typeof es !== 'object') throw new Error('extensionSettings 不可用');
        let bag = es[NS];
        if (!bag || typeof bag !== 'object' || Array.isArray(bag)) {
            if (!create) return { bag: null, c };
            bag = es[NS] = {};
        }
        if (!bag.vars || typeof bag.vars !== 'object') {
            if (!create) return { bag: null, c };
            bag.vars = {};
        }
        return { bag, c };
    }

    function saveChat(c) {
        try {
            if (typeof c.saveMetadataDebounced === 'function') c.saveMetadataDebounced();
            else if (typeof c.saveMetadata === 'function') void Promise.resolve(c.saveMetadata()).catch((e) => onError && onError(e));
        } catch (e) { if (onError) onError(e); }
    }
    function saveGlobal(c) {
        try { if (typeof c.saveSettingsDebounced === 'function') c.saveSettingsDebounced(); } catch (e) { if (onError) onError(e); }
    }

    const api = {
        async get(a, b) {
            const { name, scope } = parseArgs(a, b);
            if (scope === 'global') {
                const { bag } = globalBag(false);
                return bag ? clone(bag.vars[name]) : undefined;
            }
            const { bag } = chatBag(false);
            return bag ? clone(bag.vars[name]) : undefined;
        },
        async set(a, b, c) {
            const { name, value, scope } = parseArgs(a, b, c, true);
            if (scope === 'global') {
                const { bag, c: cx } = globalBag(true);
                if (value === undefined) delete bag.vars[name]; else bag.vars[name] = clone(value);
                saveGlobal(cx);
                return true;
            }
            const before = currentChatId(ctx());
            const { id, bag, c: cx } = chatBag(true);
            if (before && id !== before) throw notReady('写入时聊天已切换');
            if (value === undefined) delete bag.vars[name]; else bag.vars[name] = clone(value);
            saveChat(cx);
            return true;
        },
        async unset(a, b) {
            const { name, scope } = parseArgs(a, b);
            if (scope === 'global') {
                const { bag, c: cx } = globalBag(false);
                if (bag && Object.prototype.hasOwnProperty.call(bag.vars, name)) { delete bag.vars[name]; saveGlobal(cx); }
                return true;
            }
            const { bag, c: cx } = chatBag(false);
            if (bag && Object.prototype.hasOwnProperty.call(bag.vars, name)) { delete bag.vars[name]; saveChat(cx); }
            return true;
        },
        async keys(a) {
            const scope = scopeOf(a);
            const { bag } = scope === 'global' ? globalBag(false) : chatBag(false);
            return bag ? Object.keys(bag.vars) : [];
        },
        async list(a) {
            const scope = scopeOf(a);
            const { bag } = scope === 'global' ? globalBag(false) : chatBag(false);
            return bag ? Object.keys(bag.vars).map((name) => ({ name, value: clone(bag.vars[name]) })) : [];
        },
    };
    return api;
}
