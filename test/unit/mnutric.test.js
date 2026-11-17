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

test('mnutric: a negative APACHE II or SOFA is refused, not read as low risk (spec-v1740)', () => {
  const ex = { ageYears: 55, apache2: 18, sofa: 6, comorbidities: 1, daysHospitalToIcu: 0 };
  for (const [k, v, re] of [['apache2', -18, /APACHE II score must be at least 0/], ['sofa', -6, /SOFA score must be at least 0/]]) {
    const neg = mnutric({ ...ex, [k]: v });
    assert.equal(neg.valid, false, k);
    assert.equal(neg.score, null, k);
    assert.match(neg.band, re);
    assert.equal(typeof mnutric({ ...ex, [k]: 0 }).score, 'number', k);
  }
  assert.equal(mnutric(ex).score, 3);
});

// spec-v1755: an ordinal item or a count has no value between its steps; a half-step is refused.
test('spec-v1755: mnutric refuses a fractional comorbidity count; whole counts and the worked example answer', () => {
  const ex = { ageYears: 55, apache2: 18, sofa: 6, comorbidities: 1, daysHospitalToIcu: 0 };
  const r = mnutric({ ...ex, comorbidities: 1.5 });
  assert.equal(r.valid, false);
  assert.equal(r.score, null);
  assert.match(r.band, /whole number/);
  assert.equal(mnutric({ ...ex, comorbidities: 2 }).score, 4);
  assert.equal(mnutric(ex).score, 3);
});
