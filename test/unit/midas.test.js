// spec-v95 2.6: Migraine Disability Assessment (Stewart 2001).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { midas } from '../../lib/neuro-v95.js';

test('grade band edges I/II/III/IV', () => {
  // sum 5 -> grade I; 6 -> II; 10 -> II; 11 -> III; 20 -> III; 21 -> IV.
  assert.equal(midas({ q1: 5, q2: 0, q3: 0, q4: 0, q5: 0 }).grade, 'I');
  assert.equal(midas({ q1: 6, q2: 0, q3: 0, q4: 0, q5: 0 }).grade, 'II');
  assert.equal(midas({ q1: 10, q2: 0, q3: 0, q4: 0, q5: 0 }).grade, 'II');
  assert.equal(midas({ q1: 11, q2: 0, q3: 0, q4: 0, q5: 0 }).grade, 'III');
  assert.equal(midas({ q1: 20, q2: 0, q3: 0, q4: 0, q5: 0 }).grade, 'III');
  assert.equal(midas({ q1: 21, q2: 0, q3: 0, q4: 0, q5: 0 }).grade, 'IV');
});

test('sums only the five disability questions', () => {
  const r = midas({ q1: 2, q2: 4, q3: 1, q4: 3, q5: 1, freq: 10, intensity: 6 });
  assert.equal(r.total, 11);
  assert.equal(r.grade, 'III');
  assert.equal(r.freq, 10);
  assert.equal(r.intensity, 6);
});

test('ancillary frequency and intensity are reported but not scored', () => {
  const r = midas({ q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, freq: 90, intensity: 9 });
  assert.equal(r.total, 0);
  assert.equal(r.grade, 'I');
});

test('blanks coerce to 0 and day-counts clamp to 92', () => {
  assert.equal(midas({}).total, 0);
  assert.equal(midas({}).grade, 'I');
  const clamped = midas({ q1: 1000, q2: 0, q3: 0, q4: 0, q5: 0 });
  assert.equal(clamped.total, 92);
  const intClamp = midas({ q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, intensity: 50 });
  assert.equal(intClamp.intensity, 10);
});
