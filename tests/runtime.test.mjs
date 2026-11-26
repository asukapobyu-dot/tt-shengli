/*
 * 块 5 验收：运行时（src/runtime.js）
 *
 * 仿 TauriTavern 宿主（聊天数组、eventSource、setExtensionPrompt）+ 真实引擎：
 *   A. TT 事件 → 原插件事件（新回复、切换回复、编辑、删除、换聊天、生成结束兜底）
 *   B. 自动分析闸门（基线之前的楼不分析、只分析最新 AI 回复、同一内容只分析一次、关闭自动同步）
 *   C. 注入：拦截器写扩展提示词（位置、关闭、后台生成不注入、无追踪角色时为空）
 *   D. stop() 解绑事件
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = (p) => import(pathToFileURL(path.join(ROOT, p)).href);
const { createTavoShim } = await imp('src/tavo-shim.js');
const { createTranslator } = await imp('src/i18n.js');
const { createEngine } = await imp('src/engine.js');
const { startRuntime, PROMPT_KEY } = await imp('src/runtime.js');

let pass = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); pass++; };
const eq = (a, b, msg) => { assert.deepEqual(a, b, msg); pass++; };
const tick = (n = 6) => new Promise((r) => { let i = 0; const f = () => (++i >= n ? r() : setImmediate(f)); f(); });

// ---------------- 仿宿主 ----------------
const ET = {
    MESSAGE_RECEIVED: 'message_received', MESSAGE_SWIPED: 'message_swiped', MESSAGE_EDITED: 'message_edited',
    MESSAGE_UPDATED: 'message_updated', MESSAGE_DELETED: 'message_deleted', MESSAGE_SWIPE_DELETED: 'message_swipe_deleted',
    CHAT_CHANGED: 'chat_id_changed', GENERATION_ENDED: 'generation_ended',
};
class Bus {
    constructor() { this.l = {}; }
    on(e, f) { (this.l[e] || (this.l[e] = [])).push(f); }
    removeListener(e, f) { this.l[e] = (this.l[e] || []).filter((x) => x !== f); }
    async emit(e, ...a) { for (const f of [...(this.l[e] || [])]) await f(...a); }
    count(e) { return (this.l[e] || []).length; }
}
const bus = new Bus();
const msg = (name, isUser, mes) => ({ name, is_user: isUser, is_system: false, mes, send_date: '2025-01-01 10:00', swipe_id: 0, swipes: [mes], extra: {} });
const characters = [{ name: '林晚', avatar: 'linwan.png', chat: 'linwan-1', description: '林晚，25岁，女性，咖啡店店长。她性格温柔。', data: {} }];
const host = {
    chat: [msg('林晚', false, '欢迎光临。'), msg('阿明', true, '来杯拿铁。'), msg('林晚', false, '好的，请稍等。')],
    chatMetadata: {},
    chatId: 'linwan-1',
    prompts: {},
};
const ctx = {
    get chat() { return host.chat; },
    get chatMetadata() { return host.chatMetadata; },
    characterId: 0, groupId: null, name1: '阿明', name2: '林晚',
    characters, groups: [],
    extensionSettings: {},
    powerUserSettings: { persona_description: '' },
    getCurrentChatId() { return host.chatId; },
    saveMetadataDebounced() {}, saveSettingsDebounced() {},
    eventSource: bus, eventTypes: ET,
    setExtensionPrompt(key, value, position, depth, scan, role) { host.prompts[key] = { value: String(value), position, depth, scan, role }; },
};
const getContext = () => ctx;
globalThis.toastr = { info() {}, warning() {}, error() {}, success() {} };
const i18n = createTranslator({}, {}, 'zh-CN');
const tavo = createTavoShim({ extId: 'char-physiology', baseUrl: 'file:///x/', i18n, getContext });
const E = createEngine(tavo);

// 记录运行时调了引擎哪些函数（runSync 不真的调 AI）
const calls = { sync: [], stale: [], changed: [] };
let syncReply = 'ok';
const realMarkStale = E.markStale, realChanged = E.onMessageChanged;
E.runSync = async (id) => { calls.sync.push(String(id)); return { status: syncReply }; };
E.markStale = async (id) => { calls.stale.push(String(id)); return realMarkStale(id); };
E.onMessageChanged = async (id, kind) => { calls.changed.push(kind + ':' + id); return realChanged(id, kind); };
E.detectNewCharacters = async () => ({ ok: true });
E.autoCorruption = async () => 0;

// 定时器：防抖用的 700ms 由测试手动推进
const timers = [];
const T = {
    setTimeout(fn, ms) { const h = { fn, ms, done: false }; timers.push(h); return h; },
    clearTimeout(h) { if (h) h.done = true; },
};
async function flushTimers(maxMs) {
    for (let round = 0; round < 5; round++) {
        const due = timers.filter((h) => !h.done && h.ms <= maxMs);
        if (!due.length) break;
        for (const h of due) { h.done = true; h.fn(); }
        await tick(12);
    }
}

const rt = await startRuntime({ engine: E, tavo, getContext, timers: T, log: () => {} });
await tick(20);
const idOf = (i) => tavo.__data.__msgId(i);

// ================= A/B. 事件 + 自动分析闸门 =================
let st = await E.loadState();
ok(st.meta.autoBase && st.meta.autoBase.id === idOf(2), '启动时记下基线：插件装上前的最后一楼');
for (const k of Object.keys(ET)) ok(bus.count(ET[k]) === 1, '已绑定 ' + k);

// 基线那一楼的 RECEIVED（例如重新渲染）不分析
await bus.emit(ET.MESSAGE_RECEIVED, 2, 'normal');
await rt.idle();
eq(calls.sync, [], '基线之前 / 基线那一楼不自动分析');

// 新的一轮：用户发言 + AI 回复
host.chat.push(msg('阿明', true, '谢谢。'), msg('林晚', false, '拿铁好了，小心烫。'));
await bus.emit(ET.MESSAGE_RECEIVED, 4, 'normal');
await rt.idle();
eq(calls.sync, [idOf(4)], '新回复 → 自动分析一次');

// 同一内容再来一次（如重新渲染 / 生成结束兜底）→ 不重复
await bus.emit(ET.MESSAGE_RECEIVED, 4, 'normal');
await bus.emit(ET.GENERATION_ENDED, host.chat.length);
await rt.idle();
eq(calls.sync, [idOf(4)], '同一内容只分析一次（含 GENERATION_ENDED 兜底）');

// 用户消息不触发
await bus.emit(ET.MESSAGE_RECEIVED, 3, 'normal');
await rt.idle();
ok(calls.sync.length === 1, '用户消息不触发分析');

// 替你发言（impersonate）不触发
await bus.emit(ET.MESSAGE_RECEIVED, 4, 'impersonate');
await rt.idle();
ok(calls.sync.length === 1, 'impersonate 不触发');

// 编辑最后一条 AI 回复 → 标记失效 + 700ms 防抖后重新分析
const oldId4 = idOf(4);
host.chat[4].mes = '拿铁好了，小心烫。今天的豆子是新到的。';
host.chat[4].swipes[0] = host.chat[4].mes;
await bus.emit(ET.MESSAGE_EDITED, 4);
await bus.emit(ET.MESSAGE_EDITED, 4);
await tick(10);
ok(calls.changed.length === 0, '编辑：防抖期间不处理');
await flushTimers(700);
await rt.idle();
await tick(10);
eq(calls.changed, ['updated:' + oldId4], '编辑：连续两次只处理一次');
ok(calls.stale.includes(oldId4), '编辑：分析来源被标记为可能失效');
eq(calls.sync, [oldId4, oldId4], '编辑后内容变了 → 重新分析');

// 切换回复（swipe）：TT 整体换掉 extra，所以是一个新 ID
calls.changed.length = 0;
const m4 = host.chat[4];
m4.swipes.push('（另一个回复）她把杯子推过来。');
m4.swipe_info = [{ extra: m4.extra }, { extra: {} }];
m4.swipe_id = 1; m4.mes = m4.swipes[1]; m4.extra = {};
await bus.emit(ET.MESSAGE_SWIPED, 4);
await tick(20);
ok(calls.changed.includes('deleted:' + oldId4), '切换回复：旧回复的 ID 按“删除”处理');
await flushTimers(700);
await rt.idle();
await tick(10);
const newId4 = idOf(4);
ok(newId4 && newId4 !== oldId4, '切换回复后是新 ID');
ok(calls.sync[calls.sync.length - 1] === newId4, '切换到的回复被自动分析');

// 生成新的 swipe：TT 先发 SWIPED（内容为空），生成完不发 RECEIVED，只有 GENERATION_ENDED
const n0 = calls.sync.length;
m4.swipes.push('');
m4.swipe_id = 2; m4.mes = ''; m4.extra = {};
await bus.emit(ET.MESSAGE_SWIPED, 4);
await flushTimers(700);
await rt.idle();
ok(calls.sync.length === n0, '空的新 swipe（还在生成）不分析');
m4.mes = '（新生成）她笑了笑。'; m4.swipes[2] = m4.mes;
await bus.emit(ET.GENERATION_ENDED, host.chat.length);
await rt.idle();
ok(calls.sync.length === n0 + 1 && calls.sync[n0] === idOf(4), '新 swipe 生成完：GENERATION_ENDED 兜底触发分析');

// 删除消息：对比删前快照
calls.changed.length = 0;
const id3 = idOf(3), id4 = idOf(4);
host.chat.splice(3, 2);
await bus.emit(ET.MESSAGE_DELETED, host.chat.length);
await tick(10);
ok(calls.changed.includes('deleted:' + id3) && calls.changed.includes('deleted:' + id4), '删除两楼 → 两个 ID 都按删除处理');

// 关闭自动同步：新回复不分析
const n1 = calls.sync.length;
tavo.plugin.config.set('autoUpdate', false); // 原插件设置“每轮自动更新”
await E.loadAiOpts();
ok(E.config().autoSync === false, '设置 autoUpdate=false → 引擎的自动同步关闭');
host.chat.push(msg('阿明', true, '再见。'), msg('林晚', false, '慢走。'));
await bus.emit(ET.MESSAGE_RECEIVED, 4, 'normal');
await rt.idle();
ok(calls.sync.length === n1, '关闭自动同步：新回复不自动分析');
tavo.plugin.config.set('autoUpdate', undefined);
await E.loadAiOpts();
ok(E.config().autoSync === true, '恢复缺省：自动同步打开');

// 分析失败 → 记录失败，安排 90 秒后重试
syncReply = 'error';
host.chat.push(msg('阿明', true, '等等。'), msg('林晚', false, '怎么了？'));
const failId = idOf(host.chat.length - 1);
await bus.emit(ET.MESSAGE_RECEIVED, host.chat.length - 1, 'normal');
await rt.idle();
st = await E.loadState();
const fk = Object.keys(st.meta.autoFail || {}).find((k) => k.startsWith(failId + ':'));
ok(fk && st.meta.autoFail[fk].n === 1, '分析失败：记下失败次数');
ok(timers.some((h) => !h.done && h.ms === 91000), '分析失败：安排 91 秒后自动重试');
syncReply = 'ok';

// ================= C. 注入 =================
// 没有追踪角色 → 扩展提示词为空
await rt.interceptor(host.chat, 8192, () => {}, 'normal');
ok(host.prompts[PROMPT_KEY] && host.prompts[PROMPT_KEY].value === '', '没有追踪角色：注入为空');

// 加一个追踪角色
const add = await E.addTracked('林晚', '林晚，25岁，女性，咖啡店店长。她性格温柔。');
ok(add && add.ok !== false, '手动追踪林晚');
await rt.interceptor(host.chat, 8192, () => {}, 'normal');
let p = host.prompts[PROMPT_KEY];
ok(p && p.value.includes('【身体档案') && p.value.includes('林晚'), '有追踪角色：注入档案块，实际 ' + JSON.stringify(p && p.value.slice(0, 60)));
ok(p.position === 1 && p.depth === 1 && p.role === 0, '默认“放在你的消息之前”→ 聊天内深度 1、system');
ok(!host.chat.some((m) => String(m.mes).includes('【身体档案')), '不改动聊天记录');

// 位置改为“之后”
const inj = await E.loadInject();
await E.saveInject(Object.assign({}, inj, { position: 'after' }));
await rt.interceptor(host.chat, 8192, () => {}, 'normal');
p = host.prompts[PROMPT_KEY];
ok(p.depth === 0, '“放在你的消息之后”→ 深度 0');

// 世界书模式（原插件默认）→ 照样走扩展提示词
await E.saveInject(Object.assign({}, inj, { mode: 'lore', position: 'before' }));
await rt.interceptor(host.chat, 8192, () => {}, 'normal');
p = host.prompts[PROMPT_KEY];
ok(p.value.includes('【身体档案') && p.depth === 1, '世界书模式在移植版里降级为扩展提示词');

// 后台生成不改动已有的扩展提示词
const before = host.prompts[PROMPT_KEY].value;
host.prompts[PROMPT_KEY].value = 'SENTINEL';
await rt.interceptor(host.chat, 8192, () => {}, 'quiet');
ok(host.prompts[PROMPT_KEY].value === 'SENTINEL', 'quiet（后台生成）不注入也不清空');
host.prompts[PROMPT_KEY].value = before;

// 关闭注入 → 清空
await E.saveInject(Object.assign({}, inj, { enabled: false }));
await rt.interceptor(host.chat, 8192, () => {}, 'normal');
ok(host.prompts[PROMPT_KEY].value === '', '关闭注入：清空扩展提示词');
await E.saveInject(Object.assign({}, inj, { enabled: true }));

// 引擎出错不影响生成
const realPrep = E.prepareInjection;
E.prepareInjection = async () => { throw new Error('boom'); };
await rt.interceptor(host.chat, 8192, () => {}, 'normal');
ok(host.prompts[PROMPT_KEY].value === '', '引擎出错：注入为空，生成照常');
E.prepareInjection = realPrep;

// 换聊天：TT 先换掉 chat 数组和 chatMetadata、放进开场白，再发 CHAT_CHANGED，然后 RECEIVED(0, 'first_message')
const oldMeta = host.chatMetadata;
const oldBase = JSON.stringify((await E.loadState()).meta.autoBase);
host.chat = [msg('林晚', false, '（开场白）你推门进来，风铃响了。')];
host.chatMetadata = {};
host.chatId = 'linwan-2';
await bus.emit(ET.CHAT_CHANGED, 'linwan-2');
await rt.idle(); await tick(20);
const n2 = calls.sync.length;
await bus.emit(ET.MESSAGE_RECEIVED, 0, 'first_message');
await rt.idle();
st = await E.loadState();
ok(st.meta.autoBase && st.meta.autoBase.id === idOf(0), '新聊天：开场白记为基线');
ok(calls.sync.length === n2, '新聊天：开场白不自动分析（和原插件一致）');
ok(JSON.stringify(oldMeta['char_physiology'] && oldMeta['char_physiology'].vars['physiology.v1'].meta.autoBase) === oldBase, '旧聊天的存档没被新聊天的基线覆盖');
host.chat.push(msg('阿明', true, '一杯美式。'), msg('林晚', false, '好的。'));
await bus.emit(ET.MESSAGE_RECEIVED, 2, 'normal');
await rt.idle();
ok(calls.sync.length === n2 + 1, '新聊天：第一条 AI 回复照常自动分析');

// ================= D. stop =================
rt.stop();
for (const k of Object.keys(ET)) ok(bus.count(ET[k]) === 0, 'stop 后已解绑 ' + k);
ok(host.prompts[PROMPT_KEY].value === '', 'stop 后清空扩展提示词');

console.log(`runtime OK · ${pass} 项断言通过`);
