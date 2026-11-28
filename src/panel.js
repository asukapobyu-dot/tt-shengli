/*
 * Character Physiology panel UI — 移植自 Tavo 插件 com.taby.char-physiology v3.0.32（原作者：Taby / KeeK）
 * 原始头注释：panel UI (v1.9: read-only dungeon panel + in-panel settings view)
 * mountPanel(PHYS, tavo) 挂载面板并返回 dispose。
 */
export function mountPanel(PHYS, tavo) {
  const E = PHYS;
  const t = E.t;
  const PLUGIN_ID = 'com.taby.char-physiology';
  const MARGIN = 8;

  const svg = (d) => '<svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  const LOGO = '<img class="phys-logo" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAMAAADVRocKAAABgFBMVEUHAwMAAAAxFRZSIyVFGhxoKiwjDQ9LHSB1MzWGODsBAAACAAAdEBACAAGYQkUCAAABAAACAACSPUKlR0syAABFIB4+HiA3FBdVAAA+ICFIGBt/AAD/AAAqCw8pDhA0ExY3ExVBGRtMHCJSHCErDxE/AD81FRc6ExY/IB8qKipEFxtEFht/AD9/AH9/f3+3UVf/f38AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABrEt+sAAAAgHRSTlP+AP7+/v/+/f//T8v/a/8wkrL//wX//9AD/8cCAUl1SbG9jcjIBHec/wZ3nAQCAv8CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASUnHIAAArBSURBVHjarVppYxu5DaUB8JhDh2U7cdJ0z3a3d/v/f11xECQ1Gsd2svoQO9IIjwAeTjrcve01H87LEuprWc6H+Y1fDG8RflbRCeRFJP8qzHn+IwAO9yxL5LLglFSBxFA5k6DcH74L4Hlm6YlM1s1LQRljfv5GgMcDWwYypPDiK0EmttXh798AIOL58BBeeSWixBCP7wWY+fTy1Y1VdjEoM8T8PoB7EX9jdDSAW7Uosy/eATCL7W9Mv1Z6Ok2vIfg481sBznuHFPtAlJ9Ie6aSE50f3wJwWvjhXVo2vwbYcwZzdjm9DnDSJ3ekDz7huNtVgp84vQYwD+ZZRwcgRvI3ICLhHmXzrSM2AAeWP3g1tCjTNNSdzK/ULde1wRQOXwNg+d0Qa0DETC5/1X+dRJwlVqMuvwbC5S1C2Npn0BiRZUUw+TlUgKR6VHVS5PcEYR10mF8COF3J5++JlIQqOahR1C6gIaEuVXWQn/y0jlY67QOM8kUQWkARJDG/BYIBuApgBmWM0dV4xaUBYHH5QDkirObSRCNVFZF/catjdTt/J0anN4bleQfgHK5yG1eUtEJNynpyfkNF5HpiqgLNTNCZzWw93wLMV+EpNYuMOqIQiizAqgxF1HJTcxL/JLyKbXbPfAMwElRsbdW3pgAmlMj3OOCYCznacx4XYTwg22ILcB9oW6zkxMIdMRAfEaFlU+KPJJRN9Ap4k5uwZe/gDNo8A2EVvYsSVJNDC1t9EGPWX7loaoivcFWP+JPTCPDYGST05wDWjMPG93eLucNYZB82g9dgZBNi04XC8jgAzM1AELM+GfXYwn94ocTk+h6IgzQsRRP0kHA/B1PA2Z7Y7hgnViIKcz6Av+ysOOS8Gtv6IcuVQ0VhsKuQTIVwrYA48xL5cTkQgnVcZCTld8l6O/nUbGJMU+MgG3Qq61aFMCjALsMME3ZfdPNgidjUYVUiWhLUCGSrWhEB0T2bs6sKYVAgSd8Qo9NgcFmeCpKTXRMfMWIvFeQkZN+pR7oKoccAGCOi5TLQp83AheVns3aSHKXJgV0VQRviD9iiTHjdAe4rQE1CalbAqZd4KkJynC7TNBrIAMp0uUxaMbCHQJmAHIDtbgAHUyCJVZmYsbR0IfGV2X1RyhZtAKK8Mj+fu/zMSkXwrEVS3BjgPkFN40JpcSD0NoVE/nRkFwthmCjyk5hlsRyZbhQrJaoH2N1FjpbtiPcKUBXK6sBY7dvYpvzB48PDVIpqwh+WMvEbBbEUaOWV3xWDSQJzn4uNQuOQlkCrw+yI0osnTmzq8jDFChD5l3KZPmX2PfQCeyyf9KvBi7fxKHChqRYxKgtAFgO3765FXIyMYOhPYjRmS2zyhXF8foRaWwPaD0jnu/CvxRlGrZVQq7T0Axeuhk+sQzEmfUCcjoLDPG1do1LBmxDvAhMsfw13niasG2GD8JNlInA9QxRn8tGUlFon4hEF5mmKrrQQbsLCjlhTd7o4IcwjgNjwwsa2b66aK3DSo7ORjpofknhIagzGB3kOatZgWHb+ZCmwlmt2Qjj0RKc1PQpZnKjGfj6bIlwKJsmfOKl8NrtIQvSH2fuFyZGyy2eDHMI5NaapWMmkUDOZW0nYsyKVCWsMg4QLxlpArcFh86OheflTL4fFhl/5ZswOpl8SAONJjkyxnNlGT8ZhkqbPABjdikI7tRba2lTBEhZvB0X3Nhl4PqghMil36GihNJnlajqFmvLaV61aGPlh8V9qO9J6ctQ0560aC2YF2P/cbbOFtFRgI2nWWtmEUqQOcD2aeittmal3CBZhHM6sAlpIiXPjWKlrcRKbDfPjDQCCBxyMPUjNUJwOOMRZAXV2ofGRtQYrXOFSAzCxZpnWjvQ0KdQyFZiKQtIP7uPQTm7tKiIN52sA3pwlSc8+HUEDC1oSQDKaRLGkvKFiepvB6QydJ952NoDUOcBWqF25rCoqPwTgSTwrCghECcM0ZfleKhDSaJ0BoJMsk3Yj1r1VsvL/zLNQLtqlYrEKbvFDbaWUEV4AqPOQyFLSFbIOPXvH+GQJqTzoxxHd8mRsZu+peG1FdMjKFWBpNqvhaMrkyRKFZQEhlwNIHJkCxulVC4l0UzyWZmt2WgyRR3LwZVzyNrFAavGi+gn9MJejlW2FrQObHMvrAP8vCxProM6RfK6LOEWlllOkvtcK4R2J6j8dudZxJ+MTUzJCE7V52qjkw9c5HFo25ZwWe2AEH4nB5jLmJVcxLpMKFGtvrb0NtEPoT4yxT0qHMHbuV7sCr0EYekKSBDRl9fHaq1RuO087NcWONw8lUxrYOvV1y4CGQpJaWsT4XO5kfCpBi6cQrbWyoU3TFFsg34XHxQF8oggJegIgXSKoG4t0eWoi/iEO90jT+WlIa176hUTSttQolrn1Kg1qAk263dEkpvVqumjF0yojSx6miLGhD+f8yVN2H2vjVTM36NKgZqbVSnJUZWtFEYKXC//zN4ZY6yEo1vqiFWG1Y9UtBKRZW0dqq0MdLexMNiCkUkNcWp+HmovggfNRDWSOF/Udpy1JuBqFDNq6Fm1+aZgkrFuWDR8/KCuLVr+RHo7TpcTLdPyvv63dMiuZK53Fu9h3I2TNb48EdQI6N7VxEJjaf4G0kJJVp8mLKX+cNQl6uOtwSq3TOvgAMqb23HtXbUSc1Zi5VYxkbUu1QSTBz9TWtkLF1l/k4COUsydZ7aglRJIjj1S5JG+sjtG6iuJGiDZlZV+CWeWCwUJXQ2DwEbKFhLZSWFsBxActEHQp5PsEdnCEvu3PcsXQam7yIfBuGeq89XOYHVGyr7QJ7E84yszG3Stg8l0YtuwYSZdgqVt46YN42mwKfGDHylZrEtkJuiA5moU0wHxTEXC7bgCY+65i2W7aU23F+HziAcuP3LaImKm200ULce0M4GYVzAr8qS9DdpfR5hoMlX5BcqkEs85vdnBdloiN0vZyoSrQ1jm0tw3/VPePusOQJWkxAM36NOSevcMtm4XUDgIODZS5TfIETjQ2IrCPQOm0WamNfeBAWt24BKi7AEnTcQAAXRu1HU4HSrRZqX25a+2u5pQak9pwx7bqIDl9LA1ANlYRfK/X1s4WxF+2a81E/aYmSYYx7SVh+2UUM4jnHBw0tDyiywOB9aU/pXlnMds6TGkKmg+TNoReQPn0JXv9QBkV3F8a477io53F7N3zcrX51fZGzzhFoLELiO06gadWDbZQu5a1M+j5FuDL6Wq3H2obS9rPev7r1dTSm287r7bjOZy+7K/3U967mMkbJtqoIY+uKe/ctDSG7lxQ3F4/QRRUxNtsJXVxWGMO8uevXLFsEaQDkVpd4AZA2NvH8OGy6/DVS6IbHaSkyNxI7bZAw1pdnF+Xf3vNtUGwXYSWBb/pUKfoXGh7/mv586sXdWl7i1kHBqWjXr2Elhxwc92W0+ktV40IO1eMMi3Y/a8u76Bd9YxXy2+5apSYpt3kLfNDvaLeT9BD/L523Qu4W4Cy7WPi/s04zO+5sM60eyEbwwtXtUT377xy/5j37bR77Q70l3deuXO5Pnzcv7XeE//xoF95799VHD7uentX/Df+Zcj8U/76Hz5wO/fT/H1/evLDz3InuP9XG5R//uE7/7bl3/LPj//8nKX8NJjEsil//v3P1V3fpcHj//THj//45ddfM9nr8+dfflPhd/95fO37/wcpUE3Z6BYPRwAAAABJRU5ErkJggg==" width="38" height="38" alt="" aria-hidden="true" draggable="false">';
  const CHEV2 = '<svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4.5L6 7.5 9 4.5"/></svg>';
  const ICON = {
    gear: svg('<circle cx="8" cy="8" r="2.2"/><path d="M8 1.8v1.6M8 12.6v1.6M1.8 8h1.6M12.6 8h1.6M3.6 3.6l1.1 1.1M11.3 11.3l1.1 1.1M12.4 3.6l-1.1 1.1M4.7 11.3l-1.1 1.1"/>'),
    back: svg('<path d="M9.5 3.5L5 8l4.5 4.5"/>'),
    refresh: svg('<path d="M13 8a5 5 0 1 1-1.6-3.7M13 2.5v3h-3"/>'),
    up: svg('<path d="M4 10l4-4 4 4"/>'),
    down: svg('<path d="M4 6l4 4 4-4"/>'),
    close: svg('<path d="M4 4l8 8M12 4l-8 8"/>'),
    scan: svg('<circle cx="7" cy="7" r="4"/><path d="M10 10l3.500 3.500"/>'),
    undo: svg('<path d="M6 4L3 7l3 3"/><path d="M3 7h6a4 4 0 0 1 0 8H7"/>'),
    prev: svg('<path d="M10 3.5L5.5 8l4.5 4.5"/>'),
    next: svg('<path d="M6 3.5L10.5 8 6 12.5"/>'),
    // [tt-port:pause] 暂停追踪 / 继续追踪
    pause: svg('<path d="M6 3.5v9M10 3.5v9"/>'),
    play: svg('<path d="M5.5 3.5L12 8l-6.5 4.5z"/>'),
  };

  // Dispose any previous instance (fragment remount / hot reload).
  try {
    const prev = document.documentElement.__physDispose;
    if (typeof prev === 'function') prev();
  } catch (e) { /* ignore */ }
  let root = document.getElementById('phys-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'phys-root';
    (document.body || document.documentElement).appendChild(root);
  }
  root.className = 'phys-root phys-theme-dungeon';
  root.textContent = '';
  const view = document.createElement('div');
  view.className = 'phys-view';
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.hidden = true;
  fileInput.setAttribute('data-role', 'file');
  root.appendChild(view);
  root.appendChild(fileInput);

  let st = E.newState();
  let sel = null;
  let lastJson = '';
  let dragging = false;
  let disposed = false;
  let sOpen = { track: false, portrait: false, cycle: false, kinks: false, cacts: false, data: false, api: false, inject: false, story: false };
  let page = (function () { try { const p = sessionStorage.getItem('phys.page'); return ['roster', 'fert', 'sex', 'profile', 'settings'].indexOf(p) >= 0 ? p : 'fert'; } catch (e) { return 'fert'; } })();
  let pageAnim = '';
  let diagOpen = (function () { try { return localStorage.getItem('phys.diagOpen') === '1'; } catch (e) { return false; } })();
  // v3.0.6 staged edits: cycle draft is cycle-only; hist draft is 生育史 counts only
  let cycDraft = null; // { id, cycle }
  let histDraft = null; // { id, fert: { pregnancyCount, birthCount } }
  const HIST_KEYS = ['pregnancyCount', 'birthCount'];
  const FERT_KEYS = ['pregnant', 'pregnancyDay', 'pregnancyCount', 'birthCount'];
  const CYC_KEYS = ['day', 'length', 'periodLength', 'follicular', 'luteal', 'manual', 'lengthLocked'];
  function cycView(c) {
    if (!c) return c;
    let out = c;
    if (cycDraft && cycDraft.id === chKey(c)) out = Object.assign({}, out, { cycle: Object.assign({}, c.cycle, cycDraft.cycle) });
    if (histDraft && histDraft.id === chKey(c)) out = Object.assign({}, out, { fertility: Object.assign({}, (out.fertility || c.fertility), histDraft.fert) });
    return out;
  }
  function cycChanges(c) {
    if (!c || !cycDraft || cycDraft.id !== chKey(c)) return [];
    const lab = { day: '今天第几天', length: '整个周期', periodLength: '经期', follicular: '排卵前天数', luteal: '黄体期' };
    const out = [];
    ['day', 'length', 'periodLength', 'follicular', 'luteal'].forEach((k) => { if (cycDraft.cycle[k] !== c.cycle[k]) out.push(lab[k] + ' ' + c.cycle[k] + ' → ' + cycDraft.cycle[k]); });
    return out;
  }
  function histChanges(c) {
    if (!c || !histDraft || histDraft.id !== chKey(c)) return [];
    const lab = { pregnancyCount: '怀孕过', birthCount: '生产过' };
    const out = [];
    HIST_KEYS.forEach((k) => { if (histDraft.fert[k] !== c.fertility[k]) out.push(lab[k] + ' ' + c.fertility[k] + ' → ' + histDraft.fert[k]); });
    return out;
  }
  function stageCyc(c, fn) {
    if (!c) return;
    if (!cycDraft || cycDraft.id !== chKey(c)) {
      cycDraft = { id: chKey(c), cycle: {} };
      CYC_KEYS.forEach((k) => { cycDraft.cycle[k] = c.cycle[k]; });
    }
    const pseudo = { cycle: Object.assign({}, c.cycle, cycDraft.cycle), fertility: Object.assign({}, c.fertility) };
    fn(pseudo);
    CYC_KEYS.forEach((k) => { cycDraft.cycle[k] = pseudo.cycle[k]; });
    if (!cycChanges(c).length) cycDraft = null;
    render();
  }
  function stageHist(c, fn) {
    if (!c) return;
    if (!histDraft || histDraft.id !== chKey(c)) {
      histDraft = { id: chKey(c), fert: {} };
      HIST_KEYS.forEach((k) => { histDraft.fert[k] = c.fertility[k]; });
    }
    const pseudo = { cycle: Object.assign({}, c.cycle), fertility: Object.assign({}, c.fertility, histDraft.fert) };
    fn(pseudo);
    HIST_KEYS.forEach((k) => { histDraft.fert[k] = pseudo.fertility[k]; });
    if (!histChanges(c).length) histDraft = null;
    render();
  }
  const stagedPath = (path) => page === 'settings' && (/^cycle\./.test(path || '') || /^fertility\.(pregnancyCount|birthCount)$/.test(path || ''));
  let liteOn = (function () { try { return localStorage.getItem('phys.lite') === '1'; } catch (e) { return false; } })(); // v3.0.3 低功耗模式, per device
  try { root.classList.toggle('phys-lite', liteOn); } catch (e) { /* ignore */ }
  const pageScroll = {};
  let charMenu = false;
  let locEdit = false;
  let recOpen = (function () { try { return sessionStorage.getItem('phys.rec') === '1'; } catch (e) { return false; } })();
  const prof = { id: null, busy: false, mode: '', res: null };
  let swipe = null;
  let calOff = 0;
  let calMode = null; // v2.9.6: null = auto (孕期日历 while pregnant)
  let dateDraft = null;
  let dateShift = true;
  let apiDraft = null;
  let injDraft = null;
  let corrBusy = null;
  let advOpen = false;
  let rosCenter = false;
  let addForm = { open: false, name: '', desc: '', busy: false, msg: '' };
  /* [tt-port:age-ui] */
  // 「确认成年」内联表单：kind = char（已存在的角色）| scan（扫描候选）| recog（识别名单）| add（手动添加）
  let adultAsk = null; // { kind, id, name, age, msg }
  const recogAdult = {}; // 识别名单里已确认成年的候选：{ key: age }
  function adultAskOpen(kind, id) { return !!(adultAsk && adultAsk.kind === kind && String(adultAsk.id) === String(id)); }
  function adultBtnHtml(kind, id, name) {
    return '<button type="button" class="phys-btn small" data-act="adult-ask" data-kind="' + esc(kind) + '" data-id="' + esc(String(id)) + '" data-name="' + esc(name || '') + '">' + esc(t('ttAge.confirm.btn')) + '</button>';
  }
  function adultAskHtml(kind, id, name) {
    if (!adultAskOpen(kind, id)) return adultBtnHtml(kind, id, name);
    return '<div class="phys-adultask" role="group"><p class="phys-muted">' + esc(t('ttAge.confirm.hint', { name: name || '' })) + '</p>' +
      '<label class="phys-field">' + esc(t('ttAge.confirm.ageLabel')) + '<input type="number" inputmode="numeric" min="18" max="9999" step="1" data-adultask="age" value="' + esc(adultAsk.age == null ? '' : String(adultAsk.age)) + '" placeholder="18"></label>' +
      (adultAsk.msg ? '<p class="phys-status">' + esc(adultAsk.msg) + '</p>' : '') +
      '<div class="phys-row"><button type="button" class="phys-btn" data-act="adult-ok">' + esc(t('ttAge.confirm.ok')) + '</button><button type="button" class="phys-btn ghost" data-act="adult-cancel">' + esc(t('ui5.cancel')) + '</button></div></div>';
  }
  // 校验年龄并二次确认；返回整数年龄或 null（已在表单里写好错误提示）
  async function adultAskAge() { // [tt-port:panel-tt] 确认框是异步的
    if (!adultAsk) return null;
    const raw = String(adultAsk.age == null ? '' : adultAsk.age).trim();
    const n = Number(raw);
    if (!raw || !Number.isFinite(n) || Math.round(n) !== n) { adultAsk.msg = t('ttAge.confirm.errNum'); return null; }
    if (n < 18) { adultAsk.msg = t('ttAge.confirm.errUnder'); return null; }
    if (!(await confirmAsk(t('ttAge.confirm.dialog', { name: adultAsk.name || '', age: n })))) return null;
    return n;
  }
  let bodyEdit = null;
  const scan = { busy: false, res: null, cands: [], applying: false };
  let handledScanReq = 0;
  // Fetched model list lives in module state (not in apiDraft) so it survives re-renders, polls and apiDraft reloads.
  const modelPick = { list: [], open: false, filter: '' };
  let apiStatus = null;
  let apiBusy = false;
  let imgBusy = false;
  let regenBusy = false;
  let regenScope = '';
  let aiDraft = null;
  let calSel = null; // tapped calendar day number
  const rebase = { id: null, busy: false, res: null, step: 0, stepKey: '' };
  let clearGlobal = false;
  let dataBusy = false;
  let dossTab = 'base'; let dossEdit = null; // v2.3 dossiers: 'base' | 'cur' | 'cmp'; edit draft {which, d}
  let hdCollapsed = (() => { try { return sessionStorage.getItem('phys.hd') === '1'; } catch (e) { return false; } })(); // v2.4: manual collapse, per session
  let sitOpen = false;
  let syncReq = false; // manual update in flight (this runtime)
  let syncDiag = false; // diagnostics popover open
  const imgCache = {};
  const imgLoading = {};
  const imgFailed = {};
  const disposers = [];

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
  let busyTech = false;
  const toast = async (key, p) => { try { await tavo.utils.toast(t(key, p)); } catch (e) { /* ignore */ } };
  // [tt-port:panel-tt] 确认框：优先用宿主的弹窗（酒馆 callGenericPopup），没有时退回 window.confirm
  const confirmAsk = async (msg) => {
    try { if (tavo.ui && typeof tavo.ui.confirm === 'function') return !!(await tavo.ui.confirm(String(msg))); } catch (e) { /* fall back */ }
    try { return !!window.confirm(String(msg)); } catch (e) { return false; }
  };

  /* ---- stylesheet (link + fetch fallback) ---- */
  // /* [tt-port:panel-tt] */ 移植版：样式由 manifest.json 的 "css" 交给酒馆加载，这里不再插 <link>
  (function ensureCss() {
    const href = '/plugins/' + PLUGIN_ID + '/ui/panel.css';
    if (tavo.__host === 'sillytavern') return;
    if (!document.getElementById('phys-css')) {
      const link = document.createElement('link');
      link.id = 'phys-css';
      link.rel = 'stylesheet';
      link.href = href;
      (document.head || document.documentElement).appendChild(link);
      link.addEventListener('error', () => {
        try {
          fetch(href).then((r) => r.text()).then((css) => {
            const s = document.createElement('style');
            s.id = 'phys-css-inline';
            s.textContent = css;
            (document.head || document.documentElement).appendChild(s);
          }).catch(() => {});
        } catch (e) { /* ignore */ }
      });
    }
  })();

  /* ---- insets ---- */
  function readInsets() {
    let top = 0, bottom = 0;
    try {
      if (tavo.ui && typeof tavo.ui.getInsets === 'function') {
        const i = tavo.ui.getInsets() || {};
        top = num(i.topBar); bottom = num(i.bottomInput);
      }
    } catch (e) { /* ignore */ }
    if (!top || !bottom) {
      try {
        const cs = getComputedStyle(document.documentElement);
        if (!top) top = parseFloat(cs.getPropertyValue('--tavo-inset-top-bar')) || 0;
        if (!bottom) bottom = parseFloat(cs.getPropertyValue('--tavo-inset-bottom-input')) || 0;
      } catch (e) { /* ignore */ }
    }
    return { top: top || 56, bottom: bottom || 72 };
  }

  /* ---- state helpers ---- */
  const chars = () => Object.keys(st.characters).map((k) => st.characters[k]);
  const chKey = (c) => String(c.id);
  const isOff = (c) => !!(c.skippedReason || c.trackOff);
  function current() {
    if (sel && st.characters[sel]) return st.characters[sel];
    const c = chars().find((x) => !isOff(x)) || chars()[0] || null;
    sel = c ? chKey(c) : null;
    return c;
  }
  async function editChar(id, fn, opts) {
    try {
      const cfg = E.config();
      const r = await E.mutateRecorded([id], (s) => {
        const c = s.characters[id];
        if (c) {
          // v3.0.7: player edits of cycle / fertility / 生育史 also sync into 现状档案 (not only baseline / tracker)
          const sig = (x) => JSON.stringify([x.cycle, x.fertility && [x.fertility.pregnancyCount, x.fertility.birthCount, x.fertility.miscarriages, x.fertility.stillbirths, x.fertility.contra, x.fertility.baseline, (x.fertility.offspring || []).length]]);
          const pre = JSON.parse(JSON.stringify({ cycle: c.cycle, fertility: c.fertility })); const s0 = sig(c);
          fn(c, s, cfg); E.recompute(c, cfg);
          if (sig(c) !== s0 && E.syncUserCurrent) { const ks = []; Object.keys(c.cycle || {}).forEach((k) => { if (JSON.stringify(c.cycle[k]) !== JSON.stringify(pre.cycle[k])) ks.push(k); }); ['pregnancyCount', 'birthCount', 'miscarriages', 'stillbirths', 'contra', 'baseline'].forEach((k) => { if (c.fertility[k] !== pre.fertility[k]) ks.push(k); }); try { E.syncUserCurrent(c, ks, cfg); } catch (e3) { /* ignore */ } }
        }
        return null;
      });
      st = r.state; lastJson = JSON.stringify(st);
      if (!opts || !opts.noRender) render();
    } catch (e) { await toast('ui.error.save'); }
  }
  const edit = (fn, opts) => editChar(sel, fn, opts);
  async function editPanel(fn) {
    try {
      const r = await E.mutate((s) => { fn(s.panel, s); return null; });
      st = r.state; lastJson = JSON.stringify(st);
    } catch (e) { /* ignore */ }
  }

  const PATHS = {
    'cycle.day': [1, 60], 'cycle.length': [21, 45], 'cycle.periodLength': [1, 10], 'cycle.follicular': [0, 300], 'cycle.luteal': [8, 20],
    'fertility.pregnancyDay': [0, 400], 'fertility.pregnancyCount': [0, 999], 'fertility.birthCount': [0, 999],
  };
  E.SEX_KEYS.forEach((k) => { PATHS['sex.' + k] = [0, 999999]; });
  const pathLim = (path) => PATHS[path] || (/^sex\.(c_[a-z0-9]{2,20})$/.test(path) ? [0, 999999] : null);
  function setPath(c, path, value) {
    const lim = pathLim(path);
    if (!lim) return;
    if (!/\d/.test(String(value == null ? '' : value))) return; // v3.0.5k: ignore empty / non-numeric input (keeps the old value)
    const parts = path.split('.');
    let v = E.clamp(E.int(value, 0), lim[0], lim[1]);
    if (path === 'cycle.length') {
      c.cycle.lengthLocked = true; c.cycle.length = v;
      c.cycle.periodLength = E.clamp(c.cycle.periodLength, 1, Math.max(1, v - 10));
      c.cycle.day = E.clamp(c.cycle.day, 1, v);
      return;
    }
    if (path === 'cycle.day') { c.cycle.manual = true; v = E.clamp(v, 1, c.cycle.length); }
    if (path === 'cycle.periodLength') { c.cycle.manual = true; v = E.clamp(v, 1, Math.max(1, c.cycle.length - 10)); }
    if (path === 'cycle.follicular') { v = v ? E.clamp(v, c.cycle.periodLength + 2, Math.max(c.cycle.periodLength + 2, c.cycle.length - 5)) : 0; if (v) c.cycle.luteal = E.clamp(c.cycle.length - v, 8, 20); }
    if (path === 'cycle.luteal') { c.cycle.follicular = 0; }
    if (path === 'fertility.pregnancyCount' || path === 'fertility.birthCount') { c.from = c.from || {}; c.from[parts[1]] = 'user'; } // v3.0.10: a hand-set count is never lowered by 按记录重算
    c[parts[0]][parts[1]] = v;
  }
  const getPath = (c, path) => { const p = path.split('.'); return c[p[0]][p[1]]; };

  /* ---- portrait (default avatar / uploaded image kept as a chat file path) ---- */
  function ensureLoad(key, loader) {
    if (imgLoading[key] || imgFailed[key]) return;
    imgLoading[key] = true;
    Promise.resolve().then(loader).then((src) => {
      if (typeof src === 'string' && src) imgCache[key] = src; else imgFailed[key] = true;
    }).catch(() => { imgFailed[key] = true; }).then(() => { imgLoading[key] = false; if (!disposed) render(); });
  }
  function portraitSrc(c) {
    if (!c) return '';
    const p = c.portrait && c.portrait.path;
    if (p) {
      if (imgCache[p]) return imgCache[p];
      ensureLoad(p, async () => {
        try { const d = await tavo.file.load(p, { encoding: 'dataUrl' }); if (typeof d === 'string' && d.indexOf('data:') === 0) return d; } catch (e) { /* try url */ }
        const u = await tavo.file.url(p, 'chat');
        return typeof u === 'string' ? u : (u && u.url) || '';
      });
      return '';
    }
    const a = c.avatar;
    if (!a) return '';
    if (/^(https?:|blob:|\/)/i.test(a)) return imgFailed[a] ? '' : a;
    const k = 'a:' + a;
    if (imgCache[k]) return imgCache[k];
    ensureLoad(k, async () => {
      const u = await tavo.file.url(a);
      return typeof u === 'string' ? u : (u && u.url) || '';
    });
    return '';
  }
  function portraitHtml(c, cls) {
    const src = portraitSrc(c);
    const inner = src ? '<img src="' + esc(src) + '" alt="' + esc(c ? c.name : '') + '" draggable="false">' : '<span class="phys-ph" aria-hidden="true">' + esc(String((c && c.name) || '·').trim().charAt(0).toUpperCase() || '·') + '</span>';
    return '<div class="phys-portrait ' + (cls || '') + '">' + inner + '</div>';
  }
  const readFileAsDataUrl = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(r.error || new Error('read')); r.readAsDataURL(file); });
  const shrinkToJpeg = (dataUrl, max) => new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      let w = img.naturalWidth, h = img.naturalHeight;
      if (!w || !h) { rej(new Error('bad image')); return; }
      const s = Math.min(1, max / Math.max(w, h));
      w = Math.max(1, Math.round(w * s)); h = Math.max(1, Math.round(h * s));
      const cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      const g = cv.getContext('2d');
      g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
      g.drawImage(img, 0, 0, w, h);
      res(cv.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => rej(new Error('bad image'));
    img.src = dataUrl;
  });
  async function storePortrait(dataUrl) {
    const c = current();
    if (!c) return;
    const jpeg = await shrinkToJpeg(dataUrl, 512);
    const name = 'physiology-portrait-' + String(c.id).replace(/[^\w-]/g, '_') + '-' + Date.now() + '.jpg';
    const r = await tavo.file.save(name, jpeg, { scope: 'chat', encoding: 'dataUrl' });
    const path = typeof r === 'string' && r ? r : ((r && r.path) || ('files/chat/' + name));
    imgCache[path] = jpeg;
    let old = null;
    await editChar(chKey(c), (ch) => { old = ch.portrait.path; ch.portrait.path = path; });
    if (old && old !== path) { try { await tavo.file.delete(old); } catch (e) { /* ignore */ } }
  }
  async function onFilePicked() {
    const f = fileInput.files && fileInput.files[0];
    fileInput.value = '';
    if (!f || imgBusy) return;
    imgBusy = true; render();
    try { await storePortrait(await readFileAsDataUrl(f)); await toast('ui.img.saved'); }
    catch (e) { await toast('ui.img.failed'); }
    imgBusy = false; render();
  }
  async function importViaTavo() {
    if (imgBusy) return;
    imgBusy = true; render();
    try {
      const list = await tavo.file.import({ extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'], scope: 'chat' });
      const f = Array.isArray(list) ? list[0] : null;
      if (f && f.path) {
        const d = await tavo.file.load(f.path, { encoding: 'dataUrl' });
        await storePortrait(d);
        try { await tavo.file.delete(f.path); } catch (e) { /* ignore */ }
        await toast('ui.img.saved');
      }
    } catch (e) { await toast('ui.img.failed'); }
    imgBusy = false; render();
  }

  /* ---- API draft ---- */
  async function loadApiDraft() {
    try {
      const a = await E.loadApi();
      apiDraft = { enabled: a.enabled, baseUrl: a.baseUrl, model: a.model, hasKey: !!a.apiKey, masked: E.maskKey(a.apiKey), newKey: '', showKey: false };
    } catch (e) {
      apiDraft = { enabled: false, baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini', hasKey: false, masked: '', newKey: '', showKey: false };
    }
  }
  async function saveApiDraft(opts) {
    if (!apiDraft) return;
    try {
      const cur = await E.loadApi();
      const key = opts && opts.clearKey ? '' : (apiDraft.newKey || cur.apiKey);
      const saved = await E.saveApi({ enabled: apiDraft.enabled, baseUrl: apiDraft.baseUrl, model: apiDraft.model, apiKey: key });
      apiDraft.hasKey = !!saved.apiKey; apiDraft.masked = E.maskKey(saved.apiKey); apiDraft.newKey = '';
      if (opts && opts.clearKey) { modelPick.list = []; modelPick.open = false; modelPick.filter = ''; }
      apiStatus = { kind: 'ok', key: opts && opts.clearKey ? 'ui.api.cleared' : 'ui.api.saved' };
    } catch (e) { apiStatus = { kind: 'err', key: 'ui.error.save' }; }
    render();
  }
  function apiErrStatus(r, scope) {
    const d = r.detail ? 'Detail' : '';
    if (r.code === 'http') return { kind: 'err', key: 'ui.api.test.http' + d, params: { status: r.status, detail: r.detail } };
    if (r.code === 'badresponse') return { kind: 'err', key: 'ui.api.test.badresponse' + d, params: { detail: r.detail } };
    if (r.code === 'badurl') return { kind: 'err', key: 'ui.api.test.badurl', params: { detail: r.detail || '' } };
    if (r.code === 'config') return { kind: 'err', key: r.detail ? 'ui.api.test.configDetail' : (scope === 'models' ? 'ui.api.models.config' : 'ui.api.test.config'), params: { detail: r.detail || '' } };
    if (r.code === 'timeout') return { kind: 'err', key: 'ui.api.test.timeout' };
    if (r.detail && /跨域预检/.test(String(r.detail))) return { kind: 'err', key: 'ui.api.test.corsPost' };
    return { kind: 'err', key: 'ui.api.test.network' };
  }
  async function fetchModelsDraft() {
    if (!apiDraft || apiBusy) return;
    apiBusy = true; apiStatus = { kind: 'info', key: 'ui.api.models.fetching' }; render();
    let r;
    try {
      const cur = await E.loadApi().catch(() => ({ apiKey: '' }));
      r = await E.listModels({ baseUrl: apiDraft.baseUrl, apiKey: apiDraft.newKey || cur.apiKey });
    } catch (e) {
      r = { ok: false, code: (e && e.code) || 'network', detail: (e && e.detail) || String((e && e.message) || e) };
    }
    apiBusy = false;
    if (r.ok) {
      modelPick.list = r.models.slice(); modelPick.open = true; modelPick.filter = '';
      if (!apiDraft.model) apiDraft.model = r.models[0];
      apiStatus = { kind: 'ok', key: 'ui.api.models.ok', params: { count: r.models.length } };
    } else apiStatus = apiErrStatus(r, 'models');
    render();
    if (r.ok) { try { const pk = view.querySelector('.phys-picker'); if (pk && pk.scrollIntoView) pk.scrollIntoView({ block: 'nearest' }); } catch (e) { /* ignore */ } }
  }
  async function testApiDraft() {
    if (!apiDraft || apiBusy) return;
    apiBusy = true; apiStatus = { kind: 'info', key: 'ui.api.testing' }; render();
    let r;
    try {
      const cur = await E.loadApi().catch(() => ({ apiKey: '' }));
      r = await E.testApi({ enabled: apiDraft.enabled, baseUrl: apiDraft.baseUrl, model: apiDraft.model, apiKey: apiDraft.newKey || cur.apiKey });
    } catch (e) {
      r = { ok: false, code: (e && e.code) || 'network', detail: (e && e.detail) || String((e && e.message) || e) };
    }
    apiBusy = false;
    apiStatus = r.ok ? { kind: 'ok', key: r.empty ? 'ui.api.test.okEmpty' : 'ui.api.test.ok', extra: r.note || '' } : Object.assign(apiErrStatus(r, 'test'), { extra: r.aiErr ? r.aiErr.label + '：' + r.aiErr.hint : '' });
    render();
  }

  /* ---- inject settings draft ---- */
  async function loadInjDraft() {
    try {
      const i = await E.loadInject();
      injDraft = { enabled: i.enabled, intimacy: i.intimacy !== false, detail: i.detail, position: i.position, template: i.template === null ? t('settings.injectTemplate.default') : i.template, mode: i.mode || 'lore', depth: i.depth != null ? i.depth : 2, sticky: i.sticky != null ? i.sticky : 5, wait: i.wait != null ? i.wait : 3000, strategy: i.strategy === 'direct' ? 'direct' : 'vars' };
    } catch (e) { injDraft = { enabled: true, intimacy: true, detail: 'standard', position: 'before', template: t('settings.injectTemplate.default'), mode: 'lore', depth: 2, sticky: 3, wait: 3000, strategy: 'vars' }; }
  }
  async function saveInjDraft() {
    if (!injDraft) return;
    try {
      const tpl = injDraft.template === t('settings.injectTemplate.default') ? null : injDraft.template;
      await E.saveInject({ enabled: injDraft.enabled, intimacy: injDraft.intimacy, detail: injDraft.detail, position: injDraft.position, template: tpl, mode: injDraft.mode, depth: injDraft.depth, sticky: injDraft.sticky, wait: injDraft.wait, strategy: injDraft.strategy }); // null => omitted => localized default
    } catch (e) { await toast('ui.error.save'); }
    render();
  }
  async function loadAiDraft() {
    try {
      const a = await E.loadAiOpts();
      aiDraft = { aiDescribe: a.aiDescribe !== false, skipRefusal: a.skipRefusal !== false, aiPlot: a.aiPlot !== false, aiContext: a.aiContext, aiMaxTokens: a.aiMaxTokens, aiInit: a.aiInit !== false, aiNoThink: a.aiNoThink !== false, aiBaselineTokens: a.aiBaselineTokens, aiCardChars: a.aiCardChars, aiRetryTokens: a.aiRetryTokens, autoSync: a.autoSync !== false, dossierAuto: a.dossierAuto !== false, aiScanMsgs: a.aiScanMsgs || 30, focusScanMsgs: a.focusScanMsgs || 60, autoDetect: a.autoDetect !== false };
    } catch (e) { aiDraft = { aiDescribe: true, skipRefusal: true, aiPlot: true, aiContext: 8, aiMaxTokens: 8000, aiInit: true, aiNoThink: true, aiBaselineTokens: 16000, aiCardChars: 6000, aiRetryTokens: 32000, autoSync: true, dossierAuto: true, aiScanMsgs: 30, focusScanMsgs: 60, autoDetect: true }; }
  }
  async function saveAiDraft() {
    if (!aiDraft) return;
    try { await E.saveAiOpts(aiDraft); } catch (e) { await toast('ui.error.save'); }
  }

  let injPv = { busy: false, data: null, open: false };
  let loreBusy = false;
  let diagBusy = false;
  let abortBusy = false;
  let diagRes = null;
  let panelLoreKick = false;
  async function runInjPreview() {
    injPv.busy = true; injPv.open = true; render();
    try { injPv.data = await E.previewInjection(''); } catch (e) { injPv.data = { err: String((e && e.message) || e) }; }
    injPv.busy = false; render();
  }
  // v2.9.4 「当前注入」 summary: preview UI only, never injected
  function injNowCard(m) {
    if (!m) return '';
    const row = (lbl, val) => '<div class="phys-injnow-row"><span>' + esc(lbl) + '</span><b>' + val + '</b></div>';
    const full = m.full.length ? m.full.map((x) => esc(x.name) + '<i>' + esc(x.why || '在场') + (x.missing.length ? '；缺 ' + esc(x.missing.join('、')) + '，已省略' : '') + '</i>').join('<br>') : '<em>无</em>';
    const gated = m.gated.length ? m.gated.map((x) => esc(x.name) + '<i>' + (x.why ? esc(x.why) + '；' : '') + '未初始化，仅简略</i>').join('<br>') : '<em>无</em>';
    return '<div class="phys-injnow" data-role="inj-now"><div class="phys-injnow-h">当前注入</div>'
      + row('详细', full) + row('简略', m.brief.length ? esc(m.brief.join('、')) : '<em>无</em>') + row('未初始化', gated) + ((m.frozen || []).length ? row('已停止追踪', esc(m.frozen.join('、')) + '<i>冻结数据，仅简略</i>') : '')
      + row('总长度', esc(String(m.total)) + ' 字') + '<p class="phys-injnow-note">仅用于预览，不会写入注入内容</p></div>';
  }
  function renderInjPreview() {
    if (!injPv.open) return '';
    if (injPv.busy) return '<p class="phys-muted">' + esc(t('ui6.pv.busy')) + '</p>';
    const d = injPv.data;
    if (!d) return '';
    if (d.err) return '<p class="phys-status err">' + esc(d.err) + '</p>';
    let h = injNowCard(d.summary);
    if (pausedNow()) h += '<p class="phys-status warn">' + esc(t('uiPause.noInject')) + '</p>'; // [tt-port:pause] 暂停中：下面是恢复后会注入的内容
    h += '<p class="phys-muted">' + esc(t('ui6.pv.scene', { full: d.full.join('、') || '—', brief: d.brief.join('、') || '—' })) + '</p>';
    if (d.mode === 'lore' && d.apiOk) {
      h += '<div class="phys-subhead">' + esc(t('ui6.pv.lore', { strategy: t('ui7.inj.strategy.' + d.strategy) })) + '</div><p class="phys-muted">' + esc(t('ui7.pv.scene.' + d.scene)) + '</p>';
      d.entries.forEach((en) => {
        const meta = [en.strategy === 'constant' ? t('ui6.pv.constant') : '', en.injectionPosition === 'atDepth' ? t('ui6.pv.depth', { n: en.injectionDepth }) : t('ui6.pv.before')].filter(Boolean).join(' · ');
        const rawE = (d.raw || []).find((x) => x.identifier === en.identifier);
        h += '<p class="phys-muted"><b>' + esc(en.name) + '</b> · ' + esc(meta) + (rawE && rawE.content !== en.content ? ' · <code>' + esc(rawE.content) + '</code>' : '') + '</p>' + (en.content ? '<pre class="phys-pre">' + esc(en.content) + '</pre>' : '<p class="phys-muted">' + esc(t('ui7.pv.empty')) + '</p>');
      });
      h += '<div class="phys-subhead">' + esc(t('ui6.pv.urgent')) + '</div>' + (d.urgent ? '<pre class="phys-pre">' + esc(d.urgent) + '</pre>' : '<p class="phys-muted">' + esc(t('ui6.pv.none')) + '</p>');
    } else {
      if (d.mode === 'lore') h += '<p class="phys-status err">' + esc(t('ui6.pv.noApi')) + '</p>';
      h += '<div class="phys-subhead">' + esc(t('ui6.pv.prefix')) + '</div>' + (d.prefix ? '<pre class="phys-pre" data-role="inj-preview">' + esc(d.prefix) + '</pre>' : '<p class="phys-muted">' + esc(t('ui.inject.previewEmpty')) + '</p>');
    }
    return h;
  }
  // v3.0.5an 角色卡诊断: which card text the 初始肉体 step reads (source / length / first 200 chars)
  let cardDiagOpen = false; const cardProbe = {}; let cardProbeBusy = '';
  function cardDiagSection() {
    const list = E.trackedList(st);
    const head = '<button type="button" class="phys-sec-h" data-act="carddiag-open" aria-expanded="' + (cardDiagOpen ? 'true' : 'false') + '"><span class="phys-sec-t">角色卡诊断</span><span class="phys-caret' + (cardDiagOpen ? ' open' : '') + '">' + CHEV2 + '</span></button>';
    if (!cardDiagOpen) return '<section class="phys-sec set phys-diag-sec">' + head + '</section>';
    let body = '<p class="phys-muted">显示生成初始肉体时实际读到的角色卡文字。读不到时会停止生成，不会凭空编造。</p>';
    if (!list.length) body += '<p class="phys-muted">还没有追踪的角色。</p>';
    list.forEach((c) => {
      const d = cardProbe[c.id] || E.cardDiag(c.id) || (c.baseMaterial && c.baseMaterial.cardSrc) || null;
      body += '<div class="phys-carddiag" data-role="carddiag"><div class="phys-row"><b>' + esc(c.name) + '</b>' +
        '<button type="button" class="phys-btn ghost" data-act="carddiag-probe" data-id="' + esc(c.id) + '"' + (cardProbeBusy ? ' disabled' : '') + '>' + (cardProbeBusy === c.id ? '检测中…' : '检测') + '</button></div>';
      if (!d) body += '<p class="phys-muted">还没有记录。点「检测」读取一次。</p>';
      else {
        body += (d.err ? '<p class="phys-status err">没有读到角色卡文字。初始肉体生成会被阻止。</p>' : '') + (d.warn ? '<p class="phys-status warn">没有她的角色卡文字，只能按世界书 / 聊天记录推断。</p>' : '') +
          '<p class="phys-muted">来源：' + esc(d.src || '—') + ' · 长度：' + esc(String(d.len || 0)) + ' 字' + (d.age ? ' · 卡内写明年龄：' + esc(String(d.age)) + ' 岁' : '') + (d.ts ? ' · ' + esc(new Date(d.ts).toLocaleString('zh-CN', { hour12: false })) : '') + '</p>' +
          (d.head ? '<pre class="phys-pre">' + esc(d.head) + '</pre>' : '') +
          (d.tried && d.tried.length ? '<p class="phys-muted">尝试过：' + esc(d.tried.join('；')) + '</p>' : '');
      }
      body += '</div>';
    });
    return '<section class="phys-sec set open phys-diag-sec">' + head + '<div class="phys-sec-b">' + body + '</div></section>';
  }
  // v2.7.4 世界书诊断: always visible, runs each step and prints result + error for screenshots
  function loreDiagSection() {
    const l = st.lore || {};
    let stat;
    if (l.ok) stat = '<p class="phys-status ok">' + esc(t('ui9.diag.ok', { id: l.bookId != null ? l.bookId : '—', name: l.name || '—' })) + '</p>';
    else if (st.meta && st.meta.autoRecog && st.meta.autoRecog.busy && Date.now() - st.meta.autoRecog.busy < 180000) stat = '<p class="phys-muted">' + esc(t('ui10.recog.busy')) + '</p>';
    else if (l.pending) stat = '<p class="phys-muted">' + esc(t('ui9.lore.pending', { n: l.tries || 1 })) + '</p>';
    else if (l.err === 'no_lorebook_api') stat = '<p class="phys-muted">' + esc(t('ttLore.noApi')) + '</p>'; /* [tt-port:lore-msg] */
    else if (l.err) stat = '<p class="phys-status err">' + esc(t('ui9.diag.last', { err: l.err })) + '</p>';
    else stat = '<p class="phys-muted">' + esc(t('ui6.lore.idle')) + '</p>';
    let out = '';
    if (diagRes) {
      out = '<ol class="phys-diag">' + diagRes.steps.map((x) => '<li class="' + (x.warn ? 'warn' : (x.ok ? 'ok' : 'bad')) + '"><b>' + esc(t('ui9.diag.step.' + x.step) === 'ui9.diag.step.' + x.step ? x.step : t('ui9.diag.step.' + x.step)) + '</b> ' +
        '<span>' + esc(x.warn ? t('ui10.diag.warn') : (x.ok ? t('ui9.diag.pass') : t('ui9.diag.fail'))) + '</span>' + (x.info ? '<div class="phys-muted">' + esc(x.info) + '</div>' : '') + (x.err ? '<div class="phys-status err">' + esc(x.err) + '</div>' : '') + '</li>').join('') + '</ol>' +
        '<p class="' + (diagRes.ok ? 'phys-status ok' : 'phys-status err') + '">' + esc(diagRes.ok ? t('ui9.diag.done') : t('ui9.diag.failed', { err: diagRes.err || '—' })) + '</p>' +
        '<p class="phys-muted">' + esc(t('ui9.diag.time', { t: diagRes.at })) + '</p>';
    }
    // v3.0.5k: collapsible, default collapsed, state remembered on this device
    if (!diagOpen) return '<section class="phys-sec set phys-diag-sec"><button type="button" class="phys-sec-h" data-act="diag-open" aria-expanded="false"><span class="phys-sec-t">' + esc(t('ui9.diag.title')) + '</span><span class="phys-caret">' + CHEV2 + '</span></button></section>';
    return '<section class="phys-sec set open phys-diag-sec"><button type="button" class="phys-sec-h" data-act="diag-open" aria-expanded="true"><span class="phys-sec-t">' + esc(t('ui9.diag.title')) + '</span><span class="phys-caret open">' + CHEV2 + '</span></button><div class="phys-sec-b">' + stat +
      '<p class="phys-muted">' + esc(t('ui9.diag.hint')) + '</p>' +
      (E.trackedList(st).length ? '' : '<p class="phys-status warn">' + esc(t('ui10.diag.empty')) + '</p>') +
      '<div class="phys-row"><button type="button" class="phys-btn" data-act="lore-diag"' + (diagBusy ? ' disabled' : '') + '>' + esc(diagBusy ? t('ui9.diag.running') : t('ui9.diag.btn')) + '</button>' +
      '<button type="button" class="phys-btn ghost" data-act="lore-rescan"' + (diagBusy ? ' disabled' : '') + '>' + esc(t('ui10.diag.rescan')) + '</button></div>' + out + '</div></section>';
  }
  function loreStatus() {
    const l = st.lore || {};
    if (!injDraft || injDraft.mode !== 'lore') return '';
    if (st.meta && st.meta.autoRecog && st.meta.autoRecog.busy && Date.now() - st.meta.autoRecog.busy < 180000) return '<p class="phys-muted">' + esc(t('ui10.recog.busy')) + '</p>';
    if (!l.ok && l.pending) return '<p class="phys-muted">' + esc(t('ui9.lore.pending', { n: l.tries || 1 })) + '</p>';
    if (l.ok) return '<p class="phys-status ok">' + esc(t('ui6.lore.ok', { name: l.name || '—', strategy: t('ui7.inj.strategy.' + (l.strategy === 'direct' ? 'direct' : 'vars')) })) + '</p>' + (l.strategy !== 'direct' ? '<p class="phys-muted">' + esc(t('ui7.inj.getvarNote')) + '</p>' : '');
    if (l.err === 'no_lorebook_api') return '<p class="phys-muted">' + esc(t('ttLore.noApi')) + '</p>'; /* [tt-port:lore-msg] */
    if (l.err) return '<p class="phys-status err">' + esc(t('ui6.lore.err', { err: l.err })) + '</p>';
    return '<p class="phys-muted">' + esc(t('ui6.lore.idle')) + '</p>';
  }

  /* ---- undo ---- */
  async function doUndo(id) {
    try {
      const hist = st.history || [];
      const idx = id ? hist.findIndex((h) => h.id === id) : hist.length - 1;
      if (idx < 0) return;
      const count = hist.length - idx;
      if (count > 1 && !(await confirmAsk(t('ui.confirm.undoMulti', { count: count })))) return;
      const r = await E.undoHistory(id || null);
      await refreshFromStore(true);
      await toast('ui.hist.undone', { count: r.undone });
    } catch (e) { await toast('ui.error.save'); }
  }
  const fmtTime = (ts) => { try { const d = new Date(ts); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); } catch (e) { return ''; } };
  function renderHistory(limit) {
    const hist = (st.history || []).slice().reverse().slice(0, limit);
    if (!hist.length) return '<p class="phys-muted">' + esc(t('ui.hist.empty')) + '</p>';
    let h = '<div class="phys-hist">';
    hist.forEach((x, i) => {
      const d = E.describeEntry(x);
      const shown = d.lines.slice(0, 3);
      h += '<div class="phys-hist-i"><div class="phys-hist-b"><div class="phys-hist-t">' + esc(d.title) + ' <em>' + esc(fmtTime(x.ts)) + '</em></div>' +
        '<div class="phys-hist-l">' + shown.map((l) => esc(l)).join('<br>') + (d.lines.length > 3 ? '<br>' + esc(t('ui.hist.more', { n: d.lines.length - 3 })) : '') + '</div></div>' +
        '<button type="button" class="phys-btn ghost small" data-act="undo-entry" data-id="' + esc(x.id) + '">' + esc(t('ui.hist.undo')) + '</button></div>';
    });
    return h + '</div>' + (limit < (st.history || []).length ? '<p class="phys-muted">' + esc(t('ui.hist.older', { n: (st.history || []).length - limit })) + '</p>' : '');
  }
  const undoBtn = () => (st.history && st.history.length ? '<button type="button" class="phys-btn ghost" data-act="undo-last">' + esc(t('ui.hist.undoLast')) + '</button>' : '');

  /* ---- AI scan ---- */
  async function startScan() {
    if (scan.busy) return;
    scan.busy = true; scan.res = null; scan.cands = []; render();
    try {
      const r = await E.aiScan();
      scan.res = r;
      scan.cands = (r.candidates || []).map((c) => JSON.parse(JSON.stringify(c)));
    } catch (e) { scan.res = { source: 'heuristic', fallback: 'error', candidates: [], hiddenMale: 0, members: 0, lore: 0, msgs: 0 }; scan.cands = []; }
    scan.busy = false; render();
  }
  async function openScan() {
    await editPanel((p) => { p.open = true; p.collapsed = false; p.view = 'scan'; });
    render();
    startScan();
  }
  async function applyScanDraft() {
    if (scan.applying) return;
    scan.applying = true; render();
    try {
      const r = await E.applyScan(scan.cands);
      const first = scan.cands.find((c) => c.track && !c.minor);
      if (first) sel = String(first.key);
      scan.res = null; scan.cands = [];
      await editPanel((p) => { p.view = 'main'; });
      await refreshFromStore(true);
      await toast('ui.scan.applied', { n: r.applied, rejected: r.rejected });
    } catch (e) { await toast('ui.error.save'); }
    scan.applying = false; render();
  }
  function candHtml(c) {
    const tags = [];
    tags.push(t(c.inChat ? 'ui.scan.tag.member' : 'ui.scan.tag.npc'));
    if (c.existing) tags.push(t('ui.scan.tag.existing'));
    tags.push(t('ui.scan.gender.' + c.gender));
    tags.push(c.age != null ? t('ui.offspring.ageFmt', { age: c.age }) : t('ui.scan.ageUnknown'));
    const k = esc(c.key);
    let h = '<div class="phys-cand' + (c.minor ? ' minor' : '') + '" data-key="' + k + '"><label class="phys-check"><input type="checkbox" data-act="scan-track" data-key="' + k + '"' + (c.track && !c.minor ? ' checked' : '') + (c.minor ? ' disabled' : '') + '><span class="phys-cand-n">' + esc(c.name) + '</span></label>' +
      '<div class="phys-cand-tags">' + tags.map((x) => '<span>' + esc(x) + '</span>').join('') + (c.minor ? '<span class="bad">' + esc(t('ui.scan.minor')) + '</span>' : '') + '</div>';
    if (c.reason && c.reason !== 'lorebook') h += '<p class="phys-muted">' + esc(c.reason) + '</p>';
    if (c.minor) return h + '<p class="phys-muted">' + esc(t('ui.scan.minorHint')) + '</p>' + adultAskHtml('scan', c.key, c.name) + '</div>'; /* [tt-port:age-ui] */
    h += '<div class="phys-grid3"><label>' + esc(t('ui.cycle.day')) + '<input type="number" inputmode="numeric" data-scan="day" data-key="' + k + '" value="' + c.cycle.day + '" min="1" max="' + c.cycle.length + '"></label>' +
      '<label>' + esc(t('ui.cycle.length')) + '<input type="number" inputmode="numeric" data-scan="length" data-key="' + k + '" value="' + c.cycle.length + '" min="21" max="45"></label>' +
      '<label>' + esc(t('ui.cycle.period')) + '<input type="number" inputmode="numeric" data-scan="period" data-key="' + k + '" value="' + c.cycle.periodLength + '" min="1" max="10"></label></div>';
    h += '<label class="phys-check"><input type="checkbox" data-act="scan-preg" data-key="' + k + '"' + (c.pregnant ? ' checked' : '') + '><span>' + esc(t('ui.fertility.pregnant')) + '</span></label>';
    if (c.pregnant) h += '<div class="phys-grid3"><label>' + esc(t('ui.fertility.pregnancyDay')) + '<input type="number" inputmode="numeric" data-scan="pday" data-key="' + k + '" value="' + c.pregnancyDay + '" min="1" max="290"></label></div>';
    return h + '</div>';
  }
  function renderScan() {
    let h = '<p class="phys-muted">' + esc(t('ui.scan.intro')) + '</p>';
    if (scan.busy) return h + '<p class="phys-status info" role="status">' + esc(t('ui.scan.working')) + '</p>';
    if (!scan.res) return h + '<div class="phys-row"><button type="button" class="phys-btn big" data-act="scan-start">' + esc(t('ui.scan.button')) + '</button><button type="button" class="phys-btn ghost" data-act="scan-cancel">' + esc(t('ui.scan.cancel')) + '</button></div>';
    const r = scan.res;
    if (r.source === 'ai') h += '<p class="phys-status ok" role="status">' + esc(t('ui.scan.srcAi', { n: scan.cands.length })) + '</p>';
    else h += '<p class="phys-status err" role="status">' + esc(t('ui.scan.srcHeur') + ' ' + t('ui.scan.fb.' + (['parse', 'empty', 'unavailable', 'timeout', 'network', 'http', 'config', 'badresponse'].indexOf(r.fallback) >= 0 ? r.fallback : 'error'))) + '</p>';
    h += '<p class="phys-muted">' + esc(t('ui.scan.ctx', { members: r.members, lore: r.lore, msgs: r.msgs })) + (r.hiddenMale ? ' ' + esc(t('ui.scan.hiddenMale', { n: r.hiddenMale })) : '') + '</p>';
    if (!scan.cands.length) h += '<p class="phys-muted">' + esc(t('ui.scan.none')) + '</p>';
    scan.cands.forEach((c) => { h += candHtml(c); });
    h += '<div class="phys-row phys-scanbar"><button type="button" class="phys-btn big" data-act="scan-apply"' + (scan.applying || !scan.cands.some((c) => c.track && !c.minor) ? ' disabled' : '') + '>' + esc(t('ui.scan.apply')) + '</button>' +
      '<button type="button" class="phys-btn ghost" data-act="scan-start">' + esc(t('ui.scan.again')) + '</button><button type="button" class="phys-btn ghost" data-act="scan-cancel">' + esc(t('ui.scan.cancel')) + '</button></div>';
    return h;
  }

  /* ---- rendering: shared bits ---- */
  const phaseOf = (c) => (c.fertility.pregnant ? 'pregnant' : c.cycle.phase);
  function stepper(path, val) {
    return '<span class="phys-step"><button type="button" class="phys-mini" data-act="dec" data-path="' + path + '" aria-label="' + esc(t('ui.dec')) + '">−</button>' +
      '<input type="number" inputmode="numeric" data-path="' + path + '" value="' + esc(val) + '">' +
      '<button type="button" class="phys-mini" data-act="inc" data-path="' + path + '" aria-label="' + esc(t('ui.inc')) + '">+</button></span>';
  }
  function section(id, titleHtml, open, bodyHtml, extraCls) {
    return '<section class="phys-sec ' + (extraCls || '') + (open ? ' open' : '') + '">' +
      '<button type="button" class="phys-sec-h" data-act="toggle" data-sec="' + id + '" aria-expanded="' + (open ? 'true' : 'false') + '">' +
      '<span class="phys-sec-t">' + titleHtml + '</span><span class="phys-caret' + (open ? ' open' : '') + '">' + CHEV2 + '</span></button>' +
      (open ? '<div class="phys-sec-b">' + bodyHtml + '</div>' : '') + '</section>';
  }
  function sSection(id, titleHtml, bodyHtml) {
    const open = !!sOpen[id];
    return '<section class="phys-sec set' + (open ? ' open' : '') + '">' +
      '<button type="button" class="phys-sec-h" data-act="sopen" data-sec="' + id + '" aria-expanded="' + (open ? 'true' : 'false') + '">' +
      '<span class="phys-sec-t">' + titleHtml + '</span><span class="phys-caret' + (open ? ' open' : '') + '">' + CHEV2 + '</span></button>' +
      (open ? '<div class="phys-sec-b">' + bodyHtml + '</div>' : '') + '</section>';
  }
  function tabsHtml(list, c) {
    let h = '<div class="phys-tabs" role="tablist">';
    list.forEach((x) => {
      const on = c && chKey(x) === chKey(c);
      h += '<button type="button" role="tab" class="phys-tab' + (on ? ' on' : '') + (isOff(x) ? ' skip' : '') + '" data-act="select" data-id="' + esc(chKey(x)) + '" aria-selected="' + (on ? 'true' : 'false') + '">' + esc(x.name || ('#' + x.id)) + '</button>';
    });
    return h + '</div>';
  }
  // small muted source tag: AI-written vs template fallback (only when AI descriptions are on)
  function srcTag(src) {
    if (!E.config().aiDescribe) return '';
    if (src === 'carry') return '<sup class="phys-src carry" title="' + esc(t('ui299.src.carryTip')) + '">' + esc(t('ui299.src.carry')) + '</sup>';
    return src === 'ai' ? '<sup class="phys-src ai" title="' + esc(t('ui.ai.tagTip')) + '">' + esc(t('ui.ai.tag')) + '</sup>' : '<sup class="phys-src tpl" title="' + esc(t('ui.ai.tplTip')) + '">' + esc(t('ui.ai.tpl')) + '</sup>';
  }
  function bubble(side, tone, label, text, src, sub) {
    return '<div class="phys-bubble ' + side + ' b-' + tone + '"><span class="phys-blabel">' + esc(label) + (src ? srcTag(src) : '') + '</span><span class="phys-btext">' + esc(text) + '</span>' + (sub ? '<span class="phys-bsub">' + esc(sub) + '</span>' : '') + '</div>';
  }
  function offReason(c) {
    if (c.skippedReason) return t('ui.skip.' + c.skippedReason, { name: c.name });
    if (c.trackOff) return t('ui.skip.off', { name: c.name });
    return '';
  }

  /* ---- rendering: main (read-only) ---- */
  // Proportional bar: segment widths follow her own phase lengths; delay adds a '推迟中' tail; pause = grey; pregnant = 40-week bar.
  function renderCycleBar(c, info) {
    const pct = (n, tot) => (n / tot * 100).toFixed(2) + '%';
    if (c.fertility.pregnant) {
      const pi = E.pregInfo(c, st.story && st.story.date);
      const segs = [['early', 13], ['mid', 14], ['late', 9], ['term', 4]];
      let h = '<div class="phys-bar2 preg" role="img" aria-label="' + esc(t('ui.bar.preg', { w: pi.week })) + '">';
      segs.forEach((x) => { h += '<i class="sg s-' + x[0] + (pi.stage === x[0] ? ' on' : '') + '" style="width:' + pct(x[1], 40) + '"><em>' + esc(t('ui.preg.stage.' + x[0])) + '</em></i>'; });
      (c.fertility.risks || []).forEach((r) => { const w = r.w != null ? r.w : pi.week; h += '<b class="risk sev-' + r.sev + '" style="left:' + pct(Math.min(40, w + 0.5), 40) + '" title="' + esc(t('risk.' + r.k) + (r.why ? '：' + r.why : '')) + '"></b>'; });
      h += '<s class="now" style="left:' + pct(Math.min(40, pi.day / 7), 40) + '"></s></div>';
      h += '<div class="phys-bar2-cap"><span>' + esc(t('ui.bar.week', { w: pi.week, d: pi.wd })) + '</span><span>' + esc(t('ui.bar.weeks40')) + '</span></div>';
      return h;
    }
    if (info.paused || c.cycle.menopause) {
      return '<div class="phys-bar2 paused" role="img" aria-label="' + esc(t('ui.bar.paused')) + '"><i class="sg s-paused" style="width:100%"><em>' + esc(c.cycle.menopause ? t('ui.histstrip.meno') : t('ui.bar.paused')) + '</em></i></div>' +
        (c.cycle.pauseWhy ? '<div class="phys-bar2-cap"><span>' + esc(c.cycle.pauseWhy) + '</span></div>' : '');
    }
    const L = info.length, P = info.period, ov = info.ovulationDay, fs = info.fertileStart, fe = info.fertileEnd;
    const tot = Math.max(L, info.effLength);
    const segs = [['menstrual', P, t('ui.phase.menstrual')], ['follicular', Math.max(0, fs - P - 1), t('ui.phase.follicular')], ['fertile', Math.max(1, fe - fs + 1), t('ui.phase.ovulation')], ['luteal', Math.max(0, L - fe), t('ui.phase.luteal')]];
    let h = '<div class="phys-bar2" role="img" aria-label="' + esc(t('ui.cycle.bar')) + '">';
    segs.forEach((x) => { if (x[1] > 0) h += '<i class="sg s-' + x[0] + ((info.phase === x[0] && !info.late) || (x[0] === 'fertile' && (info.phase === 'ovulation' || info.fertile)) ? ' on' : '') + '" style="width:' + pct(x[1], tot) + '"><em>' + esc(x[2]) + '</em></i>'; });
    if (info.effLength > L) h += '<i class="sg s-late' + (info.late ? ' on' : '') + '" style="width:' + pct(info.effLength - L, tot) + '"><em>' + esc(t('ui.bar.late')) + '</em></i>';
    h += '<b class="ov" style="left:' + pct(ov - 0.5, tot) + '"></b><s class="now" style="left:' + pct(info.day - 0.5, tot) + '"></s></div>';
    h += '<div class="phys-bar2-cap"><span>' + esc(t('ui.bar.cap', { day: info.day, len: L, p: P, f: info.follicular, l: info.luteal })) + '</span>' +
      (info.delay ? '<span class="warn">' + esc(info.delay > 0 ? t('ui.anom.late', { n: info.delay }) : t('ui.anom.early', { n: -info.delay })) + '</span>' : '') + '</div>';
    return h;
  }
  // Red-accent anomaly strip: delay / pause / cycle anomalies / pregnancy risks (with reasons).
  // v3.0.5s one 异常/风险 component for 淫宫潮汐 / 孕宫胎动 / 产后余韵 (same look, same AI add / treat / fade / merge logic)
  const FADE_D = { mild: 21, moderate: 35, severe: 56 };
  const BABY_ZH = ['', '单胎', '双胎', '三胎', '四胎', '五胎', '六胎'];
  function anomItem(a, label, risk) { const left = FADE_D[a.sev] ? Math.max(1, FADE_D[a.sev] - (a.quiet || 0)) : null; return { k: label, why: a.why, sev: a.sev, risk: !!risk, left: left, floor: a.floor, w: a.w }; }
  function renderAnomBox(items, title, opts) {
    opts = opts || {};
    if (!items.length) return opts.empty ? '<p class="phys-none">' + esc(opts.empty) + '</p>' : '';
    return '<div class="phys-anoms' + (opts.cls ? ' ' + opts.cls : '') + '" role="status">' + (title ? '<span class="phys-anoms-k">' + esc(title) + '</span>' : '') + items.map((x) => '<div class="phys-anom sev-' + x.sev + '"><b>' + esc(x.k) + '</b><em>' + esc(t('ui.sev.' + x.sev)) + '</em>' + (x.why ? '<span>' + esc(x.why) + '</span>' : '') +
      (x.left != null ? '<small class="anom-meta">' + (x.w != null ? '孕' + x.w + '周起 · ' : '') + (x.floor != null ? '#' + x.floor + ' · ' : '') + '不再复发约 ' + x.left + ' 天后减轻</small>' : '') + '</div>').join('') +
      (opts.hint ? '<p class="phys-muted anom-hint">' + esc(opts.hint) + '</p>' : '') + '</div>';
  }
  const RISK_HINT = '剧情里治疗、用药、静养或施法后会消除或减轻；同类风险会合并，久不复发会自然消退。';
  function renderRiskBox(list, empty) {
    const l = list || []; const mat = l.filter((r) => E.MATERNAL_RISKS.indexOf(r.k) >= 0), fet = l.filter((r) => E.MATERNAL_RISKS.indexOf(r.k) < 0);
    const it = (r) => anomItem(r, E.riskLabel(r.k, r.label), true);
    if (!l.length) return renderAnomBox([], '', { empty: empty });
    return '<div class="phys-riskgroups">' + (mat.length ? renderAnomBox(mat.map(it), t('ui300.risk.mat'), { cls: 'phys-rg' }) : '') + (fet.length ? renderAnomBox(fet.map(it), t('ui300.risk.fet'), { cls: 'phys-rg' }) : '') + '</div><p class="phys-muted anom-hint">' + esc(RISK_HINT) + '</p>';
  }
  function renderBirthLog(c, scope) {
    const b = E.birthOf(c); const l = (b.log || []).filter((x) => x.scope === scope).slice(-4).reverse();
    if (!l.length) return '';
    return '<div class="bt-log">' + l.map((x) => '<div class="bt-logi"><p>' + esc(x.text) + '</p><small>' + [x.floor != null ? '第 ' + x.floor + ' 楼' : '', x.why, x.days ? '恢复期 ' + (x.days > 0 ? '+' : '') + x.days + ' 天' : ''].filter(Boolean).map(esc).join(' · ') + '</small></div>').join('') + '</div>';
  }
  function birthText(c, keys) { const n = E.birthOf(c).now; return keys.filter((k) => n[k]).map((k) => '<div class="phys-line2"><span class="phys-lbl">' + esc(E.BIRTH_TEXT_ZH[k]) + '</span><p>' + esc(n[k]) + '</p></div>').join(''); }
  function renderAnoms(c) {
    const items = [];
    const cy = c.cycle, f = c.fertility;
    if (!f.pregnant && cy.delay) items.push({ k: cy.delay > 0 ? t('ui.anom.late', { n: cy.delay }) : t('ui.anom.early', { n: -cy.delay }), why: cy.delayWhy, sev: 'moderate' });
    if (!f.pregnant && cy.paused && !cy.menopause) items.push({ k: t('ui.bar.paused'), why: cy.pauseWhy, sev: 'severe' });
    (cy.anomalies || []).forEach((a) => items.push(anomItem(a, E.anomLabel(a.k, a.label))));
    // v3.0.5: always show the 异常栏 (empty state included) so mid-chat init / 重新生成本页 have a visible column
    if (!items.length) return '<div class="phys-anoms" role="status"><span class="phys-anoms-k">' + esc(t('ui.anom.title')) + '</span><p class="phys-muted">' + esc(t('ui.anom.empty')) + '</p></div>';
    return renderAnomBox(items, t('ui.anom.title'), { hint: (cy.anomalies || []).length ? '剧情里治疗、调养后会消除或减轻；同类异常会合并，久不复发会自然消退。' : '' });
  }
  function renderOffspringRO(c) {
    const list = c.fertility.offspring;
    if (!list.length) return '<p class="phys-muted">' + esc(t('ui.offspring.empty')) + '</p>';
    return list.map((o) => {
      const g = o.gender === 'female' ? t('ui.gender.female') : (o.gender === 'male' ? t('ui.gender.male') : '');
      const meta = [o.age != null ? t('ui.offspring.ageFmt', { age: o.age }) : '', g].filter(Boolean).join(' · ');
      return '<div class="phys-kid"><div class="phys-kid-b"><div class="phys-kid-n">' + esc(o.name || t('ui.offspring.unnamed')) + (o.guessed ? guessTag(true) : '') + '</div>' +
        (meta ? '<div class="phys-kid-m">' + esc(meta) + '</div>' : '') + (o.note ? '<div class="phys-kid-note">' + esc(o.note) + '</div>' : '') + '</div></div>';
    }).join('');
  }
  const fmtDate = (iso) => E.fmtStory(iso);
  function renderOrgans(c, cfg) {
    const oi = E.organInfo(c, cfg);
    const row = (cls, label, text, src) => '<div class="phys-organ ' + cls + '"><span class="phys-organ-k">' + esc(label) + '</span>' + srcTag(src) + '<p>' + esc(text) + '</p></div>';
    const muted = (cls, label) => '<div class="phys-organ ' + cls + ' off"><span class="phys-organ-k">' + esc(label) + '</span><p class="phys-muted">' + esc(t('ui.organ.notPregnant')) + '</p></div>';
    const pi = E.pregInfo(c, st.story && st.story.date);
    let pregRow;
    if (pi) {
      const risks = (c.fertility.risks || []).map((r) => t('risk.' + r.k) + '·' + t('ui.sev.' + r.sev)).join('、');
      pregRow = '<div class="phys-organ o-preg"><span class="phys-organ-k">' + esc(t('ui.organ.preg')) + '</span><p>' + esc(t('ui.organ.pregLine', { stage: t('ui.preg.stage.' + pi.stage), w: pi.week, d: pi.wd })) +
        (risks ? ' <span class="phys-riskline">' + esc(t('ui.organ.risks', { list: risks })) + '</span>' : ' ' + esc(t('ui.organ.noRisk'))) + '</p></div>';
    } else pregRow = muted('o-preg', t('ui.organ.preg'));
    return '<div class="phys-organs">' + row('o-uterus', t('ui.organ.uterus'), oi.uterus, oi.src.uterus) + row('o-ovary', t('ui.organ.ovary'), oi.ovary, oi.src.ovary) +
      (oi.embryo ? row('o-embryo', t('ui.organ.embryo'), oi.embryo, oi.src.embryo) : muted('o-embryo', t('ui.organ.embryo'))) + pregRow + '</div>';
  }
  function renderPreg(c, pi) {
    const stages = ['early', 'mid', 'late', 'term'];
    let h = '<div class="phys-preg">';
    h += '<div class="phys-preg-h"><span class="phys-stage s-' + pi.stage + '">' + esc(t('ui.preg.stage.' + pi.stage)) + '</span><span class="phys-preg-w">' + esc(t('ui.preg.week', { week: pi.week, wd: pi.wd })) + '</span></div>';
    h += '<div class="phys-gest" role="img" aria-label="' + esc(t('ui.preg.progress', { pct: Math.round(pi.progress * 100) })) + '"><span style="width:' + (pi.progress * 100).toFixed(1) + '%"></span>' +
      '<i style="left:' + (13 / 40 * 100).toFixed(1) + '%"></i><i style="left:' + (27 / 40 * 100).toFixed(1) + '%"></i><i style="left:' + (36 / 40 * 100).toFixed(1) + '%"></i></div>';
    h += '<div class="phys-gest-l">' + stages.map((x) => '<span class="' + (x === pi.stage ? 'on' : '') + '">' + esc(t('ui.preg.stage.' + x)) + '</span>').join('') + '</div>';
    h += '<p class="phys-body-desc">' + esc(t('preg.body.' + pi.body)) + '</p>';
    if (pi.due) h += '<p class="phys-note">' + esc(t(pi.remain >= 0 ? 'ui.preg.due' : 'ui.preg.dueOver', { date: fmtDate(pi.due), n: Math.abs(pi.remain) })) + '</p>';
    return h + '</div>';
  }
  // Gestation area: always the full structure; every field reads '无' when she is not pregnant.
  function renderGest(c, pi, oi) {
    const none = esc(t('ui2.l.none'));
    const stages = ['early', 'mid', 'late', 'term'];
    let h = '<div class="phys-gest2' + (pi ? '' : ' none') + '">';
    h += '<div class="phys-gest2-h"><span class="phys-lbl">' + esc(t('ui3.gest.title')) + '</span><b class="phys-stage' + (pi ? ' s-' + pi.stage : '') + '">' + (pi ? esc(t('ui.preg.stage.' + pi.stage)) : none) + '</b></div>';
    if (!pi) h += '<div class="phys-gest' + (pi ? '' : ' empty') + '" role="img" aria-label="' + esc(pi ? t('ui.preg.progress', { pct: Math.round(pi.progress * 100) }) : t('ui2.l.notPreg')) + '">' + (pi ? '<span style="width:' + (pi.progress * 100).toFixed(1) + '%"></span>' : '') +
      '<i style="left:' + (13 / 40 * 100).toFixed(1) + '%"></i><i style="left:' + (27 / 40 * 100).toFixed(1) + '%"></i><i style="left:' + (36 / 40 * 100).toFixed(1) + '%"></i></div>';
    if (!pi) h += '<div class="phys-gest-l">' + stages.map((x) => '<span class="' + (pi && x === pi.stage ? 'on' : '') + '">' + esc(t('ui.preg.stage.' + x)) + '</span>').join('') + '</div>';
    h += '<div class="phys-kvs k3">' + kv(t('ui3.gest.week'), pi ? esc(t('ui.preg.week', { week: pi.week, wd: pi.wd })) : none) +
      kv(t('ui3.gest.stage'), pi ? esc(t('ui.preg.stage.' + pi.stage)) : none) +
      kv(t('ui296.gest.conceived'), pi && pi.conceived ? esc(fmtDate(pi.conceived)) : none) +
      kv(t('ui296.gest.father'), pi ? esc(pi.father || t('ui296.gest.fatherNa')) : none) +
      kv('胎数', pi ? esc(BABY_ZH[E.babiesOf(c)] || (E.babiesOf(c) + ' 胎')) + '<small> · 受孕时掷定</small>' : none) +
      kv(t('ui3.gest.due'), pi && pi.due ? esc(fmtDate(pi.due)) + (pi.remain >= 0 ? '<small> · ' + esc(t('ui3.gest.remain', { n: pi.remain })) + '</small>' : '<small> · ' + esc(t('ui3.gest.over', { n: -pi.remain })) + '</small>') : none) + '</div>';
    h += '<div class="phys-line2"><span class="phys-lbl">' + esc(t('ui3.gest.body')) + '</span><p' + (pi ? '' : ' class="phys-none"') + '>' + (pi ? esc(t('preg.body.' + pi.body)) : none) + '</p></div>';
    h += '<div class="phys-line2"><span class="phys-lbl">' + esc(t('ui2.l.fetus')) + (pi && oi.embryo ? srcTag(oi.src.embryo) : '') + '</span><p' + (pi && oi.embryo ? '' : ' class="phys-none"') + '>' + (pi && oi.embryo ? esc(oi.embryo) : none) + '</p></div>';
    const risks = []; if (false) h += '<div class="phys-line2"><span class="phys-lbl">' + esc(t('ui2.l.risks')) + '</span><p' + (risks.length ? '' : ' class="phys-none"') + '>' + (risks.length ? risks.map((r) => '<span class="phys-risk sev-' + r.sev + '">' + esc(t('risk.' + r.k)) + '<em>' + esc(t('ui.sev.' + r.sev)) + '</em></span>' + (r.why ? ' <small>' + esc(r.why) + '</small>' : '')).join('<br>') : (pi ? esc(t('ui296.gest.noRisk')) : none)) + '</p></div>';
    return h + '</div>';
  }
  function renderCalendar(c, cfg, forceMode) {
    const iso = st.story && st.story.date;
    const today = E.dayNum(iso);
    if (today === null) return '<p class="phys-muted">' + esc(t('ui.cal.noDate')) + '</p>';
    const y0 = +iso.slice(0, 4), m0 = +iso.slice(5, 7) - 1;
    const first = new Date(Date.UTC(y0, m0 + calOff, 1));
    const y = first.getUTCFullYear(), m = first.getUTCMonth();
    const startN = Date.UTC(y, m, 1) / 864e5;
    const days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    const lead = (first.getUTCDay() + 6) % 7; // Monday first
    const pregOk = !!c.fertility.pregnant;
    const mode = forceMode || calMode || (pregOk ? 'preg' : 'norm');
    let h = forceMode ? '' : '<div class="phys-calmode" role="tablist">' + ['norm', 'preg'].map((k) => '<button type="button" role="tab" class="phys-btn ghost small' + (mode === k ? ' on' : '') + '" data-act="cal-mode" data-mode="' + k + '"' + '' + ' aria-selected="' + (mode === k ? 'true' : 'false') + '">' + esc(t('ui296.cal.' + k)) + '</button>').join('') + '</div>';
    if (mode === 'preg' && !pregOk) h += '<p class="phys-cal-sum phys-empty-note">' + esc(t('ui298.cal.noPreg')) + '</p>';
    else if (mode === 'preg') { const pi0 = E.pregInfo(c, iso); h += '<p class="phys-cal-sum">' + esc(t('ui296.cal.pregSum', { w: pi0.week, d: pi0.wd, stage: t('ui.preg.stage.' + pi0.stage), due: pi0.due ? fmtDate(pi0.due) : '—', n: Math.max(0, pi0.remain) })) + '</p>'; }
    else if (pregOk) h += '<p class="phys-cal-sum">' + esc(t('ui296.cal.normPreg')) + '</p>';
    h += '<div class="phys-cal-h"><button type="button" class="phys-ico" data-act="cal-prev" aria-label="' + esc(t('ui.cal.prev')) + '">' + ICON.prev + '</button>' +
      '<span class="phys-cal-t">' + esc(E.fmtMonthHead(y, m + 1)) + '</span>' +
      (calOff ? '<button type="button" class="phys-btn ghost small" data-act="cal-today">' + esc(t('ui.cal.back')) + '</button>' : '') +
      '<button type="button" class="phys-ico" data-act="cal-next" aria-label="' + esc(t('ui.cal.next')) + '">' + ICON.next + '</button></div>';
    h += '<div class="phys-cal2 phys-noswipe">' + [1, 2, 3, 4, 5, 6, 0].map((d) => '<b>' + esc(t('ui.cal.wd.' + d)) + '</b>').join('');
    for (let i = 0; i < lead; i++) h += '<span class="e"></span>';
    for (let d = 1; d <= days; d++) {
      const n = startN + d - 1;
      let cls;
      if (mode === 'preg') cls = pregOk ? ['d', 'pg'].concat(E.pregCalClass(c, n, today)) : ['d', 'pg', 't-pre'].concat(n === today ? ['t-today'] : []);
      else { cls = ['d'].concat(E.calClass(c, n, today, cfg)); if (pregOk && n >= today - (c.fertility.pregnancyDay || 1) + 1) cls = ['d', 't-pre'].concat(n === today ? ['t-today'] : []); }
      if (n === calSel) cls.push('sel');
      h += '<span class="' + cls.join(' ') + '" data-act="cal-day" data-n="' + n + '" role="button" tabindex="0"><em class="num">' + d + '</em></span>';
    }
    if (mode === 'preg') h += '</div><div class="phys-legend3">' + [['conceive', 't-conceive'], ['early', 't-pg-early'], ['mid', 't-pg-mid'], ['late', 't-pg-late'], ['term', 't-pg-term'], ['mile', 't-mile'], ['due', 't-due'], ['anom', 't-anom'], ['today', 't-today']].map((k) => '<span class="lg"><i class="sw d pg ' + k[1] + '"><em></em></i>' + esc(t('ui296.lg.' + k[0])) + '</span>').join('') + '</div>';
    else h += '</div><div class="phys-legend3">' + [['period', 't-period'], ['ovulation', 't-ovu'], ['fertile', 't-fertile'], ['safe', 't-safe'], ['recov', 't-recov'], ['anom', 't-anom'], ['today', 't-today'], ['pred', 't-pred t-fertile']].map((k) => '<span class="lg"><i class="sw d ' + k[1] + '"><em></em></i>' + esc(t(k[0] === 'recov' ? 'ui297.lg.recov' : 'ui2.lg.' + k[0])) + '</span>').join('') + '</div>';
    if (calSel != null && mode === 'preg' && !pregOk) h += '';
    else if (calSel != null) h += mode === 'preg' ? renderPregDay(c, calSel, today) : renderDayCard(c, calSel, today, cfg);
    return h;
  }
  let cjOpen = false;
  function cjLine(x) {
    const res = t(x.result === 'yes' ? 'ui296.cj.yes' : 'ui296.cj.no');
    return x.src === 'story' ? t('ui297.cj.story', { res: res }) : t('ui297.cj.plain', { p: E.fmtPct(x.pct), r: (Math.round(Number(x.roll) * 100) / 100).toFixed(2), res: res }) + (x.note ? '（' + x.note + '）' : (x.pctSrc === 'carry' ? '（沿用之前楼层的几率）' : ''));
  }
  function cjItem(x, big) {
    return '<div class="phys-cj-i ' + (x.result === 'yes' ? 'yes' : 'no') + (big ? ' big' : '') + '"><b>' + esc(t(x.result === 'yes' ? 'ui296.cj.yes' : 'ui296.cj.no')) + '</b>' +
      '<span>' + esc(t('ui.log.floor', { n: x.floor != null ? x.floor : '—' }) + (x.iso ? ' · ' + fmtDate(x.iso) : '') + (x.father ? ' · ' + t('ui297.cj.father', { n: x.father }) : '')) + '</span>' +
      '<small>' + esc(cjLine(x)) + '</small></div>';
  }
  function renderConceptions(c) {
    const list = (c.fertility.conceptions || []).slice().reverse();
    if (!list.length) return '<p class="phys-muted">' + esc(t('ui296.cj.empty')) + '</p>';
    let h = '<div class="phys-cj">' + cjItem(list[0], true);
    if (list.length > 1) {
      h += '<button type="button" class="phys-btn ghost small phys-cj-more" data-act="cj-toggle" aria-expanded="' + (cjOpen ? 'true' : 'false') + '">' + esc(t(cjOpen ? 'ui297.cj.less' : 'ui297.cj.more', { n: list.length - 1 })) + '</button>';
      if (cjOpen) h += '<div class="phys-cj-old">' + list.slice(1, 40).map((x) => cjItem(x, false)).join('') + '</div>';
    }
    return h + '</div>';
  }
  function renderPregDetail(c) {
    const d = E.pregDetail(c, st.story && st.story.date); if (!d) return '';
    const row = (k, v) => '<div class="phys-line2"><span class="phys-lbl">' + esc(t(k)) + '</span><p>' + esc(v) + '</p></div>';
    return '<div class="phys-pdetail"><div class="phys-pd-top"><b class="num">' + esc(t('ui298.pd.wk', { w: d.week, d: d.wd })) + '</b><span>' + esc(t('ui.preg.stage.' + d.stage)) + '</span><em>' + esc(d.remain >= 0 ? t('ui298.pd.count', { n: d.remain }) : t('ui3.gest.over', { n: -d.remain })) + '</em></div>' +
      row('ui298.pd.dev', d.dev) + row('ui298.pd.sym', d.sym) + row('ui298.pd.check', d.check) + row('ui298.pd.next', d.next) + '</div>';
  }
  // v2.9.9 孕育与血脉 visual: 40-week track, countdown ring, growth, vitals, milestones, risk gauge, body chips (CSS/SVG only)
  function renderGestViz(c) {
    const v = E.gestViz(c, st.story && st.story.date); if (!v) return '';
    const r2 = (x) => (Math.round(x * 100) / 100).toString();
    let h = '<div class="phys-gv st-' + v.stage + '">';
    // 1 track
    h += '<div class="phys-gv-head"><b class="num">' + esc(t('ui298.pd.wk', { w: v.week, d: v.wd })) + '</b><span class="phys-gv-stage">' + esc(t('ui.preg.stage.' + v.stage)) + '</span><em>' + esc(t('ui299.gv.pct', { p: Math.round(v.pos) })) + '</em></div>';
    h += '<div class="phys-gv-track" role="img" aria-label="' + esc(t('ui.preg.progress', { pct: Math.round(v.pos) })) + '" data-pos="' + r2(v.pos) + '">' + v.segs.map((g) => { const fill = Math.max(0, Math.min(100, (v.pos - g.from) / g.w * 100)); return '<span class="seg s-' + g.k + '" style="left:' + r2(g.from) + '%;width:' + r2(g.w) + '%"><i style="width:' + r2(fill) + '%"></i></span>'; }).join('') +
      '<b class="mk" style="left:' + r2(v.pos) + '%"></b></div>';
    h += '<div class="phys-gv-tri">' + v.segs.map((g) => '<span class="s-' + g.k + (g.k === v.stage ? ' on' : '') + '" style="width:' + r2(g.w) + '%">' + esc(t('ui.preg.stage.' + g.k)) + '</span>').join('') + '</div>';
    h += '<div class="phys-gv-ticks"><span>0</span><span>10</span><span>20</span><span>30</span><span>' + esc(t('ui299.gv.w40')) + '</span></div>';
    // 2 ring + growth
    const C = 2 * Math.PI * 30;
    h += '<div class="phys-gv-row"><div class="phys-gv-ring" data-ring="' + r2(v.ring) + '"><svg viewBox="0 0 76 76" aria-hidden="true"><circle class="bg" cx="38" cy="38" r="30"></circle><circle class="fg" cx="38" cy="38" r="30" stroke-dasharray="' + r2(C) + '" stroke-dashoffset="' + r2(C * (1 - v.ring)) + '" transform="rotate(-90 38 38)"></circle></svg>' +
      '<div class="in"><b class="num">' + Math.abs(v.remain) + '</b><small>' + esc(t(v.remain >= 0 ? 'ui299.gv.left' : 'ui299.gv.over')) + '</small></div><em>' + esc(v.due ? t('ui299.gv.due', { d: fmtDate(v.due) }) : '') + '</em></div>';
    h += '<div class="phys-gv-grow"><span class="phys-lbl">' + esc(t('ui299.gv.grow')) + '</span><b>' + esc(v.size) + '</b>' +
      '<div class="gb"><small>' + esc(t('ui299.gv.len')) + '</small><span class="bar"><i data-w="' + r2(v.size2.lenPct) + '" style="width:' + r2(v.size2.lenPct) + '%"></i></span><em class="num">' + esc(t('ui299.gv.cm', { n: v.size2.cm })) + '</em></div>' +
      '<div class="gb"><small>' + esc(t('ui299.gv.wt')) + '</small><span class="bar"><i data-w="' + r2(v.size2.wPct) + '" style="width:' + r2(v.size2.wPct) + '%"></i></span><em class="num">' + esc(v.size2.g >= 1000 ? t('ui299.gv.kg', { n: (v.size2.g / 1000).toFixed(1) }) : t('ui299.gv.g', { n: v.size2.g })) + '</em></div>' +
      '<p class="ref">' + esc(t('ui299.gv.ref')) + '</p></div></div>';
    // 3 vitals
    h += '<div class="phys-gv-vit"><div class="hb' + (v.vit.bpm ? ' on' : '') + '"><i></i><span>' + esc(v.vit.bpm ? t('ui299.gv.bpm', { n: v.vit.bpm }) : t('ui299.gv.noBeat')) + '</span></div>' +
      '<div class="mv" data-move="' + v.vit.move + '"><span>' + esc(t('ui299.gv.move')) + '</span><span class="lv">' + [1, 2, 3, 4, 5].map((i) => '<i class="' + (i <= v.vit.move ? 'on' : '') + '"></i>').join('') + '</span><small>' + esc(v.move) + '</small></div></div>';
    // 4 milestones
    h += '<div class="phys-gv-miles"><span class="line"><i style="width:' + r2(v.pos) + '%"></i></span>' + v.miles.map((m) => '<span class="ms' + (m.passed ? ' passed' : '') + (m.next ? ' next' : '') + '" style="left:' + r2(m.pos) + '%"><i></i><em>' + esc(t('ui299.ms.' + m.k)) + '</em></span>').join('') + '</div>';
    // 5 risk gauge + chips
    const A = Math.PI * 26;
    h += '<div class="phys-gv-row b"><div class="phys-gv-risk lv' + v.riskLv + '" data-risk="' + v.riskLv + '"><svg viewBox="0 0 64 38" aria-hidden="true"><path class="bg" d="M6 34 A26 26 0 0 1 58 34"></path><path class="fg" d="M6 34 A26 26 0 0 1 58 34" stroke-dasharray="' + r2(A) + '" stroke-dashoffset="' + r2(A * (1 - v.riskPct / 100)) + '"></path></svg><b>' + esc(t('ui299.risk.' + v.riskLv)) + '</b><small>' + esc(t('ui299.gv.risk')) + '</small></div>' +
      '<div class="phys-gv-chips"><span class="phys-lbl">' + esc(t('ui299.gv.body')) + '</span><div>' + v.chips.map((x) => '<span class="chip">' + esc(x) + '</span>').join('') + '</div></div></div>';
    return h + '</div>';
  }
  function renderNormSnap(c) {
    const s0 = c.fertility.normSnap;
    if (!s0) return '<p class="phys-empty-note">' + esc(t('ui299.snap.none')) + '</p>';
    const line = (k, v) => v ? '<div class="phys-line2"><span class="phys-lbl">' + esc(t(k)) + '</span><p>' + esc(v) + '</p></div>' : '';
    const ph = s0.phase === 'recovery' ? t('ui297.s.recov') : t(s0.phase === 'pms' ? 'ui.phase.pms' : 'ui.phase.' + s0.phase);
    let h = '<div class="phys-snap"><p class="phys-snap-at">' + esc(t('ui299.snap.at', { d: s0.at ? fmtDate(s0.at) : t('ui299.snap.atNa') })) + '</p>';
    h += '<div class="phys-kvs k3">' + kv(t('ui2.l.phase'), esc(ph)) + (s0.cd ? kv(t('ui2.l.cycleDay'), '<span class="num">' + s0.cd + '</span><small> / ' + s0.L + '</small>') : '') + kv(t('ui299.snap.pct'), esc(E.fmtPct(s0.pct) + '%')) + '</div>';
    h += line('ui2.l.mood', s0.mood) + line('ui2.l.uterus', s0.uterus) + line('ui2.l.ovary', s0.ovary) + line('ui2.l.ovulation', s0.ovu) + line('ui299.snap.body', s0.body) + line('ui297.s.recov', s0.recov);
    return h + '</div>';
  }
  function carryNote(prev, from) { return prev ? '<small class="phys-carry">' + esc(t('ui299.carry', { p: t('ui299.ph.' + (from || 'cycle')) })) + esc(String(prev).slice(0, 60)) + '</small>' : ''; }
  function renderRecovery(c) {
    const r = E.recoveryInfo(c, st.story && st.story.date); if (!r) return '';
    let h = '<div class="phys-recov"><div class="phys-recov-h"><b>' + esc(r.label) + '</b><em>' + esc(t('ui297.rv.day', { d: r.day, n: r.total })) + '</em></div>' + meter(r.progress * 100, 100, 'recov');
    h += '<div class="phys-kvs k3">' + kv(t('ui297.rv.type'), esc(r.type)) + kv(t('ui297.rv.start'), r.start ? esc(fmtDate(r.start)) : esc(t('ui297.rv.na'))) + kv(t('ui297.rv.elapsed'), esc(t('ui297.rv.days', { n: r.elapsed }))) +
      kv(t('ui297.rv.left'), esc(t('ui297.rv.days', { n: r.left }))) + kv(t('ui297.rv.resume'), r.resume ? esc(fmtDate(r.resume)) : esc(t('ui297.rv.daysLater', { n: r.left }))) + '</div>';
    const line = (k, v) => v ? '<div class="phys-line2"><span class="phys-lbl">' + esc(t(k)) + '</span><p>' + esc(v) + '</p></div>' : '';
    if (r.fert) h += '<div class="phys-recov-ovu' + (r.fert.open ? ' open' : '') + '"><span class="phys-lbl">' + esc(t('ui299.rv.ovu')) + '</span><p>' + esc(r.fert.open ? t('ui299.rv.ovuOpen', { p: E.fmtPct(r.fert.pct) }) : (r.fert.earliest >= 999 ? t('ui299.rv.ovuBf') : t('ui299.rv.ovuWait', { d: r.fert.earliest, n: r.fert.earliest - r.day }))) + '</p>' + meter(Math.min(100, r.day / Math.min(r.total, r.fert.earliest >= 999 ? r.total : r.fert.earliest) * 100), 100, 'recov') + '</div>';
    h += line('ui297.rv.body', r.body) + line('ui297.rv.sore', r.soreness) + line('ui297.rv.breast', r.breast) + line('ui297.rv.mood', r.mood);
    h += '<div class="phys-line2"><span class="phys-lbl">' + esc(t('ui297.rv.risks')) + '</span><p>' + r.risks.map((x) => '<span class="phys-risk sev-1">' + esc(x) + '</span>').join('') + '</p></div>';
    return h + '</div>';
  }
  function renderPregDay(c, n, today) {
    const d = E.pregDayInfo(c, n, today);
    const badge = d.today ? t('ui2.day.today') : (d.past ? t('ui2.day.past') : t('ui2.day.pred'));
    let h = '<div class="phys-daycard ph-preg" role="dialog"><header><span class="phys-bignum">' + esc(String(+d.iso.slice(8, 10))) + '</span><b>' + esc(E.fmtStory(d.iso)) + '</b><span class="phys-tagline">' + esc(badge) + '</span>' +
      '<button type="button" class="phys-ico sm" data-act="cal-close" aria-label="' + esc(t('ui2.day.close')) + '">' + ICON.close + '</button></header>';
    if (!d.inPreg) return h + '<p class="phys-day-t">' + esc(t('ui296.cal.before')) + '</p></div>';
    h += '<div class="phys-kvs">' + kv(t('ui2.l.gest'), esc(t('ui2.day.pday', { w: d.week, d: d.wd }))) + kv(t('ui296.l.stage'), esc(t('ui.preg.stage.' + d.stage))) +
      kv(t('ui296.l.remain'), esc(d.remain >= 0 ? t('ui296.cal.remain', { n: d.remain }) : t('ui296.cal.over', { n: -d.remain }))) + '</div>';
    if (d.embryo) h += '<p class="phys-day-t">' + esc(d.embryo) + '</p>';
    if (d.why.length) h += '<ul class="phys-day-w">' + d.why.map((w) => '<li>' + esc(w) + '</li>').join('') + '</ul>';
    return h + '</div>';
  }
  function renderDayCard(c, n, today, cfg) {
    const dd = E.dayDetail(c, n, today, cfg);
    const badge = dd.today ? t('ui2.day.today') : (dd.past ? t('ui2.day.past') : t('ui2.day.pred'));
    let h = '<div class="phys-daycard ph-' + esc(dd.phase) + '" role="dialog"><header><span class="phys-bignum">' + esc(String(+dd.iso.slice(8, 10))) + '</span><b>' + esc(E.fmtStory(dd.iso)) + '</b><span class="phys-tagline">' + esc(badge) + '</span>' + srcTag(dd.src) +
      '<button type="button" class="phys-ico sm" data-act="cal-close" aria-label="' + esc(t('ui2.day.close')) + '">' + ICON.close + '</button></header>';
    h += '<div class="phys-kvs">' + kv(t('ui2.l.phase'), esc(dd.phaseLabel)) +
      (dd.pday != null ? kv(t('ui2.l.gest'), esc(t('ui2.day.pday', { w: Math.floor(dd.pday / 7), d: dd.pday % 7 }))) : (dd.cd ? kv(t('ui2.l.cycleDay'), '<span class="num">' + dd.cd + '</span><small> / ' + dd.L + '</small>') : '')) +
      (dd.showPct != null ? kv(t('ui2.l.chance'), '<span class="num">' + esc(E.fmtPct(dd.showPct)) + '</span><small>%</small>') : '') + '</div>';
    if (dd.showPct != null) h += meter(dd.showPct, 35, 'chance');
    if (dd.text) h += '<p class="phys-day-t">' + esc(dd.text) + '</p>';
    if (dd.why && dd.why.length) h += '<ul class="phys-day-w">' + dd.why.map((w) => '<li>' + esc(w) + '</li>').join('') + '</ul>';
    return h + '</div>';
  }
  function renderLog(limit) {
    const all = (st.log || []).slice().reverse();
    const list = all.slice(0, limit);
    if (!list.length) return '<p class="phys-muted">' + esc(t('ui.log.empty')) + '</p>';
    let h = '<div class="phys-log">';
    list.forEach((l) => {
      const lines = E.describeLog(l);
      const who = l.kind === 'date' ? t('ui.log.story') : l.name;
      const floor = l.floor != null ? t('ui.log.floor', { n: l.floor }) : t('ui.log.src.' + l.src);
      h += '<div class="phys-log-i' + (l.reverted ? ' rev' : '') + '"><div class="phys-log-b">' +
        '<div class="phys-log-t"><span class="phys-log-k k-' + l.kind + '">' + esc(t('ui.log.kind.' + l.kind)) + '</span><span class="phys-log-w">' + esc(who) + '</span><em>' + esc(floor + ' · ' + fmtStamp(l.ts)) + '</em></div>' +
        '<div class="phys-log-l">' + lines.slice(0, 4).map((x) => esc(x)).join('<br>') + '</div></div>' +
        (l.reverted ? '<span class="phys-log-r">' + esc(t('ui.log.reverted')) + '</span>' : (E.revertible(l) ? '<button type="button" class="phys-btn ghost small" data-act="log-revert" data-id="' + esc(l.id) + '">' + esc(t('ui.log.revert')) + '</button>' : '')) + '</div>';
    });
    return h + '</div>' + (all.length > limit ? '<p class="phys-muted">' + esc(t('ui.hist.older', { n: all.length - limit })) + '</p>' : '');
  }
  const fmtStamp = (ts) => { try { const d = new Date(ts); return String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') + ' ' + fmtTime(ts); } catch (e) { return ''; } };
  async function doRevertLog(id) {
    try {
      const l = (st.log || []).find((x) => x.id === id);
      if (!l) return;
      if (!(await confirmAsk(t('ui.log.confirm', { what: t('ui.log.kind.' + l.kind), name: l.kind === 'date' ? t('ui.log.story') : l.name })))) return;
      const r = await E.revertLog(id);
      await refreshFromStore(true);
      await toast(r && r.ok ? 'ui.log.done' : 'ui.error.save');
    } catch (e) { await toast('ui.error.save'); }
  }


  function guessTag(on) {
    return on ? '<sup class="phys-src guess" title="' + esc(t('ui.ai.guessTip')) + '">' + esc(t('ui.ai.guess')) + '</sup>' : '';
  }
  function loreTag(on) {
    return on ? '<sup class="phys-src ai" title="' + esc(t('ui.ai.loreTip')) + '">' + esc(t('ui.ai.tag')) + '</sup>' : '';
  }
  function renderHistoryStrip(c) {
    const f = c.fertility;
    const pr = c.profile;
    const bits = [];
    const src = (pr && pr.sources) || {};
    bits.push('<span class="phys-histchip">' + esc(t('ui.histstrip.preg', { n: f.pregnancyCount })) + (src.history === 'guessed' ? guessTag(true) : (src.history === 'lore' ? loreTag(true) : '')) + '</span>');
    bits.push('<span class="phys-histchip">' + esc(t('ui.histstrip.birth', { n: f.birthCount })) + (src.history === 'guessed' ? guessTag(true) : '') + '</span>');
    if (f.miscarriages) bits.push('<span class="phys-histchip">' + esc(t('ui.histstrip.misc', { n: f.miscarriages })) + '</span>');
    if (c.cycle.menopause) bits.push('<span class="phys-histchip warn">' + esc(t('ui.histstrip.meno')) + '</span>');
    else if (c.cycle.regularity === 'irregular') bits.push('<span class="phys-histchip">' + esc(t('ui.histstrip.irregular')) + (src.cycle === 'guessed' ? guessTag(true) : loreTag(src.cycle === 'lore')) + '</span>');
    if (pr && pr.species && !/^(human|人类|人)$/i.test(pr.species)) bits.push('<span class="phys-histchip">' + esc(pr.species) + loreTag(src.species === 'lore') + guessTag(src.species === 'guessed') + '</span>');
    if (f.baseline && f.baseline !== 'normal') bits.push('<span class="phys-histchip">' + esc(t('ui.histstrip.fert.' + f.baseline)) + '</span>');
    if (pr && pr.criteria) bits.push('<span class="phys-histchip dim" title="' + esc(pr.criteria) + '">' + esc(pr.criteria.length > 28 ? pr.criteria.slice(0, 28) + '…' : pr.criteria) + '</span>');
    const estActs = E.SEX_KEYS.filter((k) => c.sexEst && c.sexEst[k] && c.sex[k] > 0).length;
    if (estActs) bits.push('<span class="phys-histchip">' + esc(t('ui.histstrip.sexEst')) + guessTag(true) + '</span>');
    return '<div class="phys-histstrip"><span class="phys-histstrip-k">' + esc(t('ui.histstrip.title')) + '</span>' + bits.join('') + '</div>';
  }

  /* ---- v2: pages, fixed character header, tabs ---- */
  const PAGES = ['roster', 'fert', 'sex', 'profile', 'settings'];
  const CHEV = '<svg class="phys-chev" viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4.5L6 7.5 9 4.5"/></svg>';
  const pct0 = (v) => E.fmtPct(v);
  function card(id, title, hint, body, extra) {
    return '<section class="phys-card' + (extra ? ' ' + extra : '') + '" data-sec="' + id + '"><header class="phys-card-h"><h3>' + esc(title) + '</h3>' + (hint ? '<p>' + esc(hint) + '</p>' : '') + '</header><div class="phys-card-b">' + body + '</div></section>';
  }
  function kv(label, value, cls) { return '<div class="phys-kv' + (cls ? ' ' + cls : '') + '"><span>' + esc(label) + '</span><b>' + value + '</b></div>'; }
  function meter(pct, max, cls) {
    const w = Math.max(0, Math.min(100, (Number(pct) || 0) / (max || 100) * 100));
    return '<div class="phys-meter ' + (cls || '') + '"><i style="width:' + w.toFixed(1) + '%"></i></div>';
  }
  function pageHead(p) {
    return '<header class="phys-pagehead"><h2>' + esc(t('ui2.tab.' + p)) + '</h2><p>' + esc(t('ui2.p.' + p + '.sub')) + '</p></header>';
  }
  function renderHeader(c) {
    const hi = E.headerInfo(c, st, E.config());
    const off = isOff(c);
    const T = off ? null : hi.tiles;
    const multi = chars().length > 1;
    const TOG = '<button type="button" class="hd-tog" data-act="hd-toggle" aria-expanded="' + (hdCollapsed ? 'false' : 'true') + '" aria-label="' + esc(t(hdCollapsed ? 'ui4.hd.expand' : 'ui6.hd.collapse')) + '" title="' + esc(t(hdCollapsed ? 'ui4.hd.expand' : 'ui6.hd.collapse')) + '"><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10l4-4 4 4"/></svg></button>';
    let h = '<div class="phys-char hd2 hd4' + (hdCollapsed ? ' is-slim' : '') + '" data-role="hd">' + TOG;
    // slim bar (collapsed state)
    h += '<div class="hd-slim" data-act="hd-toggle" role="button" tabindex="' + (hdCollapsed ? '0' : '-1') + '" aria-label="' + esc(t('ui4.hd.expand')) + '" aria-hidden="' + (hdCollapsed ? 'false' : 'true') + '">' +
      '<span class="hd-slim-av">' + portraitHtml(c, 'xs') + '</span><b class="hd-slim-n">' + esc(hi.name) + '</b><span class="hd-slim-p num">' + esc(off ? offReason(c) : (T ? T.compact : hi.phys)) + '</span>' + CHEV + '</div>';
    // expanded state: three tiers
    h += '<div class="hd-full" aria-hidden="' + (hdCollapsed ? 'true' : 'false') + '"><div class="hd-full-in">';
    h += '<div class="hd-top"><div class="hd-avwrap"><button type="button" class="phys-char-av hd-av" tabindex="-1" aria-hidden="true">' + portraitHtml(c, 'hd') + '</button>' +
      '</div><div class="hd-col"><div class="hd-t1">';
    h += '<div class="hd-who"><span class="phys-char-n hd-name"><span>' + esc(hi.name) + '</span></span>';
    const chips = (hi.social && hi.social.length ? [hi.race].concat(hi.social) : (hi.identity ? hi.identity.split(' · ') : [])).filter(Boolean);
    if (chips.length) h += '<div class="phys-char-id hd-chips">' + chips.map((x, i) => '<span class="hd-chip' + (i === 0 && hi.social && hi.social.length ? ' race' : '') + '">' + esc(x) + '</span>').join('') + '</div>';
    h += '</div></div>';
    // tier 2: time & place
    h += '<div class="hd-t2"><div class="hd-when num">' + (hi.date ? '<span class="phys-char-date">' + esc(hi.date) + '</span>' : '') + (hi.time ? '<span class="hd-time">' + esc(hi.time) + '</span>' : '') + '</div>';
    if (locEdit) h += '<span class="phys-char-loc edit"><input type="text" data-role="loc-input" maxlength="40" value="' + esc(hi.location) + '" placeholder="' + esc(t('ui2.hd.locPh')) + '"><button type="button" class="phys-btn small" data-act="loc-save">' + esc(t('ui2.hd.save')) + '</button></span>';
    else h += '<button type="button" class="phys-char-loc hd-loc" data-act="loc-edit" title="' + esc(t('ui2.hd.locEdit')) + '"><svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.1" aria-hidden="true"><path d="M6 11s3.6-3.5 3.6-6.1A3.6 3.6 0 0 0 2.4 4.9C2.4 7.5 6 11 6 11z"/><circle cx="6" cy="4.9" r="1.2"/></svg><span>' + esc(hi.location || t('ui2.hd.noLoc')) + '</span></button>';
    if (hi.situation && !off) h += '<div class="phys-char-sit hd-sit' + (sitOpen ? ' open' : '') + '" data-act="sit-toggle" role="button" tabindex="0" title="' + esc(t('ui4.hd.sitMore')) + '">' + esc(hi.situation) + '</div>';
    h += '</div>';
    h += '</div></div>'; // .hd-col, .hd-top
    // tier 3: body tiles (full-width row under avatar + text column)
    if (T) {
      const tile = (cls, x, big) => '<div class="hd-tile ' + cls + '"><span class="hd-tl">' + esc(x.label) + '</span>' + big + (x.sub ? '<em class="hd-ts num">' + esc(x.sub) + '</em>' : '<em class="hd-ts">&nbsp;</em>') + '</div>';
      h += '<div class="hd-t3 phys-char-phys">' +
        tile('k-cycle', T.cycle, '<b class="hd-tv">' + esc(T.cycle.value) + '</b>') +
        tile('k-status st-' + esc(T.status.kind), T.status, '<b class="hd-tv">' + esc(T.status.value) + '</b>') +
        tile('k-chance' + (T.preg ? ' preg' : ' lv-' + esc(T.chance.level)) + (T.chance.overdue ? ' over' : ''), T.chance, '<b class="hd-tv big num">' + esc(T.chance.num) + '<small>' + esc(T.chance.unit) + '</small></b><i class="hd-meter"><i style="width:' + Number(T.chance.meter || 0).toFixed(1) + '%"></i></i>') +
        '</div>';
    } else h += '<div class="hd-t3 off phys-char-phys">' + esc(off ? offReason(c) : hi.phys) + '</div>';
    h += '</div></div></div>';
    return h;
  }
  function rosterTools() {
    let tb = '';
    const tracked = Object.keys(st.characters).map((k) => st.characters[k] && E.nameKey(st.characters[k].name)).filter(Boolean);
    const askOpen = !!(askInit || (st.askPending && st.askPending.ids && st.askPending.ids.length)); // v3.0.5pop
    const sug = askOpen ? [] : (st.suggest || []).filter((x) => x && tracked.indexOf(E.nameKey(x.name)) < 0 && (st.purged || []).indexOf(E.nameKey(x.name)) < 0); // v3.0.5dup / v3.0.5pop: never offer while 是否初始化 is open
    if (sug.length) tb = '<div class="phys-sugg"><p class="phys-subhead">' + esc(t('ui7.sug.title', { n: sug.length })) + '</p>' + sug.map((x) => '<div class="phys-sugg-i"><div><b>' + esc(x.name) + '</b>' + (x.why ? '<p class="phys-muted">' + esc(x.why) + '</p>' : '') + '</div><div class="phys-row"><button type="button" class="phys-btn small" data-act="sug-add" data-name="' + esc(x.name) + '"' + (addForm.busy ? ' disabled' : '') + '>' + esc(t('ui7.sug.track')) + '</button><button type="button" class="phys-btn ghost small" data-act="sug-dismiss" data-name="' + esc(x.name) + '">' + esc(t('ui7.sug.dismiss')) + '</button></div></div>').join('') + '</div>' + tb;
    tb += '<div class="phys-addtr">' + (addForm.open
      ? '<label class="phys-field">' + esc(t('ui7.add.name')) + '<input type="text" data-addf="name" maxlength="40" value="' + esc(addForm.name) + '"></label><label class="phys-field">' + esc(t('ui7.add.desc')) + '<span class="phys-muted phys-sub2">' + esc(t('ui7.add.descHint')) + '</span><textarea rows="3" data-addf="desc" maxlength="600">' + esc(addForm.desc) + '</textarea></label>' +
        (addForm.minorHit ? (addForm.adultConfirmed ? '<p class="phys-muted">' + esc(t('ttAge.confirmed.tag', { age: addForm.adultConfirmed })) + '</p>' : adultAskHtml('add', 'add', addForm.name)) : '') + /* [tt-port:age-ui] */
        '<div class="phys-row"><button type="button" class="phys-btn" data-act="add-go"' + (addForm.busy ? ' disabled' : '') + '>' + esc(t(addForm.busy ? 'ui7.add.busy' : 'ui7.add.go')) + '</button><button type="button" class="phys-btn ghost" data-act="add-close">' + esc(t('ui5.cancel')) + '</button></div>'
      : '<button type="button" class="phys-btn ghost" data-act="add-open">＋ ' + esc(t('ui7.add.btn')) + '</button>') + (addForm.msg ? '<p class="phys-status">' + esc(addForm.msg) + '</p>' : '') + '</div>';
    { // v2.9.0: {{user}} persona tracking (manual, no detection)
      const me = Object.keys(st.characters).map((k) => st.characters[k]).find((x) => x && x.isUser && !x.trackOff && !x.skippedReason);
      tb += '<div class="phys-addtr phys-persona">' + (me ? '<p class="phys-muted">正在追踪 {{user}}：' + esc(me.name) + '</p><button type="button" class="phys-btn ghost" data-act="persona-off" data-id="' + esc(me.id) + '">停止追踪 {{user}}</button>'
        : '<button type="button" class="phys-btn ghost" data-act="add-persona">追踪 {{user}}</button><p class="phys-muted phys-sub2">用你当前人设的名字和描述加入追踪（成年人），之后按常规流程初始化</p>') + '</div>';
    }
    tb += '<div class="phys-row ros-acts"><button type="button" class="phys-btn ghost small" data-act="detect-now"' + (addForm.busy ? ' disabled' : '') + '>' + esc(t('ui7.detectNow')) + '</button><button type="button" class="phys-btn ghost small" data-act="ai-scan">' + esc(t('ui.scan.button')) + '</button></div>';
    return tb;
  }
  // v2.7.2 roster page (replaces the overlay switcher)
  function rosterLine(x) {
    if (isOff(x)) return offReason(x);
    let hi = null; try { hi = E.headerInfo(x, st, E.config()); } catch (e) { hi = null; }
    const T = hi && hi.tiles;
    const parts = [];
    if (T && T.compact) parts.push(T.compact); else if (hi && hi.phys) parts.push(hi.phys);
    let bn = ''; try { bn = E.bodyNowText(x) || ''; } catch (e) { bn = ''; }
    if (bn) parts.push(String(bn).split(/[；;。\n]/)[0]);
    return parts.join(' · ');
  }
  function pageRoster(c) {
    const list = chars();
    let h = pageHead('roster');
    h += '<div class="ros-grid" role="listbox" data-role="roster">' + list.map((x) => {
      const on = c && chKey(x) === chKey(c), off = isOff(x);
      const so = (E.socialOf(x).list || []).slice(0, 3);
      const race = x.profile && x.profile.species ? [x.profile.species] : [];
      const tags = off ? [x.skippedReason ? t('ui.skip.short.' + x.skippedReason) : t('ui.skip.short.off')] : race.concat(so).slice(0, 3);
      const badges = [];
      if (!off && x.fertility.pregnant) badges.push(['preg', t('ui7.ros.preg')]);
      else if (!off && x.cycle.fertile) badges.push(['fert', t('ui7.ros.fert')]);
      if (!off && x.session && x.session.open) badges.push(['sess', t('ui7.ros.sess')]);
      if (x.frozen) badges.unshift(['frz', t('ui296.ros.stopped')]);
      return '<div class="ros-card2' + (on ? ' on' : '') + (off ? ' off' : '') + '" role="option" aria-selected="' + (on ? 'true' : 'false') + '">' +
        '<button type="button" class="ros-hit" data-act="select" data-id="' + esc(chKey(x)) + '" aria-label="' + esc(x.name || '') + '"></button>' +
        '<span class="ros-av2">' + portraitHtml(x, 'ros') + '<i class="ros-trk' + (off ? ' no' : '') + '">' + esc(off ? t('ui8.ros.untracked') : t('ui8.ros.tracked')) + '</i></span>' +
        '<div class="ros-info"><b class="ros-n2">' + esc(x.name || ('#' + x.id)) + '</b>' +
        (tags.length ? '<div class="ros-tags">' + tags.map((g) => '<span class="hd-chip">' + esc(g) + '</span>').join('') + '</div>' : '') +
        '<p class="ros-line">' + esc(rosterLine(x)) + '</p>' +
        (badges.length ? '<div class="ros-bdg">' + badges.map((d) => '<em class="ros-b ' + d[0] + '">' + esc(d[1]) + '</em>').join('') + '</div>' : '') +
        '<div class="ros-acts">' + (on && !off ? '<button type="button" class="phys-btn ghost small ros-go" data-act="page" data-page="fert">' + esc(t('ui8.ros.go')) + '</button>' : '') +
        (!off ? '<button type="button" class="phys-btn ghost small ros-init" data-act="ros-init" data-id="' + esc(chKey(x)) + '">' + esc(t('ui11.ros.init')) + '</button>' : '') +
        '<button type="button" class="phys-btn ghost small ros-frz" data-act="ros-freeze" data-id="' + esc(chKey(x)) + '">' + esc(t(x.frozen ? 'ui296.ros.resume' : 'ui296.ros.stop')) + '</button>' +
        '<button type="button" class="phys-btn danger small ros-del" data-act="ros-del" data-id="' + esc(chKey(x)) + '">' + esc(t('ui296.ros.del')) + '</button></div>' +
        '</div></div>';
    }).join('') + '</div>';
    if (list.length < 2) h += '<div class="ros-empty"><p>' + esc(t(list.length ? 'ui8.ros.one' : 'ui.noChars')) + '</p><p class="phys-muted">' + esc(t('ui8.ros.help')) + '</p></div>';
    h += card('ros-tools', t('ui8.ros.tools'), t('ui8.ros.toolsHint'), rosterTools());
    return h;
  }
  // [tt-port:pause] 暂停追踪：不分析、不注入，只记录日期变更
  function pausedNow() { return !!(st && st.meta && st.meta.paused === true); }
  function renderPauseStrip() {
    if (!pausedNow()) return '';
    return '<div class="phys-row phys-pausestrip" role="status">' +
      '<span class="phys-status warn">' + esc(t('uiPause.strip', { d: st.story && st.story.date ? st.story.date : '—' })) + '</span>' +
      '<button type="button" class="phys-btn small" data-act="track-pause">' + esc(t('uiPause.resume')) + '</button>' +
      '</div>';
  }
  function renderTabs() {
    return '<nav class="phys-tabs2" role="tablist">' + PAGES.map((p) => '<button type="button" role="tab" class="phys-tab2' + (p === page ? ' on' : '') + '" data-act="page" data-page="' + p + '" aria-selected="' + (p === page ? 'true' : 'false') + '">' + esc(t('ui2.tab.' + p)) + '</button>').join('') + '<i class="phys-ul" aria-hidden="true"></i></nav>';
  }
  const sexFillUi = {};
  function regenRow(scope, c) {
    if (!E.config().aiDescribe) return '';
    const busy = regenBusy && regenScope === scope;
    return '<div class="phys-regen"><button type="button" class="phys-btn ghost small" data-act="ai-regen-' + scope + '"' + (regenBusy ? ' disabled' : '') + '>' + esc(busy ? t('ui.ai.regenBusy') : t(scope === 'acts' ? 'ui2.regen.sex' : 'ui2.regen.fert')) + '</button>' +
      (c.ai && c.ai.floor != null ? '<em class="phys-regen-m">' + esc(t('ui.ai.floor', { n: c.ai.floor })) + '</em>' : (c.ai ? '' : '<em class="phys-regen-m">' + esc(t('ui.ai.none')) + '</em>')) + '</div>';
  }

  let fertSub = 'norm', fertSubKey = '', fertFold = false, styleEdit = null, fpEdit = null, marksOpen = null;
  const SUBMODE = { norm: 'cycle', preg: 'pregnant', recov: 'recovery' };
  const r2x = (x) => (Math.round(x * 100) / 100).toString();
  // v3.0.0 clearly visible residue bar (replaces the faint recov meter)
  function tiBar(I) { const p = Math.round(Math.max(0, Math.min(1, I)) * 100); return '<div class="phys-tibar" data-ti="' + p + '"><i style="width:' + p + '%"></i><b>' + p + '%</b></div>'; }
  function pausedBar(md) { return '<div class="phys-milestone phys-paused" role="status"><b>' + esc(t('ui300.paused.' + md)) + '</b><button type="button" class="phys-btn small" data-act="fert-sub" data-sub="' + ({ cycle: 'norm', pregnant: 'preg', recovery: 'recov' })[md] + '">' + esc(t('ui300.paused.go')) + '</button></div>'; }
  function renderNotice(c) {
    const n = c.fertility && c.fertility.notice; if (!n || n.seen) return '';
    return '<div class="phys-notice k-' + esc(n.k) + '" role="alert"><b>' + esc(n.text) + '</b>' + (n.iso ? '<small>' + esc(fmtDate(n.iso)) + '</small>' : '') + '<button type="button" class="phys-ico sm" data-act="notice-x" aria-label="' + esc(t('ui300.notice.x')) + '">' + ICON.close + '</button></div>';
  }
  function renderFert(v, c) {
    let h = '<section class="phys-card phys-fert' + (v.done ? ' done' : '') + (fertFold ? ' fold' : '') + '" data-sec="fert" data-pct="' + v.pct + '"><header class="phys-card-h phys-fert-h"><h3>' + esc(t(v.done ? 'ui300.fert.titleDone' : 'ui300.fert.title')) + '</h3>' + (v.done ? '<span class="phys-fert-badge">' + esc(t('ui300.fert.done')) + '</span>' : '<em class="num">' + esc(v.pct.toFixed(1)) + '%</em>') + '<button type="button" class="phys-btn ghost small" data-act="fert-fold" aria-expanded="' + (!fertFold) + '">' + esc(t(fertFold ? 'ui300.fert.open' : 'ui300.fert.fold')) + '</button></header>';
    h += '<div class="phys-fert-track"><i style="width:' + v.pct + '%"></i><b class="sp" style="left:' + Math.min(97, v.pct) + '%"></b><b class="egg"></b></div>';
    if (!fertFold) {
      h += '<div class="phys-card-b"><p class="phys-fert-stage">' + esc(v.stage) + '</p><div class="phys-kvs k3">' + kv(t('ui300.fert.start'), esc(v.start)) + kv(t(v.done ? 'ui300.fert.doneAt' : 'ui300.fert.target'), esc(v.done ? v.doneAt : v.target)) + kv(t(v.done ? 'ui300.fert.dur' : 'ui300.fert.left'), esc(v.done ? v.durText : v.leftText)) + '</div>';
      h += '<p class="phys-fert-note">' + esc(t(v.done ? 'ui300.fert.noteDone' : 'ui300.fert.note', { name: c.name })) + '</p></div>';
    }
    return h + '</section>';
  }
  function renderRiskGroups(c) {
    const g = E.riskSplit(c); if (!g.maternal.length && !g.fetal.length) return '';
    const row = (r) => '<div class="phys-anom sev-' + esc(r.sev) + '"><b>' + esc(t('risk.' + r.k)) + '</b><em>' + esc(t('ui.sev.' + r.sev)) + '</em>' + (r.why ? '<span>' + esc(r.why) + '</span>' : '') + '</div>';
    const grp = (k, l) => l.length ? '<div class="phys-anoms phys-rg"><div class="phys-anoms-k">' + esc(t('ui300.risk.' + k)) + '</div>' + l.map(row).join('') + '</div>' : '';
    return '<div class="phys-riskgroups">' + grp('mat', g.maternal) + grp('fet', g.fetal) + '</div>';
  }
  // v3.0.5b: one 体质卡 look for 淫体本色 and 淫躯今貌; no buttons of its own (the parent card's 编辑/锁定/重新生成/更新 govern it)
  function fpCardHtml(o) {
    const tier = E.fpTierOf(o);
    let h = '<div class="phys-fp"><div class="phys-fp-h"><span class="phys-lbl">' + esc(t('ui301.fp.title')) + '</span>' + (tier === 'always' || tier === 'never' ? '<b class="phys-fp-mode ' + esc(tier) + '">' + esc(t('ui301.fp.mode.' + tier)) + '</b>' : '') + '</div>';
    h += '<div class="phys-fp-rows">' + E.fpRowsOf(o).map((r) => '<div class="phys-fp-r"><span class="phys-lbl">' + esc(t('ui301.fp.f.' + (r.k === 'fertility' ? 'fertilityMul' : r.k))) + '</span><b>' + esc(r.value) + '</b>' + (r.tier && r.tier !== '普通' ? '<em>' + esc(r.tier) + '</em>' : '') + (r.ev ? '<p class="phys-fp-ev">' + esc(t('ui301.fp.ev')) + '：「' + esc(r.ev) + '」</p>' : '') + (r.reason && r.reason !== '用户手动设定' ? '<p class="phys-fp-ev">' + esc(t('ui301.fp.reason')) + '：' + esc(r.reason) + '</p>' : '') + '</div>').join('') + '</div>';
    return h + '</div>';
  }
  const FP_TIERS = ['very_low', 'low', 'normal', 'high', 'very_high', 'always', 'never'];
  const FP_TIER_ZH = { very_low: '极难孕', low: '偏难', normal: '普通', high: '偏易', very_high: '极易', always: '必孕', never: '不孕' };
  function fpForm(fp, human) {
    const sel = (k, opts, lab) => '<label class="phys-field">' + esc(t('ui301.fp.f.' + (k === 'fertility' ? 'fertilityMul' : k))) + '<select data-sfp="' + k + '">' + opts.map((v) => '<option value="' + v + '"' + (String(fp[k]) === v ? ' selected' : '') + '>' + esc(lab(v)) + '</option>').join('') + '</select></label>';
    let h = '<div class="phys-fp"><div class="phys-fp-h"><span class="phys-lbl">' + esc(t('ui301.fp.title')) + '</span></div>';
    h += sel('fertility', FP_TIERS.filter((v) => !(human && v === 'always')), (v) => FP_TIER_ZH[v]);
    if (!human) {
      h += sel('cycleModel', ['human', 'none', 'custom'], (v) => t('ui301.fp.cycleModel.' + v));
      const num = (k) => '<label class="phys-field">' + esc(t('ui301.fp.f.' + k)) + '<input type="number" step="1" min="0" max="100" data-sfp="' + k + '" value="' + esc(String(fp[k])) + '"></label>';
      h += num('floorPct') + num('ceilPct') + '<label class="phys-field phys-check"><input type="checkbox" data-sfp="contraceptionImmune"' + (fp.contraceptionImmune ? ' checked' : '') + '>' + esc(t('ui301.fp.f.contraceptionImmune')) + '</label>';
    }
    return h + '</div>';
  }
  function styleForm(human) {
    const f = (k) => '<label class="phys-field">' + esc(t('ui300.style.f.' + k)) + '<input type="text" data-stylef="' + k + '" value="' + esc(styleEdit[k] || '') + '"></label>';
    return f('womb') + f('gest') + f('vuln') + f('recovery') + '<div class="phys-field">' + esc(t('ui300.style.f.tol')) + '<div class="phys-seg">' + [1, 2, 3, 4, 5].map((v) => '<button type="button" class="phys-segb' + (styleEdit.tolerance === v ? ' on' : '') + '" data-act="style-tol" data-v="' + v + '">' + v + '</button>').join('') + '</div></div>' +
      fpForm(styleEdit.fp, human) + '<div class="phys-row"><button type="button" class="phys-btn small" data-act="style-save">' + esc(t('ui300.style.save')) + '</button><button type="button" class="phys-btn ghost small" data-act="style-cancel">' + esc(t('ui300.style.cancel')) + '</button></div>';
  }
  function styleBody(y, fp) {
    let h = '<div class="phys-kvs k3">' + kv(t('ui300.style.sp'), esc(t('ui300.sp.' + y.species))) + kv(t('ui300.style.tol'), '<span class="num">' + y.tolerance + '</span><small> / 5</small>') + kv(t('ui300.style.fetal'), esc(t('ui300.fetal.' + y.fetal))) + '</div>';
    const line = (k, v) => v ? '<div class="phys-line2"><span class="phys-lbl">' + esc(t('ui300.style.f.' + k)) + '</span><p>' + esc(v) + '</p></div>' : '';
    return h + line('womb', y.womb) + line('gest', y.gest) + line('vuln', y.vuln) + line('recovery', y.recovery) + fpCardHtml(fp);
  }
  function renderStyle(c) {
    const y = E.baseStyleOf(c); const id = chKey(c); const bBusy = !!(styleUi[suKey(id, 'base')] && styleUi[suKey(id, 'base')].busy);
    if (styleEdit && styleEdit.id === id && styleEdit.which === 'base') return '<div class="phys-style">' + styleForm(y.species === 'human') + '</div>';
    let h = '<details class="phys-help"><summary>' + esc(t('ui301.help.sum')) + '</summary>' + ['what', 'affect', 'tiers', 'edit', 'default'].map((k) => '<p><b>' + esc(t('ui301.help.' + k + '.t')) + '</b>' + esc(t('ui301.help.' + k)) + '</p>').join('') + '</details>';
    h += '<div class="phys-style">' + styleBody(y, E.fertParamsOf(c));
    h += '<p class="phys-style-meta">' + esc(t('ui300.style.src.' + (y.src || 'tpl'))) + (y.ver ? ' · ' + esc(t('ui300.style.ver', { n: y.ver })) : '') + (y.locked ? ' · ' + esc(t('ui300.style.locked')) : '') + '</p>';
    h += '<div class="phys-row"><button type="button" class="phys-btn ghost small" data-act="style-edit" data-w="base">' + esc(t('ui300.style.edit')) + '</button><button type="button" class="phys-btn ghost small' + (y.locked ? ' on' : '') + '" data-act="style-lock">' + esc(t(y.locked ? 'ui300.style.unlock' : 'ui300.style.lock')) + '</button><button type="button" class="phys-btn ghost small" data-act="style-regen"' + (bBusy ? ' disabled aria-busy="true"' : '') + '>' + esc(bBusy ? '正在生成…' : t('ui300.style.regen')) + '</button></div>' + styleStateHtml(id, 'base');
    return h + '</div>';
  }
  // v3.0.4 淫躯今貌: her current body; changes only after decisive events. v3.0.5b: same look as 淫体本色, one 更新 + 编辑 (+ 撤回 when there is a version)
  let nowBusy = false;
  // v3.0.5c: visible generating / failure state for 淫体本色 and 淫躯今貌 (keyed by character + which card)
  const styleUi = {}; // key -> { busy, err }
  const suKey = (id, w) => id + '|' + w;
  function styleStateHtml(id, w) {
    const u = styleUi[suKey(id, w)]; if (!u) return '';
    if (u.busy) return '<p class="phys-gen" role="status" aria-live="polite"><i class="phys-spin" aria-hidden="true"></i>正在生成…</p>';
    if (u.err) return '<div class="phys-aierr phys-gen-err" role="alert"><b>' + esc((w === 'now' ? '淫躯今貌更新失败：' : '淫体本色生成失败：') + u.err) + '</b><p>原有数据保持不变，失败已记入运行日志。</p></div>';
    if (u.note) return '<p class="phys-gen ok" role="status">' + esc(u.note) + '</p>';
    return '';
  }
  function renderStyleNow(c) {
    const n = E.styleNowOf(c); const id = chKey(c);
    if (styleEdit && styleEdit.id === id && styleEdit.which === 'now') return '<div class="phys-style">' + styleForm(n.species === 'human') + '</div>';
    const ch = E.styleNowDiff(c).filter((r) => r.changed);
    let h = '<div class="phys-style">' + styleBody(n, n.fp || E.fertParamsOf(c));
    const last = (n.vers || []).slice(-1)[0];
    h += '<p class="phys-style-meta">' + esc(last ? '第' + n.ver + '版 · ' + (last.why || '重大事件') + (last.floor != null ? '（第' + last.floor + '楼）' : '') + (ch.length ? ' · 已变：' + ch.map((r) => r.label).join('、') : '') : '与淫体本色相同') + '</p>';
    const nb = nowBusy || !!(styleUi[suKey(id, 'now')] && styleUi[suKey(id, 'now')].busy);
    h += '<div class="phys-row"><button type="button" class="phys-btn ghost small" data-act="stylenow-update"' + (nb ? ' disabled aria-busy="true"' : '') + '>' + esc(nb ? '正在生成…' : '更新') + '</button><button type="button" class="phys-btn ghost small" data-act="style-edit" data-w="now"' + (nb ? ' disabled' : '') + '>编辑</button>' + (last ? '<button type="button" class="phys-btn ghost small" data-act="stylenow-revert"' + (nb ? ' disabled' : '') + '>撤回</button>' : '') + '</div>' + styleStateHtml(id, 'now');
    return h + '</div>';
  }
  function renderRecov3(c) {
    const v = E.recovView(c, st.story && st.story.date); if (!v) return '<p class="phys-empty-note">' + esc(t('ui300.recov.empty')) + '</p>';
    const cfg = E.config(); const mi = E.moodInfo(c, cfg); const oi = E.organInfo(c, cfg);
    const variant = v.kind === 'induced' ? 'induced' : (v.loss || v.kind === 'stillbirth' ? 'loss' : 'birth');
    let h = '<section class="phys-card phys-rv v-' + variant + '" data-sec="rv" data-kind="' + esc(v.kind) + '"><header class="phys-card-h"><h3>' + esc(t('ui300.rv.title.' + variant)) + '</h3><p>' + esc(v.label) + ' · ' + esc(v.type) + '</p></header><div class="phys-card-b">';
    const rn = c.fertility.recovery && c.fertility.recovery.note; if (rn) h += '<p class="phys-rv-note">' + esc(rn) + '</p>';
    const C = 2 * Math.PI * 30;
    h += '<div class="phys-gv-row"><div class="phys-gv-ring rv" data-ring="' + r2x(v.progress) + '"><svg viewBox="0 0 76 76" aria-hidden="true"><circle class="bg" cx="38" cy="38" r="30"></circle><circle class="fg" cx="38" cy="38" r="30" stroke-dasharray="' + r2x(C) + '" stroke-dashoffset="' + r2x(C * (1 - v.progress)) + '" transform="rotate(-90 38 38)"></circle></svg><div class="in"><b class="num">' + v.left + '</b><small>' + esc(t('ui300.rv.left')) + '</small></div><em>' + esc(t('ui297.rv.day', { d: v.day, n: v.total })) + '</em></div>';
    h += '<div class="phys-rv-stages">' + v.stages.map((g) => '<span class="rvs s-' + g.k + (g.k === v.stage.k ? ' on' : '') + '"><i></i>' + esc(g.label) + '<small>' + g.from + '–' + g.to + '</small></span>').join('') + '</div></div>';
    h += '<div class="phys-kvs k3">' + kv(t('ui297.rv.start'), v.start ? esc(fmtDate(v.start)) : esc(t('ui297.rv.na'))) + kv(t('ui297.rv.resume'), v.resume ? esc(fmtDate(v.resume)) : esc(t('ui297.rv.daysLater', { n: v.left }))) + kv(t('ui300.rv.stage'), esc(v.stage.label)) + '</div>';
    h += '<div class="phys-rv-miles"><span class="line"><i style="width:' + r2x(v.miles.length ? Math.min(100, v.day / Math.max(1, Math.max.apply(null, v.miles.map((m) => m.day))) * 100) : 0) + '%"></i></span>' + v.miles.map((m) => '<span class="ms m-' + m.k + (m.passed ? ' passed' : '') + (m.next ? ' next' : '') + '" style="left:' + r2x(m.pos) + '%"><i></i><em>' + esc(m.label) + '</em></span>').join('') + '</div>';
    h += '</div></section>';
    const prow = (label, text, src) => text ? '<div class="phys-line2"><span class="phys-lbl">' + esc(label) + (src ? srcTag(src) : '') + '</span><p>' + esc(text) + '</p></div>' : '';
    h += card('rvmood', t('ui300.s.rvmood'), t('ui300.h.rvmood'), prow(t('ui2.l.mood'), mi.short, mi.src) + carryNote(mi.prev, mi.prevFrom));
    h += card('rvbody', t('ui300.s.rvbody'), t('ui300.h.rvbody'), prow(t('ui2.l.uterus'), oi.uterus, oi.src.uterus) + prow(t('ui2.l.ovary'), oi.ovary, oi.src.ovary) + prow(t('ui297.rv.body'), v.body) + prow(t('ui297.rv.sore'), v.soreness));
    let ov = '';
    if (v.fert) { const tgt = v.fert.earliest >= 999 ? v.total : v.fert.earliest; ov = '<div class="phys-recov-ovu' + (v.fert.open ? ' open' : '') + '"><span class="phys-lbl">' + esc(t('ui299.rv.ovu')) + '</span><p>' + esc(v.fert.open ? t('ui299.rv.ovuOpen', { p: E.fmtPct(v.fert.pct) }) : (v.fert.earliest >= 999 ? t('ui299.rv.ovuBf') : t('ui299.rv.ovuWait', { d: v.fert.earliest, n: v.fert.earliest - v.day }))) + '</p>' + tiBar(Math.min(1, v.day / Math.max(1, tgt))) + '</div>'; }
    const mrow = (k, n, txt) => '<div class="phys-rv-meter"><span class="phys-lbl">' + esc(t(k)) + '</span>' + tiBar(n / 100) + (txt ? '<p>' + esc(txt) + '</p>' : '') + '</div>';
    h += card('rvret', t('ui300.s.rvret'), t('ui300.h.rvret'), ov + mrow('ui300.rv.sens', v.sens) + mrow('ui300.rv.libido', v.libido, v.libTxt));
    if (v.lact) h += card('rvlact', t('ui300.s.lact'), t('ui300.h.lact'), '<div class="phys-kvs k3">' + kv(t('ui300.lact.stage'), esc(v.lact.stage)) + kv(t('ui300.lact.nursing'), esc(t(v.lact.nursing ? 'ui300.lact.yes' : 'ui300.lact.no'))) + kv(t('ui300.lact.vol'), '<span class="lact-dots">' + [1, 2, 3, 4, 5].map((i) => '<i class="' + (i <= v.lact.level ? 'on' : '') + '"></i>').join('') + '</span>') + '</div>' + prow(t('ui300.lact.breast'), v.lact.breast) + prow(t('ui300.lact.letdown'), v.lact.letdown));
    h += card('rvrisk', '异常与风险', '产后或失去胎儿后出现的异常与风险，治疗或静养后会减轻、消除', renderRiskBox(c.fertility.recovRisks, t('ui300.rv.noRisk')));
    { const lg = renderBirthLog(c, 'recov'); if (lg) h += card('rvlog', '恢复近况', '剧情对她恢复造成的变化', lg); }
    { const bt = birthText(c, ['recovery']); if (bt) h += card('rvbirth', '恢复体质', '初始化时铺好的底子，剧情改变后随之更新', bt); }
    h += card('rvcal', t('ui300.s.rvcal'), t('ui300.h.rvcal'), renderRecovCal(v));
    return h;
  }
  function renderRecovCal(v) {
    let h = '<div class="phys-rvcal">' + v.cal.map((x) => '<span class="rc s-' + x.k + (x.today ? ' today' : '') + (x.d < v.day ? ' past' : '') + '" title="' + esc(x.iso ? fmtDate(x.iso) : '') + '"><b>' + x.d + '</b>' + (x.ovu ? '<i class="mk ovu"></i>' : '') + (x.clear ? '<i class="mk clr"></i>' : '') + (x.period ? '<i class="mk per"></i>' : '') + '</span>').join('') + '</div>';
    h += '<div class="phys-rvcal-lg">' + v.stages.map((g) => '<span class="s-' + g.k + '"><i></i>' + esc(g.label) + '</span>').join('') + '<span class="s-after"><i></i>' + esc(t('ui300.rv.after')) + '</span><span class="mk ovu"><i></i>' + esc(t('ui300.rv.mkOvu')) + '</span><span class="mk clr"><i></i>' + esc(t('ui300.rv.mkClr')) + '</span><span class="mk per"><i></i>' + esc(t('ui300.rv.mkPer')) + '</span></div>';
    return h;
  }
  function renderRecovSleep(c) {
    const lr = c.fertility.lastRecovery;
    if (!lr) return '<p class="phys-empty-note">' + esc(t('ui300.recov.empty')) + '</p>';
    return card('rvsnap', t('ui300.s.rvsnap'), t('ui300.h.rvsnap'), '<div class="phys-frozen"><div class="phys-kvs k3">' + kv(t('ui297.rv.type'), esc(t('ui300.kind.' + (lr.kind || 'birth')))) + kv(t('ui297.rv.start'), lr.start ? esc(fmtDate(lr.start)) : '—') + kv(t('ui300.rv.total'), esc(t('ui297.rv.days', { n: lr.total || 0 }))) + '</div></div>');
  }
  // v3.0.3: sub-page HTML cache, used only by a sub-tab switch; valid only for the same stored state (lastJson identity),
  // the same minute and the same panel-local UI state; dropped on every other click / change / input.
  let fertCache = {}; let fertUseCache = false;
  function fertUiKey(c) {
    let cfgJ = ''; try { cfgJ = JSON.stringify(E.config()); } catch (e) { cfgJ = ''; }
    return JSON.stringify([chKey(c), fertSub, fertSubKey, Math.floor(Date.now() / 60000), calOff, calMode, calSel, cjOpen, fertFold, styleEdit, fpEdit, regenBusy, regenScope, busyTech, recOpen, sOpen, dossTab, dossEdit, bodyEdit, cycDraft, histDraft, diagOpen, cycRe.busy, cycRe.res && cycRe.res.ok, !!cycRe.manual, cycRe.res && cycRe.res.code, histRe.busy, histRe.res && histRe.res.ok, !!histRe.manual, birthRe.busy, birthRe.res && birthRe.res.ok, birthRe.res && birthRe.res.code, birthDraft, corrBusy, dateDraft, syncReq, abortBusy, imgBusy, Object.keys(imgCache).length, Object.keys(imgFailed).length, latestDone, lastAiErr && lastAiErr.ts, aiErrOpen, page, cfgJ]);
  }
  function pageFert(c) {
    const k = fertUiKey(c); const hit = fertCache[fertSub];
    if (fertUseCache && hit && hit.lj === lastJson && hit.st === st && hit.k === k) return hit.html;
    const html = pageFert0(c);
    fertCache = Object.assign({}, fertCache, { [fertSub]: { lj: lastJson, st: st, k: fertUiKey(c), html: html } });
    return html;
  }
  function pageFert0(c) {
    const cfg = E.config();
    const info = E.cycleInfo(c.cycle, cfg);
    const preg = c.fertility.pregnant;
    const pi = E.pregInfo(c, st.story && st.story.date);
    let h = pageHead('fert');
    if (pi && pi.dueSoon) h += '<div class="phys-alert" role="status">' + esc(t(pi.remain < 0 ? 'ui.preg.overdue' : 'ui.preg.dueSoon', { name: c.name, n: Math.abs(pi.remain), date: pi.due ? fmtDate(pi.due) : '' })) + '</div>';
    { const lc = (c.fertility.conceptions || []).slice(-1)[0]; if (preg && lc && lc.result === 'yes' && pi && pi.day <= 14) h += '<div class="phys-milestone" role="status"><b>' + esc(t('ui296.ms.title')) + '</b><span>' + esc(t('ui296.ms.text', { name: c.name, floor: lc.floor != null ? lc.floor : '—', p: E.fmtPct(lc.pct) })) + '</span></div>'; }
    const recov = E.physMode(c) === 'recovery';
    // 1. heat & conception
    const ci = E.chanceInfo(c, cfg);
    const mi = E.moodInfo(c, cfg);
    let s1 = '';
    if (preg) {
      s1 += '<div class="phys-chance preg"><div class="phys-chance-n"><b>' + esc(t('ui.preg.weekShort', { w: pi.week })) + '</b><small>' + esc(t('ui.preg.stage.' + pi.stage)) + '</small></div><p class="phys-chance-why">' + esc(t('chance.why.pregnant')) + '</p></div>';
    } else if (recov) {
      s1 += '<div class="phys-chance preg"><div class="phys-chance-n"><b>' + esc(t('ui296.rec.title')) + '</b><small>' + esc(t('ui296.rec.left', { n: c.fertility.recovery.left })) + '</small></div><p class="phys-chance-why">' + esc(E.recoveryText(c)) + '</p><div class="phys-chance-top"><span class="phys-lbl">' + esc(t('ui296.l.chanceIf')) + '</span><em>' + esc(pct0(ci.pct)) + '%</em></div>' + meter(ci.pct, 100, 'chance') + '</div>';
    } else {
      s1 += '<div class="phys-chance lv-' + esc(ci.level || 'low') + '"><div class="phys-chance-top"><span class="phys-lbl">' + esc(t('ui296.l.chanceIf')) + (ci.pctSrc === 'ai' ? srcTag('ai') : srcTag('tpl')) + '</span><em>' + esc(t('chance.' + (ci.level || 'low'))) + '</em></div>' +
        '<div class="phys-chance-n"><b>' + esc(pct0(ci.pct)) + '</b><small>%</small></div>' + meter(ci.pct, 100, 'chance') + '<p class="phys-chance-why">' + esc(ci.why) + '</p>' + (ci.pctSrc === 'carry' ? '<p class="phys-muted">本楼 AI 没有给出新数值，沿用之前楼层的几率</p>' : (ci.pct == null ? '<p class="phys-muted">AI 还没有给出受孕几率，下次分析时会给出</p>' : '')) + (ci.basis && ci.basis.text ? '<p class="phys-chance-basis"><span class="phys-lbl">' + esc(t('ui301.chance.basis')) + '</span>' + esc(ci.basis.text) + '</p><p class="phys-help-line">' + esc(t('ui301.chance.help')) + '</p>' : '') + '</div>';
    }
    const phaseTxt = preg ? t('ui.phase.pregnant') : (info.late ? t('ui.anom.late', { n: info.day - info.length }) : t(E.moodKey(c, cfg) === 'pms' ? 'ui.phase.pms' : 'ui.phase.' + info.phase));
    s1 += '<div class="phys-kvs">' + kv(t('ui2.l.phase'), esc(phaseTxt)) + (preg ? kv(t('ui2.l.gest'), esc(t('ui.preg.week', { week: pi.week, wd: pi.wd }))) : kv(t('ui2.l.cycleDay'), '<span class="num">' + info.day + '</span><small> / ' + info.length + '</small>')) + '</div>';
    s1 += '<div class="phys-line2"><span class="phys-lbl">' + esc(t('ui2.l.mood')) + srcTag(mi.src) + '</span><p>' + esc(mi.short) + '</p>' + carryNote(mi.prev, mi.prevFrom) + '</div>';
    if (!preg) { const ov = E.ovulationInfo(c, cfg); if (ov) s1 += '<div class="phys-line2"><span class="phys-lbl">' + esc(t('ui2.l.ovulation')) + srcTag(ov.src) + '</span><p>' + esc(ov.text) + '</p>' + (ov.src === 'ai' ? '<small>' + esc(ov.base) + '</small>' : '') + '</div>'; }
    const ti = E.transInfo(c);
    const tiRow = ti && ti.to !== 'recovery' ? '<div class="phys-line2 phys-trans"><span class="phys-lbl">' + esc(t(ti.to === 'cycle' ? 'ui299.ti.cycle' : 'ui299.ti.preg')) + '<em>' + esc(t('ui299.ti.lv', { p: Math.round(ti.intensity * 100) })) + '</em></span><p>' + esc(ti.text) + '</p>' + tiBar(ti.intensity) + '</div>' : '';
    if (!preg) s1 += tiRow;
    s1 += renderAnoms(c) + (preg ? '' : renderCycleBar(c, info));
    // v2.9.8 two sub-pages: 常态 (cycle) / 孕期 (pregnancy + recovery); default follows the mode, manual choice kept until the mode changes
    const md = E.physMode(c); const key = chKey(c) + ':' + md;
    if (fertSubKey !== key) { fertSubKey = key; fertSub = md === 'pregnant' ? 'preg' : (md === 'recovery' ? 'recov' : 'norm'); }
    // v3.0.5c: tracked but no baseline yet -> numbers are defaults until initialized
    if (c && c.adult && !c.skippedReason && !c.trackOff && !c.profile) h += '<div class="phys-notice k-uninit" role="status"><b>未初始化</b><small>当前数值为默认值，初始化后会以初始化结果为准，并整合已记录的剧情</small><button type="button" class="phys-btn small" data-act="ai-reinit"' + (regenBusy ? ' disabled' : '') + '>' + (regenBusy && regenScope === 'init' ? '初始化中…' : '初始化') + '</button></div>';
    h += renderNotice(c);
    h += '<nav class="phys-subtabs n3" role="tablist">' + ['norm', 'preg', 'recov'].map((k) => '<button type="button" role="tab" class="phys-subtab' + (fertSub === k ? ' on' : '') + '" data-act="fert-sub" data-sub="' + k + '" aria-selected="' + (fertSub === k ? 'true' : 'false') + '">' + esc(t('ui300.sub.' + k)) + (md === SUBMODE[k] ? '<i class="live"></i>' : '') + '</button>').join('') + '</nav>';
    const oi = E.organInfo(c, cfg);
    if (fertSub === 'norm') {
      const orow = (label, text, src, pv) => '<div class="phys-line2"><span class="phys-lbl">' + esc(label) + srcTag(src) + '</span><p>' + esc(text) + '</p>' + (pv ? carryNote(pv, oi.prev && oi.prev.from) : '') + '</div>';
      if (md !== 'cycle') {
        // v3.0.0 sleeping page: snapshot only, the live page is the active one
        h += pausedBar(md) + '<div class="phys-frozen">';
        h += card('snap', t('ui299.s.snap'), t('ui299.h.snap'), renderNormSnap(c));
        h += card('cal', t('ui298.s.calNorm'), t('ui2.h.cal'), renderCalendar(c, cfg, 'norm'), 'cal') + '</div>';
      } else {
        h += card('state', t('ui2.s.state'), t('ui2.h.state'), s1);
        h += card('conceive', t('ui296.s.conceive'), t('ui296.h.conceive'), renderConceptions(c));
        h += card('body', t('ui2.s.body'), t('ui2.h.body'), orow(t('ui2.l.uterus'), oi.uterus, oi.src.uterus, oi.prev && oi.prev.uterus) + orow(t('ui2.l.ovary'), oi.ovary, oi.src.ovary) + (birthText(c, ['womb', 'ovary']) ? '<div class="bt-trait">' + birthText(c, ['womb', 'ovary']) + '</div>' : ''));
        // v3.0.3: 即时身体状态 is shown on 肉欲调教录 only (was duplicated here; data / analysis / injection unchanged)
        h += card('cal', t('ui298.s.calNorm'), t('ui2.h.cal'), renderCalendar(c, cfg, 'norm'), 'cal');
      }
    } else if (fertSub === 'recov') {
      h += md === 'recovery' ? renderRecov3(c) : pausedBar(md) + renderRecovSleep(c);
    } else {
      if (md !== 'pregnant') { h += pausedBar(md); const lp = c.fertility.lastPreg; if (lp) h += '<div class="phys-milestone phys-lastpreg" role="status"><b>' + esc(t('ui300.lp.title')) + '</b><span>' + esc(t('ui300.lp.text', { w: lp.weeks || 0, k: t('ui300.kind.' + (lp.kind || 'birth')), f: lp.father || t('ui300.lp.nf'), d: lp.end ? fmtDate(lp.end) : '' })) + '</span></div>'; }
      if (preg) { const fv = E.fertView(c, E.clockAbs(st)); if (fv) h += renderFert(fv, c); }
      // pregnancy-state 心绪 + 宫巢深处 (written for the pregnant body; AI texts in pregnancy mode, templates otherwise)
      const pd = E.pregDetail(c, st.story && st.story.date);
      if (pd) {
        const prow = (label, text, src) => text ? '<div class="phys-line2"><span class="phys-lbl">' + esc(label) + (src ? srcTag(src) : '') + '</span><p>' + esc(text) + '</p></div>' : '';
        h += card('pmood', t('ui298.s.pmood'), t('ui298.h.pmood'), prow(t('ui2.l.mood'), mi.short, mi.src) + carryNote(mi.prev, mi.prevFrom) + prow(t('ui298.l.emo'), pd.emo) + tiRow);
        h += card('prisk', '异常与风险', '孕期里出现的异常与风险，治疗或静养后会减轻、消除', renderRiskBox(c.fertility.risks, '目前没有异常或风险。'));
        { const lg = renderBirthLog(c, 'preg'); if (lg) h += card('plog', '孕宫近况', '剧情对她这一胎造成的变化', lg); }
        // v3.0.21: fetus text lives only under 孕育与血脉 (renderGest); 宫巢深处 keeps uterus/cervix/horm/ovary to avoid duplicate
        h += card('pbody', t('ui2.s.body'), t('ui298.h.pbody'), prow(t('ui2.l.uterus'), oi.uterus, oi.src.uterus) + prow(t('ui298.l.cervix'), pd.cervix) + prow(t('ui298.l.horm'), pd.horm) + prow(t('ui2.l.ovary'), oi.ovary, oi.src.ovary));
      }
      const fz = c.fertility; const lr = fz.recovery && fz.recovery.left > 0 ? fz.recovery : fz.lastRecovery;
      if (!preg && (lr || fz.birthCount || fz.miscarriages || fz.stillbirths)) { const loss = lr ? E.lossLike(lr.kind) || lr.kind === 'stillbirth' : !fz.birthCount; h += '<div class="phys-milestone phys-ended" role="status"><b>' + esc(t(loss ? 'ui299.ended.loss' : 'ui299.ended.birth')) + '</b><span>' + esc(t(recov ? 'ui299.ended.recov' : 'ui299.ended.done')) + '</span><button type="button" class="phys-btn small" data-act="fert-sub" data-sub="' + (recov ? 'recov' : 'norm') + '">' + esc(t('ui299.ended.go')) + '</button></div>'; }
      const fv0 = preg ? E.fertView(c, E.clockAbs(st)) : null;
      let s3 = preg ? (fv0 && !fv0.done ? '' : renderGestViz(c)) + renderGest(c, pi, oi) + renderPregDetail(c) : (lr || fz.birthCount || fz.miscarriages || fz.stillbirths ? '' : '<p class="phys-empty-note">' + esc(t('ui298.empty.preg')) + '</p>') + renderGest(c, null, oi);
      s3 += renderHistoryStrip(c);
      s3 += section('offspring', esc(t('ui.offspring.title', { count: c.fertility.offspring.length })), c.ui.offspringOpen, renderOffspringRO(c), 'nested');
      h += card('repro', t('ui2.s.repro'), t('ui2.h.repro'), s3);
      if (preg) { const bt = birthText(c, ['womb', 'gest', 'fetal']); if (bt) h += card('pbirth', '孕育体质', '初始化时铺好的底子，剧情改变后随之更新', bt); }
      h += card('cal', t('ui298.s.calPreg'), t('ui298.h.calPreg'), renderCalendar(c, cfg, 'preg'), 'cal');
    }
    h += regenRow('body', c);
    return h;
  }

  // v2.7 body state: immediate state, marks (decay with story days), last encounter, open session
  function bodyCard(c) {
    const id = chKey(c), ses = c.session || {}, b = c.bodyNow || {};
    let x = '';
    if (ses.open) x += '<div class="phys-sess"><i class="ros-dot sess"></i><span>' + esc(t('ui7.body.sessOpen', { acts: Object.keys(ses.acts || {}).map((k) => E.actLabel ? E.actLabel(k) : k).join('、') || '—' })) + '</span><button type="button" class="phys-btn ghost small" data-act="body-endsess">' + esc(t('ui7.body.endSess')) + '</button></div>';
    if (bodyEdit && bodyEdit.id === id && bodyEdit.k === 'now') {
      const f = (k) => '<label class="phys-field">' + esc(t('ui7.body.f.' + k)) + '<input type="text" data-bodyf="' + k + '" value="' + esc(bodyEdit[k] || '') + '"></label>';
      x += f('afterglow') + '<div class="phys-field">' + esc(t('ui7.body.f.semen')) + '<div class="phys-seg">' + E.SEMEN.map((v) => '<button type="button" class="phys-segb' + (bodyEdit.semen === v ? ' on' : '') + '" data-act="body-semen" data-v="' + v + '">' + esc(t('ui7.semen.' + v)) + '</button>').join('') + '</div></div>' + f('semenWhere') + f('soreness') + f('fatigue') +
        '<div class="phys-row"><button type="button" class="phys-btn" data-act="body-save">' + esc(t('ui2.hd.save')) + '</button><button type="button" class="phys-btn ghost" data-act="body-clear">' + esc(t('ui7.body.clear')) + '</button><button type="button" class="phys-btn ghost" data-act="body-cancel">' + esc(t('ui5.cancel')) + '</button></div>';
    } else {
      const nt = E.bodyNowText(c);
      x += '<div class="phys-line2"><span class="phys-lbl">' + esc(t('ui7.body.now')) + (b.user ? '<sup class="phys-src user">' + esc(t('ui.kinks.custom')) + '</sup>' : '') + '</span><p>' + esc(nt || t('ui7.body.calm')) + '</p></div>';
    }
    const marks = c.marks || [];
    const mOpen = marksOpen != null ? marksOpen : marks.length <= 3;
    x += '<div class="phys-line2"><span class="phys-lbl">' + esc(t('ui7.body.marks')) + (marks.length ? '<em class="phys-total">' + marks.length + '</em><button type="button" class="phys-btn ghost small phys-marks-fold" data-act="marks-fold" aria-expanded="' + mOpen + '">' + (mOpen ? '收起' : '展开') + '</button>' : '') + '</span>' + (marks.length && !mOpen ? '' : marks.length ? '<ul class="phys-marks">' + marks.map((m) => '<li><span>' + esc((m.where || '') + (E.MARK_ZH[m.type] || '') + (m.label ? '（' + m.label + '）' : '')) + '</span><span class="phys-sp"></span><button type="button" class="phys-mini" data-act="mark-days" data-mid="' + esc(m.id) + '" data-d="-1" aria-label="-1">−</button><em class="num">' + esc(t('ui7.body.daysLeft', { n: m.days })) + '</em><button type="button" class="phys-mini" data-act="mark-days" data-mid="' + esc(m.id) + '" data-d="1" aria-label="+1">＋</button><button type="button" class="phys-mini" data-act="mark-del" data-mid="' + esc(m.id) + '" aria-label="' + esc(t('ui.offspring.remove')) + '">×</button></li>').join('') + '</ul>' : '<p class="phys-muted">' + esc(t('ui7.body.noMarks')) + '</p>') + '</div>';
    if (bodyEdit && bodyEdit.id === id && bodyEdit.k === 'mark') {
      x += '<div class="phys-field">' + esc(t('ui7.body.f.type')) + '<div class="phys-seg wrap">' + E.MARK_TYPES.map((v) => '<button type="button" class="phys-segb' + (bodyEdit.type === v ? ' on' : '') + '" data-act="mark-type" data-v="' + v + '">' + esc(E.MARK_ZH[v] || v) + '</button>').join('') + '</div></div>' +
        '<label class="phys-field">' + esc(t('ui7.body.f.where')) + '<input type="text" data-bodyf="where" maxlength="16" value="' + esc(bodyEdit.where || '') + '"></label><label class="phys-field">' + esc(t('ui7.body.f.days')) + '<input type="number" inputmode="numeric" min="0" max="30" data-bodyf="days" value="' + esc(String(bodyEdit.days || 3)) + '"></label>' +
        '<div class="phys-row"><button type="button" class="phys-btn" data-act="mark-add">' + esc(t('ui7.body.addMark')) + '</button><button type="button" class="phys-btn ghost" data-act="body-cancel">' + esc(t('ui5.cancel')) + '</button></div>';
    }
    if (bodyEdit && bodyEdit.id === id && bodyEdit.k === 'last') {
      x += '<label class="phys-field">' + esc(t('ui7.body.last')) + '<textarea rows="2" maxlength="120" data-bodyf="note">' + esc(bodyEdit.note || '') + '</textarea></label><div class="phys-row"><button type="button" class="phys-btn" data-act="last-save">' + esc(t('ui2.hd.save')) + '</button><button type="button" class="phys-btn ghost" data-act="body-cancel">' + esc(t('ui5.cancel')) + '</button></div>';
    } else x += '<div class="phys-line2"><span class="phys-lbl">' + esc(t('ui7.body.last')) + '</span><p>' + esc(E.lastSexText(c) || t('ui7.body.noLast')) + '</p></div>';
    if (!bodyEdit || bodyEdit.id !== id) x += '<div class="phys-row"><button type="button" class="phys-btn ghost small" data-act="body-edit">' + esc(t('ui7.body.editNow')) + '</button><button type="button" class="phys-btn ghost small" data-act="mark-new">＋ ' + esc(t('ui7.body.addMark')) + '</button><button type="button" class="phys-btn ghost small" data-act="last-edit">' + esc(t('ui7.body.editLast')) + '</button></div>';
    return card('bodynow', t('ui7.body.title'), t('ui7.body.hint'), x);
  }
  function pageSex(c) {
    const cfg = E.config();
    let h = pageHead('sex');
    h += bodyCard(c);
    // craving now
    const d = E.desireInfo(c, cfg);
    const mi = E.moodInfo(c, cfg);
    let s1 = '<div class="phys-desire">' + [['position', d.position], ['intensity', d.intensity], ['depth', d.depth], ['pace', d.pace]].map((x) => '<div class="phys-dz"><span>' + esc(t('ui2.l.' + x[0])) + '</span><b>' + esc(x[1] || '—') + '</b></div>').join('') + '</div>';
    s1 += '<div class="phys-line2"><span class="phys-lbl">' + esc(t('ui2.l.mood')) + srcTag(d.mood ? d.src : mi.src) + '</span><p>' + esc(d.mood || mi.short) + '</p></div>';
    if (d.text) s1 += '<blockquote class="phys-quote">' + esc(d.text) + srcTag(d.src) + '</blockquote>';
    h += card('desire', t('ui2.s.desire'), t('ui2.h.desire'), s1);
    // kinks
    const pf = E.prefsInfo(c, cfg);
    let s2 = '';
    const kChip = (k) => '<span class="phys-chip' + (k.src === 'user' ? ' user' : '') + '" title="' + esc(k.note || '') + '">' + esc(k.name) + (k.src === 'user' ? '<sup class="phys-src user">' + esc(t('ui.kinks.custom')) + '</sup>' : (k.src === 'guessed' ? guessTag(true) : '')) + (k.unlocked != null && k.src !== 'user' ? '<sup class="phys-new' + (k.fresh ? ' fresh' : '') + '">' + esc(t('ui7.kink.new', { n: k.unlocked })) + '</sup>' : '') + '</span>';
    const kCore = pf.kinks.filter((k) => k.tier !== 'fleet'), kFleet = pf.kinks.filter((k) => k.tier === 'fleet').sort((x, y) => (y.depth || 0) - (x.depth || 0));
    if (kCore.length) s2 += '<div class="phys-ktier core"><h5>' + esc(t('ui301.k.core')) + '<small>' + esc(t('ui301.k.coreH')) + '</small></h5><div class="phys-chips">' + kCore.map(kChip).join('') + '</div></div>';
    // v3.0.5: always show 一时上头的新癖 / 即时性癖 column (empty state included)
    s2 += '<div class="phys-ktier fleet"><h5>' + esc(t('ui301.k.fleet')) + '<small>' + esc(t('ui301.k.fleetH')) + '</small></h5>' + (kFleet.length ? kFleet.map((k) => '<div class="phys-kfleet">' + kChip(k) + meter(k.depth || 0, 100, 'kdepth') + '<em class="num">' + Math.round(k.depth || 0) + '</em><small>' + esc(t(k.pinned ? 'ui301.k.pinned' : ((k.depth || 0) >= 80 ? 'ui301.k.near' : 'ui301.k.fade'), { n: Math.max(1, Math.ceil((k.depth || 0) / 1.5)) })) + '</small></div>').join('') : '<p class="phys-muted">' + esc(t('ui301.k.fleetEmpty')) + '</p>') + '</div>';
    s2 = '<p class="phys-help-line">' + esc(t('ui301.k.help')) + '</p>' + s2;
    if (pf.text) s2 += '<div class="phys-line2"><span class="phys-lbl">' + esc(t('ui.pref.title')) + srcTag(pf.src) + '</span><p>' + esc(pf.text) + '</p></div>';
    s2 += '<div class="phys-row end">' + (c.kinks && c.kinks.locked ? '<span class="phys-tagline">' + esc(t('ui.kinks.locked')) + '</span>' : '') + '<button type="button" class="phys-btn ghost small" data-act="go-kinks">' + esc(t('ui2.kinks.edit')) + '</button></div>';
    h += card('kinks', t('ui2.s.kinks'), t('ui2.h.kinks'), s2);
    // records
    const ii = E.intimacyInfo(c, cfg, st.story && st.story.date);
    const done = ii.acts.filter((a) => a.count > 0);
    let s3 = '<p class="phys-help-line">' + esc(t('ui301.tech.help')) + '</p><div class="phys-rec-sum"><span class="num">' + esc(t('ui.sex.total', { total: ii.total })) + '</span><em>' + esc(t('ui3.rec.kinds', { a: done.length, b: ii.acts.length })) + '</em></div>';
    if (ii.modLine && ii.total) s3 += '<p class="phys-act-mod"><span>' + esc(t('ui.feel.mod')) + '</span>' + esc(ii.modLine) + '</p>';
    if ((c.actsHidden || []).length) s3 += '<div class="phys-hidden-acts"><span class="phys-lbl">' + esc(t('ui296.act.hidden')) + '</span>' + c.actsHidden.map((k) => '<button type="button" class="phys-chip sm" data-act="act-restore" data-key="' + esc(k) + '">' + esc(E.actLabel ? E.actLabel(k) : k) + ' · ' + esc(t('ui296.act.restore')) + '</button>').join('') + '</div>';
    if (!recOpen) {
      s3 += '<div class="phys-chips">' + ii.acts.map((a) => '<span class="phys-chip' + (a.count ? ' t' + a.tier : ' zero') + '">' + esc(a.label) + ' <em class="num">' + (a.count || esc(t('ui2.l.none'))) + '</em></span>').join('') + '</div>';
    } else {
      const none = esc(t('ui2.l.none')), untried = esc(t('ui3.rec.untried'));
      ii.acts.forEach((a) => {
        const tag = (a.custom ? '<sup class="phys-src user">' + esc(t('ui.cact.tag')) + '</sup>' : '') + (a.count && c.sexEst && c.sexEst[a.key] ? guessTag(true) : '');
        const delB = '<button type="button" class="phys-act-del" data-act="act-del" data-key="' + esc(a.key) + '" aria-label="' + esc(t('ui296.act.del', { name: a.label })) + '">' + esc(t('ui296.act.delShort')) + '</button>';
        if (!a.count) {
          s3 += '<article class="phys-rec zero"><header><b>' + esc(a.label) + tag + '</b><span class="phys-tier">' + untried + '</span><em class="num">' + esc(t('ui2.l.count', { n: 0 })) + '</em>' + delB + '</header>' +
            '<div class="phys-rec-m"><span class="phys-lbl">' + esc(t('ui2.l.prof')) + '</span>' + meter(0, 100, 'prof') + '<em>' + none + '</em></div>' +
            '<div class="phys-rec-m"><span class="phys-lbl">' + esc(t('ui2.l.liking')) + '</span>' + meter(0, 100, 'liking') + '<em>—</em></div>' +
            '<div class="phys-line2"><span class="phys-lbl">' + esc(t('ui2.l.feeling')) + '</span><p class="phys-none">' + untried + '</p></div>' +
            '<div class="phys-line2"><span class="phys-lbl">' + esc(t('ui2.l.tech')) + '</span><p class="phys-none">' + none + '</p></div>' +
            '<div class="phys-line2"><span class="phys-lbl">' + esc(t('ui2.l.bodyChange')) + '</span><p class="phys-none">' + untried + '</p></div></article>';
          return;
        }
        s3 += '<article class="phys-rec t' + a.tier + '"><header><b>' + esc(a.label) + tag + '</b><span class="phys-tier">' + esc(a.profLabel) + '</span><em class="num">' + esc(t('ui2.l.count', { n: a.count })) + '</em>' + delB + '</header>' +
          '<div class="phys-rec-m"><span class="phys-lbl">' + esc(t('ui2.l.prof')) + '</span>' + meter((a.tier - 1 + a.progress) / 4 * 100, 100, 'prof') + '<em>' + Math.round((a.tier - 1 + a.progress) / 4 * 100) + '</em></div>' +
          '<div class="phys-rec-m"><span class="phys-lbl">' + esc(t('ui2.l.liking')) + srcTag(a.likingSrc) + '</span>' + meter(a.liking, 100, 'liking') + '<em class="num">' + a.liking + '</em></div>' +
          '<div class="phys-line2"><span class="phys-lbl">' + esc(t('ui2.l.feeling')) + srcTag(a.src) + '</span><p>' + esc(a.line) + '</p></div>' +
          '<div class="phys-line2"><span class="phys-lbl">' + esc(t('ui2.l.tech')) + srcTag(a.techSrc) + '</span><p>' + (a.tech.length ? a.tech.map((x) => '<span class="phys-chip sm">' + esc(x) + (a.techSrc === 'ai' && a.tp && a.tp[x] ? '<sup class="phys-tp">' + esc(t('ui301.tech.lv', { n: a.tp[x] })) + '</sup>' : '') + '</span>').join('') + (a.techSrc === 'ai' && a.tech.length > 1 ? '<button type="button" class="phys-btn ghost small" data-act="tech-merge" data-key="' + esc(a.key) + '" title="' + esc(t('ui301.tech.help')) + '">' + esc(t('ui301.tech.merge')) + '</button>' : '') : '<span class="phys-none">' + none + '</span>') + '</p></div>' +
          '<div class="phys-line2"><span class="phys-lbl">' + esc(t('ui2.l.bodyChange')) + srcTag(a.bodySrc) + '</span><p' + (a.body ? '' : ' class="phys-none"') + '>' + (a.body ? esc(a.body) : none) + '</p></div></article>';
      });
    }
    if (c.profile && E.config().aiDescribe && !ii.acts.some((a) => a.count > 0)) {
      const fu = sexFillUi[chKey(c)] || {};
      s3 = '<div class="phys-sexfill"><p>' + esc('相遇前的性经历还没有生成（全部为 0 次）。') + '</p><button type="button" class="phys-btn small" data-act="ai-sexfill"' + (fu.busy || regenBusy ? ' disabled' : '') + '>' + (fu.busy ? '<span class="phys-spin"></span>' + esc('正在生成…') : esc('补全性经历')) + '</button>' +
        (fu.err ? '<div class="phys-gen err">' + esc('补全失败：' + fu.err + '（原数据未改动），可再点一次重试') + '</div>' : (fu.note ? '<div class="phys-gen">' + esc(fu.note) + '</div>' : '')) + '</div>' + s3;
    }
    s3 += '<div class="phys-row center"><button type="button" class="phys-btn ghost small" data-act="rec-toggle" aria-expanded="' + (recOpen ? 'true' : 'false') + '">' + esc(recOpen ? t('ui2.rec.less') : t('ui2.rec.more', { n: ii.acts.length })) + '</button></div>';
    h += card('records', t('ui2.s.records'), t('ui2.h.records'), s3, recOpen ? 'open' : '');
    h += regenRow('acts', c);
    return h;
  }

  const PROF_GROUPS = [['identity', ['name', 'social', 'identity', 'occupation', 'relationship', 'age', 'species', 'body', 'constitution', 'healthNotes']], ['cycle', ['cycleLength', 'periodLength', 'follicular', 'luteal', 'cycleDay', 'regularity', 'menopause', 'contraception', 'anomalies']], ['reproHist', ['fertility', 'fertilityWhy', 'pregnancyCount', 'birthCount', 'miscarriages', 'stillbirths', 'offspring']], ['sexHist', ['sex', 'sexSummary', 'sensitivity']], ['criteria', ['kinks', 'sexPersona', 'criteria', 'summary']]];
  function renderProfDiff(r, confirmAct, cancelAct, title) {
    const ch = r.rows.filter((x) => x.changed);
    let h = '<div class="phys-diff"><div class="phys-diff-h">' + esc(title) + '</div>';
    if (!ch.length && !(r.kinksAdd && r.kinksAdd.length)) h += '<p class="phys-muted">' + esc(t('ui2.prof.noChange')) + '</p>';
    else {
      h += '<div class="phys-diff-t"><span></span><b>' + esc(t('ui.rebase.old')) + '</b><b>' + esc(t('ui.rebase.new')) + '</b></div>';
      ch.forEach((x) => { h += '<div class="phys-diff-r ch' + (x.pending ? ' pend' : '') + '"><span>' + esc(x.label) + (x.from ? '<em class="from-tag f-' + esc(x.from) + '">' + esc(FROM_ZH[x.from] || '') + '</em>' : '') + '</span><i>' + esc(x.old) + '</i><i>' + esc(x.now) + (x.note ? '<small class="from-note">' + esc(x.note) + '</small>' : '') + '</i></div>'; });
    }
    if (r.kinksAdd && r.kinksAdd.length) h += '<p class="phys-note">' + esc(t('ui2.prof.kinksAdd', { list: r.kinksAdd.map((k) => k.name).join('、') })) + '</p>';
    if (r.notes && r.notes.length) h += '<p class="phys-muted">' + esc(t('ui2.prof.notes', { list: r.notes.join('；') })) + '</p>';
    if (r.detail && !r.aiOk) h += '<p class="phys-muted">' + esc(r.detail) + '</p>';
    return h + '<div class="phys-row"><button type="button" class="phys-btn" data-act="' + confirmAct + '">' + esc(t('ui2.prof.confirm')) + '</button><button type="button" class="phys-btn ghost" data-act="' + cancelAct + '">' + esc(t('ui.rebase.cancel')) + '</button></div></div>';
  }
  const DF_NUM = ['age', 'cycleLength', 'periodLength', 'follicular', 'luteal', 'cycleDay', 'pregnancyCount', 'birthCount', 'miscarriages', 'stillbirths'];
  const DF_BOOL = ['menopause', 'contraception'];
  const DF_SKIP = ['anomalies', 'summary'];
  function dossView(p) {
    let h = '';
    PROF_GROUPS.forEach((g) => {
      const rows = g[1].map((k) => {
        if (k === 'sex') return '<div class="phys-dl"><dt>' + esc(E.profLabel(k)) + '</dt><dd><div class="phys-actlist">' + E.SEX_KEYS.map((x) => { const n = p.sex && p.sex[x] > 0 ? p.sex[x] : 0; return '<span class="' + (n ? '' : 'zero') + '"><i>' + esc(E.actLabel(x)) + '</i><b class="num">' + (n ? '×' + n : esc(t('ui2.l.none'))) + '</b></span>'; }).join('') + '</div></dd></div>';
        if (k === 'social') return '<div class="phys-dl"><dt>' + esc(E.profLabel(k)) + '</dt><dd><span class="dz-chips">' + ((p.social || []).length ? p.social.map((x) => '<i class="hd-chip">' + esc(x) + '</i>').join('') : esc(t('ui5.unknown'))) + '</span></dd></div>';
        const v = E.profVal(p, k);
        if (v === '—' && ['anomalies', 'stillbirths', 'miscarriages', 'summary'].indexOf(k) >= 0) return '';
        return '<div class="phys-dl"><dt>' + esc(E.profLabel(k)) + '</dt><dd>' + esc(v === '—' ? t('ui5.unknown') : v) + '</dd></div>';
      }).join('');
      h += card('pf-' + g[0], t('ui2.s.' + g[0]), '', '<dl class="phys-dls">' + rows + '</dl>');
    });
    return h;
  }
  const CUR_RO = ['pregnancyCount', 'birthCount', 'miscarriages', 'stillbirths', 'pregnancyDay', 'pregnancyWeek', 'sex', 'offspring', 'kinks', 'menopause', 'contraception', 'fertility', 'anomalies'];
  function dossForm(d, cur) {
    const inp = (k, v, type) => '<label class="phys-field df"><span>' + esc(E.profLabel(k)) + '</span>' + (type === 'area' ? '<textarea data-df="' + k + '" rows="2" maxlength="200">' + esc(v == null ? '' : v) + '</textarea>' : '<input type="' + (type || 'text') + '" data-df="' + k + '" value="' + esc(v == null ? '' : v) + '"' + (type === 'number' ? ' inputmode="numeric" min="0"' : '') + '>') + '</label>';
    let h = cur ? '<p class="phys-muted df-note">现状只是剧情摘要：这里只改文字。周期、怀孕、次数、孩子等数字由记录自动填入，要改请到「设置」或对应页面。</p>' : '';
    PROF_GROUPS.forEach((g) => {
      let b = '';
      g[1].forEach((k) => {
        if (DF_SKIP.indexOf(k) >= 0) return;
        if (cur && CUR_RO.indexOf(k) >= 0) return;
        if (['cycleLength', 'periodLength', 'follicular', 'ovulationDay', 'luteal', 'cycleDay', 'regularity', 'cycleWhy'].indexOf(k) >= 0) { // v3.0.5k read-only here
          const v = k === 'regularity' ? t(d.regularity === 'irregular' ? 'ui.reg.irregular' : 'ui.reg.regular') : (d[k] == null || d[k] === '' ? '—' : String(d[k]));
          b += '<div class="phys-field df ro"><span>' + esc(E.profLabel(k)) + '</span><div class="phys-muted">' + esc(v) + '</div></div>';
          if (k === 'cycleLength') b += '<p class="phys-muted df-note">' + esc(t('ui.cycle.roHint')) + '</p>';
          return;
        }
        if (k === 'sex') { b += '<div class="df-acts">' + E.SEX_KEYS.map((x) => '<label class="df-act"><span>' + esc(E.actLabel(x)) + '</span><input type="number" inputmode="numeric" min="0" data-dfa="' + esc(x) + '" value="' + ((d.sex && d.sex[x]) || 0) + '"></label>').join('') + '</div>'; return; }
        if (k === 'offspring') {
          b += '<div class="df-kids"><span class="phys-lbl">' + esc(E.profLabel(k)) + '</span>' + (d.offspring || []).map((o, i) => '<div class="phys-off df-kid" data-dfo="' + i + '"><input class="phys-off-name" type="text" data-o="name" value="' + esc(o.name || '') + '" placeholder="' + esc(t('ui.offspring.name')) + '"><input class="phys-off-age" type="number" data-o="age" value="' + (o.age == null ? '' : esc(o.age)) + '" placeholder="' + esc(t('ui.offspring.age')) + '"><select data-o="gender"><option value=""' + (!o.gender ? ' selected' : '') + '>' + esc(t('ui.gender.other')) + '</option><option value="female"' + (o.gender === 'female' ? ' selected' : '') + '>' + esc(t('ui.gender.female')) + '</option><option value="male"' + (o.gender === 'male' ? ' selected' : '') + '>' + esc(t('ui.gender.male')) + '</option></select><button type="button" class="phys-mini danger" data-act="df-kid-del" data-i="' + i + '">×</button><input class="phys-off-note" type="text" data-o="note" value="' + esc(o.note || '') + '" placeholder="' + esc(t('ui.offspring.note')) + '"></div>').join('') +
            '<button type="button" class="phys-btn ghost small" data-act="df-kid-add">' + esc(t('ui.offspring.add')) + '</button></div>';
          return;
        }
        if (DF_BOOL.indexOf(k) >= 0) { b += '<label class="phys-check"><input type="checkbox" data-df="' + k + '"' + (d[k] ? ' checked' : '') + '><span>' + esc(E.profLabel(k)) + '</span></label>'; return; }
        if (k === 'social') { b += inp(k, (d.social || []).join('、')); return; }
        if (k === 'kinks') { b += inp(k, (d.kinks || []).map((x) => x.name).join('、')); return; }
        if (k === 'regularity') { b += '<label class="phys-field df"><span>' + esc(E.profLabel(k)) + '</span><select data-df="regularity"><option value="regular"' + (d.regularity !== 'irregular' ? ' selected' : '') + '>' + esc(t('ui.reg.regular')) + '</option><option value="irregular"' + (d.regularity === 'irregular' ? ' selected' : '') + '>' + esc(t('ui.reg.irregular')) + '</option></select></label>'; return; }
        if (k === 'fertility') { b += '<label class="phys-field df"><span>' + esc(E.profLabel(k)) + '</span><select data-df="fertility">' + ['high', 'normal', 'low', 'infertile', 'special'].map((x) => '<option value="' + x + '"' + (d.fertility === x ? ' selected' : '') + '>' + esc(t('ui.histstrip.fert.' + x)) + '</option>').join('') + '</select></label>'; return; }
        b += inp(k, d[k], DF_NUM.indexOf(k) >= 0 ? 'number' : (['constitution', 'healthNotes', 'sensitivity', 'sexPersona', 'criteria', 'body', 'sexSummary', 'fertilityWhy'].indexOf(k) >= 0 ? 'area' : 'text'));
      });
      h += card('df-' + g[0], t('ui2.s.' + g[0]), '', '<div class="df-grid">' + b + '</div>');
    });
    return h;
  }
  function readDossForm() {
    const d = dossEdit.d;
    view.querySelectorAll('[data-df]').forEach((el) => { const k = el.dataset.df; d[k] = el.type === 'checkbox' ? el.checked : el.value; });
    const sx = {}; view.querySelectorAll('[data-dfa]').forEach((el) => { sx[el.dataset.dfa] = el.value; }); if (Object.keys(sx).length) d.sex = sx;
    const kids = []; view.querySelectorAll('[data-dfo]').forEach((row) => { const o = {}; row.querySelectorAll('[data-o]').forEach((el) => { o[el.dataset.o] = el.value; }); kids.push(o); }); d.offspring = kids;
    return d;
  }
  function renderCorr(c) {
    const co = c.corruption;
    const busy = corrBusy === chKey(c);
    let h = '';
    if (co) {
      h += '<div class="dz-corr"><div class="dz-corr-lv"><b>' + esc(t('ui6.corr.level', { n: co.level, name: co.name })) + '</b><span class="dz-corr-bar"><i style="width:' + Math.round(co.level / 5 * 100) + '%"></i></span></div>' +
        (co.comment ? '<p class="dz-corr-c">' + esc(co.comment) + '</p>' : '') + (co.summary ? '<p>' + esc(co.summary) + '</p>' : '') +
        (co.results && co.results.length ? '<ul class="dz-corr-r">' + co.results.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '') +
        '<p class="phys-muted">' + esc(t(co.sig === E.corrSig(c, E.config()) ? 'ui6.corr.fresh' : 'ui6.corr.stale')) + '</p></div>';
    } else h += '<p class="phys-muted">' + esc(t('ui6.corr.empty')) + '</p>';
    h += '<button type="button" class="phys-btn block" data-act="corr-regen"' + (busy ? ' disabled' : '') + '>' + esc(t(busy ? 'ui6.corr.busy' : 'ui6.corr.regen')) + '</button>';
    return card('pf-corr', t('ui6.corr.title'), t('ui6.corr.sub'), h, 'dz-card');
  }
  function renderCompare(c) {
    const cmp = E.compareDossiers(c, E.config());
    if (!cmp.hasBase) return '<p class="phys-muted phys-pad">' + esc(t('ui2.prof.empty')) + '</p>';
    let h = '<div class="dz-cmp"><div class="dz-cmp-h"><span></span><b>' + esc(t('ui5.cmp.base')) + '</b><b>' + esc(t('ui5.cmp.cur')) + '</b></div>';
    let acts = '';
    cmp.rows.forEach((r) => {
      let cur = esc(r.cur);
      if (r.num && r.delta) cur += ' <em class="dz-d ' + (r.delta > 0 ? 'up' : 'dn') + '">' + (r.delta > 0 ? '+' : '') + r.delta + '</em>';
      if (r.added && r.added.length) cur += ' ' + r.added.map((x) => '<em class="dz-new">' + esc(t('ui5.cmp.added')) + ' · ' + esc(x) + '</em>').join(' ');
      const row = '<div class="dz-row' + (r.changed ? ' ch' : '') + (r.group === 'sex' ? ' act' : '') + '" data-key="' + esc(r.key) + '"><span>' + esc(r.label) + '</span><i>' + esc(r.base === '—' ? t('ui5.unknown') : r.base) + '</i><i>' + (r.group === 'sex' && r.changed ? '<b class="num">' + esc(r.base) + ' → ' + esc(r.cur) + '</b> <em class="dz-d up">' + (r.delta > 0 ? '+' : '') + r.delta + '</em>' : cur) + '</i></div>';
      if (r.group === 'sex') acts += row; else h += row;
    });
    h += '<div class="dz-sub">' + esc(t('ui5.cmp.acts')) + '</div>' + acts + '</div>';
    return card('pf-cmp', t('ui5.cmp.title'), t('ui5.cmp.sub', { n: cmp.changed }), h, 'dz-card');
  }
  function pageProfile(c) {
    let h = pageHead('profile');
    h += '<nav class="dz-seg" role="tablist">' + [['base', 'ui5.tab.base'], ['cur', 'ui5.tab.cur'], ['cmp', 'ui5.tab.cmp']].map((x) => '<button type="button" role="tab" class="dz-segb' + (dossTab === x[0] ? ' on' : '') + '" data-act="doss-tab" data-tab="' + x[0] + '" aria-selected="' + (dossTab === x[0]) + '">' + esc(t(x[1])) + '</button>').join('') + '</nav>';
    if (dossTab === 'cmp') { if (c.profile) h += renderCorr(c); h += renderCompare(c); return h; }
    const isBase = dossTab === 'base';
    const p = isBase ? c.profile : E.currentOf(c, E.config());
    const editing = dossEdit && dossEdit.which === dossTab && dossEdit.id === chKey(c);
    h += '<div class="dz-banner ' + (isBase ? 'lock' : 'live') + '"><b>' + esc(t(isBase ? 'ui5.base.title' : 'ui5.cur.title')) + '</b><span>' + esc(t(isBase ? (c.profileLocked ? 'ui5.base.locked' : 'ui5.base.unlocked') : (E.config().dossierAuto ? 'ui5.cur.auto' : 'ui5.cur.manual'))) + '</span>' +
      (editing ? '' : '<button type="button" class="phys-btn ghost small" data-act="doss-edit">' + esc(t('ui5.edit')) + '</button>') + '</div>';
    if (!p && isBase) h += '<p class="phys-muted phys-pad">' + esc(t('ui2.prof.empty')) + '</p>';
    else if (editing) h += dossForm(dossEdit.d, !isBase) + '<div class="phys-row dz-save"><button type="button" class="phys-btn" data-act="doss-save">' + esc(t('ui5.save')) + '</button><button type="button" class="phys-btn ghost" data-act="doss-cancel">' + esc(t('ui5.cancel')) + '</button></div>';
    else h += dossView(p);
    if (editing) return h;
    if (isBase && p) h += renderQuotes(c);
    { // v3.0.5s 淫体本色 / 淫躯今貌 retired: short 生育特质 line (base on the initial dossier, now on the current one)
      const b = E.birthOf(c); const tx = isBase ? b.base.short : (b.now.short || b.base.short);
      const lastLog = (b.log || []).slice(-1)[0];
      const md = E.physMode(c); const where = md === 'pregnant' ? '孕宫胎动' : (md === 'recovery' ? '产后余韵' : '淫宫潮汐');
      h += card(isBase ? 'birthbase' : 'birthnow', '生育特质', isBase ? '初始化时按角色卡定下的生育底子' : '结合剧情的当前生育状态', tx ? '<p class="bt-short">' + esc(tx) + '</p>' + (!isBase && lastLog && lastLog.floor != null ? '<small class="phys-muted">最近变化：第 ' + lastLog.floor + ' 楼' + (lastLog.why ? ' · ' + esc(lastLog.why) : '') + '</small>' : '') + '<p class="phys-muted bt-more">详细描写见 ' + esc(where) + '；档位在 设置 · 生育。</p>' : '<p class="phys-none">还没有初始化生育，可在 设置 · 生育 中按角色卡初始化。</p>');
    }
    const mine = prof.id === chKey(c);
    const busy = prof.busy || rebase.busy;
    let a = '';
    // v3.0.5b: base = 重新生成初始肉体; current = one 更新 (tracker sync + AI rewrite merged)
    const x = isBase ? ['reload', 'rebase-start'] : ['all', 'prof-update'];
    a += '<div class="phys-pact"><button type="button" class="phys-btn' + (isBase ? ' ghost' : '') + ' block" data-act="' + x[1] + '"' + (busy ? ' disabled' : '') + '>' + esc((prof.busy && mine) || (isBase && rebase.busy && rebase.id === chKey(c)) ? t('ui2.prof.busy') : t(isBase ? 'ui5.base.reload' : 'ui5.cur.update')) + '</button><p class="phys-muted">' + esc(t(isBase ? 'ui5.base.reloadHint' : 'ui5.cur.updateHint')) + '</p></div>';
    if (!isBase && mine && prof.res && prof.res.ok) a += renderProfDiff(prof.res, 'prof-confirm', 'prof-cancel', t('ui2.prof.diffTitle', { name: prof.res.name, mode: t('ui.prof.mode.' + prof.res.mode) }));
    else if (!isBase && mine && prof.res && !prof.res.ok) a += '<p class="phys-status err">' + esc(t('ui2.prof.fail', { code: prof.res.code || 'error', detail: prof.res.detail || '' })) + '</p>';
    if (isBase) a += renderReload(c);
    h += card('pf-actions', t('ui2.s.profActions'), '', a, 'actions');
    return h;
  }

  /* ---- rendering: settings view ---- */
  function renderOffspringEdit(c) {
    const list = c.fertility.offspring || [];
    let h = '<div class="off-list">';
    if (!list.length) h += '<div class="off-empty"><b>还没有后代</b><p class="phys-muted">剧情中生产后会自动记在这里，也可以手动添加。</p></div>';
    list.forEach((o, i) => {
      const g = o.gender;
      h += '<div class="phys-off off-card ' + (g || 'x') + '" data-uid="' + esc(o.uid) + '">' +
        '<div class="off-h"><span class="off-no">' + (i + 1) + '</span><input class="phys-off-name" type="text" data-off="name" placeholder="' + esc(t('ui.offspring.name')) + '" value="' + esc(o.name) + '" maxlength="60" aria-label="' + esc(t('ui.offspring.name')) + '">' +
        '<button type="button" class="phys-mini danger" data-act="off-del" aria-label="' + esc(t('ui.offspring.remove')) + '" title="' + esc(t('ui.offspring.remove')) + '">×</button></div>' +
        '<div class="off-m"><label><small>' + esc(t('ui.offspring.age')) + '</small><span class="off-age"><input class="phys-off-age" type="number" inputmode="numeric" data-off="age" placeholder="—" value="' + (o.age == null ? '' : esc(o.age)) + '" min="0" max="200"><em>岁</em></span></label>' +
        '<label><small>' + esc(t('ui.offspring.gender')) + '</small><select data-off="gender">' +
        '<option value=""' + (!g ? ' selected' : '') + '>' + esc(t('ui.gender.other')) + '</option>' +
        '<option value="female"' + (g === 'female' ? ' selected' : '') + '>' + esc(t('ui.gender.female')) + '</option>' +
        '<option value="male"' + (g === 'male' ? ' selected' : '') + '>' + esc(t('ui.gender.male')) + '</option></select></label></div>' +
        '<input class="phys-off-note" type="text" data-off="note" placeholder="' + esc(t('ui.offspring.note')) + '" value="' + esc(o.note) + '" maxlength="200">' +
        (o.quote ? '<q class="fam-q">' + esc(o.quote) + '</q>' : '') +
        '<div class="off-tags">' + (o.src === 'user' ? '<em class="from-tag f-user">你的设定</em>' : (o.src === 'story' ? '<em class="from-tag f-live">剧情</em>' : (o.quote || o.src === 'card' ? '<em class="from-tag f-baseline">角色卡</em>' : ''))) + (o.ageGuessed ? '<em class="from-tag f-guess">年龄推测</em>' : (o.age == null ? '<em class="from-tag f-guess">年龄未写明</em>' : '')) + (o.flag ? '<em class="from-tag f-warn">' + esc(o.flag) + '</em>' : '') + '</div>' +
        '</div>';
    });
    return h + '</div><button type="button" class="phys-btn block" data-act="off-add">' + esc(t('ui.offspring.add')) + '</button>';
  }
  function pickItems() {
    const f = modelPick.filter.trim().toLowerCase();
    const items = f ? modelPick.list.filter((m) => m.toLowerCase().indexOf(f) >= 0) : modelPick.list;
    if (!items.length) return '<p class="phys-muted phys-pick-empty">' + esc(t('ui.api.models.nomatch')) + '</p>';
    const cur = apiDraft ? apiDraft.model : '';
    return items.map((m) => '<button type="button" role="option" class="phys-pick-item' + (m === cur ? ' on' : '') + '" data-act="model-pick" data-model="' + esc(m) + '" aria-selected="' + (m === cur ? 'true' : 'false') + '">' + esc(m) + '</button>').join('');
  }
  function renderModelPicker() {
    if (!modelPick.list.length || !apiDraft) return '';
    const open = modelPick.open;
    let h = '<div class="phys-picker' + (open ? ' open' : '') + '" data-role="model-picker">' +
      '<button type="button" class="phys-pick-h" data-act="models-toggle" aria-expanded="' + (open ? 'true' : 'false') + '">' +
      '<span class="phys-pick-n">' + esc(t('ui.api.models.count', { count: modelPick.list.length })) + '</span>' +
      '<span class="phys-pick-cur">' + esc(apiDraft.model || t('ui.api.models.none')) + '</span>' +
      '<span class="phys-caret' + (open ? ' open' : '') + '">' + CHEV2 + '</span></button>';
    if (open) {
      if (modelPick.list.length > 8) h += '<input type="text" class="phys-pick-filter" data-api="modelFilter" value="' + esc(modelPick.filter) + '" placeholder="' + esc(t('ui.api.models.filter')) + '" autocomplete="off" autocapitalize="off" spellcheck="false">';
      h += '<div class="phys-pick-list" role="listbox">' + pickItems() + '</div>';
    }
    return h + '</div>';
  }

  function renderAiOpts() {
    if (!aiDraft) return '<p class="phys-muted">…</p>';
    const d = aiDraft;
    let h = '<label class="phys-check"><input type="checkbox" data-ai="autoSyncOff"' + (!d.autoSync ? ' checked' : '') + '><span>' + esc(t('ui3.autoSync.label')) + '</span></label><p class="phys-muted">' + esc(t('ui3.autoSync.desc')) + '</p>';
    h += '<label class="phys-check"><input type="checkbox" data-ai="dossierAuto"' + (d.dossierAuto !== false ? ' checked' : '') + '><span>' + esc(t('ui5.set.dossierAuto')) + '</span></label><p class="phys-muted">' + esc(t('ui5.set.dossierAutoDesc')) + '</p>';
    h += '<p class="phys-muted">' + esc(t('ui.ai.optsHint')) + '</p>';
    h += '<label class="phys-check"><input type="checkbox" data-ai="aiDescribe"' + (d.aiDescribe ? ' checked' : '') + '><span>' + esc(t('settings.aiDescribe.label')) + '</span></label>';
    h += '<p class="phys-muted">' + esc(t('settings.aiDescribe.desc')) + '</p>';
    h += '<label class="phys-check"><input type="checkbox" data-ai="aiPlot"' + (d.aiPlot ? ' checked' : '') + '><span>' + esc(t('settings.aiPlot.label')) + '</span></label>';
    h += '<p class="phys-muted">' + esc(t('settings.aiPlot.desc')) + '</p>';
    h += '<label class="phys-check"><input type="checkbox" data-ai="aiInit"' + (d.aiInit ? ' checked' : '') + '><span>' + esc(t('settings.aiInit.label')) + '</span></label>';
    h += '<p class="phys-muted">' + esc(t('settings.aiInit.desc')) + '</p>';
    h += '<label class="phys-field">' + esc(t('settings.aiContext.label')) + '<input type="number" inputmode="numeric" data-ai="aiContext" min="2" max="30" step="1" value="' + d.aiContext + '"></label>';
    h += '<p class="phys-muted">' + esc(t('settings.aiContext.desc')) + '</p>';
    h += '<label class="phys-field">' + esc(t('settings.aiMaxTokens.label')) + '<input type="number" inputmode="numeric" data-ai="aiMaxTokens" min="1000" max="32000" step="500" value="' + d.aiMaxTokens + '"></label>';
    h += '<p class="phys-muted">' + esc(t('settings.aiMaxTokens.desc')) + '</p>';
    h += '<label class="phys-check"><input type="checkbox" data-ai="aiNoThink"' + (d.aiNoThink ? ' checked' : '') + '><span>' + esc(t('settings.aiNoThink.label')) + '</span></label>';
    h += '<p class="phys-muted">' + esc(t('settings.aiNoThink.desc')) + '</p>';
    h += '<label class="phys-field">' + esc(t('settings.aiBaselineTokens.label')) + '<input type="number" inputmode="numeric" data-ai="aiBaselineTokens" min="1000" max="32000" step="500" value="' + d.aiBaselineTokens + '"></label>';
    h += '<p class="phys-muted">' + esc(t('settings.aiBaselineTokens.desc')) + '</p>';
    h += '<label class="phys-field">' + esc(t('settings.aiCardChars.label')) + '<input type="number" inputmode="numeric" data-ai="aiCardChars" min="1000" max="20000" step="500" value="' + d.aiCardChars + '"></label>';
    h += '<p class="phys-muted">' + esc(t('settings.aiCardChars.desc')) + '</p>';
    return h;
  }

  function renderApi() {
    if (!apiDraft) return '<p class="phys-muted">…</p>';
    const d = apiDraft;
    const mode = E.resolveApiMode({ enabled: d.enabled, baseUrl: d.baseUrl, model: d.model, apiKey: d.newKey || (d.hasKey ? '(saved)' : '') });
    let h = '<label class="phys-check"><input type="checkbox" data-api="enabled"' + (d.enabled ? ' checked' : '') + '><span>' + esc(t('ui.api.enable')) + '</span></label>';
    h += '<p class="phys-muted">' + esc(t('ui.api.hint')) + '</p>';
    h += '<p class="phys-muted">' + esc(t('ui.api.mainHint')) + '</p>';
    if (mode.mode === 'main') h += '<p class="phys-status ok" role="status">' + esc(t('ui.api.mainActive')) + '</p>';
    if (mode.mode === 'incomplete') {
      h += '<p class="phys-status err" role="status">' + esc(t('ui.api.missing', { fields: (mode.missing || []).join('、') })) + '</p>';
      h += '<div class="phys-row"><button type="button" class="phys-btn ghost" data-act="api-use-main">' + esc(t('ui.api.useMain')) + '</button></div>';
    }
    h += '<label class="phys-field">' + esc(t('ui.api.baseUrl')) + '<input type="text" data-api="baseUrl" value="' + esc(d.baseUrl) + '" placeholder="https://api.openai.com/v1" autocomplete="off" autocapitalize="off" spellcheck="false"></label>';
    h += '<label class="phys-field">' + esc(t('ui.api.apiKey')) + '<span class="phys-pw"><input type="' + (d.showKey ? 'text' : 'password') + '" data-api="apiKey" value="' + esc(d.newKey) + '" placeholder="' + esc(d.hasKey ? t('ui.api.keySaved', { masked: d.masked }) : 'sk-…') + '" autocomplete="new-password" autocapitalize="off" spellcheck="false">' +
      '<button type="button" class="phys-mini" data-act="api-eye" aria-label="' + esc(t('ui.api.toggleKey')) + '" title="' + esc(t('ui.api.toggleKey')) + '"></button></span></label>';
    h += '<div class="phys-grid2"><label class="phys-field">' + esc(t('ui.api.model')) + '<input type="text" data-api="model" value="' + esc(d.model) + '" placeholder="gpt-4o-mini" autocomplete="off" autocapitalize="off" spellcheck="false"></label></div>';
    h += '<div class="phys-row"><button type="button" class="phys-btn" data-act="api-save">' + esc(t('ui.api.save')) + '</button>' +
      '<button type="button" class="phys-btn ghost" data-act="api-models"' + (apiBusy ? ' disabled' : '') + '>' + esc(t('ui.api.models.fetch')) + '</button>' +
      '<button type="button" class="phys-btn ghost" data-act="api-test"' + (apiBusy ? ' disabled' : '') + '>' + esc(t('ui.api.test')) + '</button>' +
      (d.hasKey ? '<button type="button" class="phys-btn ghost danger" data-act="api-clear">' + esc(t('ui.api.clear')) + '</button>' : '') + '</div>';
    if (apiStatus) h += '<p class="phys-status ' + apiStatus.kind + '" role="status">' + esc(t(apiStatus.key, apiStatus.params)) + '</p>' + (apiStatus.extra ? '<p class="phys-muted phys-aierr-hint">' + esc(apiStatus.extra) + '</p>' : '');
    h += renderModelPicker();
    h += '<p class="phys-note">' + esc(t('ui.api.privacy')) + '</p>';
    return h;
  }
  // v3.0.5k / v3.0.6 按角色卡重新初始化 (cycle only / hist only): diff + confirm
  const cycRe = { id: null, busy: false, res: null, manual: null };
  const histRe = { id: null, busy: false, res: null, manual: null };
  const polish = { id: null, busy: false, res: null };
  async function runPolish(c) {
    polish.id = chKey(c); polish.busy = true; polish.res = null; render();
    try { polish.res = await E.proposePolish(chKey(c), '手动修改后润色'); } catch (e2) { polish.res = { ok: false, code: 'error' }; }
    polish.busy = false; await refreshFromStore(true); render();
  }
  const FROM_ZH = { user: '你的设定', baseline: '基线', migrated: '旧版', live: '剧情' };
  function fromTag(c, k) { const v = E.fromOf(c, k); return '<em class="from-tag f-' + v + '">' + esc(FROM_ZH[v] || '基线') + '</em>'; }
  function renderPolish(c) {
    let h = '';
    const mine = polish.id === chKey(c);
    if (mine && polish.busy) return '<div class="pol-box"><p class="phys-status" role="status">已应用你的数值。AI 正在按这些数值润色孕宫观察的描写…</p></div>';
    if (mine && polish.res && polish.res.ok) {
      const r = polish.res;
      h += '<div class="phys-diff pol-box"><div class="phys-diff-h">按你的数值润色描写</div><p class="phys-muted">锁定的数值：' + esc(r.locked.join('；') || '—') + '</p><div class="phys-diff-t"><span></span><b>原文</b><b>润色后</b></div>';
      if (!r.rows.length) h += '<p class="phys-muted">描写已经与数值一致，无需改动。</p>';
      r.rows.forEach((x) => { h += '<div class="phys-diff-r ch txt"><span>' + esc(x.label) + '</span><i>' + esc(x.old) + '</i><i>' + esc(x.now) + '</i></div>'; });
      h += '<div class="phys-row"><button type="button" class="phys-btn" data-act="pol-ok">' + (r.rows.length ? '写入润色' : '好的') + '</button><button type="button" class="phys-btn ghost" data-act="pol-skip">暂不润色</button></div><p class="phys-muted cy-tip">写入后可在「撤销」中恢复原文。</p></div>';
      return h;
    }
    if (c.polish && c.polish.pending) h += '<div class="pol-box pend"><p><b>待润色</b>　' + esc(c.polish.why || '') + '。你的数值已生效，描写还没跟上。</p><button type="button" class="phys-btn ghost" data-act="pol-retry">重新润色</button></div>';
    return h;
  }

  function renderQuotes(c) {
    const p = c.profile || {}; const Q = p.quotes || []; const M = c.baseMaterial;
    if (!Q.length && !M) return '';
    let h = '<div class="qt-list">';
    Q.forEach((q) => { h += '<div class="qt-row s-' + esc(q.state) + '"><div class="qt-h"><b>' + esc(q.label) + '</b>' + (q.val && q.val !== '未写明' ? '<span>' + esc(q.val) + '</span>' : '') + '<em>' + (q.state === 'quote' ? '原文' : (q.state === 'guess' ? '推测' : '未写明')) + '</em></div>' + (q.state === 'quote' ? '<q>' + esc(q.text) + '</q>' : (q.text && q.text !== '未写明' ? '<p class="phys-muted">' + esc(q.text) + '</p>' : '')) + '</div>'; });
    h += '</div>';
    if (M && M.card) {
      const cd = M.card[0] || {}; const L = M.lore || {};
      h += '<div class="qt-mat"><b>交给 AI 的材料</b><p>角色卡 ' + (cd.sent || 0) + ' / ' + (cd.len || 0) + ' 字' + (cd.cut ? '（超长，已截断）' : '（完整，含开场白）') + (L.total ? '；世界书 ' + L.sent + ' / ' + L.total + ' 条' + (L.truncated && L.truncated.length ? '，' + L.truncated.length + ' 条只发了开头' : '') + (L.dropped && L.dropped.length ? '，未发送：' + L.dropped.slice(0, 6).join('、') + (L.dropped.length > 6 ? ' 等 ' + L.dropped.length + ' 条' : '') : '') : '；没有世界书') + '。</p></div>';
    }
    return card('pf-quotes', '从角色卡读到的', '基线里的事实都要有原文；没写的标「未写明」或「推测」。', h, 'qt-card');
  }
  /* ---- v3.0.5s settings · 生育 ---- */
  let birthDraft = null; // { id, tiers: {k: tier} }
  const birthRe = { id: null, busy: false, res: null, staged: null };
  const BT_SRC_ZH = { card: '基线·角色卡', lore: '基线·世界书', user: '你的设定', guess: '基线·推定', migrated: '旧版迁移', default: '默认' };
  function birthTiersView(c) {
    const b = E.birthOf(c); const out = Object.assign({}, b.tiers);
    if (birthDraft && birthDraft.id === chKey(c)) Object.assign(out, birthDraft.tiers);
    return out;
  }
  function birthChanges(c) {
    if (!birthDraft || birthDraft.id !== chKey(c)) return [];
    const b = E.birthOf(c);
    return Object.keys(birthDraft.tiers).filter((k) => birthDraft.tiers[k] !== b.tiers[k]).map((k) => E.BT[k].zh + ' ' + E.btZh(k, b.tiers[k]) + ' → ' + E.btZh(k, birthDraft.tiers[k]));
  }
  function birthUndoId(c) {
    const hist = st.history || [];
    for (let i = hist.length - 1; i >= 0; i--) { const x = hist[i]; if ((x.changes || []).some((tk) => tk.t === 'rebase' && String(tk.id) === String(c.id) && /初始化生育(?!史)/.test(tk.why || ''))) return x.id; }
    return null;
  }
  function cycUndoId(c) {
    const hist = st.history || [];
    for (let i = hist.length - 1; i >= 0; i--) { const x = hist[i]; if ((x.changes || []).some((tk) => tk.t === 'rebase' && String(tk.id) === String(c.id) && /初始化周期/.test(tk.why || ''))) return x.id; }
    return null;
  }
  function histUndoId(c) {
    const hist = st.history || [];
    for (let i = hist.length - 1; i >= 0; i--) { const x = hist[i]; if ((x.changes || []).some((tk) => tk.t === 'rebase' && String(tk.id) === String(c.id) && /初始化生育史/.test(tk.why || ''))) return x.id; }
    return null;
  }
  function renderBirthDiff(c) {
    if (birthRe.id !== chKey(c)) return '';
    if (birthRe.busy) return '<p class="phys-status" role="status">正在按角色卡、世界书和已发生的剧情铺设她的生育底子…</p>';
    const r = birthRe.res; if (!r) return '';
    if (!r.ok) return '<p class="phys-status err">生育初始化失败：' + esc(r.err || r.code || 'error') + '。原数据未改动，可以再试一次。</p>';
    const grp = (g, title) => { const rows = r.rows.filter((x) => x.g === g && (g === 'tier' || g === 'code' ? true : x.changed)); if (!rows.length) return ''; return '<div class="phys-diff-sub">' + esc(title) + '</div>' + rows.map((x) => '<div class="phys-diff-r' + (x.changed ? ' ch' : '') + (g === 'text' || g === 'now' ? ' tx' : '') + '"><span>' + esc(x.label) + (x.src ? '<em class="bt-src s-' + esc(x.src) + '">' + esc(BT_SRC_ZH[x.src] || '') + '</em>' : '') + '</span><i>' + esc(x.old) + '</i><i>' + esc(x.now) + '</i></div>').join(''); };
    const nch = r.rows.filter((x) => x.changed).length;
    return '<div class="phys-diff bt-diff"><div class="phys-diff-h">' + esc(r.name) + ' · 生育初始化对比（' + nch + ' 项变化）</div><div class="phys-diff-t"><span></span><b>' + esc(t('ui.rebase.old')) + '</b><b>' + esc(t('ui.rebase.new')) + '</b></div>' +
      grp('tier', '档位') + grp('code', '由档位定下的规则') + grp('text', '生育底子') + grp('now', '结合剧情的当前状态') +
      (c.fertility.pregnant ? '<p class="phys-muted">她正怀着孕：这一胎的孕期长度和胎数保持不变，新设置从下一胎起生效。</p>' : '') +
      (c.fertility.recovery && c.fertility.recovery.left > 0 ? '<p class="phys-muted">她正在恢复期：本次恢复的剩余天数不变，新设置从下一次起生效。</p>' : '') +
      '<div class="phys-row"><button type="button" class="phys-btn" data-act="bt-confirm">' + esc(t('ui.rebase.confirm')) + '</button><button type="button" class="phys-btn ghost" data-act="bt-cancel">' + esc(t('ui.rebase.cancel')) + '</button></div></div>';
  }
  function renderBirthSet(c) {
    const b = E.birthOf(c); const sp = b.species; const tv = birthTiersView(c); const chg = birthChanges(c);
    const busy = birthRe.busy || cycRe.busy || rebase.busy; const uid = birthUndoId(c);
    let h = '<div class="bt-note"><b>从基线推定</b><p>这些档位以角色卡与初始肉体、birth.base（生育特质）为底；重新初始化时会把插件已记下的异常、宫巢、现状档案等加减因素折进 birth.now。你改过的档位标「你的设定」，重推时保持。剧情变化另由文字记录。</p>' +
      '<div class="phys-row"><button type="button" class="phys-btn ghost" data-act="bt-reinit"' + (busy ? ' disabled' : '') + '>' + (birthRe.busy && !birthRe.staged ? '正在初始化…' : '按角色卡重新初始化生育') + '</button>' +
      (uid ? '<button type="button" class="phys-btn ghost" data-act="undo-entry" data-id="' + esc(uid) + '">撤销上次初始化</button>' : '') + '</div>' +
      '<p class="phys-muted bt-state">' + (b.virtual ? '她还没有初始化过生育，现在用的是默认档位。' : (b.src === 'migrated' ? '由旧版「淫体本色 / 淫躯今貌」迁移而来（标「旧版迁移」），建议按基线重新推定一次。' : '上次初始化：' + esc(b.inited ? fmtDate(b.inited) : '—') + '（第 ' + b.ver + ' 版）')) + (sp !== 'human' ? ' · ' + (sp === 'near' ? '近人种族' : '非人种族') : '') + '</p></div>';
    if (!birthRe.staged) h += renderBirthDiff(c);
    E.BT_GROUPS.forEach(([g, title]) => {
      h += '<div class="cy-grp bt-grp"><div class="cy-gh">' + esc(title) + '</div>';
      E.BT_KEYS.filter((k) => E.BT[k].g === g).forEach((k) => {
        const B = E.BT[k]; const allow = E.btAllowed(k, sp); const cur = tv[k];
        const dirty = birthDraft && birthDraft.id === chKey(c) && birthDraft.tiers[k] !== undefined && birthDraft.tiers[k] !== b.tiers[k];
        const src = b.virtual ? '' : (b.tsrc[k] || '');
        h += '<div class="bt-row' + (dirty ? ' dirty' : '') + '"><div class="bt-l"><span>' + esc(B.zh) + '</span><small>' + esc(B.hint) + '</small></div><div class="bt-r"><div class="phys-seg bt-seg" role="group" aria-label="' + esc(B.zh) + '">' +
          B.tiers.filter((v) => allow.indexOf(v) >= 0).map((v) => '<button type="button" class="phys-segb' + (cur === v ? ' on' : '') + '" data-act="bt-set" data-k="' + k + '" data-v="' + v + '" aria-pressed="' + (cur === v ? 'true' : 'false') + '"' + (busy ? ' disabled' : '') + '>' + esc(E.btZh(k, v)) + '</button>').join('') +
          '</div>' + (src && src !== 'default' ? '<em class="bt-src s-' + esc(src) + '">' + esc(BT_SRC_ZH[src]) + '</em>' : '') + '</div></div>';
      });
      h += '</div>';
    });
    if (sp === 'human') h += '<p class="phys-muted">必孕、避孕无效、多胎种族只对非人种族开放。</p>';
    h += '<div class="cy-apply bt-apply' + (chg.length ? ' dirty' : '') + '">' + (chg.length ? '<p class="cy-unsaved"><b>' + chg.length + ' 项改动，尚未用于初始化</b><span>' + esc(chg.join('；')) + '</span></p>' : '<p class="phys-muted cy-tip">改动档位后点「应用并初始化」：你选的档位优先，其余由 AI 按角色卡判断，确认对比后才写入，可撤销。</p>') +
      '<div class="phys-row"><button type="button" class="phys-btn" data-act="bt-apply"' + (chg.length && !busy ? '' : ' disabled') + '>' + (birthRe.busy && birthRe.staged ? '正在初始化…' : '应用并初始化') + '</button><button type="button" class="phys-btn ghost" data-act="bt-discard"' + (chg.length && !busy ? '' : ' disabled') + '>放弃修改</button></div>' +
      (birthRe.staged ? renderBirthDiff(c) : '') + '</div>';
    return h;
  }
  async function birthPropose(c, staged) {
    const b = E.birthOf(c);
    const tiers = Object.assign({}, b.set || {}, staged || {});
    birthRe.id = chKey(c); birthRe.busy = true; birthRe.res = null; birthRe.staged = staged || null; render();
    try { birthRe.res = await E.proposeBirth(chKey(c), tiers); } catch (e2) { birthRe.res = { ok: false, code: 'error', err: String((e2 && e2.message) || '') }; }
    birthRe.busy = false; render();
  }

  function renderCycReinit(c) {
    if (cycRe.id !== chKey(c)) return '';
    let h = '';
    if (cycRe.busy) h += '<p class="phys-status" role="status">' + esc(t('ui.cycle.reinitBusyHint')) + '</p>';
    else if (cycRe.res && cycRe.res.ok) {
      const r = cycRe.res;
      h += '<div class="phys-diff"><div class="phys-diff-h">' + esc(t('ui.cycle.reinitDiff', { name: r.name })) + '</div><div class="phys-diff-t"><span></span><b>' + esc(t('ui.rebase.old')) + '</b><b>' + esc(t('ui.rebase.new')) + '</b></div>';
      r.rows.forEach((x) => { h += '<div class="phys-diff-r' + (x.changed ? ' ch' : '') + (x.pending ? ' pend' : '') + '"><span>' + esc(x.label) + '</span><i>' + esc(x.old) + '</i><i>' + esc(x.now) + '</i></div>'; });
      if (r.merged && r.merged.length) h += '<p class="phys-muted">' + esc(t('ui.cycle.reinitMerged', { list: r.merged.join('；') })) + '</p>';
      if (r.pending && r.pending.length) h += '<p class="phys-status err">' + esc(t('ui.reload.pending', { list: r.pending.join('、') })) + '</p>';
      if (cycRe.manual) h += '<p class="phys-muted">你手动改的数字已按原样放进新值，AI 只补其余部分。</p>';
      h += '<div class="phys-row"><button type="button" class="phys-btn" data-act="cyc-confirm">' + esc(t('ui.rebase.confirm')) + '</button><button type="button" class="phys-btn ghost" data-act="cyc-cancel">' + esc(t('ui.rebase.cancel')) + '</button></div></div>';
    } else if (cycRe.res) h += '<p class="phys-status err">' + esc(t('ui.cycle.reinitFail', { code: cycRe.res.code || 'error', detail: cycRe.res.detail || '' })) + '</p>' +
      (cycRe.manual ? '<div class="phys-row"><button type="button" class="phys-btn ghost" data-act="cyc-apply-raw">仅应用手动值</button></div><p class="phys-muted">AI 没成功时，可以只把你改的数字写入（可撤销）。</p>' : '');
    return h;
  }
  function renderHistReinit(c) {
    if (histRe.id !== chKey(c)) return '';
    let h = '';
    if (histRe.busy) h += '<p class="phys-status" role="status">正在按角色卡重读家庭与生育史…</p>';
    else if (histRe.res && histRe.res.ok) {
      const r = histRe.res;
      h += '<div class="phys-diff"><div class="phys-diff-h">' + esc(r.name) + ' · 生育史对比</div><div class="phys-diff-t"><span></span><b>原值</b><b>新值</b></div>';
      (r.rows || []).forEach((x) => { h += '<div class="phys-diff-r' + (x.changed ? ' ch' : '') + '"><span>' + esc(x.label) + '</span><i>' + esc(String(x.old)) + '</i><i>' + esc(String(x.now)) + '</i></div>'; });
      if (histRe.manual) h += '<p class="phys-muted">你改的怀孕/生产次数会优先保留。</p>';
      h += '<div class="phys-row"><button type="button" class="phys-btn" data-act="hist-confirm">确认写入</button><button type="button" class="phys-btn ghost" data-act="hist-cancel">取消</button></div></div>';
    } else if (histRe.res) h += '<p class="phys-status err">生育史初始化失败：' + esc(histRe.res.code || 'error') + (histRe.res.detail ? ' · ' + esc(String(histRe.res.detail).slice(0, 120)) : '') + '</p>' +
      (histRe.manual ? '<div class="phys-row"><button type="button" class="phys-btn ghost" data-act="hist-apply-raw">仅应用手动值</button></div>' : '');
    return h;
  }
  function renderReload(c) {
    const mine = rebase.id === chKey(c);
    let h = '';
    if (mine && rebase.busy) {
      const steps = ['profile', 'repro', 'sex', 'check'];
      h += '<div class="phys-steps">' + steps.map((k, i) => '<div class="phys-step' + (i + 1 < rebase.step ? ' done' : i + 1 === rebase.step ? ' on' : '') + '"><b>' + (i + 1) + '/4</b><span>' + esc(t('ui.reload.step.' + k)) + '</span></div>').join('') + '</div>';
    }
    if (mine && rebase.res && rebase.res.ok) {
      const r = rebase.res;
      h += '<div class="phys-diff"><div class="phys-diff-h">' + esc(t('ui.rebase.diffTitle', { name: r.name })) + '</div><div class="phys-diff-t"><span></span><b>' + esc(t('ui.rebase.old')) + '</b><b>' + esc(t('ui.rebase.new')) + '</b></div>';
      r.rows.forEach((x) => { h += '<div class="phys-diff-r' + (x.changed ? ' ch' : '') + (x.pending ? ' pend' : '') + (x.key.indexOf('act:') === 0 ? ' act' : '') + '"><span>' + esc(x.label) + (x.from ? '<em class="from-tag f-' + esc(x.from) + '">' + esc(FROM_ZH[x.from] || '') + '</em>' : '') + '</span><i>' + esc(x.old) + '</i><i>' + esc(x.now) + (x.note ? '<small class="from-note">' + esc(x.note) + '</small>' : '') + '</i></div>'; });
      if (r.pending && r.pending.length) h += '<p class="phys-status err">' + esc(t('ui.reload.pending', { list: r.pending.join('、') })) + '</p>';
      if (r.fixes && r.fixes.length) h += '<p class="phys-muted">' + esc(t('ui.reload.fixes', { list: r.fixes.join('；') })) + '</p>';
      h += '<p class="phys-muted">' + esc(t('ui.rebase.sinceNote', { pc: r.since.pc, bc: r.since.bc, kids: r.since.kids })) + '</p>';
      h += '<div class="phys-row"><button type="button" class="phys-btn" data-act="rebase-confirm">' + esc(t('ui.rebase.confirm')) + '</button><button type="button" class="phys-btn ghost" data-act="rebase-cancel">' + esc(t('ui.rebase.cancel')) + '</button></div></div>';
    } else if (mine && rebase.res && !rebase.res.ok) h += '<p class="phys-status err">' + esc(rebase.res.code === 'minor' ? t('ttAge.initMinor') : t('ui.rebase.fail', { code: rebase.res.code || 'error', detail: rebase.res.detail || '' })) + '</p>'; /* [tt-port:minor-msg] */
    return h;
  }
  function renderKinksEdit(c) {
    const k = c.kinks || { locked: false, items: [] };
    let h = '<label class="phys-check"><input type="checkbox" data-act="kink-lock"' + (k.locked ? ' checked' : '') + '><span>' + esc(t('ui.kinks.lock')) + '</span></label><p class="phys-muted">' + esc(t('ui.kinks.hint')) + '</p>';
    if (!k.items.length) h += '<p class="phys-muted">' + esc(t('ui.kinks.empty')) + '</p>';
    k.items.forEach((x) => {
      h += '<div class="phys-off phys-kinkrow" data-kid="' + esc(x.id) + '"><input class="phys-off-name" type="text" data-kink="name" maxlength="30" value="' + esc(x.name) + '" placeholder="' + esc(t('ui.kinks.name')) + '">' +
        '<span class="phys-kinksrc s-' + x.src + '">' + esc(t('ui.kinks.src.' + x.src)) + '</span>' +
        '<button type="button" class="phys-mini danger" data-act="kink-del" aria-label="' + esc(t('ui.kinks.del')) + '" title="' + esc(t('ui.kinks.del')) + '">×</button>' +
        '<input class="phys-off-note" type="text" data-kink="note" maxlength="120" value="' + esc(x.note) + '" placeholder="' + esc(t('ui.kinks.note')) + '"></div>';
    });
    h += '<div class="phys-off phys-kinkrow new"><input class="phys-off-name" type="text" data-role="kink-new-name" maxlength="30" placeholder="' + esc(t('ui.kinks.name')) + '"><input class="phys-off-note" type="text" data-role="kink-new-note" maxlength="120" placeholder="' + esc(t('ui.kinks.note')) + '"></div>';
    return h + '<button type="button" class="phys-btn" data-act="kink-add">' + esc(t('ui.kinks.add')) + '</button>';
  }
  function renderCustomActs() {
    const list = E.getCustomActs();
    let h = '<p class="phys-muted">' + esc(t('ui.cact.hint')) + '</p>';
    list.forEach((a) => {
      h += '<div class="phys-cact" data-cid="' + esc(a.id) + '"><div class="phys-cact-h"><input type="text" data-cact="name" maxlength="24" value="' + esc(a.name) + '" placeholder="' + esc(t('ui.cact.name')) + '">' +
        '<button type="button" class="phys-mini danger" data-act="cact-del" aria-label="' + esc(t('ui.cact.del')) + '" title="' + esc(t('ui.cact.del')) + '">×</button></div>' +
        '<textarea rows="2" data-cact="desc" maxlength="300" placeholder="' + esc(t('ui.cact.desc')) + '">' + esc(a.desc) + '</textarea></div>';
    });
    h += '<div class="phys-cact new"><input type="text" data-role="cact-new-name" maxlength="24" placeholder="' + esc(t('ui.cact.name')) + '"><textarea rows="2" data-role="cact-new-desc" maxlength="300" placeholder="' + esc(t('ui.cact.desc')) + '"></textarea></div>';
    return h + '<button type="button" class="phys-btn" data-act="cact-add">' + esc(t('ui.cact.add')) + '</button>';
  }
  function renderData(c) {
    let h = '';
    if (c) h += '<button type="button" class="phys-btn ghost danger block" data-act="del-char"' + (dataBusy ? ' disabled' : '') + '>' + esc(t('ui.data.delChar', { name: c.name || ('#' + c.id) })) + '</button><p class="phys-muted">' + esc(t('ui.data.delCharHint')) + '</p>';
    h += '<button type="button" class="phys-btn block" data-act="reset-update"' + (dataBusy ? ' disabled' : '') + '>重置更新状态</button><p class="phys-muted">自动更新卡住时使用：只清除本聊天的更新任务、中断标记和世界书创建占用，不会删除任何角色数据。每次重置都会写入运行日志。</p>';
    h += '<label class="phys-check"><input type="checkbox" data-act="clear-global"' + (clearGlobal ? ' checked' : '') + '><span>' + esc(t('ui.data.alsoGlobal')) + '</span></label>';
    h += '<button type="button" class="phys-btn danger block" data-act="clear-cache"' + (dataBusy ? ' disabled' : '') + '>' + esc(t('ui.data.clear')) + '</button><p class="phys-muted">' + esc(t('ui.data.clearHint')) + '</p>';
    h += '<button type="button" class="phys-btn danger ghost block" data-act="clear-all"' + (dataBusy ? ' disabled' : '') + '>清空全部插件数据</button><p class="phys-muted">删除所有聊天的角色、识别结果、头像、日志和插件世界书，相当于重新安装；API 配置和设置保留。</p>';
    return h;
  }
  // v2.7.8 运行日志
  let logView = null, logErrOnly = false;
  async function loadLogView() { try { logView = await E.getLog({}); } catch (e) { logView = []; } }
  function renderLog() {
    if (!logView) { loadLogView().then(() => { if (!disposed) render(); }); return '<p class="phys-muted">…</p>'; }
    const list = (logErrOnly ? logView.filter((x) => x.err) : logView).slice().reverse();
    const p2 = (n) => String(n).padStart(2, '0');
    const tm = (ts) => { const d = new Date(ts); return p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes()) + ':' + p2(d.getSeconds()); };
    let h = '<p class="phys-muted">' + esc(t('ui13.log.hint')) + '</p><div class="phys-row phys-log-acts">' +
      '<button type="button" class="phys-btn small' + (logErrOnly ? '' : ' ghost') + '" data-act="log-filter" aria-pressed="' + (logErrOnly ? 'true' : 'false') + '">' + esc(t('ui13.log.errOnly')) + '</button>' +
      '<button type="button" class="phys-btn small ghost" data-act="log-refresh">' + esc(t('ui13.log.refresh')) + '</button>' +
      '<button type="button" class="phys-btn small" data-act="log-copy">' + esc(t('ui13.log.copy')) + '</button>' +
      '<button type="button" class="phys-btn small ghost" data-act="log-clear">' + esc(t('ui13.log.clear')) + '</button></div>';
    // v3.0.5c: story events (old per-character 事件日志) merged in, each with its own 撤销
    const evs = logErrOnly ? [] : (st.log || []).map((l) => ({ ev: l, ts: Number(l.ts) || 0 }));
    const merged = list.map((x) => ({ x: x, ts: x.ts })).concat(evs).sort((a, b) => b.ts - a.ts);
    if (!merged.length) return h + '<p class="phys-muted">' + esc(t('ui13.log.empty')) + '</p>';
    const evLi = (l) => {
      const who = l.kind === 'date' ? t('ui.log.story') : l.name;
      const fl = l.floor != null ? t('ui.log.floor', { n: l.floor }) : t('ui.log.src.' + l.src);
      let lines = []; try { lines = E.describeLog(l); } catch (e) { lines = []; }
      return '<li class="ev' + (l.reverted ? ' rev' : '') + '"><div class="lg-h"><time>' + esc(tm(l.ts)) + '</time><b>' + esc(t('ui.log.kind.' + l.kind)) + '</b><span class="lg-st">' + esc(who) + '</span><span>' + esc(fl) + '</span>' +
        (l.reverted ? '<span class="phys-log-r">' + esc(t('ui.log.reverted')) + '</span>' : (E.revertible(l) ? '<button type="button" class="phys-btn ghost small" data-act="log-revert" data-id="' + esc(l.id) + '">' + esc(t('ui.log.revert')) + '</button>' : '')) + '</div>' +
        (lines.length ? '<div class="lg-t">' + lines.slice(0, 4).map((y) => esc(y)).join('<br>') + '</div>' : '') + '</li>';
    };
    h += '<ol class="phys-log">' + merged.map((m) => m.ev ? evLi(m.ev) : (((x) => '<li class="' + (x.err ? 'err' : '') + '"><div class="lg-h"><time>' + esc(tm(x.ts)) + '</time><b>' + esc(x.stage) + '</b><span class="lg-st">' + esc(x.status) + '</span>' + (x.ms != null ? '<span>' + esc((x.ms / 1000).toFixed(1) + 's') + '</span>' : '') + '</div>' +
      (x.type || x.model ? '<div class="lg-m">' + esc(x.type) + (x.model ? ' · ' + esc(x.model) : '') + (x.finish ? ' · finish=' + esc(x.finish) : '') + '</div>' : '') +
      (x.text ? '<div class="lg-t">' + esc(x.text) + '</div>' : '') + '</li>')(m.x))).join('') + '</ol>';
    return h;
  }
  function renderSettings(c) {
    const list = chars();
    let h = pageHead('settings');
    // v3.0.3 低功耗模式 (this device only)
    h += '<div class="phys-sec set phys-lite-set"><label class="phys-check"><input type="checkbox" data-lite="1"' + (liteOn ? ' checked' : '') + '><span>' + esc(t('ui303.lite.label')) + '</span></label><p class="phys-muted">' + esc(t('ui303.lite.desc')) + '</p></div>';
    // API & AI
    h += sSection('api', esc(t('ui2.g.api')), renderApi() + '<div class="phys-subhead">' + esc(t('ui.ai.optsTitle')) + '</div>' + renderAiOpts());
    // tracking & scan
    let tb = '<button type="button" class="phys-btn big block" data-act="ai-scan">' + esc(t('ui.scan.button')) + '</button><p class="phys-muted">' + esc(t('ui.scan.hint')) + '</p>';
    if (!list.length) tb += '<p class="phys-muted">' + esc(t('ui.noChars')) + '</p><button type="button" class="phys-btn" data-act="rescan">' + esc(t('ui.scanNow')) + '</button>';
    list.forEach((x) => {
      const minor = x.skippedReason === 'minor';
      const tracked = !isOff(x) && !x.frozen;
      const why = x.skippedReason ? t('ui.skip.short.' + x.skippedReason) : (x.trackOff ? t('ui.skip.short.off') : (x.frozen ? t('ui296.ros.stopped') : t('ui.status.tracked')));
      tb += '<label class="phys-trackrow' + (minor ? ' locked' : '') + '"><span class="phys-tr-n">' + esc(x.name || ('#' + x.id)) + '</span><span class="phys-tr-s">' + esc(why) + '</span>' +
        '<input type="checkbox" data-act="track-toggle" data-id="' + esc(chKey(x)) + '"' + (tracked ? ' checked' : '') + (minor ? ' disabled' : '') + ' aria-label="' + esc(t('ui.settings.trackToggle', { name: x.name })) + '"></label>';
      if (minor) tb += '<div class="phys-trackrow-x">' + adultAskHtml('char', chKey(x), x.name || ('#' + x.id)) + '</div>'; /* [tt-port:age-ui] */
      else if (x.migratedFromMinor && x.trackOff) tb += '<p class="phys-muted phys-sub2">' + esc(t('ttAge.migrated.row')) + '</p>';
      if (tracked && !minor) tb += '<label class="phys-field phys-alias"><span class="phys-muted phys-sub2">' + esc(t('ui6.alias', { name: x.name || ('#' + x.id) })) + '</span><input type="text" data-alias="' + esc(chKey(x)) + '" value="' + esc((x.aliases || []).join('、')) + '" placeholder="' + esc(E.aliasesOf(x).join('、')) + '"></label>';
    });
    if (aiDraft) tb += '<label class="phys-check"><input type="checkbox" data-ai="skipRefusal"' + (aiDraft.skipRefusal !== false ? ' checked' : '') + '><span>' + esc(t('ui9.skipRefusal')) + '</span></label><p class="phys-muted">' + esc(t('ui9.skipRefusalHint')) + '</p>';
    if (aiDraft) tb += '<label class="phys-check"><input type="checkbox" data-ai="autoDetect"' + (aiDraft.autoDetect !== false ? ' checked' : '') + '><span>' + esc(t('ui7.autoDetect')) + '</span></label><p class="phys-muted">' + esc(t('ui7.autoDetectHint')) + '</p>' +
      '<label class="phys-field">' + esc(t('ui7.scanMsgs')) + '<span class="phys-muted phys-sub2">' + esc(t('ui7.scanMsgsHint')) + '</span><input type="number" inputmode="numeric" data-ai="aiScanMsgs" min="4" max="100" step="1" value="' + esc(String(aiDraft.aiScanMsgs || 30)) + '"></label>' ;
    // v3.0.27: 精准识别人名框内联在追踪设置；特化扫描按钮在 ask/init 时灰显并 toast，不叠第二弹层
    // v3.0.28: no native disabled (dead taps on phone); held state is a class + toast on click
    const scanHeld = scanHardHold();
    const scanDis = (fscan.busy || prec.busy || scanHeld) ? ' aria-disabled="true" style="opacity:.5"' : '';
    tb += '<div class="phys-fscan" data-sec="prec"><b class="phys-fscan-t">精准识别</b><p class="phys-muted">已知道名字？在下方输入名字并选择来源（角色卡设定 / 世界书 / 上下文，可多选），AI 只查找这些人。</p>' +
      '<label class="phys-prec-l">名字<textarea class="phys-input phys-prec-in" data-prec="names" rows="2" placeholder="例如：林雪、苏晴" autocomplete="off">' + esc(prec.names) + '</textarea></label>' +
      '<div class="phys-prec-src" role="group" aria-label="识别来源">';
    Object.keys(PREC_ZH).forEach((k) => { tb += '<button type="button" class="phys-prec-o' + (prec.src[k] ? ' on' : '') + '" data-act="prec-src" data-src="' + k + '"' + ' aria-pressed="' + (prec.src[k] ? 'true' : 'false') + '"><i aria-hidden="true"></i>' + esc(PREC_ZH[k]) + '</button>'; });
    tb += '</div>' + (prec.err ? aiErrBox(prec.err, 'prec-go') : '') +
      '<button type="button" class="phys-btn primary block" data-act="prec-go"' + scanDis + '>开始识别</button>' +
      (scanHeld ? '<p class="phys-muted phys-sub2">' + (st.initJob && st.initJob.status === 'running' && !(st.askPending && st.askPending.ids && st.askPending.ids.length) && !askInit ? '初始化进行中，完成后再识别。' : '请先在上方「是否初始化」卡片点确认或取消，再识别。') + '</p>' : '') + '</div>';
    tb += '<div class="phys-fscan" data-sec="fscan"><b class="phys-fscan-t">特化扫描</b><p class="phys-muted">只从一个来源找角色，结果同样经过非人名过滤，并标明来源，确认后按批次初始化。</p>' +
      '<button type="button" class="phys-btn block" data-act="fscan" data-src="card"' + scanDis + '>从角色设定扫描</button><p class="phys-muted phys-sub2">只看角色卡的描述、性格、场景和开场白</p>' +
      '<button type="button" class="phys-btn block" data-act="fscan" data-src="lore"' + scanDis + '>从世界书扫描</button><p class="phys-muted phys-sub2">只看世界书条目（不含本插件的世界书）</p>' +
      '<button type="button" class="phys-btn block" data-act="fscan" data-src="chat"' + scanDis + '>从聊天上下文扫描</button>' +
      (aiDraft ? '<label class="phys-field">聊天扫描条数<span class="phys-muted phys-sub2">最近多少条消息（4–200，默认 60）</span><input type="number" inputmode="numeric" data-ai="focusScanMsgs" min="4" max="200" step="1" value="' + esc(String(aiDraft.focusScanMsgs || 60)) + '"></label>' : '') +
      (fscan.err ? aiErrBox(fscan.err, 'fs-retry') : '') + '</div>';
    h += sSection('track', esc(t('ui2.g.track')), tb + '<p class="phys-muted">' + esc(t('ui.settings.trackHint')) + '</p>');
    const off = c ? isOff(c) : true;
    const offMsg = c ? '<p class="phys-muted">' + esc(offReason(c)) + '</p>' : '<p class="phys-muted">' + esc(t('ui.noChars')) + '</p>';
    const who = c ? ' <em class="phys-total">' + esc(c.name || ('#' + c.id)) + '</em>' : '';
    // v3.0.6 周期与生育: three scoped boxes — 周期 / 生育 / 生育史
    if (c && !off) {
      const c0 = c; c = cycView(c);
      const info = E.cycleInfo(c.cycle, E.config());
      const preg = c.fertility.pregnant;
      const L = info.length, P = info.period, ov = info.ovulationDay;
      const stp = (path, val, min, max, unit) => '<span class="phys-step cy"><button type="button" class="phys-mini" data-act="dec" data-path="' + path + '" aria-label="' + esc(t('ui.dec')) + '"' + (val <= min ? ' disabled' : '') + '>−</button>' +
        '<input type="number" inputmode="numeric" data-path="' + path + '" value="' + esc(val) + '" min="' + min + '" max="' + max + '">' +
        '<button type="button" class="phys-mini" data-act="inc" data-path="' + path + '" aria-label="' + esc(t('ui.inc')) + '"' + (val >= max ? ' disabled' : '') + '>+</button><em>' + esc(unit) + '</em></span>';
      const row = (title, hint, ctl, fk) => '<div class="cy-row"><div class="cy-l"><b>' + esc(title) + (fk ? fromTag(c0, fk) : '') + '</b><small>' + esc(hint) + '</small></div>' + ctl + '</div>';
      const kind = (d) => (d <= P ? 'men' : (d === ov ? 'ov' : (d >= info.fertileStart && d <= info.fertileEnd ? 'fer' : (d < ov ? 'fol' : 'lut'))));
      let bar = '<div class="cy-bar" role="group" aria-label="周期预览">';
      for (let d = 1; d <= L; d++) bar += '<button type="button" class="cy-c ' + kind(d) + (d === info.day && !preg ? ' now' : '') + '" data-act="cyc-setday" data-n="' + d + '" title="第 ' + d + ' 天" aria-label="设为第 ' + d + ' 天"' + (preg ? ' disabled' : '') + '></button>';
      bar += '</div><div class="cy-scale"><span>第 1 天</span><span>第 ' + ov + ' 天排卵</span><span>第 ' + L + ' 天</span></div>' +
        '<div class="cy-leg"><i class="men"></i>经期<i class="fol"></i>卵泡期<i class="fer"></i>易孕期<i class="ov"></i>排卵日<i class="lut"></i>黄体期</div>';
      const phaseTx = info.menopause ? '已绝经，不走周期' : (preg ? '怀孕中，周期暂停' : '今天是第 ' + info.day + ' 天 · ' + t('ui.phase.' + info.phase));
      const cycUid = cycUndoId(c0);
      const cycChg = cycChanges(c0);
      const cycBusy = cycRe.busy || rebase.busy;
      let boxCyc = '<div class="cy-box" data-box="cycle"><div class="cy-box-h"><b>周期</b><small>只改月经周期；不影响生育档位与生育史</small></div>';
      boxCyc += '<div class="cy-card"><div class="cy-now"><span class="cy-tag">' + esc(t('ui.phase.' + (preg ? 'pregnant' : info.phase))) + '</span><b>' + esc(phaseTx) + '</b></div>' + bar +
        '<p class="phys-muted cy-tip">点色条上的任意一格，就能把“今天”设到那一天。</p></div>';
      boxCyc += '<div class="cy-grp"><div class="cy-gh">今天</div>' +
        row('今天是周期第几天', '从上次经期第一天算起，1–' + L, stp('cycle.day', info.day, 1, L, '天'), 'day') +
        '<div class="phys-row cy-acts"><button type="button" class="phys-btn" data-act="new-cycle">' + esc(t('ui.cycle.newCycle')) + '</button></div>' +
        '<p class="phys-muted cy-tip">剧情里她来月经了，按这个按钮即可：今天变成第 1 天。</p></div>';
      boxCyc += '<div class="cy-grp"><div class="cy-gh">周期长度</div>' +
        row('整个周期', '两次经期第一天之间相隔多少天，常见 26–32', stp('cycle.length', L, 21, 45, '天'), 'length') +
        row('经期', '每次流血持续几天，常见 3–7', stp('cycle.periodLength', P, 1, Math.max(1, L - 10), '天'), 'periodLength') +
        row('黄体期', '排卵后到下次经期的天数，一般 12–16', stp('cycle.luteal', info.luteal, 8, 20, '天'), 'luteal') +
        row('排卵前天数', '第 1 天到排卵的天数；填 0 按黄体期自动推算', stp('cycle.follicular', c.cycle.follicular || 0, 0, Math.max(0, L - 5), '天'), 'follicular') +
        '<p class="phys-muted cy-tip">按现在的设置，她在第 ' + ov + ' 天排卵，第 ' + info.fertileStart + '–' + info.fertileEnd + ' 天最容易怀孕。</p></div>';
      boxCyc += '<div class="cy-grp"><div class="cy-gh">周期操作</div><div class="phys-row">' +
        '<button type="button" class="phys-btn ghost" data-act="reinit"' + (cycBusy ? ' disabled' : '') + '>' + esc(cycRe.busy && cycRe.id === chKey(c) ? t('ui.cycle.reinitBusy') : t('ui.cycle.reinit')) + '</button>' +
        (cycUid ? '<button type="button" class="phys-btn ghost" data-act="undo-entry" data-id="' + esc(cycUid) + '">撤销上次初始化</button>' : '') + '</div>' +
        '<p class="phys-muted cy-tip">只重推周期参数，并保留插件里已记下的经期/异常等加减因素。确认对比后才写入。</p>' + (cycRe.manual ? '' : renderCycReinit(c)) + '</div>';
      boxCyc += '<div class="cy-apply' + (cycChg.length ? ' dirty' : '') + '">' + (cycChg.length ? '<p class="cy-unsaved"><b>有 ' + cycChg.length + ' 项周期修改尚未应用</b><span>' + esc(cycChg.join('；')) + '</span></p>' : '<p class="phys-muted cy-tip">改完周期数字后点「应用并初始化」：只重推周期，你改的数字优先。</p>') +
        '<div class="phys-row"><button type="button" class="phys-btn" data-act="cyc-apply"' + (cycChg.length && !cycRe.busy ? '' : ' disabled') + '>' + (cycRe.busy && cycRe.manual ? '正在初始化…' : '应用并初始化') + '</button><button type="button" class="phys-btn ghost" data-act="cyc-discard"' + (cycChg.length && !cycRe.busy ? '' : ' disabled') + '>放弃修改</button></div>' +
        (cycRe.manual ? renderCycReinit(c0) : '') + '</div></div>';

      // 生育 box: 受孕状态 + birth tiers
      const f = c.fertility, kids = f.offspring || [];
      let boxBirth = '<div class="cy-box" data-box="birth"><div class="cy-box-h"><b>生育</b><small>受孕 · 孕程 · 产后档位；只初始化生育板块</small></div>';
      boxBirth += '<div class="cy-grp"><div class="cy-gh">受孕</div>' +
        '<label class="phys-check fh-preg"><input type="checkbox" data-act="preg-toggle"' + (preg ? ' checked' : '') + '><span>当前怀孕中</span></label>' +
        (preg ? row('怀孕天数', '从受孕算起，这一胎约 ' + E.gestDaysOf(c) + ' 天足月（第 ' + Math.floor((f.pregnancyDay || 0) * 280 / E.gestDaysOf(c) / 7) + ' 周）', stp('fertility.pregnancyDay', f.pregnancyDay, 0, Math.max(400, E.gestDaysOf(c) + 60), '天')) : '') +
        '<p class="phys-muted cy-tip">勾选表示她现在怀着；孕程与产后档位在下方。</p></div>';
      boxBirth += renderBirthSet(c0) + renderPolish(c0) + '</div>';

      // 生育史 box: counts + family (children merged) — no redundant 怀孕中
      const histUid = histUndoId(c0);
      const histChg = histChanges(c0);
      const histBusy = histRe.busy || rebase.busy;
      let boxHist = '<div class="cy-box" data-box="hist"><div class="cy-box-h"><b>生育史</b><small>怀孕过 / 生产过 / 子女</small></div>';
      boxHist += '<div class="fh-card"><div class="fh-stats">' +
        '<div class="fh-st"><small>怀孕过' + fromTag(c0, 'pregnancyCount') + '</small>' + stp('fertility.pregnancyCount', f.pregnancyCount, 0, 999, '次') + '</div>' +
        '<div class="fh-st"><small>生产过' + fromTag(c0, 'birthCount') + '</small>' + stp('fertility.birthCount', f.birthCount, 0, 999, '次') + '</div>' +
        '<div class="fh-st ro"><small>后代</small><b class="num">' + kids.length + '</b><em>人</em></div></div>' +
        (f.birthCount > f.pregnancyCount ? '<p class="phys-status err">生产次数比怀孕次数多，请检查。</p>' : '') +
        '<p class="phys-muted cy-tip">生产次数是分娩事件数，不等于子女人数（多胎同一次生产只计 1）。</p>' +
        '<button type="button" class="phys-btn ghost block" data-act="record-birth"' + ((cycDraft && cycDraft.id === chKey(c0)) || (histDraft && histDraft.id === chKey(c0)) ? ' disabled title="请先应用或放弃上面的修改"' : '') + '>' + esc(t('ui.fertility.recordBirth')) + '</button></div>';
      boxHist += '<div class="phys-row"><button type="button" class="phys-btn ghost" data-act="hist-recount" title="次数 = 基线 + 剧情里记录到的怀孕/生产/流产">按记录重算</button></div>';
      boxHist += '<div class="phys-subhead fh">子女</div>' + renderOffspringEdit(c0);
      boxHist += '<div class="cy-grp"><div class="cy-gh">生育史操作</div><div class="phys-row">' +
        '<button type="button" class="phys-btn ghost" data-act="hist-reinit"' + (histBusy ? ' disabled' : '') + '>' + (histRe.busy && !histRe.manual ? '正在初始化…' : '按角色卡初始化') + '</button>' +
        (histUid ? '<button type="button" class="phys-btn ghost" data-act="undo-entry" data-id="' + esc(histUid) + '">撤销上次初始化</button>' : '') + '</div>' +
        '<p class="phys-muted cy-tip">只重读家庭与生育史，并折入插件已记录的加减因素；不改周期与生育档位。</p>' + (histRe.manual ? '' : renderHistReinit(c0)) + '</div>';
      boxHist += '<div class="cy-apply' + (histChg.length ? ' dirty' : '') + '">' + (histChg.length ? '<p class="cy-unsaved"><b>有 ' + histChg.length + ' 项生育史修改尚未应用</b><span>' + esc(histChg.join('；')) + '</span></p>' : '<p class="phys-muted cy-tip">改完怀孕/生产次数后点「应用并初始化」：只更新生育史。</p>') +
        '<div class="phys-row"><button type="button" class="phys-btn" data-act="hist-apply"' + (histChg.length && !histRe.busy ? '' : ' disabled') + '>' + (histRe.busy && histRe.manual ? '正在初始化…' : '应用并初始化') + '</button><button type="button" class="phys-btn ghost" data-act="hist-discard"' + (histChg.length && !histRe.busy ? '' : ' disabled') + '>放弃修改</button></div>' +
        (histRe.manual ? renderHistReinit(c0) : '') + '</div></div>';

      c = c0;
      h += sSection('cycle', esc(t('ui2.g.cycle')) + who, boxCyc + boxBirth + boxHist);
    } else h += sSection('cycle', esc(t('ui2.g.cycle')) + who, offMsg);
    // story time + custom era
    {
      const cur = st.story && st.story.date ? st.story.date : '';
      const v = dateDraft || cur;
      const cal = (st.story && st.story.cal) || E.normCal(null);
      let sb2 = '<p class="phys-muted">' + esc(t('ui.story.hint')) + '</p>' +
        '<div class="phys-line"><span>' + esc(t('ui.story.current')) + '</span><b>' + esc(cur ? fmtDate(cur) : '—') + '</b></div>' +
        (cal.enabled
          ? '<label class="phys-field">' + esc(t('ui.story.set')) + '<input type="text" data-story="dtext" placeholder="' + esc(t('ui.story.setPh')) + '" value="' + esc(v ? fmtDate(v) : '') + '"></label><p class="phys-muted">' + esc(t('ui.story.setHint', { sample: cur ? fmtDate(cur) : '' })) + '</p>'
          : '<label class="phys-field">' + esc(t('ui.story.set')) + '<input type="date" data-story="date" value="' + esc(v) + '"></label>') +
        '<div class="phys-row">' + [[1, 'ui.story.d1'], [7, 'ui.story.w1'], [30, 'ui.story.m1']].map((x) => '<button type="button" class="phys-btn ghost small" data-act="date-step" data-n="' + x[0] + '">' + esc(t(x[1])) + '</button>').join('') + '</div>' +
        '<label class="phys-check"><input type="checkbox" data-story="shift"' + (dateShift ? ' checked' : '') + '><span>' + esc(t('ui.story.shift')) + '</span></label>' +
        '<div class="phys-row"><button type="button" class="phys-btn" data-act="date-apply"' + (v && v !== cur ? '' : ' disabled') + '>' + esc(t('ui.story.apply')) + '</button></div>' +
        '<label class="phys-check"><input type="checkbox" data-story="auto"' + (st.story && st.story.auto === false ? '' : ' checked') + '><span>' + esc(t('ui.story.auto')) + '</span></label>' +
        '<p class="phys-muted">' + esc(t('ui.story.autoHint')) + '</p>';
      const gy = cur ? +cur.slice(0, 4) : new Date().getFullYear();
      sb2 += '<div class="phys-subhead">' + esc(t('ui.calx.title')) + '</div><p class="phys-muted">' + esc(t('ui.calx.hint')) + '</p>' +
        '<label class="phys-check"><input type="checkbox" data-cal="enabled"' + (cal.enabled ? ' checked' : '') + '><span>' + esc(t('ui.calx.enable')) + '</span></label>';
      if (cal.enabled) {
        sb2 += '<label class="phys-field">' + esc(t('ui.calx.era')) + '<input type="text" data-cal="era" maxlength="24" placeholder="' + esc(t('ui.calx.eraPh')) + '" value="' + esc(cal.era) + '"></label>' +
          '<label class="phys-field">' + esc(t('ui.calx.year')) + '<input type="number" data-cal="year" value="' + (gy + cal.offset) + '"></label>' +
          '<label class="phys-field">' + esc(t('ui.calx.monthNames')) + '<input type="text" data-cal="months" placeholder="' + esc(t('ui.calx.monthPh')) + '" value="' + esc(cal.months.join(',')) + '"></label>' +
          (cal.months.length && cal.months.length !== 12 ? '<p class="phys-note">' + esc(t('ui.calx.monthBad', { n: cal.months.length })) + '</p>' : '') +
          '<label class="phys-field">' + esc(t('ui.calx.fmt')) + '<input type="text" data-cal="fmt" maxlength="80" placeholder="' + esc(t('cal.fmt.default')) + '" value="' + esc(cal.fmt) + '"></label>' +
          '<p class="phys-muted">' + esc(t('ui.calx.fmtHint')) + '</p>' +
          (cur ? '<div class="phys-line"><span>' + esc(t('ui.calx.sample')) + '</span><b class="phys-accent">' + esc(fmtDate(cur)) + '</b></div>' : '');
      }
      h += sSection('story', esc(t('ui2.g.story')), sb2);
    }
    // injection (v2.7: simple basic view + collapsed 高级)
    let ib2 = '';
    if (injDraft) {
      const seg = (name, cur, vals, labels) => '<div class="phys-seg" role="group">' + vals.map((v) => '<button type="button" class="phys-segb' + (cur === v ? ' on' : '') + '" data-act="inj-' + name + '" data-v="' + v + '" aria-pressed="' + (cur === v ? 'true' : 'false') + '">' + esc((labels && labels[v]) || t('ui7.inj.' + name + '.' + v)) + '</button>').join('') + '</div>';
      const num = (k, min, max) => '<label class="phys-field">' + esc(t('ui6.' + k)) + '<span class="phys-muted phys-sub2">' + esc(t('ui6.' + k + 'Hint')) + '</span><input type="number" inputmode="numeric" min="' + min + '" max="' + max + '" data-inj="' + k + '" value="' + esc(String(injDraft[k])) + '"></label>';
      ib2 = '<div class="inj-basic"><label class="phys-check inj-sw"><input type="checkbox" data-inj="enabled"' + (injDraft.enabled ? ' checked' : '') + '><span>' + esc(t('ui7.inj.enable')) + '</span></label>' +
        '<div class="phys-field">' + esc(t('ui.inject.mode')) + seg('mode', injDraft.mode, ['prefix', 'lore'], { lore: t('ttLore.modeLore'), prefix: t('ttLore.modePrefix') }) + '</div>' + /* [tt-port:lore-msg] */
        loreStatus() +
        '<div class="phys-row"><button type="button" class="phys-btn" data-act="inj-preview2"' + (injDraft.enabled ? '' : ' disabled') + '>' + esc(t('ui6.previewBtn')) + '</button></div>' + renderInjPreview() + '</div>';
      let adv = (injDraft.mode === 'lore' ? num('depth', 0, 20) : '') + num('sticky', 0, 50) + num('wait', 0, 15000);
      if (injDraft.mode === 'lore') adv += '<div class="phys-field">' + esc(t('ui.inject.strategy')) + seg('strategy', injDraft.strategy, ['vars', 'direct']) + '</div><p class="phys-muted">' + esc(t('ui7.inj.strategyHint')) + '</p>' +
        '<div class="phys-row"><button type="button" class="phys-btn ghost" data-act="inj-rebuild"' + (loreBusy ? ' disabled' : '') + '>' + esc(t('ui6.rebuildBtn')) + '</button></div>';
      adv += '<label class="phys-field">' + esc(t('ui7.inj.prefix')) + '<span class="phys-muted phys-sub2">' + esc(t('ui7.inj.prefixHint')) + '</span><textarea rows="7" data-inj="template" spellcheck="false">' + esc(injDraft.template) + '</textarea></label>' +
        '<div class="phys-row"><button type="button" class="phys-btn ghost small" data-act="inj-reset">' + esc(t('ui.inject.reset')) + '</button></div>';
      ib2 += '<details class="inj-adv"' + (advOpen ? ' open' : '') + '><summary data-act="adv-toggle">' + esc(t('ui7.inj.adv')) + '</summary><div class="inj-adv-b">' + adv + '</div></details>';
    } else ib2 = '<p class="phys-muted">…</p>';
    h += sSection('inject', esc(t('ui2.g.inject')), ib2);
    h += loreDiagSection();
    h += cardDiagSection();
    // acts: custom acts + count correction
    let ab = renderCustomActs();
    if (c && !off) {
      ab += '<div class="phys-subhead">' + esc(t('ui2.g.acts.counts')) + who + '</div><div class="phys-sexgrid">';
      E.SEX_KEYS.forEach((k) => { ab += '<div class="phys-sexitem"><span class="phys-sexlabel">' + esc(E.actLabel(k)) + '</span>' + stepper('sex.' + k, c.sex[k]) + '</div>'; });
      ab += '</div>';
    }
    h += sSection('cacts', esc(t('ui2.g.acts')) + ' <em class="phys-total">' + E.getCustomActs().length + '</em>', ab);
    // kinks
    h += sSection('kinks', esc(t('ui2.g.kinks')) + who, c && !off ? renderKinksEdit(c) : offMsg);
    // data
    let db = renderData(c);
    db += '<div class="phys-subhead">' + esc(t('ui2.g.data.hist')) + '</div>' + undoBtn() + renderHistory(10);
    db += '<div class="phys-subhead">' + esc(t('ui.settings.panel')) + '</div><button type="button" class="phys-btn ghost" data-act="reset-pos">' + esc(t('ui.resetPos')) + '</button><p class="phys-muted">' + esc(t('ui.settings.pluginHint')) + '</p>';
    h += sSection('data', esc(t('ui2.g.data')), db);
    h += sSection('log', esc(t('ui13.log.title')) + (logView ? ' <em class="phys-total">' + logView.filter((x) => x.err).length + '</em>' : ''), renderLog());
    // avatar
    if (c) {
      let pb = '<div class="phys-portrait-row">' + portraitHtml(c, 'mid') + '<div class="phys-portrait-btns">' +
        '<button type="button" class="phys-btn" data-act="pick-img"' + (imgBusy ? ' disabled' : '') + '>' + esc(t('ui.img.upload')) + '</button>' +
        (tavo.__host === 'sillytavern' ? '' : '<button type="button" class="phys-btn ghost" data-act="import-img"' + (imgBusy ? ' disabled' : '') + '>' + esc(t('ui.img.import')) + '</button>') +
        '<button type="button" class="phys-btn ghost" data-act="img-default"' + (c.portrait.path ? '' : ' disabled') + '>' + esc(t('ui.img.restore')) + '</button></div></div>';
      pb += '<p class="phys-muted">' + esc(imgBusy ? t('ui.img.busy') : t('ui.img.hint')) + '</p>';
      h += sSection('portrait', esc(t('ui2.g.avatar')) + who, pb);
    }
    return h;
  }

  /* ---- sync status bubble ---- */
  function syncView() {
    const s = st.sync || E.normSync(null);
    const auto = E.config().autoSync;
    const busy = syncReq || E.syncBusy(st);
    let cls = s.state, label;
    if (pausedNow()) return { cls: 'idle', label: t('uiPause.launcher'), busy: busy, s: s, auto: auto }; // [tt-port:pause] 暂停时启动按钮直接显示“已暂停”
    if (syncReq && !(s.state === 'start' || s.state === 'running')) { cls = 'start'; label = t('ui3.sync.start'); }
    else if (s.state === 'start') label = t('ui3.sync.start');
    else if (s.state === 'running') label = t('ui3.sync.running') + (s.step ? ' · ' + t('ui3.sync.step.' + s.step) : '');
    else if (s.state === 'done') label = s.floor != null ? t('ui3.sync.done', { n: s.floor }) : t('ui3.sync.doneNoFloor');
    else if (s.state === 'fail') label = t('ui3.sync.fail');
    else if (s.state === 'aborted') { label = t('ui9.sync.aborted'); cls = 'idle'; }
    else if (s.state === 'skipped') { label = t('ui9.sync.refusal'); cls = 'done'; }
    else label = auto ? t('ui3.sync.idle') : t('ui3.sync.manual');
    if (!busy && (s.state === 'start' || s.state === 'running')) { cls = 'fail'; label = t('ui3.sync.stale'); } // lock expired: a runtime died mid-run
    return { cls: cls, label: label, busy: busy, s: s, auto: auto };
  }
  // v2.7.5 recognized-characters confirm dialog + staged init progress bar
  let recogSel = null;
  // v2.7.8: recognition starts only after the user opened the panel (icon / sidebar), never on chat open
  const mountAt = Date.now();
  let userOpened = false;
  let recogHidden = false, initHidden = false;
  function wasUserOpened() { return userOpened || (st && st.panel && Number(st.panel.openReq) > 0 && Number(st.panel.openReq) >= mountAt - 20000); }
  let initLocal = false;
  // v2.7.7 compact modals: recognition list (first open + every later batch) -> 是否初始化本批次
  let askInit = null; // { ids: [...] }
  function recogItems() {
    const p = st.recogPending; if (!p) return [];
    const seen = {};
    return p.ids.map((id) => { const c = st.characters[id]; return c ? { k: String(id), name: c.name, note: t('ui10.rc.card') } : null; }).filter(Boolean)
      .concat(p.cands.filter((c) => { const ex = E.samePerson(st, c.name); return !(ex && st.characters[ex] && !st.characters[ex].trackOff && p.ids.indexOf(String(ex)) < 0); }).map((c) => ({ /* v3.0.5pop: a tracked woman is never offered again */ k: String(c.key || c.name), name: c.name, pre: c.minor && recogAdult[String(c.key || c.name)] == null ? false : c.pre, minor: !!c.minor && recogAdult[String(c.key || c.name)] == null, note: (c.minor && recogAdult[String(c.key || c.name)] != null ? t('ttAge.confirmed.tag', { age: recogAdult[String(c.key || c.name)] }) + '·' : '') + (c.scanSrc ? ({ card: '设定扫描', lore: '世界书扫描', chat: '聊天扫描', precise: '精准识别' })[c.scanSrc] + '·' : '') + (c.local === 'rough' ? '本地粗略' : '') + (c.local === 'rough' ? '' : c.minor ? (recogAdult[String(c.key || c.name)] != null ? '' : t('ttAge.minor.tag')) : (c.local ? (String(c.local).indexOf('group:') === 0 ? '群体成员（' + String(c.local).slice(6) + '）' : '本地解析') + '·' + recSrcLabel(c.src || c.source) : (c.source === 'lore' ? t('ui15.lore') : t('ui10.rc.ai')))) })))
      .filter((x) => { const nk = 'n:' + E.nameKey(x.name); if (seen[x.k] || seen[nk]) return false; seen[x.k] = 1; seen[nk] = 1; return true; }); // v3.0.5dup: one row per person
  }
  // v2.8.3: every filtered candidate is listed (collapsed) with its reason and can be ticked back in (never minors)
  const recSrcLabel = (x) => ({ card: '角色卡', lore: '世界书', chat: '对话' })[x] || 'AI';
  const FILTER_WHY = { badName: '名字无效',  male: '男性', collective: '群体', notIndividual: '非个人条目', notFemale: '非女性', notSubject: '条目主体不是她', lowConfidence: '置信度低', group_empty: '群体，未找到具体成员' };
  function filteredItems() {
    const p = st.recogPending; if (!p || !Array.isArray(p.filtered)) return [];
    return p.filtered.map((c) => ({ k: String(c.key || c.name), name: c.name, minor: !!c.minor && recogAdult[String(c.key || c.name)] == null, note: c.minor ? (recogAdult[String(c.key || c.name)] != null ? t('ttAge.confirmed.tag', { age: recogAdult[String(c.key || c.name)] }) : t('ttAge.minor.tag')) : (FILTER_WHY[c.filtered] || String(c.filtered || '已过滤')) + '·' + recSrcLabel(c.src || (c.local ? c.source : 'ai')) }));
  }
  const rcRow = (x) => x.minor
  ? '<div class="phys-rc-minor"><label class="phys-check is-disabled" aria-disabled="true"><input type="checkbox" disabled data-rcminor="' + esc(x.k) + '"><span>' + esc(x.name) + ' <small class="phys-muted">' + esc(x.note) + '</small></span></label>' + adultAskHtml('recog', x.k, x.name) + '</div>' /* [tt-port:age-ui] */
    : '<label class="phys-check"><input type="checkbox" data-rc="' + esc(x.k) + '"' + (recogSel[x.k] !== false ? ' checked' : '') + '><span>' + esc(x.name) + ' <small class="phys-muted">' + esc(x.note) + '</small></span></label>';
  // v2.7.8: inline, non-blocking card inside the panel body (no overlay, no pointer capture)
  function modal(cls, inner) { return '<div class="phys-rcard ' + cls + '" role="region" aria-live="polite">' + inner + '</div>'; }
  const hideBtn = (act) => '<button type="button" class="phys-btn ghost small" data-act="' + act + '">' + esc(t('ui13.hide')) + '</button>';
  function recogActive() {
    if (!askInit && st.askPending && st.askPending.ids && st.askPending.ids.length) askInit = { ids: st.askPending.ids.slice() }; // v3.0.5pop: restored after remount
    if (askInit || (st.askPending && st.askPending.ids && st.askPending.ids.length)) return 'ask'; // v3.0.5pop: 是否初始化 never yields to 是否追踪
    const unconf = st.meta && st.meta.rosterConfirmed === false;
    if (unconf && (!st.recogPending || recogFirst.busy)) return (recogFirst.busy || recogFirst.done || wasUserOpened()) ? 'busy' : '';
    if (st.recogPending && (unconf || !initJobActive()) && (recogItems().length || filteredItems().length)) return 'list';
    return '';
  }
  function anyRecogCard() {
    // v3.0.5: at most one card — ask / list / busy / focus / precise
    return !!(askInit || (st.askPending && st.askPending.ids && st.askPending.ids.length)
      || (st.recogPending && ((st.recogPending.ids && st.recogPending.ids.length) || (st.recogPending.cands && st.recogPending.cands.length) || (st.recogPending.filtered && st.recogPending.filtered.length)))
      || (recogFirst && recogFirst.busy) || (prec && (prec.open || prec.busy)) || (fscan && fscan.busy));
  }
  function renderRecogConfirm() {
    const kind = recogActive();
    // v3.0.5: single card only — ask > list > busy > focus/precise; never stack
    if (kind === 'ask') return renderAskInit();
    if (kind === 'list' && !recogHidden) {
      const unconf = st.meta && st.meta.rosterConfirmed === false;
      const items = recogItems();
      if (!recogSel) recogSel = {};
      const fitems = filteredItems();
      items.forEach((x) => { if (recogSel[x.k] === undefined) recogSel[x.k] = !x.minor && x.pre !== false; });
      fitems.forEach((x) => { if (recogSel[x.k] === undefined) recogSel[x.k] = false; });
      return modal('m-list', '<div class="phys-rcard-h"><b>' + esc(t('ui12.list.title', { n: items.length })) + '</b>' + hideBtn('rc-hide') + '</div><p class="phys-muted">' + esc(t('ui12.list.hint')) + '</p>' +
        '<div class="phys-rc-list">' + items.map(rcRow).join('') + '</div>' +
        (fitems.length ? '<details class="phys-rc-filtered"><summary>已过滤（' + fitems.length + '）</summary><div class="phys-rc-list">' + fitems.map(rcRow).join('') + '</div></details>' : '') +
        '<div class="phys-row"><button type="button" class="phys-btn small" data-act="rc-ok">' + esc(t('ui12.ok')) + '</button><button type="button" class="phys-btn ghost small" data-act="rf-retry">' + esc(t('ui12.again')) + '</button><button type="button" class="phys-btn ghost small" data-act="rc-later">' + esc(t(unconf ? 'ui11.rf.skip' : 'ui10.rc.later')) + '</button></div>');
    }
    if (kind === 'busy' && !recogHidden) return renderRecogBusy();
    const fc = renderFocusCard(); if (fc) return fc;
    return '';
  }
  function renderRecogBusy() {
    // v3.0.5: never auto-start recognition while ask/list/focus already owns the card
    if (!recogFirst.busy && !recogFirst.done && wasUserOpened() && !(askInit || (st.askPending && st.askPending.ids && st.askPending.ids.length) || st.recogPending || (prec && (prec.open || prec.busy)) || (fscan && fscan.busy))) setTimeout(startRecogFirst, 0);
    let h = '<div class="phys-rcard-h"><b>' + esc(t('ui11.rf.title')) + '</b>' + hideBtn('rc-hide') + '</div>';
    if (recogFirst.busy || !recogFirst.done) h += '<div class="phys-rcard-busy"><span class="phys-rf-spin sm" aria-hidden="true"></span><span class="phys-muted">' + esc(t('ui13.busy')) + '</span></div>';
    else {
      const ae = recogFirst.aiErr || (st.meta && st.meta.autoRecog && st.meta.autoRecog.aiErr);
      if (ae && recogFirst.err) h += aiErrBox(Object.assign({ step: '识别角色' }, ae), 'rf-retry', '<button type="button" class="phys-btn ghost small" data-act="rf-skip">' + esc(t('ui11.rf.skip')) + '</button>') + roughSection();
      else h += '<p class="phys-status warn">' + esc(recogFirst.err ? t('ui12.fail', { err: recogFirst.err }) : t('ui11.rf.none')) + '</p>' +
        '<div class="phys-row"><button type="button" class="phys-btn small" data-act="rf-retry">' + esc(t('ui12.again')) + '</button><button type="button" class="phys-btn ghost small" data-act="rf-skip">' + esc(t('ui11.rf.skip')) + '</button></div>';
    }
    return modal('m-busy phys-rf', h);
  }
  function renderAskInit() {
    const names = askInit.ids.map((id) => st.characters[id] ? st.characters[id].name : '').filter(Boolean);
    return modal('m-ask', '<div class="phys-rcard-h"><b>' + esc(t('ui12.ask.title')) + '</b></div><p class="phys-muted">' + esc(t('ui12.ask.hint', { n: names.length, names: names.join('、') })) + '</p>' +
      '<p class="phys-status warn">' + esc(t('ui11.rc.risk')) + '</p>' +
      '<div class="phys-row"><button type="button" class="phys-btn small" data-act="ask-ok">' + esc(t('ui12.ok')) + '</button><button type="button" class="phys-btn ghost small" data-act="ask-no">' + esc(t('ui12.cancel')) + '</button></div>');
  }
  // small chips in the panel head reopen a hidden recognition card / progress bar
  function renderChips() {
    let h = '';
    const k = recogActive();
    if (k && recogHidden) h += '<button type="button" class="phys-chip" data-act="rc-show">' + esc(k === 'busy' && (recogFirst.busy || !recogFirst.done) ? t('ui13.chip.busy') : t('ui13.chip.list')) + '</button>';
    if (lastAiErr) h += '<button type="button" class="phys-chip phys-chip-err" data-act="aierr-toggle" title="' + esc(lastAiErr.hint || '') + '">AI 出错：' + esc(lastAiErr.label || '') + '</button>';
    const v = E.initJobView(st);
    if (v && initHidden) h += '<button type="button" class="phys-chip" data-act="init-show">' + esc(t('ui13.chip.init', { x: v.done, n: v.n })) + '</button>';
    return h ? '<div class="phys-chips">' + h + '</div>' + (lastAiErr && aiErrOpen ? aiErrBox(lastAiErr, 'aierr-retry', '<button type="button" class="phys-btn ghost small" data-act="aierr-dismiss">知道了</button>') : '') : '';
  }
  const recogFirst = { busy: false, done: false, err: '' };
  // v2.8.5: AI error box (step, type, actionable hint) + 重试
  let lastAiErr = null; let aiErrOpen = false;
  function aiErrBox(e, retryAct, extra) {
    if (!e) return '';
    return '<div class="phys-aierr" role="alert"><b>' + esc((e.step ? e.step + ' 失败：' : 'AI 请求失败：') + (e.label || '')) + '</b><p>' + esc(e.hint || '') + '</p>' +
      (retryAct || extra ? '<div class="phys-row">' + (retryAct ? '<button type="button" class="phys-btn small" data-act="' + retryAct + '">重试</button>' : '') + (extra || '') + '</div>' : '') + '</div>';
  }
  const fscan = { busy: false, src: '', err: null, n: 0 };
  const FSCAN_ZH = { card: '从角色设定扫描', lore: '从世界书扫描', chat: '从聊天上下文扫描' };
  // v3.0.27: hard hold = ask / initJob; soft = open recog list (toast + clear before manual scan). Never silent on user click.
  function scanHardHold() { return !!(askInit || (st.askPending && st.askPending.ids && st.askPending.ids.length) || initJobRunning()); }
  // v3.0.28: only a RUNNING init blocks scans; paused/failed jobs used to lock the scan UI forever
  function initJobRunning() { return !!(st.initJob && st.initJob.status === 'running'); }
  async function toastScanHold(why) {
    const msg = why === 'ask' ? '请先完成「是否初始化」，稍后再扫描' : (why === 'init' ? '初始化进行中，请稍后再扫描' : (why === 'list' ? '请先确认或关闭当前识别名单，稍后再扫描' : (why === 'busy' ? '正在识别中，请稍候' : '请稍后再试')));
    await toastText(msg);
  }
  async function startFocusScan(src) {
    if (fscan.busy || prec.busy) { await toastScanHold('busy'); return; }
    if (recogFirst.busy) { await toastScanHold('busy'); return; }
    if (askInit || (st.askPending && st.askPending.ids && st.askPending.ids.length)) { await toastScanHold('ask'); return; }
    if (initJobRunning()) { await toastScanHold('init'); return; }
    if (st.recogPending && ((st.recogPending.ids && st.recogPending.ids.length) || (st.recogPending.cands && st.recogPending.cands.length) || (st.recogPending.filtered && st.recogPending.filtered.length))) {
      recogHidden = false; render(); await toastScanHold('list'); return; /* v3.0.28: re-show the list card so it can be confirmed/dismissed */ // v3.0.27: never stack over open list; user must confirm/dismiss first
    }
    fscan.busy = true; fscan.src = src; fscan.err = null; prec.open = false; recogSel = null; recogHidden = false; render();
    let r = null;
    try { r = await E.focusedScan(src, src === 'chat' && aiDraft ? { msgs: aiDraft.focusScanMsgs } : {}); } catch (e) { r = { ok: false, aiErr: { step: FSCAN_ZH[src], label: String((e && e.message) || e), hint: '重试' } }; }
    await refreshFromStore(true);
    fscan.busy = false;
    if (r && r.held) { fscan.err = { step: FSCAN_ZH[src], label: r.hard ? '请先完成初始化' : '请稍后再试', hint: r.hard ? '先点确认或取消「是否初始化」' : '刚确认追踪后短暂冷却，稍后再点扫描' }; await toastText(fscan.err.label); }
    else if (r && !r.ok && !r.skipped) fscan.err = Object.assign({}, r.aiErr || { label: r.err || '失败', hint: '' }, { step: FSCAN_ZH[src] });
    else if (r && r.ok && !(r.applied > 0)) fscan.err = { step: FSCAN_ZH[src], label: '没有找到新角色', hint: '换一个扫描来源，或手动添加角色' };
    render();
  }
  // v2.9.0 F1 / v3.0.27: 精准识别 — 人名框内联在设置页；弹层只作进行中忙碌态，不叠 ask
  const prec = { open: false, names: '', src: { card: true, lore: true, chat: true }, busy: false, err: null, nf: [] };
  const PREC_ZH = { card: '角色卡设定识别', lore: '世界书识别', chat: '上下文识别' };
  async function startPrecise() {
    if (prec.busy || fscan.busy) { await toastScanHold('busy'); return; }
    if (askInit || (st.askPending && st.askPending.ids && st.askPending.ids.length)) { await toastScanHold('ask'); return; }
    if (initJobRunning()) { await toastScanHold('init'); return; }
    if (st.recogPending && ((st.recogPending.ids && st.recogPending.ids.length) || (st.recogPending.cands && st.recogPending.cands.length) || (st.recogPending.filtered && st.recogPending.filtered.length))) {
      recogHidden = false; render(); await toastScanHold('list'); return; /* v3.0.28: re-show the list card so it can be confirmed/dismissed */
    }
    const names = prec.names.split(/[、,，;；\s]+/).map((x) => x.trim()).filter(Boolean);
    const srcs = Object.keys(prec.src).filter((k) => prec.src[k]);
    prec.err = null; prec.nf = [];
    if (!names.length) { prec.err = { step: '精准识别', label: '请输入名字', hint: '多个名字用顿号或逗号分隔' }; render(); return; }
    if (!srcs.length) { prec.err = { step: '精准识别', label: '请至少选择一个来源', hint: '角色卡设定、世界书、上下文可多选' }; render(); return; }
    prec.busy = true; prec.open = false; recogSel = null; recogHidden = false; render();
    let r = null;
    try { r = await E.preciseScan(names, srcs); } catch (e) { r = { ok: false, aiErr: { label: String((e && e.message) || e), hint: '重试' } }; }
    await refreshFromStore(true);
    prec.busy = false;
    if (r && r.held) { prec.err = { step: '精准识别', label: r.hard ? '请先完成初始化' : '请稍后再试', hint: r.hard ? '先点确认或取消「是否初始化」' : '刚确认追踪后短暂冷却，稍后再识别' }; await toastText(prec.err.label); }
    else if (r && !r.ok && !r.skipped) prec.err = Object.assign({}, r.aiErr || { label: r.err || '失败', hint: '' }, { step: '精准识别' });
    else { prec.nf = (r && r.notFound) || []; if (prec.nf.length) await toastText('未找到：' + prec.nf.join('、')); }
    render();
  }
  async function toastText(x) { try { await tavo.utils.toast(x); } catch (e) { /* ignore */ } }
  function renderPreciseCard() {
    // v3.0.27: names live inline in settings; overlay is busy-only, never stacks on ask/list
    if (askInit || (st.askPending && st.askPending.ids && st.askPending.ids.length)) return '';
    if (!prec.busy) return '';
    const h = '<div class="phys-rcard-h"><b>精准识别</b>' + hideBtn('prec-close') + '</div>';
    return modal('m-busy phys-rf phys-prec', h + '<div class="phys-rcard-busy"><span class="phys-rf-spin sm" aria-hidden="true"></span><span class="phys-muted">正在从「' + esc(Object.keys(prec.src).filter((k) => prec.src[k]).map((k) => PREC_ZH[k]).join('、')) + '」查找：' + esc(prec.names) + '</span></div>');
  }
  function renderFocusCard() {
    if (askInit || (st.askPending && st.askPending.ids && st.askPending.ids.length)) return ''; // v3.0.5: ask wins over precise/focus
    const pc = renderPreciseCard(); if (pc) return pc;
    if (recogHidden) return '';
    if (fscan.busy) return modal('m-busy phys-rf', '<div class="phys-rcard-h"><b>' + esc(FSCAN_ZH[fscan.src]) + '</b>' + hideBtn('rc-hide') + '</div><div class="phys-rcard-busy"><span class="phys-rf-spin sm" aria-hidden="true"></span><span class="phys-muted">' + esc(t('ui13.busy')) + '</span></div>');
    if (fscan.err) return modal('m-busy phys-rf', '<div class="phys-rcard-h"><b>' + esc(FSCAN_ZH[fscan.src]) + '</b>' + hideBtn('fs-close') + '</div>' + aiErrBox(fscan.err, 'fs-retry', roughBtn()));
    return '';
  }
  function roughBtn() { const ar = st.meta && st.meta.autoRecog; return ar && Array.isArray(ar.rough) && ar.rough.length ? '<button type="button" class="phys-btn ghost small" data-act="rf-rough">查看本地粗略结果</button>' : ''; }
  function roughSection() {
    const ar = st.meta && st.meta.autoRecog; if (!ar || !Array.isArray(ar.rough) || !ar.rough.length) return '';
    return '<details class="phys-rc-filtered phys-rough"><summary>AI 识别失败，以下为本地粗略结果（' + ar.rough.length + '）</summary><p class="phys-muted">这些名字只是本地规则从文本里粗略找出的，没有经过 AI 识别，可能不准。</p><div class="phys-rc-list">' + ar.rough.map((c) => '<span class="phys-chip-n">' + esc(c.name) + '</span>').join('') + '</div><div class="phys-row"><button type="button" class="phys-btn ghost small" data-act="rf-rough">加入待确认名单（默认不勾）</button></div></details>';
  }
  async function startRecogFirst() {
    if (recogFirst.busy || recogFirst.done || disposed) return;
    if (askInit || (st.askPending && st.askPending.ids && st.askPending.ids.length) || st.recogPending || (prec && (prec.open || prec.busy)) || (fscan && fscan.busy)) return; // v3.0.5: one card
    recogFirst.busy = true; recogFirst.err = ''; render();
    let r = null;
    try { r = await E.autoRecognize({ force: true }); if (r && r.refused) r.err = r.err || t('ui12.refused'); } catch (e) { r = { ok: false, err: String((e && e.message) || e) }; }
    await refreshFromStore(false); // v2.8.0: read the saved result BEFORE the card leaves the busy state (no 识别不到 flash/race)
    recogFirst.busy = false; recogFirst.done = true; recogFirst.aiErr = r && r.aiErr ? r.aiErr : null;
    if (r && !r.ok && r.err && r.err !== 'already') recogFirst.err = r.err;
    render();
  }
  function initJobActive() { return !!(st.initJob && st.initJob.status !== 'done'); }
  function renderInitBar() {
    const v = E.initJobView(st);
    if (!v || initHidden) return '';
    const stepName = t('ui10.init.step.' + v.step) + (v.stage ? '·' + v.stage : ''); // v3.0.30 substage
    const del = '<button type="button" class="phys-btn small ghost" data-act="init-del">' + esc(t('ui13.del')) + '</button>';
    const hide = '<button type="button" class="phys-btn small ghost" data-act="init-hide">' + esc(t('ui13.hide')) + '</button>';
    if (v.status === 'paused') { // v2.7.8: after 中断 the bar collapses to one line
      return '<div class="phys-initbar mini s-paused" role="status"><div class="phys-initbar-t"><span>' + esc(t('ui13.paused', { x: v.done, n: v.n })) + '</span><button type="button" class="phys-btn small" data-act="init-resume">' + esc(t('ui10.init.resume')) + '</button>' + del + '</div></div>';
    }
    let line = t('ui12.bar.cur', { name: v.name, step: stepName + ' ' + t('ui14.sub', { x: Math.min(v.subDone + (v.status === 'running' ? 1 : 0), v.subTotal), n: v.subTotal }) }) + (v.subNote && v.status === 'running' ? ' · ' + v.subNote : '');
    let btns = '';
    if (v.status === 'running') line = '正在生成… ' + line;
    if (v.status === 'running') { if (v.tries) line += ' · ' + t('ui10.init.retrying', { n: v.tries }) + (v.err ? '（' + v.err + '）' : ''); btns = '<button type="button" class="phys-btn small stop" data-act="init-abort">' + esc(t('ui9.sync.abort')) + '</button>' + hide + del; }
    else { line = t('ui10.init.failed', { name: v.name, step: stepName }); btns = '<button type="button" class="phys-btn small" data-act="init-retry">' + esc(t('ui12.bar.retry')) + '</button><button type="button" class="phys-btn small stop" data-act="init-abort">' + esc(t('ui9.sync.abort')) + '</button>' + hide + del; }
    const steps = ['fert', 'acts', 'body'].map((s2, ix) => '<span class="' + (ix < v.si ? 'ok' : (ix === v.si ? 'cur' : '')) + '">' + esc(t('ui10.init.step.' + s2) + (ix === v.si ? ' ' + t('ui14.sub', { x: Math.min(v.subDone + (v.status === 'running' ? 1 : 0), v.subTotal), n: v.subTotal }) : '')) + '</span>').join('<em>→</em>');
    return '<div class="phys-initbar s-' + v.status + '" role="status" aria-live="polite"><div class="phys-initbar-t"><b>' + esc(t('ui12.bar.batch', { x: v.done, n: v.n })) + '</b></div>' +
      '<div class="phys-initbar-b"><i style="width:' + Math.round(v.done * 100 / Math.max(1, v.n)) + '%"></i></div>' +
      '<div class="phys-initbar-c">' + (v.status === 'running' ? '<i class="phys-spin" aria-hidden="true"></i>' : '') + esc(line) + '</div>' + (v.status === 'failed' && v.err && !v.aiErr ? '<div class="phys-aierr" role="alert"><b>' + esc(v.name + ' 初始化失败：' + v.err) + '</b><p>原有数据保持不变，失败已记入运行日志，可点「重试」。</p></div>' : '') + (v.aiErr && v.status !== 'running' ? aiErrBox({ step: '初始化 · ' + v.name + ' · ' + stepName, label: v.aiErr.label, hint: v.aiErr.hint }, '') : (v.aiErr && v.tries ? '<div class="phys-initbar-c phys-aierr-hint">' + esc(v.aiErr.label + '：' + v.aiErr.hint) + '</div>' : '')) + '<div class="phys-initbar-s">' + steps + '</div>' +
      '<div class="phys-initbar-b sub"><i style="width:' + Math.round(v.si * 100 / Math.max(1, v.sn)) + '%"></i></div><div class="phys-initbar-a">' + btns + '</div></div>';
  }
  async function kickInit(opts) {
    if (initLocal) return;
    initLocal = true;
    // v3.0.3: no own poller; the panel tick runs fast while initLocal is set
    try { await E.runInitJob(opts || {}); } catch (e) { /* state shows the error */ }
    initLocal = false;
    await refreshFromStore(true);
  }
  // v2.9.0 per-turn progress: involved characters (red frame = analysed this turn; tap to skip), done / remaining
  const turnSkipLocal = {}; let turnHidden = false;
  function renderTurn(v) {
    const tr = v.s.turn; if (!tr || !tr.ids.length || turnHidden) return '';
    const msg = String(tr.msg); const sk = Object.assign({}, turnSkipLocal[msg] || {}); tr.skip.forEach((id) => { sk[id] = true; });
    const live = v.busy;
    const n = tr.ids.filter((id) => !sk[id]).length; const done = tr.done.length; const fail = tr.fail.length;
    const left = Math.max(0, n - done - fail);
    let h = '<div class="phys-turn" role="status" aria-live="polite"><div class="phys-turn-t"><b>本轮更新 ' + done + ' / ' + n + '</b><span class="phys-muted">' + (live ? (left ? '剩余 ' + left + ' 位' : '写入中') : (fail ? fail + ' 位失败' : '已完成')) + '</span>' +
      '<button type="button" class="phys-btn ghost small" data-act="turn-hide">' + esc(t('ui13.hide')) + '</button></div>' +
      '<div class="phys-initbar-b"><i style="width:' + Math.round(done * 100 / Math.max(1, n)) + '%"></i></div><div class="phys-turn-names">';
    tr.ids.forEach((id, i) => {
      const nm = tr.names[i] || id; const off = !!sk[id]; const st2 = tr.done.indexOf(id) >= 0 ? 'ok' : (tr.fail.indexOf(id) >= 0 ? 'bad' : (tr.cur === id ? 'cur' : ''));
      const can = live && !st2;
      h += '<button type="button" class="phys-turn-n' + (off ? ' off' : ' on') + (st2 ? ' ' + st2 : '') + '" data-act="turn-toggle" data-id="' + esc(id) + '" data-msg="' + esc(msg) + '"' + (can ? '' : ' disabled') + ' aria-pressed="' + (off ? 'false' : 'true') + '">' + esc(nm) + (st2 === 'ok' ? ' · 已更新' : (st2 === 'bad' ? ' · 失败' : (st2 === 'cur' ? ' · 分析中' : ''))) + '</button>';
    });
    h += '</div>' + (live ? '<p class="phys-muted phys-turn-hint">红框 = 本轮分析，点名字可跳过' + (tr.ids.length > 1 ? '；多角色同时出场时每人单独分析，耗时更久' : '') + '</p>' : '');
    if (!live && fail && lastAiErr) h += aiErrBox(lastAiErr, 'sync-now');
    return h + '</div>';
  }
  function renderSync() {
    const v = syncView();
    let h = '<div class="phys-sync s-' + v.cls + (v.s.warn ? ' warn' : '') + (v.auto ? '' : ' manual') + '" data-role="sync">';
    h += renderTurn(v);
    if (syncDiag && (v.s.detail || v.cls === 'fail')) {
      h += '<div class="phys-sync-diag" role="dialog"><header><b>' + esc(t('ui3.sync.diag')) + '</b><button type="button" class="phys-ico sm" data-act="sync-diag" aria-label="' + esc(t('ui2.day.close')) + '">' + ICON.close + '</button></header>' +
        '<p>' + esc(v.s.detail || t('ui3.sync.noDetail')) + '</p>' + (v.s.ts ? '<small>' + esc(fmtStamp(v.s.ts)) + (v.s.msg ? ' · id ' + esc(v.s.msg) : '') + '</small>' : '') + '</div>';
    }
    h += '<div class="phys-sync-pill" role="status" aria-live="polite"><button type="button" class="phys-sync-st" data-act="sync-diag" title="' + esc(t('ui3.sync.tapDiag')) + '"><i class="phys-sync-dot" aria-hidden="true"></i><span>' + esc(v.label) + '</span></button>' +
      (v.busy ? '<button type="button" class="phys-sync-go stop" data-act="sync-abort"' + (abortBusy ? ' disabled' : '') + '>' + esc(t('ui9.sync.abort')) + '</button>' : (latestDone ? '<button type="button" class="phys-sync-go redo" data-act="sync-redo">' + esc(t('ui298.sync.redo')) + '</button>' : '<button type="button" class="phys-sync-go" data-act="sync-now">' + esc(t('ui3.sync.now')) + '</button>')) + '</div>';
    return h + '</div>';
  }
  async function doSyncNow(o) {
    if (syncReq || E.syncBusy(st)) { await toast('ui3.sync.toast.busy'); return; }
    syncReq = true; syncDiag = false; render();
    let r = null;
    // v3.0.3: no own poller; the panel tick runs fast while syncReq is set
    try { r = await E.syncNow(o); } catch (e) { r = { status: 'error' }; }
    syncReq = false;
    await refreshFromStore(true);
    const st0 = r && r.status;
    await toast(st0 === 'ok' ? 'ui3.sync.toast.ok' : st0 === 'busy' ? 'ui3.sync.toast.busy' : st0 === 'uptodate' ? 'ui3.sync.toast.uptodate' : st0 === 'nomessage' ? 'runtime.nomessage' : 'ui3.sync.toast.fail', { n: (st.sync && st.sync.floor) != null ? st.sync.floor : '?' });
  }

  /* ---- v2.4 editing guard: while a text field is focused nothing re-renders, re-lays out or animates ---- */
  const TEXTY = /^(text|number|password|search|url|email|tel|date|)$/;
  function isEditing() {
    const ae = document.activeElement;
    if (!ae || !root.contains(ae)) return false;
    if (ae.tagName === 'TEXTAREA' || ae.isContentEditable) return true;
    return ae.tagName === 'INPUT' && TEXTY.test(String(ae.getAttribute('type') || '').toLowerCase());
  }
  let pendingRender = false, pendingLayout = false;
  function render(opts) {
    if (disposed) return;
    if (isEditing() && !(opts && opts.force)) { pendingRender = true; return; } // keep the focused node, value and caret
    pendingRender = false;
    const cfg = E.config();
    if (!cfg.enabled) { view.innerHTML = ''; return; }
    if (st.panel.view === 'settings') { // sidebar / legacy entry -> settings page
      st.panel.view = 'main'; page = 'settings'; savePage();
      editPanel((p) => { p.view = 'main'; });
      ensureDrafts().then(() => { if (!disposed) render(); });
    }
    const panelOpen = st.panel.open;
    const inScan = st.panel.view === 'scan';
    const c = current();
    let h = '';
    const dotC = c && !isOff(c) ? '<span class="phys-dot ' + (c.fertility.pregnant ? 'pregnant' : (c.cycle.fertile ? 'fertile' : c.cycle.phase)) + '"></span>' : '';
    const sv = syncView();
    h += '<div class="phys-launcher' + (panelOpen ? ' hidden' : '') + ' ls-' + sv.cls + '" data-drag="launcher" role="button" tabindex="0" title="' + esc(t('ui.launcher') + ' · ' + sv.label) + '" aria-label="' + esc(t('ui.launcher') + ' · ' + sv.label) + '">' + LOGO + dotC + '<i class="phys-lsync" aria-hidden="true"></i></div>';
    if (panelOpen) {
      h += '<div class="phys-panel' + (st.panel.collapsed ? ' collapsed' : '') + ' pg-' + page + '" data-role="panel" role="dialog" aria-label="' + esc(t('ui.title')) + '">';
      const ib = (act, extra, label, ic) => '<button type="button" class="phys-ico" data-act="' + act + '"' + extra + ' title="' + esc(label) + '" aria-label="' + esc(label) + '">' + ic + '</button>';
      h += '<div class="phys-head" data-drag="panel"><span class="phys-grip" aria-hidden="true"></span><span class="phys-title">' + esc(inScan ? t('ui.scan.title') : t('ui.title')) + '</span><span class="phys-sp"></span>' +
        (inScan ? ib('scan-cancel', '', t('ui.settings.back'), ICON.back) : '') +
        ((!inScan && st.history && st.history.length) ? ib('undo-last', '', t('ui.hist.undoLast'), ICON.undo) : '') +
        ib('track-pause', ' data-on="' + (pausedNow() ? '1' : '0') + '" aria-pressed="' + (pausedNow() ? 'true' : 'false') + '"', t(pausedNow() ? 'uiPause.resume' : 'uiPause.pause'), pausedNow() ? ICON.play : ICON.pause) + /* [tt-port:pause] */
        ib('rescan', '', t('ui.rescan'), ICON.refresh) +
        ib('collapse', '', st.panel.collapsed ? t('ui.expand') : t('ui.collapse'), st.panel.collapsed ? ICON.down : ICON.up) +
        ib('close', '', t('ui.close'), ICON.close) + '</div>';
      if (!st.panel.collapsed) {
        if (inScan) h += '<div class="phys-body">' + renderScan() + '</div>';
        else {
          if (c) h += '<div class="hd-stack" data-role="hd-stack">' + renderHeader(c) + '</div>';
          h += renderTabs();
          h += renderPauseStrip(); /* [tt-port:pause] */
          let body;
          if (page === 'settings') body = renderSettings(c);
          else if (page === 'roster') body = pageRoster(c);
          else if (!chars().length) body = pageHead(page) + '<p class="phys-muted phys-pad">' + esc(t('ui.noChars')) + '</p><div class="phys-row"><button type="button" class="phys-btn big" data-act="ai-scan">' + esc(t('ui.scan.button')) + '</button><button type="button" class="phys-btn ghost" data-act="rescan">' + esc(t('ui.scanNow')) + '</button></div>';
          else if (isOff(c)) body = pageHead(page) + '<div class="phys-skip"><p>' + esc(offReason(c)) + '</p>' + (c.skippedReason === 'minor' ? adultAskHtml('char', chKey(c), c.name) : '') + (c.migratedFromMinor && c.trackOff ? '<p class="phys-muted">' + esc(t('ttAge.migrated.hint')) + '</p>' : '') + '<button type="button" class="phys-btn" data-act="page" data-page="settings">' + esc(t('ui.settings.open')) + '</button></div>'; /* [tt-port:age-ui] */
          else body = page === 'sex' ? pageSex(c) : (page === 'profile' ? pageProfile(c) : pageFert(c));
          h += renderChips();
          h += '<div class="phys-body" data-role="pages">' + renderRecogConfirm() + renderInitBar() + '<div class="phys-page p-' + page + (pageAnim ? ' enter-' + pageAnim : '') + '">' + body + '</div></div>';
          h += renderSync();
        }
      }
      h += '</div>';
    }
    const oldList = view.querySelector('.phys-pick-list');
    const listScroll = oldList ? oldList.scrollTop : -1;
    const oldBody = view.querySelector('.phys-body');
    const oldPage = oldBody ? oldBody.getAttribute('data-page') : null;
    if (oldBody && oldPage) pageScroll[oldPage] = oldBody.scrollTop;
    const oldUl = view.querySelector('.phys-ul');
    const ulFrom = oldUl ? { x: oldUl.style.transform, w: oldUl.style.width } : null;
    view.innerHTML = h;
    applyLayout(); // sets the panel max-height first; otherwise the body is not scrollable yet and scrollTop would clamp to 0
    const nb = view.querySelector('.phys-body');
    if (nb) {
      nb.setAttribute('data-page', inScan ? 'scan' : page);
      const sc = pageScroll[inScan ? 'scan' : page];
      if (sc) nb.scrollTop = sc;
    }
    placeUnderline(ulFrom);
    pageAnim = '';
    const nl = view.querySelector('.phys-pick-list');
    if (nl) {
      if (listScroll >= 0) nl.scrollTop = listScroll;
      else { const on = nl.querySelector('.phys-pick-item.on'); if (on) nl.scrollTop = Math.max(0, on.offsetTop - nl.clientHeight / 2 + on.offsetHeight / 2); }
    }
    rosCenter = false;
    if (locEdit) { const li = view.querySelector('[data-role=loc-input]'); if (li && document.activeElement !== li) { try { li.focus({ preventScroll: true }); } catch (e) { /* ignore */ } } }
  }
  function placeUnderline(from) {
    const ul = view.querySelector('.phys-ul');
    const on = view.querySelector('.phys-tab2.on');
    if (!ul || !on) return;
    const to = { x: 'translateX(' + on.offsetLeft + 'px)', w: on.offsetWidth + 'px' };
    if (from && from.x && (from.x !== to.x || from.w !== to.w)) {
      ul.style.transition = 'none'; ul.style.transform = from.x; ul.style.width = from.w;
      void ul.offsetWidth;
      ul.style.transition = '';
    }
    ul.style.transform = to.x; ul.style.width = to.w;
  }
  function savePage() { try { sessionStorage.setItem('phys.page', page); } catch (e) { /* ignore */ } }
  async function ensureDrafts() {
    if (!apiDraft) await loadApiDraft();
    if (!injDraft) await loadInjDraft();
    if (!aiDraft) await loadAiDraft();
  }
  async function setPage(p, dir) {
    if (PAGES.indexOf(p) < 0 || p === page) return;
    const from = PAGES.indexOf(page), to = PAGES.indexOf(p);
    pageAnim = dir ? (dir > 0 ? 'r' : 'l') : (to > from ? 'r' : 'l');
    page = p; savePage(); charMenu = false;
    if (p === 'settings') { apiStatus = null; await ensureDrafts(); }
    render();
  }

  /* ---- layout / clamping ---- */
  function clampPos(x, y, w, h) {
    const ins = readInsets();
    const vw = window.innerWidth, vh = window.innerHeight;
    const minX = MARGIN, maxX = Math.max(minX, vw - w - MARGIN);
    const minY = ins.top + MARGIN, maxY = Math.max(minY, vh - ins.bottom - h - MARGIN);
    return { x: E.clamp(x, minX, maxX), y: E.clamp(y, minY, maxY) };
  }
  function applyLayout() {
    if (isEditing()) { pendingLayout = true; return; } // v2.7.1: never reposition while typing (host owns keyboard avoidance)
    const ins = readInsets();
    const vw = window.innerWidth, vh = window.innerHeight;
    const L = view.querySelector('.phys-launcher');
    if (L) {
      const w = L.offsetWidth || 44, h = L.offsetHeight || 44;
      const p = clampPos(st.panel.lx != null ? st.panel.lx : vw - w - MARGIN, st.panel.ly != null ? st.panel.ly : ins.top + 72, w, h);
      L.style.left = p.x + 'px'; L.style.top = p.y + 'px';
    }
    const P = view.querySelector('.phys-panel');
    if (P) {
      P.style.maxHeight = Math.max(120, vh - ins.top - ins.bottom - MARGIN * 2) + 'px';
      const w = P.offsetWidth || Math.min(360, vw - 16), h = P.offsetHeight || 200;
      const p = clampPos(st.panel.x != null ? st.panel.x : vw - w - MARGIN, st.panel.y != null ? st.panel.y : ins.top + MARGIN, w, h);
      P.style.left = p.x + 'px'; P.style.top = p.y + 'px';
    }
  }

  /* ---- dragging (click vs drag) ---- */
  let drag = null;
  function onPointerDown(e) {
    swipeStart(e);
    const handle = e.target.closest && e.target.closest('[data-drag]');
    if (!handle || !root.contains(handle)) return;
    if (e.button !== undefined && e.button !== 0) return;
    if (handle.dataset.drag === 'panel' && e.target.closest('button, input, select, a')) return;
    const el = handle.dataset.drag === 'panel' ? view.querySelector('.phys-panel') : handle;
    if (!el) return;
    const r = el.getBoundingClientRect();
    drag = { kind: handle.dataset.drag, el: el, sx: e.clientX, sy: e.clientY, ox: r.left, oy: r.top, w: r.width, h: r.height, moved: false, id: e.pointerId, handle: handle };
    try { handle.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
  }
  function onPointerMove(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    if (!drag.moved && Math.hypot(dx, dy) > 6) { drag.moved = true; dragging = true; drag.el.classList.add('dragging'); }
    if (!drag.moved) return;
    e.preventDefault();
    const p = clampPos(drag.ox + dx, drag.oy + dy, drag.w, drag.h);
    drag.el.style.left = p.x + 'px'; drag.el.style.top = p.y + 'px';
  }
  async function onPointerUp(e) {
    if (swipe) swipeEnd(e);
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag; drag = null;
    try { d.handle.releasePointerCapture(d.id); } catch (_) { /* ignore */ }
    d.el.classList.remove('dragging');
    if (d.moved) {
      const x = parseFloat(d.el.style.left) || 0, y = parseFloat(d.el.style.top) || 0;
      await editPanel((p) => { if (d.kind === 'launcher') { p.lx = Math.round(x); p.ly = Math.round(y); } else { p.x = Math.round(x); p.y = Math.round(y); } });
      setTimeout(() => { dragging = false; }, 50);
    } else {
      dragging = false;
      if (d.kind === 'launcher') { userOpened = true; await editPanel((p) => { p.open = true; p.collapsed = false; p.openReq = Date.now(); }); render(); loreKick(); }
    }
  }
  function onPointerCancel(e) {
    swipe = null;
    if (drag && e.pointerId === drag.id) { drag.el.classList.remove('dragging'); drag = null; dragging = false; applyLayout(); }
  }

  /* ---- actions ---- */
  async function doRescan(reinitId) {
    try {
      const r = await E.scanCharacters(reinitId ? { reinit: reinitId } : { batch: true });
      st = r.state; lastJson = JSON.stringify(st); render();
      await toast('runtime.rescanned', { count: Object.keys(st.characters).length, added: r.added });
    } catch (e) { await toast('runtime.error'); }
  }
  async function saveLoc() {
    const c = current();
    const li = view.querySelector('[data-role=loc-input]');
    if (!c || !li) { locEdit = false; render(); return; }
    try { await E.setPlace(chKey(c), li.value); } catch (e) { await toast('ui.error.save'); }
    locEdit = false;
    await refreshFromStore(true);
  }
  /* ---- swipe between pages (horizontal only; vertical scroll untouched) ---- */
  function swipeStart(e) {
    const b = e.target.closest && e.target.closest('.phys-body[data-role=pages]');
    if (!b || st.panel.view === 'scan') { swipe = null; return; }
    if (e.target.closest('input, textarea, select, pre, .phys-pick-list, .phys-noswipe')) { swipe = null; return; }
    swipe = { x: e.clientX, y: e.clientY, t: Date.now(), id: e.pointerId };
  }
  function swipeEnd(e) {
    if (!swipe || (e.pointerId !== undefined && swipe.id !== undefined && e.pointerId !== swipe.id)) { swipe = null; return; }
    const s0 = swipe; swipe = null;
    const dir = E.swipeDir(e.clientX - s0.x, e.clientY - s0.y, Date.now() - s0.t);
    if (!dir) return;
    const next = E.pageStep(PAGES, page, dir);
    if (next !== page) { swallowClick = Date.now(); setPage(next, dir); }
  }
  let swallowClick = 0;
  const blankKid = () => E.normalizeOffspring({ name: '', age: null, gender: '', note: '', src: 'user' });
  let lastClickTs = 0; // v3.0.28: suppress poll/stamp remounts right after a tap (blur->remount mid-handler race)
  async function onClick(e) {
    lastClickTs = Date.now();
    { const ab = e.target && e.target.closest && e.target.closest('[data-act]'); if (!ab || ab.dataset.act !== 'fert-sub') fertCache = {}; }
    if (Date.now() - swallowClick < 350) { swallowClick = 0; return; }
    if (isEditing() && e.target.closest && e.target.closest('button, [role=button], [data-act]') && !e.target.closest('input, textarea, select, label')) { try { document.activeElement.blur(); } catch (e2) { /* ignore */ } }
    if (charMenu && !(e.target.closest && e.target.closest('.phys-charmenu, [data-act=char-menu]'))) { charMenu = false; render(); return; }
    const btn = e.target.closest && e.target.closest('[data-act]');
    if (!btn || !root.contains(btn)) return;
    const act = btn.dataset.act;
    if (act === 'preg-toggle' || act === 'track-toggle' || act === 'scan-track' || act === 'scan-preg' || act === 'kink-lock' || act === 'clear-global') return; // handled by change
    const c = current();
    switch (act) {
      case 'close': await editPanel((p) => { p.open = false; }); render(); break;
      case 'collapse': await editPanel((p) => { p.collapsed = !p.collapsed; }); render(); break;
      case 'rescan': await doRescan(); break;
      case 'track-pause': { /* [tt-port:pause] */
        const on = !pausedNow();
        try { await E.setPaused(on); } catch (e) { await toastText(t('uiPause.fail')); break; }
        await refreshFromStore(true);
        render();
        await toastText(on ? t('uiPause.toastOn') : t('uiPause.toastOff'));
        break;
      }
      /* [tt-port:age-ui] */
      case 'adult-ask': { const k0 = btn.dataset.kind; const id0 = btn.dataset.id; const ch0 = k0 === 'char' ? st.characters[id0] : null; adultAsk = { kind: k0, id: id0, name: btn.dataset.name || '', age: ch0 && ch0.cardAge >= 18 ? ch0.cardAge : '', msg: '' }; render(); break; }
      case 'adult-cancel': adultAsk = null; render(); break;
      case 'adult-ok': {
        const ask = adultAsk; if (!ask) break;
        const age = await adultAskAge(); if (age == null) { render(); break; }
        if (ask.kind === 'char') {
          let r = null; try { r = await E.confirmAdult(ask.id, age); } catch (e2) { r = { ok: false, code: 'error' }; }
          if (r && r.ok) { adultAsk = null; await refreshFromStore(true); await toast('ttAge.confirm.done', { name: ask.name, age: age }); }
          else { adultAsk.msg = t('ui.error.save'); render(); }
        } else if (ask.kind === 'scan') {
          const sc = scan.cands.find((x) => String(x.key) === String(ask.id));
          if (sc) { sc.minor = false; sc.age = age; sc.adult = true; sc.adultConfirmed = { age: age }; sc.track = true; }
          adultAsk = null; render();
        } else if (ask.kind === 'recog') {
          recogAdult[String(ask.id)] = age; recogSel = recogSel || {}; recogSel[String(ask.id)] = true;
          adultAsk = null; render();
        } else if (ask.kind === 'add') {
          addForm.adultConfirmed = age; addForm.msg = ''; adultAsk = null; render();
        }
        break;
      }
      case 'ai-scan': await openScan(); break;
      case 'ai-sexfill': {
        if (!c || regenBusy) break;
        const k = chKey(c); if (sexFillUi[k] && sexFillUi[k].busy) break;
        sexFillUi[k] = { busy: true }; render();
        let r = null;
        try { r = await E.refillSexHistory(k, { force: true }); } catch (e2) { r = { ok: false, err: String((e2 && e2.message) || e2) }; }
        sexFillUi[k] = r && r.ok ? (r.virgin ? { note: '资料表明她是处女，次数保持 0' } : null) : { err: (r && r.err) || '未知原因' };
        await refreshFromStore(true);
        break;
      }
      case 'ai-regen-body': case 'ai-regen-acts': {
        if (!c || regenBusy) break;
        const scope = act === 'ai-regen-acts' ? 'acts' : 'body';
        regenBusy = true; regenScope = scope; render();
        let r = null;
        try { r = await E.regeneratePage(chKey(c), scope); } catch (e2) { r = null; }
        if (r && r.sexFill) sexFillUi[chKey(c)] = r.sexFill.ok ? null : { err: r.sexFill.err || '未知原因' };
        if (r && (r.judged || []).some((x) => x.result === 'yes')) { regenBusy = false; regenScope = ''; await refreshFromStore(true); await toast('ui298.regen.preg', { name: c.name }); break; }
        regenBusy = false; regenScope = '';
        await refreshFromStore(true);
        if (r && r.ok) await toast(scope === 'acts' ? 'ui.ai.regenActsDone' : 'ui.ai.regenBodyDone'); else if (r && r.detail) await toast('ui.ai.regenFailDetail', { code: r.code || 'error', detail: r.detail }); else await toast('ui.ai.regenFail');
        break;
      }
      case 'ai-reinit': {
        if (!c) break;
        if (!(await confirmAsk(t('ui.ai.reinitConfirm', { name: c.name })))) break;
        regenBusy = true; regenScope = 'init'; render();
        let r = null;
        try { r = await E.initCharacters([chKey(c)], { force: true }); } catch (e2) { r = null; }
        if (r && r.ok) { const k1 = suKey(chKey(c), 'base'); styleUi[k1] = { busy: true }; render(); let sy = null; try { sy = await E.initStyles(chKey(c)); } catch (e3) { sy = { ok: false, err: String((e3 && e3.message) || e3) }; } styleUi[k1] = sy && sy.ok ? null : { err: (sy && sy.err) || '未知原因' }; }
        regenBusy = false; regenScope = '';
        await refreshFromStore(true);
        if (r && r.ok) await toast('ui.ai.reinitDone'); else if (r && r.code === 'minor') await toast('ttAge.initMinor'); /* [tt-port:minor-msg] */ else if (r && r.detail) await toast('ui.ai.reinitFailDetail', { code: r.code || 'error', detail: r.detail }); else await toast('ui.ai.reinitFail');
        break;
      }
      case 'rebase-start': {
        if (!c || rebase.busy) break;
        rebase.id = chKey(c); rebase.busy = true; rebase.res = null; prof.res = null; render();
        rebase.step = 0;
        try { rebase.res = await E.proposeBaseline(chKey(c), { onStep: (i, n, k) => { rebase.step = i; rebase.stepKey = k; render(); } }); } catch (e2) { rebase.res = { ok: false, code: 'error' }; }
        rebase.busy = false; render();
        break;
      }
      case 'rebase-confirm': {
        if (!rebase.res || !rebase.res.ok) break;
        const r = await E.confirmBaseline(rebase.id, rebase.res.proposal);
        const rid0 = rebase.id; rebase.res = null; rebase.id = null;
        await refreshFromStore(true);
        await toast(r && r.ok ? 'ui.rebase.done' : 'ui.error.save');
        // v3.0.5an: 生育 tiers follow the new baseline again (your own tiers stay); diff waits in 设置 · 周期与生育
        if (r && r.ok) { const c1 = st && st.characters && st.characters[rid0]; if (c1) { birthPropose(c1, null); try { E.plog('生育', { type: '按新基线重新推定', status: 'ok', text: (c1.name || '') + '：生育档位对比已就绪（设置 · 周期与生育），你设定的档位保持不变' }); } catch (e3) { /* ignore */ } } }
        break;
      }
      case 'rebase-cancel': rebase.res = null; rebase.id = null; render(); break;
      case 'kink-add': {
        if (!c) break;
        const nm = view.querySelector('[data-role=kink-new-name]'), nt = view.querySelector('[data-role=kink-new-note]');
        const name = nm ? nm.value.trim() : '';
        if (!name) { await toast('ui.kinks.needName'); break; }
        await E.kinkOp(chKey(c), 'add', { name: name, note: nt ? nt.value : '' });
        await refreshFromStore(true);
        break;
      }
      case 'kink-del': {
        const row = btn.closest('[data-kid]');
        if (c && row) { await E.kinkOp(chKey(c), 'del', { kid: row.dataset.kid }); await refreshFromStore(true); }
        break;
      }
      case 'cact-add': {
        const nm = view.querySelector('[data-role=cact-new-name]'), ds = view.querySelector('[data-role=cact-new-desc]');
        const name = nm ? nm.value.trim() : '';
        if (!name) { await toast('ui.cact.needName'); break; }
        await E.saveCustomActs(E.getCustomActs().concat([{ name: name, desc: ds ? ds.value : '' }]));
        await refreshFromStore(true); await toast('ui.cact.saved');
        break;
      }
      case 'cact-del': {
        const row = btn.closest('[data-cid]');
        if (!row) break;
        const a = E.getCustomActs().find((x) => x.id === row.dataset.cid);
        if (a && (await confirmAsk(t('ui.cact.confirmDel', { name: a.name })))) { await E.saveCustomActs(E.getCustomActs().filter((x) => x.id !== a.id)); await refreshFromStore(true); }
        break;
      }
      case 'del-char': {
        if (!c || dataBusy) break;
        if (!(await confirmAsk(t('ui.data.delCharConfirm', { name: c.name || ('#' + c.id) })))) break;
        dataBusy = true;
        let r = null; try { r = await E.deleteCharacter(chKey(c)); } catch (e2) { r = null; }
        dataBusy = false; sel = null;
        await refreshFromStore(true);
        await toast(r && r.ok ? 'ui.data.delCharDone' : 'ui.error.save', { name: c.name });
        break;
      }
      case 'clear-all': {
        if (dataBusy) break;
        if (!(await confirmAsk('确定清空全部插件数据？所有聊天的角色档案、识别结果、头像、日志和插件世界书都会被删除，无法恢复。API 配置和设置会保留。'))) break;
        dataBusy = true;
        let r = null; try { r = await E.clearAllData(); } catch (e2) { r = null; }
        dataBusy = false; sel = null; rebase.res = null;
        recogSel = null; askInit = null; recogHidden = false; initHidden = false; recogFirst.busy = false; recogFirst.done = false; recogFirst.err = ''; userOpened = false; panelLoreKick = false; logView = null;
        Object.keys(imgCache).forEach((k) => delete imgCache[k]);
        try { ['phys.page', 'phys.rec', 'phys.hd'].forEach((k) => sessionStorage.removeItem(k)); } catch (e3) { /* ignore */ }
        await refreshFromStore(true);
        await toast(r && r.ok ? 'ui.data.clearDone' : 'ui.error.save');
        break;
      }
      case 'clear-cache': {
        if (dataBusy) break;
        if (!(await confirmAsk(t(clearGlobal ? 'ui.data.clearConfirmGlobal' : 'ui.data.clearConfirm')))) break;
        dataBusy = true;
        let r = null; try { r = await E.clearCache({ global: clearGlobal }); } catch (e2) { r = null; }
        dataBusy = false; sel = null; rebase.res = null;
        recogSel = null; askInit = null; recogHidden = false; initHidden = false; recogFirst.busy = false; recogFirst.done = false; recogFirst.err = ''; userOpened = false; panelLoreKick = false; logView = null; Object.keys(imgCache).forEach((k) => delete imgCache[k]); try { ['phys.rec', 'phys.hd'].forEach((k) => sessionStorage.removeItem(k)); } catch (e4) { /* ignore */ }
        try { if (st && st.panel) st.panel.openReq = 0; } catch (e3) { /* ignore */ }
        if (clearGlobal) { apiDraft = null; injDraft = null; aiDraft = null; await loadApiDraft(); await loadInjDraft(); await loadAiDraft(); }
        clearGlobal = false;
        await refreshFromStore(true);
        await toast(r && r.ok ? 'ui.data.clearDone' : 'ui.error.save');
        break;
      }
      case 'sync-now': await doSyncNow(); break;
      case 'sync-redo': if (!(await confirmAsk(t('ui298.sync.redoConfirm')))) break; await doSyncNow({ reanalyze: true }); break;
      case 'sync-abort': { abortBusy = true; render(); try { await E.abortSync(); } catch (e2) { /* ignore */ } /* v2.9.1: stay in 中断中 until the running turn confirmed it stopped */ const until = Date.now() + 25000; for (;;) { await refreshFromStore(true); if (!E.syncBusy(st) || Date.now() > until) break; await new Promise((r) => setTimeout(r, 300)); } abortBusy = false; await refreshFromStore(true); break; }
      case 'sync-diag': syncDiag = !syncDiag; render(); break;
      case 'cal-day': { const n = Number(btn.dataset.n); calSel = calSel === n ? null : n; render(); break; }
      case 'scan-start': startScan(); break;
      case 'scan-cancel': scan.res = null; scan.cands = []; await editPanel((p) => { p.view = 'main'; }); st.panel.view = 'main'; render(); break;
      case 'scan-apply': await applyScanDraft(); break;
      case 'undo-last': await doUndo(null); break;
      case 'undo-entry': await doUndo(btn.dataset.id); break;
      case 'log-revert': await doRevertLog(btn.dataset.id); break;
      case 'cal-prev': calOff--; render(); break;
      case 'fert-sub': fertSub = ['preg', 'recov'].indexOf(btn.dataset.sub) >= 0 ? btn.dataset.sub : 'norm'; calSel = null; calOff = 0; pageAnim = ''; fertUseCache = true; render(); fertUseCache = false; break;
      case 'notice-x': if (c) { try { await E.dismissNotice(chKey(c)); } catch (e2) { /* ignore */ } await refreshFromStore(true); } break;
      case 'fert-fold': fertFold = !fertFold; render(); break;
      case 'style-lock': if (c) { let r = null; try { r = await E.lockBaseAll(chKey(c), !E.baseStyleOf(c).locked); } catch (e2) { r = null; } if (!r || !r.ok) { await toast('ui.error.save'); break; } await refreshFromStore(true); } break;
      case 'style-edit': if (c) { const w = btn.dataset.w === 'now' ? 'now' : 'base'; const y = w === 'now' ? E.styleNowOf(c) : E.baseStyleOf(c); const fp = Object.assign({}, w === 'now' ? (y.fp || E.fertParamsOf(c)) : E.fertParamsOf(c)); styleEdit = { id: chKey(c), which: w, womb: y.womb || '', gest: y.gest || '', vuln: y.vuln || '', recovery: y.recovery || '', tolerance: y.tolerance, fp: { fertility: E.fpTierOf(fp), cycleModel: fp.cycleModel || 'human', floorPct: fp.floorPct != null ? fp.floorPct : 0, ceilPct: fp.ceilPct != null ? fp.ceilPct : 100, contraceptionImmune: !!fp.contraceptionImmune } }; render(); } break;
      case 'marks-fold': { marksOpen = !(marksOpen != null ? marksOpen : ((c && c.marks) || []).length <= 3); render(); break; }
      case 'style-tol': if (styleEdit) { styleEdit.tolerance = Number(btn.dataset.v) || 3; render(); } break;
      case 'style-cancel': styleEdit = null; render(); break;
      case 'style-save': if (c && styleEdit) {
        root.querySelectorAll('[data-sfp]').forEach((el) => { styleEdit.fp[el.dataset.sfp] = el.type === 'checkbox' ? el.checked : (el.tagName === 'SELECT' ? el.value : Number(el.value)); });
        const q = (k) => String(styleEdit[k] || '').trim(); const patch = { womb: q('womb'), gest: q('gest'), vuln: q('vuln'), recovery: q('recovery'), tolerance: styleEdit.tolerance }; const w = styleEdit.which; const fpf = styleEdit.fp; styleEdit = null;
        let r = null; try { r = w === 'now' ? await E.editStyleNow(chKey(c), patch, fpf) : await E.saveBaseAll(chKey(c), patch, fpf); } catch (e2) { r = null; }
        await refreshFromStore(true); await toastText(r && r.ok ? (w === 'now' && !(r.fields || []).length ? '没有改动' : t('ui300.style.saved')) : '保存失败');
      } break;
      case 'stylenow-update': if (c && !nowBusy) { const k = suKey(chKey(c), 'now'); nowBusy = true; styleUi[k] = { busy: true }; render(); let r = null, ex = ''; try { r = await E.updateStyleNow(chKey(c)); } catch (e2) { r = null; ex = String((e2 && e2.message) || e2 || ''); } nowBusy = false;
        styleUi[k] = !r || !r.ok ? { err: (r && r.err) || ex || '未知原因' } : { note: r.changed ? '淫躯今貌已更新' : '近期没有决定性事件，保持不变' }; await refreshFromStore(true); await toastText(!r || !r.ok ? '淫躯今貌更新失败：' + styleUi[k].err : styleUi[k].note); } break;
      case 'stylenow-revert': if (c) { if (!(await confirmAsk('撤回淫躯今貌的最新一版？'))) break; let r = null; try { r = await E.revertStyleNow(chKey(c)); } catch (e2) { r = null; } await refreshFromStore(true); await toastText(r && r.ok ? '已撤回' : '撤回失败'); } break;
      case 'style-regen': if (c) { const k = suKey(chKey(c), 'base'); if (styleUi[k] && styleUi[k].busy) break; if (!(await confirmAsk(t('ui300.style.regenConfirm')))) break; styleUi[k] = { busy: true }; render(); let r = null, ex = ''; try { r = await E.regenStyle(chKey(c)); } catch (e2) { r = null; ex = String((e2 && e2.message) || e2 || ''); }
        styleUi[k] = r && r.ok ? { note: t('ui300.style.regenDone') } : { err: (r && r.err) || ex || '未知原因' }; await refreshFromStore(true); await toastText(r && r.ok ? t('ui300.style.regenDone') : '淫体本色生成失败：' + styleUi[k].err); } break;
      case 'cj-toggle': cjOpen = !cjOpen; render(); break;
      case 'cal-mode': calMode = btn.dataset.mode; calSel = null; render(); break;
      case 'act-del': {
        if (!c) break; const k = btn.dataset.key; const lb = E.actLabel ? E.actLabel(k) : k;
        if (!(await confirmAsk(t('ui296.act.confirm', { name: c.name, act: lb })))) break;
        try { await E.hideAct(chKey(c), k); } catch (e2) { await toast('ui.error.save'); break; }
        await refreshFromStore(true); await toast('ui296.act.done', { act: lb }); break;
      }
      case 'act-restore': { if (!c) break; try { await E.restoreAct(chKey(c), btn.dataset.key); } catch (e2) { await toast('ui.error.save'); break; } await refreshFromStore(true); break; }
      case 'ros-freeze': {
        const id = btn.dataset.id; const x = st.characters[id] || chars().find((y) => chKey(y) === id); if (!x) break;
        try { await E.setFrozen(id, !x.frozen); } catch (e2) { await toast('ui.error.save'); break; }
        await refreshFromStore(true); await toast(x.frozen ? 'ui296.ros.resumed' : 'ui296.ros.stoppedT', { name: x.name }); break;
      }
      case 'ros-del': {
        const id = btn.dataset.id; const x = st.characters[id] || chars().find((y) => chKey(y) === id); if (!x || dataBusy) break;
        if (!(await confirmAsk(t('ui296.ros.delConfirm', { name: x.name })))) break;
        dataBusy = true; let r = null; try { r = await E.purgeCharacter(id, { name: x.name }); } catch (e2) { r = null; } dataBusy = false;
        if (sel === id) sel = null;
        await refreshFromStore(true); await toast(r && r.ok ? 'ui296.ros.delDone' : 'ui.error.save', { name: x.name }); break;
      }
      case 'cal-next': calOff++; render(); break;
      case 'cal-today': calOff = 0; render(); break;
      case 'date-apply': {
        const v = dateDraft || (st.story && st.story.date);
        if (!E.validIso(v)) { await toast('ui.story.bad'); break; }
        const r = await E.setStoryDate(v, dateShift);
        dateDraft = null; calOff = 0;
        await refreshFromStore(true);
        await toast(r && r.ok ? 'ui.story.set_ok' : 'ui.story.bad', { n: r && r.n ? r.n : 0 });
        break;
      }
      case 'date-step': {
        const base = dateDraft || (st.story && st.story.date);
        if (E.validIso(base)) { dateDraft = E.addDays(base, Number(btn.dataset.n) || 0); render(); }
        break;
      }
      case 'inj-detail': if (injDraft) { injDraft.detail = btn.dataset.v; await saveInjDraft(); } break;
      case 'inj-position': if (injDraft) { injDraft.position = btn.dataset.v; await saveInjDraft(); } break;
      case 'add-open': addForm.open = true; addForm.msg = ''; render(); break;
      case 'add-close': addForm.open = false; addForm.msg = ''; render(); break;
      case 'add-go': case 'sug-add': {
        const nm = btn.dataset.act === 'sug-add' ? btn.dataset.name : addForm.name;
        const sg = (st.suggest || []).find((x) => x.name === nm);
        const ds = btn.dataset.act === 'sug-add' ? ((sg && sg.desc) || '') : addForm.desc;
        if (!String(nm || '').trim()) { addForm.msg = t('ui7.add.needName'); render(); break; }
        addForm.busy = true; addForm.msg = t('ui7.add.busy'); render();
        let r = null; try { r = await E.addTracked(nm, ds, addForm.adultConfirmed ? { adultConfirmed: { age: addForm.adultConfirmed } } : undefined); } catch (e2) { r = { ok: false, code: 'error' }; } /* [tt-port:age-ui] */
        addForm.busy = false;
        if (r && r.ok) { addForm = { open: false, name: '', desc: '', busy: false, msg: t('ui7.add.ok', { name: nm }) }; sel = r.id; adultAsk = null; } /* [tt-port:age-ui] */
        else { addForm.msg = t('ui7.add.err.' + ((r && r.code) === 'minor' ? 'minor' : 'error')); addForm.minorHit = (r && r.code) === 'minor'; } /* [tt-port:age-ui] */
        await refreshFromStore(true); break;
      }
      case 'sug-dismiss': try { await E.dismissSuggest(btn.dataset.name); } catch (e2) { /* ignore */ } await refreshFromStore(true); break;
      case 'detect-now': {
        addForm.busy = true; addForm.msg = t('ui7.detect.busy'); render();
        let r = null; try { r = await E.detectNewCharacters({ force: true }); } catch (e2) { r = null; }
        addForm.busy = false; addForm.msg = r && r.ok ? t('ui7.detect.done', { n: (r.found || []).length }) : t('ui7.detect.fail');
        await refreshFromStore(true); break;
      }
      case 'body-endsess': if (c) { await E.endSession(chKey(c)); await refreshFromStore(true); } break;
      case 'body-edit': if (c) { bodyEdit = Object.assign({ id: chKey(c), k: 'now', semen: 'none' }, c.bodyNow || {}); render(); } break;
      case 'body-semen': if (bodyEdit) { bodyEdit.semen = btn.dataset.v; render(); } break;
      case 'body-save': if (c && bodyEdit) { const b = bodyEdit; bodyEdit = null; try { await E.setBodyNow(chKey(c), { afterglow: b.afterglow || '', semen: b.semen, semenWhere: b.semenWhere || '', soreness: b.soreness || '', fatigue: b.fatigue || '' }); } catch (e2) { await toast('ui.error.save'); } await refreshFromStore(true); } break;
      case 'body-clear': if (c) { bodyEdit = null; await E.setBodyNow(chKey(c), null); await refreshFromStore(true); } break;
      case 'body-cancel': bodyEdit = null; render(); break;
      case 'mark-new': if (c) { bodyEdit = { id: chKey(c), k: 'mark', type: 'hickey', where: '', days: 3 }; render(); } break;
      case 'mark-type': if (bodyEdit) { bodyEdit.type = btn.dataset.v; render(); } break;
      case 'mark-add': if (c && bodyEdit) { const b = bodyEdit; if (!String(b.where || '').trim()) { await toast('ui7.body.needWhere'); break; } bodyEdit = null; await E.markOp(chKey(c), 'add', { type: b.type, where: b.where, days: E.int(b.days, 3) }); await refreshFromStore(true); } break;
      case 'mark-del': if (c) { await E.markOp(chKey(c), 'del', { mid: btn.dataset.mid }); await refreshFromStore(true); } break;
      case 'mark-days': if (c) { const m = (c.marks || []).find((x) => x.id === btn.dataset.mid); if (m) { await E.markOp(chKey(c), 'days', { mid: m.id, days: m.days + E.int(btn.dataset.d, 0) }); await refreshFromStore(true); } } break;
      case 'last-edit': if (c) { bodyEdit = { id: chKey(c), k: 'last', note: (c.lastSex && c.lastSex.note) || E.lastSexText(c) }; render(); } break;
      case 'last-save': if (c && bodyEdit) { const n = bodyEdit.note; bodyEdit = null; await E.setLastSex(chKey(c), n); await refreshFromStore(true); } break;
      case 'adv-toggle': e.preventDefault(); advOpen = !advOpen; render(); break;
      case 'inj-mode': if (injDraft) { injDraft.mode = btn.dataset.v === 'prefix' ? 'prefix' : 'lore'; injPv.open = false; await saveInjDraft(); } break;
      case 'inj-strategy': if (injDraft) { injDraft.strategy = btn.dataset.v; await saveInjDraft(); } break;
      case 'inj-preview2': await runInjPreview(); break;
      case 'rc-ok': {
        // v2.7.7: read the ticks straight from the list (fixes 4 shown / 2 tracked when the list grew after first render)
        const keep = []; root.querySelectorAll('[data-rc]').forEach((el) => { if (el.checked) keep.push(el.dataset.rc); });
        recogSel = null;
        let r = null;
        try { r = await E.confirmRecognized(keep, { init: false, adultConfirmed: Object.assign({}, recogAdult) }); } catch (e2) { /* ignore */ } /* [tt-port:age-ui] */
        if (r && r.ids && r.ids.length) askInit = { ids: r.ids.slice() }; // v3.0.5pop: lock 是否初始化 before refresh can flash a track list
        await refreshFromStore(true);
        if (page === 'settings' || !page) page = 'roster';
        if (!askInit && st.askPending && st.askPending.ids && st.askPending.ids.length) askInit = { ids: st.askPending.ids.slice() };
        render();
        break;
      }
      case 'ask-ok': { const ids = askInit ? askInit.ids : []; askInit = null; st.askPending = null; await E.startInitBatch(ids); await refreshFromStore(true); kickInit({}); break; }
      case 'ask-no': askInit = null; st.askPending = null; try { await E.clearAsk(); } catch (e2) { /* ignore */ } await refreshFromStore(true); break;
      case 'rc-hide': recogHidden = true; render(); break;
      case 'rc-show': recogHidden = false; render(); break;
      case 'init-hide': initHidden = true; render(); break;
      case 'init-show': initHidden = false; render(); break;
      case 'init-del': if (!(await confirmAsk(t('ui13.delConfirm')))) break; await E.cancelInit(); initHidden = false; await refreshFromStore(true); render(); break;
      case 'log-filter': logErrOnly = !logErrOnly; await loadLogView(); render(); break;
      case 'log-refresh': await loadLogView(); render(); break;
      case 'log-copy': { const txt = await E.logText({ errorsOnly: logErrOnly }); let ok = false; try { await navigator.clipboard.writeText(txt); ok = true; } catch (e2) { try { const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); ok = document.execCommand('copy'); ta.remove(); } catch (e3) { ok = false; } } await toast(ok ? 'ui13.log.copied' : 'ui13.log.copyFail'); break; }
      case 'log-clear': if (!(await confirmAsk(t('ui13.log.clearConfirm')))) break; await E.clearLog(); await loadLogView(); render(); break;
      case 'rc-later': recogSel = null; await E.dismissRecognized(); await refreshFromStore(true); break;
      case 'rf-retry': recogSel = null; recogHidden = false; userOpened = true; panelLoreKick = false; loreKick(); recogFirst.done = false; recogFirst.err = ''; startRecogFirst(); break;
      case 'prec-open': // v3.0.27: name field is inline; this only scrolls focus / toasts if held
        if (askInit || (st.askPending && st.askPending.ids && st.askPending.ids.length)) { await toastScanHold('ask'); break; }
        if (initJobRunning()) { await toastScanHold('init'); break; }
        prec.err = null; render();
        try { const ta = view.querySelector('[data-prec=names]'); if (ta) ta.focus({ preventScroll: false }); } catch (e2) { /* ignore */ }
        break;
      case 'prec-close': prec.open = false; prec.err = null; render(); break;
      case 'prec-src': { const k = btn.dataset.src; prec.src[k] = !prec.src[k]; render(); break; }
      case 'prec-go': await startPrecise(); break;
      case 'reset-update': { let r = null; try { r = await E.resetUpdateState({ reason: '设置 · 重置更新状态' }); } catch (e2) { r = null; } await toastText(r && r.ok ? '已重置更新状态（' + r.cleared.length + ' 项）' : '重置失败'); await refreshFromStore(true); break; }
      case 'persona-off': await E.setFrozen(btn.dataset.id, true); await refreshFromStore(true); await toastText('已停止追踪 {{user}}'); break;
      case 'add-persona': { let r = null; try { r = await E.addPersona(); } catch (e2) { r = { ok: false, code: String((e2 && e2.message) || e2) }; } await toastText(r && r.ok ? '已加入追踪：' + (r.name || '{{user}}') : (r && r.code === 'nopersona' ? '当前聊天没有设置人设（{{user}}）' : (r && r.code === 'minor' ? '人设不是成年人，不能追踪' : '添加失败'))); await refreshFromStore(true); break; }
      case 'fscan': if (btn.dataset.src) { if (aiDraft && btn.dataset.src === 'chat') { aiDraft.focusScanMsgs = E.clamp(E.int(aiDraft.focusScanMsgs, 60), 4, 200); await saveAiDraft(); } await startFocusScan(btn.dataset.src); } break;
      case 'turn-toggle': { const id = btn.dataset.id, m = btn.dataset.msg; const map = turnSkipLocal[m] = turnSkipLocal[m] || {}; map[id] = !map[id]; render(); try { await E.setTurnSkip(id, map[id], m); } catch (e2) { /* ignore */ } break; }
      case 'turn-hide': turnHidden = true; render(); break;
      case 'fs-retry': await startFocusScan(fscan.src); break;
      case 'fs-close': fscan.err = null; render(); break;
      case 'rf-rough': { await E.useRoughResults(); fscan.err = null; recogFirst.err = ''; recogFirst.aiErr = null; recogSel = null; await refreshFromStore(true); break; }
      case 'aierr-toggle': aiErrOpen = !aiErrOpen; render(); break;
      case 'aierr-dismiss': await E.dismissAiErr(); lastAiErr = null; aiErrOpen = false; render(); break;
      case 'aierr-retry': { const stp = String((lastAiErr && lastAiErr.step) || ''); const rt = (lastAiErr && lastAiErr.retry) || null; aiErrOpen = false;
        // v3.0.11: 重试 re-runs the step that failed (重新生成本页 / 周期 / 生育史重新初始化), never a 同步 of the last floor
        if (rt && rt.kind === 'regen' && rt.id) { if (regenBusy) break; regenBusy = true; regenScope = rt.scope === 'acts' ? 'acts' : 'body'; render(); let r = null; try { r = await E.regeneratePage(rt.id, regenScope); } catch (e2) { r = null; } const sc = regenScope; regenBusy = false; regenScope = ''; if (r && r.ok) lastAiErr = null; await refreshFromStore(true); if (r && r.ok) await toast(sc === 'acts' ? 'ui.ai.regenActsDone' : 'ui.ai.regenBodyDone'); else await toast('ui.ai.regenFail'); break; }
        if (rt && rt.kind === 'cycle' && rt.id) { if (cycRe.busy || rebase.busy) break; const man = cycRe.id === rt.id ? cycRe.manual : null; cycRe.id = rt.id; cycRe.busy = true; cycRe.res = null; cycRe.manual = man || null; render(); try { cycRe.res = await E.proposeCycle(rt.id, man ? { manual: man } : {}); } catch (e2) { cycRe.res = { ok: false, code: 'error', detail: String((e2 && e2.message) || '') }; } cycRe.busy = false; if (cycRe.res && cycRe.res.ok) lastAiErr = null; render(); break; }
        if (rt && rt.kind === 'hist' && rt.id) { if (histRe.busy || rebase.busy) break; const man = histRe.id === rt.id ? histRe.manual : null; histRe.id = rt.id; histRe.busy = true; histRe.res = null; histRe.manual = man || null; render(); try { histRe.res = await E.proposeHist(rt.id, man ? { manual: man } : {}); } catch (e2) { histRe.res = { ok: false, code: 'error', detail: String((e2 && e2.message) || '') }; } histRe.busy = false; if (histRe.res && histRe.res.ok) lastAiErr = null; render(); break; }
        if (/识别/.test(stp)) { recogSel = null; recogHidden = false; recogFirst.done = false; recogFirst.err = ''; startRecogFirst(); } else if (/初始化/.test(stp) && !rt && st.initJob) { kickInit({ retry: true }); } else { await doSyncNow(); } break; }
      case 'rf-skip': await E.skipRoster(); await refreshFromStore(true); page = 'roster'; render(); break;
      case 'ros-init': {
        const id = btn.dataset.id; const x = st.characters[id] || chars().find((y) => chKey(y) === id);
        if (!x) break;
        if (!(await confirmAsk(t('ui11.ros.confirm', { name: x.name }) + '\n\n' + t('ui11.rc.risk')))) break;
        try { await E.reinitCharacter(id); } catch (e2) { await toast('ui.error.save'); break; }
        await refreshFromStore(true);
        kickInit({});
        break;
      }
      case 'init-abort': await E.abortInit(); await refreshFromStore(true); render(); break;
      case 'init-retry': kickInit({ retry: true, force: true }); break;
      case 'init-resume': kickInit({ resume: true }); break;
      case 'lore-rescan': {
        if (diagBusy) break;
        if (anyRecogCard()) { await toastText('请先处理当前确认窗口'); break; } // v3.0.5: no stacked dialogs from 世界书
        diagBusy = true; render();
        let n = 0;
        try { const r = await E.scanCharacters({ queueInit: false }); n = E.trackedList(r.state).length; await E.ensureLoreReady({ recognize: false }); } catch (e2) { /* shown by diagnostics */ }
        diagBusy = false;
        await toast('ui10.diag.rescanned', { n: n });
        await refreshFromStore(true); render();
        break;
      }
      case 'lore-diag': {
        if (diagBusy) break;
        diagBusy = true; render();
        let r; try { r = await E.loreDiagnose(); } catch (e2) { r = { ok: false, err: String(e2), steps: [] }; }
        const d = new Date(); r.at = d.toLocaleString();
        diagRes = r; diagBusy = false;
        await refreshFromStore(true); render();
        break;
      }
      case 'inj-rebuild': {
        if (anyRecogCard()) { await toastText('请先处理当前确认窗口'); break; } // v3.0.5
        loreBusy = true; render();
        let r; try { r = await E.rebuildLore(); } catch (e2) { r = { ok: false, err: String(e2) }; }
        loreBusy = false;
        await toast(r && r.ok ? 'ui6.lore.rebuilt' : 'ui6.lore.rebuildFail', { err: (r && r.err) || '' });
        await refreshFromStore(true);
        break;
      }
      case 'corr-regen': {
        const c = current(); if (!c) break;
        corrBusy = chKey(c); render();
        let r; try { r = await E.genCorruption(chKey(c), { force: true }); } catch (e2) { r = { ok: false, code: 'error' }; }
        corrBusy = null;
        if (!r.ok) await toast('ui6.corr.fail', { code: r.code || 'error' });
        await refreshFromStore(true);
        break;
      }
      case 'inj-reset': if (injDraft) { injDraft.template = t('settings.injectTemplate.default'); await saveInjDraft(); } break;
      case 'view': {
        if (btn.dataset.view === 'settings') { await setPage('settings'); break; }
        await editPanel((p) => { p.view = 'main'; }); render(); break;
      }
      case 'page': await setPage(btn.dataset.page); break;
      case 'char-menu': await setPage('roster'); break;
      case 'hd-toggle': setHd(!hdCollapsed); break;
      case 'sit-toggle': { sitOpen = !sitOpen; btn.classList.toggle('open', sitOpen); break; }
      case 'doss-tab': dossTab = btn.dataset.tab; dossEdit = null; render(); break;
      case 'doss-edit': if (c) { const src = dossTab === 'base' ? (c.profile || {}) : E.currentOf(c, E.config()); dossEdit = { id: chKey(c), which: dossTab, d: JSON.parse(JSON.stringify(src || {})) }; render(); } break;
      case 'doss-cancel': dossEdit = null; render(); break;
      case 'df-kid-add': if (dossEdit) { readDossForm(); dossEdit.d.offspring.push({ name: '', age: '', gender: '', note: '' }); render(); } break;
      case 'df-kid-del': if (dossEdit) { readDossForm(); dossEdit.d.offspring.splice(+btn.dataset.i, 1); render(); } break;
      case 'doss-save': {
        if (!dossEdit || !c) break;
        const d = readDossForm();
        let r = await E.editDossier(dossEdit.id, dossEdit.which === 'base' ? 'base' : 'current', d);
        /* [tt-port:age-ui] */
        // 已确认成年的角色被改成 <18：二次确认后取消确认并停止建档
        if (r && r.code === 'minorConfirmed' && (await confirmAsk(t('ttAge.revoke.dialog', { name: c.name || '', age: r.age })))) r = await E.editDossier(dossEdit.id, dossEdit.which === 'base' ? 'base' : 'current', Object.assign({}, d, { revokeAdult: true }));
        if (r && r.ok && r.revoked) { dossEdit = null; await refreshFromStore(true); await toast('ttAge.revoke.done', { name: c.name || '' }); }
        else if (r && r.ok) { dossEdit = null; await refreshFromStore(true); await toast('ui5.saved'); }
        else if (r && r.code === 'minorConfirmed') { /* 用户取消 */ }
        else await toast(r && r.code === 'minor' ? 'ttAge.minor.save' : 'ui.error.save', r && r.age != null ? { age: r.age } : undefined);
        break;
      }
      case 'loc-edit': if (c) { locEdit = true; render(); } break;
      case 'loc-save': await saveLoc(); break;
      case 'rec-toggle': recOpen = !recOpen; try { sessionStorage.setItem('phys.rec', recOpen ? '1' : '0'); } catch (e2) { /* ignore */ } render(); break;
      case 'go-kinks': sOpen.kinks = true; await setPage('settings'); break;
      case 'tech-merge': {
        if (!c || busyTech) break; busyTech = true; btn.disabled = true; btn.textContent = t('ui301.tech.merging');
        let r = null; try { r = await E.consolidateTech(c.id, btn.dataset.key); } catch (e2) { r = null; }
        busyTech = false; await refreshFromStore(true);
        await toast(r && r.ok ? (r.src === 'ai' ? 'ui301.tech.done' : 'ui301.tech.local') : 'ui301.tech.fail');
        break;
      }
      case 'cal-close': calSel = null; render(); break;
      case 'prof-sync': case 'prof-update': {
        if (!c || prof.busy || rebase.busy) break;
        const mode = act === 'prof-update' ? 'all' : 'sync';
        prof.id = chKey(c); prof.busy = true; prof.mode = mode; prof.res = null; rebase.res = null; render();
        try { prof.res = await E.proposeProfile(chKey(c), mode); } catch (e2) { prof.res = { ok: false, code: 'error', detail: String((e2 && e2.message) || '') }; }
        prof.busy = false; render();
        break;
      }
      case 'prof-confirm': {
        if (!prof.res || !prof.res.ok) break;
        const r = await E.confirmProfile(prof.res.id, prof.res.mode, prof.res.next, prof.res.kinksAdd);
        prof.res = null; prof.id = null;
        await refreshFromStore(true);
        await toast(r && r.ok ? 'ui2.prof.done' : 'ui.error.save');
        break;
      }
      case 'prof-cancel': prof.res = null; prof.id = null; render(); break;
      case 'sopen': { const k = btn.dataset.sec; sOpen[k] = !sOpen[k]; render(); break; }
      case 'reset-pos': await editPanel((p) => { p.x = null; p.y = null; p.lx = null; p.ly = null; }); applyLayout(); break;
      case 'select': rosCenter = true; sel = btn.dataset.id; dossEdit = null; bodyEdit = null; charMenu = false; locEdit = false; calSel = null; prof.res = null; render(); break;
      case 'toggle': {
        const pf = { cal: 'calOpen', log: 'logOpen' }[btn.dataset.sec];
        if (pf) { await editPanel((p) => { p[pf] = !p[pf]; }); render(); break; }
        const f = { fertility: 'fertilityOpen', sex: 'sexOpen', offspring: 'offspringOpen' }[btn.dataset.sec];
        if (f && c) await edit((ch) => { ch.ui[f] = !ch.ui[f]; });
        break;
      }
      case 'inc': case 'dec': {
        const path = btn.dataset.path;
        if (!c || !pathLim(path)) break;
        const delta = act === 'inc' ? 1 : -1;
        if (stagedPath(path)) {
          if (/^fertility\./.test(path)) stageHist(c, (ch) => setPath(ch, path, getPath(ch, path) + delta));
          else stageCyc(c, (ch) => setPath(ch, path, getPath(ch, path) + delta));
          break;
        }
        await edit((ch) => setPath(ch, path, getPath(ch, path) + delta));
        break;
      }
      case 'cyc-setday': { const n = +btn.dataset.n; if (c && n >= 1) stageCyc(c, (ch) => { ch.cycle.day = E.clamp(n, 1, ch.cycle.length); ch.cycle.manual = true; }); break; }
      case 'carddiag-open': cardDiagOpen = !cardDiagOpen; render(); break;
      case 'carddiag-probe': {
        if (cardProbeBusy) break;
        const pid = btn.dataset.id; cardProbeBusy = pid; render();
        try { const r = await E.probeCard(pid); cardProbe[pid] = r.diag || { err: true, src: r.err || '—', len: 0 }; } catch (e2) { cardProbe[pid] = { err: true, src: String(e2), len: 0 }; }
        cardProbeBusy = ''; render(); break;
      }
      case 'diag-open': diagOpen = !diagOpen; try { localStorage.setItem('phys.diagOpen', diagOpen ? '1' : '0'); } catch (e2) { /* ignore */ } render(); break;
      case 'cyc-discard': cycDraft = null; render(); break;
      case 'cyc-apply': {
        // v3.0.6: cycle-only apply — never touches fertility / birth tiers / 生育史
        if (!c || !cycDraft || cycDraft.id !== chKey(c) || cycRe.busy || rebase.busy) break;
        if (!cycChanges(c).length) { cycDraft = null; render(); break; }
        const pick = (d, cur) => { const o = {}; Object.keys(d || {}).forEach((k) => { if (JSON.stringify(d[k]) !== JSON.stringify(cur ? cur[k] : undefined)) o[k] = d[k]; }); return o; };
        const man = { cycle: pick(cycDraft.cycle, c.cycle) };
        cycRe.id = chKey(c); cycRe.busy = true; cycRe.res = null; cycRe.manual = man; render();
        try { cycRe.res = await E.proposeCycle(chKey(c), { manual: man }); } catch (e2) { cycRe.res = { ok: false, code: 'error', detail: String((e2 && e2.message) || '') }; }
        cycRe.busy = false; render();
        break;
      }
      case 'cyc-apply-raw': {
        if (!c || !cycDraft || cycDraft.id !== chKey(c)) break;
        const chg = cycChanges(c); const d = cycDraft;
        if (!chg.length) { cycDraft = null; render(); break; }
        cycDraft = null; cycRe.res = null; cycRe.id = null; cycRe.manual = null;
        await edit((ch) => { ch.from = ch.from || {}; Object.keys(d.cycle || {}).forEach((k) => { if (JSON.stringify(ch.cycle[k]) !== JSON.stringify(d.cycle[k])) ch.from[k] = 'user'; }); Object.assign(ch.cycle, d.cycle); });
        try { E.plog('周期', { type: '手动修改周期', status: 'ok', text: (c.name || '') + '：' + chg.join('；') }); } catch (e2) { /* ignore */ }
        await toast('ui.cycle.applied');
        break;
      }
      case 'new-cycle': if (page === 'settings') { stageCyc(c, (ch) => { ch.cycle.day = 1; ch.cycle.manual = true; }); break; }
        await edit((ch) => { ch.cycle.day = 1; ch.cycle.manual = true; }); break;
      case 'reinit': {
        // v3.0.5k: was wired to doRescan (a full character re-scan); now rebuilds only her cycle from card + worldbook
        if (!c || cycRe.busy || rebase.busy) break;
        cycRe.id = chKey(c); cycRe.busy = true; cycRe.res = null; cycRe.manual = null; render();
        try { cycRe.res = await E.proposeCycle(chKey(c), {}); } catch (e2) { cycRe.res = { ok: false, code: 'error', detail: String((e2 && e2.message) || '') }; }
        cycRe.busy = false; render();
        break;
      }
      case 'cyc-confirm': {
        if (!cycRe.res || !cycRe.res.ok) break;
        let r = null; try { r = await E.confirmCycle(cycRe.res.id, cycRe.res.proposal, cycRe.manual || null); } catch (e2) { r = null; }
        const wasManual = !!cycRe.manual;
        if (r && r.ok) { if (cycRe.manual) cycDraft = null; cycRe.res = null; cycRe.id = null; cycRe.manual = null; if (wasManual && c) { await refreshFromStore(true); runPolish(c); } } else cycRe.res = { ok: false, code: (r && r.code) || 'error', detail: '' };
        await refreshFromStore(true);
        await toast(r && r.ok ? 'ui.cycle.reinitDone' : 'ui.error.save');
        break;
      }
      case 'bt-set': { if (!c) break; const k = btn.dataset.k, v = btn.dataset.v; if (!birthDraft || birthDraft.id !== chKey(c)) birthDraft = { id: chKey(c), tiers: {} }; birthDraft.tiers[k] = v; if (!birthChanges(c).length) birthDraft = null; render(); break; }
      case 'bt-discard': birthDraft = null; if (birthRe.staged) { birthRe.res = null; birthRe.id = null; birthRe.staged = null; } render(); break;
      case 'bt-apply': { if (!c || !birthDraft || birthDraft.id !== chKey(c) || birthRe.busy) break; const b0 = E.birthOf(c); const stg = {}; Object.keys(birthDraft.tiers).forEach((k) => { if (birthDraft.tiers[k] !== b0.tiers[k]) stg[k] = birthDraft.tiers[k]; }); await birthPropose(c, stg); break; }
      case 'bt-reinit': { if (!c || birthRe.busy) break; await birthPropose(c, null); break; }
      case 'bt-confirm': {
        if (!birthRe.res || !birthRe.res.ok) break;
        let r = null; try { r = await E.confirmBirth(birthRe.res.id, birthRe.res.proposal); } catch (e2) { r = null; }
        if (r && r.ok) { if (birthRe.staged) birthDraft = null; birthRe.res = null; birthRe.id = null; birthRe.staged = null; } else birthRe.res = { ok: false, code: (r && r.code) || 'error', err: '保存失败' };
        await refreshFromStore(true);
        await toast(r && r.ok ? 'ui.birth.done' : 'ui.error.save');
        break;
      }
      case 'bt-cancel': birthRe.res = null; birthRe.id = null; birthRe.staged = null; render(); break;
      case 'cyc-cancel': cycRe.res = null; cycRe.id = null; cycRe.manual = null; render(); break;
      case 'hist-discard': histDraft = null; render(); break;
      case 'hist-reinit': {
        if (!c || histRe.busy || rebase.busy) break;
        histRe.id = chKey(c); histRe.busy = true; histRe.res = null; histRe.manual = null; render();
        try { histRe.res = await E.proposeHist(chKey(c), {}); } catch (e2) { histRe.res = { ok: false, code: 'error', detail: String((e2 && e2.message) || '') }; }
        histRe.busy = false; render(); break;
      }
      case 'hist-apply': {
        if (!c || !histDraft || histDraft.id !== chKey(c) || histRe.busy || rebase.busy) break;
        if (!histChanges(c).length) { histDraft = null; render(); break; }
        const pick = (d, cur) => { const o = {}; Object.keys(d || {}).forEach((k) => { if (JSON.stringify(d[k]) !== JSON.stringify(cur ? cur[k] : undefined)) o[k] = d[k]; }); return o; };
        const man = { fert: pick(histDraft.fert, c.fertility) };
        histRe.id = chKey(c); histRe.busy = true; histRe.res = null; histRe.manual = man; render();
        try { histRe.res = await E.proposeHist(chKey(c), { manual: man }); } catch (e2) { histRe.res = { ok: false, code: 'error', detail: String((e2 && e2.message) || '') }; }
        histRe.busy = false; render(); break;
      }
      case 'hist-apply-raw': {
        if (!c || !histDraft || histDraft.id !== chKey(c)) break;
        const chg = histChanges(c); const d = histDraft;
        if (!chg.length) { histDraft = null; render(); break; }
        histDraft = null; histRe.res = null; histRe.id = null; histRe.manual = null;
        await edit((ch) => {
          ch.from = ch.from || {};
          HIST_KEYS.forEach((k) => { if (d.fert[k] !== ch.fertility[k]) ch.from[k] = 'user'; ch.fertility[k] = d.fert[k]; });
          ch.fertility.birthCount = E.birthFloor(ch.fertility.birthCount, (ch.fertility.offspring || []).length);
          ch.fertility.pregnancyCount = Math.max(ch.fertility.pregnancyCount, ch.fertility.birthCount);
        });
        try { E.plog('生育史', { type: '手动修改生育史', status: 'ok', text: (c.name || '') + '：' + chg.join('；') }); } catch (e2) { /* ignore */ }
        await toast('ui.cycle.applied'); break;
      }
      case 'hist-confirm': {
        if (!histRe.res || !histRe.res.ok) break;
        let r = null; try { r = await E.confirmHist(histRe.res.id, histRe.res.proposal, histRe.manual || null); } catch (e2) { r = null; }
        if (r && r.ok) { if (histRe.manual) histDraft = null; histRe.res = null; histRe.id = null; histRe.manual = null; } else histRe.res = { ok: false, code: (r && r.code) || 'error', detail: '' };
        await refreshFromStore(true);
        await toast(r && r.ok ? 'ui.cycle.reinitDone' : 'ui.error.save');
        break;
      }
      case 'hist-cancel': histRe.res = null; histRe.id = null; histRe.manual = null; render(); break;
      case 'record-birth': if (c && (await confirmAsk(t('ui.confirm.birth', { name: c.name })))) {
        await edit((ch) => {
          ch.fertility.birthCount += 1; ch.fertility.pregnancyCount = Math.max(ch.fertility.pregnancyCount, ch.fertility.birthCount);
          ch.fertility.pregnant = false; ch.fertility.pregnancyDay = 0; ch.cycle.day = 1; ch.cycle.manual = true;
          ch.fertility.offspring.push(blankKid());
        });
      } break;
      case 'hist-recount': if (c) { const r = await E.recountHist(sel); await refreshFromStore(true); await toastText(r.changed ? '已修正：' + r.text : '生育史已与记录一致'); } break;
      case 'pol-ok': { if (!polish.res || !polish.res.ok) break; polish.busy = true; render(); let r = null; try { r = await E.confirmPolish(polish.res.id, polish.res.texts); } catch (e2) { r = null; } polish.busy = false; polish.res = null; if (!(r && r.ok)) { try { await E.markPolishPending(polish.id, '润色写入失败'); } catch (e3) { /* ignore */ } } polish.id = null; await refreshFromStore(true); await toast(r && r.ok ? 'ui.cycle.reinitDone' : 'ui.error.save'); break; }
      case 'pol-skip': { const id0 = polish.id; polish.res = null; polish.id = null; try { await E.markPolishPending(id0, '你选择暂不润色'); } catch (e2) { /* ignore */ } await refreshFromStore(true); break; }
      case 'pol-retry': { if (!c) break; await runPolish(c); break; }
      case 'off-add': await edit((ch) => { ch.fertility.offspring.push(blankKid()); }); break;
      case 'off-del': {
        const row = btn.closest('[data-uid]');
        const uid = row && row.dataset.uid;
        if (uid) await edit((ch) => { ch.fertility.offspring = ch.fertility.offspring.filter((o) => o.uid !== uid); });
        break;
      }
      case 'pick-img': try { fileInput.click(); } catch (_) { await importViaTavo(); } break;
      case 'import-img': await importViaTavo(); break;
      case 'img-default': if (c && c.portrait.path) {
        let old = null;
        await edit((ch) => { old = ch.portrait.path; ch.portrait.path = null; });
        if (old) { try { await tavo.file.delete(old); } catch (_) { /* ignore */ } }
      } break;
      case 'api-save': await saveApiDraft(); break;
      case 'api-use-main': if (apiDraft) { apiDraft.enabled = false; await saveApiDraft(); } break;
      case 'api-clear': await saveApiDraft({ clearKey: true }); break;
      case 'api-test': await testApiDraft(); break;
      case 'api-models': await fetchModelsDraft(); break;
      case 'models-toggle': modelPick.open = !modelPick.open; render(); break;
      case 'model-pick': if (apiDraft) { apiDraft.model = btn.dataset.model || ''; modelPick.open = false; render(); } break;
      case 'api-eye': if (apiDraft) { apiDraft.showKey = !apiDraft.showKey; render(); } break;
      default: break;
    }
  }
  async function onChange(e) {
    fertCache = {};
    const el = e.target;
    if (!el || !root.contains(el)) return;
    if (el.dataset && el.dataset.lite) { liteOn = !!el.checked; try { localStorage.setItem('phys.lite', liteOn ? '1' : '0'); } catch (e2) { /* ignore */ } root.classList.toggle('phys-lite', liteOn); return; }
    if (el === fileInput) { await onFilePicked(); return; }
    if (el.dataset.api === 'enabled' && apiDraft) { apiDraft.enabled = el.checked; await saveApiDraft(); return; }
    if (el.dataset.story === 'date') { dateDraft = E.validIso(el.value) || null; render(); return; }
    if (el.dataset.story === 'dtext') {
      const iso = E.parseStory(el.value);
      if (!iso) { await toast('ui.story.bad'); return; }
      dateDraft = iso; render(); return;
    }
    if (el.dataset.cal) {
      try {
        const cur = (st.story && st.story.cal) || E.normCal(null);
        const nx = { enabled: cur.enabled, era: cur.era, offset: cur.offset, months: cur.months, fmt: cur.fmt };
        const f = el.dataset.cal;
        if (f === 'enabled') nx.enabled = el.checked;
        else if (f === 'year') { const gy = st.story && st.story.date ? +st.story.date.slice(0, 4) : new Date().getFullYear(); const v = Math.round(Number(el.value)); if (Number.isFinite(v)) nx.offset = v - gy; }
        else nx[f] = el.value;
        await E.setCalendar(nx);
        await refreshFromStore(true);
      } catch (e2) { await toast('ui.error.save'); }
      return;
    }
    if (el.dataset.rc != null) { recogSel = recogSel || {}; recogSel[el.dataset.rc] = el.checked; return; }
    if (el.dataset.story === 'shift') { dateShift = el.checked; return; }
    if (el.dataset.story === 'auto') { try { await E.setStoryAuto(el.checked); await refreshFromStore(true); } catch (e2) { await toast('ui.error.save'); } return; }
    if (el.dataset.ai && aiDraft) {
      const k = el.dataset.ai;
      if (k === 'autoSyncOff') { aiDraft.autoSync = !el.checked; await saveAiDraft(); render(); return; }
      if (k === 'aiDescribe' || k === 'aiPlot' || k === 'aiInit' || k === 'aiNoThink' || k === 'autoSync' || k === 'autoDetect' || k === 'skipRefusal') { aiDraft[k] = el.checked; await saveAiDraft(); render(); return; }
      if (k === 'aiContext' || k === 'aiMaxTokens' || k === 'aiBaselineTokens' || k === 'aiCardChars' || k === 'aiScanMsgs' || k === 'focusScanMsgs') {
        const R = { focusScanMsgs: [60, 4, 200], aiScanMsgs: [30, 4, 100], aiContext: [8, 2, 30], aiMaxTokens: [8000, 1000, 32000], aiBaselineTokens: [16000, 1000, 32000], aiCardChars: [6000, 1000, 20000] }[k];
        aiDraft[k] = E.clamp(E.int(el.value, R[0]), R[1], R[2]); await saveAiDraft(); return; }
    }
    if (el.dataset.social) { const c = current(); if (c) { try { await E.setSocial(chKey(c), el.value); } catch (e2) { await toast('ui.error.save'); } await refreshFromStore(true); } return; }
    if (el.dataset.inj === 'intimacy' && injDraft) { injDraft.intimacy = el.checked; await saveInjDraft(); return; }
    if (el.dataset.inj === 'enabled' && injDraft) { injDraft.enabled = el.checked; await saveInjDraft(); return; }
    if (el.dataset.inj === 'template' && injDraft) { injDraft.template = el.value; await saveInjDraft(); return; }
    if (injDraft && ['depth', 'sticky', 'wait'].indexOf(el.dataset.inj) >= 0) { const R = { depth: [2, 0, 20], sticky: [3, 0, 50], wait: [3000, 0, 15000] }[el.dataset.inj]; injDraft[el.dataset.inj] = E.clamp(E.int(el.value, R[0]), R[1], R[2]); await saveInjDraft(); return; }
    if (el.dataset.alias) { try { await E.setAliases(el.dataset.alias, el.value); } catch (e2) { await toast('ui.error.save'); } await refreshFromStore(true); return; }
    if (el.dataset.act === 'scan-track') { const c = scan.cands.find((x) => String(x.key) === el.dataset.key); if (c && !c.minor) c.track = el.checked; render(); return; }
    if (el.dataset.act === 'scan-preg') { const c = scan.cands.find((x) => String(x.key) === el.dataset.key); if (c && !c.minor) { c.pregnant = el.checked; if (c.pregnant && !c.pregnancyDay) c.pregnancyDay = 30; } render(); return; }
    if (el.dataset.scan) { onScanInput(el); return; }
    if (el.dataset.api) return; // text fields are tracked in onInput
    if (el.dataset.act === 'track-toggle') {
      const id = el.dataset.id, on = el.checked;
      const x = st.characters[id];
      if (!x) return;
      if (on && (x.skippedReason === 'notFemale' || x.skippedReason === 'genderUnknown')) {
        await editChar(id, (ch) => { ch.genderOverride = true; ch.skippedReason = null; ch.trackOff = false; }, { noRender: true });
        await doRescan();
      } else if (x.skippedReason !== 'minor') {
        // v2.9.8: the checkbox is the same 停止追踪 state as the cabinet card (frozen: data kept, no updates, brief injection)
        if (on) { if (x.trackOff) await editChar(id, (ch) => { ch.trackOff = false; ch.migratedFromMinor = false; }, { noRender: true }); await E.setFrozen(id, false); } else await E.setFrozen(id, true); /* [tt-port:age-ui] */
        await refreshFromStore(true);
      } else render();
      return;
    }
    if (el.dataset.act === 'clear-global') { clearGlobal = el.checked; return; }
    if (el.dataset.act === 'kink-lock') { const c = current(); if (c) { await E.kinkOp(chKey(c), 'lock', { on: el.checked }); await refreshFromStore(true); } return; }
    if (el.dataset.kink) {
      const row = el.closest('[data-kid]'); const c = current();
      if (row && c) { await E.kinkOp(chKey(c), 'edit', el.dataset.kink === 'name' ? { kid: row.dataset.kid, name: el.value } : { kid: row.dataset.kid, note: el.value }); await refreshFromStore(true); }
      return;
    }
    if (el.dataset.cact) {
      const row = el.closest('[data-cid]');
      if (!row) return;
      const list = E.getCustomActs(); const a = list.find((x) => x.id === row.dataset.cid);
      if (!a) return;
      if (el.dataset.cact === 'name') { if (!el.value.trim()) { await toast('ui.cact.needName'); return; } a.name = el.value; } else a.desc = el.value;
      await E.saveCustomActs(list); await refreshFromStore(true); return;
    }
    if (el.dataset.act === 'preg-toggle') {
      const on = el.checked;
      // v3.0.6: 受孕 lives in 生育 box — write immediately (undoable via history), not via cycle draft
      await edit((ch) => {
        if (on && !ch.fertility.pregnant) { ch.fertility.pregnant = true; ch.fertility.pregnancyDay = Math.max(1, ch.fertility.pregnancyDay); ch.fertility.pregnancyCount += 1; }
        else if (!on) { ch.fertility.pregnant = false; ch.fertility.pregnancyDay = 0; }
      });
      return;
    }
    if (el.dataset.path && pathLim(el.dataset.path)) {
      const path = el.dataset.path, v = el.value;
      if (stagedPath(path)) {
        if (/^fertility\./.test(path)) stageHist(current(), (ch) => setPath(ch, path, v));
        else stageCyc(current(), (ch) => setPath(ch, path, v));
        return;
      }
      await edit((ch) => setPath(ch, path, v));
      return;
    }
    if (el.dataset.off) {
      const row = el.closest('[data-uid]');
      const uid = row && row.dataset.uid, field = el.dataset.off, v = el.value;
      if (!uid) return;
      await edit((ch) => {
        const o = ch.fertility.offspring.find((x) => x.uid === uid);
        if (!o) return;
        o.src = 'user'; o.flag = ''; o.ageGuessed = field === 'age' ? false : o.ageGuessed;
        if (field === 'age') o.age = v === '' ? null : E.clamp(Number(v) || 0, 0, 200);
        else if (field === 'name') o.name = E.str(v, 60);
        else if (field === 'note') o.note = E.str(v, 200);
        else if (field === 'gender') o.gender = ['female', 'male'].indexOf(v) >= 0 ? v : '';
      }, { noRender: field === 'name' || field === 'note' });
    }
  }
  function onScanInput(el) {
    const c = scan.cands.find((x) => String(x.key) === el.dataset.key);
    if (!c || c.minor) return;
    const v = Number(el.value);
    if (!Number.isFinite(v)) return;
    const f = el.dataset.scan;
    if (f === 'length') { c.cycle.length = E.clamp(Math.round(v), 21, 45); c.cycle.day = E.clamp(c.cycle.day, 1, c.cycle.length); c.cycle.periodLength = E.clamp(c.cycle.periodLength, 1, Math.max(1, c.cycle.length - 10)); }
    else if (f === 'day') c.cycle.day = E.clamp(Math.round(v), 1, c.cycle.length);
    else if (f === 'period') c.cycle.periodLength = E.clamp(Math.round(v), 1, Math.max(1, c.cycle.length - 10));
    else if (f === 'pday') c.pregnancyDay = E.clamp(Math.round(v), 1, 290);
  }
  function onInput(e) {
    fertCache = {};
    const el = e.target;
    if (el && el.dataset && el.dataset.ai && aiDraft && (el.dataset.ai === 'aiContext' || el.dataset.ai === 'aiMaxTokens' || el.dataset.ai === 'aiBaselineTokens' || el.dataset.ai === 'aiCardChars' || el.dataset.ai === 'aiScanMsgs' || el.dataset.ai === 'focusScanMsgs')) { aiDraft[el.dataset.ai] = el.value; return; }
    if (el && el.dataset && el.dataset.adultask && adultAsk) { adultAsk.age = el.value; adultAsk.msg = ''; return; } /* [tt-port:age-ui] */
    if (el && el.dataset && el.dataset.addf) { addForm[el.dataset.addf] = el.value; if (el.dataset.addf === 'desc' || el.dataset.addf === 'name') { addForm.minorHit = false; addForm.adultConfirmed = null; } return; }
    if (el && el.dataset && el.dataset.prec === 'names') { prec.names = el.value; return; }
    if (el && el.dataset && el.dataset.bodyf && bodyEdit) { bodyEdit[el.dataset.bodyf] = el.value; return; }
    if (el && el.dataset && el.dataset.stylef && styleEdit) { styleEdit[el.dataset.stylef] = el.value; return; }
    if (el && el.dataset && el.dataset.inj === 'template' && injDraft) { injDraft.template = el.value; return; }
    if (el && el.dataset && el.dataset.scan) { onScanInput(el); return; }
    if (!el || !el.dataset || !el.dataset.api || !apiDraft || el.dataset.api === 'enabled') return;
    const k = el.dataset.api;
    if (k === 'modelFilter') {
      modelPick.filter = el.value;
      const box = view.querySelector('.phys-pick-list'); if (box) box.innerHTML = pickItems();
      return;
    }
    if (k === 'apiKey' || k === 'baseUrl') {
      // credentials/endpoint changed: the fetched list no longer applies
      if (modelPick.list.length) { modelPick.list = []; modelPick.open = false; modelPick.filter = ''; const pk = view.querySelector('.phys-picker'); if (pk && pk.parentNode) pk.parentNode.removeChild(pk); }
    }
    if (k === 'apiKey') apiDraft.newKey = el.value;
    else {
      apiDraft[k] = el.value;
      if (k === 'model') {
        const cur = view.querySelector('.phys-pick-cur'); if (cur) cur.textContent = el.value || t('ui.api.models.none');
        view.querySelectorAll('.phys-pick-item').forEach((b) => { const on = b.dataset.model === el.value; b.classList.toggle('on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
      }
    }
  }
  function onImgError(e) {
    const el = e.target;
    if (el && el.tagName === 'IMG' && el.closest && el.closest('.phys-portrait')) {
      const src = el.getAttribute('src') || '';
      Object.keys(imgCache).forEach((k) => { if (imgCache[k] === src) { delete imgCache[k]; imgFailed[k] = true; } });
      imgFailed[src] = true;
      const box = el.parentNode;
      if (box) box.innerHTML = '<span class="phys-ph" aria-hidden="true">·</span>';
    }
  }
  function onKeyDown(e) {
    if (e.key === 'Enter' && e.target.matches && e.target.matches('[data-role=loc-input]')) { e.preventDefault(); saveLoc(); return; }
    if (e.key === 'Escape' && (locEdit || charMenu)) { locEdit = false; charMenu = false; render(); return; }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('.phys-cal2 .d')) { e.preventDefault(); const n = Number(e.target.dataset.n); calSel = calSel === n ? null : n; render(); return; }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('.phys-launcher')) {
      e.preventDefault();
      userOpened = true; editPanel((p) => { p.open = true; p.collapsed = false; p.openReq = Date.now(); }).then(() => { render(); loreKick(); });
    }
  }

  /* ---- external refresh ---- */
  let latestDone = false; // v2.9.8: latest reply already analysed -> 「重新分析」
  // v3.0.3: one state load per refresh, a cheap fingerprint (savedAt + AI error + latest-floor flag) before the big
  // stringify compare, a full compare at least every 30 s, and never two refreshes at once (a forced one waits, then re-runs).
  let refreshing = null, lastFp = '', lastFull = 0;
  function refreshFromStore(force) {
    if (disposed || dragging) return Promise.resolve();
    const ae = document.activeElement;
    if (!force && ae && root.contains(ae) && /^(INPUT|SELECT|TEXTAREA)$/.test(ae.tagName)) return Promise.resolve();
    if (isEditing()) { pendingRender = true; return Promise.resolve(); } // even forced refreshes wait until the field blurs
    if (refreshing) { if (!force) return refreshing; return refreshing.then(() => refreshFromStore(true)); }
    const p = refresh0(force).catch(() => 0).then(() => { if (refreshing === p) refreshing = null; });
    refreshing = p;
    return p;
  }
  async function refresh0(force) {
    try {
      const s = await E.loadState();
      let ld = false; try { const lf = await E.latestFloorState(s); ld = !!(lf && lf.done); } catch (e) { ld = false; }
      const le = await E.lastAiError().catch(() => null);
      if (disposed) return;
      const ldChanged = ld !== latestDone; latestDone = ld;
      const now = Date.now();
      const sv = s.meta && s.meta.savedAt;
      const fp = String(sv || '') + '|' + (le ? String(le.ts || '') + ':' + String(le.step || '') + ':' + String(le.label || '') : '-') + '|' + ld;
      if (!force && sv && lastJson && fp === lastFp && now - lastFull < 30000) { if (ldChanged) render(); return; }
      lastFp = fp; lastFull = now;
      const j = JSON.stringify(s) + JSON.stringify(le); lastAiErr = le; if (!le) aiErrOpen = false;
      if (s.sync && s.sync.turn && !(st.sync && st.sync.turn && String(st.sync.turn.msg) === String(s.sync.turn.msg))) turnHidden = false;
      if (j !== lastJson || force) {
        if (injPv.open && !injPv.busy && lastJson && JSON.stringify(s.characters) + JSON.stringify(s.initJob || null) !== JSON.stringify(st.characters) + JSON.stringify(st.initJob || null)) setTimeout(() => { if (injPv.open && !injPv.busy) void runInjPreview(); }, 50); // v2.9.0: preview follows live data
        const wasSettings = st.panel.view === 'settings';
        st = s; lastJson = j;
        if (s.panel.view === 'settings' || page === 'settings') await ensureDrafts();
        if (!wasSettings && s.panel.view === 'settings') apiStatus = null;
        render();
        if (s.panel.view === 'scan' && s.panel.scanReq && s.panel.scanReq !== handledScanReq && Date.now() - s.panel.scanReq < 30000) { handledScanReq = s.panel.scanReq; startScan(); }
      } else if (ldChanged) render();
    } catch (e) { /* ignore */ }
  }

  root.addEventListener('pointerdown', onPointerDown);
  root.addEventListener('pointermove', onPointerMove);
  root.addEventListener('pointerup', onPointerUp);
  root.addEventListener('pointercancel', onPointerCancel);
  root.addEventListener('click', onClick);
  root.addEventListener('change', onChange);
  root.addEventListener('input', onInput);
  root.addEventListener('keydown', onKeyDown);
  root.addEventListener('error', onImgError, true);
  /* ---- v2.2 header: collapse to a slim bar when the page body scrolls past ~40px, expand at the top (rAF-throttled, class toggle only) ---- */
  function setHd(v) {
    if (isEditing()) return; // never change the header while the player is typing
    hdCollapsed = !!v;
    try { sessionStorage.setItem('phys.hd', hdCollapsed ? '1' : '0'); } catch (e) { /* ignore */ }
    const el = view.querySelector('[data-role=hd]');
    if (!el || el.classList.contains('is-slim') === hdCollapsed) return;
    el.classList.toggle('is-slim', hdCollapsed);
    const sl = el.querySelector('.hd-slim'), fu = el.querySelector('.hd-full');
    if (sl) { sl.setAttribute('aria-hidden', hdCollapsed ? 'false' : 'true'); sl.tabIndex = hdCollapsed ? 0 : -1; }
    if (fu) fu.setAttribute('aria-hidden', hdCollapsed ? 'true' : 'false');
    const tg = el.querySelector('.hd-tog');
    if (tg) { tg.setAttribute('aria-expanded', hdCollapsed ? 'false' : 'true'); const lb = t(hdCollapsed ? 'ui4.hd.expand' : 'ui6.hd.collapse'); tg.setAttribute('aria-label', lb); tg.title = lb; }
  }

  // Keyboard open/close resizes the window: never move the panel while typing; re-apply after the field blurs.
  const onResize = () => { if (isEditing()) { pendingLayout = true; return; } applyLayout(); };
  function onFocusOut() {
    setTimeout(() => {
      root.classList.toggle('phys-editing', isEditing());
      if (disposed) return;
      if (!isEditing()) {
        if (pendingLayout) { pendingLayout = false; applyLayout(); }
        if (pendingRender) render();
      }
    }, 0);
  }
  const onFocusIn = () => { root.classList.toggle('phys-editing', isEditing()); setTimeout(scrollFocused, 50); };
  root.addEventListener('focusin', onFocusIn);
  disposers.push(() => root.removeEventListener('focusin', onFocusIn));
  root.addEventListener('focusout', onFocusOut);
  disposers.push(() => root.removeEventListener('focusout', onFocusOut));
  // v2.7.1 / Tavo 1.7: host has built-in keyboard avoidance — do NOT translate/resize the panel
  // with visualViewport (that fights the host and makes the panel fly). Only scroll our body,
  // and never re-layout while an input is focused.
  const vv = window.visualViewport;
  const scrollFocused = () => {
    if (!isEditing()) return;
    const ae = document.activeElement;
    const sc = ae && ae.closest && ae.closest('.phys-body');
    if (!ae || !sc) return;
    try { ae.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' }); } catch (e3) {
      const r = ae.getBoundingClientRect();
      const br = sc.getBoundingClientRect();
      if (r.bottom > br.bottom - 8) sc.scrollTop += (r.bottom - br.bottom + 8);
      else if (r.top < br.top + 8) sc.scrollTop -= (br.top + 8 - r.top);
    }
  };
  const onVV = () => { if (isEditing()) scrollFocused(); };
  if (vv && vv.addEventListener) {
    vv.addEventListener('resize', onVV);
    vv.addEventListener('scroll', onVV);
    disposers.push(() => { vv.removeEventListener('resize', onVV); vv.removeEventListener('scroll', onVV); });
  }
  root.__phys = { refresh: (f) => refreshFromStore(f), render: (o) => render(o), isEditing: isEditing };
  window.addEventListener('resize', onResize);
  disposers.push(() => window.removeEventListener('resize', onResize));

  /* initial render, then load state, then subscribe to locale/insets/events */
  render();
  refreshFromStore(true).then(() => { try { if (st.meta && st.meta.rosterConfirmed === false && st.panel.open && !wasUserOpened()) editPanel((p) => { p.open = false; }).then(render); } catch (e) { /* ignore */ } });
  // v2.7.5: resume an interrupted staged initialization when the panel opens again
  setTimeout(async () => { try { const s0 = await E.loadState(); const j = s0.initJob; if (j && j.status === 'running') kickInit({}); } catch (e) { /* ignore */ } }, 900);
  // v2.7.4: panel open re-tries lorebook creation if this chat's book is still missing / detached
  // v2.8.1: the panel never creates a book; when the USER opens it, it asks the entry runtime (shared global signal) and polls
  function loreKick() {
    if (panelLoreKick || !wasUserOpened()) return;
    if (anyRecogCard()) return; // v3.0.5: world-book attach must not stack over ask/list
    panelLoreKick = true;
    E.loreAttachedNow().then(async (ok) => {
      if (ok) return;
      if (anyRecogCard()) return;
      await E.ensureLoreReady({ recognize: false });
      for (let i = 0; i < 40 && !disposed; i++) { await new Promise((r) => setTimeout(r, 1500)); if (await E.loreAttachedNow()) { await refreshFromStore(true); return; } }
    }).catch(() => 0);
  }
  // [tt-port:panel-tt] 移植版只有一个引擎实例：后台角色保持 'entry'
  try { if (tavo.__host !== 'sillytavern') E.__setRole('panel'); } catch (e) { /* older engine */ }
  setTimeout(loreKick, 600);

  try {
    if (tavo.plugin.i18n && typeof tavo.plugin.i18n.onChange === 'function') {
      const off = tavo.plugin.i18n.onChange(() => render());
      if (typeof off === 'function') disposers.push(off);
    }
  } catch (e) { /* ignore */ }
  try {
    if (tavo.ui && typeof tavo.ui.onInsetsChanged === 'function') {
      const off = tavo.ui.onInsetsChanged(() => applyLayout());
      if (typeof off === 'function') disposers.push(off);
    }
  } catch (e) { /* ignore */ }
  try {
    const off = tavo.plugin.on('message:changed', () => { setTimeout(() => refreshFromStore(false), 900); });
    if (typeof off === 'function') disposers.push(off);
  } catch (e) { /* ignore */ }
  // v3.0.3: fast (0.9 s) only while something runs; idle every ~5.4 s; paused while the page is hidden (only an explicit
  // visibilitychange to hidden counts, so a host that never reports visibility keeps polling as before)
  // v3.0.21: idle poll ~10.8 s (was 5.4) to cut background refresh cost; busy path unchanged
  let tick = 0; let pageHidden = false;
  const busyNow = () => { try { return E.syncBusy(st) || syncReq || initLocal || abortBusy; } catch (e) { return syncReq || initLocal; } };
  // v3.0.26: idle path also checks the raw save stamp every ~1.8 s; an entry-side auto sync (separate runtime) used to wait
  // up to ~10.8 s and then the fingerprint shortcut could still skip it -> 「分析成功后页面不变」. A new stamp forces a full refresh.
  let stampBusy = false, lastStamp = 0;
  const checkStamp = () => { if (stampBusy || !E.stateStamp || fscan.busy || prec.busy || recogFirst.busy || isEditing()) return; /* v3.0.28: no remount during scan/typing; stamp change -> fingerprint/JSON compare, not force */ stampBusy = true; E.stateStamp().then((v) => { stampBusy = false; if (v && v !== lastStamp) { const first = !lastStamp; lastStamp = v; if (!first && !disposed) refreshFromStore(false); } }).catch(() => { stampBusy = false; }); };
  const timer = setInterval(() => { tick++; if (pageHidden) return; if (fscan.busy || prec.busy || Date.now() - lastClickTs < 1500) return; /* v3.0.28: no poll remount during scan or right after a tap */ if (tick % 2 === 0) checkStamp(); if (busyNow() || tick % 12 === 0) refreshFromStore(false); if (!initLocal && tick % 6 === 0) { try { if (E.initOrphaned(st)) kickInit({}); } catch (e) { /* ignore */ } } }, 900);
  disposers.push(() => clearInterval(timer));
  const onVis = () => {
    pageHidden = document.visibilityState === 'hidden';
    root.classList.toggle('phys-paused', pageHidden);
    if (!pageHidden && !disposed) refreshFromStore(true);
  };
  document.addEventListener('visibilitychange', onVis);
  disposers.push(() => document.removeEventListener('visibilitychange', onVis));

  const dispose = () => {
    disposed = true;
    disposers.forEach((f) => { try { f(); } catch (e) { /* ignore */ } });
    ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'click', 'change', 'input', 'keydown'].forEach((n) => {
      const h = { pointerdown: onPointerDown, pointermove: onPointerMove, pointerup: onPointerUp, pointercancel: onPointerCancel, click: onClick, change: onChange, input: onInput, keydown: onKeyDown }[n];
      root.removeEventListener(n, h);
    });
    root.removeEventListener('error', onImgError, true);
  };
  document.documentElement.__physDispose = dispose;
  dispose.refresh = () => refreshFromStore(true); // [tt-port:panel-tt] 外部入口改了存档后立即刷新
  return dispose;
}
