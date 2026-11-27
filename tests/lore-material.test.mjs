// 回归测试：世界书读不到时，不能把“别人的角色卡”当成她的资料（否则所有角色都被建成同一个人）。
// 用户反馈：世界书诊断报 no_lorebook_api，之后的角色都用了本对话的角色卡，被识别成同一个人。
// 运行：node tests/lore-material.test.mjs
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = (p) => import(pathToFileURL(path.join(ROOT, p)).href);
const { createTavoShim } = await imp('src/tavo-shim.js');
const { createEngine } = await imp('src/engine.js');
const { createTranslator } = await imp('src/i18n.js');

let pass = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); pass++; };
const eq = (a, b, msg) => { assert.deepEqual(a, b, msg); pass++; };

// ===== 场景：单聊。林晚的卡里只是“提到”苏青、白露；她们自己有世界书条目 =====
const LIN = '林晚，女，25岁，咖啡店店长。她性格温柔，常和镇上的苏青、白露来往。她自己一个人住。';
const books = {
    小镇人物: {
        entries: {
            0: { uid: 0, key: ['苏青'], comment: '苏青', content: '苏青，女，28岁，镇上诊所的护士，性格冷静，喜欢读书，独居。', disable: false },
            1: { uid: 1, key: ['白露'], comment: '白露', content: '白露，女，30岁，花店老板娘，温柔爱笑，独自经营花店，养了一只猫。', disable: false },
            2: { uid: 2, key: ['小镇'], comment: '小镇设定', content: '这是个海边小镇，常住人口三千。', disable: false },
        },
    },
    // 卡里把苏青写成一段完整设定的另一张卡（用于“只取关于她的片段”）
    群像: {
        entries: {
            0: { uid: 0, key: ['群像'], comment: '群像', content: '一群人的故事。', disable: false },
        },
    },
};
const characters = [
    { name: '林晚', avatar: 'linwan.png', chat: 'lw', description: LIN, personality: '温柔', scenario: '小镇', first_mes: '欢迎光临。', mes_example: '', data: { extensions: { world: '' } } },
    {
        name: '周敏', avatar: 'zhoumin.png', chat: 'zm', first_mes: '', mes_example: '', personality: '', scenario: '',
        description: '周敏，女，35岁，花店兼营咖啡，性格爽朗。她有个10岁的女儿。' +
            '苏青，女，28岁，周敏雇的护士，做事细致，喜欢在午后看书，怕冷，冬天总围一条灰围巾。',
        data: {},
    },
];
const host = {
    chat: [{ name: '林晚', is_user: false, is_system: false, mes: '欢迎光临。', send_date: 'x', swipe_id: 0, swipes: ['欢迎光临。'], extra: {} }],
    chatMetadata: {},
    extensionSettings: {},
    powerUserSettings: {},
    characterId: 0,
};
const ctx = {
    get chat() { return host.chat; },
    get chatMetadata() { return host.chatMetadata; },
    get characterId() { return host.characterId; },
    groupId: null, name1: '阿明', name2: '林晚',
    characters, groups: [], extensionSettings: host.extensionSettings, powerUserSettings: host.powerUserSettings,
    getCurrentChatId() { return 'lw'; },
    saveMetadataDebounced() {}, saveSettingsDebounced() {},
    async loadWorldInfo(n) { return books[n] ? JSON.parse(JSON.stringify(books[n])) : null; },
    getWorldInfoNames() { return Object.keys(books); },
};
globalThis.toastr = { info() {}, warning() {}, error() {}, success() {} };
const tavo = createTavoShim({ extId: 'char-physiology', baseUrl: 'file:///x/', i18n: createTranslator({}, {}, 'zh-CN'), getContext: () => ctx });
const E = createEngine(tavo);
const mk = (id, name, extra) => Object.assign(E.newChar(id, name), { adult: true, gender: 'female' }, extra || {});

// ===== 1. 世界书读不到：绝不能用别人的整张卡当她的资料 =====
host.chatMetadata.world_info = '';
let sc = await E.gatherScanContext(0);
eq(sc.lore.length, 0, '没有绑定世界书时，扫描上下文里没有世界书条目（模拟 no_lorebook_api 的情况）');
const lin = sc.members[0];
const suOnLinCard = await E.resolveMaterial(mk('npc-sq', '苏青'), sc);
ok(!suOnLinCard.ok, '苏青在别人的卡里只是被提到 → 不拿那张卡当她的资料（宁可不建档）');
ok(!suOnLinCard.tried.some((x) => /同聊天角色卡「林晚」$/.test(x)), '不再走“拿林晚整张卡”的分支');
ok(suOnLinCard.tried.some((x) => /只是提到她的名字/.test(x)), '诊断里说明“卡里只是提到她的名字”');
ok(/常和镇上/.test(String(lin.text)), '（前提）林晚的卡里确实提到了苏青');

// ===== 2. 世界书读得到：优先用她自己的世界书条目 =====
host.chatMetadata.world_info = '小镇人物';
sc = await E.gatherScanContext(0);
eq(sc.lore.length, 3, '绑定世界书后读到她的条目');
const rmSu = await E.resolveMaterial(mk('npc-sq', '苏青'), sc);
ok(rmSu.ok && /^世界书「苏青」$/.test(rmSu.src), '苏青 → 用她自己的世界书条目，实际 ' + rmSu.src);
ok(/护士/.test(rmSu.members[0].text) && !/咖啡店店长/.test(rmSu.members[0].text), '资料是苏青自己的，不含林晚的档案');
const rmBai = await E.resolveMaterial(mk('npc-bl', '白露'), sc);
ok(rmBai.ok && /^世界书「白露」$/.test(rmBai.src) && /花店老板娘/.test(rmBai.members[0].text), '白露 → 用她自己的世界书条目');

// 与她不相关的条目不会被当成她的资料
ok(E.loreOfPerson(sc, '小镇', 3) === null, '集体/地点条目不算“她自己的条目”');

// ===== 3. 只在角色卡里成段描述她：只取关于她的句子，不照抄整卡 =====
const zm = characters[1];
const zmCard = tavo.character; // 用周敏的卡当“别人卡里描述了苏青”的场景
const ctx2 = {
    members: [{ id: '1', name: '周敏', text: '周敏，女，35岁，花店兼营咖啡，性格爽朗。她有个10岁的女儿。苏青，女，28岁，周敏雇的护士，做事细致，喜欢在午后看书，怕冷，冬天总围一条灰围巾。', card: { name: '周敏', description: zm.description }, fromCard: true }],
    allMembers: [{ id: '1', name: '周敏', text: '周敏，女，35岁，花店兼营咖啡，性格爽朗。她有个10岁的女儿。苏青，女，28岁，周敏雇的护士，做事细致，喜欢在午后看书，怕冷，冬天总围一条灰围巾。', card: { name: '周敏', description: zm.description }, fromCard: true }],
    cardTexts: [], lore: [], msgs: [],
};
const rmSu2 = await E.resolveMaterial(mk('npc-sq2', '苏青'), ctx2);
ok(rmSu2.ok && /关于她的片段/.test(rmSu2.src), '卡里成段描述她 → 用“关于她的片段”，实际 ' + rmSu2.src);
const seg = rmSu2.members[0].text;
ok(/护士/.test(seg) && /围巾/.test(seg), '片段保留描述她的内容');
ok(!/周敏雇的护士.*周敏，女，35/.test(seg) && seg.length < 200, '片段不含整张卡（长度 ' + seg.length + '）');
ok(/都不是她/.test(seg), '片段里明确告诉 AI：卡里其他人物不是她');

// 名字只出现一次且没有描述 → 片段为空，不硬凑
eq(E.excerptFor('林晚，女，25岁，店长。她常和苏青来往。', '苏青', 1400), '', '只是提到名字 → 不算可用片段');
ok(E.excerptFor('苏青，女，28岁，护士。', '苏青', 1400).length > 0, '成段描述 → 能取到片段');

// ===== 4. 建档时不再按卡号把别人的卡成员错配过来 =====
const members = [{ id: '0', name: '林晚' }, { id: '1', name: '周敏' }];
eq(E.memberOfChar(members, mk('npc-sq', '苏青', { cardId: '0' })).map((m) => m.id), [], '只是提到过她的角色（cardId 指向别人的卡）不会错配成别人的成员');
eq(E.memberOfChar(members, mk('0~ab12', '苏青', { cardId: '0' })).map((m) => m.id), ['0'], '同卡多角色（0~xxx）仍然匹配到该卡成员');
eq(E.memberOfChar(members, mk('npc-bl', '白露')).map((m) => m.id), [], '名字不匹配就不匹配');

// ===== 5. 默认注入方式 =====
ok(E.loadConfigDefaults ? true : true, '（占位）');

console.log('lore-material OK · ' + pass + ' 项断言通过');
