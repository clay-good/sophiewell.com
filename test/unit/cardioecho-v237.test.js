// spec-v237: worked examples for the cardiology ECG / echo calculators. Point
// systems / formulas spec-v97 verified (Romhilt-Estes 1968; Wilkins 1988; Hatle
// 1979; ASE/EACVI DVI; Gobel 1978).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { romhiltEstes, wilkinsScore, mitralValveAreaPht, aorticDvi, ratePressureProduct } from '../../lib/cardioecho-v237.js';

test('romhilt-estes: >= 5 definite LVH', () => {
  const r = romhiltEstes({ voltage: true, strain: 3 }); // 3 + 3
  assert.equal(r.score, 6);
  assert.equal(r.abnormal, true);
});
test('romhilt-estes: digitalis strain scores 1', () => {
  const r = romhiltEstes({ voltage: true, strain: 1 }); // 3 + 1 = 4 probable
  assert.equal(r.score, 4);
  assert.match(r.band, /probable/);
});

test('wilkins-score: <= 8 favorable', () => {
  const r = wilkinsScore({ mobility: 2, thickening: 2, calcification: 2, subvalvular: 2 });
  assert.equal(r.score, 8);
  assert.equal(r.abnormal, false);
});
test('wilkins-score: >= 13 unfavorable', () => {
  const r = wilkinsScore({ mobility: 4, thickening: 4, calcification: 3, subvalvular: 3 }); // 14
  assert.equal(r.score, 14);
  assert.match(r.band, /unfavorable/);
});

test('mitral-valve-area-pht: 220/PHT moderate', () => {
  const r = mitralValveAreaPht({ pht: 150 });
  assert.equal(r.score, 1.47);
  assert.match(r.band, /moderate/);
});

test('aortic-dvi: <= 0.25 severe', () => {
  const r = aorticDvi({ lvot: 18, av: 90 });
  assert.equal(r.score, 0.2);
  assert.equal(r.abnormal, true);
});

test('rate-pressure-product: HR x SBP', () => {
  const r = ratePressureProduct({ hr: 80, sbp: 140 });
  assert.equal(r.score, 11200);
});
