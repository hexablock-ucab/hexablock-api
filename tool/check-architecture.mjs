#!/usr/bin/env node
/**
 * Quality gate: architecture rules as checks (Clean Architecture, C-05, C-29).
 * Reads tool/architecture-rules.json. Two kinds of rule:
 * - "forbidden" (the default): the folders in `paths` must never contain the
 *   listed import patterns or identifiers. A whole path segment may be `*`,
 *   which matches any one folder, so a new module needs no rule change.
 * - "module-boundary": a file in `<modulesRoot>/<a>/` may reach another module
 *   `<b>` only through `<modulesRoot>/<b>` or its `index`.
 * A rule whose folders do not exist yet is skipped, so the check can live in CI
 * before the code exists.
 *
 * Usage: node tool/check-architecture.mjs [--rules tool/architecture-rules.json]
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const rulesPath = path.resolve(args.includes('--rules') ? args[args.indexOf('--rules') + 1] : 'tool/architecture-rules.json');
const { sourceExtensions, rules } = JSON.parse(readFileSync(rulesPath, 'utf8'));

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (sourceExtensions.some((ext) => full.endsWith(ext))) yield full;
  }
}

const isDir = (p) => existsSync(p) && statSync(p).isDirectory();

// Expands a path whose segments may be `*` into the existing folders it names.
function expand(pattern) {
  let found = ['.'];
  for (const segment of pattern.split('/').filter(Boolean)) {
    found = found.flatMap((base) =>
      segment === '*'
        ? readdirSync(base).map((e) => path.join(base, e)).filter(isDir)
        : [path.join(base, segment)].filter(isDir),
    );
  }
  return found;
}

const isInside = (file, folder) => file === folder || file.startsWith(folder + path.sep);

const violations = [];
const report = (file, index, rule, reason, line) =>
  violations.push(`${file}:${index + 1}  [${rule.id}] ${reason}\n      ${line.trim()}`);

function checkForbidden(rule) {
  const roots = rule.paths.flatMap(expand);
  if (roots.length === 0) return false;
  const patterns = rule.forbidden.map((f) => ({ ...f, re: new RegExp(f.pattern) }));
  const except = (rule.except ?? []).flatMap(expand);
  for (const root of roots) {
    for (const file of walk(root)) {
      if (except.some((e) => isInside(file, e))) continue;
      readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
        for (const f of patterns) {
          if (f.re.test(line)) report(file, i, rule, f.reason, line);
        }
      });
    }
  }
  return true;
}

// `… from '<x>'` covers import and export, also on the last line of a multi-line
// statement; the other two cover `import('<x>')` and side-effect imports.
const SPECIFIERS = [/\bfrom\s*['"]([^'"]+)['"]/g, /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g, /^\s*import\s*['"]([^'"]+)['"]/g];
const PUBLIC_ENTRY = new Set(['index', 'index.ts', 'index.js']);

function checkModuleBoundary(rule) {
  const modulesRoot = path.posix.normalize(rule.modulesRoot);
  if (!isDir(modulesRoot)) return false;
  for (const owner of readdirSync(modulesRoot).filter((m) => isDir(path.join(modulesRoot, m)))) {
    for (const file of walk(path.join(modulesRoot, owner))) {
      const fromDir = path.dirname(file);
      readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
        for (const re of SPECIFIERS) {
          for (const [, specifier] of line.matchAll(re)) {
            // Relative specifiers resolve against the importer; `src/modules/…` is repo-relative.
            let target;
            if (specifier.startsWith('.')) target = path.relative('.', path.join(fromDir, specifier)).split(path.sep).join('/');
            else if (specifier === modulesRoot || specifier.startsWith(modulesRoot + '/')) target = path.posix.normalize(specifier);
            else continue;
            const rest = path.posix.relative(modulesRoot, target).split('/').filter(Boolean);
            if (rest.length === 0 || rest[0] === '..' || rest[0] === owner) continue;
            if (rest.length === 1 || (rest.length === 2 && PUBLIC_ENTRY.has(rest[1]))) continue;
            report(file, i, rule, rule.reason, line);
          }
        }
      });
    }
  }
  return true;
}

let applied = 0;
for (const rule of rules) {
  const ran = rule.kind === 'module-boundary' ? checkModuleBoundary(rule) : checkForbidden(rule);
  if (ran) applied += 1;
}

if (violations.length > 0) {
  console.error('Architecture rules violated:\n');
  for (const v of violations) console.error(`  ${v}`);
  console.error(`\n${violations.length} violation(s). See AGENTS.md §3 and docs/adr/.`);
  process.exit(1);
}
console.log(`Architecture rules OK (${applied} of ${rules.length} rules applied; the rest wait for their folders).`);
