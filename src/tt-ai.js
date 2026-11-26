/*
 * AI 通道：实现原插件用到的 tavo.generate 和 tavo.http.request。
 *
 * 【tavo.generate(prompt, { timeout, settings:{ maxCompletionTokens } })】引擎用它调用“酒馆模型”。
 *   这里按面板里选的通道转发（设置存在 extensionSettings.char_physiology.ai.channel）：
 *     - 'main'（默认）：generateRaw —— 用酒馆当前的 API 和模型，不带聊天记录和角色卡
 *     - 'profile'    ：连接配置（Connection Manager）——不影响主聊天当前的连接
 *   选了连接配置但配置不存在 / 连接管理器被禁用 → 报错，不静默换通道（和原插件“半填不切换”的原则一致）。
 *
 * 【tavo.http.request(url, init)】引擎的“自定义 API”（OpenAI 兼容）自己拼请求，这里只负责送达：
 *   1. 先用浏览器 fetch 直连
 *   2. 直连被跨域（CORS）拦下（fetch 抛 TypeError）→ 改走 TauriTavern 后端转发：
 *        POST /chat/completions → /api/backends/chat-completions/generate（chat_completion_source:'custom'）
 *        GET  /models           → /api/backends/chat-completions/status
 *      用户的密钥放在本次请求的 custom_include_headers 里，不写进酒馆的密钥库。
 *      后端会把 custom_include_body 合并进上游请求，所以 thinking / enable_thinking 等参数照样能带过去。
 *   返回值模拟 fetch 的 Response（ok / status / headers.get / text / json），引擎原样解析。
 *   iOS 版 TT 禁止覆盖接口地址，此时后端会报“llm.endpoint_overrides”错误，原样转给用户。
 *
 * 对照 TauriTavern 源码：script.js（generateRaw）、extensions/shared.js（ConnectionManagerRequestService）、
 * routes/ai-routes.js、Rust chat_completion_service（config.rs / payload/openai.rs / mod.rs）。
 */

import { NS } from './tt-store.js';

export const CHANNELS = ['main', 'profile'];

/** 后端转发时不能放进 custom_include_body 的字段（由后端自己处理或必须保留原值） */
const TOP_LEVEL = ['messages', 'model', 'temperature', 'max_tokens', 'max_completion_tokens', 'stream', 'presence_penalty', 'frequency_penalty', 'top_p', 'top_k', 'stop', 'seed', 'n', 'user', 'reasoning_effort', 'logit_bias'];

function aiSettings(getContext) {
    const c = getContext();
    const es = c && c.extensionSettings;
    const bag = es && es[NS] && typeof es[NS] === 'object' ? es[NS] : {};
    const ai = bag.ai && typeof bag.ai === 'object' ? bag.ai : {};
    return {
        channel: CHANNELS.includes(ai.channel) ? ai.channel : 'main',
        profileId: typeof ai.profileId === 'string' ? ai.profileId : '',
    };
}

function errOf(code, message, extra) {
    const e = new Error(message);
    e.code = code;
    if (extra) Object.assign(e, extra);
    return e;
}

/** 从宿主各种报错里取出一句可读的话 */
export function errText(e) {
    if (!e) return '';
    if (typeof e === 'string') return e;
    const parts = [];
    let cur = e;
    for (let i = 0; i < 4 && cur; i++) {
        const m = cur.message || (cur.error && (cur.error.message || cur.error)) || '';
        if (m && typeof m === 'string' && parts.indexOf(m) < 0) parts.push(m);
        cur = cur.cause;
    }
    return parts.join(' · ') || String(e);
}

/** 模拟 fetch Response（引擎只用 ok / status / headers.get / text / json） */
export function makeResponse(status, bodyText, contentType) {
    const text = typeof bodyText === 'string' ? bodyText : JSON.stringify(bodyText == null ? {} : bodyText);
    const headers = new Map([['content-type', contentType || 'application/json']]);
    return {
        ok: status >= 200 && status < 300,
        status,
        statusText: status >= 200 && status < 300 ? 'OK' : 'Error',
        headers: { get: (k) => headers.get(String(k).toLowerCase()) || null },
        async text() { return text; },
        async json() { return JSON.parse(text); },
        __viaHost: true,
    };
}

function headerValue(headers, name) {
    if (!headers) return '';
    const want = String(name).toLowerCase();
    if (typeof headers.get === 'function') return headers.get(name) || '';
    for (const k of Object.keys(headers)) if (k.toLowerCase() === want) return String(headers[k]);
    return '';
}

/** 把用户的额外请求头（除 Content-Type / Accept 外）写成后端认的 YAML 风格 "Key: \"value\"" 多行文本 */
function headerLines(headers) {
    const out = [];
    const src = headers && typeof headers === 'object' ? headers : {};
    for (const k of Object.keys(src)) {
        if (/^(content-type|accept|content-length)$/i.test(k)) continue;
        out.push(k + ': ' + JSON.stringify(String(src[k])));
    }
    return out.join('\n');
}

/** 自定义 API 的 base URL：去掉 /chat/completions 或 /models 后缀 */
function baseOf(url, suffix) {
    const u = String(url || '');
    const i = u.toLowerCase().lastIndexOf(suffix);
    return i > 0 ? u.slice(0, i) : u;
}

/**
 * @param {{ getContext: () => any, fetchImpl?: typeof fetch, log?: (...a:any[]) => void }} deps
 */
export function createAiApi({ getContext, fetchImpl, log }) {
    const doFetch = (...a) => (fetchImpl || globalThis.fetch)(...a);
    const warn = (...a) => { try { (log || console.warn)(...a); } catch (e) { /* ignore */ } };
    const hostHeaders = () => {
        const c = getContext();
        try { if (c && typeof c.getRequestHeaders === 'function') return c.getRequestHeaders(); } catch (e) { /* ignore */ }
        return { 'Content-Type': 'application/json' };
    };

    // ---------------- 酒馆模型 ----------------
    function maxTokensOf(opts) {
        const s = opts && opts.settings;
        const n = Number(s && (s.maxCompletionTokens || s.maxTokens || s.max_tokens));
        return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
    }

    async function viaMain(prompt, opts) {
        const c = getContext();
        if (!c || typeof c.generateRaw !== 'function') throw errOf('unsupported', '当前酒馆版本没有 generateRaw');
        const responseLength = maxTokensOf(opts);
        const out = await c.generateRaw({ prompt: String(prompt), responseLength: responseLength || undefined, trimNames: false });
        return typeof out === 'string' ? out : (out == null ? '' : String(out));
    }

    async function viaProfile(prompt, opts, profileId) {
        const c = getContext();
        const svc = c && c.ConnectionManagerRequestService;
        if (!svc || typeof svc.sendRequest !== 'function') throw errOf('unsupported', '连接管理器不可用（请在扩展里启用 Connection Manager）');
        if (!profileId) throw errOf('config', '还没选择连接配置', { missing: ['连接配置'] });
        let profiles = [];
        try { profiles = typeof svc.getSupportedProfiles === 'function' ? svc.getSupportedProfiles() : []; } catch (e) { throw errOf('unsupported', '连接管理器不可用：' + errText(e)); }
        if (Array.isArray(profiles) && profiles.length && !profiles.some((p) => p && p.id === profileId)) {
            throw errOf('config', '选择的连接配置不存在或不支持（只支持 Chat Completion 类型），请在设置里重新选择', { missing: ['连接配置'] });
        }
        const maxTokens = maxTokensOf(opts) || 1024;
        // 连接配置的请求不带 type:'quiet'，TT 后端失败时会把错误包装成一条正常回复 "[API Error]\n原因"。
        // 不能把它当模型输出交给引擎解析，这里还原成错误。
        const res = await svc.sendRequest(profileId, String(prompt), maxTokens, { stream: false, extractData: true, includePreset: true }, { type: 'quiet' });
        let content = '';
        if (res && typeof res === 'object') content = typeof res.content === 'string' ? res.content : (res.content == null ? '' : JSON.stringify(res.content));
        else if (typeof res === 'string') content = res;
        const m = /^\s*\[(?:API Error|API 错误|API错误)[^\]]*\]\s*([\s\S]*)$/i.exec(content);
        if (m) throw errOf('http', m[1].trim() || 'API Error', { status: 0, detail: '连接配置：' + (m[1].trim() || 'API Error') });
        return content;
    }

    async function generate(prompt, opts) {
        const s = aiSettings(getContext);
        try {
            if (s.channel === 'profile') return await viaProfile(prompt, opts, s.profileId);
            return await viaMain(prompt, opts);
        } catch (e) {
            // 引擎按 code / status / detail 分类错误（classifyAiError）：把宿主的多层 cause 摊平成一句话放进 detail
            if (e && (e.code === 'config' || e.code === 'unsupported')) { e.detail = e.detail || e.message; throw e; }
            const text = errText(e) || 'generate failed';
            const st = Number(e && (e.status || (e.cause && e.cause.status))) || 0;
            let code = 'http';
            if (/timeout|timed out|超时/i.test(text)) code = 'timeout';
            else if (/Failed to fetch|NetworkError|network|ECONN|ENOTFOUND|连接/i.test(text)) code = 'network';
            throw errOf(code, text, { status: st, detail: (s.channel === 'profile' ? '连接配置：' : '酒馆当前 API：') + text, cause: e });
        }
    }

    // ---------------- 自定义 API 送达 ----------------
    async function relayChat(url, init) {
        const body = (() => { try { return JSON.parse(String(init && init.body || '{}')); } catch (e) { return null; } })();
        if (!body || typeof body !== 'object') return makeResponse(400, { error: { message: '请求体不是 JSON' } });
        const auth = headerValue(init && init.headers, 'authorization');
        const extraHeaders = Object.assign({}, init && init.headers);
        const payload = { chat_completion_source: 'custom', custom_url: baseOf(url, '/chat/completions'), type: 'quiet' };
        const extra = {};
        for (const k of Object.keys(body)) {
            if (TOP_LEVEL.includes(k)) payload[k] = body[k];
            else extra[k] = body[k];
        }
        payload.stream = false;
        if (Object.keys(extra).length) payload.custom_include_body = JSON.stringify(extra);
        if (auth) extraHeaders.Authorization = auth;
        const hl = headerLines(extraHeaders);
        if (hl) payload.custom_include_headers = hl;
        const res = await doFetch('/api/backends/chat-completions/generate', {
            method: 'POST',
            headers: hostHeaders(),
            cache: 'no-cache',
            body: JSON.stringify(payload),
            signal: init && init.signal,
        });
        const text = await res.text();
        let j = null;
        try { j = JSON.parse(text); } catch (e) { /* not json */ }
        if (!res.ok || (j && j.error)) {
            const msg = j && j.error ? (j.error.message || j.message || (typeof j.error === 'string' ? j.error : '')) : (j && j.message) || text;
            const st = res.ok ? 502 : res.status || 502;
            return makeResponse(st, { error: { message: '（经酒馆后端转发）' + String(msg || ('HTTP ' + st)) } });
        }
        return makeResponse(200, text || '{}');
    }

    async function relayModels(url, init) {
        const auth = headerValue(init && init.headers, 'authorization');
        const payload = { chat_completion_source: 'custom', custom_url: baseOf(url, '/models') };
        if (auth) payload.custom_include_headers = 'Authorization: ' + JSON.stringify(auth);
        const res = await doFetch('/api/backends/chat-completions/status', {
            method: 'POST',
            headers: hostHeaders(),
            cache: 'no-cache',
            body: JSON.stringify(payload),
            signal: init && init.signal,
        });
        const text = await res.text();
        let j = null;
        try { j = JSON.parse(text); } catch (e) { /* not json */ }
        if (!res.ok || !j || j.error) {
            const msg = j ? (j.message || (j.error && j.error.message) || '') : text;
            return makeResponse(res.ok ? 502 : res.status || 502, { error: { message: '（经酒馆后端转发）' + String(msg || '无法列出模型') } });
        }
        // 后端返回 { data: [...] } 或 { data: { data: [...] } } 或直接数组
        const list = Array.isArray(j) ? j : (Array.isArray(j.data) ? j.data : (j.data && Array.isArray(j.data.data) ? j.data.data : []));
        return makeResponse(200, { object: 'list', data: list });
    }

    /** 判断是不是被跨域拦下的网络错误（而不是超时 / 用户中断） */
    function isCorsLike(e) {
        if (!e) return false;
        if (e.name === 'AbortError') return false;
        return e.name === 'TypeError' || /Failed to fetch|NetworkError|Load failed|CORS|network/i.test(String(e.message || e));
    }

    let relayHosts = new Set(); // 已确认要走转发的地址（同一地址不再重复试直连）
    const hostOf = (u) => { try { return new URL(String(u)).origin; } catch (e) { return ''; } };

    async function request(url, init) {
        const u = String(url || '');
        const method = String((init && init.method) || 'GET').toUpperCase();
        const isChat = method === 'POST' && /\/chat\/completions\/?$/i.test(u);
        const isModels = method === 'GET' && /\/models\/?$/i.test(u);
        const canRelay = isChat || isModels;
        const host = hostOf(u);
        if (canRelay && host && relayHosts.has(host)) return isChat ? relayChat(u, init) : relayModels(u, init);
        try {
            return await doFetch(u, init);
        } catch (e) {
            if (!canRelay || !isCorsLike(e) || (init && init.signal && init.signal.aborted)) throw e;
            warn('[char-physiology] 直连被拦截，改走酒馆后端转发：', host, String(e && e.message || e));
            const r = isChat ? await relayChat(u, init) : await relayModels(u, init);
            if (r && r.ok && host) relayHosts.add(host);
            return r;
        }
    }

    return {
        generate,
        http: { request },
        /** 面板用：列出可用的连接配置 */
        listProfiles() {
            const c = getContext();
            const svc = c && c.ConnectionManagerRequestService;
            try { return (svc && typeof svc.getSupportedProfiles === 'function' ? svc.getSupportedProfiles() : []).map((p) => ({ id: p.id, name: p.name || p.id })); } catch (e) { return []; }
        },
        settings: () => aiSettings(getContext),
        __resetRelay() { relayHosts = new Set(); },
    };
}
