/*
 * 块 6a 验收：界面接入（src/ui.js + 面板补丁 + shim 的 ui 能力）
 *
 * 用 linkedom 搭一个仿 TauriTavern 页面（魔杖菜单 #extensionsMenu、消息模板、#chat 楼层），
 * 加载真实的 index.js（启动流程 → 运行时 → 界面），检查：
 *   A. 面板挂到 <body>、样式选择器都在 .phys-root 下（不污染酒馆）
 *   B. 魔杖菜单出现原插件的四个侧栏按钮，点击后行为与原插件一致
 *   C. 消息按钮：加进消息模板和已渲染的楼层，只在最后一条 AI 消息上显示，点击后强制分析这条
 *   D. 确认框走酒馆弹窗（callGenericPopup）；引擎角色保持 entry；dispose 清理干净
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function loadLinkedom() {
    const cands = [process.env.LINKEDOM_PATH, path.join(ROOT, '..', 'devtools', 'node_modules', 'linkedom')].filter(Boolean);
    for (const dir of cands) {
        try {
            const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
            const entry = (pkg.exports && pkg.exports['.'] && (pkg.exports['.'].import || pkg.exports['.'].default)) || pkg.module || pkg.main || 'esm/index.js';
            return await import(pathToFileURL(path.join(dir, typeof entry === 'string' ? entry : 'esm/index.js')).href);
        } catch { /* next */ }
    }
    try { return await import('linkedom'); } catch { return null; }
}
const linkedom = await loadLinkedom();
if (!linkedom) { console.log('SKIP ui.test：未找到 linkedom'); process.exit(0); }

let pass = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); pass++; };
// linkedom 的 <select> 不支持 value 赋值，也不按 selected 属性算 value：测试里自己选
const selectOpt = (el, v) => { for (const o of el.querySelectorAll('option')) { if (o.value === v) o.setAttribute('selected', ''); else o.removeAttribute('selected'); } };
const selVal = (el) => { const o = el.querySelector('option[selected]') || el.querySelector('option'); return o ? o.value : ''; };
const eq2 = (a, b, msg) => { assert.deepEqual(a, b, msg); pass++; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function until(fn, ms = 3000, msg = '') {
    const t0 = Date.now();
    for (;;) { let v; try { v = await fn(); } catch { v = false; } if (v) return v; if (Date.now() - t0 > ms) throw new Error('超时：' + msg); await sleep(20); }
}

// ---------------- A0. 仿酒馆页面 ----------------
const mesHtml = (i, isUser, text) => '<div class="mes' + (i === 3 ? ' last_mes' : '') + '" mesid="' + i + '" is_user="' + isUser + '" is_system="false"><div class="mes_buttons"><div class="extraMesButtons"></div></div><div class="mes_text">' + text + '</div></div>';
const { window } = linkedom.parseHTML('<!doctype html><html><head></head><body>' +
    '<div id="top-bar"></div>' +
    '<div id="message_template" class="template_element"><div class="mes" mesid="" is_user="" is_system=""><div class="mes_buttons"><div class="extraMesButtons"><div class="mes_button mes_translate"></div></div></div></div></div>' +
    '<div id="chat">' + mesHtml(0, false, '欢迎光临。') + mesHtml(1, true, '来杯拿铁。') + mesHtml(2, false, '好的。') + mesHtml(3, true, '谢谢。') + '</div>' +
    '<form id="send_form"></form>' +
    '<div id="extensions_settings"></div><div id="extensions_settings2"></div>' +
    '</body></html>');
const g = globalThis;
const mem = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), clear: () => m.clear() }; };
Object.assign(g, {
    window, document: window.document,
    HTMLElement: window.HTMLElement, Element: window.Element, Node: window.Node, Event: window.Event,
    getComputedStyle: () => ({ getPropertyValue: () => '', paddingTop: '0px', paddingBottom: '0px' }),
    requestAnimationFrame: (f) => setTimeout(() => f(Date.now()), 0), cancelAnimationFrame: (id) => clearTimeout(id),
    sessionStorage: mem(), localStorage: mem(),
    ResizeObserver: class { observe() {} unobserve() {} disconnect() {} },
    MutationObserver: class { observe() {} disconnect() {} takeRecords() { return []; } },
});
if (!g.navigator) g.navigator = { clipboard: { writeText: async () => {} }, userAgent: 'node' };
const nativeConfirms = [];
window.confirm = (m) => { nativeConfirms.push(String(m)); return true; };
window.innerWidth = 400; window.innerHeight = 800;
window.matchMedia = window.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));

// 扩展资源（语言包等）从本地文件读
g.fetch = async (url) => {
    const u = new URL(String(url));
    if (u.protocol !== 'file:') return { ok: false, status: 404, json: async () => ({}), text: async () => '' };
    try { const text = fs.readFileSync(fileURLToPath(u), 'utf8'); return { ok: true, status: 200, json: async () => JSON.parse(text), text: async () => text }; }
    catch { return { ok: false, status: 404, json: async () => ({}), text: async () => '' }; }
};
const toasts = [];
g.toastr = { info: (m) => toasts.push(m), warning: (m) => toasts.push(m), error: (m) => toasts.push(m), success: (m) => toasts.push(m) };

class Bus {
    constructor(auto) { this.events = {}; this.auto = new Set(auto); this.last = new Map(); }
    on(e, f) { (this.events[e] ||= []).push(f); if (this.auto.has(e) && this.last.has(e)) f(...this.last.get(e)); }
    removeListener(e, f) { this.events[e] = (this.events[e] || []).filter((x) => x !== f); }
    async emit(e, ...a) { if (this.auto.has(e)) this.last.set(e, a); for (const f of [...(this.events[e] || [])]) await f(...a); }
}
const ET = { APP_READY: 'app_ready', MESSAGE_RECEIVED: 'message_received', MESSAGE_SWIPED: 'message_swiped', MESSAGE_EDITED: 'message_edited', MESSAGE_UPDATED: 'message_updated', MESSAGE_DELETED: 'message_deleted', MESSAGE_SWIPE_DELETED: 'message_swipe_deleted', CHAT_CHANGED: 'chat_id_changed', GENERATION_ENDED: 'generation_ended' };
const bus = new Bus([ET.APP_READY]);
const msg = (name, isUser, mes) => ({ name, is_user: isUser, is_system: false, mes, send_date: '2025-01-01 10:00', swipe_id: 0, swipes: [mes], extra: {} });
const popups = [];
let profileList = [{ id: 'p-cheap', name: '便宜模型' }, { id: 'p-big', name: '大模型' }];
let saveSettingsCount = 0;
let popupAnswer = 1;
const ctx = {
    eventSource: bus, eventTypes: ET, getCurrentLocale: () => 'zh-cn',
    chat: [msg('林晚', false, '欢迎光临。'), msg('阿明', true, '来杯拿铁。'), msg('林晚', false, '好的。'), msg('阿明', true, '谢谢。')],
    chatMetadata: {}, extensionSettings: {},
    characterId: 0, groupId: null, name1: '阿明', name2: '林晚',
    characters: [{ name: '林晚', avatar: 'linwan.png', chat: 'c1', description: '林晚，25岁，女性，咖啡店店长。', data: {} }], groups: [],
    powerUserSettings: {},
    getCurrentChatId: () => 'c1',
    saveMetadataDebounced() {}, saveSettingsDebounced() { saveSettingsCount++; },
    setExtensionPrompt() {},
    POPUP_TYPE: { TEXT: 1, CONFIRM: 2 }, POPUP_RESULT: { AFFIRMATIVE: 1, NEGATIVE: 0, CANCELLED: null },
    ConnectionManagerRequestService: { getSupportedProfiles: () => profileList.slice(), sendRequest: async () => ({ content: 'ok' }) },
    async callGenericPopup(content, type) { popups.push({ text: content && content.textContent != null ? content.textContent : String(content), type }); return popupAnswer; },
};
g.SillyTavern = { getContext: () => ctx };

// ---------------- 启动真实入口 ----------------
await import(pathToFileURL(path.join(ROOT, 'index.js')).href);
await bus.emit(ET.APP_READY);
const app = g.__charPhysiology;
await until(() => app.ready || app.error, 5000, '启动');
ok(app.ready && !app.error, '启动完成：' + (app.error && app.error.message));
const D = window.document;
const E = app.engine;

// ================= A. 面板 + 样式 =================
await until(() => D.getElementById('phys-root'), 3000, '面板挂载');
ok(D.getElementById('phys-root').parentNode === D.body, '面板挂在 <body> 下');
ok(app.ui.mounted, 'ui.mounted');
ok(!D.querySelector('link#phys-css'), '面板不再自己插 <link>（样式由 manifest 的 css 加载）');
ok(E.role() === 'entry', '引擎角色保持 entry（后台可以正常工作）');
{
    const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const stack = []; let bad = 0; const re = /([^{}]*)\{|\}/g; let m;
    while ((m = re.exec(css))) {
        if (m[0] === '}') { stack.pop(); continue; }
        const sel = m[1].trim();
        if (stack.includes('raw') || stack.at(-1) === 'rule') { stack.push(stack.includes('raw') ? 'raw' : 'rule'); continue; }
        if (sel.startsWith('@')) { stack.push(/^@(media|supports|container|layer)/.test(sel) ? 'group' : 'raw'); continue; }
        stack.push('rule');
        let depth = 0, cur = ''; const parts = [];
        for (const ch of sel) { if ('(['.includes(ch)) depth++; if (')]'.includes(ch)) depth--; if (ch === ',' && !depth) { parts.push(cur); cur = ''; } else cur += ch; }
        parts.push(cur);
        // 面板内：.phys / #phys 开头；面板外的少量规则（消息按钮）用插件专用前缀 charphys_
        for (const p of parts) if (!/^\s*(\.phys|#phys)/.test(p) && !/(^|[\s>+~])[.#]charphys_|\.charphys_/.test(p)) bad++;
    }
    ok(bad === 0, 'style.css 的选择器都限定在面板内或带插件专用前缀，不合规的有 ' + bad + ' 个');
}

// ================= B. 魔杖菜单 =================
// 酒馆在扩展加载之后才插入魔杖菜单：插件要能等到它
await sleep(120);
ok(!D.getElementById('char_physiology_wand'), '魔杖菜单还没出现时不报错');
const menu = D.createElement('div'); menu.id = 'extensionsMenu'; D.body.appendChild(menu);
await until(() => D.getElementById('char_physiology_wand'), 3000, '魔杖菜单项');
const items = [...D.querySelectorAll('#char_physiology_wand [data-charphys-action]')];
ok(items.map((x) => x.dataset.charphysAction).join(',') === 'open-panel,open-settings,ai-scan,rescan', '四个菜单项与原插件侧栏一致');
ok(items[0].textContent.includes('打开 / 刷新生理面板'), '菜单项文字来自语言包');
ok(items.every((x) => x.className.includes('list-group-item')), '菜单项用酒馆的样式类');

// 打开面板：存档里 panel.open 置位，面板立刻刷新（不用等 10 秒一次的轮询）
await until(() => D.querySelector('#phys-root .phys-launcher'), 3000, '收起状态的启动按钮');
await E.mutate((s0) => { s0.panel.open = false; return null; });
items[0].dispatchEvent(new window.Event('click', { bubbles: true }));
await until(async () => (await E.loadState()).panel.open === true, 3000, '面板打开');
await until(() => D.querySelector('#phys-root .phys-launcher.hidden') && D.querySelector('#phys-root .phys-panel'), 2500, '面板展开（DOM）');
ok(true, '“打开面板”：面板 DOM 立即展开（2.5 秒内）');
let st = await E.loadState();
ok(st.panel.view === 'main' && st.panel.collapsed === false, '“打开面板”：面板展开到主页');
ok(st.meta.autoBase, '“打开面板”：顺带记下自动分析基线');

// 打开设置
items[1].dispatchEvent(new window.Event('click', { bubbles: true }));
// 面板读到 view='settings' 后切到设置页（记在 sessionStorage 的 phys.page），再把存档里的 view 改回 main（原插件行为）
await until(() => g.sessionStorage.getItem('phys.page') === 'settings', 3000, '设置页');
ok((await E.loadState()).panel.view === 'main', '“打开设置”：面板切到设置页，存档里的 view 复位');

// AI 扫描
items[2].dispatchEvent(new window.Event('click', { bubbles: true }));
await until(async () => (await E.loadState()).panel.view === 'scan', 3000, '扫描页');
st = await E.loadState();
ok(st.panel.scanReq > 0, '“AI 扫描”：切到扫描页并发出扫描请求');

// 重新扫描（不调 AI，只按角色卡扫描）
const nToast = toasts.length;
items[3].dispatchEvent(new window.Event('click', { bubbles: true }));
await until(() => toasts.length > nToast, 3000, '重新扫描提示');
ok(/扫描完成/.test(toasts.at(-1)), '“重新扫描”：提示扫描结果，实际 ' + toasts.at(-1));

// ================= C. 消息按钮 =================
await until(() => D.querySelector('#message_template .charphys_mes_refresh'), 3000, '模板按钮');
ok(D.querySelector('#message_template .extraMesButtons').firstElementChild.classList.contains('charphys_mes_refresh'), '按钮加进了消息模板');
ok(D.querySelectorAll('#chat .mes .charphys_mes_refresh').length === 4, '已渲染的楼层也补上了按钮');
ok(D.querySelector('#message_template .charphys_mes_refresh').title === '从此消息刷新生理档案', '按钮提示文字');

// 点击：对这一楼强制分析（不调 AI：替换 runSync 记录参数）
const syncCalls = [];
const realRunSync = E.runSync;
E.runSync = async (id, opts) => { syncCalls.push([id, opts]); return { status: 'ok' }; };
const btn2 = D.querySelector('#chat .mes[mesid="2"] .charphys_mes_refresh');
btn2.dispatchEvent(new window.Event('click', { bubbles: true }));
await until(() => syncCalls.length === 1, 3000, '按钮触发分析');
ok(syncCalls[0][0] === app.tavo.__data.__msgId(2), '按钮：分析的是这一楼（按楼层找到稳定 ID）');
ok(syncCalls[0][1].force === true && syncCalls[0][1].manual === true, '按钮：force + manual，和原插件一致');
await until(() => toasts.at(-1) === '已根据该消息更新生理档案', 2000, '成功提示');
ok(true, '按钮：成功后提示');
E.runSync = async () => ({ status: 'duplicate' });
btn2.dispatchEvent(new window.Event('click', { bubbles: true }));
await until(() => toasts.at(-1) === '这条消息已经处理过了', 2000, 'duplicate 提示');
ok(true, '按钮：重复分析时给出对应提示');
E.runSync = realRunSync;

// 样式：只在最后一条 AI 消息上显示
{
    const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');
    ok(/\.charphys_mes_refresh\s*\{[^}]*display:\s*none/.test(css), '样式：按钮默认隐藏');
    ok(/\.mes\.last_mes\[is_user="false"\]\s+\.charphys_mes_refresh/.test(css), '样式：最后一条 AI 消息上显示');
}

// ================= D. 确认框 + 清理 =================
ok(await app.tavo.ui.confirm('确定吗？\n第二行') === true, 'tavo.ui.confirm：酒馆弹窗点“是” → true');
ok(popups.at(-1).type === 2 && popups.at(-1).text === '确定吗？\n第二行', '用 CONFIRM 类型的弹窗，文字原样（保留换行，不当 HTML）');
popupAnswer = 0;
ok(await app.tavo.ui.confirm('再确认') === false, '点“否” → false');
popupAnswer = null;
ok(await app.tavo.ui.confirm('再确认') === false, '关掉弹窗 → false');
ok(nativeConfirms.length === 0, '没有用到 window.confirm');
// getInsets：按酒馆顶栏下边缘 / 输入区上边缘计算（linkedom 没有布局，这里给元素装上假的尺寸）
{
    const holder = D.createElement('div'); holder.id = 'top-settings-holder'; D.body.prepend(holder);
    holder.getBoundingClientRect = () => ({ top: 0, bottom: 61, height: 61, left: 0, right: 400, width: 400 });
    const form = D.createElement('div'); form.id = 'form_sheld'; D.body.appendChild(form);
    form.getBoundingClientRect = () => ({ top: 724, bottom: 800, height: 76, left: 0, right: 400, width: 400 });
    const ins = app.tavo.ui.getInsets();
    ok(ins.topBar === 61 && ins.bottomInput === 76, 'getInsets：顶栏 61 / 输入区 76，实际 ' + JSON.stringify(ins));
    holder.remove(); form.remove();
}

// ================= E. 扩展设置区 =================
await until(() => D.querySelector('#extensions_settings2 #char_physiology_settings'), 3000, '设置区挂载');
const S = D.getElementById('char_physiology_settings');
const F = (k) => S.querySelector('[data-charphys-set="' + k + '"]');
const change = async (k, v) => {
    const el = F(k);
    if (el.type === 'checkbox') el.checked = v;
    else if (el.tagName === 'SELECT') selectOpt(el, String(v));
    else el.value = String(v);
    el.dispatchEvent(new window.Event('change', { bubbles: true }));
    await sleep(60);
};
ok(S.querySelector('.inline-drawer-header b').textContent === '角色生理档案', '设置区：酒馆抽屉结构，标题来自语言包');
await until(() => F('enabled').checked === true, 2000, '设置区读入当前值');
ok(F('autoSync').checked === true && selVal(F('channel')) === 'main', '缺省：启用、自动同步、用酒馆当前 API');
ok(selVal(F('injPosition')) === 'before' && selVal(F('injDetail')) === 'standard', '缺省：注入在消息之前、标准详细度，实际 ' + JSON.stringify([selVal(F('injPosition')), selVal(F('injDetail')), await E.loadInject()]));
ok(F('cycleLength').value === '28' && S.querySelector('[data-charphys-out="cycleLength"]').textContent === '28', '缺省周期 28 天');
ok(S.querySelector('[data-charphys-profile-row]').style.display === 'none', '用酒馆当前 API 时不显示连接配置');
ok(S.textContent.includes('明确写出的年龄小于 18 岁') && S.textContent.includes('确认成年'), '设置区写明年龄规则和“确认成年”');
ok(S.textContent.includes('Taby / KeeK'), '设置区注明原作者');

// 通道：切到连接配置 → 显示下拉、列出连接配置；选一个 → 写进 tt-ai 读取的位置
await change('channel', 'profile');
ok(S.querySelector('[data-charphys-profile-row]').style.display === '', '切到连接配置：显示下拉');
ok([...F('profileId').options].map((o) => o.value).join(',') === ',p-cheap,p-big', '下拉列出酒馆的连接配置');
await change('profileId', 'p-cheap');
ok(ctx.extensionSettings.char_physiology.ai.channel === 'profile' && ctx.extensionSettings.char_physiology.ai.profileId === 'p-cheap', '通道与连接配置存进 extensionSettings.char_physiology.ai');
eq2(app.tavo.__ai.settings(), { channel: 'profile', profileId: 'p-cheap' }, 'tt-ai 读到同样的设置');
// 连接配置被删了 → 提示，不自动换
profileList = [{ id: 'p-big', name: '大模型' }];
S.querySelector('[data-charphys-act="profiles"]').dispatchEvent(new window.Event('click', { bubbles: true }));
await sleep(60);
ok(S.querySelector('[data-charphys-profile-msg]').textContent.includes('p-cheap'), '选中的连接配置不存在：给出提示');
ok(selVal(F('profileId')) === 'p-cheap', '不存在时仍保留原选择，不自动换成别的');
profileList = [];
S.querySelector('[data-charphys-act="profiles"]').dispatchEvent(new window.Event('click', { bubbles: true }));
await sleep(60);
ok(S.querySelector('[data-charphys-profile-msg]').textContent.includes('Connection Manager'), '没有任何连接配置：提示去连接管理器保存');
profileList = [{ id: 'p-cheap', name: '便宜模型' }];
await change('channel', 'main');
ok(app.tavo.__ai.settings().channel === 'main', '切回酒馆当前 API');

// 写进与面板相同的那一层
await change('autoSync', false);
ok((await E.loadAiOpts()).autoSync === false && E.config().autoSync === false, '自动同步：写进面板「AI 生成」同一份设置');
await change('autoSync', true);
await change('injPosition', 'after');
await change('injDetail', 'detailed');
await change('injIntimacy', false);
let inj = await E.loadInject();
ok(inj.position === 'after' && inj.detail === 'detailed' && inj.intimacy === false, '注入：写进面板「注入」同一份设置');
await change('injEnabled', false);
ok((await E.loadInject()).enabled === false, '注入开关');
await change('injEnabled', true);
await change('cycleLength', 32);
ok(app.tavo.plugin.config.all().cycleLength === 32 && S.querySelector('[data-charphys-out="cycleLength"]').textContent === '32', '默认周期写进插件设置');
const before = saveSettingsCount;
await change('enabled', false);
ok(E.config().enabled === false, '关闭插件 → 引擎读到 enabled=false');
ok(saveSettingsCount > before, '改设置后保存酒馆设置');
await change('enabled', true);
ok(E.config().enabled === true, '重新启用');

// 打开面板设置按钮
S.querySelector('[data-charphys-act="open-panel-settings"]').dispatchEvent(new window.Event('click', { bubbles: true }));
await until(() => g.sessionStorage.getItem('phys.page') === 'settings', 3000, '面板设置页');
ok(true, '“打开面板设置”：面板切到设置页');

app.ui.dispose();
ok(!D.getElementById('char_physiology_settings'), 'dispose：设置区移除');
ok(!D.getElementById('phys-root'), 'dispose：面板移除');
ok(!D.getElementById('char_physiology_wand'), 'dispose：魔杖菜单项移除');
ok(!D.querySelector('.charphys_mes_refresh'), 'dispose：消息按钮移除');
app.runtime.stop();

console.log(`ui OK · ${pass} 项断言通过`);
process.exit(0);
