// spec-v12 §3.2.3 wave 12-2: Padua Prediction Score boundary examples
// per the shipping contract in spec-v12 §5. Weights and the >=4
// threshold reproduce Barbar 2010 Table 4 / §Results.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { padua } from '../../lib/scoring-v4.js';

test('padua low edge: no criteria -> 0, low risk', () => {
  const r = padua({ activeCancer: false, priorVte: false,
    reducedMobility: false, thrombophilia: false, recentTrauma: false,
    ageOver70: false, heartOrRespFailure: false, miOrStroke: false,
    acuteInfectionOrRheum: false, bmi30: false, hormonalTreatment: false });
  assert.equal(r.score, 0);
  assert.match(r.band, /low risk/);
});

// Mid: age >= 70 (1) + heart failure (1) + acute infection (1) + BMI 30 (1) = 4.
// Exactly at the high-risk threshold.
test('padua mid: 4 one-point criteria -> 4, high risk (threshold)', () => {
  const r = padua({ activeCancer: false, priorVte: false,
    reducedMobility: false, thrombophilia: false, recentTrauma: false,
    ageOver70: true, heartOrRespFailure: true, miOrStroke: false,
    acuteInfectionOrRheum: true, bmi30: true, hormonalTreatment: false });
  assert.equal(r.score, 4);
  assert.match(r.band, /high risk/);
});

// High edge: every criterion positive -> 3+3+3+3+2+1+1+1+1+1+1 = 20.
test('padua high edge: all criteria positive -> 20, high risk', () => {
  const r = padua({ activeCancer: true, priorVte: true,
    reducedMobility: true, thrombophilia: true, recentTrauma: true,
    ageOver70: true, heartOrRespFailure: true, miOrStroke: true,
    acuteInfectionOrRheum: true, bmi30: true, hormonalTreatment: true });
  assert.equal(r.score, 20);
  assert.match(r.band, /high risk/);
});

// Threshold edge: 3 vs 4.
test('padua threshold: 3 -> low, 4 -> high', () => {
  const lo = padua({ activeCancer: true, priorVte: false,
    reducedMobility: false, thrombophilia: false, recentTrauma: false,
    ageOver70: false, heartOrRespFailure: false, miOrStroke: false,
    acuteInfectionOrRheum: false, bmi30: false, hormonalTreatment: false });
  assert.equal(lo.score, 3);
  assert.match(lo.band, /low risk/);
  const hi = padua({ activeCancer: true, priorVte: false,
    reducedMobility: false, thrombophilia: false, recentTrauma: false,
    ageOver70: true, heartOrRespFailure: false, miOrStroke: false,
    acuteInfectionOrRheum: false, bmi30: false, hormonalTreatment: false });
  assert.equal(hi.score, 4);
  assert.match(hi.band, /high risk/);
});
