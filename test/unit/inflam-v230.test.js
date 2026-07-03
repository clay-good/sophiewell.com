// spec-v230: worked examples for the prognostic inflammation indices.
// Formulas spec-v97 cross-verified (see module header for source pairs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lmr, siri, piv, car } from '../../lib/inflam-v230.js';

test('lmr: lymphocyte / monocyte', () => {
  const r = lmr({ alc: 2.0, amc: 0.5 }); // 4
  assert.equal(r.score, 4);
  assert.equal(r.valid, true);
});
test('lmr: invalid without both counts', () => {
  assert.equal(lmr({ alc: 2 }).valid, false);
});

test('siri: neutrophil x monocyte / lymphocyte', () => {
  const r = siri({ anc: 4.0, amc: 0.5, alc: 2.0 }); // 1
  assert.equal(r.score, 1);
});
test('siri: invalid without all three', () => {
  assert.equal(siri({ anc: 4, amc: 0.5 }).valid, false);
});

test('piv: neutrophil x platelet x monocyte / lymphocyte', () => {
  const r = piv({ anc: 4.0, plt: 250, amc: 0.5, alc: 2.0 }); // 250
  assert.equal(r.score, 250);
});
test('piv: invalid without all four', () => {
  assert.equal(piv({ anc: 4, plt: 250, amc: 0.5 }).valid, false);
});

test('car: CRP / albumin', () => {
  const r = car({ crp: 20, albumin: 4.0 }); // 5
  assert.equal(r.score, 5);
});
test('car: invalid without both', () => {
  assert.equal(car({ crp: 20 }).valid, false);
});
