/*
 * 界面接入：浮动面板（src/panel.js）、扩展菜单（魔杖）入口、消息按钮。
 * 扩展设置抽屉（AI 通道、注入等）见 src/settings.js。
 *
 * 对照原 Tavo 插件：
 *   - htmlFragments(ui/panel.html → /chat/body/end)  → 这里直接调 mountPanel 挂到 <body> 末尾
 *   - contributes.sidebar 四个按钮                    → 魔杖菜单里的同名菜单项
 *   - contributes.lastMessageActions(refresh-last)    → 角色最后一条消息的“从此消息刷新生理档案”按钮
 *   侧栏按钮的处理逻辑照搬原插件后台代码（src/legacy/tavo-entry-glue.js.txt 第 207~251 行）
 */
import { mountPanel } from './panel.js';
import { mountSettings } from './settings.js';

const WAND_ID = 'char_physiology_wand';
const MES_BTN_CLASS = 'charphys_mes_refresh';

/** 原插件 contributes.sidebar 的四个按钮 */
const ACTIONS = [
    { id: 'open-panel', icon: 'fa-heart-pulse', label: 'actions.openPanel' },
    { id: 'open-settings', icon: 'fa-sliders', label: 'actions.openSettings' },
    { id: 'ai-scan', icon: 'fa-wand-magic-sparkles', label: 'actions.aiScan' },
    { id: 'rescan', icon: 'fa-rotate', label: 'actions.rescan' },
];

/** runSync 结果 → 提示文案（原插件 refresh-last） */
const REFRESH_TOAST = {
    busy: 'ui3.sync.toast.busy', ok: 'runtime.refreshed', duplicate: 'runtime.duplicate', nomessage: 'runtime.nomessage',
    hidden: 'runtime.hidden', ignored: 'runtime.ignored', disabled: 'runtime.disabled',
};

/**
 * @param {{ engine: any, tavo: any, getContext: () => any, i18n: any, baseUrl?: string, doc?: Document }} deps
 */
export async function mountUi({ engine: E, tavo, getContext, i18n, baseUrl, doc }) {
    const D = doc || globalThis.document;
    const t = (k, p) => (i18n && typeof i18n.t === 'function' ? i18n.t(k, p) : k);
    const toast = async (key, params) => { try { await tavo.utils.toast(E.t(key, params)); } catch (e) { /* ignore */ } };
    const disposers = [];
    let disposed = false;

    // ---------------- 面板 ----------------
    let panelDispose = null;
    function mount() {
        if (panelDispose || disposed || !D || !D.body) return;
        panelDispose = mountPanel(E, tavo);
    }
    mount();
    // 面板挂载后自己设成 'panel' 角色（原插件面板和后台是两个运行环境）；
    // 移植版同一个页面里只有一个引擎实例，后台（运行时）的角色必须保持 'entry'
    try { E.__setRole('entry'); } catch (e) { /* ignore */ }

    // ---------------- 原插件侧栏按钮的处理（照搬） ----------------
    async function ensureBaseline() {
        const st = await E.loadState();
        if (st.meta.autoBase) return;
        const rec = await E.recentMessages(12).catch(() => []);
        const last = Array.isArray(rec) ? rec[rec.length - 1] : null;
        const base = { id: last && last.id != null ? String(last.id) : '', ord: last && Number.isFinite(Number(last.index)) ? Number(last.index) : -1, ts: Date.now() };
        await E.mutate((s) => { if (!s.meta.autoBase) s.meta.autoBase = base; return null; });
    }
    const handlers = {
        async 'open-panel'() {
            try {
                await E.mutate((st) => { st.panel.open = true; st.panel.collapsed = false; st.panel.view = 'main'; st.panel.openReq = Date.now(); });
                // 插件可能是在已打开的聊天里启用的：先记下基线，否则下一条 AI 回复会被当成基线而跳过自动分析
                try { await ensureBaseline(); } catch (e) { /* 下次事件再试 */ }
                const st0 = await E.loadState();
                if (!st0.meta.rosterConfirmed) return; // 首次打开：面板直接进入“识别角色”，再让用户确认名单
                const r = await E.scanCharacters({ batch: true });
                await toast('runtime.opened', { count: Object.keys(r.state.characters).length });
            } catch (e) { await toast('runtime.error'); }
        },
        async 'open-settings'() {
            try {
                await E.mutate((st) => { st.panel.open = true; st.panel.collapsed = false; st.panel.view = 'settings'; });
                const st = await E.loadState();
                if (st.meta.rosterConfirmed && !Object.keys(st.characters).length) await E.scanCharacters({ batch: true });
                await toast('runtime.settingsOpened');
            } catch (e) { await toast('runtime.error'); }
        },
        async 'ai-scan'() {
            try {
                await E.mutate((st) => { st.panel.open = true; st.panel.collapsed = false; st.panel.view = 'scan'; st.panel.scanReq = Date.now(); });
                await toast('runtime.aiScanOpened');
            } catch (e) { await toast('runtime.error'); }
        },
        async rescan() {
            try {
                const r = await E.scanCharacters({ batch: true });
                await toast('runtime.rescanned', { count: Object.keys(r.state.characters).length, added: r.added });
            } catch (e) { await toast('runtime.error'); }
        },
        async 'refresh-last'(messageId) {
            try {
                if (messageId == null) { await toast('runtime.nomessage'); return; }
                const r = await E.runSync(messageId, { force: true, manual: true });
                await toast(REFRESH_TOAST[r && r.status] || 'runtime.error');
            } catch (e) { await toast('runtime.error'); }
        },
    };
    /** 面板靠轮询存档发现 st.panel 的变化；外部入口改完后让它立刻刷新 */
    async function run(id, arg) {
        const fn = handlers[id];
        if (!fn) return;
        await fn(arg);
        poke();
    }
    function poke() {
        try { if (panelDispose && typeof panelDispose.refresh === 'function') panelDispose.refresh(); } catch (e) { /* ignore */ }
    }

    // ---------------- 魔杖菜单 ----------------
    function buildWand() {
        if (!D) return null;
        const host = D.getElementById('extensionsMenu');
        if (!host) return null;
        let box = D.getElementById(WAND_ID);
        if (box) return box;
        box = D.createElement('div');
        box.id = WAND_ID;
        box.className = 'extension_container';
        for (const a of ACTIONS) {
            const item = D.createElement('div');
            item.className = 'list-group-item flex-container flexGap5 interactable';
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'listitem');
            item.dataset.charphysAction = a.id;
            const icon = D.createElement('div');
            icon.className = 'fa-solid ' + a.icon + ' extensionsMenuExtensionButton';
            const text = D.createElement('span');
            text.textContent = t(a.label);
            item.appendChild(icon);
            item.appendChild(text);
            box.appendChild(item);
        }
        const onClick = (ev) => {
            const item = ev.target && ev.target.closest ? ev.target.closest('[data-charphys-action]') : null;
            if (!item) return;
            run(item.dataset.charphysAction);
        };
        const onKey = (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); onClick(ev); } };
        box.addEventListener('click', onClick);
        box.addEventListener('keydown', onKey);
        host.appendChild(box);
        disposers.push(() => { box.removeEventListener('click', onClick); box.removeEventListener('keydown', onKey); box.remove(); });
        return box;
    }
    // 魔杖菜单由酒馆在扩展加载前后插入页面：没找到就等一会儿再试
    let wandTries = 0;
    const tryWand = () => {
        if (disposed || buildWand() || ++wandTries > 40) return;
        const h = setTimeout(tryWand, 500);
        disposers.push(() => clearTimeout(h));
    };
    tryWand();

    // ---------------- 消息按钮：从此消息刷新生理档案 ----------------
    // 原插件只在角色的最后一条消息上显示（lastMessageActions, role: character）。
    // 酒馆每次渲染消息都会克隆 #message_template，所以把按钮加进模板，样式控制只在最后一条 AI 消息上显示。
    function addTemplateButton() {
        if (!D) return false;
        const tpl = D.querySelector('#message_template .extraMesButtons');
        if (!tpl) return false;
        if (!tpl.querySelector('.' + MES_BTN_CLASS)) tpl.prepend(makeMesButton());
        // 模板加载前已经渲染出来的消息也补上
        D.querySelectorAll('#chat .mes .extraMesButtons').forEach((el) => {
            if (!el.querySelector('.' + MES_BTN_CLASS)) el.prepend(makeMesButton());
        });
        return true;
    }
    function makeMesButton() {
        const b = D.createElement('div');
        b.className = 'mes_button ' + MES_BTN_CLASS + ' fa-solid fa-heart-pulse interactable';
        b.title = t('actions.refreshLast');
        b.setAttribute('tabindex', '0');
        b.setAttribute('data-i18n', '[title]' + t('actions.refreshLast'));
        return b;
    }
    const onMesClick = (ev) => {
        const btn = ev.target && ev.target.closest ? ev.target.closest('.' + MES_BTN_CLASS) : null;
        if (!btn) return;
        ev.preventDefault();
        ev.stopPropagation();
        const mes = btn.closest('.mes');
        const idx = mes ? Number(mes.getAttribute('mesid')) : NaN;
        const id = Number.isInteger(idx) && idx >= 0 ? messageIdAt(idx) : null;
        run('refresh-last', id);
    };
    function messageIdAt(index) {
        try { return tavo.__data.__msgId(index) || null; } catch (e) { return null; }
    }
    if (D) {
        D.addEventListener('click', onMesClick, true);
        disposers.push(() => D.removeEventListener('click', onMesClick, true));
        let mesTries = 0;
        const tryMes = () => {
            if (disposed || addTemplateButton() || ++mesTries > 40) return;
            const h = setTimeout(tryMes, 500);
            disposers.push(() => clearTimeout(h));
        };
        tryMes();
        disposers.push(() => { D.querySelectorAll('.' + MES_BTN_CLASS).forEach((el) => el.remove()); });
    }

    // ---------------- 扩展设置区 ----------------
    const settings = mountSettings({ engine: E, tavo, getContext, i18n, doc: D, onOpenPanelSettings: () => run('open-settings') });
    disposers.push(() => settings.dispose());

    return {
        run,
        settings,
        openPanel: () => run('open-panel'),
        get mounted() { return !!panelDispose; },
        dispose() {
            disposed = true;
            disposers.splice(0).forEach((f) => { try { f(); } catch (e) { /* ignore */ } });
            if (panelDispose) { try { panelDispose(); } catch (e) { /* ignore */ } panelDispose = null; }
            try { const r = D && D.getElementById('phys-root'); if (r) r.remove(); } catch (e) { /* ignore */ }
        },
        __baseUrl: baseUrl,
    };
}
