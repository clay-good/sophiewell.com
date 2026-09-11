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
