// spec-v107 2.1: HEAR score (Moumneh 2021), HEART minus troponin. 0-8, <= 1 very low.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hear } from '../../lib/eddecision-v107.js';

test('all-zero domains -> HEAR 0, very low risk', () => {
  const r = hear({ history: 'h0', ecg: 'e0', age: 40, risk: 'r0' });
  assert.equal(r.total, 0);
  assert.equal(r.veryLow, true);
  assert.equal(r.abnormal, false);
});

test('band flip: HEAR 1 (very low) -> HEAR 2 (not very low)', () => {
  // age 45-64 alone = 1 -> very low (<= 1)
  const one = hear({ history: 'h0', ecg: 'e0', age: 50, risk: 'r0' });
  assert.equal(one.total, 1);
  assert.equal(one.veryLow, true);
  // add a non-specific ECG (+1) = 2 -> not very low
  const two = hear({ history: 'h0', ecg: 'e1', age: 50, risk: 'r0' });
  assert.equal(two.total, 2);
  assert.equal(two.veryLow, false);
  assert.equal(two.abnormal, true);
});

test('tile example: moderate history + non-specific ECG + age 58 + 1-2 RF = 4', () => {
  const r = hear({ history: 'h1', ecg: 'e1', age: 58, risk: 'r1' });
  assert.equal(r.total, 4);
  assert.equal(r.veryLow, false);
  assert.match(r.band, /HEAR score 4: not in the very-low-risk band/);
});

test('all-max domains clamp to 8', () => {
  const r = hear({ history: 'h2', ecg: 'e2', age: 80, risk: 'r2' });
  assert.equal(r.total, 8);
  assert.equal(r.veryLow, false);
});

test('missing age -> complete-the-fields fallback (no band from a partial total)', () => {
  const r = hear({ history: 'h2', ecg: 'e2', risk: 'r2' });
  assert.equal(r.valid, false);
  assert.match(r.band, /Enter the patient age/);
});

test('unknown select keys default to the 0 option', () => {
  const r = hear({ history: 'bogus', ecg: 'x', age: 30, risk: 'y' });
  assert.equal(r.total, 0);
  assert.equal(r.veryLow, true);
});
