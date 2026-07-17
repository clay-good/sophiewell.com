// spec-v371: C-RADS colonic categories (C0-C4, 2023 update). Worked-example tests: each category and its
// description, the actionable flag on C3-C4, the C2a/C2b subcategories, aliases, and the invalid-input
// guard. Categories transcribed from Zalis 2005 / C-RADS 2023 update, cross-verified against radiology
// references (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cRads } from '../../lib/c-rads-v371.js';

test('C3: polyp >= 10 mm, colonoscopy, flagged (the META example)', () => {
  const r = cRads({ category: 'C3' });
  assert.equal(r.valid, true);
  assert.equal(r.category, 'C3');
  assert.equal(r.actionable, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /colonoscopy is recommended/);
});

test('C0-C2b are not flagged as actionable', () => {
  for (const c of ['C0', 'C1', 'C2a', 'C2b']) {
    assert.equal(cRads({ category: c }).actionable, false, c);
  }
  assert.match(cRads({ category: 'C0' }).band, /inadequate or incomplete/);
  assert.match(cRads({ category: 'C1' }).band, /normal colon/);
});

test('the C2 subcategories resolve distinctly, and C4 is the malignant-mass category', () => {
  assert.match(cRads({ category: 'C2a' }).band, /indeterminate 6-9 mm/);
  assert.match(cRads({ category: 'C2b' }).band, /likely benign stricture/);
  assert.equal(cRads({ category: 'C4' }).actionable, true);
  assert.match(cRads({ category: 'C4' }).band, /colonic mass/);
});

test('case-insensitive and bare-number aliases resolve', () => {
  assert.equal(cRads({ category: 'c3' }).category, 'C3');
  assert.equal(cRads({ category: 'C2A' }).category, 'C2a');
  assert.equal(cRads({ category: 1 }).category, 'C1');
});

test('a missing or invalid category is guarded', () => {
  assert.equal(cRads({}).valid, false);
  assert.equal(cRads({ category: 'C5' }).valid, false);
  assert.equal(cRads({ category: 'E2' }).valid, false);
});
