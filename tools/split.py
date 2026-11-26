#!/usr/bin/env python3
"""块 1：把原 Tavo 插件包拆成 TauriTavern / SillyTavern 扩展的模块骨架。

- 引擎：entry.js 第 1–11470 行（与 ui/panel.js 前 11470 行逐字相同）
        原写法 `const PHYS = (function (tavo) { ... })(tavo);`
        改为 `export function createEngine(tavo) { return (function (tavo) { ... })(tavo); }`
- 面板：ui/panel.js 第 11471 行到结尾，原写法 `(function () { const E = PHYS; ... })();`
        改为 `export function mountPanel(PHYS, tavo) { ... }`，返回 dispose 函数
- 原 entry glue（第 11471 行起）原样存档到 src/legacy/，块 5 重写时对照用
- 样式、语言包、图标原样复制（样式表的作用域和改动在块 6 处理）

代码内容这里不做任何修改，只做包装，方便后面逐块 diff 审查。
"""
import hashlib
import json
import pathlib
import shutil
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent  # 在移植工作区 build/ 下运行；仓库内 tools/ 仅作存档
SRC = ROOT / 'original' / 'src'
OUT = ROOT / 'char-physiology-tt'

EXPECTED_SHA = 'b9b70b0545bf5fa9cd9277c2dfb32a3d7305dc62d10ff5f6ab847defc54b0768'


def fail(msg):
    print('FAIL:', msg)
    sys.exit(1)


def bare(comment):
    """去掉 /* */ 标记和等号装饰，避免嵌套进新注释时提前闭合。"""
    s = comment.strip()
    if s.startswith('/*'):
        s = s[2:]
    if s.endswith('*/'):
        s = s[:-2]
    s = s.replace('*/', '* /').strip().strip('=').strip()
    return s


def main():
    # 防覆盖：块 2 起会直接修改 src/engine.js 与 src/panel.js，再次运行本脚本会抹掉这些修改
    if (OUT / 'src' / 'engine.js').exists() and '--force' not in sys.argv:
        fail('src/engine.js 已存在。块 1 之后不要再运行本脚本（会覆盖后续修改）；确需重建请加 --force')

    tpg = ROOT / 'original' / 'plugin-3.0.32.tpg'
    sha = hashlib.sha256(tpg.read_bytes()).hexdigest()
    if sha != EXPECTED_SHA:
        fail('原包 sha256 不一致: ' + sha)

    entry = (SRC / 'entry.js').read_text(encoding='utf-8').split('\n')
    panel = (SRC / 'ui' / 'panel.js').read_text(encoding='utf-8').split('\n')

    # ---- 定位并校验边界（按标记行，不写死行号）----
    ends = [i for i, l in enumerate(entry) if l == '})(tavo);']
    if len(ends) != 1:
        fail('引擎结尾标记 `})(tavo);` 应恰好出现一次，实际 %d 次' % len(ends))
    eng_end = ends[0]  # 0-based 下标
    glue_at = next((i for i, l in enumerate(entry) if l.startswith('/* ===== entry glue')), None)
    ui_at = next((i for i, l in enumerate(panel) if l.startswith('/* ===== panel UI')), None)
    if glue_at is None or ui_at is None:
        fail('找不到 entry glue / panel UI 起始标记')
    if glue_at != ui_at:
        fail('entry glue 与 panel UI 起始行不一致: %d vs %d' % (glue_at, ui_at))
    if any(l.strip() for l in entry[eng_end + 1:glue_at]):
        fail('引擎结尾与 entry glue 之间有非空行')
    if entry[:glue_at] != panel[:ui_at]:
        fail('entry.js 与 panel.js 的引擎部分不一致')
    if entry[1] != 'const PHYS = (function (tavo) {':
        fail('引擎开头不符: ' + entry[1])
    if panel[ui_at + 1] != '(function () {':
        fail('panel IIFE 开头不符: ' + panel[ui_at + 1])
    if panel[ui_at + 2] != '  const E = PHYS;':
        fail('panel 第一行不符: ' + panel[ui_at + 2])
    print('引擎: 第 2–%d 行；glue/UI 起始: 第 %d 行' % (eng_end + 1, glue_at + 1))
    tail = [l for l in panel if l.strip() != '']
    if tail[-1] != '})();' or tail[-2] != '  document.documentElement.__physDispose = dispose;':
        fail('panel 结尾不符: ' + repr(tail[-2:]))

    # ---- 引擎 ----
    header = entry[0]
    body = entry[2:eng_end]  # 'use strict' 到 return {...};
    engine = [
        '/*',
        ' * Character Physiology engine — 移植自 Tavo 插件 com.taby.char-physiology v3.0.32',
        ' * 原作者：Taby / KeeK。宿主接口 tavo.* 由 src/tavo-shim.js 适配到 SillyTavern / TauriTavern。',
        ' * 原始头注释：' + bare(header),
        ' */',
        'export function createEngine(tavo) {',
        '  return (function (tavo) {',
    ]
    engine += ['  ' + l if l else l for l in body]
    engine += [
        '  })(tavo);',
        '}',
        '',
    ]
    (OUT / 'src' / 'engine.js').write_text('\n'.join(engine), encoding='utf-8')

    # ---- 面板 ----
    pbody = panel[ui_at + 3:]  # 'const E = PHYS;' 之后
    while pbody and pbody[-1].strip() == '':
        pbody.pop()
    assert pbody[-1] == '})();'
    pbody = pbody[:-1]
    assert pbody[-1] == '  document.documentElement.__physDispose = dispose;'
    pnl = [
        '/*',
        ' * Character Physiology panel UI — 移植自 Tavo 插件 com.taby.char-physiology v3.0.32（原作者：Taby / KeeK）',
        ' * 原始头注释：' + bare(panel[ui_at]),
        ' * mountPanel(PHYS, tavo) 挂载面板并返回 dispose。',
        ' */',
        'export function mountPanel(PHYS, tavo) {',
        '  const E = PHYS;',
    ]
    pnl += pbody
    pnl += [
        '  return dispose;',
        '}',
        '',
    ]
    (OUT / 'src' / 'panel.js').write_text('\n'.join(pnl), encoding='utf-8')

    # ---- 原 entry glue 存档（不参与加载）----
    legacy = OUT / 'src' / 'legacy'
    legacy.mkdir(exist_ok=True)
    glue = entry[glue_at:]
    (legacy / 'tavo-entry-glue.js.txt').write_text(
        '// 原 Tavo 插件 entry.js 第 %d 行起的后台接线代码，仅供块 5 重写对照，不会被加载。\n' % (glue_at + 1)
        + '\n'.join(glue), encoding='utf-8')
    shutil.copy(SRC / 'manifest.json', legacy / 'tavo-manifest.json')

    # ---- 资源 ----
    shutil.copy(SRC / 'ui' / 'panel.css', OUT / 'style.css')
    for loc in ('zh-CN', 'en'):
        data = json.loads((SRC / 'locales' / (loc + '.json')).read_text(encoding='utf-8'))
        (OUT / 'locales' / (loc + '.json')).write_text(
            json.dumps(data, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    for f in ('icon.png', 'refresh.png'):
        shutil.copy(SRC / 'icons' / f, OUT / 'icons' / f)
    shutil.copy(SRC / 'cover.png', OUT / 'icons' / 'cover.png')

    print('engine.js  %d 行' % len(engine))
    print('panel.js   %d 行' % len(pnl))
    print('legacy glue %d 行' % len(glue))
    print('OK')


if __name__ == '__main__':
    main()
