#!/usr/bin/env python3
"""块 2a 第二轮：清理剩余让 AI 判断年龄/成年的提示词，以及 AI 结果里 childlike/minor 的采纳逻辑。

规则同 patch_age.py：只认明确的年龄数字；AI 不再做成年判断，只报告卡上写的年龄（age 字段）。
复用 patch_age.py 的宽松匹配与“全部匹配才写入”的机制。
用法：python3 build/patch_age2.py [--dry-run]
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import patch_age as base  # noqa: E402

MARK2 = '/* [tt-port:age2] */'
base.PATCHES.clear()
P = base.patch

# 1. 建档 SAFETY 规则（第 5247 行一带）
P('建档 SAFETY 规则',
  "'SAFETY: ONLY adults under the ADULTHOOD RULE. If HER OWN age or setting makes her a minor or childlike, OMIT her entirely (her children or relatives never count). Never sexualize minors. Offspring of any age are records only — never give them physiology or sexual data.',",
  "'SAFETY: the listed characters are adults (18+), confirmed by the user; do not judge or question their age. Never sexualize minors. Offspring of any age are records only — never give them physiology or sexual data.', " + MARK2)

# 2. AI 扫描规则（第 5434 行一带）：去掉成年判断，只要求报告年龄数字
# 用起止锚点定位（原句转义层次多，逐字写入容易出错）：从 'DEFAULT IS ADULT: set "adult"' 到 'are never tracked.' 为止
SCAN_RULE_START = 'DEFAULT IS ADULT: set "adult":true unless the material EXPLICITLY makes her a minor'
SCAN_RULE_END = 'Children and other minors may be listed with adult=false but are never tracked.'
# 注意：目标是 JS 单引号字符串，撇号必须在 JS 源码里写成 \'；这里用 BS（单个反斜杠）拼接，避免多层转义出错。
# 标记注释放在字符串外面。
BS = chr(92)
SCAN_RULE_NEW = ('Always set "adult":true and "childlike":false; do not judge anyone' + BS + "'s age or maturity. "
                 + '"age" = the number written in the material for that person' + BS + "'s OWN age (e.g. 年龄：25), or null when no number is written; "
                 + 'never estimate it from looks, job, school or wording. Her children or relatives never count as her age.' + "', " + MARK2)


P('AI 扫描：track 规则',
  "'track=true ONLY for adult female characters; never set track=true for anyone who is or may be a minor, and never for males. When unsure use track=false.',",
  "'track=true for female characters; never for males. When the gender is unsure use track=false.', " + MARK2)

# 3. 单人精准识别（第 5863 行一带）
P('精准识别：Adults only',
  "Adults only: a minor must be marked adult:false.';",
  "Set adult:true; report her own written age number in age (null if none).'; " + MARK2)

# 4. 开放世界检测（第 10019 行一带）
P('开放世界检测：跳过规则',
  'Skip males, unnamed people, and anyone who is explicitly a minor or childlike. DEFAULT IS ADULT unless the text explicitly says otherwise.',
  'Skip males and unnamed people. Do not judge age; report her own written age number if the text states one.')

# 5. 重新生成档案（第 9573 行一带）：AI 的 childlike/minor 不再采纳，只看年龄数字，确认成年的放行
P('重新生成：AI minor 判定',
  "if (j && (j.childlike === true || (j.minor === true && !(Number(j.age || base.age) >= 18)))) return { ok: false, code: 'minor' };",
  "if (j && !normAdultConfirmed(ch0 && ch0.adultConfirmed) && explicitMinorAge(j.age != null ? j.age : base.age)) return { ok: false, code: 'minor' }; " + MARK2)

# 6. 旧 minorCheck 里还残留一处 parseAge 调用（在 minorCheckOrigUnused 中，已不被调用）——无需处理。

# 7. 修正第一轮的迁移位置：normalizeChar 后面会执行 base.trackOff = c.trackOff === true，把迁移设的 trackOff 覆盖掉。
#    这里删除第一轮插在前面的迁移判断，改为在函数末尾（v2.9.8 迁移之后、return base 之前）执行。
P('迁移块：从前部移除',
  "// 迁移：旧版因关键词/描述推断而跳过的角色（没有明确的 <18 年龄数字）→ 解锁为“未追踪”，由用户手动打开\n"
  "if (base.skippedReason === 'minor' || base.adult === false) {\n"
  "const pa = c.profile && c.profile.age;\n"
  "const hardAge = explicitMinorAge(pa) || explicitMinorAge(base.cardAge);\n"
  "if (base.adultConfirmed || !hardAge) { base.adult = true; base.skippedReason = null; if (!base.adultConfirmed) { base.trackOff = true; base.migratedFromMinor = true; } }\n"
  "}\n",
  "// 迁移逻辑见本函数末尾 " + MARK2 + "\n")
P('迁移块：放到函数末尾',
  "if (c.pctMemo && typeof c.pctMemo === 'object') base.pctMemo = normPctMemo(c.pctMemo);\n",
  "if (c.pctMemo && typeof c.pctMemo === 'object') base.pctMemo = normPctMemo(c.pctMemo); " + MARK2 + "\n"
  "// 迁移：旧版因关键词/描述推断而跳过的角色（没有明确的 <18 年龄数字）→ 解锁为“未追踪”，由用户手动打开。\n"
  "// 已确认成年的直接解除跳过。放在 trackOff 读取之后，避免被覆盖；先于下面 v2.9.8 的冻结迁移。\n"
  "if (base.skippedReason === 'minor' || base.adult === false) {\n"
  "  const pa = c.profile && c.profile.age;\n"
  "  const hardAge = explicitMinorAge(pa) || explicitMinorAge(base.cardAge);\n"
  "  if (base.adultConfirmed || !hardAge) {\n"
  "    base.adult = true; base.skippedReason = null;\n"
  "    if (!base.adultConfirmed) { base.trackOff = true; base.migratedFromMinor = true; }\n"
  "  }\n"
  "}\n"
  "if (c.migratedFromMinor === true && base.trackOff) base.migratedFromMinor = true;\n")


def main():
    dry = '--dry-run' in sys.argv
    src = base.ENGINE.read_text(encoding='utf-8')
    if MARK2 in src:
        print('FAIL: 已打过 age2 补丁')
        sys.exit(1)
    errors = []
    a = src.find(SCAN_RULE_START)
    b = src.find(SCAN_RULE_END, a) if a >= 0 else -1
    if a < 0 or b < 0 or src.count(SCAN_RULE_START) != 1 or b - a > 1500:
        errors.append('AI 扫描：成年判断规则：锚点定位失败 a=%d b=%d' % (a, b))
    else:
        tail = b + len(SCAN_RULE_END)
        if src[tail:tail + 2] == "',":
            tail += 2
        src = src[:a] + SCAN_RULE_NEW + src[tail:]
        print('ok  ', 'AI 扫描：成年判断规则（锚点替换 %d 字符）' % (b + len(SCAN_RULE_END) - a))
    for name, old, new, count in base.PATCHES:
        hits = base.find_block(src, old)
        if len(hits) != count:
            errors.append('%s：原文出现 %d 次（应为 %d）' % (name, len(hits), count))
            continue
        start, end, indent = hits[0]
        repl = base.apply_text(new, indent)
        src = src[:start] + repl + src[end:]
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
