/*
 * 依次运行 tests/ 下所有 *.test.mjs 和 smoke-*.mjs（每个文件独立子进程，互不污染全局）。
 * 运行：npm test 或 node tests/run-all.mjs
 */
import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const files = (await readdir(DIR)).filter((f) => /^smoke-.*\.mjs$|\.test\.mjs$/.test(f)).sort();
let failed = 0;
for (const f of files) {
    const r = spawnSync(process.execPath, [path.join(DIR, f)], { encoding: 'utf8', timeout: 120000 });
    const ok = r.status === 0;
    if (!ok) failed++;
    console.log((ok ? 'PASS ' : 'FAIL ') + f);
    if (!ok) console.log((r.stdout || '') + (r.stderr || ''));
}
console.log(failed ? failed + ' 个测试失败' : '全部 ' + files.length + ' 个测试通过');
process.exit(failed ? 1 : 0);
