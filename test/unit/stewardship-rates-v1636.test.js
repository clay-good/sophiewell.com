// spec-v1636 tools 14 and 17: antimicrobial use rates and the SAAR; defined daily dose rates.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { auRateSaar } from '../../lib/au-rate-saar-v1636.js';
import { dddRate } from '../../lib/ddd-rate-v1636.js';

const fac = { scope: 'facwidein-all-inpatient', antimicrobialDays: 4200, daysPresent: 9000 };

test('antimicrobial days per 1,000 days present, per 100 admissions, and the SAAR', () => {
  const r = auRateSaar({ ...fac, admissions: 1500, predictedDays: 4000 });
  assert.deepEqual([r.ratePer1000DaysPresent, r.ratePer100Admissions, r.saar], [466.67, 280, 1.05]);
  assert.match(r.notes.join(' '), /Above 1: more antimicrobial days were observed than predicted/);
  assert.equal(auRateSaar({ ...fac, predictedDays: 5000 }).saar, 0.84);
});

test('nothing is predicted, and a missing optional count is said, not assumed', () => {
  const r = auRateSaar(fac);
  assert.deepEqual([r.ratePer100Admissions, r.saar], [null, null]);
  assert.match(r.notes.join(' '), /Admissions were not entered.*No predicted antimicrobial days were entered.*does not predict/);
});

test('the protocol\'s checks: admissions are facility-wide only; facility days present are not a sum of locations', () => {
  assert.match(auRateSaar({ scope: 'one-location', antimicrobialDays: 350, daysPresent: 600, admissions: 100 }).message, /facility-wide inpatient only/);
  assert.equal(auRateSaar({ scope: 'one-location', antimicrobialDays: 350, daysPresent: 600 }).ratePer1000DaysPresent, 583.33);
  assert.match(auRateSaar(fac).notes.join(' '), /must not be the sum of the locations' days present/);
  assert.match(auRateSaar({ scope: 'one-location', antimicrobialDays: 700, daysPresent: 600 }).notes.join(' '), /exceed days present/);
});

test('antimicrobial use: nothing is defaulted', () => {
  assert.match(auRateSaar({}).message, /^Choose the scope/);
  assert.match(auRateSaar({ scope: 'one-location' }).message, /^Enter the antimicrobial days/);
  assert.match(auRateSaar({ scope: 'one-location', antimicrobialDays: 10 }).message, /^Enter the days present/);
  assert.equal(auRateSaar({ scope: 'one-location', antimicrobialDays: 10, daysPresent: 0 }).valid, false);
  assert.equal(auRateSaar(null).valid, false);
});

test('defined daily doses: grams over the DDD, per 100 bed-days and per 1,000 patient-days', () => {
  const r = dddRate({ gramsUsed: 1200, ddd: 2, bedDays: 4500, indexYear: 2026 });
  assert.deepEqual([r.ddds, r.per100BedDays, r.per1000PatientDays], [600, 13.33, 133.33]);
  assert.match(r.notes.join(' '), /as entered from the 2026 index/);
  assert.match(dddRate({ gramsUsed: 1200, ddd: 2, bedDays: 4500 }).notes.join(' '), /index year of the DDD was not entered/);
});

test('defined daily doses: the DDD is the reader\'s, and nothing is defaulted', () => {
  assert.match(dddRate({}).message, /^Enter the grams used/);
  assert.match(dddRate({ gramsUsed: 1200, bedDays: 4500 }).message, /^Enter the DDD.*the value is not supplied here/);
  assert.match(dddRate({ gramsUsed: 1200, ddd: 2 }).message, /^Enter the bed-days/);
  assert.equal(dddRate({ gramsUsed: 1200, ddd: 0, bedDays: 4500 }).valid, false);
  assert.equal(dddRate(null).valid, false);
});
