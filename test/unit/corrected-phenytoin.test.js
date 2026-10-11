// spec-v61 §3.4: albumin-corrected phenytoin (Sheiner-Tozer).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { correctedPhenytoin } from '../../lib/clinical-v7.js';

test('example: measured 8, albumin 2.0 -> 16 ug/mL (therapeutic)', () => {
  const r = correctedPhenytoin({ measured: 8, albumin: 2.0, esrd: false });
  assert.equal(r.corrected, 16);
  assert.match(r.band, /within/);
});
test('ESRD variant uses 0.1 factor: 8 / (0.1*2 + 0.1) = 26.7', () => {
  assert.equal(correctedPhenytoin({ measured: 8, albumin: 2.0, esrd: true }).corrected, 26.7);
});
test('the denominator stays finite at the lowest survivable albumin, and 0 is refused', () => {
  // spec-v1234: this used an albumin of 0 to show the denominator never reaches
  // zero. A serum albumin of 0 is outside BOUNDS.albumin (0.5-7) and is now
  // refused, so the same point is made at the envelope's floor -- and the
  // arithmetic it was guarding against is unchanged.
  assert.equal(correctedPhenytoin({ measured: 8, albumin: 0.5, esrd: false }).corrected, 40);
  assert.throws(() => correctedPhenytoin({ measured: 8, albumin: 0, esrd: false }), /albumin must be between 0.5 and 7/);
  assert.throws(() => correctedPhenytoin({ measured: 8, albumin: 70, esrd: false }), /albumin must be between 0.5 and 7/);
});
test('impossible (negative measured) throws RangeError', () => {
  assert.throws(() => correctedPhenytoin({ measured: -1, albumin: 2, esrd: false }), RangeError);
});

// spec-v1631 backfill 3: a coefficient choice, and the estimated unbound level against the label.
test('the coefficient is 0.2 unless 0.275 is chosen; anything else is refused; ESRD keeps 0.1', () => {
  assert.equal(correctedPhenytoin({ measured: 8, albumin: 2.0 }).coefficient, 0.2);
  assert.match(correctedPhenytoin({ measured: 8, albumin: 2.0 }).coefficientNote, /was not entered, so 0\.2 \(Winter-Tozer\) was used/);
  assert.match(correctedPhenytoin({ measured: 8, albumin: 2.0, coefficient: '0.2' }).coefficientNote, /^Albumin coefficient 0\.2/);
  const cheng = correctedPhenytoin({ measured: 8, albumin: 2.0, coefficient: '0.275' });
  // 8 / (0.275 x 2 + 0.1) = 12.3
  assert.deepEqual([cheng.corrected, cheng.coefficient], [12.3, 0.275]);
  assert.match(cheng.coefficientNote, /Cheng 2016/);
  assert.throws(() => correctedPhenytoin({ measured: 8, albumin: 2.0, coefficient: '0.25' }), /0\.2 \(Winter-Tozer\) or 0\.275/);
  const esrd = correctedPhenytoin({ measured: 8, albumin: 2.0, esrd: true, coefficient: '0.275' });
  assert.deepEqual([esrd.corrected, esrd.coefficient], [26.7, 0.1]);
  assert.match(esrd.coefficientNote, /does not apply/);
});
test('the estimated unbound level is 10% of the corrected level, against the label\'s 1 to 2', () => {
  const r = correctedPhenytoin({ measured: 8, albumin: 2.0 });
  assert.equal(r.estimatedFree, 1.6);
  assert.match(r.freeBand, /within the label's 1 to 2/);
  assert.match(correctedPhenytoin({ measured: 3, albumin: 4 }).freeBand, /below/);
  assert.match(correctedPhenytoin({ measured: 15, albumin: 2 }).freeBand, /above/);
  assert.match(r.labelNote, /monitoring should be based on the unbound fraction/);
});
