/*
 * i18n：加载原插件的扁平语言包（key -> 字符串），占位符写作 {name}。
 * {{char}} / {{getvar::…}} 这类宏不是占位符，原样保留。
 * 语言按 SillyTavern 当前界面语言选择：zh 开头用 zh-CN，否则用 en；缺失键回退到 zh-CN，再回退到键名本身。
 */

const FALLBACK = 'zh-CN';
const SUPPORTED = ['zh-CN', 'en'];

export function pickLocale(stLocale) {
    const l = String(stLocale || '').toLowerCase();
    if (l.startsWith('zh')) return 'zh-CN';
    if (l) return 'en';
    return FALLBACK;
}

export function format(str, params) {
    if (typeof str !== 'string' || !params || typeof params !== 'object') return str;
    // 只替换单层大括号：前面不是 {、后面不是 }
    return str.replace(/(^|[^{])\{([A-Za-z0-9_]+)\}(?!\})/g, (m, pre, name) => {
        if (!Object.prototype.hasOwnProperty.call(params, name)) return m;
        const v = params[name];
        return pre + (v == null ? '' : String(v));
    });
}

/**
 * 创建翻译器。
 * @param {string} baseUrl 扩展根目录 URL（以 / 结尾）
 * @param {string} locale  zh-CN | en
 */
export async function createI18n(baseUrl, locale) {
    const want = SUPPORTED.includes(locale) ? locale : FALLBACK;
    const load = async (loc) => {
        const res = await fetch(baseUrl + 'locales/' + loc + '.json', { cache: 'no-cache' });
        if (!res.ok) throw new Error('locale ' + loc + ' HTTP ' + res.status);
        return res.json();
    };
    const fallback = await load(FALLBACK);
    const primary = want === FALLBACK ? fallback : await load(want).catch(() => fallback);
    return createTranslator(primary, fallback, want);
}

export function createTranslator(primary, fallback, locale) {
    const t = (key, params) => {
        let s = primary && Object.prototype.hasOwnProperty.call(primary, key) ? primary[key] : undefined;
        if (s === undefined && fallback && Object.prototype.hasOwnProperty.call(fallback, key)) s = fallback[key];
        if (s === undefined) return key;
        return format(s, params);
    };
    return { t, locale: locale || FALLBACK, has: (key) => !!((primary && key in primary) || (fallback && key in fallback)) };
}
