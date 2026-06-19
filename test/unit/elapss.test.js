// spec-v118 2.5: ELAPSS score (Backes 2017). EarlierSAH (no +1) / Location / Age
// (+1 per 5-yr band >60) / Population / Size / Shape -> published range 0-40;
// 3-/5-year growth risk 5.0%/8.4% (<5) ... 42.7%/60.8% (>=25).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { elapss } from '../../lib/neuro-v118.js';

test('missing age/size -> complete-the-fields fallback', () => {
  const r = elapss({ location: 'mca' });
  assert.equal(r.valid, false);
  assert.match(r.band, /Enter the patient age/);
});

test('lowest-risk profile (prior SAH, ICA, young, NA, tiny, regular) -> 0/40, ~5.0%/8.4%', () => {
  const r = elapss({ earlierSah: true, location: 'icaAcaAcom', age: 50, population: 'na', size: 2, irregular: false });
  assert.equal(r.total, 0);
  assert.equal(r.riskThree, '5.0%');
  assert.equal(r.riskFive, '8.4%');
  assert.equal(r.abnormal, false);
});

test('no earlier SAH adds +1 (the inverted direction)', () => {
  const r = elapss({ earlierSah: false, location: 'icaAcaAcom', age: 50, population: 'na', size: 2 });
  assert.equal(r.total, 1);
});

test('age banding: 60 -> 0, 61 -> +1, 66 -> +2, 96 -> +8 (capped)', () => {
  const base = { earlierSah: true, location: 'icaAcaAcom', population: 'na', size: 2 };
  assert.equal(elapss({ ...base, age: 60 }).total, 0);
  assert.equal(elapss({ ...base, age: 61 }).total, 1);
  assert.equal(elapss({ ...base, age: 66 }).total, 2);
  assert.equal(elapss({ ...base, age: 96 }).total, 8);
  assert.equal(elapss({ ...base, age: 120 }).total, 8);
});

test('size banding: 3 -> +4, 5 -> +10, 7 -> +13, 10 -> +22', () => {
  const base = { earlierSah: true, location: 'icaAcaAcom', age: 50, population: 'na' };
  assert.equal(elapss({ ...base, size: 3 }).total, 4);
  assert.equal(elapss({ ...base, size: 5 }).total, 10);
  assert.equal(elapss({ ...base, size: 7 }).total, 13);
  assert.equal(elapss({ ...base, size: 10 }).total, 22);
  assert.equal(elapss({ ...base, size: 2.9 }).total, 0);
});

test('high-risk band-flip -> clamped to 40/40, ~42.7%/60.8%', () => {
  const r = elapss({ earlierSah: false, location: 'pcomPost', age: 72, population: 'finland', size: 12, irregular: true });
  // 1 + 5 + 3 + 7 + 22 + 4 = 42, clamped to the published 40 ceiling
  assert.equal(r.total, 40);
  assert.equal(r.riskThree, '42.7%');
  assert.equal(r.riskFive, '60.8%');
  assert.equal(r.abnormal, true);
});

test('PCOM/posterior location scores +5, MCA +3', () => {
  const base = { earlierSah: true, age: 50, population: 'na', size: 2 };
  assert.equal(elapss({ ...base, location: 'pcomPost' }).total, 5);
  assert.equal(elapss({ ...base, location: 'mca' }).total, 3);
});

test('an intermediate total lands in the right risk band (10-14 -> 11.7%/19.3%)', () => {
  // size 7-9.9 (+13) alone would be 14? no: +13. earlierSah no (+1) -> 14
  const r = elapss({ earlierSah: false, location: 'icaAcaAcom', age: 50, population: 'na', size: 8 });
  assert.equal(r.total, 14);
  assert.equal(r.riskThree, '11.7%');
  assert.equal(r.riskFive, '19.3%');
});
