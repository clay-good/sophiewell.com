// spec-v117 2.6: THRIVE score (Flint 2010). NIHSS (<=10=0/11-20=+2/>=21=+4),
// age (<=59=0/60-79=+1/>=80=+2), +1 each for hypertension, diabetes, atrial
// fibrillation; total 0-9. Extreme bands published (0-2: 64.7% good / 5.9%
// mortality; 6-9: 10.6% / 56.4%); the middle band (3-5) is intermediate.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { thriveStroke } from '../../lib/neuro-v117.js';

test('worked max: NIHSS 22, age 82, HTN+DM+AFib -> 9/9, THRIVE III high risk', () => {
  const r = thriveStroke({ nihss: 22, age: 82, htn: true, diabetes: true, afib: true });
  assert.equal(r.valid, true);
  assert.equal(r.total, 9);
  assert.equal(r.tier, 'high risk (THRIVE III)');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /56.4%/);
});

test('worked min: NIHSS 8, age 55, no comorbidity -> 0/9, THRIVE I low risk', () => {
  const r = thriveStroke({ nihss: 8, age: 55 });
  assert.equal(r.total, 0);
  assert.equal(r.tier, 'low risk (THRIVE I)');
  assert.equal(r.abnormal, false);
  assert.match(r.band, /64.7%/);
});

test('mid band lands intermediate without a fabricated percentage', () => {
  // NIHSS 12 (+2), age 65 (+1) = 3
  const r = thriveStroke({ nihss: 12, age: 65 });
  assert.equal(r.total, 3);
  assert.equal(r.tier, 'intermediate risk (THRIVE II)');
  assert.doesNotMatch(r.band, /%/);
});

test('NIHSS and age band boundaries', () => {
  // NIHSS 11 (+2), age 60 (+1) = 3
  assert.equal(thriveStroke({ nihss: 11, age: 60 }).total, 3);
  // NIHSS 21 (+4), age 80 (+2) = 6
  assert.equal(thriveStroke({ nihss: 21, age: 80 }).total, 6);
});

test('partial inputs render a complete-the-fields fallback', () => {
  const r = thriveStroke({ nihss: 16 });
  assert.equal(r.valid, false);
  assert.match(r.band, /Enter the patient age and the baseline NIHSS/);
});
