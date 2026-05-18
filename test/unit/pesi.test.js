// spec-v12 §3.2.1 wave 12-2: PESI boundary worked examples per the
// shipping contract in spec-v12 §5. Class boundaries reproduce
// Aujesky 2005 Table 4.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pesi } from '../../lib/scoring-v4.js';

// Low edge: 50-year-old female with no criteria -> 50 points, Class I.
test('pesi low edge: 50yo female, no criteria -> 50, Class I', () => {
  const r = pesi({ age: 50, sex: 'F', cancer: false, heartFailure: false,
    chronicLungDisease: false, hr110: false, sbp100: false, rr30: false,
    tempLt36: false, alteredMental: false, sao2Lt90: false });
  assert.equal(r.score, 50);
  assert.equal(r.class, 'I');
  assert.match(r.band, /^Class I/);
});

// Mid: 70-year-old male with cancer + tachycardia.
// 70 + 10 (M) + 30 (cancer) + 20 (HR>=110) = 130 -> Class V.
test('pesi mid: male 70 + cancer + HR110 -> 130, Class V', () => {
  const r = pesi({ age: 70, sex: 'M', cancer: true, heartFailure: false,
    chronicLungDisease: false, hr110: true, sbp100: false, rr30: false,
    tempLt36: false, alteredMental: false, sao2Lt90: false });
  assert.equal(r.score, 130);
  assert.equal(r.class, 'V');
});

// High edge: all positive criteria + age 90 + male.
// 90 + 10 + 30 + 10 + 10 + 20 + 30 + 20 + 20 + 60 + 20 = 320 -> Class V.
test('pesi high edge: all criteria positive -> very high, Class V', () => {
  const r = pesi({ age: 90, sex: 'M', cancer: true, heartFailure: true,
    chronicLungDisease: true, hr110: true, sbp100: true, rr30: true,
    tempLt36: true, alteredMental: true, sao2Lt90: true });
  assert.equal(r.score, 320);
  assert.equal(r.class, 'V');
});

// Class boundaries per Aujesky 2005 Table 4.
test('pesi class boundaries: 65 -> I, 66 -> II, 85 -> II, 86 -> III, 105 -> III, 106 -> IV, 125 -> IV, 126 -> V', () => {
  const base = { sex: 'F', cancer: false, heartFailure: false,
    chronicLungDisease: false, hr110: false, sbp100: false, rr30: false,
    tempLt36: false, alteredMental: false, sao2Lt90: false };
  assert.equal(pesi({ ...base, age: 65 }).class, 'I');
  assert.equal(pesi({ ...base, age: 66 }).class, 'II');
  assert.equal(pesi({ ...base, age: 85 }).class, 'II');
  assert.equal(pesi({ ...base, age: 86 }).class, 'III');
  assert.equal(pesi({ ...base, age: 105 }).class, 'III');
  assert.equal(pesi({ ...base, age: 106 }).class, 'IV');
  assert.equal(pesi({ ...base, age: 125 }).class, 'IV');
  assert.equal(pesi({ ...base, age: 126 }).class, 'V');
});
