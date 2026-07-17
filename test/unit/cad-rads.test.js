// spec-v372: CAD-RADS 2.0 coronary-CTA categories (0-5, with 4A/4B). Worked-example tests: each category
// and its stenosis description, the obstructive flag on 3+, the 4A/4B split, aliases, and the invalid-
// input guard. Categories transcribed from Cury et al. 2022 (CAD-RADS 2.0), cross-verified against
// radiology references (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cadRads } from '../../lib/cad-rads-v372.js';

test('CAD-RADS 3: moderate 50-69%, obstructive, flagged (the META example)', () => {
  const r = cadRads({ category: '3' });
  assert.equal(r.valid, true);
  assert.equal(r.category, '3');
  assert.equal(r.obstructive, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /50-69%/);
});

test('categories 0-2 are non-obstructive (not flagged)', () => {
  for (const c of ['0', '1', '2']) {
    assert.equal(cadRads({ category: c }).obstructive, false, c);
  }
  assert.match(cadRads({ category: '0' }).band, /no plaque or stenosis/);
  assert.match(cadRads({ category: '1' }).band, /1-24%/);
});

test('4A / 4B / 5 are the severe/occlusion categories and flagged', () => {
  assert.match(cadRads({ category: '4A' }).band, /70-99%/);
  assert.match(cadRads({ category: '4B' }).band, /left main/);
  assert.match(cadRads({ category: '5' }).band, /total coronary occlusion/);
  for (const c of ['4A', '4B', '5']) {
    assert.equal(cadRads({ category: c }).obstructive, true, c);
  }
});

test('case-insensitive and bare-4 aliases resolve', () => {
  assert.equal(cadRads({ category: '4a' }).category, '4A');
  assert.equal(cadRads({ category: 4 }).category, '4A');
  assert.equal(cadRads({ category: '4B' }).category, '4B');
});

test('a missing or invalid category is guarded', () => {
  assert.equal(cadRads({}).valid, false);
  assert.equal(cadRads({ category: '6' }).valid, false);
  assert.equal(cadRads({ category: '4C' }).valid, false);
});
