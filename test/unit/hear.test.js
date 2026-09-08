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

test('an unknown select key never throws -- and no longer scores as the 0 option', () => {
  // This test used to assert `total === 0, veryLow === true`, which is how the
  // spec-v1134 defect was written down and thereby made to look handled: a key
  // the tile does not recognise was scored as "slightly suspicious / normal ECG /
  // no risk factors". Robustness was the point and robustness is kept -- nothing
  // throws -- but an unrecognised key is an ungraded item, not a reassuring one.
  const r = hear({ history: 'bogus', ecg: 'x', age: 30, risk: 'y' });
  assert.equal(r.valid, false);
  assert.equal(r.total, 0);
  assert.deepEqual(r.ungraded, ['the history', 'the ECG', 'the risk factors']);
});

test('spec-v1134: an ungraded item cannot be read as its zero-point level', () => {
  // `pick(table, key, 'h0')` fell back to the first row of each table, and in all
  // three that row is the reassuring one: history slightly suspicious, ECG
  // normal, no risk factors. The only guard was on the age, so a chest-pain form
  // with nothing in it but a date of birth answered "HEAR score 0: very low risk
  // -- the troponin-free band".
  const ageOnly = hear({ age: 30 });
  assert.equal(ageOnly.valid, false);
  assert.deepEqual(ageOnly.ungraded, ['the history', 'the ECG', 'the risk factors']);
  assert.match(ageOnly.band, /grade the history, the ECG and the risk factors/);
  assert.doesNotMatch(ageOnly.band, /very low risk \(/);

  // One ungraded item is enough: each is worth up to 2 against a cut-off of 1.
  const oneMissing = hear({ age: 30, history: 'h0', ecg: 'e0' });
  assert.equal(oneMissing.valid, false);
  assert.deepEqual(oneMissing.ungraded, ['the risk factors']);
});

test('spec-v1134: above the cut-off the verdict holds, and the total says it is a floor', () => {
  // Rule 13 as spec-v1114 refined it: the verdict is exempt, the number under it
  // is not. Age 65+ alone is 2, already past the very-low-risk line, and the
  // ungraded items can only add.
  const r = hear({ age: 70 });
  assert.equal(r.valid, true);
  assert.equal(r.veryLow, false);
  assert.equal(r.floorOnly, true);
  assert.match(r.band, /HEAR score at least 2/);
  assert.match(r.band, /HEART scoring with troponin is indicated/);

  // Fully graded, the reading is unchanged from before this wave.
  const graded = hear({ age: 58, history: 'h1', ecg: 'e1', risk: 'r1' });
  assert.equal(graded.total, 4);
  assert.equal(graded.floorOnly, false);
  assert.match(graded.band, /^HEAR score 4:/);
});
