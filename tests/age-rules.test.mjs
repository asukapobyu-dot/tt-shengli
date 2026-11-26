/*
 * 块 2a 验收：年龄检测改造（只认明确的年龄数字 + 手动确认成年 + 旧数据迁移）
 * 运行：node tests/age-rules.test.mjs
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { createEngine } = await import(pathToFileURL(path.join(ROOT, 'src/engine.js')).href);

// ---- 最小 tavo 桩：内存变量存储 ----
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
    chat: { current: async () => ({ id: 'chat-test' }) },
    message: { find: async () => [], get: async () => null, count: async () => 0 },
    utils: { toast: async () => {} },
};
const E = createEngine(tavo);
let pass = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); pass++; };
const card = (name, description) => ({ name, description, personality: '', scenario: '', first_mes: '', mes_example: '' });

// ===== 1. 原来会误判的卡：现在都应判为成年 =====
const falsePositives = [
    ['沈玉卿', '沈玉卿是一名高中英语老师，每天面对一群高中生。'],
    ['林晚', '林晚，未成年学生们的班主任，性格温柔。'],
    ['小雪', '外表看起来像个小女孩的大学生，性格活泼。'],
    ['艾琳', '精灵族少女，种族：精灵。外貌娇小。'],
    ['苏青', '她是个女高中生风格打扮的上班族。'],
    ['萝莉塔', '名字叫萝莉塔的咖啡店老板娘。'],
    ['周敏', '周敏有个10岁的女儿，是一位单亲妈妈。'],
    ['许诺', '年轻的实习生，刚入职不久，少女感十足。'],
];
for (const [name, desc] of falsePositives) {
    const r = E.assessAdult(card(name, desc));
    ok(r.adult === true, `误判回归：「${name}」应判为成年，实际 ${JSON.stringify(r)}`);
}

// ===== 2. 明确年龄数字 =====
ok(E.assessAdult(card('甲', '年龄：25岁')).adult === true, '年龄 25 → 成年');
ok(E.assessAdult(card('乙', '年龄：16')).adult === false, '年龄 16 → 底线拦下');
ok(E.assessAdult(card('乙', '年龄：16')).age === 16, '应带回解析出的年龄');
ok(E.assessAdult(card('丙', '没有写年龄的角色')).adult === true, '无年龄 → 默认成年');
ok(E.assessAdult(card('丁', 'age: 30')).adult === true, '英文 age 30 → 成年');

ok(E.explicitMinorAge(17) === true && E.explicitMinorAge('17') === true, '17 是明确未成年');
ok(E.explicitMinorAge(18) === false && E.explicitMinorAge(null) === false && E.explicitMinorAge('') === false && E.explicitMinorAge(0) === false, '18/空/0 不算');
ok(E.judgeAdult('任何描述 萝莉 小学生 childlike', null).adult === true, 'judgeAdult 不再看描述关键词');
ok(E.judgeAdult('', 15).adult === false, 'judgeAdult 年龄 15 → 拦下');

// ===== 3. 扫描候选判定 minorCheck =====
const ctx = { members: [], cardTexts: [] };
ok(E.minorCheck('沈玉卿', ctx, { card: card('沈玉卿', '高中老师，面对高中生'), text: '' }, { adult: false, childlike: true }) === null, 'AI 的 childlike/adult=false 不再采纳');
ok(E.minorCheck('乙', ctx, { card: card('乙', '年龄：16'), text: '' }, null) === 'card', '卡面年龄 16 → card');
ok(E.minorCheck('戊', ctx, null, { age: 15 }) === 'ai', 'AI 读出的年龄 15 → ai');
ok(E.minorCheck('己', ctx, { card: card('己', '年龄：20'), text: '' }, { age: 15 }) === null, '卡面明确 >=18 时以卡面为准');

// ===== 4. 档案年龄不再被强制改成 18 =====
const pf = E.normalizeProfile({ age: 16 });
ok(pf && pf.age === 16, '档案年龄应保留真实数字（原版会强制改成 18），实际 ' + (pf && pf.age));

// ===== 5. 状态读写：旧数据迁移 + 手动确认成年 =====
const KEY = 'physiology.v1';
const mk = (id, name, extra) => Object.assign(E.newChar(id, name), extra || {});
vars.chat.set(KEY, {
    characters: {
        a: mk('a', '沈玉卿', { adult: false, skippedReason: 'minor' }), // 旧版关键词误判 → 应解锁为未追踪
        b: mk('b', '乙', { adult: false, skippedReason: 'minor', cardAge: 16 }), // 卡面年龄 16 → 仍拦下
        c: mk('c', '丙', { adult: false, skippedReason: 'minor', cardAge: 16, adultConfirmed: { at: 1, age: 22 } }), // 已确认成年
    },
    meta: { rosterConfirmed: true },
});
let st = await E.loadState();
ok(st.characters.a.skippedReason === null && st.characters.a.adult === true, '旧误判角色应解锁');
ok(st.characters.a.trackOff === true && st.characters.a.migratedFromMinor === true, '解锁后为“未追踪”，需用户手动打开');
ok(st.characters.b.skippedReason === 'minor' && st.characters.b.adult === false, '明确年龄 16 的仍被拦');
ok(E.ageBlocked(st.characters.b) === true, 'ageBlocked(b)');
ok(st.characters.c.adult === true && st.characters.c.skippedReason === null, '已确认成年的角色正常');
ok(E.ageBlocked(st.characters.c) === false, '已确认成年不受底线影响');

// 手动确认成年：年龄必须 >= 18
ok((await E.confirmAdult('b', 16)).ok === false, '确认成年时填 16 应拒绝');
ok((await E.confirmAdult('b', 'abc')).ok === false, '确认成年时填非数字应拒绝');
const cr = await E.confirmAdult('b', 19);
ok(cr.ok === true && cr.age === 19, '确认成年 19 → 成功');
st = await E.loadState();
ok(st.characters.b.adult === true && st.characters.b.skippedReason === null, '确认后解除跳过');
ok(st.characters.b.adultConfirmed && st.characters.b.adultConfirmed.age === 19, '记录确认年龄');
ok(st.characters.b.cardAge === 19, '卡面年龄被确认值覆盖');
ok(E.minorCheck('乙', ctx, { card: card('乙', '年龄：16'), text: '' }, { age: 15 }) === null, '确认后扫描不再拦（按名字放行）');

// 取消确认：年龄仍是确认值 19 → 不拦；把年龄改回 16 再取消 → 拦下
ok((await E.revokeAdult('b')).blocked === false, '取消确认但年龄 19 → 不拦');
await E.mutate((s) => { s.characters.b.cardAge = 16; s.characters.b.adultConfirmed = { at: 2, age: 19 }; });
const rv = await E.revokeAdult('b');
ok(rv.ok === true && rv.blocked === true, '年龄 16 且取消确认 → 重新拦下');
st = await E.loadState();
ok(st.characters.b.skippedReason === 'minor', '重新拦下后 skippedReason=minor');

// ===== 6. 手动添加 =====
const add1 = await E.addTracked('沈老师', '高中英语老师，面对一群高中生');
ok(add1 && add1.ok !== false, '手动添加：描述里有“高中生”不应再被拒，实际 ' + JSON.stringify(add1));
const add2 = await E.addTracked('小丁', '年龄：15');
ok(add2 && add2.ok === false && add2.code === 'minor', '手动添加：明确年龄 15 → 拒绝');
const add3 = await E.addTracked('小戊', '年龄：15', { adultConfirmed: { age: 20 } });
ok(add3 && add3.ok !== false, '手动添加：附带确认成年（20）→ 允许，实际 ' + JSON.stringify(add3));

// ===== 7. 发给 AI 的提示词不再要求判断未成年 =====
const src = (await import('node:fs')).readFileSync(path.join(ROOT, 'src/engine.js'), 'utf8')
    .split('\n').filter((l) => !/ORIG_UNUSED|OrigUnused/.test(l)).join('\n');
for (const bad of ['DEFAULT IS ADULT: set "adult":true unless', 'flag a minor ONLY when', 'Return {"minor":true} only if', 'OMIT her entirely', 'a minor must be marked adult:false', 'anyone who is explicitly a minor or childlike']) {
    ok(!src.includes(bad), '提示词残留年龄判断：' + bad);
}

// ===== 8. 档案编辑里改年龄（块 2b）=====
{
    const st0 = await E.loadState();
    // 找一个正常建档、已确认成年的角色，以及一个正常建档、未确认的角色
    const conf = Object.keys(st0.characters).find((k) => st0.characters[k].adultConfirmed && !st0.characters[k].skippedReason);
    ok(!!conf, '前面的步骤里有已确认成年的角色');
    // 已确认成年 → 改成 16：不带 revokeAdult 时拒绝，并返回 minorConfirmed
    let r = await E.editDossier(conf, 'base', { age: 16 });
    ok(r && r.ok === false && r.code === 'minorConfirmed' && r.age === 16, '已确认成年的角色改成 16 岁 → 先要求二次确认');
    let s1 = await E.loadState();
    ok(s1.characters[conf].adultConfirmed && !s1.characters[conf].skippedReason, '未确认前数据不变');
    // 带 revokeAdult：取消确认并停止建档
    r = await E.editDossier(conf, 'base', { age: 16, revokeAdult: true });
    ok(r && r.ok && r.revoked && r.blocked, '二次确认后：取消成年确认');
    s1 = await E.loadState();
    ok(!s1.characters[conf].adultConfirmed && s1.characters[conf].skippedReason === 'minor' && s1.characters[conf].cardAge === 16, '取消后按年龄底线停止建档（cardAge=16）');
    ok(E.ageBlocked(s1.characters[conf]), 'ageBlocked 为 true');
    // 再次确认成年（22 岁）→ 恢复
    r = await E.confirmAdult(conf, 22);
    ok(r && r.ok, '可以重新确认成年');
    s1 = await E.loadState();
    ok(s1.characters[conf].adultConfirmed.age === 22 && !s1.characters[conf].skippedReason, '重新确认后恢复建档');
    // 改成 >=18 的年龄：确认年龄同步
    r = await E.editDossier(conf, 'base', { age: 30 });
    s1 = await E.loadState();
    ok(r && r.ok && s1.characters[conf].adultConfirmed.age === 30 && s1.characters[conf].cardAge === 30, '改成 30 岁 → 确认年龄同步为 30');
    // 未确认的普通角色改成 15：拒绝保存
    const plain = Object.keys(s1.characters).find((k) => !s1.characters[k].adultConfirmed && !s1.characters[k].skippedReason && s1.characters[k].adult);
    ok(!!plain, '有可用于测试的普通角色');
    if (plain) {
        r = await E.editDossier(plain, 'base', { age: 15 });
        ok(r && r.ok === false && r.code === 'minor', '未确认的角色改成 15 岁 → 拒绝保存（code=minor）');
        // 描述里写“学生”“娇小”等词不再拒绝保存
        r = await E.editDossier(plain, 'base', { identity: '大学生，娇小，看起来很稚嫩', age: 20 });
        ok(r && r.ok, '档案描述含“学生/娇小/稚嫩” → 正常保存');
    }
}

console.log('age-rules OK · %d 项断言通过', pass);
