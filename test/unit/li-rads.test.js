// spec-v327: ACR LI-RADS v2018 CT/MRI diagnostic categories. Worked-example tests: the
// benign end (LR-1/2, LR-NC not malignant), the malignant end (LR-4/5/M/TIV), the LR-3
// intermediate management, input normalization (bare number / no dash / case), and the
// invalid-category guard. Categories transcribed from Chernyak 2018 (Radiology) / ACR
// LI-RADS v2018, cross-verified against the ACR RADS support material (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { liRads } from '../../lib/li-rads-v327.js';

test('LR-3: intermediate probability, 3-6 month imaging (the META example)', () => {
  const r = liRads({ category: 'LR-3' });
  assert.equal(r.valid, true);
  assert.equal(r.category, 'LR-3');
  assert.equal(r.malignant, false);
  assert.match(r.band, /intermediate probability of malignancy/);
  assert.match(r.band, /repeat or alternative diagnostic imaging in 3 to 6 months/);
});

test('LR-1, LR-2, and LR-NC are not flagged malignant', () => {
  for (const c of ['LR-1', 'LR-2', 'LR-NC']) {
    assert.equal(liRads({ category: c }).malignant, false, c);
  }
});

test('LR-5 is definitely HCC, flagged malignant, and may be treated without biopsy', () => {
  const r = liRads({ category: 'LR-5' });
  assert.equal(r.malignant, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /definitely HCC/);
  assert.match(r.band, /without biopsy/);
});

test('LR-M and LR-TIV are flagged malignant', () => {
  assert.equal(liRads({ category: 'LR-M' }).malignant, true);
  assert.equal(liRads({ category: 'LR-TIV' }).malignant, true);
  assert.match(liRads({ category: 'LR-M' }).band, /not HCC specific/);
  assert.match(liRads({ category: 'LR-TIV' }).band, /tumor in vein/);
});

test('input is normalized: bare number, no dash, and lower case all resolve', () => {
  assert.equal(liRads({ category: '5' }).category, 'LR-5');
  assert.equal(liRads({ category: 'LR5' }).category, 'LR-5');
  assert.equal(liRads({ category: 'lrm' }).category, 'LR-M');
  assert.equal(liRads({ category: 'tiv' }).category, 'LR-TIV');
});

test('a missing or unknown category is invalid', () => {
  assert.equal(liRads({}).valid, false);
  assert.equal(liRads({ category: 'LR-6' }).valid, false);
  assert.equal(liRads({ category: 'X' }).valid, false);
});
