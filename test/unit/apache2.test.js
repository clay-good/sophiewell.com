// spec-v58 §2.11: APACHE II.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apache2 } from '../../lib/scoring-v6.js';

const base = { temp: 39, map: 60, hr: 120, rr: 30, oxy: 65, ph: 7.3, na: 150, k: 5.6, creatinine: 2, hct: 48, wbc: 18, gcs: 13, age: 60 };
test('example: total 23, moderate band', () => {
  const r = apache2(base);
  assert.equal(r.total, 23);
  assert.match(r.band, /Moderate/);
});
test('normal physiology, young, no chronic -> 0', () => {
  const r = apache2({ temp: 37, map: 90, hr: 80, rr: 16, oxy: 90, ph: 7.4, na: 140, k: 4, creatinine: 1, hct: 40, wbc: 8, gcs: 15, age: 30 });
  assert.equal(r.total, 0);
});
test('GCS contributes 15 - GCS; age and chronic points add', () => {
  const r = apache2({ ...base, gcs: 10, age: 80, chronicHealth: true, nonoperativeOrEmergency: true });
  assert.equal(r.parts.find((p) => p[0].startsWith('Glasgow'))[1], 5);
  assert.equal(r.agePts, 6);
  assert.equal(r.chronicPts, 5);
});
test('out-of-range pH throws', () => {
  assert.throws(() => apache2({ ...base, ph: 5 }));
});
