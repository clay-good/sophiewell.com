// spec-v136 2.1: HOMA-IR (Matthews DR, et al, Diabetologia 1985;28:412-419).
// HOMA-IR = (fasting insulin uU/mL x fasting glucose) / 405 (mg/dL) or / 22.5
// (mmol/L); linear HOMA-%B = (20 x insulin) / (glucose mmol/L - 3.5). Tests pin
// the worked value, the mg/dL <-> mmol/L equivalence, the %B domain guard, and
// the positivity guards.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { homaIr } from '../../lib/endo-v136.js';

test('worked example: insulin 12, glucose 100 mg/dL -> HOMA-IR 2.96', () => {
  const r = homaIr({ insulin: 12, glucose: 100, unit: 'mgdl' });
  assert.equal(r.valid, true);
  assert.equal(r.value, 2.96);
  assert.equal(r.homaB, 116.8); // (20*12)/((100/18)-3.5)
});

test('mg/dL and mmol/L forms agree (100 mg/dL = 5.5556 mmol/L)', () => {
  const mg = homaIr({ insulin: 12, glucose: 100, unit: 'mgdl' }).value;
  const mmol = homaIr({ insulin: 12, glucose: 100 / 18, unit: 'mmol' }).value;
  assert.equal(mg, mmol);
});

test('HOMA-%B is not defined at glucose <= 3.5 mmol/L', () => {
  const r = homaIr({ insulin: 10, glucose: 3, unit: 'mmol' });
  assert.equal(r.valid, true);
  assert.equal(r.homaB, null);
  assert.match(r.band, /not defined/);
});

test('higher insulin/glucose raise HOMA-IR', () => {
  const lo = homaIr({ insulin: 5, glucose: 90 }).value;
  const hi = homaIr({ insulin: 25, glucose: 140 }).value;
  assert.ok(hi > lo);
});

test('zero / negative / blank inputs surface the fallback (no log/div leak)', () => {
  assert.equal(homaIr({ insulin: 0, glucose: 100 }).valid, false);
  assert.equal(homaIr({ insulin: 12, glucose: 0 }).valid, false);
  assert.equal(homaIr({ insulin: -1, glucose: 100 }).valid, false);
  assert.equal(homaIr({}).valid, false);
  assert.equal(homaIr({ insulin: 12 }).valid, false);
});
