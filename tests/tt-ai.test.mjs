/*
 * 块 4 验收：AI 通道（tt-ai.js）+ 图像存储（tt-files.js）+ 插件设置（plugin.config）
 *
 *   A. 酒馆当前 API（generateRaw）与连接配置（ConnectionManagerRequestService）
 *   B. 自定义 API：浏览器直连；跨域被拦时经 TT 后端转发（/api/backends/chat-completions/generate|status）
 *   C. 图像：/api/files/upload|delete，路径 /user/files/charphys-…
 *   D. 真实引擎：testApi / listModels / 识别请求 走完整链路
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = (p) => import(pathToFileURL(path.join(ROOT, p)).href);
const { createTavoShim, CONFIG_DEFAULTS } = await imp('src/tavo-shim.js');
const { NS } = await imp('src/tt-store.js');
const { safeName } = await imp('src/tt-files.js');
const { createTranslator } = await imp('src/i18n.js');
const { createEngine } = await imp('src/engine.js');

let pass = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); pass++; };
const eq = (a, b, msg) => { assert.deepEqual(a, b, msg); pass++; };
const rejects = async (p, re, msg) => { let err = null; try { await p; } catch (e) { err = e; } assert.ok(err && re.test(String(err.message) + ' ' + (err.code || '') + ' ' + (err.detail || '')), msg + '（实际：' + (err && err.message) + '）'); pass++; return err; };

// ---------------- 仿宿主 ----------------
const calls = { raw: [], profile: [], fetch: [] };
let rawReply = 'ok';
let rawError = null;
let profileReply = '{"ok":1}';
const profiles = [{ id: 'p1', name: '分析用 DeepSeek', mode: 'cc' }];
const extensionSettings = {};
const files = new Map(); // '/user/files/x' -> base64
const ctx = {
    chat: [{ name: '林晚', is_user: false, mes: '你好。', extra: {} }],
    chatMetadata: {},
    characters: [{ name: '林晚', avatar: 'linwan.png', chat: 'c1', description: '林晚，25岁，女性。她是店长。', data: {} }],
    characterId: 0,
    groupId: null,
    name1: '阿明',
    extensionSettings,
    powerUserSettings: { persona_description: '' },
    getCurrentChatId: () => 'c1',
    saveMetadataDebounced() {},
    saveSettingsDebounced() {},
    getRequestHeaders: () => ({ 'Content-Type': 'application/json', 'X-CSRF-Token': 't' }),
    getThumbnailUrl: (type, file) => '/thumbnail?type=' + type + '&file=' + encodeURIComponent(file),
    async generateRaw(o) { calls.raw.push(o); if (rawError) throw rawError; return rawReply; },
    ConnectionManagerRequestService: {
        getSupportedProfiles: () => profiles,
        async sendRequest(id, prompt, maxTokens, custom, override) { calls.profile.push({ id, prompt, maxTokens, custom, override }); return { content: profileReply, reasoning: '' }; },
    },
};
const getContext = () => ctx;

// 仿网络：外部地址可配置为“跨域拦截”或正常；酒馆后端路由由仿后端处理
const net = { corsBlocked: true, upstream: [] };
const json = (status, obj) => ({ ok: status >= 200 && status < 300, status, headers: { get: (k) => (/content-type/i.test(k) ? 'application/json' : null) }, text: async () => JSON.stringify(obj), json: async () => obj, blob: async () => new Blob([JSON.stringify(obj)]) });
globalThis.fetch = async (url, init = {}) => {
    const u = String(url);
    calls.fetch.push({ url: u, init });
    if (u === '/api/backends/chat-completions/generate') {
        const b = JSON.parse(init.body);
        net.upstream.push(b);
        if (b.chat_completion_source !== 'custom') return json(400, { error: { message: 'bad source' } });
        if (!/Authorization: "Bearer sk-test"/.test(b.custom_include_headers || '')) return json(502, { error: { message: 'Unauthorized: missing key' } });
        return json(200, { choices: [{ message: { content: '{"characters":[],"via":"relay"}' }, finish_reason: 'stop' }] });
    }
    if (u === '/api/backends/chat-completions/status') {
        const b = JSON.parse(init.body);
        net.upstream.push(b);
        return json(200, { data: [{ id: 'deepseek-chat' }, { id: 'deepseek-reasoner' }] });
    }
    if (u === '/api/files/upload') {
        const b = JSON.parse(init.body);
        if (!/^[A-Za-z0-9_.-]+$/.test(b.name) || b.name.startsWith('.')) return json(400, { error: 'Illegal character in filename' });
        files.set('/user/files/' + b.name, b.data);
        return json(200, { path: '/user/files/' + b.name });
    }
    if (u === '/api/files/delete') {
        const b = JSON.parse(init.body);
        if (!files.has(b.path)) return json(404, { error: 'File not found' });
        files.delete(b.path);
        return json(200, { ok: true });
    }
    if (/^https:\/\/api\.example\.com\//.test(u)) {
        if (net.corsBlocked) throw new TypeError('Failed to fetch');
        if (/\/models$/.test(u)) return json(200, { data: [{ id: 'direct-model' }] });
        return json(200, { choices: [{ message: { content: '{"characters":[],"via":"direct"}' }, finish_reason: 'stop' }] });
    }
    throw new Error('unexpected fetch ' + u);
};
globalThis.toastr = { info() {}, warning() {}, error() {}, success() {} };

const i18n = createTranslator({}, {}, 'zh-CN');
const tavo = createTavoShim({ extId: 'char-physiology', baseUrl: 'file:///x/', i18n, getContext });

// ================= A. 酒馆模型 =================
ok(typeof tavo.generate === 'function', 'tavo.generate 已提供（引擎据此判断可用 AI）');
const out = await tavo.generate('Reply with exactly one word: ok', { timeout: 30000, context: false, settings: { temperature: 0.1, maxCompletionTokens: 64 } });
ok(out === 'ok', '默认通道：generateRaw 返回文字');
ok(calls.raw.length === 1 && calls.raw[0].prompt.startsWith('Reply') && calls.raw[0].responseLength === 64, 'generateRaw 收到提示词和最大回复长度');
ok(calls.raw[0].trimNames === false, '不裁剪“名字:”前缀（JSON 输出不受影响）');

rawError = new Error('API request failed', { cause: new Error('401 Unauthorized: invalid key') });
const e1 = await rejects(tavo.generate('x', {}), /401 Unauthorized/, '宿主多层报错被摊平成一句话');
ok(e1.detail && /酒馆当前 API/.test(e1.detail), '报错注明是哪个通道');
rawError = { error: { message: 'Rate limit exceeded (429)' } }; // 宿主可能直接 throw response.json()
await rejects(tavo.generate('x', {}), /Rate limit exceeded/, '宿主抛出普通对象也能读出原因');
rawError = new Error('Request timed out');
const e2 = await rejects(tavo.generate('x', {}), /timed out/, '超时报错');
ok(e2.code === 'timeout', '超时归类为 timeout');
rawError = null;

// 连接配置
const rawBefore = calls.raw.length;
extensionSettings[NS] = { ai: { channel: 'profile', profileId: 'p1' } };
const out2 = await tavo.generate('分析', { settings: { maxCompletionTokens: 900 } });
ok(out2 === '{"ok":1}', '连接配置通道：返回 content');
ok(calls.profile.length === 1 && calls.profile[0].id === 'p1' && calls.profile[0].maxTokens === 900 && calls.profile[0].custom.stream === false, 'sendRequest 收到配置 ID、最大长度、非流式');
ok(calls.raw.length === rawBefore, '连接配置通道不调用 generateRaw');
ok(calls.profile[0].override && calls.profile[0].override.type === 'quiet', '连接配置请求标记为后台请求（失败时后端返回错误而不是假回复）');
profileReply = '[API Error]\nUnauthorized: invalid api key';
const e3 = await rejects(tavo.generate('x', {}), /invalid api key/, '后端包装成回复的 [API Error] 被还原成错误');
ok(e3.detail && /连接配置/.test(e3.detail), '报错注明是连接配置通道');
profileReply = '{"ok":1}';
extensionSettings[NS].ai.profileId = '已删除的配置';
await rejects(tavo.generate('x', {}), /不存在|config/, '配置不存在时报错，不静默换通道');
extensionSettings[NS].ai.profileId = '';
await rejects(tavo.generate('x', {}), /还没选择连接配置/, '没选配置时报错');
eq(tavo.__ai.listProfiles(), [{ id: 'p1', name: '分析用 DeepSeek' }], '面板可列出连接配置');
extensionSettings[NS].ai = { channel: 'main' };

// ================= B. 自定义 API =================
const chatInit = () => ({ method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: 'Bearer sk-test' }, body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'user', content: 'hi' }], max_tokens: 500, stream: false, thinking: { type: 'disabled' }, enable_thinking: false }) });
// B1 直连成功
net.corsBlocked = false;
let r = await tavo.http.request('https://api.example.com/v1/chat/completions', chatInit());
ok(r.ok && /direct/.test(await r.text()), '能直连时直接请求自定义 API');
// B2 跨域被拦 → 后端转发
net.corsBlocked = true;
tavo.__ai.__resetRelay();
r = await tavo.http.request('https://api.example.com/v1/chat/completions', chatInit());
ok(r.ok && r.status === 200, '跨域被拦后改走酒馆后端转发');
const body = JSON.parse(await r.text());
ok(body.choices[0].message.content.includes('relay'), '转发返回标准 OpenAI 格式');
ok(r.headers.get('content-type') === 'application/json', '转发响应带 content-type');
const up = net.upstream[net.upstream.length - 1];
ok(up.chat_completion_source === 'custom' && up.custom_url === 'https://api.example.com/v1', '转发：custom 通道 + 去掉 /chat/completions 的地址');
ok(up.model === 'deepseek-chat' && up.max_tokens === 500 && up.stream === false && up.messages.length === 1, '转发：模型、长度、消息原样带上');
ok(up.type === 'quiet', '转发：标记为后台请求（与酒馆自己的后台请求一致）');
eq(JSON.parse(up.custom_include_body), { thinking: { type: 'disabled' }, enable_thinking: false }, '转发：关思考参数放进 custom_include_body');
ok(/Authorization: "Bearer sk-test"/.test(up.custom_include_headers) && !/Content-Type/i.test(up.custom_include_headers), '转发：密钥只放在本次请求头里');
// B3 记住要转发的地址：第二次不再试直连
const nFetch = calls.fetch.length;
await tavo.http.request('https://api.example.com/v1/chat/completions', chatInit());
const tried = calls.fetch.slice(nFetch).map((c) => c.url);
eq(tried, ['/api/backends/chat-completions/generate'], '同一地址第二次直接走转发');
// B4 模型列表
tavo.__ai.__resetRelay();
r = await tavo.http.request('https://api.example.com/v1/models', { method: 'GET', headers: { Authorization: 'Bearer sk-test', Accept: 'application/json' } });
eq(JSON.parse(await r.text()).data.map((m) => m.id), ['deepseek-chat', 'deepseek-reasoner'], '模型列表经后端 status 转发');
ok(net.upstream[net.upstream.length - 1].custom_url === 'https://api.example.com/v1', 'status 转发地址去掉 /models');
// B5 转发失败：带可读原因
tavo.__ai.__resetRelay();
const bad = chatInit(); bad.headers.Authorization = 'Bearer wrong';
r = await tavo.http.request('https://api.example.com/v1/chat/completions', bad);
ok(!r.ok && r.status === 502 && /经酒馆后端转发.*Unauthorized/.test(await r.text()), '转发失败时返回错误和原因');
// B6 用户中断：不转发
tavo.__ai.__resetRelay();
const ac = new AbortController(); ac.abort();
const ab = Object.assign(chatInit(), { signal: ac.signal });
const nUp = net.upstream.length;
await rejects(tavo.http.request('https://api.example.com/v1/chat/completions', ab), /Failed to fetch/, '已中断的请求不再转发');
ok(net.upstream.length === nUp, '中断后后端没收到请求');
// B7 其他地址不转发
await rejects(tavo.http.request('https://api.example.com/v1/embeddings', { method: 'POST', body: '{}' }), /Failed to fetch/, '只转发对话和模型列表两种请求');

// ================= C. 图像 =================
ok(safeName('physiology-portrait-0~abc-1700000000000.jpg') === 'charphys-physiology-portrait-0_abc-1700000000000.jpg', '文件名转成 TT 允许的字符');
ok(/^charphys-[A-Za-z0-9_-]+\.png$/.test(safeName('../../林晚 头像.PNG')), '中文、路径、空格都被清理');
const dataUrl = 'data:image/jpeg;base64,' + Buffer.from('fake-jpeg').toString('base64');
const p = await tavo.file.save('physiology-portrait-0~abc-1.jpg', dataUrl, { scope: 'chat', encoding: 'dataUrl' });
ok(p === '/user/files/charphys-physiology-portrait-0_abc-1.jpg', '保存后返回 /user/files/ 路径');
ok(files.get(p) === Buffer.from('fake-jpeg').toString('base64'), '上传的是 base64 正文（不含 data: 前缀）');
ok((await tavo.file.url(p)) === p, '插件文件的地址就是路径本身');
// 面板的取图顺序：先 load（要 dataUrl），失败再 url —— 模拟 panel.js 的 portraitSrc
const panelSrc = async (pp) => {
    try { const d = await tavo.file.load(pp, { encoding: 'dataUrl' }); if (typeof d === 'string' && d.indexOf('data:') === 0) return d; } catch (e) { /* try url */ }
    const u = await tavo.file.url(pp, 'chat');
    return typeof u === 'string' ? u : (u && u.url) || '';
};
ok((await panelSrc(p)) === p, '面板取图：load 让位给 url，直接用文件地址（不读成 base64）');
ok((await tavo.file.url('linwan.png')) === '/thumbnail?type=avatar&file=linwan.png', '角色卡头像用缩略图地址');
ok((await tavo.file.url('https://x/y.png')) === 'https://x/y.png', '外部地址原样返回');
ok((await tavo.file.delete(p)) === true && !files.has(p), '删除插件保存的图像');
ok((await tavo.file.delete(p)) === true, '重复删除（文件已不在）当成功');
ok((await tavo.file.delete('/user/files/别人的文件.png')) === false, '不删不是本插件保存的文件');
await rejects(tavo.file.import({}), /unsupported|不可用/, 'file.import 明确报不支持（面板改用文件选择框）');
await rejects(tavo.file.save('x.jpg', 'not-a-data-url'), /dataUrl/, '非 dataUrl 拒绝保存');

// ================= D. 插件设置 + 真实引擎 =================
const cfg0 = tavo.plugin.config.all();
ok(!(cfg0 instanceof Promise) && cfg0.cycleLength === 28 && cfg0.injectMode === 'lore', 'config.all() 同步返回缺省值（块 1 占位版是异步的，引擎读不到）');
eq(Object.keys(CONFIG_DEFAULTS).length, 22, '缺省值覆盖原插件 23 项设置中的 22 项');
ok(!('injectTemplate' in cfg0), 'injectTemplate 不设缺省值（留空 = 引擎用本地化默认模板）');
tavo.plugin.config.set('cycleLength', 30);
ok(tavo.plugin.config.all().cycleLength === 30 && extensionSettings[NS].config.cycleLength === 30, 'config.set 写进 extensionSettings');

const E = createEngine(tavo);
ok(E.config().cycleLength === 30, '引擎读到设置（周期 30 天）');
tavo.plugin.config.set('cycleLength', undefined);

// D1 测试连接：主模型
rawReply = 'ok';
const t1 = await E.testApi({ enabled: false });
ok(t1 && t1.ok === true && t1.via === 'main', '引擎“测试连接”经 generateRaw 成功：' + JSON.stringify(t1 && { ok: t1.ok, via: t1.via, note: t1.note }));

// D2 自定义 API：保存 → 测试 → 列模型（跨域被拦，全部走转发）
tavo.__ai.__resetRelay();
net.corsBlocked = true;
await E.saveApi({ enabled: true, baseUrl: 'https://api.example.com/v1', model: 'deepseek-chat', apiKey: 'sk-test' });
ok(extensionSettings[NS].vars['physiology.api.v1'].apiKey === 'sk-test', '自定义 API 设置存为全局变量');
const api = await E.loadApi();
const t2 = await E.testApi(api);
ok(t2 && t2.ok === true, '引擎“测试连接”经后端转发成功：' + JSON.stringify(t2 && { ok: t2.ok, code: t2.code, detail: t2.detail }));
const lm = await E.listModels(api);
ok(lm.ok && lm.models.includes('deepseek-chat'), '引擎“获取模型列表”经后端转发成功');

// D3 引擎的 AI 识别请求（callModel）→ 自定义 API
const before = net.upstream.length;
const got = await E.__callModel('请输出 JSON：{"characters":[]}', { maxTokens: 300, timeout: 30000 });
ok(typeof got === 'string' && /characters/.test(got) && net.upstream.length > before, '引擎 AI 请求经后端转发拿到 JSON');

console.log('tt-ai OK · %d 项断言通过', pass);
