// spec-v13 §3.4.1 wave 13-4: NUTRIC boundary examples per Heyland DK,
// et al. Crit Care. 2011;15(6):R268.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nutric } from '../../lib/scoring-v4.js';

test('nutric low: 55 / APACHE 18 / SOFA 6 / 1 comorb / 0 days / IL-6 0 -> 3 (low)', () => {
  const r = nutric({ ageYears: 55, apache2: 18, sofa: 6, comorbidities: 1,
    daysHospitalToIcu: 0, il6Pg: 0 });
  assert.equal(r.score, 3);
  assert.equal(r.highRisk, false);
});

test('nutric threshold 6 -> high', () => {
  const r = nutric({ ageYears: 60, apache2: 22, sofa: 7, comorbidities: 3,
    daysHospitalToIcu: 2, il6Pg: 0 });
  // 1 + 2 + 1 + 1 + 1 + 0 = 6
  assert.equal(r.score, 6);
  assert.equal(r.highRisk, true);
});

test('nutric maximum 10', () => {
  const r = nutric({ ageYears: 80, apache2: 30, sofa: 12, comorbidities: 5,
    daysHospitalToIcu: 5, il6Pg: 500 });
  assert.equal(r.score, 10);
  assert.equal(r.highRisk, true);
});

// spec-v1151: `nutricMissing` leaves IL-6 out by design -- it is rarely available
// and mNUTRIC exists for that -- but the IL-6 term still adds a point at >= 400,
// so a total of 5 without it is one point short of the cutoff.
test('nutric: a total of 5 without IL-6 cannot read as low risk', () => {
  const fivePoints = { ageYears: 75, apache2: 18, sofa: 6, comorbidities: 2, daysHospitalToIcu: 0 };
  const blank = nutric(fivePoints);
  assert.equal(blank.score, 5);
  // The defect, stated: it said "low nutritional risk" at one point short.
  assert.equal(blank.highRisk, null);
  assert.match(blank.band, /at least 5 of 10/);
  assert.match(blank.band, /cannot yet read as low nutritional risk/);
  assert.match(blank.band, /mNUTRIC/);
  // An IL-6 of 500 is what it could not rule out.
  assert.equal(nutric({ ...fivePoints, il6Pg: 500 }).score, 6);
  assert.equal(nutric({ ...fivePoints, il6Pg: 500 }).highRisk, true);
  // A typed 0 is an answer (rule 1): 5 stands and reads low.
  const typedZero = nutric({ ...fivePoints, il6Pg: 0 });
  assert.equal(typedZero.highRisk, false);
  assert.match(typedZero.band, /low nutritional risk/);
  assert.doesNotMatch(typedZero.band, /at least/);
  // Further from the cutoff, IL-6 cannot reach it and the reading stands -- and
  // says so rather than staying silent about the term it did not have.
  const three = nutric({ ageYears: 55, apache2: 18, sofa: 6, comorbidities: 1, daysHospitalToIcu: 0 });
  assert.equal(three.score, 3);
  assert.equal(three.highRisk, false);
  assert.match(three.band, /would not reach the >=6 cutoff/);
});
