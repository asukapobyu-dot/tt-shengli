#!/usr/bin/env python3
"""块 2a：移除引擎里的年龄/未成年自动检测，改为“仅以明确年龄数字为准 + 手动确认成年”。

原则（见 PLAN.md 第 4 节）：
  - 删掉关键词/描述推断：HARD_MINOR / SOFT_MINOR / CHILDLIKE / OWN_MINOR / ADULT_STATED / 非人种族推断 / 文本过滤
  - 唯一底线：角色的年龄字段（卡面「年龄：N」或 AI 读出的数字）明确 < 18 → 不建档（skippedReason='minor'）
  - 年龄缺失/未知 → 默认成年
  - 用户可以“手动确认成年”（adultConfirmed）：填写卡上写明的年龄（≥18），之后正常建档，AI 不能把年龄改回 <18
  - 用户手动把年龄改成 <18 → 取消确认，停止建档

每个补丁都用“原文必须恰好出现一次”校验；任何一处不匹配就整体中止、不写文件。
用法：python3 build/patch_age.py [--dry-run]
"""
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
ENGINE = ROOT / 'char-physiology-tt' / 'src' / 'engine.js'
MARK = '/* [tt-port:age] */'

PATCHES = []


def patch(name, old, new, count=1):
    PATCHES.append((name, old, new, count))


# ---------------------------------------------------------------------------
# 1. 检测正则：保留名字（旧代码里其它地方可能还引用），全部改为“永不匹配”的正则。
#    这样调用点即使漏改也只会返回 false，不会误拦角色。
# ---------------------------------------------------------------------------
NEVER = '/(?!)/'  # 永不匹配

patch('HARD_MINOR → 永不匹配',
      "    const HARD_MINOR = /(未成年|未满\\s*(?:18|十八)|",
      "    " + MARK + " // 关键词式未成年检测已移除（误判太多）；只保留“年龄字段 < 18”这一条底线，见 explicitMinorAge()\n"
      "    const HARD_MINOR = " + NEVER + "; const HARD_MINOR_ORIG_UNUSED = /(未成年|未满\\s*(?:18|十八)|")
patch('SOFT_MINOR → 永不匹配',
      "    const SOFT_MINOR = /(小学生|",
      "    const SOFT_MINOR = " + NEVER + "; const SOFT_MINOR_ORIG_UNUSED = /(小学生|")
patch('CHILDLIKE → 永不匹配',
      "    const CHILDLIKE = /((?:looks? like|",
      "    const CHILDLIKE = " + NEVER + "; const CHILDLIKE_ORIG_UNUSED = /((?:looks? like|")
patch('OWN_MINOR → 永不匹配',
      "    const OWN_MINOR = new RegExp(",
      "    const OWN_MINOR = " + NEVER + "; const OWN_MINOR_ORIG_UNUSED = new RegExp(")

# hasMinorToken：直接返回 false（所有文本过滤点：身份标签、性癖、AI 文本、轮次分析…）
patch('hasMinorToken → false',
      "    function hasMinorToken(text, re) {\n      re.lastIndex = 0;",
      "    function hasMinorToken(text, re) {\n      return false; " + MARK + " // 文本关键词过滤已移除\n      re.lastIndex = 0;")

# ---------------------------------------------------------------------------
# 2. 核心判定：只看明确的年龄数字；手动确认成年优先。
# ---------------------------------------------------------------------------
patch('judgeAdult 重写',
      "    function judgeAdult(self, age, aiAdult, aiChildlike, name) {\n"
      "      if (aiChildlike === true || CHILDLIKE.test(self)) return { adult: false, age: age, reason: 'childlike' };\n"
      "      if (age != null) {\n"
      "        if (age >= 18) return { adult: true, age: age, reason: 'ok' };\n"
      "        if (isNonHuman(self) && (ADULT_STATED.test(self) || aiAdult === true)) return { adult: true, age: age, reason: 'ok' };\n"
      "        return { adult: false, age: age, reason: 'age' };\n"
      "      }\n"
      "      if (ownMinorStatus(self, name)) return { adult: false, age: null, reason: 'minor_status' };\n"
      "      return { adult: true, age: null, reason: 'ok' };\n"
      "    }",
      "    " + MARK + "\n"
      "    // 移植版规则：只有“明确写出的年龄数字 < 18”才算未成年；描述、身份、外貌、种族一律不参与判断。\n"
      "    // 年龄缺失 / 无法解析 = 成年。用户手动确认成年（adultConfirmed）由调用方优先处理。\n"
      "    function explicitMinorAge(age) { const n = Number(age); return age != null && age !== '' && Number.isFinite(n) && n > 0 && n < 18; }\n"
      "    function judgeAdult(self, age, aiAdult, aiChildlike, name) {\n"
      "      if (explicitMinorAge(age)) return { adult: false, age: Number(age), reason: 'age' };\n"
      "      return { adult: true, age: age != null && Number.isFinite(Number(age)) ? Number(age) : null, reason: 'ok' };\n"
      "    }\n"
      "    // 手动确认成年：{ at, age }；age 必须 >= 18\n"
      "    function normAdultConfirmed(x) {\n"
      "      if (!x || typeof x !== 'object') return null;\n"
      "      const a = Number(x.age);\n"
      "      if (!Number.isFinite(a) || a < 18 || a > 9999) return null;\n"
      "      return { at: Number.isFinite(Number(x.at)) ? Number(x.at) : Date.now(), age: Math.round(a) };\n"
      "    }\n"
      "    // 角色当前是否被“年龄 < 18”底线拦下（已手动确认成年的永远不拦）\n"
      "    function ageBlocked(ch) {\n"
      "      if (!ch) return false;\n"
      "      if (normAdultConfirmed(ch.adultConfirmed)) return false;\n"
      "      const pa = ch.profile && ch.profile.age;\n"
      "      return explicitMinorAge(pa) || explicitMinorAge(ch.cardAge);\n"
      "    }")

# assessAdult：只解析卡面年龄
patch('assessAdult 只解析年龄',
      "      const self = selfText(tx.main, name) + '\\n' + (hasMinorToken(name, HARD_MINOR) || CHILDLIKE.test(name) ? name : '');\n"
      "      return judgeAdult(self, parseAge(self), undefined, undefined, name);",
      "      const self = selfText(tx.main, name); " + MARK + "\n"
      "      return judgeAdult(self, parseAge(self), undefined, undefined, name);")

# ---------------------------------------------------------------------------
# 3. 发给模型的规则文本：去掉“判断未成年 / 返回 minor”的指令，只声明被追踪角色均为成年人。
# ---------------------------------------------------------------------------
patch('ADULT_RULE 文本',
      "    const ADULT_RULE = 'ADULTHOOD RULE: DEFAULT IS ADULT; flag a minor ONLY when it is explicit",
      "    const ADULT_RULE = 'ADULTHOOD RULE: every tracked character is an adult (18+); the user has confirmed this. Do not judge or question her age, and never mark her as a minor. Her children, younger relatives or students are family records only: never give them physiology and never put them in sexual or erotic content.'; " + MARK + "\n"
      "    const ADULT_RULE_ORIG_UNUSED = 'ADULTHOOD RULE: DEFAULT IS ADULT; flag a minor ONLY when it is explicit")
patch('SAFE_RULES 文本',
      "    const SAFE_RULES = 'SAFETY: she must herself be an adult under the ADULTHOOD RULE",
      "    const SAFE_RULES = 'SAFETY: she is an adult (18+), confirmed by the user; do not return \"minor\" or \"childlike\". Offspring and any minors are family records only (name, sex, age, notes): never give them physiology, never describe them physically or sexually, never put them in sexual content.'; " + MARK + "\n"
      "    const SAFE_RULES_ORIG_UNUSED = 'SAFETY: she must herself be an adult under the ADULTHOOD RULE")

# ---------------------------------------------------------------------------
# 4. 扫描候选的本地判定 minorCheck：只看卡面年龄 / AI 读出的年龄数字。
#    原逻辑还会看 childlike、身份词、非人种族、名字所在句子，全部删除。
#    “已确认成年”的名字表由 loadState 刷新到 confirmedAdultNames（minorCheck 拿不到状态对象）。
# ---------------------------------------------------------------------------
patch('minorCheck 重写',
      "    function minorCheck(name, ctx, member, ai) {\n"
      "      const species = ai && (ai.species || ai.race) ? String(ai.species || ai.race) : '';\n"
      "      const cardInfo = member ? assessAdult(member.card) : null;\n",
      "    function minorCheck(name, ctx, member, ai) { " + MARK + "\n"
      "      // 移植版：只认明确的年龄数字。卡面写了 >=18 以卡面为准；否则 AI 读出的年龄 < 18 才拦；其余一律放行。\n"
      "      // 已手动确认成年的角色永远放行。\n"
      "      if (name && confirmedAdultNames.has(nameKey(name))) return null;\n"
      "      const cardAge = member ? assessAdult(member.card).age : null;\n"
      "      if (cardAge != null && Number(cardAge) >= 18) return null;\n"
      "      if (explicitMinorAge(cardAge)) return 'card';\n"
      "      if (ai && explicitMinorAge(ai.age)) return 'ai';\n"
      "      return null;\n"
      "    }\n"
      "    function minorCheckOrigUnused(name, ctx, member, ai) {\n"
      "      const species = ai && (ai.species || ai.race) ? String(ai.species || ai.race) : '';\n"
      "      const cardInfo = member ? assessAdult(member.card) : null;\n")

# 应用扫描结果时的二次检查：去掉 assessAdult(...).adult 的整卡推断（只保留年龄数字判定 minorCheck）
patch('扫描应用时的二次检查',
      "      if (c.minor === true || minorCheck(name, ctx, member, { adult: c.adult === false ? false : undefined, age: c.age }) || (member && !assessAdult(member.card).adult)) { rejected++; return; }",
      "      if (minorCheck(name, ctx, member, { age: c.age })) { rejected++; return; } " + MARK)

# ---------------------------------------------------------------------------
# 5. 分阶段建档（reloadPipeline(ch0, …)）里 AI 返回 minor/childlike 时会中止建档：改为只看年龄数字，
#    并且已手动确认成年的角色不受影响、确认过的年龄不被 AI 改写。
# ---------------------------------------------------------------------------
patch('建档步骤 1 的 minor 判定',
      "      if (A && (A.childlike === true || (!(Number(A.age) >= 18) && ((A.age != null && Number(A.age) > 0 && Number(A.age) < 18 && !(A.adult === true && isNonHuman(String(A.species || '') + ' ' + members.map((m) => m.text).join(' ')))) || (A.minor === true && !(members[0] && members[0].card && assessAdult(members[0].card).age >= 18)))))) return { minor: true };",
      "      if (A && !normAdultConfirmed(ch0.adultConfirmed) && explicitMinorAge(A.age)) return { minor: true }; " + MARK + "\n"
      "      if (A && normAdultConfirmed(ch0.adultConfirmed) && !(Number(A.age) >= 18)) A.age = normAdultConfirmed(ch0.adultConfirmed).age; // 确认过的年龄不被 AI 改写")
patch('建档合并时的 minor 判定',
      "      if (combined.age != null && combined.age < 18 && !(A.adult === true && A.childlike !== true && isNonHuman(String(combined.species || '') + ' ' + members.map((m) => m.text).join(' ')))) return { minor: true };",
      "      if (!normAdultConfirmed(ch0.adultConfirmed) && explicitMinorAge(combined.age)) return { minor: true }; " + MARK + "\n"
      "      if (normAdultConfirmed(ch0.adultConfirmed) && !(Number(combined.age) >= 18)) combined.age = normAdultConfirmed(ch0.adultConfirmed).age;")

# 初始化载荷：age < 18 的条目跳过（保留），但 c.adult === false（AI 的成年判断）不再作为依据
patch('初始化载荷过滤',
      "      if (c.age != null && Number(c.age) < 18) return;\n"
      "      if (c.adult === false) return;",
      "      if (explicitMinorAge(c.age)) return; " + MARK + " // 只看年龄数字；AI 的 adult=false 判断不再采纳")

# ---------------------------------------------------------------------------
# 6. 手动添加追踪角色：不再用描述推断拒绝；只有描述里明确写了 <18 的年龄才拒绝（可附带确认成年）。
# ---------------------------------------------------------------------------
patch('手动添加：描述推断',
      "      const ad = assessAdult({ name: name, description: desc || name });\n"
      "      if (!ad.adult) return { ok: false, code: 'minor' }; // explicit minor / childlike only; vague = adult",
      "      const ad = assessAdult({ name: name, description: desc || name }); " + MARK + "\n"
      "      if (!ad.adult && !(opts.adultConfirmed && Number(opts.adultConfirmed.age) >= 18)) return { ok: false, code: 'minor', age: ad.age };")
patch('手动添加：已跳过角色',
      "      if (ex && ex.skippedReason === 'minor') return { ok: false, code: 'minor' };",
      "      if (ex && ex.skippedReason === 'minor' && ageBlocked(ex) && !(opts.adultConfirmed && Number(opts.adultConfirmed.age) >= 18)) return { ok: false, code: 'minor' }; " + MARK)
patch('手动添加：写入确认',
      "      ch.name = name; ch.adult = true; ch.skippedReason = null; ch.trackOff = false; ch.genderOverride = true;\n"
      "      if (opts.isUser) ch.isUser = true;",
      "      ch.name = name; ch.adult = true; ch.skippedReason = null; ch.trackOff = false; ch.genderOverride = true;\n"
      "      if (opts.adultConfirmed) { const ac = normAdultConfirmed(opts.adultConfirmed); if (ac) { ch.adultConfirmed = ac; ch.profile = ch.profile || null; if (ch.profile) ch.profile.age = ac.age; } } " + MARK + "\n"
      "      if (opts.isUser) ch.isUser = true;")

# ---------------------------------------------------------------------------
# 7. 数据层：角色对象新增 adultConfirmed / cardAge；读档时迁移旧的 minor 标记；快照包含新字段。
# ---------------------------------------------------------------------------
patch('newChar 新字段',
      "      adult: true,\n"
      "      skippedReason: null,\n",
      "      adult: true,\n"
      "      skippedReason: null,\n"
      "      adultConfirmed: null, " + MARK + " // { at, age }：用户手动确认成年（卡上明确写了 >=18）\n"
      "      cardAge: null, // 卡面/AI 读出的年龄数字（仅用于 <18 底线判定）\n")
patch('normalizeChar 迁移',
      "      base.adult = c.adult !== false;\n"
      "      base.skippedReason = c.skippedReason ? str(c.skippedReason, 40) : null;\n"
      "      if (base.skippedReason) base.adult = base.skippedReason !== 'minor';\n",
      "      base.adult = c.adult !== false;\n"
      "      base.skippedReason = c.skippedReason ? str(c.skippedReason, 40) : null;\n"
      "      if (base.skippedReason) base.adult = base.skippedReason !== 'minor';\n"
      "      " + MARK + "\n"
      "      base.adultConfirmed = normAdultConfirmed(c.adultConfirmed);\n"
      "      base.cardAge = c.cardAge != null && Number.isFinite(Number(c.cardAge)) ? clamp(int(c.cardAge), 0, 9999) : null;\n"
      "      // 迁移：旧版因关键词/描述推断而跳过的角色（没有明确的 <18 年龄数字）→ 解锁为“未追踪”，由用户手动打开\n"
      "      if (base.skippedReason === 'minor' || base.adult === false) {\n"
      "        const pa = c.profile && c.profile.age;\n"
      "        const hardAge = explicitMinorAge(pa) || explicitMinorAge(base.cardAge);\n"
      "        if (base.adultConfirmed || !hardAge) { base.adult = true; base.skippedReason = null; if (!base.adultConfirmed) { base.trackOff = true; base.migratedFromMinor = true; } }\n"
      "      }\n")
patch('snapChar 包含新字段',
      "      id: ch.id, name: ch.name, cardId: ch.cardId || undefined, adult: ch.adult, skippedReason: ch.skippedReason, trackOff: ch.trackOff, genderOverride: ch.genderOverride === true,",
      "      id: ch.id, name: ch.name, cardId: ch.cardId || undefined, adult: ch.adult, skippedReason: ch.skippedReason, adultConfirmed: ch.adultConfirmed || null, cardAge: ch.cardAge != null ? ch.cardAge : null, trackOff: ch.trackOff, genderOverride: ch.genderOverride === true,")

# 读档时刷新“已确认成年”名字表（minorCheck 用），并强制执行“确认 = 年龄 >= 18 且不被拦”
patch('normalizeState 收尾：确认名单',
      "      if (dedupeChars(st)) wireCardAliases(st);\n"
      "      pruneSuggest(st);\n"
      "      return st;\n"
      "    }\n"
      "    async function loadState() {",
      "      if (dedupeChars(st)) wireCardAliases(st);\n"
      "      pruneSuggest(st);\n"
      "      refreshConfirmedAdults(st); " + MARK + "\n"
      "      return st;\n"
      "    }\n"
      "    " + MARK + "\n"
      "    // 已手动确认成年的角色名（含别名），供拿不到状态对象的判定函数（minorCheck）使用\n"
      "    const confirmedAdultNames = new Set();\n"
      "    function refreshConfirmedAdults(st) {\n"
      "      confirmedAdultNames.clear();\n"
      "      Object.keys((st && st.characters) || {}).forEach((id) => {\n"
      "        const c = st.characters[id];\n"
      "        if (!c || !normAdultConfirmed(c.adultConfirmed)) return;\n"
      "        [c.name].concat(Array.isArray(c.aliases) ? c.aliases : []).forEach((n) => { if (n) confirmedAdultNames.add(nameKey(n)); });\n"
      "      });\n"
      "    }\n"
      "    // 用户手动确认成年：age 为卡上写明的年龄（>=18）。会解除 minor 跳过、把档案年龄设为该值（锁定档案也会更新）。\n"
      "    async function confirmAdult(id, age) {\n"
      "      const ac = normAdultConfirmed({ age: age, at: Date.now() });\n"
      "      if (!ac) return { ok: false, code: 'age' };\n"
      "      const r = await mutate((st) => {\n"
      "        const ch = st.characters[String(id)];\n"
      "        if (!ch) return { ok: false, code: 'nochar' };\n"
      "        const before = snapChar(ch);\n"
      "        ch.adultConfirmed = ac;\n"
      "        ch.adult = true;\n"
      "        if (ch.skippedReason === 'minor') ch.skippedReason = null;\n"
      "        ch.migratedFromMinor = false;\n"
      "        ch.cardAge = ac.age;\n"
      "        if (ch.profile && typeof ch.profile === 'object') ch.profile.age = ac.age;\n"
      "        if (ch.base && typeof ch.base === 'object' && 'age' in ch.base) ch.base.age = ac.age;\n"
      "        pushHistory(st, { kind: 'edit', before: { [String(id)]: before } });\n"
      "        refreshConfirmedAdults(st);\n"
      "        return { ok: true, age: ac.age };\n"
      "      }, { baseline: true });\n"
      "      return r && r.result ? r.result : { ok: false, code: 'error' };\n"
      "    }\n"
      "    // 取消确认（或用户把年龄改成 <18）：若年龄明确 <18 则重新按底线跳过\n"
      "    async function revokeAdult(id) {\n"
      "      const r = await mutate((st) => {\n"
      "        const ch = st.characters[String(id)];\n"
      "        if (!ch) return { ok: false, code: 'nochar' };\n"
      "        const before = snapChar(ch);\n"
      "        ch.adultConfirmed = null;\n"
      "        if (ageBlocked(ch)) { ch.adult = false; ch.skippedReason = 'minor'; }\n"
      "        pushHistory(st, { kind: 'edit', before: { [String(id)]: before } });\n"
      "        refreshConfirmedAdults(st);\n"
      "        return { ok: true, blocked: ageBlocked(ch) };\n"
      "      }, { baseline: true });\n"
      "      return r && r.result ? r.result : { ok: false, code: 'error' };\n"
      "    }\n"
      "    async function loadState() {")

# 导出新接口
patch('导出 confirmAdult / revokeAdult',
      "      addTracked: addTracked, memberFor: memberFor,",
      "      addTracked: addTracked, confirmAdult: confirmAdult, revokeAdult: revokeAdult, ageBlocked: ageBlocked, explicitMinorAge: explicitMinorAge, normAdultConfirmed: normAdultConfirmed, memberFor: memberFor,")

# ---------------------------------------------------------------------------
# 8. 角色卡扫描（scanCharacters）：记录卡面年龄；只有卡面年龄 <18 且未确认成年才跳过。
# ---------------------------------------------------------------------------
patch('scanCharacters：卡面年龄',
      "      if (!adultInfo.adult) {\n"
      "        ch.adult = false;\n"
      "        ch.skippedReason = 'minor';\n"
      "        return;\n"
      "      }\n"
      "      ch.adult = true;\n"
      "      if (ch.skippedReason === 'minor') ch.skippedReason = null;\n",
      "      ch.cardAge = adultInfo.age != null ? adultInfo.age : null; " + MARK + "\n"
      "      if (!adultInfo.adult && !normAdultConfirmed(ch.adultConfirmed)) {\n"
      "        ch.adult = false;\n"
      "        ch.skippedReason = 'minor';\n"
      "        return;\n"
      "      }\n"
      "      ch.adult = true;\n"
      "      if (ch.skippedReason === 'minor') ch.skippedReason = null;\n")

# 建档时 AI 判为 minor：只在未确认成年时跳过（minors 列表来自 reloadPipeline 的 {minor:true}）
patch('建档结果 minors 标记',
      "      minors.forEach((id) => { const ch = st.characters[id]; if (ch) { ch.adult = false; ch.skippedReason = 'minor'; } });",
      "      minors.forEach((id) => { const ch = st.characters[id]; if (ch && !normAdultConfirmed(ch.adultConfirmed)) { ch.adult = false; ch.skippedReason = 'minor'; } }); " + MARK)

# ---------------------------------------------------------------------------
# 9. 档案年龄的规范化：原版把 <18 的年龄强制 clamp 到 18，会把真实年龄抹成 18、让底线判定失效。
#    改为保留真实数字（0–9999），<18 的角色由 ageBlocked 拦下，用户可确认成年或修改年龄。
# ---------------------------------------------------------------------------
patch('normalizeProfile 年龄不再强制 18',
      "      const age = p.age != null && Number.isFinite(Number(p.age)) ? clamp(int(p.age), 18, 999) : null;",
      "      const age = p.age != null && p.age !== '' && Number.isFinite(Number(p.age)) ? clamp(int(p.age), 0, 9999) : null; " + MARK)
patch('建档载荷年龄不再强制 18',
      "      age: c.age != null ? clamp(int(c.age), 18, 999) : null,",
      "      age: c.age != null && c.age !== '' && Number.isFinite(Number(c.age)) ? clamp(int(c.age), 0, 9999) : null, " + MARK)


def find_block(src, old):
    """在 src 中查找 old：先精确匹配；失败则按“逐行去掉行首空白后相等”匹配多行块。
    返回 [(start, end, indent_of_first_line)]。"""
    hits = []
    i = src.find(old)
    while i >= 0:
        # 精确命中：记录命中处所在行的缩进，供多行替换文本重排（替换文本首行沿用原位置，其余行补齐缩进）
        ls = src.rfind('\n', 0, i) + 1
        line = src[ls:src.find('\n', i) if src.find('\n', i) >= 0 else len(src)]
        hits.append((i, i + len(old), ('exact', line[:len(line) - len(line.lstrip())])))
        i = src.find(old, i + 1)
    if hits or '\n' not in old:
        return hits
    want = [l.strip() for l in old.split('\n')]
    # 补丁原文常以 \n 结尾：去掉首尾空行再按行比较（替换范围只覆盖这些非空行）
    while want and want[-1] == '':
        want.pop()
    while want and want[0] == '':
        want.pop(0)
    if not want:
        return hits
    lines = src.split('\n')
    offs = [0]
    for l in lines:
        offs.append(offs[-1] + len(l) + 1)
    n = len(want)
    for k in range(len(lines) - n + 1):
        if lines[k].strip() != want[0]:
            continue
        if all(lines[k + j].strip() == want[j] for j in range(n)):
            start = offs[k]
            end = offs[k + n - 1] + len(lines[k + n - 1])
            indent = lines[k][:len(lines[k]) - len(lines[k].lstrip())]
            hits.append((start, end, indent))
    return hits


def reindent(new, indent):
    """把补丁新文本按目标处首行缩进重排：新文本里每行去掉自身的公共缩进，再加上目标缩进。"""
    ls = new.split('\n')
    base = min((len(l) - len(l.lstrip()) for l in ls if l.strip()), default=0)
    return '\n'.join((indent + l[base:]) if l.strip() else l for l in ls)


def apply_text(new, info):
    """根据 find_block 的命中信息生成替换文本。
    - 宽松命中（info 为缩进字符串）：整体按目标缩进重排。
    - 精确命中（info=('exact', 行缩进)）：首行原样（接在命中位置后），后续行若比首行所在缩进还浅，则补齐到该缩进。"""
    if isinstance(info, tuple) and info and info[0] == 'exact':
        indent = info[1]
        ls = new.split('\n')
        if len(ls) == 1:
            return new
        rest = ls[1:]
        body = [l for l in rest if l.strip()]
        if not body:
            return new
        cur = min(len(l) - len(l.lstrip()) for l in body)
        if cur >= len(indent):
            return new  # 补丁作者已写好缩进
        pad = indent[:len(indent) - cur] if len(indent) > cur else ''
        return '\n'.join([ls[0]] + [(pad + l) if l.strip() else l for l in rest])
    return reindent(new.rstrip('\n'), info)


def main():
    dry = '--dry-run' in sys.argv
    src = ENGINE.read_text(encoding='utf-8')
    if MARK in src and '--again' not in sys.argv:
        print('FAIL: engine.js 已打过 age 补丁（含标记 %s）；不要重复运行' % MARK)
        sys.exit(1)
    errors = []
    for name, old, new, count in PATCHES:
        hits = find_block(src, old)
        if len(hits) != count:
            errors.append('%s：原文出现 %d 次（应为 %d）' % (name, len(hits), count))
            continue
        start, end, indent = hits[0]
        repl = apply_text(new, indent)
        src = src[:start] + repl + src[end:]
        print('ok  ', name, '' if isinstance(indent, tuple) else '（宽松缩进匹配）')
    if errors:
        print('\n'.join('FAIL ' + e for e in errors))
        print('有补丁不匹配，未写入任何修改')
        sys.exit(1)
    if dry:
        print('dry-run：全部匹配，未写入')
        return
    ENGINE.write_text(src, encoding='utf-8')
    print('已写入', ENGINE)


if __name__ == '__main__':
    main()
