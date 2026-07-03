// spec-v231: worked examples for the nutrition/inflammation prognostic tools.
// Cutoffs/formulas spec-v97 cross-verified (see module header for source pairs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { naples, nmr, far } from '../../lib/prognostic-v231.js';

test('naples: all four factors -> group 2', () => {
  const r = naples({ albumin: 3.5, cholesterol: 160, nlr: 4.0, lmr: 3.0 }); // 4
  assert.equal(r.score, 4);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /group 2/);
});
test('naples: no adverse factors -> group 0', () => {
  const r = naples({ albumin: 4.5, cholesterol: 200, nlr: 2.0, lmr: 5.0 }); // 0
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /group 0/);
});
test('naples: two factors -> group 1', () => {
  const r = naples({ albumin: 3.5, cholesterol: 200, nlr: 4.0, lmr: 5.0 }); // 2
  assert.equal(r.score, 2);
  assert.match(r.band, /group 1/);
});
test('naples: cutoff edges (albumin exactly 4, chol exactly 180, nlr exactly 2.96)', () => {
  // albumin 4 not < 4 (0); chol 180 <= 180 (1); nlr 2.96 not > 2.96 (0); lmr 4.44 <= 4.44 (1)
  const r = naples({ albumin: 4, cholesterol: 180, nlr: 2.96, lmr: 4.44 });
  assert.equal(r.score, 2);
});
test('naples: invalid without all inputs', () => {
  assert.equal(naples({ albumin: 3.5 }).valid, false);
});

test('nmr: neutrophil / monocyte', () => {
  const r = nmr({ anc: 4.0, amc: 0.5 }); // 8
  assert.equal(r.score, 8);
});
test('nmr: invalid without both', () => {
  assert.equal(nmr({ anc: 4 }).valid, false);
});

test('far: fibrinogen / albumin', () => {
  const r = far({ fibrinogen: 400, albumin: 4.0 }); // 100
  assert.equal(r.score, 100);
});
test('far: invalid without both', () => {
  assert.equal(far({ fibrinogen: 400 }).valid, false);
});
