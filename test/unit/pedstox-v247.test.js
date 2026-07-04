// spec-v247: worked examples for the pediatric acute-care + toxicology tools. Point
// systems / formulas spec-v97 verified (Tepas 1987; Johnson & Bhutani 1999; Widmark
// 1932; Eberhart 2004).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pediatricTraumaScore, bindScore, widmarkBac, povocPonv } from '../../lib/pedstox-v247.js';

test('pediatric-trauma-score: sum of tri-state components', () => {
  const r = pediatricTraumaScore({ weight: 2, airway: 2, sbp: 2, cns: 1, wound: 2, skeletal: 1 });
  assert.equal(r.score, 10);
  assert.equal(r.abnormal, false);
});
test('pediatric-trauma-score: <= 8 flags transfer', () => {
  const r = pediatricTraumaScore({ weight: 1, airway: 1, sbp: 1, cns: 1, wound: 2, skeletal: 2 }); // 8
  assert.equal(r.score, 8);
  assert.equal(r.abnormal, true);
});

test('bind-score: moderate band', () => {
  const r = bindScore({ mentalStatus: 2, muscleTone: 2, cry: 1 });
  assert.equal(r.score, 5);
  assert.match(r.band, /moderate/);
});

test('widmark-bac: over legal limit', () => {
  const r = widmarkBac({ grams: 56, weight: 70, hours: 0, sex: 'male' });
  assert.equal(r.score, 0.12);
  assert.equal(r.abnormal, true);
});
test('widmark-bac: elimination lowers BAC over time', () => {
  const r = widmarkBac({ grams: 56, weight: 70, hours: 4, sex: 'male' });
  assert.ok(r.score < 0.12);
});

test('povoc-ponv: 3 factors', () => {
  const r = povocPonv({ duration: true, age: true, history: true });
  assert.equal(r.score, 3);
  assert.match(r.band, /55%/);
});
test('povoc-ponv: zero factors low risk', () => {
  const r = povocPonv({});
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});
