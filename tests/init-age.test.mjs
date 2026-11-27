// 回归测试：初始化（建档）时，卡上没写年龄的角色不能因为 AI 猜的年龄 < 18 被判为未成年（minor）。
// 用户反馈：只有一名角色能初始化，其他（扫描时年龄“未写明”）的都显示 minor。
// 运行：node tests/init-age.test.mjs
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { createEngine } = await import(pathToFileURL(path.join(ROOT, 'src/engine.js')).href);

let pass = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); pass++; };

// 角色卡：林晚没写年龄；小雨写明 16 岁；沈玉写明 25 岁
const CARDS = {
    101: { id: 101, name: '林晚', description: '林晚是一位温柔的咖啡店老板娘，喜欢猫，常穿米色长裙。她独自经营着街角的小店。', personality: '温柔', scenario: '', first_mes: '欢迎光临。', mes_example: '' },
    102: { id: 102, name: '小雨', description: '小雨\n年龄：16\n性格活泼，喜欢画画，常去林晚的咖啡店。', personality: '活泼', scenario: '', first_mes: '你好！', mes_example: '' },
    103: { id: 103, name: '沈玉', description: '沈玉，女，年龄：25岁，公司职员，性格冷静干练，下班后常去咖啡店。她是林晚的老顾客。', personality: '冷静', scenario: '', first_mes: '……', mes_example: '' },
};

// AI 桩：每一步都返回“猜的年龄 15”，复核一步再加 childlike / minor 标记（旧代码会因此直接拦下）
let aiCalls = 0;
function fakeAi(prompt) {
    aiCalls++;
    const p = String(prompt);
    if (/STEP 4\/4/.test(p)) return JSON.stringify({ profile: { age: 15, childlike: true, minor: true }, fixes: [] });
    return JSON.stringify({ age: 15, ageWhy: '推测：外表年轻', adult: true, childlike: false, species: '人类', identity: '咖啡店老板娘', body: '纤细', relationship: '单身', occupation: '店主',
        cycle: { length: { v: 28, why: '' }, period: { v: 5, why: '' }, follicular: { v: 14, why: '' }, luteal: { v: 14, why: '' }, ovulationDay: { v: 14, why: '' }, day: { v: 3, why: '' }, regularity: { v: 'regular', why: '' } },
        fertility: 'normal', sources: { age: 'guessed' }, quotes: { age: '' } });
}

const vars = { chat: new Map(), global: new Map() };
const scopeOf = (o) => ((typeof o === 'string' ? o : o && o.scope) === 'global' ? 'global' : 'chat');
const tavo = {
    plugin: { i18n: { t: (k) => k }, on: () => () => {}, config: { all: async () => ({}) } },
    variable: {
        get: async (n, o) => { const v = vars[scopeOf(o)].get(n); return v === undefined ? undefined : JSON.parse(JSON.stringify(v)); },
        set: async (n, v, o) => { vars[scopeOf(o)].set(n, JSON.parse(JSON.stringify(v))); },
        unset: async (n, o) => { vars[scopeOf(o)].delete(n); },
        keys: async (o) => [...vars[scopeOf(o)].keys()],
        list: async (o) => [...vars[scopeOf(o)].entries()].map(([name, value]) => ({ name, value })),
    },
    chat: { current: async () => ({ id: 'chat-age', characters: [{ id: 101 }, { id: 102 }, { id: 103 }] }) },
    character: { get: async (id) => CARDS[Number(id)] || null, find: async () => [] },
    message: { find: async () => [], get: async () => null, count: async () => 0 },
    lorebook: { list: async () => [], entries: async () => [] },
    utils: { toast: async () => {} },
    generate: async (prompt) => fakeAi(prompt),
};
const E = createEngine(tavo);

// ===== 1. 只看卡面原文的判定 =====
ok(E.statedMinorAge(CARDS[101].description, '林晚') === null, '林晚：卡上没写年龄 → 不算未成年');
ok(E.statedMinorAge(CARDS[102].description, '小雨') === 16, '小雨：卡上写明 16 → 未成年');
ok(E.statedMinorAge(CARDS[103].description, '沈玉') === null, '沈玉：卡上写明 25 → 成年');
ok(E.statedMinorAge('周敏有个10岁的女儿，是一位单亲妈妈。', '周敏') === null, '孩子的年龄不算她的');
ok(E.statedMinorAge('王姐照顾着一个8岁的孩子。', '王姐') === null, '照顾的孩子的年龄不算她的');
ok(E.statedMinorAge('艾琳今年24岁。她妹妹艾米12岁。', '艾琳') === null, '写了成年年龄时，别人的小数字不算');
ok(E.statedMinorAge('小雨今年15岁，是个学生。', '小雨') === 15, '“名字+今年15岁”算明确年龄');
ok(E.statedMinorAge('Lily\nage: 17\nA shy girl.', 'Lily') === 17, '英文 age: 17 算明确年龄');

// ===== 2. 扫描：三个人都按卡面处理 =====
await E.scanCharacters();
let st = await E.loadState();
const byName = (nm) => Object.values(st.characters).find((c) => c && c.name === nm);
ok(byName('林晚') && byName('林晚').adult === true && !byName('林晚').skippedReason, '扫描：林晚（没写年龄）正常追踪');
ok(byName('沈玉') && byName('沈玉').adult === true && !byName('沈玉').skippedReason, '扫描：沈玉（25）正常追踪');
ok(byName('小雨') && byName('小雨').skippedReason === 'minor', '扫描：小雨（卡上写明 16）不建档');

// ===== 3. 初始化（4 步建档）：AI 猜 15 岁 + 复核标 childlike，没写年龄的不能被拦 =====
const linId = String(byName('林晚').id);
aiCalls = 0;
const r1 = await E.proposeBaseline(linId, {});
ok(aiCalls > 0, '确实调用了 AI（' + aiCalls + ' 次）');
ok(r1 && r1.code !== 'minor', '林晚：AI 猜 15 岁 / 复核标 childlike → 不再判为未成年，实际 ' + JSON.stringify(r1 && { ok: r1.ok, code: r1.code, detail: String(r1.detail || '').slice(0, 160) }));
if (r1 && r1.ok) {
    ok(!(Number(r1.proposal.age) > 0 && Number(r1.proposal.age) < 18), '林晚：AI 猜的 <18 年龄被丢掉（按未写明处理），实际 ' + r1.proposal.age);
}
st = await E.loadState();
ok(st.characters[linId].adult === true && st.characters[linId].skippedReason !== 'minor', '林晚：初始化后仍是成年、仍在追踪');

// 沈玉：卡上写明 25 → 以卡为准
const shenId = String(byName('沈玉').id);
const r2 = await E.proposeBaseline(shenId, {});
ok(r2 && r2.code !== 'minor', '沈玉：不被拦');
if (r2 && r2.ok) ok(Number(r2.proposal.age) === 25, '沈玉：年龄以卡上写明的 25 为准，实际 ' + r2.proposal.age);

// ===== 4. 批量初始化路径（initCharacters）：同样不能把没写年龄的标成 minor =====
const r3 = await E.initCharacters([linId], { force: true, texts: false, replaceBaseline: true });
st = await E.loadState();
ok(st.characters[linId].skippedReason !== 'minor' && st.characters[linId].adult === true, '批量初始化：林晚不会被标成 minor，结果 ' + JSON.stringify(r3 && { ok: r3.ok, code: r3.code }));

// ===== 5. 卡上写明 <18：手动确认成年之外仍然拦（底线不变） =====
// 小雨在扫描时已被拦下，proposeBaseline 直接返回 untracked，不会请求 AI
aiCalls = 0;
const xiaoId = String(byName('小雨').id);
const r4 = await E.proposeBaseline(xiaoId, {});
ok(r4 && r4.ok === false && aiCalls === 0, '小雨：卡上写明 16 → 不建档，也不请求 AI');

// ===== 6. 旧版存档：初始化时被 AI 误判为 minor 的角色，读档后自动解除（转为“未追踪”） =====
await E.mutate((s2) => {
    const a = E.newChar('301', '白露'); Object.assign(a, { adult: false, skippedReason: 'minor', cardAge: null, profile: { age: 15 } }); s2.characters['301'] = a; // AI 猜的 15 存进了 profile.age
    const b = E.newChar('302', '小青'); Object.assign(b, { adult: false, skippedReason: 'minor', cardAge: 16 }); s2.characters['302'] = b; // 卡上写明 16
    return null;
});
st = await E.loadState();
const bai = Object.values(st.characters).find((c) => c.name === '白露');
const qing = Object.values(st.characters).find((c) => c.name === '小青');
ok(bai.adult === true && bai.skippedReason === null && bai.trackOff === true && bai.migratedFromMinor === true, '旧存档：AI 猜的年龄导致的 minor → 解除，转为未追踪等用户打开');
ok(qing.skippedReason === 'minor' && qing.adult === false, '旧存档：卡上写明 16 → 仍然不建档');

// ===== 7. 错误码有中文说明 =====
ok(/未满 18 岁/.test(E.initReason ? E.initReason({ ok: false, code: 'minor' }, '基线初始化') : '未满 18 岁'), 'minor 错误码有中文说明');

console.log('init-age OK · ' + pass + ' 项断言通过');
