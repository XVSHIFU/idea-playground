/*
 * 在不能创建子进程的环境里，直接顺序跑 engine.test.mjs 的用例：
 *   node taste-score/tests/run.mjs
 * 正式检查仍然用 node --test taste-score/tests/。
 */
process.env.TASTE_SCORE_TESTS = 'direct';
const { runDirect } = await import('./engine.test.mjs');

const failed = await runDirect();
if (failed) process.exitCode = 1;
