// spec-v234: worked examples for the dermatology scoring indices. Formulas
// spec-v97 verified (Kimbrough-Green 1994; Olsen 2004; Rich & Scher 2003;
// Sullivan 1990).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { masi, saltScore, napsi, vancouverScarScale } from '../../lib/dermscore-v234.js';

test('masi: weighted regional sum', () => {
  const r = masi({ fA: 4, fD: 2, fH: 2, rmrA: 3, rmrD: 2, rmrH: 1, lmrA: 3, lmrD: 2, lmrH: 1, mA: 2, mD: 1, mH: 1 });
  assert.equal(r.score, 10.6); // 4.8 + 2.7 + 2.7 + 0.4
});
test('masi: max is 48', () => {
  const r = masi({ fA: 6, fD: 4, fH: 4, rmrA: 6, rmrD: 4, rmrH: 4, lmrA: 6, lmrD: 4, lmrH: 4, mA: 6, mD: 4, mH: 4 });
  assert.equal(r.score, 48);
});

test('salt-score: S3 at 50', () => {
  const r = saltScore({ top: 50, back: 50, right: 50, left: 50 });
  assert.equal(r.score, 50);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /S3/);
});
test('salt-score: weighted', () => {
  const r = saltScore({ top: 100, back: 0, right: 0, left: 0 }); // 40
  assert.equal(r.score, 40);
  assert.match(r.band, /S2/);
});

test('napsi: matrix + bed per nail', () => {
  const r = napsi({ matrix: 3, bed: 2 });
  assert.equal(r.score, 5);
  assert.equal(r.abnormal, true);
});
test('napsi: zero is normal nail', () => {
  const r = napsi({ matrix: 0, bed: 0 });
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});

test('vancouver-scar-scale: sum of four domains', () => {
  const r = vancouverScarScale({ pigmentation: 1, vascularity: 2, pliability: 3, height: 2 });
  assert.equal(r.score, 8);
});
test('vancouver-scar-scale: max is 13', () => {
  const r = vancouverScarScale({ pigmentation: 2, vascularity: 3, pliability: 5, height: 3 });
  assert.equal(r.score, 13);
});
