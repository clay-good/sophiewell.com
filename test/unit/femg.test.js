// spec-v128 2.2: FEMg (Elisaf 1998). FEMg (%) = (urine Mg x plasma Cr) / (0.7 x
// plasma Mg x urine Cr) x 100. The 0.7 corrects for the protein-bound fraction.
// In hypomagnesemia, > ~2% (Elisaf cutoff ~4%) suggests renal magnesium wasting.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { femg } from '../../lib/renal-v128.js';

test('worked example with the 0.7 correction -> renal wasting', () => {
  const r = femg({ urineMg: 2.0, plasmaMg: 1.2, urineCr: 50, plasmaCr: 1.0 });
  assert.equal(r.valid, true);
  assert.equal(r.fe, 4.8); // (2 x 1) / (0.7 x 1.2 x 50) x 100 = 4.76
  assert.equal(r.abnormal, true);
  assert.match(r.band, /renal magnesium wasting/);
});

test('the 0.7 multiplier raises FE vs the uncorrected form', () => {
  // without 0.7: (2 x 1)/(1.2 x 50) x 100 = 3.33; with 0.7: 4.76 -> the 0.7
  // is on the denominator so the corrected FE is the larger value.
  const r = femg({ urineMg: 2.0, plasmaMg: 1.2, urineCr: 50, plasmaCr: 1.0 });
  assert.ok(r.fe > 3.33);
});

test('low FE -> extra-renal magnesium loss', () => {
  const r = femg({ urineMg: 1.0, plasmaMg: 2.0, urineCr: 100, plasmaCr: 1.0 });
  assert.equal(r.fe, 0.7);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /extra-renal/);
});

test('zero / missing denominator term -> valid:false', () => {
  assert.equal(femg({ urineMg: 2.0, plasmaMg: 0, urineCr: 50, plasmaCr: 1.0 }).valid, false);
  assert.equal(femg({ urineMg: 2.0, plasmaMg: 1.2, urineCr: 0, plasmaCr: 1.0 }).valid, false);
  assert.equal(femg({}).valid, false);
  assert.equal(femg('x').valid, false);
});
