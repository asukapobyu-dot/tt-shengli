// 暂停追踪：引擎行为（日期推断、开关、暂停时不注入、读档保留）
// 运行时的暂停行为在 tests/runtime.test.mjs 的 C2 段验证。
// 运行：node tests/pause.test.mjs
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = (p) => import(pathToFileURL(path.join(ROOT, p)).href);
const { createTavoShim } = await imp('src/tavo-shim.js');
const { createEngine } = await imp('src/engine.js');

let pass = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); pass++; };
const eq = (a, b, msg) => { assert.deepEqual(a, b, msg); pass++; };

// ---------------- 仿宿主（可用的变量仓，能真的存读）----------------
const store = { chat: new Map(), global: new Map() };
const scopeOf = (o) => ((typeof o === 'string' ? o : o && o.scope) === 'global' ? 'global' : 'chat');
const messages = [
    { id: 0, name: '林晚', is_user: false, is_system: false, mes: '欢迎光临。', extra: {} },
    { id: 1, name: '阿明', is_user: true, is_system: false, mes: '来杯拿铁。', extra: {} },
];
const characters = [{ name: '林晚', avatar: 'linwan.png', chat: 'lw', description: '林晚，女，25岁，咖啡店店长。她性格温柔。', personality: '', scenario: '', first_mes: '', mes_example: '', data: {} }];
const host = { chatMetadata: {}, extensionSettings: {}, powerUserSettings: {} };
const tavo = {
    plugin: { i18n: { t: (k) => k }, on: () => () => {}, config: { all: async () => ({}) } },
    variable: {
        get: async (n, o) => { const v = store[scopeOf(o)].get(n); return v === undefined ? undefined : JSON.parse(JSON.stringify(v)); },
        set: async (n, v, o) => { store[scopeOf(o)].set(n, JSON.parse(JSON.stringify(v))); },
        unset: async (n, o) => { store[scopeOf(o)].delete(n); },
        keys: async (o) => [...store[scopeOf(o)].keys()],
        list: async (o) => [...store[scopeOf(o)].entries()].map(([name, value]) => ({ name, value })),
    },
    chat: { current: async () => ({ id: 'lw', characters: [{ id: 0 }] }) },
    character: { get: async (id) => characters[Number(id)] || null, find: async () => [] },
    message: { find: async () => messages, get: async (id) => messages.find((m) => String(m.id) === String(id)) || null, count: async () => messages.length },
    utils: { toast: async () => {} },
};
const E = createEngine(tavo);

// ---------------- A. 日期推断（纯本地，不调 AI） ----------------
const cur = '2025-03-10';
eq(E.dateAdvanceFrom('第二天早上，她醒来。', cur).date, '2025-03-11', '“第二天” → +1 天');
eq(E.dateAdvanceFrom('次日，雨停了。', cur).date, '2025-03-11', '“次日” → +1 天');
eq(E.dateAdvanceFrom('隔天她去了店里。', cur).date, '2025-03-11', '“隔天” → +1 天');
eq(E.dateAdvanceFrom('后天就要出发了。', cur).date, '2025-03-12', '“后天” → +2 天');
eq(E.dateAdvanceFrom('三天后，他回来了。', cur).date, '2025-03-13', '“三天后” → +3 天');
eq(E.dateAdvanceFrom('一周后', cur).date, '2025-03-17', '“一周后” → +7 天');
eq(E.dateAdvanceFrom('两周以后', cur).date, '2025-03-24', '“两周以后” → +14 天');
eq(E.dateAdvanceFrom('三个星期后', cur).date, '2025-03-31', '“三个星期后” → +21 天');
eq(E.dateAdvanceFrom('一个月后', cur).date, '2025-04-09', '“一个月后” → +30 天');
ok(E.dateAdvanceFrom('今天天气不错。', cur) === null, '“今天”不算日期变更');
ok(E.dateAdvanceFrom('她笑了笑，递上咖啡。', cur) === null, '没有时间线索 → 不改日期');
ok(E.dateAdvanceFrom('我推门进来，点了杯拿铁。', cur) === null, '玩家的动作 → 不改日期');
ok(E.dateAdvanceFrom('', cur) === null, '空消息 → 不改日期');
eq(E.dateAdvanceFrom('2025年4月2日，她的生日。', cur).date, '2025-04-02', '写明完整日期 → 用那个日期');
eq(E.dateAdvanceFrom('4月2日，晴。', cur).date, '2025-04-02', '只写月日 → 今年同一天');
ok(E.dateAdvanceFrom('3月1日，她回忆起那天。', cur) === null, '写明月日但已经过去 → 不往回改');
ok(E.dateAdvanceFrom('2025-13-40', cur) === null, '非法日期不采纳');
eq(E.dateAdvanceFrom('90天后', cur).date, '2025-06-08', '“90天后” → +90 天');
eq(E.dateAdvanceFrom('999天后', cur).days, 90, '一条消息最多推进 90 天（防误读造成离谱跳转）');

// ---------------- B. 开关与读档 ----------------
let st = await E.loadState();
ok(E.isPausedState(st) === false, '默认不暂停');
await E.setPaused(true);
st = await E.loadState();
ok(st.meta.paused === true && E.isPausedState(st), 'setPaused(true) 生效且能读回来');
ok(typeof st.meta.pausedAt === 'number', '记下暂停时间');
await E.setPaused(true);
st = await E.loadState();
ok(st.meta.paused === true, '重复暂停不报错');
await E.setPaused(false);
st = await E.loadState();
ok(st.meta.paused === false && !E.isPausedState(st), 'setPaused(false) 恢复');
ok(st.meta.pausedAt === undefined, '恢复后清掉暂停时间');

// ---------------- C. 暂停时不注入 ----------------
await E.addTracked('林晚', '林晚，25岁，女性，咖啡店店长。她性格温柔。');
const inj = Object.assign(await E.loadInject(), { enabled: true, mode: 'prefix' });
let r = await E.prepareInjection({ text: '来杯拿铁。', source: 'send' }, { inj });
ok(r.path === 'prefix' && /【身体档案/.test(r.block), '未暂停：正常生成档案块');
await E.setPaused(true);
r = await E.prepareInjection({ text: '来杯拿铁。', source: 'send' }, { inj });
ok(r.path === 'paused' && r.block === '', '暂停：注入块为空（不污染上下文）');
ok(r.text === '来杯拿铁。', '暂停：用户原文原样返回');
await E.setPaused(false);
r = await E.prepareInjection({ text: '来杯拿铁。', source: 'send' }, { inj });
ok(r.path === 'prefix' && /【身体档案/.test(r.block), '恢复后又能注入');

// ---------------- D. 暂停期间只推进日期 ----------------
await E.mutate((s) => { s.story = s.story || { date: null, auto: true }; s.story.date = '2025-03-10'; s.story.auto = false; return null; });
eq((await E.pausedTick(0)).code, 'not_paused', '未暂停时 pausedTick 直接拒绝');
await E.setPaused(true);
messages.push({ id: 2, name: '林晚', is_user: false, is_system: false, mes: '第二天早上，林晚已经在店里忙活了。', extra: {} });
let t = await E.pausedTick(2);
ok(t.ok && t.changed && t.date === '2025-03-11' && t.from === '2025-03-10', '暂停中：按“第二天”把日期推进一天，实际 ' + JSON.stringify(t));
st = await E.loadState();
ok(st.story.date === '2025-03-11' && st.story.auto === false, '剧情日期已写入，且标记为手动');
// 日志存在独立的日志变量里（E.getLog），不在 st.log
const lg = typeof E.getLog === 'function' ? await E.getLog({}) : null;
const lgList = Array.isArray(lg) ? lg : (lg && Array.isArray(lg.entries) ? lg.entries : []);
ok(lgList.some((x) => x && x.type === '日期变更'), '日志里留一条“日期变更”，实际 ' + lgList.slice(-2).map((x) => x && x.type).join('、'));
// 同一条消息重复处理不会重复推进
t = await E.pausedTick(2);
ok(t.ok && !t.changed, '同一条消息再算一次：日期不再重复推进');
messages.push({ id: 3, name: '林晚', is_user: false, is_system: false, mes: '她递给你一杯拿铁，笑了笑。', extra: {} });
t = await E.pausedTick(3);
ok(t.ok && !t.changed, '没有日期线索的消息：不改日期');
st = await E.loadState();
ok(st.story.date === '2025-03-11', '日期保持不变');
// 玩家自己写的时间推进也算
messages.push({ id: 4, name: '阿明', is_user: true, is_system: false, mes: '（三天后）我又来到店里。', extra: {} });
t = await E.pausedTick(4);
ok(t.ok && t.date === '2025-03-14', '玩家消息里的“三天后”也会推进日期，实际 ' + (t && t.date));

console.log('pause OK · ' + pass + ' 项断言通过');
