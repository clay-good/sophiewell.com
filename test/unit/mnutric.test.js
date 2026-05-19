// spec-v13 §3.4.2 wave 13-4: mNUTRIC per Rahman A, et al. Clin Nutr. 2016.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mnutric } from '../../lib/scoring-v4.js';

test('mnutric low: 55/18/6/1/0 -> 3 (low)', () => {
  const r = mnutric({ ageYears: 55, apache2: 18, sofa: 6, comorbidities: 1,
    daysHospitalToIcu: 0 });
  assert.equal(r.score, 3);
  assert.equal(r.highRisk, false);
});

test('mnutric threshold 5 -> high', () => {
  const r = mnutric({ ageYears: 60, apache2: 22, sofa: 7, comorbidities: 3,
    daysHospitalToIcu: 0 });
  // 1 + 2 + 1 + 1 + 0 = 5
  assert.equal(r.score, 5);
  assert.equal(r.highRisk, true);
});

test('mnutric maximum 9', () => {
  const r = mnutric({ ageYears: 80, apache2: 30, sofa: 12, comorbidities: 5,
    daysHospitalToIcu: 5 });
  assert.equal(r.score, 9);
});
