#!/usr/bin/env python3
"""块 2b：面板（src/panel.js）接入「确认成年」与新的年龄规则。

界面行为：
  - 被年龄底线拦下的角色（skippedReason='minor'），在三处显示「确认成年」入口：
      1) 角色主页的“已跳过”提示（phys-skip）
      2) 设置 → 追踪名单（原来是灰色锁定行）
      3) AI 扫描候选 / 识别名单里的“未成年”项
  - 点「确认成年」展开内联表单：说明 + 年龄输入（≥18）+ 确认/取消；提交前 window.confirm 二次确认
  - 旧版误判解锁的角色（migratedFromMinor）在追踪名单里显示提示，可直接打开追踪
  - 档案里把年龄改成 <18：已确认成年的角色弹出确认“取消成年确认并停止建档？”；未确认的提示不会建档
  - 手动添加：描述里写了 <18 年龄被拒时，表单出现“卡上明确写了已满 18 岁？确认成年并添加”

实现：所有新 UI 共用一个状态 adultAsk = { kind, id, name, age, msg }，渲染函数 adultAskHtml(kind, id, name)。
用法：python3 build/patch_panel_age.py [--dry-run]
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import patch_age as base  # noqa: E402

PANEL = base.ROOT / 'char-physiology-tt' / 'src' / 'panel.js'
MARK = '/* [tt-port:age-ui] */'
base.PATCHES.clear()
P = base.patch

# ---------------------------------------------------------------------------
# 0. 状态 + 共享渲染/提交函数（放在 addForm 声明后面）
# ---------------------------------------------------------------------------
P('状态与共享函数',
  "let addForm = { open: false, name: '', desc: '', busy: false, msg: '' };",
  "let addForm = { open: false, name: '', desc: '', busy: false, msg: '' };\n"
  + MARK + "\n"
  "// 「确认成年」内联表单：kind = char（已存在的角色）| scan（扫描候选）| recog（识别名单）| add（手动添加）\n"
  "let adultAsk = null; // { kind, id, name, age, msg }\n"
  "const recogAdult = {}; // 识别名单里已确认成年的候选：{ key: age }\n"
  "function adultAskOpen(kind, id) { return !!(adultAsk && adultAsk.kind === kind && String(adultAsk.id) === String(id)); }\n"
  "function adultBtnHtml(kind, id, name) {\n"
  "  return '<button type=\"button\" class=\"phys-btn small\" data-act=\"adult-ask\" data-kind=\"' + esc(kind) + '\" data-id=\"' + esc(String(id)) + '\" data-name=\"' + esc(name || '') + '\">' + esc(t('ttAge.confirm.btn')) + '</button>';\n"
  "}\n"
  "function adultAskHtml(kind, id, name) {\n"
  "  if (!adultAskOpen(kind, id)) return adultBtnHtml(kind, id, name);\n"
  "  return '<div class=\"phys-adultask\" role=\"group\"><p class=\"phys-muted\">' + esc(t('ttAge.confirm.hint', { name: name || '' })) + '</p>' +\n"
  "    '<label class=\"phys-field\">' + esc(t('ttAge.confirm.ageLabel')) + '<input type=\"number\" inputmode=\"numeric\" min=\"18\" max=\"9999\" step=\"1\" data-adultask=\"age\" value=\"' + esc(adultAsk.age == null ? '' : String(adultAsk.age)) + '\" placeholder=\"18\"></label>' +\n"
  "    (adultAsk.msg ? '<p class=\"phys-status\">' + esc(adultAsk.msg) + '</p>' : '') +\n"
  "    '<div class=\"phys-row\"><button type=\"button\" class=\"phys-btn\" data-act=\"adult-ok\">' + esc(t('ttAge.confirm.ok')) + '</button><button type=\"button\" class=\"phys-btn ghost\" data-act=\"adult-cancel\">' + esc(t('ui5.cancel')) + '</button></div></div>';\n"
  "}\n"
  "// 校验年龄并二次确认；返回整数年龄或 null（已在表单里写好错误提示）\n"
  "function adultAskAge() {\n"
  "  if (!adultAsk) return null;\n"
  "  const raw = String(adultAsk.age == null ? '' : adultAsk.age).trim();\n"
  "  const n = Number(raw);\n"
  "  if (!raw || !Number.isFinite(n) || Math.round(n) !== n) { adultAsk.msg = t('ttAge.confirm.errNum'); return null; }\n"
  "  if (n < 18) { adultAsk.msg = t('ttAge.confirm.errUnder'); return null; }\n"
  "  if (!window.confirm(t('ttAge.confirm.dialog', { name: adultAsk.name || '', age: n }))) return null;\n"
  "  return n;\n"
  "}")

# ---------------------------------------------------------------------------
# 1. 角色主页“已跳过”提示：被年龄底线拦下时加入口
# ---------------------------------------------------------------------------
P('跳过页：确认成年入口',
  "else if (isOff(c)) body = pageHead(page) + '<div class=\"phys-skip\"><p>' + esc(offReason(c)) + '</p><button type=\"button\" class=\"phys-btn\" data-act=\"page\" data-page=\"settings\">' + esc(t('ui.settings.open')) + '</button></div>';",
  "else if (isOff(c)) body = pageHead(page) + '<div class=\"phys-skip\"><p>' + esc(offReason(c)) + '</p>' + (c.skippedReason === 'minor' ? adultAskHtml('char', chKey(c), c.name) : '') + (c.migratedFromMinor && c.trackOff ? '<p class=\"phys-muted\">' + esc(t('ttAge.migrated.hint')) + '</p>' : '') + '<button type=\"button\" class=\"phys-btn\" data-act=\"page\" data-page=\"settings\">' + esc(t('ui.settings.open')) + '</button></div>'; " + MARK)

# ---------------------------------------------------------------------------
# 2. 设置 → 追踪名单
# ---------------------------------------------------------------------------
P('追踪名单：确认成年入口与迁移提示',
  "if (tracked && !minor) tb += '<label class=\"phys-field phys-alias\">",
  "if (minor) tb += '<div class=\"phys-trackrow-x\">' + adultAskHtml('char', chKey(x), x.name || ('#' + x.id)) + '</div>'; " + MARK + "\n"
  "else if (x.migratedFromMinor && x.trackOff) tb += '<p class=\"phys-muted phys-sub2\">' + esc(t('ttAge.migrated.row')) + '</p>';\n"
  "if (tracked && !minor) tb += '<label class=\"phys-field phys-alias\">")

# 迁移来的角色打开追踪后清除迁移标记
P('追踪开关：清除迁移标记',
  "if (on) { if (x.trackOff) await editChar(id, (ch) => { ch.trackOff = false; }, { noRender: true }); await E.setFrozen(id, false); } else await E.setFrozen(id, true);",
  "if (on) { if (x.trackOff) await editChar(id, (ch) => { ch.trackOff = false; ch.migratedFromMinor = false; }, { noRender: true }); await E.setFrozen(id, false); } else await E.setFrozen(id, true); " + MARK)

# ---------------------------------------------------------------------------
# 3. AI 扫描候选
# ---------------------------------------------------------------------------
P('扫描候选：未成年项加入口',
  "if (c.minor) return h + '<p class=\"phys-muted\">' + esc(t('ui.scan.minorHint')) + '</p></div>';",
  "if (c.minor) return h + '<p class=\"phys-muted\">' + esc(t('ui.scan.minorHint')) + '</p>' + adultAskHtml('scan', c.key, c.name) + '</div>'; " + MARK)

# ---------------------------------------------------------------------------
# 4. 识别名单（首次识别 / 精准识别的确认卡）
# ---------------------------------------------------------------------------
P('识别名单：未成年行加入口',
  "const rcRow = (x) => x.minor\n"
  "? '<label class=\"phys-check is-disabled\" aria-disabled=\"true\"><input type=\"checkbox\" disabled data-rcminor=\"' + esc(x.k) + '\"><span>' + esc(x.name) + ' <small class=\"phys-muted\">' + esc(x.note) + '</small></span></label>'",
  "const rcRow = (x) => x.minor\n"
  "? '<div class=\"phys-rc-minor\"><label class=\"phys-check is-disabled\" aria-disabled=\"true\"><input type=\"checkbox\" disabled data-rcminor=\"' + esc(x.k) + '\"><span>' + esc(x.name) + ' <small class=\"phys-muted\">' + esc(x.note) + '</small></span></label>' + adultAskHtml('recog', x.k, x.name) + '</div>' " + MARK)
# 识别名单里已确认成年的候选：显示为可勾选（并标注“已确认成年”）
P('识别名单：已确认的候选可勾选',
  "return p.filtered.map((c) => ({ k: String(c.key || c.name), name: c.name, minor: !!c.minor, note: c.minor ? '未成年' :",
  "return p.filtered.map((c) => ({ k: String(c.key || c.name), name: c.name, minor: !!c.minor && recogAdult[String(c.key || c.name)] == null, note: c.minor ? (recogAdult[String(c.key || c.name)] != null ? t('ttAge.confirmed.tag', { age: recogAdult[String(c.key || c.name)] }) : t('ttAge.minor.tag')) :")
P('识别名单：提交时带上确认',
  "try { r = await E.confirmRecognized(keep, { init: false }); } catch (e2) { /* ignore */ }",
  "try { r = await E.confirmRecognized(keep, { init: false, adultConfirmed: Object.assign({}, recogAdult) }); } catch (e2) { /* ignore */ } " + MARK)
# 识别名单主列表（recogItems）里的候选：同样认“已确认成年”
P('识别名单：主列表候选认确认',
  "k: String(c.key || c.name), name: c.name, pre: c.minor ? false : c.pre, minor: !!c.minor, note: (c.scanSrc ?",
  "k: String(c.key || c.name), name: c.name, pre: c.minor && recogAdult[String(c.key || c.name)] == null ? false : c.pre, minor: !!c.minor && recogAdult[String(c.key || c.name)] == null, note: (c.minor && recogAdult[String(c.key || c.name)] != null ? t('ttAge.confirmed.tag', { age: recogAdult[String(c.key || c.name)] }) + '·' : '') + (c.scanSrc ?")
P('识别名单：主列表未成年标签',
  "(c.local === 'rough' ? '' : c.minor ? '未成年' :",
  "(c.local === 'rough' ? '' : c.minor ? (recogAdult[String(c.key || c.name)] != null ? '' : t('ttAge.minor.tag')) :")

# ---------------------------------------------------------------------------
# 5. 手动添加：被年龄底线拒绝时给出确认入口
# ---------------------------------------------------------------------------
P('手动添加：带确认重试',
  "let r = null; try { r = await E.addTracked(nm, ds); } catch (e2) { r = { ok: false, code: 'error' }; }",
  "let r = null; try { r = await E.addTracked(nm, ds, addForm.adultConfirmed ? { adultConfirmed: { age: addForm.adultConfirmed } } : undefined); } catch (e2) { r = { ok: false, code: 'error' }; } " + MARK)
P('手动添加：错误提示',
  "else addForm.msg = t('ui7.add.err.' + ((r && r.code) === 'minor' ? 'minor' : 'error'));",
  "else { addForm.msg = t('ui7.add.err.' + ((r && r.code) === 'minor' ? 'minor' : 'error')); addForm.minorHit = (r && r.code) === 'minor'; } " + MARK)
P('手动添加：表单里的确认入口',
  "'<div class=\"phys-row\"><button type=\"button\" class=\"phys-btn\" data-act=\"add-go\"'",
  "(addForm.minorHit ? (addForm.adultConfirmed ? '<p class=\"phys-muted\">' + esc(t('ttAge.confirmed.tag', { age: addForm.adultConfirmed })) + '</p>' : adultAskHtml('add', 'add', addForm.name)) : '') + " + MARK + "\n"
  "'<div class=\"phys-row\"><button type=\"button\" class=\"phys-btn\" data-act=\"add-go\"'")
P('手动添加：成功后重置',
  "if (r && r.ok) { addForm = { open: false, name: '', desc: '', busy: false, msg: t('ui7.add.ok', { name: nm }) }; sel = r.id; }",
  "if (r && r.ok) { addForm = { open: false, name: '', desc: '', busy: false, msg: t('ui7.add.ok', { name: nm }) }; sel = r.id; adultAsk = null; } " + MARK)

# ---------------------------------------------------------------------------
# 6. 档案编辑：年龄改成 <18
# ---------------------------------------------------------------------------
P('档案保存：年龄 <18 的处理',
  "const r = await E.editDossier(dossEdit.id, dossEdit.which === 'base' ? 'base' : 'current', d);\n"
  "if (r && r.ok) { dossEdit = null; await refreshFromStore(true); await toast('ui5.saved'); }\n"
  "else await toast(r && r.code === 'minor' ? 'ui5.minor' : 'ui.error.save');",
  "let r = await E.editDossier(dossEdit.id, dossEdit.which === 'base' ? 'base' : 'current', d);\n"
  + MARK + "\n"
  "// 已确认成年的角色被改成 <18：二次确认后取消确认并停止建档\n"
  "if (r && r.code === 'minorConfirmed' && window.confirm(t('ttAge.revoke.dialog', { name: c.name || '', age: r.age }))) r = await E.editDossier(dossEdit.id, dossEdit.which === 'base' ? 'base' : 'current', Object.assign({}, d, { revokeAdult: true }));\n"
  "if (r && r.ok && r.revoked) { dossEdit = null; await refreshFromStore(true); await toast('ttAge.revoke.done', { name: c.name || '' }); }\n"
  "else if (r && r.ok) { dossEdit = null; await refreshFromStore(true); await toast('ui5.saved'); }\n"
  "else if (r && r.code === 'minorConfirmed') { /* 用户取消 */ }\n"
  "else await toast(r && r.code === 'minor' ? 'ttAge.minor.save' : 'ui.error.save', r && r.age != null ? { age: r.age } : undefined);")

# ---------------------------------------------------------------------------
# 7. 事件：点击 / 输入
# ---------------------------------------------------------------------------
P('点击事件：确认成年',
  "case 'rescan': await doRescan(); break;",
  "case 'rescan': await doRescan(); break;\n"
  + MARK + "\n"
  "case 'adult-ask': { const k0 = btn.dataset.kind; const id0 = btn.dataset.id; const ch0 = k0 === 'char' ? st.characters[id0] : null; adultAsk = { kind: k0, id: id0, name: btn.dataset.name || '', age: ch0 && ch0.cardAge >= 18 ? ch0.cardAge : '', msg: '' }; render(); break; }\n"
  "case 'adult-cancel': adultAsk = null; render(); break;\n"
  "case 'adult-ok': {\n"
  "  const ask = adultAsk; if (!ask) break;\n"
  "  const age = adultAskAge(); if (age == null) { render(); break; }\n"
  "  if (ask.kind === 'char') {\n"
  "    let r = null; try { r = await E.confirmAdult(ask.id, age); } catch (e2) { r = { ok: false, code: 'error' }; }\n"
  "    if (r && r.ok) { adultAsk = null; await refreshFromStore(true); await toast('ttAge.confirm.done', { name: ask.name, age: age }); }\n"
  "    else { adultAsk.msg = t('ui.error.save'); render(); }\n"
  "  } else if (ask.kind === 'scan') {\n"
  "    const sc = scan.cands.find((x) => String(x.key) === String(ask.id));\n"
  "    if (sc) { sc.minor = false; sc.age = age; sc.adult = true; sc.adultConfirmed = { age: age }; sc.track = true; }\n"
  "    adultAsk = null; render();\n"
  "  } else if (ask.kind === 'recog') {\n"
  "    recogAdult[String(ask.id)] = age; recogSel = recogSel || {}; recogSel[String(ask.id)] = true;\n"
  "    adultAsk = null; render();\n"
  "  } else if (ask.kind === 'add') {\n"
  "    addForm.adultConfirmed = age; addForm.msg = ''; adultAsk = null; render();\n"
  "  }\n"
  "  break;\n"
  "}")
P('输入事件：年龄框',
  "if (el && el.dataset && el.dataset.addf) { addForm[el.dataset.addf] = el.value; return; }",
  "if (el && el.dataset && el.dataset.adultask && adultAsk) { adultAsk.age = el.value; adultAsk.msg = ''; return; } " + MARK + "\n"
  "if (el && el.dataset && el.dataset.addf) { addForm[el.dataset.addf] = el.value; if (el.dataset.addf === 'desc' || el.dataset.addf === 'name') { addForm.minorHit = false; addForm.adultConfirmed = null; } return; }")


def main():
    dry = '--dry-run' in sys.argv
    src = PANEL.read_text(encoding='utf-8')
    if MARK in src:
        print('FAIL: panel.js 已打过 age-ui 补丁')
        sys.exit(1)
    errors = []
    for name, old, new, count in base.PATCHES:
        hits = base.find_block(src, old)
        if len(hits) != count:
            errors.append('%s：原文出现 %d 次（应为 %d）' % (name, len(hits), count))
            continue
        start, end, info = hits[0]
        src = src[:start] + base.apply_text(new, info) + src[end:]
        print('ok  ', name)
    if errors:
        print('\n'.join('FAIL ' + e for e in errors))
        print('有补丁不匹配，未写入任何修改')
        sys.exit(1)
    if dry:
        print('dry-run：全部匹配，未写入')
        return
    PANEL.write_text(src, encoding='utf-8')
    print('已写入', PANEL)


if __name__ == '__main__':
    main()
