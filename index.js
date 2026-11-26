/*
 * 角色生理档案 Character Physiology — TauriTavern / SillyTavern 第三方扩展入口
 * 原插件：Tavo Hub com.taby.char-physiology v3.0.32（原作者 Taby / KeeK）
 *
 * 加载顺序：
 *   1. 等待 TauriTavern 宿主就绪（普通 SillyTavern 上跳过）
 *   2. 加载语言包
 *   3. 创建 tavo 适配层（src/tavo-shim.js）
 *   4. 创建引擎（src/engine.js，一份实例；原 Tavo 版会在后台和面板各加载一份）
 *   5. 启动运行时（src/runtime.js：事件、自动分析、注入）
 *   6. 挂载界面（src/ui.js：面板、菜单入口、设置抽屉）
 * 每一步失败都会在控制台和 toastr 里报告，并让后续步骤停止，不会影响酒馆本身。
 */

import { createI18n, pickLocale } from './src/i18n.js';
import { createTavoShim } from './src/tavo-shim.js';
import { createEngine } from './src/engine.js';
import { startRuntime } from './src/runtime.js';
import { mountUi } from './src/ui.js';

export const EXT_ID = 'char-physiology';
const LOG = '[char-physiology]';

// 扩展根目录（与文件夹名无关：用户把仓库装成什么名字都行）
const BASE_URL = new URL('./', import.meta.url).href;

/** 运行期共享对象，供调试：window.__charPhysiology */
const app = {
    baseUrl: BASE_URL,
    i18n: null,
    tavo: null,
    engine: null,
    runtime: null,
    ui: null,
    ready: false,
    error: null,
};

// generate_interceptor 必须在模块求值时就挂到 globalThis，运行时就绪前直接放行
globalThis.charPhysiologyInterceptor = async function (chat, contextSize, abort, type) {
    if (!app.runtime || typeof app.runtime.interceptor !== 'function') return;
    try {
        await app.runtime.interceptor(chat, contextSize, abort, type);
    } catch (e) {
        console.warn(LOG, 'interceptor failed', e);
    }
};

async function waitHost() {
    const tt = globalThis.__TAURITAVERN__;
    const ready = (tt && tt.ready) || globalThis.__TAURITAVERN_MAIN_READY__;
    if (ready && typeof ready.then === 'function') {
        try { await ready; } catch (e) { console.warn(LOG, 'host ready rejected', e); }
    }
}

function getContext() {
    const st = globalThis.SillyTavern;
    if (!st || typeof st.getContext !== 'function') throw new Error('SillyTavern.getContext 不可用');
    return st.getContext();
}

function report(stage, e) {
    app.error = { stage, message: String((e && e.message) || e) };
    console.error(LOG, '启动失败于「' + stage + '」', e);
    try { globalThis.toastr && globalThis.toastr.error('角色生理档案启动失败（' + stage + '）：' + app.error.message); } catch (_) { /* ignore */ }
}

async function boot() {
    let stage = '等待宿主';
    try {
        await waitHost();
        const ctx = getContext();

        stage = '加载语言包';
        const locale = pickLocale(typeof ctx.getCurrentLocale === 'function' ? ctx.getCurrentLocale() : '');
        app.i18n = await createI18n(BASE_URL, locale);

        stage = '创建适配层';
        app.tavo = createTavoShim({ extId: EXT_ID, baseUrl: BASE_URL, i18n: app.i18n, getContext });

        stage = '创建引擎';
        app.engine = createEngine(app.tavo);

        stage = '启动运行时';
        app.runtime = await startRuntime({ engine: app.engine, tavo: app.tavo, getContext, i18n: app.i18n });

        stage = '挂载界面';
        app.ui = await mountUi({ engine: app.engine, tavo: app.tavo, runtime: app.runtime, getContext, i18n: app.i18n, baseUrl: BASE_URL });

        app.ready = true;
        console.info(LOG, '已启动', { locale: app.i18n.locale });
    } catch (e) {
        report(stage, e);
    }
}

globalThis.__charPhysiology = app;

// 等 APP_READY 再启动。第三方扩展是延后加载的；APP_READY 属于 auto-fire 事件，已经触发过时 on() 会立即回调。
// 注意：ST/TT 的 EventEmitter 没有 once()，这里用 on() + 一次性防护，并在回调里解除监听。
(function start() {
    let started = false;
    const go = () => {
        if (started) return;
        started = true;
        void boot();
    };
    try {
        const ctx = getContext();
        const { eventSource, eventTypes } = ctx;
        if (eventSource && typeof eventSource.on === 'function' && eventTypes && eventTypes.APP_READY) {
            const onReady = () => {
                try { eventSource.removeListener(eventTypes.APP_READY, onReady); } catch (_) { /* ignore */ }
                go();
            };
            eventSource.on(eventTypes.APP_READY, onReady);
            return;
        }
    } catch (e) { /* 取不到上下文时退回直接启动 */ }
    go();
})();
