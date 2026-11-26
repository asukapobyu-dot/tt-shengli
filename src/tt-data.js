/*
 * 数据适配：用 SillyTavern / TauriTavern 的 getContext() 实现原插件用到的
 *   tavo.message / tavo.chat / tavo.character / tavo.persona / tavo.lorebook（只读）
 *
 * 对照 TauriTavern 源码（src/script.js、src/scripts/world-info.js、world-info-persistence.js）：
 *
 * 【消息 ID】ST 的消息 ID 就是楼层下标，删掉一层后面的下标全变；而引擎会把“已处理到哪条消息”
 *   存进存档。所以这里给每条消息分配稳定 ID，存在 message.extra[EXTRA_KEY]：
 *   - 随聊天文件保存；ST 切换 swipe 时会整体换掉 extra（每个 swipe 一份），
 *     所以换一个 swipe 就是一个新 ID —— 正好对应“这一楼的回复换了”，引擎会把它当新回复处理。
 *   - 新分配的 ID 只在内存里，ST 下次保存聊天时一并写盘；没写盘前刷新页面会重新分配，
 *     最坏情况是那一楼被重新分析一次，不会写错数据。
 *   - 复制出来的消息（分支、复制楼层）会带着同一个 ID：发现重复时，后面那条重新分配。
 *
 * 【消息对象】{ id, index, text, content, name, isUser, role, hidden, characterId, ts, swipeId }
 *   - hidden = ST 里被隐藏（is_system）的消息
 *   - characterId：群聊按 original_avatar 找角色；单聊里非用户消息就是当前角色
 *
 * 【角色 ID】characters 数组下标的字符串形式，和 ST 的 characterId 一致。
 *   读卡前调用 unshallowCharacter 补全懒加载字段（TT 默认懒加载角色卡）。
 */

export const EXTRA_KEY = 'char_physiology_id';

const str = (v) => (v == null ? '' : String(v));

function rid() {
    let s = '';
    try {
        const a = new Uint32Array(2);
        globalThis.crypto.getRandomValues(a);
        s = a[0].toString(36) + a[1].toString(36);
    } catch (e) {
        s = Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
    return s.slice(0, 10);
}

/**
 * @param {{ getContext: () => any, log?: (...a:any[]) => void }} deps
 */
export function createDataApi({ getContext, log }) {
    const ctx = () => getContext();
    const warn = (...a) => { try { (log || console.warn)(...a); } catch (e) { /* ignore */ } };

    // ---------------- 稳定消息 ID ----------------
    // 每个聊天数组一张索引：id -> 楼层；数组被宿主换掉（切换聊天）时自动作废。
    let idx = { arr: null, len: -1, map: new Map(), sig: '' };

    function chatArr() {
        const c = ctx();
        return c && Array.isArray(c.chat) ? c.chat : [];
    }
    function idOfMsg(m) {
        return m && m.extra && typeof m.extra === 'object' && typeof m.extra[EXTRA_KEY] === 'string' ? m.extra[EXTRA_KEY] : '';
    }
    function assignId(m) {
        if (!m || typeof m !== 'object') return '';
        if (!m.extra || typeof m.extra !== 'object') m.extra = {};
        const id = 'm' + rid();
        m.extra[EXTRA_KEY] = id;
        return id;
    }
    /** 给整个聊天补 ID 并重建索引。重复 ID（复制出来的楼层）后面那条重新分配。 */
    function reindex() {
        const arr = chatArr();
        const map = new Map();
        for (let i = 0; i < arr.length; i++) {
            const m = arr[i];
            if (!m || typeof m !== 'object') continue;
            let id = idOfMsg(m);
            if (!id || map.has(id)) id = assignId(m);
            map.set(id, i);
        }
        idx = { arr, len: arr.length, map, sig: sigOf(arr) };
        return idx;
    }
    // 便宜的签名：长度 + 首尾两条的 ID。删一层/插一层/换聊天都会改变它。
    function sigOf(arr) {
        const n = arr.length;
        return n + ':' + (n ? idOfMsg(arr[0]) : '') + ':' + (n ? idOfMsg(arr[n - 1]) : '');
    }
    function ensureIndex() {
        const arr = chatArr();
        if (idx.arr !== arr || idx.len !== arr.length || idx.sig !== sigOf(arr)) return reindex();
        return idx;
    }
    function indexOfId(id) {
        const key = str(id);
        if (!key) return -1;
        let ix = ensureIndex();
        let i = ix.map.get(key);
        const arr = chatArr();
        if (i != null && arr[i] && idOfMsg(arr[i]) === key) return i;
        // 索引过期（中间改动但首尾和长度没变）：重建一次再查
        ix = reindex();
        i = ix.map.get(key);
        return i != null ? i : -1;
    }

    // ---------------- 角色 ----------------
    function charList() {
        const c = ctx();
        return c && Array.isArray(c.characters) ? c.characters : [];
    }
    function charIndexByAvatar(avatar) {
        if (!avatar) return -1;
        return charList().findIndex((x) => x && x.avatar === avatar);
    }
    function currentGroup() {
        const c = ctx();
        if (!c || c.groupId == null || c.groupId === '') return null;
        const groups = Array.isArray(c.groups) ? c.groups : [];
        return groups.find((g) => g && String(g.id) === String(c.groupId)) || null;
    }
    /** 当前聊天的角色（数组下标字符串）。群聊 = 群成员（跳过找不到的），单聊 = 当前角色。 */
    function chatCharIds() {
        const c = ctx();
        const g = currentGroup();
        if (g) {
            const out = [];
            (Array.isArray(g.members) ? g.members : []).forEach((av) => {
                const i = charIndexByAvatar(av);
                if (i >= 0 && out.indexOf(String(i)) < 0) out.push(String(i));
            });
            return out;
        }
        if (c && c.characterId != null && c.characterId !== '' && charList()[Number(c.characterId)]) return [String(Number(c.characterId))];
        return [];
    }
    function speakerOf(m) {
        if (!m || m.is_user) return null;
        if (m.original_avatar) {
            const i = charIndexByAvatar(m.original_avatar);
            if (i >= 0) return String(i);
        }
        const g = currentGroup();
        if (g) {
            // 老消息没有 original_avatar：按名字在群成员里找
            const nm = str(m.name);
            const ids = chatCharIds();
            const hit = ids.find((id) => str(charList()[Number(id)] && charList()[Number(id)].name) === nm);
            return hit != null ? hit : null;
        }
        const c = ctx();
        if (m.is_system) return null;
        return c && c.characterId != null && c.characterId !== '' ? String(Number(c.characterId)) : null;
    }
    function toMsg(m, i) {
        if (!m || typeof m !== 'object') return null;
        let id = idOfMsg(m);
        if (!id) { reindex(); id = idOfMsg(m); }
        const text = str(m.mes);
        const isUser = m.is_user === true;
        const ts = Date.parse(m.send_date) || Number(m.send_date) || 0;
        return {
            id,
            index: i,
            text,
            content: text,
            name: str(m.name),
            isUser,
            role: isUser ? 'user' : (m.is_system ? 'system' : 'assistant'),
            hidden: m.is_system === true,
            characterId: speakerOf(m),
            ts,
            swipeId: Number.isFinite(Number(m.swipe_id)) ? Number(m.swipe_id) : 0,
        };
    }
    /** 把引擎传来的 [a, b]（支持负数，含端点）换成 [start, endExclusive) */
    function normRange(r, n) {
        let a = Number(r[0]); let b = r.length > 1 ? Number(r[1]) : a;
        if (!Number.isFinite(a)) a = 0;
        if (!Number.isFinite(b)) b = n - 1;
        if (a < 0) a = n + a;
        if (b < 0) b = n + b;
        a = Math.max(0, Math.floor(a));
        b = Math.min(n - 1, Math.floor(b));
        return b < a ? [0, 0] : [a, b + 1];
    }

    const message = {
        /** get(id) / get('id') / get({ index }) / get({ id }) */
        async get(q) {
            const arr = chatArr();
            ensureIndex();
            if (q && typeof q === 'object') {
                if (q.index != null) {
                    const i = Number(q.index);
                    return Number.isInteger(i) && i >= 0 && i < arr.length ? toMsg(arr[i], i) : null;
                }
                if (q.id != null) q = q.id; else return null;
            }
            if (q == null || q === '') return null;
            const i = indexOfId(q);
            return i >= 0 ? toMsg(arr[i], i) : null;
        },
        /** find([a, b]) / find({ range: [a, b] }) / find({}) —— 按楼层顺序返回 */
        async find(q) {
            const arr = chatArr();
            ensureIndex();
            const range = Array.isArray(q) ? q : (q && Array.isArray(q.range) ? q.range : null);
            const [s, e] = range ? normRange(range, arr.length) : [0, arr.length];
            const out = [];
            for (let i = s; i < e; i++) { const m = toMsg(arr[i], i); if (m) out.push(m); }
            return out;
        },
        async count() { return chatArr().length; },
    };

    // ---------------- 角色卡 ----------------
    async function unshallow(i) {
        const c = ctx();
        const ch = charList()[i];
        if (ch && ch.shallow && c && typeof c.unshallowCharacter === 'function') {
            try { await c.unshallowCharacter(i); } catch (e) { warn('[char-physiology] unshallowCharacter 失败', e); }
        }
        return charList()[i] || null;
    }
    function cardOf(ch, i) {
        if (!ch) return null;
        const d = ch.data && typeof ch.data === 'object' ? ch.data : {};
        const pick = (k) => (ch[k] != null && ch[k] !== '' ? ch[k] : d[k]);
        return {
            id: String(i),
            name: str(ch.name || d.name),
            avatar: str(ch.avatar),
            description: str(pick('description')),
            personality: str(pick('personality')),
            scenario: str(pick('scenario')),
            first_mes: str(pick('first_mes')),
            mes_example: str(pick('mes_example')),
            creator_notes: str(d.creator_notes != null ? d.creator_notes : ch.creatorcomment),
            system_prompt: str(d.system_prompt),
            post_history_instructions: str(d.post_history_instructions),
            alternate_greetings: Array.isArray(d.alternate_greetings) ? d.alternate_greetings.filter((x) => typeof x === 'string') : [],
            tags: Array.isArray(ch.tags) ? ch.tags.slice() : (Array.isArray(d.tags) ? d.tags.slice() : []),
            // 卡内嵌世界书（CCv2 character_book），引擎的扫描会读 data.character_book
            data: { character_book: d.character_book || null, extensions: { world: d.extensions && d.extensions.world ? String(d.extensions.world) : '' } },
        };
    }
    function resolveCharIndex(q) {
        const list = charList();
        if (q && typeof q === 'object') q = q.id != null ? q.id : (q.avatar != null ? q.avatar : null);
        if (q == null || q === '') return -1;
        const n = Number(q);
        if (Number.isInteger(n) && n >= 0 && n < list.length) return n;
        const s = str(q);
        const byAv = charIndexByAvatar(s);
        if (byAv >= 0) return byAv;
        return list.findIndex((x) => x && str(x.name) === s);
    }

    const character = {
        async get(q) {
            const i = resolveCharIndex(q);
            if (i < 0) return null;
            const ch = await unshallow(i);
            return cardOf(ch, i);
        },
        /** find(name, { match: 'contains' | 'exact' }) —— 只返回 { id, name }，引擎会再 get(id) 读全文 */
        async find(name, opts) {
            const nm = str(name).trim().toLowerCase();
            if (!nm) return [];
            const contains = !opts || opts.match !== 'exact';
            const out = [];
            charList().forEach((ch, i) => {
                const n = str(ch && ch.name).toLowerCase();
                if (!n) return;
                if (n === nm || (contains && (n.indexOf(nm) >= 0 || nm.indexOf(n) >= 0))) out.push({ id: String(i), name: str(ch.name) });
            });
            // 完全同名排前面
            out.sort((a, b) => (a.name.toLowerCase() === nm ? 0 : 1) - (b.name.toLowerCase() === nm ? 0 : 1));
            return out;
        },
    };

    // ---------------- 用户设定（persona）----------------
    function personaNow() {
        const c = ctx();
        const name = str(c && c.name1).trim();
        if (!name) return null;
        const pu = c && c.powerUserSettings;
        const description = str(pu && pu.persona_description);
        return { id: 'p:' + name, name, description };
    }
    const persona = {
        async get() { return personaNow(); },
    };

    // ---------------- 世界书（只读）----------------
    /** 当前聊天可见的世界书名：聊天绑定的 + 角色主世界书 + 角色附加世界书（去重，保持顺序） */
    function chatBookNames() {
        const c = ctx();
        const out = [];
        const add = (n) => { const s = str(n).trim(); if (s && out.indexOf(s) < 0) out.push(s); };
        const md = c && c.chatMetadata;
        if (md && md.world_info) add(md.world_info);
        const ws = c && c.worldInfoSettings; // 可选（新版 TT 才有）：附加世界书 charLore
        chatCharIds().forEach((id) => {
            const ch = charList()[Number(id)];
            const d = ch && ch.data;
            if (d && d.extensions && d.extensions.world) add(d.extensions.world);
            const lore = ws && Array.isArray(ws.charLore) ? ws.charLore : [];
            const file = ch && ch.avatar ? String(ch.avatar).replace(/\.[^.]+$/, '') : '';
            const extra = lore.find((x) => x && x.name === file);
            if (extra && Array.isArray(extra.extraBooks)) extra.extraBooks.forEach(add);
        });
        return out;
    }
    const lorebook = {
        /** get(name) —— 返回 { id, name, entries: [...] }；读不到返回 null。没有 create/update：引擎会改用注入模式 */
        async get(name) {
            const c = ctx();
            const n = str(name && typeof name === 'object' ? (name.name != null ? name.name : name.id) : name).trim();
            if (!n || !c || typeof c.loadWorldInfo !== 'function') return null;
            let data = null;
            try { data = await c.loadWorldInfo(n); } catch (e) { warn('[char-physiology] 读取世界书失败', n, e); return null; }
            if (!data || typeof data !== 'object') return null;
            const raw = data.entries && typeof data.entries === 'object' ? data.entries : {};
            const entries = (Array.isArray(raw) ? raw : Object.keys(raw).map((k) => raw[k])).filter(Boolean).map((en) => ({
                uid: en.uid,
                name: str(en.comment),
                comment: str(en.comment),
                keys: Array.isArray(en.key) ? en.key.slice() : [],
                content: str(en.content),
                enabled: en.disable !== true,
                disable: en.disable === true,
                constant: en.constant === true,
            }));
            return { id: n, name: n, entries };
        },
    };

    // ---------------- 聊天 ----------------
    function chatNow() {
        const c = ctx();
        const id = (() => {
            try { const x = typeof c.getCurrentChatId === 'function' ? c.getCurrentChatId() : c.chatId; return x != null && x !== '' ? String(x) : ''; } catch (e) { return ''; }
        })();
        if (!id) return null;
        const g = currentGroup();
        const p = personaNow();
        return {
            id,
            name: g ? str(g.name) : str(c.name2),
            title: id,
            group: !!g,
            characters: chatCharIds().map((cid) => ({ id: cid, name: str(charList()[Number(cid)] && charList()[Number(cid)].name) })),
            persona: p ? { id: p.id, name: p.name, description: p.description } : null,
            lorebooks: chatBookNames().map((n) => ({ id: n, name: n })),
        };
    }
    const chat = {
        async current() { return chatNow(); },
        /** 只认当前聊天；其他聊天返回 undefined（“不确定”），引擎因此不会误删别的聊天的数据 */
        async get(id) {
            const cur = chatNow();
            return cur && String(id) === cur.id ? cur : undefined;
        },
        /** 宿主没有“列出全部聊天”的同步接口：返回 null，引擎会跳过孤儿清理 */
        async find() { return null; },
        /** 不允许插件改聊天绑定（原版用来挂自建世界书，移植版改走注入） */
        async update() { const e = new Error('chat.update 在 TauriTavern 移植版中不可用'); e.code = 'unsupported'; throw e; },
    };

    return {
        message,
        character,
        persona,
        lorebook,
        chat,
        // 供运行时（块 5）和测试使用
        __msgId(i) { const arr = chatArr(); ensureIndex(); return arr[i] ? idOfMsg(arr[i]) : ''; },
        __indexOf: indexOfId,
        __reindex: reindex,
        __chatCharIds: chatCharIds,
    };
}
