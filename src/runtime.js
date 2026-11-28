/*
 * 运行时：把 SillyTavern / TauriTavern 的事件接到引擎上（自动分析、失效处理、注入）。
 * 原 Tavo 版的对应代码存档在 src/legacy/tavo-entry-glue.js.txt，这里逐段对照重写。
 *
 * 【事件映射】（TT 事件参数多为“楼层下标”，适配层消息 ID 见 tt-data.js）
 *   MESSAGE_RECEIVED(下标, 类型)        → message:added
 *   MESSAGE_SWIPED(下标)                → 旧回复 ID：message:deleted；新回复：message:updated
 *   MESSAGE_EDITED / MESSAGE_UPDATED     → message:updated（同一楼 700ms 防抖）
 *   MESSAGE_DELETED / MESSAGE_SWIPE_DELETED → 和删前快照对比，消失的 ID → message:deleted
 *   CHAT_CHANGED                         → chat:opened（旧聊天的后台循环作废）
 *   GENERATION_ENDED                     → 兜底：最后一条 AI 回复若还没分析过，按新回复处理
 *                                          （TT 生成新的 swipe 时不发 MESSAGE_RECEIVED）
 *
 * 【注入】TT 没有“发送前改写用户消息”的事件，改用生成拦截器 + setExtensionPrompt：
 *   拦截器在 Generate 组装提示词前运行，这里算出档案块写进扩展提示词，
 *   不改动聊天记录。原“世界书模式”需要新建世界书，移植版不支持，引擎自动降级为前缀模式。
 */

export const PROMPT_KEY = 'char_physiology';
/** extension_prompt_types / extension_prompt_roles（TT scripts/extension-prompts.js） */
const IN_PROMPT = 0;
const IN_CHAT = 1;
const ROLE_SYSTEM = 0;

const AUTO_RETRY_MAX = 2;
const AUTO_RETRY_GAP = 90000;
const UPDATE_DEBOUNCE = 700;
const BACKOFF = [250, 500, 1000, 1500, 2500, 3000, 3500];
/** 不注入的生成类型：后台生成（含本插件自己的分析请求）和“替你发言” */
const NO_INJECT_TYPES = new Set(['quiet', 'impersonate']);
/** 自动分析认为“已处理完”的结果（照搬原插件） */
const DONE_STATUSES = ['ok', 'duplicate', 'ignored', 'notracked', 'superseded', 'disabled', 'hidden', 'refusal'];

const hash32 = (t) => { let x = 2166136261; for (let i = 0; i < t.length; i++) { x ^= t.charCodeAt(i); x = Math.imul(x, 16777619); } return (x >>> 0).toString(36) + ':' + t.length; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * @param {{ engine: any, tavo: any, getContext: () => any, timers?: { setTimeout: Function, clearTimeout: Function }, log?: Function }} deps
 */
export async function startRuntime({ engine: E, tavo, getContext, timers, log }) {
    const T = timers || { setTimeout: (f, ms) => setTimeout(f, ms), clearTimeout: (h) => clearTimeout(h) };
    const warn = (...a) => { try { (log || console.warn)('[char-physiology]', ...a); } catch (e) { /* ignore */ } };
    const data = tavo.__data;
    /**
     * 派发给 tavo.plugin.on 的监听者。不等它们处理完：TT 会 await 事件处理函数，
     * 而分析一轮要调用 AI、更新有 700ms 防抖，等下去会卡住宿主的编辑 / 切换回复 / 删除操作。
     * 需要等时（测试）用 settled() 拿到这批处理的 Promise。
     */
    let inflight = [];
    const emit = (name, ev) => {
        const ps = (tavo.__emit(name, ev) || []).map((p) => Promise.resolve(p).catch((e) => warn(name + ' 监听出错', e)));
        inflight.push(...ps);
        return undefined;
    };
    const settled = async () => { while (inflight.length) { const ps = inflight; inflight = []; await Promise.allSettled(ps); } };
    const isUserMsg = (x) => !x || x.isUser === true || x.role === 'user';
    const ordOf = (m) => (m && m.index != null && Number.isFinite(Number(m.index)) ? Number(m.index) : NaN);
    let stopped = false;
    let openSeq = 0;
    const pending = new Set(); // 定时器句柄（stop 时清掉）
    const later = (fn, ms) => { const h = T.setTimeout(() => { pending.delete(h); if (!stopped) fn(); }, ms); pending.add(h); return h; };

    try { E.__setRole('entry'); } catch (e) { /* ignore */ }

    // ---------------- 聊天切换期间的重试 ----------------
    async function afterChatReady(fn, seq) {
        for (let i = 0; ; i++) {
            try { return await fn(); } catch (e) {
                if (!E.isNotReady(e) || i >= BACKOFF.length || (seq != null && seq !== openSeq)) throw e;
                await sleep(BACKOFF[i]);
            }
        }
    }

    // ---------------- 自动分析闸门（照搬原插件 v3.0.5 / v3.0.24） ----------------
    async function lastMsgs() {
        let rec = await E.recentMessages(12).catch(() => null);
        if (!Array.isArray(rec) || !rec.length) rec = await tavo.message.find({}).catch(() => []);
        return Array.isArray(rec) ? rec : [];
    }
    async function ensureBaseline() {
        const st = await E.loadState();
        if (st.meta.autoBase) return st.meta.autoBase;
        const rec = await lastMsgs();
        const last = rec[rec.length - 1];
        const base = { id: last && last.id != null ? String(last.id) : '', ord: last ? (Number.isFinite(ordOf(last)) ? ordOf(last) : -1) : -1, ts: Date.now() };
        await E.mutate((s) => { if (!s.meta.autoBase) s.meta.autoBase = base; return null; });
        return (await E.loadState()).meta.autoBase || base;
    }
    const autoDone = {}; // 消息 ID → 已自动分析过的内容哈希
    let autoRunning = false;
    let autoPending = null;
    let autoChain = Promise.resolve();

    async function waitIdle(ms) {
        const until = Date.now() + ms;
        for (;;) {
            const st = await E.loadState();
            if (!E.syncBusy(st) || Date.now() > until) return;
            await sleep(200);
        }
    }

    async function onMessageAdded(event, again) {
        const m = event && event.message;
        if (!m || m.id == null || stopped) return;
        if (autoRunning) { autoPending = { message: m, again }; return; } // 合并：只留最新一条排队
        autoRunning = true;
        try { await autoOnce(m, again); } finally {
            autoRunning = false;
            const nx = autoPending; autoPending = null;
            if (nx) await onMessageAdded({ message: nx.message }, nx.again);
        }
    }

    async function autoOnce(m0, again) {
        try {
            await E.loadAiOpts();
            const cfg = E.config();
            if (!cfg.enabled) return;
            // 暂停追踪：不分析、不调用 AI（省 token）；只按消息里的日期线索本地推进剧情日期
            if (typeof E.isPausedState === 'function') {
                const st0 = await E.loadState().catch(() => null);
                if (E.isPausedState(st0)) {
                    if (m0 && m0.hidden !== true && typeof E.pausedTick === 'function') await E.pausedTick(m0.id).catch(() => 0);
                    return; // 暂停：不分析、不调 AI
                }
            }
            if (!cfg.autoSync) return;
            if (isUserMsg(m0) || m0.hidden === true) return;
            const base = await ensureBaseline();
            const rec = await lastMsgs();
            const lastAi = rec.filter((x) => x && !isUserMsg(x) && x.hidden !== true).pop();
            if (!lastAi || String(lastAi.id) !== String(m0.id)) return; // 只分析最新一条 AI 回复
            if (base && base.id && String(lastAi.id) === base.id) return; // 插件看到这个聊天之前就有的楼
            const o = ordOf(lastAi);
            if (base && base.ord >= 0 && Number.isFinite(o) && o <= base.ord) return;
            const m = (await E.getMessage(m0.id).catch(() => null)) || lastAi;
            const key = String(m.id);
            const h = hash32(String(E.msgText(m) || ''));
            const fk = key + ':' + h;
            if (autoDone[key] === h) return;
            const st0 = await E.loadState();
            const fail = (st0.meta.autoFail || {})[fk];
            if (fail && (fail.n > AUTO_RETRY_MAX || Date.now() - fail.ts < AUTO_RETRY_GAP)) return;
            // 补漏：基线之后、从没分析过的最多 2 条更早的 AI 回复，先旧后新
            try {
                const proc = (st0.meta && st0.meta.processed) || [];
                const ign = (st0.meta && st0.meta.ignored) || [];
                const ais = rec.filter((x) => x && !isUserMsg(x) && x.hidden !== true && String(x.id) !== key);
                const miss = ais.filter((x) => {
                    const ox = ordOf(x); const k = String(x.id);
                    if (base && base.id && k === base.id) return false;
                    if (base && base.ord >= 0 && !(Number.isFinite(ox) && ox > base.ord)) return false;
                    return proc.indexOf(k) < 0 && ign.indexOf(k) < 0 && autoDone[k] == null;
                }).slice(-2);
                for (const x of miss) {
                    const rx = await E.runSync(x.id, {}).catch(() => null);
                    if (rx && rx.status === 'busy') break;
                    autoDone[String(x.id)] = hash32(String(E.msgText(x) || ''));
                }
            } catch (e) { /* 补漏尽力而为 */ }
            let r = await E.runSync(m.id, {});
            if (r && r.status === 'busy') { await waitIdle(30000); r = await E.runSync(m.id, {}); }
            if (r && r.status === 'busy') { later(() => { onMessageAdded({ message: m0 }, true).catch(() => 0); }, 15000); return; }
            if (r && DONE_STATUSES.indexOf(r.status) >= 0) {
                if (r.status !== 'notracked') autoDone[key] = h;
                await E.mutate((s) => { if (s.meta.autoFail && s.meta.autoFail[fk]) delete s.meta.autoFail[fk]; return null; }).catch(() => 0);
            } else {
                await E.mutate((s) => { s.meta.autoFail = s.meta.autoFail || {}; const f = s.meta.autoFail[fk] || { n: 0, ts: 0 }; s.meta.autoFail[fk] = { n: f.n + 1, ts: Date.now() }; return null; }).catch(() => 0);
                const n1 = (((await E.loadState().catch(() => ({ meta: {} }))).meta.autoFail || {})[fk] || {}).n || 0;
                if (n1 <= AUTO_RETRY_MAX) later(() => { onMessageAdded({ message: m0 }, true).catch(() => 0); }, AUTO_RETRY_GAP + 1000);
            }
            if (r && r.status === 'ok') {
                E.autoCorruption().catch(() => 0).then(async () => {
                    // 原插件 v2.7：每 6 轮检查一次聊天里有没有新出现的有名角色（只给建议，由用户确认）
                    try {
                        const st = await E.loadState();
                        if (E.config().autoDetect !== false && st.scene && st.scene.round > 0 && st.scene.round % 6 === 0) await E.detectNewCharacters();
                    } catch (e) { /* ignore */ }
                });
            }
        } catch (e) {
            warn('自动分析失败', e);
        }
    }

    // ---------------- 消息变更（编辑 / 切换回复 / 删除） ----------------
    const updWait = {};
    function onMsgChanged(kind, id) {
        if (id == null) return Promise.resolve();
        if (kind !== 'updated') return onMsgChanged0(kind, id);
        const k = String(id);
        const w = updWait[k] || (updWait[k] = { timer: null, res: [] });
        if (w.timer) T.clearTimeout(w.timer);
        return new Promise((resolve) => {
            w.res.push(resolve);
            w.timer = T.setTimeout(() => {
                delete updWait[k];
                onMsgChanged0(kind, id).then(() => w.res.forEach((f) => f()));
            }, UPDATE_DEBOUNCE);
        });
    }
    async function onMsgChanged0(kind, id) {
        try {
            await E.markStale(id);
            await E.onMessageChanged(id, kind);
            if (kind !== 'updated') return;
            await E.loadAiOpts();
            const cfg = E.config();
            if (!cfg.enabled || !cfg.autoSync) return;
            const m = await E.getMessage(id).catch(() => null);
            if (!m || isUserMsg(m) || m.hidden === true) return;
            await onMessageAdded({ message: m }, true);
        } catch (e) { /* ignore */ }
    }

    // ---------------- 聊天打开 ----------------
    async function onOpened() {
        const seq = ++openSeq;
        lastIds = snapshotIds();
        try { const c0 = await tavo.chat.current(); E.noteChatOpened(c0 && c0.id); } catch (e) { E.noteChatOpened(null); }
        later(() => { E.sanitizeUpdateState('打开聊天').catch(() => 0); }, 1500);
        try {
            await afterChatReady(async () => {
                if (!E.config().enabled) return;
                try { await ensureBaseline(); } catch (e) { if (E.isNotReady(e)) throw e; }
            }, seq);
        } catch (e) { /* 宿主还没就绪：下一个事件再试 */ }
    }

    // ---------------- TT 事件 → 原插件事件 ----------------
    let lastIds = []; // 最近一次看到的消息 ID 列表（用于找出被删除 / 被换掉的 ID）
    function snapshotIds() {
        try {
            const c = getContext();
            if (!c || !Array.isArray(c.chat)) return [];
            return c.chat.map((_, i) => data.__msgId(i)).filter(Boolean);
        } catch (e) { return []; }
    }
    async function messageAt(index) {
        const i = Number(index);
        if (!Number.isInteger(i) || i < 0) return null;
        try { return await tavo.message.get({ index: i }); } catch (e) { return null; }
    }
    /** 对比快照：哪些 ID 不见了 */
    function vanished() {
        const now = snapshotIds();
        const have = new Set(now);
        const gone = lastIds.filter((id) => !have.has(id));
        lastIds = now;
        return gone;
    }

    const handlers = {
        async received(index, type) {
            if (type === 'impersonate') return;
            const m = await messageAt(index);
            lastIds = snapshotIds();
            if (m) emit('message:added', { message: m, type });
        },
        async swiped(index) {
            // 换到另一个 swipe：旧回复的 ID 消失（等同删除），当前回复按“更新”处理
            const gone = vanished();
            for (const id of gone) emit('message:deleted', { messageId: id });
            const m = await messageAt(index);
            if (m && m.text && m.text.trim()) emit('message:updated', { messageId: m.id, message: m });
        },
        async edited(index) {
            const m = await messageAt(index);
            lastIds = snapshotIds();
            if (m) emit('message:updated', { messageId: m.id, message: m });
        },
        async deleted() {
            const gone = vanished();
            for (const id of gone) emit('message:deleted', { messageId: id });
        },
        async chatChanged() {
            emit('chat:opened', {});
        },
        async generationEnded() {
            // 兜底：生成新 swipe 时 TT 不发 MESSAGE_RECEIVED，这里补上
            const c = getContext();
            const n = c && Array.isArray(c.chat) ? c.chat.length : 0;
            if (!n) return;
            const gone = vanished();
            for (const id of gone) emit('message:deleted', { messageId: id });
            const m = await messageAt(n - 1);
            if (m && !isUserMsg(m) && m.hidden !== true && m.text && m.text.trim()) {
                const h = hash32(String(E.msgText(m) || ''));
                if (autoDone[String(m.id)] !== h) emit('message:added', { message: m, type: 'generation_ended' });
            }
        },
    };

    // 原插件事件 → 引擎（和 Tavo 版的 tavo.plugin.on 接线一致）
    tavo.plugin.on('message:added', (ev) => { autoChain = autoChain.then(() => onMessageAdded(ev)).catch(() => 0); return autoChain; });
    tavo.plugin.on('message:updated', (ev) => onMsgChanged('updated', ev && (ev.messageId != null ? ev.messageId : ev.message && ev.message.id)));
    tavo.plugin.on('message:deleted', (ev) => onMsgChanged('deleted', ev && ev.messageId));
    tavo.plugin.on('chat:opened', onOpened);

    // 宿主事件
    const ctx0 = getContext();
    const es = ctx0 && ctx0.eventSource;
    const et = (ctx0 && (ctx0.eventTypes || ctx0.event_types)) || {};
    const bound = [];
    const bind = (name, fn) => {
        const ev = et[name];
        if (!es || !ev) return;
        const wrapped = async (...a) => { if (stopped) return; try { await fn(...a); } catch (e) { warn(name + ' 处理失败', e); } };
        es.on(ev, wrapped);
        bound.push([ev, wrapped]);
    };
    bind('MESSAGE_RECEIVED', handlers.received);
    bind('MESSAGE_SWIPED', handlers.swiped);
    bind('MESSAGE_EDITED', handlers.edited);
    bind('MESSAGE_UPDATED', handlers.edited);
    bind('MESSAGE_DELETED', handlers.deleted);
    bind('MESSAGE_SWIPE_DELETED', handlers.deleted);
    bind('CHAT_CHANGED', handlers.chatChanged);
    bind('GENERATION_ENDED', handlers.generationEnded);

    // ---------------- 注入 ----------------
    function clearPrompt() {
        try {
            const c = getContext();
            if (c && typeof c.setExtensionPrompt === 'function') c.setExtensionPrompt(PROMPT_KEY, '', IN_CHAT, 0, false, ROLE_SYSTEM);
        } catch (e) { /* ignore */ }
    }
    /** 最新一条用户消息（引擎据此判断这一轮是不是亲密场景） */
    function lastUserText(chat) {
        if (!Array.isArray(chat)) return '';
        for (let i = chat.length - 1; i >= 0; i--) {
            const m = chat[i];
            if (m && m.is_user && !m.is_system) return String(m.mes || '');
        }
        return '';
    }
    let lastBlock = '';
    async function interceptor(chat, contextSize, abort, type) {
        if (stopped) return;
        if (NO_INJECT_TYPES.has(String(type || ''))) return; // 后台生成：不动扩展提示词（主聊天下一次生成会重算）
        let timer = null;
        try {
            const cfg = E.config();
            if (!cfg.enabled) { clearPrompt(); lastBlock = ''; return; }
            let inj;
            try { inj = await Promise.race([E.loadInject(), new Promise((res) => { timer = T.setTimeout(() => res(null), 1500); })]); } finally { if (timer) T.clearTimeout(timer); timer = null; }
            if (!inj || !inj.enabled) { clearPrompt(); lastBlock = ''; return; }
            const source = type === 'regenerate' || type === 'swipe' ? 'regeneration' : 'send';
            // 引擎用“这一轮用户说了什么”判断是否亲密场景；拦截器拿到的是即将发送的聊天副本
            const work = E.prepareInjection({ text: lastUserText(chat), source }, { inj: Object.assign({}, inj, { mode: 'prefix' }) });
            work.catch(() => {});
            const cap = (inj.wait || 0) + 4000;
            const r = await Promise.race([work, new Promise((res) => { timer = T.setTimeout(() => res(null), cap); })]);
            // 前缀模式下 r.text = 档案块 + 用户原文；扩展提示词只要档案块本身
            const block = r && typeof r.block === 'string' ? r.block : '';
            const c = getContext();
            if (!c || typeof c.setExtensionPrompt !== 'function') return;
            // 位置映射：
            //   system（默认）= 系统提示区末尾（IN_PROMPT）——离最后一条消息最远，模型不会把档案当成“接着写的内容”
            //   before        = 聊天内深度 1（你最新一条消息之前）
            //   after         = 聊天内深度 0（紧跟你的消息之后，模型会更看重，但也更容易顺着档案写）
            if (inj.position === 'system') c.setExtensionPrompt(PROMPT_KEY, block, IN_PROMPT, 0, false, ROLE_SYSTEM);
            else c.setExtensionPrompt(PROMPT_KEY, block, IN_CHAT, inj.position === 'after' ? 0 : 1, false, ROLE_SYSTEM);
            lastBlock = block;
        } catch (e) {
            clearPrompt(); lastBlock = '';
        } finally { if (timer) T.clearTimeout(timer); }
    }

    // 启动时插件可能装在已打开的聊天里：先跑一次“打开聊天”
    lastIds = snapshotIds();
    onOpened().catch(() => 0);

    return {
        engine: E,
        interceptor,
        handlers,
        get lastBlock() { return lastBlock; },
        /** 测试用：等已派发的事件和排队的自动分析跑完 */
        idle: async () => { await settled(); await autoChain; await settled(); },
        stop() {
            stopped = true;
            for (const h of pending) T.clearTimeout(h);
            pending.clear();
            for (const [ev, fn] of bound) { try { es.removeListener(ev, fn); } catch (e) { /* ignore */ } }
            clearPrompt();
        },
    };
}
