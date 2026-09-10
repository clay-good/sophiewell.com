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

// spec-v1210: `pos(v, lo, hi)` returned null for a blank AND for an out-of-range
// value, so an ANC of 9999 was answered "Enter absolute neutrophil count" -- the
// reader retypes the same number and gets the same sentence.
test('nmr: an out-of-range count is named, not reported as missing', () => {
  const bad = nmr({ anc: 9999, amc: 0.5 });
  assert.equal(bad.valid, false);
  assert.match(bad.message, /absolute neutrophil count must be between 0.001 and 500/);
  assert.ok(!/^Enter absolute neutrophil count and/.test(bad.message), 'must not ask for the value just entered');
});

test('nmr: a blank count is still asked for', () => {
  assert.match(nmr({ amc: 0.5 }).message, /^Enter the absolute neutrophil count/);
});

test('nmr: a real pair still computes', () => {
  assert.equal(nmr({ anc: 3.5, amc: 0.5 }).score, 7);
});
