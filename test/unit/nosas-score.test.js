// spec-v114 2.5: NoSAS score (Marti-Soler 2016). neck>40(4), BMI 25-<30(3) or
// >=30(5), snoring(2), age>55(4), male(2); total 0-17; >= 8 high risk.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nosasScore } from '../../lib/pulm-v114.js';

test('worked example crosses >= 8 (high risk)', () => {
  // neck 42 (4) + BMI 31 (5) + age 58 (4) + male (2) = 15
  const r = nosasScore({ neck: 42, bmi: 31, age: 58, male: true });
  assert.equal(r.total, 15);
  assert.equal(r.high, true);
  assert.match(r.band, />= 8/);
});

test('BMI is a single mutually-exclusive item (3 or 5, never additive)', () => {
  const base = { neck: 30, age: 40 };
  assert.equal(nosasScore({ ...base, bmi: 24 }).total, 0);
  assert.equal(nosasScore({ ...base, bmi: 27 }).total, 3);
  assert.equal(nosasScore({ ...base, bmi: 32 }).total, 5);
});

test('strict inequalities: neck>40, age>55 (40 and 55 do not score)', () => {
  assert.equal(nosasScore({ neck: 40, bmi: 22, age: 55 }).total, 0);
  assert.equal(nosasScore({ neck: 41, bmi: 22, age: 56 }).total, 8);
});

test('high-risk threshold boundary at 7/8', () => {
  // age 56 (4) + snoring (2) -> 6, plus male (2) -> 8
  assert.equal(nosasScore({ neck: 30, bmi: 22, age: 56, snoring: true }).high, false); // 6
  assert.equal(nosasScore({ neck: 41, bmi: 22, age: 30, snoring: true }).high, false); // 4+2=6
  assert.equal(nosasScore({ neck: 41, bmi: 27, age: 30, snoring: true }).total, 9); // 4+3+2 -> high
  assert.equal(nosasScore({ neck: 41, bmi: 27, age: 30, snoring: true }).high, true);
});

test('partial input returns a complete-the-fields fallback', () => {
  assert.equal(nosasScore({ neck: 42 }).valid, false);
  assert.equal(nosasScore({}).valid, false);
});
