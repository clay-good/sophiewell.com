// spec-v245: worked examples for the hematology discrimination indices + HS
// severity. Formulas / point systems spec-v97 verified (Shine & Lal 1977; Green &
// King 1989; Davis 1999; Zouboulis 2017).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shineLal, greenKing, percentPlateletRecovery, ihs4 } from '../../lib/hemederm-v245.js';

test('shine-lal: < 1530 thalassemia', () => {
  const r = shineLal({ mcv: 70, mch: 22 }); // 4900*22/100 = 1078
  assert.equal(r.score, 1078);
  assert.equal(r.abnormal, true);
});
test('shine-lal: > 1530 iron deficiency', () => {
  const r = shineLal({ mcv: 90, mch: 30 }); // 8100*30/100 = 2430
  assert.equal(r.score, 2430);
  assert.equal(r.abnormal, false);
});

test('green-king: < 65 thalassemia', () => {
  const r = greenKing({ mcv: 70, rdw: 14, hb: 11 }); // 4900*14/1100 = 62.4
  assert.equal(r.score, 62.4);
  assert.equal(r.abnormal, true);
});

test('percent-platelet-recovery: adequate increment', () => {
  const r = percentPlateletRecovery({ pre: 10, post: 40, bloodVolume: 5, transfused: 4 });
  assert.equal(r.score, 37.5);
  assert.equal(r.abnormal, false);
});
test('percent-platelet-recovery: post below pre invalid', () => {
  assert.equal(percentPlateletRecovery({ pre: 40, post: 10, bloodVolume: 5, transfused: 4 }).valid, false);
});

test('ihs4: severe at >= 11', () => {
  const r = ihs4({ nodules: 3, abscesses: 2, tunnels: 1 }); // 3 + 4 + 4 = 11
  assert.equal(r.score, 11);
  assert.match(r.band, /severe/);
});
test('ihs4: mild band', () => {
  const r = ihs4({ nodules: 2, abscesses: 0, tunnels: 0 });
  assert.equal(r.score, 2);
  assert.equal(r.abnormal, false);
});
