// spec-v200 2.1: OASIS worked examples and mortality-range spread.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { oasis } from '../../lib/critcare-severity-v200.js';

test('low OASIS -> low predicted mortality', () => {
  const r = oasis({ preIcuHours: 10, age: 20, gcs: 15, hr: 80, map: 90, rr: 16, temp: 37, urine: 3000, mechVent: false, elective: true });
  assert.equal(r.valid, true);
  assert.equal(r.score, 2);
  assert.equal(r.abnormal, false);
  assert.ok(r.mortality < 5);
});

test('high OASIS -> high predicted mortality', () => {
  const r = oasis({ preIcuHours: 2, age: 70, gcs: 10, hr: 130, map: 55, rr: 28, temp: 35, urine: 500, mechVent: true, elective: false });
  assert.equal(r.score, 51);
  assert.ok(r.mortality > 50);
  assert.equal(r.abnormal, true);
});

test('ventilation and non-elective status add points', () => {
  const base = { preIcuHours: 10, age: 20, gcs: 15, hr: 80, map: 90, rr: 16, temp: 37, urine: 3000, mechVent: false, elective: true };
  assert.equal(oasis(base).score, 2);
  assert.equal(oasis({ ...base, mechVent: true }).score, 11);
  assert.equal(oasis({ ...base, elective: false }).score, 8);
});

test('incomplete inputs -> complete-the-fields', () => {
  const r = oasis({ age: 70 });
  assert.equal(r.valid, false);
  assert.match(r.message, /OASIS variables/);
});

test('score never exceeds the published maximum of 75', () => {
  const r = oasis({ preIcuHours: 0.1, age: 80, gcs: 3, hr: 200, map: 10, rr: 3, temp: 41, urine: 100, mechVent: true, elective: false });
  assert.ok(r.score <= 75);
  assert.equal(r.score, 75);
});
