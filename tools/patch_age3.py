#!/usr/bin/env python3
"""块 2b 引擎部分：配合面板的「确认成年」入口。

1. applyScan：候选项带 adultConfirmed:{age>=18} 时，即使年龄底线会拦也照常应用，并写入确认记录
2. editDossier：
   - 删除描述关键词过滤（minorText 已失效，调用点清理掉）
   - 用户把基线年龄改成 <18：如果之前确认过成年 → 自动取消确认并按底线停止建档；
     否则照旧拒绝保存（code:'minor'），提示用户这个年龄会停止建档
   - 改成 >=18：同步 cardAge，解除年龄底线
3. 新增 setAgeAndConfirm(id, age)：面板用来在被拦角色上“确认成年并填写年龄”（等价 confirmAdult，名字更直白）——不新增，直接复用 confirmAdult
用法：python3 build/patch_age3.py [--dry-run]
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import patch_age as base  # noqa: E402

MARK3 = '/* [tt-port:age3] */'
base.PATCHES.clear()
P = base.patch

# 1. applyScan：带确认的候选放行
P('applyScan：确认成年的候选放行',
  "if (minorCheck(name, ctx, member, { age: c.age })) { rejected++; return; } /* [tt-port:age] */",
  "const acScan = normAdultConfirmed(c.adultConfirmed); " + MARK3 + "\n"
  "if (!acScan && minorCheck(name, ctx, member, { age: c.age })) { rejected++; return; } /* [tt-port:age] */")
P('applyScan：写入确认记录',
  "ch.name = name; ch.adult = true; ch.skippedReason = null; ch.trackOff = false; ch.genderOverride = true;\n"
  "if (c.profile && typeof c.profile === 'object') {\n"
  "const pr = Object.assign({}, c.profile);",
  "ch.name = name; ch.adult = true; ch.skippedReason = null; ch.trackOff = false; ch.genderOverride = true;\n"
  "if (acScan) { ch.adultConfirmed = acScan; ch.cardAge = acScan.age; ch.migratedFromMinor = false; } " + MARK3 + "\n"
  "if (c.profile && typeof c.profile === 'object') {\n"
  "const pr = Object.assign({}, c.profile);")

# 2. editDossier：年龄改动与确认联动；删除文本过滤
P('editDossier：年龄 <18 与确认联动',
  "if (patch && patch.age != null && patch.age !== '' && Number(patch.age) < 18) return { ok: false, code: 'minor' };",
  "" + MARK3 + "\n"
  "// 用户把年龄改成 <18：已确认成年的 → 取消确认并按底线停止建档（明确的用户意图）；未确认的 → 拒绝保存并提示\n"
  "if (patch && explicitMinorAge(patch.age)) {\n"
  "  if (!(normAdultConfirmed(ch.adultConfirmed) && patch.revokeAdult === true)) return { ok: false, code: normAdultConfirmed(ch.adultConfirmed) ? 'minorConfirmed' : 'minor', age: Number(patch.age) };\n"
  "  const before0 = snapAll(st, [String(id)]);\n"
  "  ch.adultConfirmed = null; ch.cardAge = Number(patch.age);\n"
  "  if (ch.profile && typeof ch.profile === 'object') ch.profile.age = Number(patch.age);\n"
  "  ch.adult = false; ch.skippedReason = 'minor';\n"
  "  pushHistory(st, { kind: 'manual', before: before0 });\n"
  "  refreshConfirmedAdults(st);\n"
  "  return { ok: true, revoked: true, blocked: true };\n"
  "}\n"
  "if (patch) { patch = Object.assign({}, patch); delete patch.revokeAdult; }\n"
  "// 改成 >=18：同步卡面年龄；已确认成年的同步确认年龄\n"
  "if (patch && patch.age != null && patch.age !== '' && Number(patch.age) >= 18) {\n"
  "  ch.cardAge = Math.round(Number(patch.age));\n"
  "  if (normAdultConfirmed(ch.adultConfirmed)) ch.adultConfirmed = normAdultConfirmed({ age: ch.cardAge, at: ch.adultConfirmed.at });\n"
  "}")
P('editDossier：删除文本关键词过滤',
  "if (minorText(PROF_TEXT.concat(['occupation', 'relationship', 'sensitivity', 'sexPersona']).map((k) => next[k] || '').join('。'))) return { ok: false, code: 'minor' };",
  "// 描述关键词过滤已移除 " + MARK3)

# 3. confirmRecognized(keep, opts)：opts.adultConfirmed = { 候选key或名字: 年龄 }，被年龄底线拦下的候选可在名单里确认成年后一并应用
P('confirmRecognized：支持确认成年',
  "const picks = pend.cands.concat(pend.filtered || []).filter((c) => !c.minor && yes(c.key, c.name)).map((c) => Object.assign({}, c, { track: true }));",
  "const acMap = opts.adultConfirmed && typeof opts.adultConfirmed === 'object' ? opts.adultConfirmed : {}; " + MARK3 + "\n"
  "const acOf = (c) => normAdultConfirmed({ age: acMap[String(c.key)] != null ? acMap[String(c.key)] : acMap[String(c.name)] });\n"
  "const picks = pend.cands.concat(pend.filtered || []).filter((c) => (!c.minor || acOf(c)) && yes(c.key, c.name)).map((c) => Object.assign({}, c, { track: true }, acOf(c) ? { adultConfirmed: acOf(c), minor: false } : {}));")


def main():
    dry = '--dry-run' in sys.argv
    src = base.ENGINE.read_text(encoding='utf-8')
    if MARK3 in src:
        print('FAIL: 已打过 age3 补丁')
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
    base.ENGINE.write_text(src, encoding='utf-8')
    print('已写入', base.ENGINE)


if __name__ == '__main__':
    main()
