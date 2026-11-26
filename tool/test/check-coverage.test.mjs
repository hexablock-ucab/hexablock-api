// Behavior tests for tool/check-coverage.mjs: each test writes an lcov.info in a
// temporary folder and runs the script there with the real quality gates.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const toolDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = path.join(toolDir, 'check-coverage.mjs');
const config = path.join(toolDir, 'quality-gates.json');
const trees = [];

after(() => {
  for (const tree of trees) rmSync(tree, { recursive: true, force: true });
});

// Writes coverage/lcov.info with { 'src/file.ts': [hit, found] }; paths are relative
// to the folder above coverage/, as the script resolves them.
function makeCoverage(records) {
  const root = mkdtempSync(path.join(tmpdir(), 'check-coverage-'));
  trees.push(root);
  const lcov = Object.entries(records)
    .map(([file, [hit, found]]) => `SF:${file}\nLF:${found}\nLH:${hit}\nend_of_record`)
    .join('\n');
  mkdirSync(path.join(root, 'coverage'));
  writeFileSync(path.join(root, 'coverage', 'lcov.info'), lcov + '\n');
  return root;
}

function runCheck(root) {
  const result = spawnSync(process.execPath, [script, '--config', config], { cwd: root, encoding: 'utf8' });
  return { code: result.status, output: result.stdout + result.stderr };
}

test('should_fail_when_module_domain_coverage_is_below_90', () => {
  const root = makeCoverage({ 'src/modules/progress/domain/x.ts': [5, 10] });

  const { code, output } = runCheck(root);

  assert.equal(code, 1);
  assert.match(output, /Coverage below the minimum in: src\/modules\/\*\/domain/);
});

test('should_pass_when_module_domain_coverage_is_95', () => {
  const root = makeCoverage({ 'src/modules/progress/domain/x.ts': [19, 20] });

  const { code, output } = runCheck(root);

  assert.equal(code, 0, output);
  assert.match(output, /src\/modules\/\*\/domain\s+95\.0% \(min 90%\)/);
});

test('should_report_one_aggregated_line_when_several_modules_match_one_area', () => {
  const root = makeCoverage({
    'src/modules/progress/application/a.ts': [10, 10],
    'src/modules/levels/application/b.ts': [8, 10],
  });

  const { code, output } = runCheck(root);

  assert.equal(code, 0, output);
  assert.equal(output.match(/src\/modules\/\*\/application/g).length, 1);
  assert.match(output, /src\/modules\/\*\/application\s+90\.0%/);
});

test('should_fail_when_shared_application_coverage_is_below_90', () => {
  const root = makeCoverage({ 'src/shared/application/x.ts': [1, 2] });

  const { code, output } = runCheck(root);

  assert.equal(code, 1);
  assert.match(output, /Coverage below the minimum in: src\/shared\/application/);
});

test('should_pass_when_low_coverage_is_outside_the_gated_areas', () => {
  const root = makeCoverage({ 'src/modules/progress/frameworks/m.ts': [0, 10] });

  const { code, output } = runCheck(root);

  assert.equal(code, 0, output);
});
