#!/usr/bin/env node
/**
 * Quality gate: every level file is valid (FR-04, FR-23, FR-46, FR-55).
 *
 * 1. Shape: each file validates against docs/schemas/level.schema.json (JSON Schema 2020-12).
 * 2. The rules JSON Schema cannot express, listed in docs/level-format.md (L1, L2, F1–F5, S1, S2).
 * 3. The level set in levels/: file name = levelId, numbers 1..N with no gap, difficulty never
 *    decreases, every Hexa Fit level carries a solution that covers its figure (FR-43) and no
 *    piece reaches the tray already turned to its solved position (FIT-2), and no two Hexa Sort
 *    levels share a seed.
 *    A file that is not valid JSON or fails 1–2 is reported once and left out of these checks.
 * 4. Self-test: every file in tool/fixtures/invalid-levels/ must be rejected, so a check that
 *    stops working is noticed.
 *
 * Geometry lives in one table per topology (ADR-0004 in hexablock-app); only "hex" exists.
 * Hex math adapted from: Red Blob Games, "Hexagonal Grids", https://www.redblobgames.com/grids/hexagons/
 *
 * Usage: node tool/check-levels.mjs
 */
import Ajv2020 from 'ajv/dist/2020.js';
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';

const SCHEMA = 'docs/schemas/level.schema.json';
const LEVELS = 'levels';
const EXAMPLES = 'docs/schemas/examples';
const INVALID = 'tool/fixtures/invalid-levels';

const ajv = new Ajv2020({ allErrors: true, strict: true, strictTypes: false });
const validate = ajv.compile(JSON.parse(readFileSync(SCHEMA, 'utf8')));

const key = (c) => c.join(',');

// One entry per topology: neighbors, rotation by one step, distance from the origin.
const TOPOLOGIES = {
  hex: {
    neighbors: ([q, r]) => [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]].map(([dq, dr]) => [q + dq, r + dr]),
    rotate: ([q, r]) => [-r, q + r],
    distance: ([q, r]) => (Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2,
    validCoordinate: (c) => c.length === 2,
  },
};

function connected(topo, cells) {
  const set = new Set(cells.map(key));
  const seen = new Set([key(cells[0])]);
  const todo = [cells[0]];
  while (todo.length) {
    for (const n of topo.neighbors(todo.pop())) {
      if (set.has(key(n)) && !seen.has(key(n))) { seen.add(key(n)); todo.push(n); }
    }
  }
  return seen.size === set.size;
}

// A hole is an empty cell that cannot reach the outside of the figure's bounding region.
function hasHole(topo, cells) {
  const figure = new Set(cells.map(key));
  const radius = Math.max(...cells.map(topo.distance)) + 1;
  const inRegion = (c) => topo.distance(c) <= radius;
  const outside = new Set();
  const todo = [];
  for (let q = -radius; q <= radius; q++) {
    for (let r = -radius; r <= radius; r++) {
      if (topo.distance([q, r]) === radius) { outside.add(key([q, r])); todo.push([q, r]); }
    }
  }
  while (todo.length) {
    for (const n of topo.neighbors(todo.pop())) {
      if (inRegion(n) && !figure.has(key(n)) && !outside.has(key(n))) { outside.add(key(n)); todo.push(n); }
    }
  }
  for (let q = -radius; q <= radius; q++) {
    for (let r = -radius; r <= radius; r++) {
      const c = [q, r];
      if (inRegion(c) && !figure.has(key(c)) && !outside.has(key(c))) return true;
    }
  }
  return false;
}

function cellsOf(level) {
  return level.board.shape.kind === 'cells' ? level.board.shape.cells : [];
}

// The rules of docs/level-format.md that JSON Schema cannot check.
function extraRules(level) {
  const errors = [];
  const topo = TOPOLOGIES[level.board.topology];
  const p = level.payload;
  if (!level.levelId.endsWith(String(level.number).padStart(3, '0'))) errors.push('L1: levelId does not end with the number in three digits');
  const allCells = [...cellsOf(level), ...(p.pieces ?? []).flatMap((x) => x.cells)];
  if (allCells.some((c) => !topo.validCoordinate(c))) errors.push(`L2: a coordinate is not valid in topology "${level.board.topology}"`);
  if (errors.length) return errors;

  if (level.gameId === 'hexa-fit') {
    const figure = cellsOf(level);
    if (!connected(topo, figure)) errors.push('F1: the figure is not connected');
    if (hasHole(topo, figure)) errors.push('F1: the figure has a hole');
    p.pieces.forEach((piece, i) => { if (!connected(topo, piece.cells)) errors.push(`F2: piece ${i} is not connected`); });
    const area = p.pieces.reduce((sum, piece) => sum + piece.cells.length, 0);
    if (area !== figure.length) errors.push(`F3: the pieces cover ${area} cells, the figure has ${figure.length}`);
    if (p.par.moves < p.pieces.length) errors.push('F4: par.moves is lower than the number of pieces');
    if (p.solution) {
      if (p.solution.length !== p.pieces.length) {
        errors.push('F5: the solution does not have one placement per piece');
      } else {
        const covered = new Map();
        p.solution.forEach((s, i) => p.pieces[i].cells.forEach((c) => {
          let cell = c;
          for (let k = 0; k < s.rotation; k++) cell = topo.rotate(cell);
          const k2 = key(cell.map((v, j) => v + s.at[j]));
          covered.set(k2, (covered.get(k2) ?? 0) + 1);
        }));
        const figureSet = new Set(figure.map(key));
        if ([...covered.values()].some((n) => n > 1)) errors.push('F5: the solution overlaps pieces');
        if ([...covered.keys()].some((k) => !figureSet.has(k))) errors.push('F5: the solution leaves the figure');
        if (covered.size !== figureSet.size) errors.push('F5: the solution leaves gaps');
      }
    }
  }
  if (level.gameId === 'hexa-sort') {
    if (p.tray.stackSize.min > p.tray.stackSize.max) errors.push('S1: stackSize.min is greater than stackSize.max');
    if (!(p.moveThresholds[0] > p.moveThresholds[1])) errors.push('S2: moveThresholds must be strictly descending');
  }
  return errors;
}

// The normalized shape of a set of cells: sorted, then moved so the first cell is the origin.
const shape = (cells) => {
  const s = [...cells].sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  return JSON.stringify(s.map((c) => c.map((v, j) => v - s[0][j] + 0)));
};

function check(file) {
  let level;
  try { level = JSON.parse(readFileSync(file, 'utf8')); } catch (e) { return [`not valid JSON: ${e.message}`]; }
  if (!validate(level)) return validate.errors.map((e) => `schema: ${e.instancePath || '/'} ${e.message}`);
  return extraRules(level);
}

const jsonFiles = (dir) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')).sort().map((f) => path.join(dir, f)) : []);

const failures = [];
let checked = 0;

// 1–2. Every example and every level is valid.
const levelDirs = existsSync(LEVELS) ? readdirSync(LEVELS).map((d) => path.join(LEVELS, d)).filter((d) => statSync(d).isDirectory()) : [];
const broken = new Set();
for (const file of [...jsonFiles(EXAMPLES), ...levelDirs.flatMap(jsonFiles)]) {
  checked += 1;
  const errors = check(file);
  if (errors.length) broken.add(file);
  for (const e of errors) failures.push(`${file}: ${e}`);
}

// 3. The level set of each variant.
for (const dir of levelDirs) {
  const levels = jsonFiles(dir).filter((f) => !broken.has(f)).map((f) => ({ f, l: JSON.parse(readFileSync(f, 'utf8')) }));
  const seeds = new Map();
  const dirBroken = jsonFiles(dir).some((f) => broken.has(f)); // numbering is checked once every file of the folder is valid
  levels.sort((a, b) => a.l.number - b.l.number);
  levels.forEach(({ f, l }, i) => {
    if (path.basename(f) !== `${l.levelId}.json`) failures.push(`${f}: the file name must be ${l.levelId}.json`);
    if (path.basename(dir) !== l.gameId) failures.push(`${f}: a ${l.gameId} level is in the ${path.basename(dir)} folder`);
    if (!dirBroken && l.number !== i + 1) failures.push(`${f}: level numbers must run 1..N with no gap (expected ${i + 1})`);
    if (i > 0 && l.difficulty < levels[i - 1].l.difficulty) failures.push(`${f}: difficulty decreases after level ${i}`);
    if (l.gameId === 'hexa-fit' && !l.payload.solution) failures.push(`${f}: every bundled Hexa Fit level needs a solution (FR-43)`);
    if (l.gameId === 'hexa-fit' && l.payload.solution) {
      const topo = TOPOLOGIES[l.board.topology];
      l.payload.pieces.forEach((piece, j) => {
        const turns = [piece.cells];
        for (let k = 1; k < 6; k++) turns.push(turns[k - 1].map(topo.rotate));
        const solved = turns.at(l.payload.solution[j].rotation % 6);
        const symmetric = new Set(turns.map(shape)).size === 1;
        if (!symmetric && shape(piece.cells) === shape(solved)) failures.push(`${f}: piece ${j} reaches the tray already turned to its solved position (FIT-2)`);
      });
    }
    if (l.gameId === 'hexa-sort') {
      const seed = l.payload.tray.seed;
      if (seeds.has(seed)) failures.push(`${f}: same seed (${seed}) as ${seeds.get(seed)}; each level needs its own sequence of stacks`);
      else seeds.set(seed, path.basename(f));
    }
  });
}

// 4. Self-test: each invalid fixture must be rejected.
const invalid = jsonFiles(INVALID);
for (const file of invalid) {
  if (check(file).length === 0) failures.push(`${file}: this invalid fixture was accepted; a check stopped working`);
}

if (failures.length > 0) {
  console.error('Level check failed:\n');
  for (const f of failures) console.error(`  ${f}`);
  console.error(`\n${failures.length} problem(s). See docs/level-format.md.`);
  process.exit(1);
}
console.log(`Levels OK (${checked} files valid; ${invalid.length} invalid fixtures rejected).`);
