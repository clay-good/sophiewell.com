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

test('spec-v1131: an ungraded valve characteristic is not the best appearance', () => {
  // `lvl(v, 1, 4)` returns its LOW bound, and 1 on each Wilkins characteristic
  // is the best appearance there is. Four ungraded ones answered "Wilkins score
  // 4 -- favorable for balloon valvuloplasty", the most favourable reading the
  // instrument has, and the one that chooses a percutaneous procedure over open
  // surgery.
  const none = wilkinsScore({});
  assert.equal(none.score, 4);
  assert.equal(none.ungraded.length, 4);
  assert.equal(none.floorOnly, true);
  assert.match(none.band, /at least 4 on what was graded/);
  assert.doesNotMatch(none.band, /favorable for balloon valvuloplasty/);

  // Graded as 1 across the board, the favourable reading is earned.
  const best = wilkinsScore({ mobility: 1, thickening: 1, calcification: 1, subvalvular: 1 });
  assert.equal(best.floorOnly, false);
  assert.match(best.band, /favorable for balloon valvuloplasty/);
});

test('spec-v1131: unfavourable rules in from a subset', () => {
  // Rule 13: 13 points is 13 whatever the ungraded characteristic holds.
  const r = wilkinsScore({ mobility: 4, thickening: 4, calcification: 4 });
  assert.ok(r.score >= 13);
  assert.equal(r.floorOnly, false);
  assert.match(r.band, /unfavorable for balloon valvuloplasty/);
});
