// spec-v167 2.4: stool osmotic gap = 290 − 2·(Na + K). The secretory/osmotic
// boundary is asserted.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stoolOsmoticGap } from '../../lib/oneformula-v167.js';

test('tile example: Na 30, K 15 → gap 200, osmotic', () => {
  // 290 - 2*(45) = 200
  const r = stoolOsmoticGap({ na: 30, k: 15 });
  assert.equal(r.valid, true);
  assert.equal(r.gap, 200);
  assert.match(r.bandLabel, /Osmotic/);
});

test('secretory: high electrolytes → gap < 50', () => {
  // Na 65, K 65 -> 290 - 260 = 30 (secretory)
  const r = stoolOsmoticGap({ na: 65, k: 65 });
  assert.equal(r.gap, 30);
  assert.match(r.bandLabel, /Secretory/);
});

test('secretory ↔ osmotic boundaries: 50 indeterminate, 100 indeterminate, 101 osmotic', () => {
  assert.match(stoolOsmoticGap({ na: 60, k: 60 }).bandLabel, /Indeterminate/); // gap 50
  assert.match(stoolOsmoticGap({ na: 35, k: 60 }).bandLabel, /Indeterminate/); // 290-190=100
  assert.match(stoolOsmoticGap({ na: 35, k: 59 }).bandLabel, /Osmotic/); // 290-188=102
});

test('guards: blank inputs', () => {
  assert.equal(stoolOsmoticGap({ na: 30 }).valid, false);
  assert.equal(stoolOsmoticGap({}).valid, false);
});
