#!/usr/bin/env python3
"""块 3 引擎补丁：存档绑定聊天 ID，防止“读的是 A 聊天、写进了 B 聊天”。

Tavo 宿主在切换聊天途中会让所有聊天接口报 chat_runtime_not_ready；SillyTavern / TauriTavern 没有这种保护，
引擎 mutate() 读完存档、还在等 AI 或计算时，用户切了聊天，saveState() 就会把 A 聊天的数据写进 B 聊天。

做法（只动 loadState / saveState 两处）：
1. loadState 读取前记下当前聊天 ID，挂在返回的 state 上（不可枚举属性 __chatId，不会进存档）
2. saveState 写入前核对：当前聊天 ID 与 state.__chatId 不一致 → 抛 chat_runtime_not_ready（notReadyErr），放弃写入
   引擎各处原本就把这个错误当“宿主正在切换”处理（重试或放弃），不需要再改调用方

用法：python3 build/patch_chatbind.py [--dry-run]
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import patch_age as base  # noqa: E402

MARK = '/* [tt-port:chatbind] */'
base.PATCHES.clear()
P = base.patch

P('loadState：记下读取时的聊天 ID',
  "async function loadState() {\n"
  "await loadCustomActs();\n"
  "let raw;",
  "async function loadState() {\n"
  "await loadCustomActs();\n"
  "const boundChat = await curChatId(); " + MARK + "\n"
  "let raw;")
P('loadState：把聊天 ID 挂到 state 上（不可枚举，不进存档）',
  "const st = normalizeState(raw);\n"
  "st.meta.epoch = raw && raw.meta && Number(raw.meta.epoch) ? Number(raw.meta.epoch) : w;\n"
  "return st;",
  "const st = normalizeState(raw);\n"
  "st.meta.epoch = raw && raw.meta && Number(raw.meta.epoch) ? Number(raw.meta.epoch) : w;\n"
  "try { Object.defineProperty(st, '__chatId', { value: boundChat, enumerable: false, configurable: true, writable: true }); } catch (e) { /* ignore */ } " + MARK + "\n"
  "return st;")
# 只匹配函数体内的两行（与函数声明行缩进不同，宽松匹配会按首行缩进重排）
P('saveState：写入前核对聊天 ID',
  "wireCardAliases(st);\n"
  "const copy = JSON.parse(JSON.stringify(st)); // Proxy ownKeys => primary keys only",
  "if (st && typeof st.__chatId === 'string' && st.__chatId) { const nowChat = await curChatId(); if (nowChat !== st.__chatId) { plog('数据', { type: '拒绝跨聊天写入', status: 'blocked', text: '读取后聊天已切换，本次结果不写入' }); throw notReadyErr(); } } " + MARK + "\n"
  "wireCardAliases(st);\n"
  "const copy = JSON.parse(JSON.stringify(st)); // Proxy ownKeys => primary keys only")

def main():
    dry = '--dry-run' in sys.argv
    src = base.ENGINE.read_text(encoding='utf-8')
    if MARK in src:
        print('FAIL: engine.js 已打过 chatbind 补丁（含标记 %s）；不要重复运行' % MARK)
        sys.exit(1)
    errors = []
    for name, old, new, count in base.PATCHES:
        hits = base.find_block(src, old)
        if len(hits) != count:
            errors.append('%s：原文出现 %d 次（应为 %d）' % (name, len(hits), count))
            continue
        start, end, info = hits[0]
        src = src[:start] + base.apply_text(new, info) + src[end:]
        print('ok  ', name, '' if isinstance(info, tuple) else '（宽松缩进匹配）')
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
