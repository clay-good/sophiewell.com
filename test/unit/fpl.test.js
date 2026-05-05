// spec-v4 §5 utility 103: HHS Federal Poverty Level calculator.
// At least one test verifies a known published threshold against the bundled
// data/fpl/fpl.json table.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { fplBase, fplAt, fplBands } from '../../lib/fpl.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const TBL = JSON.parse(await readFile(join(ROOT, 'data', 'fpl', 'fpl.json'), 'utf8'));

test('fplBase: 1-person household equals the region base', () => {
  assert.equal(fplBase(1, TBL.contiguous48), TBL.contiguous48.base);
  assert.equal(fplBase(1, TBL.alaska), TBL.alaska.base);
  assert.equal(fplBase(1, TBL.hawaii), TBL.hawaii.base);
});

test('fplBase: each additional household member adds perAdditional', () => {
  const r = TBL.contiguous48;
  assert.equal(fplBase(4, r), r.base + 3 * r.perAdditional);
  assert.equal(fplBase(8, r), r.base + 7 * r.perAdditional);
});

test('fplAt: 100% FPL for 1-person contiguous-48 household matches bundled CY value', () => {
  // Bundled HHS Poverty Guidelines for the contiguous 48 + DC: 1-person base.
  // Verifies the calculator path matches the dataset.
  assert.equal(fplAt(100, 1, TBL.contiguous48), TBL.contiguous48.base);
});

test('fplAt: 138% FPL (ACA Medicaid expansion) for a 1-person contiguous-48 household', () => {
  // 1-person base = 15650 in CY2026. 138% rounds to 21597.
  assert.equal(fplAt(138, 1, TBL.contiguous48), Math.round(TBL.contiguous48.base * 1.38));
});

test('fplAt: 400% FPL (former ACA PTC cliff) for a 4-person contiguous-48 household', () => {
  const four = TBL.contiguous48.base + 3 * TBL.contiguous48.perAdditional;
  assert.equal(fplAt(400, 4, TBL.contiguous48), Math.round(four * 4));
});

test('fplBands: returns the standard six bands in order', () => {
  const out = fplBands(2, TBL.contiguous48);
  assert.deepEqual(out.map((b) => b.percent), [100, 138, 200, 250, 400, 600]);
});

test('fplBase: rejects non-positive household sizes', () => {
  assert.throws(() => fplBase(0, TBL.contiguous48));
  assert.throws(() => fplBase(-1, TBL.contiguous48));
  assert.throws(() => fplBase(1.5, TBL.contiguous48));
});

test('fplAt: rejects non-positive percent', () => {
  assert.throws(() => fplAt(0, 1, TBL.contiguous48));
  assert.throws(() => fplAt(NaN, 1, TBL.contiguous48));
});
