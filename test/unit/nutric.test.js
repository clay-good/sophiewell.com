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
