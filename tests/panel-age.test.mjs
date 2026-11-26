/*
 * 块 2b 验收：面板里的「确认成年」流程（真实 panel.js + 真实引擎，linkedom 提供 DOM）
 *
 * 依赖：linkedom（开发工具，不进仓库依赖）。查找顺序：
 *   1) 环境变量 LINKEDOM_PATH 指向的 linkedom 包目录
 *   2) ../devtools/node_modules/linkedom（移植工作区）
 *   3) 普通 import('linkedom')
 * 找不到时跳过（退出码 0，并打印 SKIP）。
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function loadLinkedom() {
    const cands = [process.env.LINKEDOM_PATH, path.join(ROOT, '..', 'devtools', 'node_modules', 'linkedom')].filter(Boolean);
    for (const c of cands) {
        const pj = path.join(c, 'package.json');
        if (!fs.existsSync(pj)) continue;
        const main = JSON.parse(fs.readFileSync(pj, 'utf8'));
        const entry = (main.exports && main.exports['.'] && (main.exports['.'].import || main.exports['.'].default)) || main.module || main.main || 'esm/index.js';
        return import(pathToFileURL(path.join(c, typeof entry === 'string' ? entry : 'esm/index.js')).href);
    }
    try { return await import('linkedom'); } catch { return null; }
}
const linkedom = await loadLinkedom();
if (!linkedom) { console.log('SKIP panel-age.test：未找到 linkedom'); process.exit(0); }

// ---------- DOM 环境 ----------
const { window } = linkedom.parseHTML('<!doctype html><html><head></head><body></body></html>');
const g = globalThis;
// linkedom 不把 checked / disabled 属性映射到 DOM 属性（浏览器会）：补上，和浏览器一致
{
    const proto = Object.getPrototypeOf(window.document.createElement('input'));
    for (const name of ['checked', 'disabled']) {
        const d = Object.getOwnPropertyDescriptor(proto, name);
        if (d && d.get && d.get.call(Object.assign(window.document.createElement('input'), {})) !== undefined) continue;
        Object.defineProperty(proto, name, {
            configurable: true,
            get() { return this.hasAttribute(name); },
            set(v) { if (v) this.setAttribute(name, ''); else this.removeAttribute(name); },
        });
    }
}
const confirmLog = [];
let confirmAnswer = true;
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
window.confirm = (msg) => { confirmLog.push(String(msg)); return confirmAnswer; };
window.innerWidth = 400; window.innerHeight = 800;
window.visualViewport = window.visualViewport || null;
window.matchMedia = window.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));

// ---------- 引擎 + 语言包 + tavo 桩 ----------
const zh = JSON.parse(fs.readFileSync(path.join(ROOT, 'locales/zh-CN.json'), 'utf8'));
const tr = (k, p) => String(zh[k] != null ? zh[k] : k).replace(/\{(\w+)\}/g, (m, n) => (p && p[n] != null ? String(p[n]) : m));
const vars = { chat: new Map(), global: new Map() };
const scopeOf = (o) => ((typeof o === 'string' ? o : o && o.scope) === 'global' ? 'global' : 'chat');
const clone = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
const toasts = [];
const tavo = {
    plugin: { i18n: { t: tr }, on: () => () => {}, onSidebarAction: () => () => {}, config: { all: async () => ({}) } },
    variable: {
        get: async (n, o) => clone(vars[scopeOf(o)].get(n)),
        set: async (n, v, o) => { vars[scopeOf(o)].set(n, clone(v)); },
        unset: async (n, o) => { vars[scopeOf(o)].delete(n); },
        keys: async (o) => [...vars[scopeOf(o)].keys()],
        list: async (o) => [...vars[scopeOf(o)].entries()].map(([name, value]) => ({ name, value })),
    },
    chat: { current: async () => ({ id: 'chat-test' }) },
    message: { find: async () => [], get: async () => null, count: async () => 0 },
    character: { get: async () => null, list: async () => [] },
    lorebook: { list: async () => [], get: async () => null },
    file: { load: async () => null, save: async () => null, url: async () => '', delete: async () => {}, import: async () => null },
    ui: { getInsets: async () => ({ top: 0, bottom: 0, left: 0, right: 0 }), onInsetsChanged: () => () => {} },
    utils: { toast: async (m) => { toasts.push(String(m)); } },
};
const { createEngine } = await import(pathToFileURL(path.join(ROOT, 'src/engine.js')).href);
const { mountPanel } = await import(pathToFileURL(path.join(ROOT, 'src/panel.js')).href);
const E = createEngine(tavo);

// 三个角色：b=年龄 16 被拦；c=已确认成年；m=旧版误判（迁移后应为“未追踪”）
const mk = (id, name, extra) => Object.assign(E.newChar(id, name), extra || {});
vars.chat.set('physiology.v1', {
    characters: {
        b: mk('b', '乙', { adult: false, skippedReason: 'minor', cardAge: 16 }),
        c: mk('c', '丙', { adultConfirmed: { at: 1, age: 22 }, cardAge: 22 }),
        m: mk('m', '沈玉卿', { adult: false, skippedReason: 'minor' }),
    },
    meta: { rosterConfirmed: true },
    panel: { open: true, collapsed: false, view: 'main' },
});

let pass = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); pass++; };
const tick = (ms = 30) => new Promise((r) => setTimeout(r, ms));
async function settle(n = 8) { for (let i = 0; i < n; i++) await tick(20); }

// ---------- 挂载 ----------
let dispose = null;
try { dispose = mountPanel(E, tavo); } catch (e) { console.error('mountPanel 抛错：', e && e.stack); throw e; }
await settle(15);
const root = document.getElementById('phys-root');
ok(!!root, '面板根节点已创建');

// 进入设置页（追踪名单在设置里）：通过 sessionStorage + 面板内部按钮
const click = async (el) => {
    assert.ok(el, '要点击的元素不存在');
    const ev = new window.Event('click', { bubbles: true, cancelable: true });
    el.dispatchEvent(ev);
    await settle(10);
};
const q = (sel) => root.querySelector(sel);
const qa = (sel) => Array.from(root.querySelectorAll(sel));

// 找到“设置”入口
let goSettings = q('[data-act=page][data-page=settings]') || q('[data-act=settings]') || q('[data-act=open-settings]');
if (!goSettings) {
    // 可能在“已跳过”页上（当前选中角色被拦）
    const any = qa('[data-act]').map((b) => b.dataset.act + (b.dataset.page ? ':' + b.dataset.page : ''));
    console.log('可用操作：', [...new Set(any)].slice(0, 30).join(' '));
}
ok(!!goSettings, '能找到“设置”入口');
await click(goSettings);

// 展开“追踪”分组（sSection 默认折叠）
const trackSec = q('[data-act=sopen][data-sec=track]');
if (trackSec && trackSec.getAttribute('aria-expanded') !== 'true') await click(trackSec);
let html = root.innerHTML;

// ---------- 1. 追踪名单 ----------
const rows = qa('.phys-trackrow');
ok(rows.length >= 3, '追踪名单显示 3 个角色，实际 ' + rows.length);
// 引擎会把角色 id 规范成 "b~xxxx" 的形式：按名字找按钮
const askBtn = (name) => qa('[data-act=adult-ask]').find((b) => b.dataset.name === name) || null;
const idOf = async (name) => { const s = await E.loadState(); return Object.keys(s.characters).find((k) => s.characters[k].name === name); };
const btnB = askBtn('乙');
ok(!!btnB, '年龄 16 的“乙”有「确认成年」按钮');
ok(!askBtn('丙'), '已确认成年的“丙”没有确认按钮');
ok(!askBtn('沈玉卿'), '旧版误判解锁的“沈玉卿”不需要确认按钮');
ok(html.includes(tr('ttAge.migrated.row')), '旧版误判解锁的角色显示迁移提示');
ok(html.includes(tr('ui.skip.short.minor')), '被拦角色显示新的跳过原因文案');

// ---------- 2. 打开表单 + 校验 ----------
await click(btnB);
let input = q('[data-adultask=age]');
ok(!!input, '点击后出现年龄输入框');
ok(root.innerHTML.includes(tr('ttAge.confirm.hint', { name: '乙' })), '表单显示使用说明');

const typeAge = async (v) => {
    input = q('[data-adultask=age]');
    input.value = String(v);
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
    await settle(2);
};
await typeAge('16');
await click(q('[data-act=adult-ok]'));
ok(root.innerHTML.includes(tr('ttAge.confirm.errUnder')), '填 16 → 提示“需不小于 18”');
ok(confirmLog.length === 0, '校验失败时不弹二次确认');

await typeAge('abc');
await click(q('[data-act=adult-ok]'));
ok(root.innerHTML.includes(tr('ttAge.confirm.errNum')), '填非数字 → 提示“请输入整数年龄”');

// 用户在二次确认里点“取消”
confirmAnswer = false;
await typeAge('19');
await click(q('[data-act=adult-ok]'));
ok(confirmLog.length === 1 && confirmLog[0].includes('乙') && confirmLog[0].includes('19'), '二次确认框内容包含名字和年龄');
const bid = await idOf('乙');
let s1 = await E.loadState();
ok(s1.characters[bid].skippedReason === 'minor', '二次确认取消 → 不改数据');

// 用户确认
confirmAnswer = true;
await typeAge('19');
await click(q('[data-act=adult-ok]'));
await settle(10);
s1 = await E.loadState();
ok(s1.characters[bid].adultConfirmed && s1.characters[bid].adultConfirmed.age === 19, '确认后写入 adultConfirmed.age=19');
ok(s1.characters[bid].skippedReason === null && s1.characters[bid].adult === true, '确认后解除跳过');
ok(toasts.some((x) => x.includes('乙') && x.includes('19')), '提示“已确认成年”');
ok(!askBtn('乙'), '确认后按钮消失');

// ---------- 3. 取消按钮 ----------
// 用“撤销”把数据恢复到确认前（面板的撤销按钮走引擎 undo），再测取消按钮
await E.revokeAdult(bid);
await E.mutate((s) => { s.characters[bid].cardAge = 16; });
await E.revokeAdult(bid);
const rescan = q('[data-act=rescan]');
// 强制刷新：面板监听存储变化有节流，这里直接重新挂载
try { if (typeof dispose === 'function') dispose(); } catch { /* ignore */ }
dispose = mountPanel(E, tavo); await settle(15);
const root2 = document.getElementById('phys-root');
const askBtn2 = (name) => Array.from(root2.querySelectorAll('[data-act=adult-ask]')).find((b) => b.dataset.name === name) || null;
const gs2 = root2.querySelector('[data-act=page][data-page=settings]');
if (gs2) { gs2.dispatchEvent(new window.Event('click', { bubbles: true })); await settle(10); }
// 重新挂载后“追踪”分组回到折叠状态：展开它
const sec2 = root2.querySelector('[data-act=sopen][data-sec=track]');
if (sec2 && sec2.getAttribute('aria-expanded') !== 'true') { sec2.dispatchEvent(new window.Event('click', { bubbles: true })); await settle(10); }
const btnB2 = askBtn2('乙');
ok(!!btnB2, '撤销确认（年龄 16）后，按钮重新出现');
btnB2.dispatchEvent(new window.Event('click', { bubbles: true })); await settle(10);
ok(!!root2.querySelector('[data-adultask=age]'), '再次打开表单');
root2.querySelector('[data-act=adult-cancel]').dispatchEvent(new window.Event('click', { bubbles: true })); await settle(10);
ok(!root2.querySelector('[data-adultask=age]'), '点取消 → 表单收起');

// ---------- 4. AI 扫描候选：16 岁的候选可确认成年后应用 ----------
const cand = (key, name, age, minor) => ({ key, name, gender: 'female', age, adult: !minor, minor, minorWhy: minor ? 'age' : '', inChat: false, existing: false, track: !minor,
    cycle: { length: 28, periodLength: 5, day: 3 }, pregnant: false, pregnancyDay: 0, pregnancyCount: 0, birthCount: 0, miscarriages: 0, menopause: false, regularity: 'regular', fertilityBaseline: 'normal' });
const realAiScan = E.aiScan;
E.aiScan = async () => ({ source: 'ai', candidates: [cand('s1', '林晚', 16, true), cand('s2', '苏青', 25, false)], filtered: [], hiddenMale: 0, members: 1, lore: 0, msgs: 3 });
const r3 = document.getElementById('phys-root');
const q3 = (sel) => r3.querySelector(sel);
const fire = async (el, type = 'click') => { assert.ok(el, '元素不存在：' + type); el.dispatchEvent(new window.Event(type, { bubbles: true, cancelable: true })); await settle(10); };
const scanBtn = q3('[data-act=ai-scan]');
ok(!!scanBtn, '设置页有「AI 扫描」按钮');
await fire(scanBtn);
await settle(10);
const scanAsk = Array.from(r3.querySelectorAll('[data-act=adult-ask][data-kind=scan]')).find((b) => b.dataset.name === '林晚');
ok(!!scanAsk, '扫描结果里 16 岁的“林晚”有「确认成年」按钮');
ok(!Array.from(r3.querySelectorAll('[data-act=adult-ask][data-kind=scan]')).some((b) => b.dataset.name === '苏青'), '25 岁的“苏青”没有确认按钮');
ok(q3('.phys-cand.minor input[data-act=scan-track]').hasAttribute('disabled'), '确认前，林晚的勾选框是禁用的');
await fire(scanAsk);
const ageIn3 = q3('[data-adultask=age]');
ageIn3.value = '20'; await fire(ageIn3, 'input');
confirmLog.length = 0;
await fire(q3('[data-act=adult-ok]'));
ok(confirmLog.length === 1 && confirmLog[0].includes('林晚'), '扫描候选确认时弹二次确认');
ok(!q3('.phys-cand.minor'), '确认后林晚不再是“未成年”候选');
const lwBox = Array.from(r3.querySelectorAll('input[data-act=scan-track]')).find((x) => x.dataset.key === 's1');
ok(lwBox && lwBox.hasAttribute('checked') && !lwBox.hasAttribute('disabled'), '确认后林晚的勾选框可用且已勾选');
await fire(q3('[data-act=scan-apply]'));
await settle(20);
const s4 = await E.loadState();
const lw = Object.values(s4.characters).find((c) => c.name === '林晚');
const sq = Object.values(s4.characters).find((c) => c.name === '苏青');
ok(lw && lw.adultConfirmed && lw.adultConfirmed.age === 20 && lw.adult === true && !lw.skippedReason, '应用后林晚建档并记录确认成年（20 岁）');
ok(sq && sq.adult === true && !sq.skippedReason && !sq.adultConfirmed, '苏青正常建档，不需要确认');
E.aiScan = realAiScan;

// ---------- 5. 识别名单：未成年行可确认后一并应用 ----------
await E.mutate((st) => {
    st.meta.rosterConfirmed = false;
    delete st.askPending; // 上一步扫描应用后会弹“是否初始化”，优先级高于识别名单：视为用户已点“稍后”
    st.recogPending = { ids: [], cands: [cand('r1', '白露', 15, true), cand('r2', '秋霜', 30, false)].map((c) => Object.assign(c, { pre: true, source: 'ai' })), filtered: [], ts: Date.now() };
    return null;
});
try { if (typeof dispose === 'function') dispose(); } catch { /* ignore */ }
dispose = mountPanel(E, tavo); await settle(20);
const r5 = document.getElementById('phys-root');
const q5 = (sel) => r5.querySelector(sel);
// 面板默认只显示悬浮图标：像用户一样按回车打开（键盘打开与点击图标走同一逻辑）
const launcher = q5('.phys-launcher');
if (launcher) {
    const kev = new window.Event('keydown', { bubbles: true, cancelable: true });
    kev.key = 'Enter';
    launcher.dispatchEvent(kev);
    await settle(20);
}
const rcAsk = Array.from(r5.querySelectorAll('[data-act=adult-ask][data-kind=recog]')).find((b) => b.dataset.name === '白露');
ok(!!rcAsk, '识别名单里 15 岁的“白露”有「确认成年」按钮');
ok(!!q5('input[data-rcminor]'), '确认前白露那行是禁用的');
await fire(rcAsk);
const ageIn5 = q5('[data-adultask=age]');
ageIn5.value = '18'; await fire(ageIn5, 'input');
await fire(q5('[data-act=adult-ok]'));
const rcBox = Array.from(r5.querySelectorAll('input[data-rc]')).find((x) => x.dataset.rc === 'r1');
ok(rcBox && rcBox.hasAttribute('checked'), '确认后白露那行变为可勾选并已勾选');
ok(r5.innerHTML.includes(tr('ttAge.confirmed.tag', { age: 18 })), '白露那行显示“已确认成年 · 18 岁”');
await fire(q5('[data-act=rc-ok]'));
await settle(20);
const s5 = await E.loadState();
const bl = Object.values(s5.characters).find((c) => c.name === '白露');
const qs = Object.values(s5.characters).find((c) => c.name === '秋霜');
ok(bl && bl.adultConfirmed && bl.adultConfirmed.age === 18 && !bl.skippedReason, '识别确认后白露建档并记录确认成年（18 岁）');
ok(qs && qs.adult === true && !qs.skippedReason, '秋霜正常建档');

// ---------- 6. 手动添加：描述写了 17 岁 → 被拒 → 确认成年后添加 ----------
const goRoster = q5('[data-act=page][data-page=roster]');
ok(!!goRoster, '有“名单”页入口');
await fire(goRoster);
await fire(q5('[data-act=add-open]'));
const setField = async (sel, v) => { const el = q5(sel); assert.ok(el, '缺少输入框 ' + sel); el.value = v; await fire(el, 'input'); };
await setField('[data-addf=name]', '小雪');
await setField('[data-addf=desc]', '17岁，学生会长');
await fire(q5('[data-act=add-go]'));
await settle(10);
ok(r5.innerHTML.includes(tr('ui7.add.err.minor')), '描述写 17 岁 → 提示不能添加，并说明可确认成年');
const addAsk = q5('[data-act=adult-ask][data-kind=add]');
ok(!!addAsk, '手动添加表单出现「确认成年」入口');
let s6 = await E.loadState();
ok(!Object.values(s6.characters).some((c) => c.name === '小雪'), '确认前没有建档');
await fire(addAsk);
const ageIn6 = q5('[data-adultask=age]');
ageIn6.value = '21'; await fire(ageIn6, 'input');
await fire(q5('[data-act=adult-ok]'));
ok(r5.innerHTML.includes(tr('ttAge.confirmed.tag', { age: 21 })), '确认后表单显示“已确认成年 · 21 岁”');
await fire(q5('[data-act=add-go]'));
await settle(15);
s6 = await E.loadState();
const xx = Object.values(s6.characters).find((c) => c.name === '小雪');
ok(xx && xx.adultConfirmed && xx.adultConfirmed.age === 21 && xx.adult === true && !xx.skippedReason, '确认后添加成功并记录确认成年（21 岁）');
// 普通描述（没写年龄）不会被拦
await fire(q5('[data-act=add-open]'));
await setField('[data-addf=name]', '温柔的大学生');
await setField('[data-addf=desc]', '看起来很稚嫩，娇小可爱');
await fire(q5('[data-act=add-go]'));
await settle(15);
s6 = await E.loadState();
ok(Object.values(s6.characters).some((c) => c.name === '温柔的大学生' && c.adult === true && !c.skippedReason), '描述里只有“稚嫩/娇小”等词 → 正常添加（不再误判）');

try { if (typeof dispose === 'function') dispose(); } catch { /* ignore */ }
console.log('panel-age OK · %d 项断言通过', pass);
process.exit(0);
