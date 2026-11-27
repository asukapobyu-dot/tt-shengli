/*
 * 块 3 验收：数据适配层（tt-store.js / tt-data.js / tavo-shim.js）
 *
 * 用一个仿 TauriTavern 的 getContext()（聊天数组、chatMetadata、extensionSettings、角色卡、群组、
 * 世界书、用户设定）驱动：
 *   A. 适配层各接口的返回结构
 *   B. 真实引擎（createEngine）通过适配层读写存档、读消息、扫描角色卡
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = (p) => import(pathToFileURL(path.join(ROOT, p)).href);
const { createTavoShim } = await imp('src/tavo-shim.js');
const { NS } = await imp('src/tt-store.js');
const { EXTRA_KEY } = await imp('src/tt-data.js');
const { createTranslator } = await imp('src/i18n.js');
const { createEngine } = await imp('src/engine.js');

let pass = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); pass++; };
const eq = (a, b, msg) => { assert.deepEqual(a, b, msg); pass++; };
const rejects = async (p, re, msg) => { let err = null; try { await p; } catch (e) { err = e; } assert.ok(err && re.test(String(err.message) + ' ' + (err.code || '')), msg + '（实际：' + (err && err.message) + '）'); pass++; };

// ---------------- 仿宿主 ----------------
const saves = { meta: 0, settings: 0 };
const books = {
    '城市设定': { entries: { 0: { uid: 0, key: ['林晚'], comment: '林晚', content: '林晚，25岁，咖啡店店长，成年女性。', disable: false }, 1: { uid: 1, key: ['旧条目'], comment: '停用', content: '不该读到', disable: true } } },
    '苏青的书': { entries: { 0: { uid: 0, key: ['苏青'], comment: '苏青', content: '苏青是一名28岁的护士。', disable: false } } },
};
const characters = [
    { name: '林晚', avatar: 'linwan.png', chat: 'linwan - 2025-1-1', description: '林晚，25岁，女性，咖啡店店长。她性格温柔。', personality: '温柔', scenario: '', first_mes: '欢迎光临。', mes_example: '', data: { creator_notes: '', alternate_greetings: ['你来啦'], extensions: { world: '城市设定' } } },
    { name: '苏青', avatar: 'suqing.png', chat: 'suqing - 2025-1-2', shallow: true, data: { extensions: { world: '苏青的书' } } },
    { name: '路人甲', avatar: 'lurenjia.png', chat: 'x', description: '男，40岁。', data: {} },
];
const fullSuqing = { description: '苏青，28岁，女性，护士。她很冷静。', personality: '冷静', scenario: '医院', first_mes: '请坐。', mes_example: '', data: { extensions: { world: '苏青的书' }, alternate_greetings: [] } };
const groups = [{ id: 'g1', name: '咖啡店', members: ['linwan.png', 'suqing.png'], chat_id: 'g1-chat' }];
const msg = (name, isUser, mes, extra) => Object.assign({ name, is_user: isUser, is_system: false, mes, send_date: '2025-01-01 10:00', swipe_id: 0, swipes: [mes], extra: {} }, extra || {});

const host = {
    characterId: 0,
    groupId: null,
    chat: [],
    chatMetadata: {},
    extensionSettings: {},
    name1: '阿明',
    name2: '林晚',
    powerUserSettings: { persona_description: '阿明，男，30岁，常客。' },
};
function openChat(kind) {
    // 宿主切换聊天：整体替换 chat 数组和 chatMetadata 对象（与 TT 一致）
    if (kind === 'linwan') {
        Object.assign(host, { characterId: 0, groupId: null, name2: '林晚' });
        host.chat = [msg('林晚', false, '欢迎光临。'), msg('阿明', true, '来杯拿铁。'), msg('林晚', false, '好的，请稍等。')];
        host.chatMetadata = host.__metaLinwan || (host.__metaLinwan = {});
    } else if (kind === 'group') {
        Object.assign(host, { characterId: undefined, groupId: 'g1', name2: '' });
        host.chat = [msg('林晚', false, '欢迎。', { original_avatar: 'linwan.png' }), msg('阿明', true, '你们好。'), msg('苏青', false, '嗯。', { original_avatar: 'suqing.png' }), msg('苏青', false, '老消息没有头像字段')];
        host.chatMetadata = host.__metaGroup || (host.__metaGroup = { world_info: '城市设定' });
    } else {
        Object.assign(host, { characterId: undefined, groupId: null, name2: '' });
        host.chat = [];
        host.chatMetadata = {};
    }
}
const ctx = {
    get chat() { return host.chat; },
    get chatMetadata() { return host.chatMetadata; },
    get characterId() { return host.characterId; },
    get groupId() { return host.groupId; },
    get name1() { return host.name1; },
    get name2() { return host.name2; },
    characters,
    groups,
    extensionSettings: host.extensionSettings,
    powerUserSettings: host.powerUserSettings,
    getCurrentChatId() { return host.groupId ? groups.find((g) => g.id === host.groupId).chat_id : (host.characterId !== undefined ? characters[host.characterId].chat : undefined); },
    saveMetadataDebounced() { saves.meta++; },
    saveSettingsDebounced() { saves.settings++; },
    async unshallowCharacter(i) { if (characters[i] && characters[i].shallow) { Object.assign(characters[i], fullSuqing); delete characters[i].shallow; } },
    async loadWorldInfo(name) { return books[name] ? JSON.parse(JSON.stringify(books[name])) : null; },
};
const getContext = () => ctx;
const toasts = [];
globalThis.toastr = { info: (m) => toasts.push(['info', m]), warning: (m) => toasts.push(['warning', m]), error: (m) => toasts.push(['error', m]), success: (m) => toasts.push(['success', m]) };
const i18n = createTranslator({ hi: '你好 {name}' }, {}, 'zh-CN');
const tavo = createTavoShim({ extId: 'char-physiology', baseUrl: 'file:///x/', i18n, getContext });

// ================= A. 适配层接口 =================
// ---- A1 变量：没有聊天时 ----
openChat('none');
await rejects(tavo.variable.set('physiology.v1', { a: 1 }), /chat_runtime_not_ready|conflict/, '没有打开的聊天时，聊天变量写入报“未就绪”');
await rejects(tavo.variable.get('physiology.v1'), /chat_runtime_not_ready|conflict/, '没有打开的聊天时，聊天变量读取报“未就绪”');
await tavo.variable.set('physiology.ai.v1', { model: 'x' }, { scope: 'global' });
eq(await tavo.variable.get('physiology.ai.v1', 'global'), { model: 'x' }, '全局变量不依赖聊天');
ok(host.extensionSettings[NS].vars['physiology.ai.v1'].model === 'x' && saves.settings === 1, '全局变量存在 extensionSettings 并触发保存');

// ---- A2 变量：聊天作用域，三种写法 ----
openChat('linwan');
await tavo.variable.set('physiology.v1', { characters: {}, n: 1 });
await tavo.variable.set('physiology.log.v1', [1, 2], 'chat');
await tavo.variable.set({ name: 'physiology.aierr.v1', value: { e: 1 }, scope: 'chat' });
ok(host.chatMetadata[NS].vars['physiology.v1'].n === 1, '聊天变量存进 chatMetadata');
ok(saves.meta === 3, '每次写入都请求保存聊天元数据');
const got = await tavo.variable.get({ name: 'physiology.v1', scope: 'chat' });
got.n = 999;
ok((await tavo.variable.get('physiology.v1')).n === 1, '读出来的是副本，改它不影响存档');
eq((await tavo.variable.keys({ scope: 'chat' })).sort(), ['physiology.aierr.v1', 'physiology.log.v1', 'physiology.v1'], 'keys() 列出本聊天变量');
ok((await tavo.variable.list('chat')).length === 3, 'list() 返回 {name,value}');
await tavo.variable.unset('physiology.log.v1', { scope: 'chat' });
ok((await tavo.variable.get('physiology.log.v1')) === undefined, 'unset 删除变量');

// ---- A3 切换聊天：数据隔离 ----
openChat('group');
ok((await tavo.variable.get('physiology.v1')) === undefined, '切到群聊后看不到单聊的存档');
await tavo.variable.set('physiology.v1', { characters: {}, n: 2 });
openChat('linwan');
ok((await tavo.variable.get('physiology.v1')).n === 1, '切回单聊，存档还在且没被群聊覆盖');
ok(host.__metaGroup[NS].vars['physiology.v1'].n === 2, '群聊存档存在群聊自己的元数据里');

// ---- A4 消息：稳定 ID ----
const all = await tavo.message.find({});
eq(all.map((m) => m.index), [0, 1, 2], 'find({}) 按楼层顺序返回全部');
ok(all.every((m) => /^m[a-z0-9]+$/.test(m.id)), '每条消息都有稳定 ID');
ok(host.chat[0].extra[EXTRA_KEY] === all[0].id, 'ID 存在 message.extra 里（随聊天保存）');
ok(new Set(all.map((m) => m.id)).size === 3, 'ID 互不相同');
const [m0, m1, m2] = all;
ok(m1.isUser && m1.role === 'user' && !m0.isUser && m0.role === 'assistant', 'isUser / role 正确');
ok(m0.characterId === '0' && m1.characterId === null, '单聊里角色消息归当前角色，用户消息无角色');
ok(m2.text === '好的，请稍等。' && m2.content === m2.text, 'text / content 是当前正文');
eq((await tavo.message.find([-2, -1])).map((m) => m.index), [1, 2], 'find([-2,-1]) 取最后两条');
eq((await tavo.message.find({ range: [0, 0] })).map((m) => m.index), [0], 'find({range:[0,0]}) 取第一条');
eq((await tavo.message.find([5, 9])).length, 0, '越界区间返回空数组');
ok((await tavo.message.count({})) === 3, 'count() 返回楼层数');
ok((await tavo.message.get(m2.id)).index === 2, 'get(id) 找到消息');
ok((await tavo.message.get({ index: 1 })).id === m1.id, 'get({index}) 找到消息');
ok((await tavo.message.get('不存在')) === null, '不存在的 ID 返回 null');

// 删掉第 1 层：后面楼层下标变了，但 ID 不变
host.chat.splice(1, 1);
const g2 = await tavo.message.get(m2.id);
ok(g2 && g2.index === 1 && g2.text === '好的，请稍等。', '删掉前面的楼层后，按 ID 仍能找到原消息（下标 2→1）');
ok((await tavo.message.get(m1.id)) === null, '被删的消息按 ID 找不到');
// 中间插入（长度不变的替换）：索引过期也能找对
host.chat.splice(0, 1, msg('林晚', false, '换了开场白'));
ok((await tavo.message.get(m2.id)).index === 1, '首条被替换后，按 ID 仍找到正确楼层');
// 复制楼层：重复 ID 会重新分配
host.chat.push(JSON.parse(JSON.stringify(host.chat[1])));
const after = await tavo.message.find({});
ok(new Set(after.map((m) => m.id)).size === after.length, '复制出来的楼层拿到新 ID，不与原楼层重复');
ok(after[1].id === m2.id, '原楼层保留原 ID');
// 隐藏消息
host.chat[2].is_system = true;
ok((await tavo.message.get({ index: 2 })).hidden === true, '被隐藏的消息 hidden=true');
// swipe：宿主整体替换 extra → 新 ID
const before = (await tavo.message.get({ index: 1 })).id;
host.chat[1].extra = {}; host.chat[1].mes = '换了一个回复'; host.chat[1].swipe_id = 1;
const sw = await tavo.message.get({ index: 1 });
ok(sw.id !== before && sw.swipeId === 1, '换 swipe 后是新 ID（引擎会把它当新回复）');

// ---- A5 群聊：说话人、成员 ----
openChat('group');
const gm = await tavo.message.find({});
eq(gm.map((m) => m.characterId), ['0', null, '1', '1'], '群聊按 original_avatar / 名字识别说话人');
const gchat = await tavo.chat.current();
ok(gchat.id === 'g1-chat' && gchat.group === true, '群聊 chat.current() 的 ID 是群聊文件');
eq(gchat.characters.map((c) => c.id), ['0', '1'], '群聊成员 = 群组 members');
eq(gchat.lorebooks.map((b) => b.id), ['城市设定', '苏青的书'], '世界书：聊天绑定 + 角色主世界书（去重）');
ok(gchat.persona && gchat.persona.name === '阿明' && /常客/.test(gchat.persona.description), 'persona 取 name1 + 用户设定描述');

// ---- A6 角色卡 ----
const c0 = await tavo.character.get(0);
ok(c0.id === '0' && c0.name === '林晚' && /25岁/.test(c0.description) && c0.first_mes === '欢迎光临。', 'character.get(0) 返回卡片字段');
eq(c0.alternate_greetings, ['你来啦'], '备用开场白来自 data.alternate_greetings');
ok(characters[1].shallow === true, '苏青的卡是懒加载状态');
const c1 = await tavo.character.get('1');
ok(c1.name === '苏青' && /护士/.test(c1.description) && !characters[1].shallow, '读卡前补全懒加载字段');
ok((await tavo.character.get('suqing.png')).name === '苏青', '也能按头像文件名找角色');
ok((await tavo.character.get(99)) === null, '不存在的角色返回 null');
eq((await tavo.character.find('苏', { match: 'contains' })).map((x) => x.id), ['1'], 'character.find 按名字包含查找');

// ---- A7 世界书（只读）----
const b0 = await tavo.lorebook.get('城市设定');
ok(b0 && b0.entries.length === 2 && b0.entries[0].keys[0] === '林晚' && b0.entries[1].enabled === false, 'lorebook.get 返回条目（含启用状态）');
ok((await tavo.lorebook.get('不存在')) === null, '不存在的世界书返回 null');
ok(typeof tavo.lorebook.create !== 'function' && typeof tavo.lorebook.update !== 'function', '不提供写世界书（引擎会改走注入）');
await rejects(tavo.chat.update({ lorebooks: [] }), /unsupported|不可用/, 'chat.update 不可用');
ok((await tavo.chat.get('别的聊天')) === undefined, 'chat.get 对其他聊天返回“不确定”（引擎不会误删）');

// ---- A8 persona / toast / i18n ----
ok((await tavo.persona.get('p:阿明')).name === '阿明', 'persona.get');
await tavo.utils.toast('已保存');
await tavo.utils.toast('保存失败：磁盘满');
ok(toasts[0][0] === 'info' && toasts[1][0] === 'warning', 'toast：普通消息用 info，失败类用 warning');
ok(tavo.plugin.i18n.t('hi', { name: 'A' }) === '你好 A', 'plugin.i18n.t');

// ================= B. 真实引擎 =================
openChat('linwan');
host.__metaLinwan = host.chatMetadata = {};
host.chat = [msg('林晚', false, '欢迎光临。'), msg('阿明', true, '来杯拿铁。'), msg('林晚', false, '好的，请稍等。')];
const E = createEngine(tavo);

// B1 存档读写
let st = await E.loadState();
ok(st && st.characters && Object.keys(st.characters).length === 0, '引擎读到空存档');
await E.mutate((s) => { s.meta.rosterConfirmed = true; return null; });
ok(host.chatMetadata[NS].vars['physiology.v1'].meta.rosterConfirmed === true, '引擎存档写进当前聊天的 chatMetadata');

// B2 扫描角色卡建档（不走 AI）
const r = await E.scanCharacters({});
st = await E.loadState();
const names = Object.values(st.characters).map((c) => c.name);
ok(names.includes('林晚'), '扫描角色卡后“林晚”建档：' + JSON.stringify(r && r.added));
const lw = Object.values(st.characters).find((c) => c.name === '林晚');
ok(lw.adult === true && !lw.skippedReason, '25 岁的林晚正常建档');

// B3 读消息（引擎内部的 recentMessages / getMessage / latestFloorState）
const lf = await E.latestFloorState(st);
ok(lf && lf.id === host.chat[2].extra[EXTRA_KEY] && lf.done === false, 'latestFloorState 找到最后一条角色回复（稳定 ID），尚未处理');
const gm2 = await E.getMessage(lf.id);
ok(gm2 && gm2.text === '好的，请稍等。', 'getMessage(id) 通过适配层读到正文');

// B4 切换聊天：引擎读到的是另一个聊天的存档
openChat('group');
const stG = await E.loadState();
ok(!Object.values(stG.characters).some((c) => c.name === '林晚' && c.cardId === '0' && c.lastProcessedMessageId), '群聊里读到的是群聊自己的存档');
openChat('linwan');
ok(Object.values((await E.loadState()).characters).some((c) => c.name === '林晚'), '切回单聊，林晚的档案还在');

// B5 用户设定建档（添加我）
const ap = await E.addPersona();
ok(ap && ap.name === '阿明', 'addPersona 读到用户设定：' + JSON.stringify(ap));

// B6 写入途中切换聊天：数据不能写进别的聊天
{
    openChat('linwan');
    const metaLinwan = host.chatMetadata;
    const before = JSON.stringify(metaLinwan[NS].vars['physiology.v1'].characters);
    let threw = null;
    try {
        await E.mutate(async (s) => {
            // 模拟：引擎读完存档、正在计算时，用户切到了群聊
            openChat('group');
            s.meta.note = '本来要写进单聊';
            return null;
        });
    } catch (e) { threw = e; }
    const gv = host.__metaGroup[NS] && host.__metaGroup[NS].vars['physiology.v1'];
    ok(!(gv && gv.meta && gv.meta.note), '切换聊天后，单聊的数据没有写进群聊：' + (threw ? threw.message : '无异常'));
    ok(JSON.stringify(metaLinwan[NS].vars['physiology.v1'].characters) === before, '单聊存档保持原样');
    ok(threw && (threw.code === 'conflict' || /chat_runtime_not_ready/.test(threw.message)), '调用方收到“聊天切换中”错误（引擎会按原逻辑重试/放弃）');
    // 正常路径不受影响
    openChat('linwan');
    await E.mutate((s) => { s.meta.note2 = 'ok'; return null; });
    ok(host.chatMetadata[NS].vars['physiology.v1'].meta.note2 === 'ok', '不切换聊天时照常写入');
    ok(!('__chatId' in JSON.parse(JSON.stringify(host.chatMetadata[NS].vars['physiology.v1']))), '绑定用的聊天 ID 不会写进存档');
}

console.log('tt-data OK · %d 项断言通过', pass);

// ---- A9 全局勾选的世界书 / 用户设定世界书 ----
// 酒馆里全局勾选的世界书存放在核心模块（world-info.js 的 selected_world_info），getContext() 没有暴露；
// 适配层用动态 import 读它，读不到就降级。这里用注入假模块的方式验证拼接顺序。
{
    const dataMod = await imp('src/tt-data.js');
    ok(typeof dataMod.createDataApi === 'function', 'createDataApi 可用');
    // 用户设定世界书
    host.powerUserSettings.persona_description_lorebook = '阿明设定'; // ctx 持有同一个对象，就地改
    openChat('linwan');
    host.chatMetadata = {};
    const cur0 = await tavo.chat.current();
    ok(cur0.lorebooks.map((b) => b.id).indexOf('阿明设定') >= 0, '用户设定里的世界书会被读到（实际 ' + cur0.lorebooks.map((b) => b.id).join('、') + '）');
    delete host.powerUserSettings.persona_description_lorebook;
}

