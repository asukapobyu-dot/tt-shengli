/*
 * 扩展设置区：酒馆“扩展”页（#extensions_settings2）里的「角色生理档案」抽屉。
 *
 * 对应原 Tavo 插件 manifest 的 contributes.settings，外加移植版特有的项（AI 通道 / 连接配置、年龄规则说明）。
 *
 * 存储——原插件的设置分两层：插件设置页（plugin.config）是底，面板里保存的值（全局变量）优先。
 * 这里改和面板里同一层，避免两边各存一份互相覆盖：
 *   - 启用、默认周期 / 经期 / 可孕窗口、AI 辅助分析 → plugin.config（面板里没有这几项）
 *   - 自动同步                                    → E.saveAiOpts（面板「AI 生成」同一份）
 *   - 注入开关 / 位置 / 详细程度 / 亲密经历        → E.saveInject（面板「注入」同一份）
 *   - AI 通道 / 连接配置                          → extensionSettings.char_physiology.ai（tt-ai.js 读取）
 * 自定义 API 的密钥、注入模板、角色名单等仍在面板里改（这里放一个“打开面板设置”按钮）。
 */
import { NS } from './tt-store.js';

const ROOT_ID = 'char_physiology_settings';

/**
 * @param {{ engine: any, tavo: any, getContext: () => any, i18n: any, onOpenPanelSettings?: () => any, doc?: Document }} deps
 */
export function mountSettings({ engine: E, tavo, getContext, i18n, onOpenPanelSettings, doc }) {
    const D = doc || globalThis.document;
    const t = (k, p) => (i18n && typeof i18n.t === 'function' ? i18n.t(k, p) : k);
    const disposers = [];
    let root = null;
    let disposed = false;

    const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const ctx = () => getContext() || {};
    const save = () => { try { const c = ctx(); if (typeof c.saveSettingsDebounced === 'function') c.saveSettingsDebounced(); } catch (e) { /* ignore */ } };
    function aiBag() {
        const es = ctx().extensionSettings;
        if (!es) return {};
        const bag = es[NS] && typeof es[NS] === 'object' ? es[NS] : (es[NS] = {});
        if (!bag.ai || typeof bag.ai !== 'object') bag.ai = {};
        return bag.ai;
    }
    const profiles = () => { try { return tavo.__ai.listProfiles() || []; } catch (e) { return []; } };

    // ---------------- 结构 ----------------
    const row = (inner) => '<div class="charphys_set_row">' + inner + '</div>';
    const check = (key, label, desc) => row('<label class="checkbox_label" for="charphys_' + key + '"><input type="checkbox" id="charphys_' + key + '" data-charphys-set="' + key + '"><span>' + esc(t(label)) + '</span></label>' + (desc ? '<small class="charphys_set_desc">' + esc(t(desc)) + '</small>' : ''));
    const range = (key, label, desc, min, max, step) => row('<label for="charphys_' + key + '">' + esc(t(label)) + ' <b data-charphys-out="' + key + '"></b></label>' +
        '<input type="range" class="neo-range-slider" id="charphys_' + key + '" data-charphys-set="' + key + '" min="' + min + '" max="' + max + '" step="' + (step || 1) + '">' +
        (desc ? '<small class="charphys_set_desc">' + esc(t(desc)) + '</small>' : ''));
    const select = (key, label, desc, opts) => row('<label for="charphys_' + key + '">' + esc(t(label)) + '</label>' +
        '<select class="text_pole" id="charphys_' + key + '" data-charphys-set="' + key + '">' + opts.map((o) => '<option value="' + esc(o[0]) + '">' + esc(t(o[1])) + '</option>').join('') + '</select>' +
        (desc ? '<small class="charphys_set_desc">' + esc(t(desc)) + '</small>' : ''));
    const head = (key) => '<h4 class="charphys_set_h">' + esc(t(key)) + '</h4>';

    function html() {
        return '<div class="inline-drawer">' +
            '<div class="inline-drawer-toggle inline-drawer-header"><b>' + esc(t('ttSet.title')) + '</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div></div>' +
            '<div class="inline-drawer-content">' +
            head('ttSet.group.basic') +
            check('enabled', 'settings.enabled.label', 'settings.enabled.desc') +
            check('autoSync', 'settings.autoUpdate.label', 'settings.autoUpdate.desc') +
            head('ttSet.group.ai') +
            select('channel', 'ttSet.channel.label', 'ttSet.channel.desc', [['main', 'ttSet.channel.main'], ['profile', 'ttSet.channel.profile']]) +
            '<div class="charphys_set_row" data-charphys-profile-row>' +
            '<label for="charphys_profile">' + esc(t('ttSet.profile.label')) + '</label>' +
            '<div class="flex-container flexnowrap"><select class="text_pole flex1" id="charphys_profile" data-charphys-set="profileId"></select>' +
            '<div class="menu_button menu_button_icon fa-solid fa-rotate" data-charphys-act="profiles" title="' + esc(t('ttSet.profile.refresh')) + '"></div></div>' +
            '<small class="charphys_set_desc charphys_set_warn" data-charphys-profile-msg></small></div>' +
            check('useAiAssist', 'settings.useAiAssist.label', 'settings.useAiAssist.desc') +
            head('ttSet.group.inject') +
            check('injEnabled', 'settings.injectEnabled.label', 'settings.injectEnabled.desc') +
            select('injPosition', 'settings.injectPosition.label', 'settings.injectPosition.desc', [['before', 'settings.injectPosition.before'], ['after', 'settings.injectPosition.after']]) +
            select('injDetail', 'settings.injectDetail.label', 'settings.injectDetail.desc', [['brief', 'settings.injectDetail.brief'], ['standard', 'settings.injectDetail.standard'], ['detailed', 'settings.injectDetail.detailed']]) +
            check('injIntimacy', 'settings.injectIntimacy.label', 'settings.injectIntimacy.desc') +
            '<small class="charphys_set_desc">' + esc(t('ttSet.inject.modeNote')) + '</small>' +
            head('ttSet.group.cycle') +
            range('cycleLength', 'settings.cycleLength.label', 'settings.cycleLength.desc', 21, 40) +
            range('periodLength', 'settings.periodLength.label', 'settings.periodLength.desc', 3, 8) +
            range('fertileWindowDays', 'settings.fertileWindowDays.label', 'settings.fertileWindowDays.desc', 2, 6) +
            '<hr class="sysHR">' +
            '<small class="charphys_set_desc">' + esc(t('ttSet.age')) + '</small>' +
            '<small class="charphys_set_desc">' + esc(t('ttSet.more')) + '</small>' +
            '<div class="flex-container"><div class="menu_button menu_button_icon" data-charphys-act="open-panel-settings"><i class="fa-solid fa-sliders"></i><span>' + esc(t('ttSet.openPanelSettings')) + '</span></div></div>' +
            '<small class="charphys_set_desc charphys_set_credit">' + esc(t('ttSet.credit')) + '</small>' +
            '</div></div>';
    }

    // ---------------- 读 / 写 ----------------
    const $ = (sel) => (root ? root.querySelector(sel) : null);
    const field = (key) => $('[data-charphys-set="' + key + '"]');
    /** <select> 当前值：浏览器里就是 el.value；个别 DOM 实现不跟随 selected 属性，按选项再找一次 */
    function selValue(sel) {
        const v = sel.value;
        if (typeof v === 'string') return v;
        const o = sel.querySelector('option[selected]') || sel.querySelector('option');
        return o ? o.value : '';
    }
    /** 选中 <select> 里值为 v 的选项：先清掉所有 selected 属性，再给目标选项设上（浏览器里同时设 selected 属性值） */
    function pick(sel, v) {
        if (!sel) return;
        const opts = [...sel.querySelectorAll('option')];
        for (const o of opts) o.removeAttribute('selected');
        const target = opts.find((o) => o.value === v);
        if (!target) return;
        target.setAttribute('selected', '');
        try { target.selected = true; } catch (e) { /* 有的 DOM 实现只读 */ }
    }

    async function load() {
        const cfg = tavo.plugin.config.all();
        let ai = {}; let inj = {};
        try { ai = await E.loadAiOpts(); } catch (e) { /* 缺省 */ }
        try { inj = await E.loadInject(); } catch (e) { /* 缺省 */ }
        const bag = aiBag();
        return {
            enabled: cfg.enabled !== false,
            autoSync: ai.autoSync !== false,
            channel: bag.channel === 'profile' ? 'profile' : 'main',
            profileId: typeof bag.profileId === 'string' ? bag.profileId : '',
            useAiAssist: cfg.useAiAssist === true,
            injEnabled: inj.enabled !== false,
            injPosition: inj.position === 'after' ? 'after' : 'before',
            injDetail: ['brief', 'standard', 'detailed'].includes(inj.detail) ? inj.detail : 'standard',
            injIntimacy: inj.intimacy !== false,
            cycleLength: Number(cfg.cycleLength) || 28,
            periodLength: Number(cfg.periodLength) || 5,
            fertileWindowDays: Number(cfg.fertileWindowDays) || 5,
        };
    }

    function fillProfiles(v) {
        const sel = field('profileId');
        const msg = $('[data-charphys-profile-msg]');
        const rowEl = $('[data-charphys-profile-row]');
        if (!sel) return;
        const list = profiles();
        const cur = v.profileId;
        const known = list.some((p) => p.id === cur);
        let opts = '<option value="">' + esc(t('ttSet.profile.none')) + '</option>';
        for (const p of list) opts += '<option value="' + esc(p.id) + '">' + esc(p.name) + '</option>';
        if (cur && !known) opts += '<option value="' + esc(cur) + '">' + esc(cur) + '</option>';
        sel.innerHTML = opts;
        pick(sel, cur);
        if (rowEl) rowEl.style.display = v.channel === 'profile' ? '' : 'none';
        if (msg) {
            let text = '';
            if (v.channel === 'profile') {
                if (!list.length) text = t('ttSet.profile.empty');
                else if (cur && !known) text = t('ttSet.profile.missing', { name: cur });
            }
            msg.textContent = text;
            msg.style.display = text ? '' : 'none';
        }
    }

    async function render() {
        if (!root) return;
        const v = await load();
        if (disposed) return;
        for (const k of ['enabled', 'autoSync', 'useAiAssist', 'injEnabled', 'injIntimacy']) { const el = field(k); if (el) el.checked = !!v[k]; }
        for (const k of ['channel', 'injPosition', 'injDetail']) pick(field(k), v[k]);
        for (const k of ['cycleLength', 'periodLength', 'fertileWindowDays']) {
            const el = field(k); if (el) el.value = String(v[k]);
            const out = $('[data-charphys-out="' + k + '"]'); if (out) out.textContent = String(v[k]);
        }
        fillProfiles(v);
    }

    async function write(key, el) {
        const val = el.type === 'checkbox' ? !!el.checked : (el.tagName === 'SELECT' ? selValue(el) : el.value);
        switch (key) {
            case 'enabled': case 'useAiAssist':
                tavo.plugin.config.set(key, !!val); break;
            case 'cycleLength': case 'periodLength': case 'fertileWindowDays': {
                const n = Math.round(Number(val));
                if (Number.isFinite(n)) tavo.plugin.config.set(key, n);
                const out = $('[data-charphys-out="' + key + '"]'); if (out) out.textContent = String(n);
                break;
            }
            case 'autoSync': {
                const cur = await E.loadAiOpts();
                await E.saveAiOpts(Object.assign({}, cur, { autoSync: !!val }));
                break;
            }
            case 'injEnabled': case 'injPosition': case 'injDetail': case 'injIntimacy': {
                const cur = await E.loadInject();
                const map = { injEnabled: 'enabled', injPosition: 'position', injDetail: 'detail', injIntimacy: 'intimacy' };
                await E.saveInject(Object.assign({}, cur, { [map[key]]: val }));
                break;
            }
            case 'channel': {
                const bag = aiBag(); bag.channel = val === 'profile' ? 'profile' : 'main'; save();
                break;
            }
            case 'profileId': {
                const bag = aiBag(); bag.profileId = String(val || ''); save();
                break;
            }
            default: return;
        }
        save();
        await render();
    }

    // ---------------- 挂载 ----------------
    function build() {
        if (!D || disposed) return false;
        const host = D.getElementById('extensions_settings2') || D.getElementById('extensions_settings');
        if (!host) return false;
        if (D.getElementById(ROOT_ID)) return true;
        root = D.createElement('div');
        root.id = ROOT_ID;
        root.className = 'charphys_settings';
        root.innerHTML = html();
        host.appendChild(root);
        const onChange = (ev) => {
            const el = ev.target;
            const key = el && el.dataset ? el.dataset.charphysSet : null;
            if (!key) return;
            write(key, el).catch((e) => console.warn('[char-physiology] 保存设置失败', e));
        };
        const onInput = (ev) => { // 滑块拖动时实时显示数值
            const el = ev.target;
            const key = el && el.dataset ? el.dataset.charphysSet : null;
            if (!key || el.type !== 'range') return;
            const out = $('[data-charphys-out="' + key + '"]'); if (out) out.textContent = String(el.value);
        };
        const onClick = (ev) => {
            const btn = ev.target && ev.target.closest ? ev.target.closest('[data-charphys-act]') : null;
            if (!btn) return;
            const act = btn.dataset.charphysAct;
            if (act === 'profiles') render();
            else if (act === 'open-panel-settings' && typeof onOpenPanelSettings === 'function') onOpenPanelSettings();
        };
        root.addEventListener('change', onChange);
        root.addEventListener('input', onInput);
        root.addEventListener('click', onClick);
        disposers.push(() => { root.removeEventListener('change', onChange); root.removeEventListener('input', onInput); root.removeEventListener('click', onClick); root.remove(); root = null; });
        render();
        return true;
    }
    // 扩展设置页由酒馆在扩展加载前后插入：没找到就等一会儿再试
    let tries = 0;
    const tryBuild = () => {
        if (disposed || build() || ++tries > 40) return;
        const h = setTimeout(tryBuild, 500);
        disposers.push(() => clearTimeout(h));
    };
    tryBuild();

    return {
        render,
        get mounted() { return !!root; },
        dispose() { disposed = true; disposers.splice(0).forEach((f) => { try { f(); } catch (e) { /* ignore */ } }); },
    };
}
