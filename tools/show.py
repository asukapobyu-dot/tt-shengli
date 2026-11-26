#!/usr/bin/env python3
"""查看超长代码行的辅助工具：按行号范围或正则输出，每行截断到指定宽度，控制输出体积。

用法：
  show.py FILE --lines 100-140 [--width 160]
  show.py FILE --grep 'PATTERN' [--width 160] [--max 80]
"""
import argparse
import re
import sys

ap = argparse.ArgumentParser()
ap.add_argument('file')
ap.add_argument('--lines')
ap.add_argument('--grep')
ap.add_argument('--width', type=int, default=160)
ap.add_argument('--max', type=int, default=80)
ap.add_argument('--tail', type=int, default=0, help='截断时额外显示行尾 N 个字符')
a = ap.parse_args()

lines = open(a.file, encoding='utf-8').read().split('\n')


def out(i):
    s = lines[i].rstrip()
    lead = len(s) - len(s.lstrip())
    s = s.strip()
    if len(s) > a.width:
        s = s[:a.width] + ' …(+%d)' % (len(s) - a.width) + (' …' + s[-a.tail:] if a.tail else '')
    print('%6d|%s%s' % (i + 1, ' ' * min(lead, 6), s))


if a.lines:
    for part in a.lines.split(','):
        lo, hi = (int(x) for x in (part.split('-') if '-' in part else (part, part)))
        for i in range(lo - 1, min(hi, len(lines))):
            out(i)
        print('  ---')
elif a.grep:
    rx = re.compile(a.grep)
    n = 0
    for i, l in enumerate(lines):
        if rx.search(l):
            n += 1
            if n <= a.max:
                out(i)
    if n > a.max:
        print('… 共 %d 处，只显示前 %d 处' % (n, a.max))
else:
    sys.exit('需要 --lines 或 --grep')
