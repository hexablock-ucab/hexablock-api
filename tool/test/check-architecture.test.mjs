// Behavior tests for tool/check-architecture.mjs: each test builds a small source
// tree in a temporary folder and runs the script there with the real rules file.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const toolDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = path.join(toolDir, 'check-architecture.mjs');
const rules = path.join(toolDir, 'architecture-rules.json');
const trees = [];

after(() => {
  for (const tree of trees) rmSync(tree, { recursive: true, force: true });
});

// Writes { 'relative/path.ts': 'content' } into a fresh temporary folder.
function makeTree(files) {
  const root = mkdtempSync(path.join(tmpdir(), 'check-architecture-'));
  trees.push(root);
  for (const [file, content] of Object.entries(files)) {
    const full = path.join(root, file);
    mkdirSync(path.dirname(full), { recursive: true });
    writeFileSync(full, content);
  }
  return root;
}

function runCheck(root) {
  const result = spawnSync(process.execPath, [script, '--rules', rules], { cwd: root, encoding: 'utf8' });
  return { code: result.status, output: result.stdout + result.stderr };
}

test('should_pass_with_rules_applied_message_when_src_does_not_exist', () => {
  const root = makeTree({ 'README.md': '# empty project\n' });

  const { code, output } = runCheck(root);

  assert.equal(code, 0);
  assert.match(output, /Architecture rules OK \(0 of \d+ rules applied/);
});

test('should_fail_with_domain_is_framework_free_when_module_domain_imports_nestjs', () => {
  const root = makeTree({ 'src/modules/levels/domain/x.ts': "import { Injectable } from '@nestjs/common';\n" });

  const { code, output } = runCheck(root);

  assert.equal(code, 1);
  assert.match(output, /\[domain-is-framework-free\]/);
});

test('should_fail_with_domain_is_framework_free_when_shared_domain_imports_nestjs', () => {
  const root = makeTree({ 'src/shared/domain/x.ts': "import { Injectable } from '@nestjs/common';\n" });

  const { code, output } = runCheck(root);

  assert.equal(code, 1);
  assert.match(output, /\[domain-is-framework-free\]/);
});

test('should_fail_with_use_cases_rule_when_module_application_imports_argon2', () => {
  const root = makeTree({ 'src/modules/accounts/application/hash.ts': "import argon2 from 'argon2';\n" });

  const { code, output } = runCheck(root);

  assert.equal(code, 1);
  assert.match(output, /\[use-cases-depend-only-on-domain\]/);
});

test('should_fail_with_domain_is_framework_free_when_module_domain_imports_its_application_layer', () => {
  const root = makeTree({ 'src/modules/progress/domain/x.ts': "import { Sync } from '../application/sync';\n" });

  const { code, output } = runCheck(root);

  assert.equal(code, 1);
  assert.match(output, /\[domain-is-framework-free\] Dependency Rule/);
});

test('should_fail_with_adapters_rule_when_module_adapter_imports_its_frameworks_layer', () => {
  const root = makeTree({ 'src/modules/progress/interface-adapters/c.ts': "import { M } from '../frameworks/m';\n" });

  const { code, output } = runCheck(root);

  assert.equal(code, 1);
  assert.match(output, /\[adapters-do-not-import-frameworks\]/);
});

test('should_fail_with_module_boundary_rule_when_module_imports_another_module_deeply', () => {
  const root = makeTree({ 'src/modules/progress/application/a.ts': "import { Level } from '../../levels/domain/level';\n" });

  const { code, output } = runCheck(root);

  assert.equal(code, 1);
  assert.match(output, /\[modules-use-each-other-through-index\]/);
});

test('should_fail_with_module_boundary_rule_when_deep_import_is_repo_relative', () => {
  const root = makeTree({ 'src/modules/progress/application/a.ts': "export { Level } from 'src/modules/levels/domain/level';\n" });

  const { code, output } = runCheck(root);

  assert.equal(code, 1);
  assert.match(output, /\[modules-use-each-other-through-index\]/);
});

test('should_fail_with_module_boundary_rule_when_dynamic_import_reaches_into_another_module', () => {
  const root = makeTree({ 'src/modules/progress/application/a.ts': "const m = await import('../../levels/application/x');\n" });

  const { code, output } = runCheck(root);

  assert.equal(code, 1);
  assert.match(output, /\[modules-use-each-other-through-index\]/);
});

test('should_pass_when_module_imports_another_module_through_its_index', () => {
  const root = makeTree({
    'src/modules/progress/application/a.ts': [
      "import { Level } from '../../levels';",
      "import { LevelId } from '../../levels/index';",
      "import { Other } from '../../levels/index.js';",
      "export * from 'src/modules/levels';",
      '',
    ].join('\n'),
  });

  const { code, output } = runCheck(root);

  assert.equal(code, 0, output);
  assert.match(output, /Architecture rules OK/);
});

test('should_pass_when_file_imports_deeply_inside_its_own_module', () => {
  const root = makeTree({ 'src/modules/progress/application/a.ts': "import { Progress } from '../domain/progress';\n" });

  const { code, output } = runCheck(root);

  assert.equal(code, 0, output);
});

test('should_fail_with_game_rule_when_progress_domain_names_a_game', () => {
  const root = makeTree({ 'src/modules/progress/domain/x.ts': "export const game = 'hexa-fit';\n" });

  const { code, output } = runCheck(root);

  assert.equal(code, 1);
  assert.match(output, /\[no-game-specific-code-in-the-core\]/);
});

test('should_pass_when_levels_domain_names_a_game', () => {
  const root = makeTree({ 'src/modules/levels/domain/x.ts': "export const game = 'hexa-fit';\n" });

  const { code, output } = runCheck(root);

  assert.equal(code, 0, output);
});
