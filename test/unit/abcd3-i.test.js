// spec-v203 2.3: ABCD3-I worked examples crossing the risk strata. ABCD2 base +
// dual TIA (+2) + carotid >=50% (+2) + abnormal DWI (+2), total 0-13; strata low
// 0-3, medium 4-7, high 8-13. Weights spec-v97 cross-verified (neurology.org,
// AHA Stroke).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { abcd3i } from '../../lib/periop-frailty-v203.js';

test('all items -> maximum 13, high-risk (worked example)', () => {
  const r = abcd3i({ age: 65, sbp: 150, dbp: 92, durationMinutes: 90, clinical: 'weakness', diabetes: true, dualTia: true, carotidStenosis: true, dwiAbnormal: true });
  assert.equal(r.valid, true);
  assert.equal(r.score, 13);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /high-risk/);
});

test('low-risk case (0-3)', () => {
  const r = abcd3i({ age: 50, sbp: 120, dbp: 80, durationMinutes: 30, clinical: 'speech', diabetes: false });
  assert.equal(r.score, 2); // speech +1, duration 30 +1
  assert.equal(r.abnormal, false);
  assert.match(r.band, /low-risk/);
});

test('medium-risk case (4-7)', () => {
  const r = abcd3i({ age: 70, sbp: 150, dbp: 85, durationMinutes: 5, clinical: 'weakness', diabetes: true, dwiAbnormal: true });
  // age 1 + bp 1 + weakness 2 + duration 0 + diabetes 1 + dwi 2 = 7
  assert.equal(r.score, 7);
  assert.match(r.band, /medium-risk/);
});

test('imaging additions each add 2 points over the ABCD2 base', () => {
  const base = { age: 50, sbp: 120, dbp: 80, durationMinutes: 5, clinical: 'other', diabetes: false };
  assert.equal(abcd3i(base).score, 0);
  assert.equal(abcd3i({ ...base, dualTia: true }).score, 2);
  assert.equal(abcd3i({ ...base, carotidStenosis: true }).score, 2);
  assert.equal(abcd3i({ ...base, dwiAbnormal: true }).score, 2);
});

test('incomplete inputs -> complete-the-fields', () => {
  const r = abcd3i({ age: 65, sbp: 150 });
  assert.equal(r.valid, false);
  assert.match(r.message, /clinical feature/);
});

test('score never exceeds 13', () => {
  const r = abcd3i({ age: 90, sbp: 220, dbp: 130, durationMinutes: 600, clinical: 'weakness', diabetes: true, dualTia: true, carotidStenosis: true, dwiAbnormal: true });
  assert.equal(r.score, 13);
});
