#!/usr/bin/env node
/**
 * PostToolUse hook for Edit, Write and MultiEdit on TypeScript and JavaScript files.
 * 1. Formats the file with the project's Prettier.
 * 2. Lints the file with the project's ESLint, zero warnings allowed. When ESLint
 *    reports problems, the hook writes them to stderr and exits with code 2, so
 *    Claude sees them right away and fixes them before it continues.
 * The hook stays silent when the file is not TypeScript or JavaScript, or when
 * Prettier or ESLint are not installed yet (task 0001 adds them).
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

let data = '';
for await (const chunk of process.stdin) data += chunk;

let file = '';
try {
  file = String(JSON.parse(data)?.tool_input?.file_path ?? '');
} catch {
  process.exit(0);
}
if (!/\.(ts|mts|cts|js|mjs|cjs)$/.test(file) || !existsSync(file)) process.exit(0);

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const bin = (name) => {
  const exe = path.join(root, 'node_modules', '.bin', process.platform === 'win32' ? `${name}.cmd` : name);
  return existsSync(exe) ? exe : null;
};
const run = (exe, args) =>
  spawnSync(exe, args, { cwd: root, encoding: 'utf8', shell: process.platform === 'win32', timeout: 60_000 });

const prettier = bin('prettier');
if (prettier) run(prettier, ['--write', '--log-level', 'warn', file]);

const eslint = bin('eslint');
if (eslint) {
  const lint = run(eslint, ['--max-warnings=0', file]);
  if (lint.status !== 0 && !lint.error) {
    const output = `${lint.stdout ?? ''}${lint.stderr ?? ''}`.trim();
    process.stderr.write(`ESLint found problems in ${file}. Fix them before you continue:\n${output}\n`);
    process.exit(2);
  }
}
process.exit(0);
