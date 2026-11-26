/*
 * 块 1 冒烟测试：在 Node 里模拟最小 SillyTavern 环境，加载扩展入口，确认启动链路完整。
 * 运行：node tests/smoke-boot.mjs
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ---- 模拟 ST 的 EventEmitter（带 auto-fire；运行时只用 on / removeListener）----
class EventEmitter {
    constructor(autoFire = []) { this.events = {}; this.autoFire = new Set(autoFire); this.last = new Map(); }
    on(ev, fn) { (this.events[ev] ||= []).push(fn); if (this.autoFire.has(ev) && this.last.has(ev)) fn(...this.last.get(ev)); }
    removeListener(ev, fn) { const a = this.events[ev]; if (a) { const i = a.indexOf(fn); if (i >= 0) a.splice(i, 1); } }
    async emit(ev, ...args) { if (this.autoFire.has(ev)) this.last.set(ev, args); for (const fn of [...(this.events[ev] || [])]) await fn(...args); }
}
const eventTypes = { APP_READY: 'app_ready', CHAT_CHANGED: 'chat_id_changed', MESSAGE_RECEIVED: 'message_received' };
const eventSource = new EventEmitter([eventTypes.APP_READY]);

// ---- 用本地文件模拟扩展资源的 fetch ----
globalThis.fetch = async (url) => {
    const u = new URL(String(url));
    if (u.protocol !== 'file:') throw new Error('unexpected fetch ' + url);
    try {
        const text = await readFile(fileURLToPath(u), 'utf8');
        return { ok: true, status: 200, json: async () => JSON.parse(text), text: async () => text };
    } catch (e) {
        return { ok: false, status: 404, json: async () => ({}), text: async () => '' };
    }
};

const toasts = [];
globalThis.toastr = { info: (m) => toasts.push(['info', m]), error: (m) => toasts.push(['error', m]), success: () => {}, warning: () => {} };
const prompts = {};
const sharedCtx = { eventSource, eventTypes, getCurrentLocale: () => 'zh-cn', chat: [], chatMetadata: {}, extensionSettings: {},
    setExtensionPrompt: (k, v, pos, depth) => { prompts[k] = { v: String(v), pos, depth }; } };
globalThis.SillyTavern = {
    getContext: () => sharedCtx,
};

// 模拟 TT 宿主：APP_READY 在扩展加载之前就已触发（auto-fire 必须立即回调）
await eventSource.emit(eventTypes.APP_READY);

const mod = await import(pathToFileURL(path.join(ROOT, 'index.js')).href);
assert.equal(mod.EXT_ID, 'char-physiology');
assert.equal(typeof globalThis.charPhysiologyInterceptor, 'function', '拦截器必须在模块求值时挂上');

// 等待异步启动完成
const app = globalThis.__charPhysiology;
for (let i = 0; i < 200 && !app.ready && !app.error; i++) await new Promise((r) => setTimeout(r, 25));

assert.equal(app.error, null, '启动报错：' + JSON.stringify(app.error));
assert.equal(app.ready, true, '启动未完成');
assert.equal(app.i18n.locale, 'zh-CN');
assert.equal(app.i18n.t('plugin.name'), '角色生理档案');
assert.equal(app.i18n.t('ui.skip.minor', { name: '测试' }).includes('测试'), true, '占位符替换失败');
assert.equal(app.i18n.t('ui7.inj.getvarNote').includes('{{getvar::'), true, '宏 {{…}} 不应被替换');
assert.equal(app.i18n.t('no.such.key'), 'no.such.key');

const E = app.engine;
assert.ok(E && typeof E.loadState === 'function' && typeof E.runSync === 'function', '引擎导出不完整');
assert.equal(E.t('plugin.name'), '角色生理档案', '引擎内 t() 未接到 i18n');
const st = E.newState();
assert.ok(st && typeof st === 'object' && st.characters, 'newState 结构异常');

// 拦截器在运行时就绪后可调用且不抛错
await globalThis.charPhysiologyInterceptor([], 4096, () => {}, 'normal');
assert.ok('char_physiology' in prompts && prompts.char_physiology.v === '', '拦截器经运行时写扩展提示词（空聊天：空内容）');
assert.equal((eventSource.events[eventTypes.MESSAGE_RECEIVED] || []).length, 1, '运行时已绑定 MESSAGE_RECEIVED');
assert.equal((eventSource.events[eventTypes.CHAT_CHANGED] || []).length, 1, '运行时已绑定 CHAT_CHANGED');
assert.ok(app.runtime && typeof app.runtime.stop === 'function', '运行时已启动');

// 英文语言包
const { createI18n } = await import(pathToFileURL(path.join(ROOT, 'src/i18n.js')).href);
const en = await createI18n(pathToFileURL(ROOT + '/').href, 'en');
assert.equal(en.locale, 'en');
assert.notEqual(en.t('plugin.name'), 'plugin.name');

assert.deepEqual(toasts.filter((t) => t[0] === 'error'), [], '不应有错误提示');
console.log('smoke-boot OK · 引擎导出 %d 项 · 中文名=%s · 英文名=%s', Object.keys(E).length, app.i18n.t('plugin.name'), en.t('plugin.name'));
