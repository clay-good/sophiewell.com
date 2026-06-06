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
test('albumin 0 stays finite (denominator floored at 0.1), no null', () => {
  assert.equal(correctedPhenytoin({ measured: 8, albumin: 0, esrd: false }).corrected, 80);
});
test('impossible (negative measured) throws RangeError', () => {
  assert.throws(() => correctedPhenytoin({ measured: -1, albumin: 2, esrd: false }), RangeError);
});
