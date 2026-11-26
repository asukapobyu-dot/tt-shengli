#!/usr/bin/env python3
"""块 2b：语言包（locales/zh-CN.json、locales/en.json）。

- 新增 ttAge.* 键（确认成年入口、提示、错误、对话框）
- 改写旧文案：原来说“设定显示为未成年 / 可能未成年永远不会被追踪 / 未成年无法开启”的句子，
  改成新规则“只有明确写出的年龄 < 18 才不建档，可以确认成年”
- releaseNotes.* 是原插件的历史更新记录，保留原样（不是当前行为的说明）

两种语言都必须有同样的键；只改存在的键，键不存在就失败。
写回时保持与块 1 相同的格式（indent=1, ensure_ascii=False）。
用法：python3 build/patch_locales_age.py [--dry-run]
"""
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent / 'char-physiology-tt' / 'locales'

NEW = {
    'ttAge.confirm.btn': ('确认成年', 'Confirm adult'),
    'ttAge.confirm.hint': ('只在角色卡明确写了 {name} 已满 18 岁时使用。请填入卡上写的年龄，确认后会正常建立档案，AI 之后不能把年龄改到 18 岁以下。',
                           'Use this only if the character card clearly states that {name} is 18 or older. Enter the age written on the card; the profile is then built normally and the AI can no longer set the age below 18.'),
    'ttAge.confirm.ageLabel': ('卡上写的年龄', 'Age stated on the card'),
    'ttAge.confirm.ok': ('确认', 'Confirm'),
    'ttAge.confirm.errNum': ('请输入整数年龄', 'Enter a whole-number age'),
    'ttAge.confirm.errUnder': ('年龄需不小于 18 岁', 'The age must be 18 or older'),
    'ttAge.confirm.dialog': ('确认「{name}」在角色卡中明确写明已满 18 岁（{age} 岁）？\n确认后将按成年角色正常建档。',
                             'Confirm that the card clearly states "{name}" is 18 or older ({age})?\nThe character will then be profiled as an adult.'),
    'ttAge.confirm.done': ('已确认 {name} 成年（{age} 岁）', 'Confirmed {name} as an adult ({age})'),
    'ttAge.confirmed.tag': ('已确认成年 · {age} 岁', 'Confirmed adult · {age}'),
    'ttAge.minor.tag': ('年龄未满 18', 'Age under 18'),
    'ttAge.minor.save': ('未保存：年龄 {age} 岁未满 18，不会建档。若卡上写明已满 18 岁，请填写实际年龄。',
                         'Not saved: age {age} is under 18 and will not be profiled. If the card states 18+, enter the real age.'),
    'ttAge.revoke.dialog': ('把 {name} 的年龄改成 {age} 岁会取消“已确认成年”，并停止为她建档。确定吗？',
                            'Setting {name}\'s age to {age} removes the adult confirmation and stops her profile. Continue?'),
    'ttAge.revoke.done': ('已取消 {name} 的成年确认，停止建档', 'Removed the adult confirmation for {name}; profiling stopped'),
    'ttAge.migrated.hint': ('旧版本的年龄检测曾误判跳过了这个角色。新版只看明确写出的年龄，她现在可以正常追踪：在设置的追踪名单里打开开关即可。',
                            'The old age detection skipped this character by mistake. The new rule only uses an explicitly stated age, so she can be tracked: switch her on in the tracking list in Settings.'),
    'ttAge.migrated.row': ('旧版误判已解除，可打开追踪', 'Old misdetection cleared; you can track her'),
}

REWRITE = {
    'ui.skip.minor': ('{name} 的年龄写的是 18 岁以下，已跳过，不会建立档案。如果角色卡明确写了已满 18 岁，可以点「确认成年」。',
                      '{name}\'s stated age is under 18, so no profile is created. If the card clearly states 18+, use "Confirm adult".'),
    'ui.skip.short.minor': ('年龄未满 18，已跳过', 'Under 18, skipped'),
    'ui.settings.trackHint': ('关闭后该角色不再更新。年龄写明 18 岁以下的角色不会建档，若卡上写明已满 18 岁可点「确认成年」。性别无法判断或非女性的角色，打开开关即按成年女性角色追踪。',
                              'Turn a character off to stop updates. Characters whose stated age is under 18 are not profiled; use "Confirm adult" if the card states 18+. For non-female or unknown-gender characters, switching on tracks them as adult women.'),
    'ui.scan.intro': ('AI 会列出候选角色，勾选并修改后再应用。只有明确写出年龄 18 岁以下的角色会被排除；若卡上写明已满 18 岁，可点「确认成年」。',
                      'The AI lists candidates; tick and edit them before applying. Only characters with a stated age under 18 are excluded; use "Confirm adult" if the card states 18+.'),
    'ui.scan.minor': ('年龄未满 18', 'Under 18'),
    'ui.scan.minorHint': ('写明的年龄未满 18 岁，已排除。若卡上写明已满 18 岁，可点「确认成年」。',
                          'Stated age under 18, excluded. Use "Confirm adult" if the card states 18+.'),
    'ui.inject.hint': ('仅模型可见，不会改动聊天里保存的消息；不会包含年龄未满 18、被跳过或已关闭追踪的角色。',
                       'Model-only; the saved chat message is unchanged. Characters under 18, skipped or untracked are never included.'),
    'ui5.minor': ('未保存：年龄未满 18 岁不会建档', 'Not saved: characters under 18 are not profiled'),
    'ui7.add.err.minor': ('无法添加：描述里写的年龄未满 18 岁。若卡上写明已满 18 岁，可点「确认成年」后再添加。',
                          'Cannot add: the stated age is under 18. If the card states 18+, use "Confirm adult" and add again.'),
}

DESC_OLD = '· 仅适用于**虚构的成年女性角色**。未成年或身心幼态的角色一律不建档，也不会被卷入性交内容。'
DESC_NEW = ('· 仅适用于**虚构的成年女性角色**。TauriTavern 移植版不再按描述关键词猜测年龄：只有明确写出的年龄未满 18 岁才不建档；'
            '角色卡写明已满 18 岁的可以「确认成年」后正常建档。被记录的子女等未成年人只作事实记录，永远不会被卷入性交内容。')


def main():
    dry = '--dry-run' in sys.argv
    data = {}
    for i, loc in enumerate(('zh-CN', 'en')):
        p = ROOT / ('%s.json' % loc)
        d = json.loads(p.read_text(encoding='utf-8'))
        clash = [k for k in NEW if k in d]
        missing = [k for k in REWRITE if k not in d]
        if clash or missing:
            print('FAIL %s 冲突=%s 缺失=%s' % (loc, clash, missing))
            sys.exit(1)
        for k, v in REWRITE.items():
            d[k] = v[i]
        for k, v in NEW.items():
            d[k] = v[i]
        # 插件简介（两个语言包里都是原作者的中文原文）：只替换声明里那一句
        desc = d.get('plugin.description', '')
        if desc.count(DESC_OLD) != 1:
            print('FAIL %s plugin.description 里找不到声明原句（出现 %d 次）' % (loc, desc.count(DESC_OLD)))
            sys.exit(1)
        d['plugin.description'] = desc.replace(DESC_OLD, DESC_NEW)
        data[loc] = (p, d)
    z, e = data['zh-CN'][1], data['en'][1]
    if set(z) != set(e):
        print('FAIL 两种语言键不一致：', sorted(set(z) ^ set(e))[:10])
        sys.exit(1)
    # 占位符一致性：新改的键里，两种语言的 {xxx} 必须相同
    import re
    for k in list(NEW) + list(REWRITE):
        a = sorted(set(re.findall(r'\{(\w+)\}', z[k]))); b = sorted(set(re.findall(r'\{(\w+)\}', e[k])))
        if a != b:
            print('FAIL 占位符不一致', k, a, b)
            sys.exit(1)
    print('新增 %d 键，改写 %d 键；两种语言各 %d 键' % (len(NEW), len(REWRITE), len(z)))
    if dry:
        print('dry-run：未写入')
        return
    for loc, (p, d) in data.items():
        p.write_text(json.dumps(d, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print('已写入 zh-CN.json、en.json')


if __name__ == '__main__':
    main()
