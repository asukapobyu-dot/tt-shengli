/*
 * 文件适配：实现面板“角色图像”用到的 tavo.file.save / load / url / delete / import。
 *
 * 对照 TauriTavern 源码（routes/resource-routes.js、Rust presentation/commands/file_commands.rs）：
 *   - 保存：POST /api/files/upload { name, data(base64) } → { path: '/user/files/<name>' }
 *     文件名只能含字母、数字、_、-、.（不能以 . 开头）
 *   - 删除：POST /api/files/delete { path }（只认 /user/files/ 下的文件）
 *   - 读取：这个路径本身就是可用的图片地址（TT 的请求拦截器会提供文件内容）
 *   - 角色卡头像：getThumbnailUrl('avatar', 文件名)
 *
 * 面板保存的路径会写进档案（ch.portrait.path），所以这里统一返回 '/user/files/…'。
 */

const PREFIX = 'charphys-';

/** 把任意文件名变成 TT 允许的文件名 */
export function safeName(name) {
    let s = String(name || '').trim().replace(/^.*[\\/]/, '');
    const m = /\.([A-Za-z0-9]{1,5})$/.exec(s);
    const ext = m ? m[1].toLowerCase() : 'jpg';
    s = (m ? s.slice(0, -m[0].length) : s).replace(/[^A-Za-z0-9_-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 80) || 'image';
    return PREFIX + s + '.' + ext;
}

function splitDataUrl(d) {
    const m = /^data:([^;,]*)(;base64)?,(.*)$/s.exec(String(d || ''));
    if (!m) return null;
    return { mime: m[1] || 'application/octet-stream', base64: m[2] ? m[3] : btoa(unescape(encodeURIComponent(decodeURIComponent(m[3])))) };
}

function isUserFile(p) {
    return /^\/?user\/files\/[^/]+$/.test(String(p || '').replace(/^https?:\/\/[^/]+/i, ''));
}
function normPath(p) {
    let s = String(p || '').trim().replace(/^https?:\/\/[^/]+/i, '');
    if (!s.startsWith('/')) s = '/' + s;
    return s;
}

/**
 * @param {{ getContext: () => any, fetchImpl?: typeof fetch }} deps
 */
export function createFileApi({ getContext, fetchImpl }) {
    const doFetch = (...a) => (fetchImpl || globalThis.fetch)(...a);
    const headers = () => {
        const c = getContext();
        try { if (c && typeof c.getRequestHeaders === 'function') return c.getRequestHeaders(); } catch (e) { /* ignore */ }
        return { 'Content-Type': 'application/json' };
    };
    async function post(url, body) {
        const res = await doFetch(url, { method: 'POST', headers: headers(), cache: 'no-cache', body: JSON.stringify(body) });
        const text = await res.text().catch(() => '');
        if (!res.ok) {
            let msg = text;
            try { const j = JSON.parse(text); msg = (j && (j.error || j.message)) || text; } catch (e) { /* not json */ }
            const e = new Error(String(msg || ('HTTP ' + res.status)));
            e.status = res.status;
            throw e;
        }
        try { return text ? JSON.parse(text) : {}; } catch (e) { return {}; }
    }

    const file = {
        /** save(name, dataUrl, { encoding:'dataUrl' }) → '/user/files/charphys-….jpg' */
        async save(name, data) {
            const parts = splitDataUrl(data);
            if (!parts) throw new Error('只支持 dataUrl 格式的图片');
            const r = await post('/api/files/upload', { name: safeName(name), data: parts.base64 });
            const p = r && typeof r.path === 'string' ? r.path : '';
            if (!p) throw new Error('上传后没有返回文件路径');
            return normPath(p);
        },
        /**
         * load(path, { encoding:'dataUrl' }) —— 面板先试 load 再退回 url()。
         * /user/files 下的图片本身就能直接当 <img src>，没必要读成 base64 塞进内存，
         * 所以这里明确报“请用 url()”，面板会自动改用文件地址。
         */
        async load(p) {
            const e = new Error('请用 file.url() 显示图片：' + String(p || ''));
            e.code = 'use_url';
            throw e;
        },
        /** url(path) —— 插件文件直接返回路径；角色卡头像文件名换成缩略图地址 */
        async url(p) {
            const s = String(p || '');
            if (!s) return '';
            if (/^(https?:|data:|blob:)/i.test(s)) return s;
            if (isUserFile(s)) return normPath(s);
            const c = getContext();
            if (c && typeof c.getThumbnailUrl === 'function') {
                try { return c.getThumbnailUrl('avatar', s); } catch (e) { /* ignore */ }
            }
            return '/thumbnail?type=avatar&file=' + encodeURIComponent(s);
        },
        /** delete(path) —— 只删本插件保存的文件，找不到当成功 */
        async delete(p) {
            if (!isUserFile(p) || !/\/charphys-[^/]+$/.test(normPath(p))) return false;
            try { await post('/api/files/delete', { path: normPath(p) }); } catch (e) { if (e.status !== 404) throw e; }
            return true;
        },
        /** import() —— 没有 Tavo 的系统选择器；面板会改用 <input type=file>，这里明确报“不支持” */
        async import() {
            const e = new Error('tavo.file.import 在 TauriTavern 移植版中不可用');
            e.code = 'unsupported';
            throw e;
        },
    };
    return file;
}
