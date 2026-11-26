/*
 * tavo 适配层：用 SillyTavern / TauriTavern 的接口实现原插件用到的 tavo.* 子集。
 *
 *   块 3（tt-store.js + tt-data.js）：
 *     variable   → chatMetadata（聊天）/ extensionSettings（全局）
 *     message    → getContext().chat，稳定消息 ID
 *     chat / character / persona / lorebook（只读）
 *     plugin.i18n、utils.toast
 *   块 4（tt-ai.js + tt-files.js）：
 *     generate   → generateRaw（酒馆当前 API）或连接配置
 *     http       → 自定义 API：浏览器直连，跨域被拦时经酒馆后端转发
 *     file       → 角色图像存进 /user/files
 *     plugin.config → extensionSettings.char_physiology.config（缺省值照搬原插件 manifest）
 *   块 5：plugin.on 的事件由运行时通过 __emit 派发
 *
 * 未实现的方法抛出 code='unsupported' 的错误，引擎原本就会对缺失能力降级。
 */

import { createVariableStore, NS } from './tt-store.js';
import { createDataApi } from './tt-data.js';
import { createAiApi } from './tt-ai.js';
import { createFileApi } from './tt-files.js';

/** 原插件 manifest 里设置页的缺省值（injectTemplate 缺省为 null：引擎自动用本地化默认模板） */
export const CONFIG_DEFAULTS = Object.freeze({
    enabled: true, autoUpdate: true,
    cycleLength: 28, periodLength: 5, fertileWindowDays: 5,
    useAiAssist: false, aiDescribe: true, aiPlot: true, aiInit: true,
    aiContext: 8, aiMaxTokens: 8000, aiNoThink: true, aiBaselineTokens: 16000, aiCardChars: 6000,
    customApiEnabled: false, apiBaseUrl: 'https://api.openai.com/v1', apiModel: 'gpt-4o-mini',
    injectEnabled: true, injectMode: 'lore', injectIntimacy: true, injectDetail: 'standard', injectPosition: 'before',
});

export function unsupported(name) {
    const e = new Error('tavo.' + name + ' 尚未在 TauriTavern 适配层实现');
    e.code = 'unsupported';
    return e;
}

/** toastr 级别：引擎/面板的 toast 只传文字；按内容粗分一下，出错类用 warning 更醒目 */
function toastLevel(msg, opts) {
    const t = opts && (opts.type || opts.level);
    if (t === 'error' || t === 'warning' || t === 'success' || t === 'info') return t;
    return /失败|错误|出错|无法|不能|failed|error|cannot/i.test(String(msg)) ? 'warning' : 'info';
}

export function createTavoShim({ extId, baseUrl, i18n, getContext }) {
    const listeners = new Map(); // 事件名 -> Set<fn>
    const log = (...a) => { try { console.warn(...a); } catch (e) { /* ignore */ } };

    const plugin = {
        id: extId,
        baseUrl,
        i18n: { t: (k, p) => i18n.t(k, p), locale: i18n.locale },
        on(event, fn) {
            if (typeof fn !== 'function') return () => {};
            if (!listeners.has(event)) listeners.set(event, new Set());
            listeners.get(event).add(fn);
            return () => listeners.get(event) && listeners.get(event).delete(fn);
        },
        onSidebarAction() { return () => {}; },
        onLastMessageAction() { return () => {}; },
        // 引擎同步调用 config.all()：必须同步返回（原 Tavo 也是同步的）
        config: {
            all() {
                let saved = {};
                try {
                    const es = getContext().extensionSettings;
                    const bag = es && es[NS];
                    if (bag && bag.config && typeof bag.config === 'object') saved = bag.config;
                } catch (e) { /* 宿主未就绪：用缺省值 */ }
                return Object.assign({}, CONFIG_DEFAULTS, saved);
            },
            set(key, value) {
                const c = getContext();
                const es = c && c.extensionSettings;
                if (!es) return false;
                const bag = es[NS] && typeof es[NS] === 'object' ? es[NS] : (es[NS] = {});
                if (!bag.config || typeof bag.config !== 'object') bag.config = {};
                if (value === undefined) delete bag.config[key]; else bag.config[key] = value;
                try { if (typeof c.saveSettingsDebounced === 'function') c.saveSettingsDebounced(); } catch (e) { /* ignore */ }
                return true;
            },
        },
    };

    const variable = createVariableStore({ getContext, onError: (e) => log('[char-physiology] 保存失败', e) });
    const data = createDataApi({ getContext, log });
    const ai = createAiApi({ getContext, log });
    const file = createFileApi({ getContext });

    const utils = {
        async toast(msg, opts) {
            const text = String(msg == null ? '' : msg);
            if (!text) return;
            const tr = globalThis.toastr;
            try {
                if (tr) {
                    const lv = toastLevel(text, opts);
                    (tr[lv] || tr.info).call(tr, text, '', { timeOut: lv === 'warning' ? 6000 : 3500, escapeHtml: true });
                } else {
                    console.info('[char-physiology]', text);
                }
            } catch (e) { /* ignore */ }
        },
    };

    /**
     * 界面能力（面板用）：
     *   confirm(msg) → 酒馆的确认弹窗（callGenericPopup，POPUP_TYPE.CONFIRM），返回 true/false；
     *                  没有弹窗能力时由面板退回 window.confirm
     *   getInsets()  → 面板上下留白：酒馆顶栏 #top-bar 与输入区 #send_form 的高度
     */
    const ui = {
        async confirm(msg) {
            const ctx = getContext();
            const popup = ctx && ctx.callGenericPopup;
            const types = (ctx && ctx.POPUP_TYPE) || {};
            const results = (ctx && ctx.POPUP_RESULT) || {};
            if (typeof popup !== 'function' || types.CONFIRM == null) throw Object.assign(new Error('no popup'), { code: 'unsupported' });
            const box = globalThis.document ? globalThis.document.createElement('div') : null;
            let content = String(msg == null ? '' : msg);
            if (box) { box.style.whiteSpace = 'pre-wrap'; box.textContent = content; content = box; }
            const r = await popup(content, types.CONFIRM);
            return r === (results.AFFIRMATIVE != null ? results.AFFIRMATIVE : 1) || r === true;
        },
        getInsets() {
            const D = globalThis.document;
            const W = globalThis.window;
            if (!D) return {};
            const rect = (sel) => { const el = D.querySelector(sel); try { return el && el.getBoundingClientRect ? el.getBoundingClientRect() : null; } catch (e) { return null; } };
            // 顶部：酒馆顶栏（#top-settings-holder）的下边缘；取不到时用 TT 的 --topBarBlockSize 变量
            let top = 0;
            const tr = rect('#top-settings-holder') || rect('#top-bar');
            if (tr && tr.bottom > 0) top = tr.bottom;
            if (!top && W && typeof W.getComputedStyle === 'function') {
                try { top = parseFloat(W.getComputedStyle(D.documentElement).getPropertyValue('--topBarBlockSize')) || 0; } catch (e) { /* ignore */ }
            }
            // 底部：输入区（#form_sheld，含 #send_form）离屏幕底边的距离
            let bottom = 0;
            const br = rect('#form_sheld') || rect('#send_form');
            const vh = (W && W.innerHeight) || 0;
            if (br && br.height > 0 && vh) bottom = Math.max(0, vh - br.top);
            return { topBar: Math.round(top), bottomInput: Math.round(bottom) };
        },
    };

    return {
        /** 面板据此跳过 Tavo 专有的做法（自己加载样式表、切换引擎角色、“从 Tavo 导入”按钮） */
        __host: 'sillytavern',
        plugin,
        variable,
        utils,
        ui,
        message: data.message,
        chat: data.chat,
        character: data.character,
        persona: data.persona,
        lorebook: data.lorebook,
        generate: ai.generate,
        http: ai.http,
        file,
        /** 由运行时派发宿主事件（块 5 使用） */
        __emit(event, payload) {
            const set = listeners.get(event);
            if (!set) return [];
            return [...set].map((fn) => { try { return fn(payload); } catch (e) { return Promise.reject(e); } });
        },
        __getContext: getContext,
        __data: data,
        __ai: ai,
    };
}
