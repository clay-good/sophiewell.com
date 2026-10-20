// spec-v1659: public health measures, against the worked examples in CDC's Principles of Epidemiology,
// Lesson 3, and the 2000 U.S. standard population.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { incidencePrevalence as ip } from '../../lib/incidence-prevalence-v1659.js';
import { mortalityMeasures as mm } from '../../lib/mortality-measures-v1659.js';
import { ypll } from '../../lib/ypll-v1659.js';
import { attributableProportion as ap } from '../../lib/attributable-proportion-v1659.js';
import { vaccineEffectiveness as ve } from '../../lib/vaccine-effectiveness-v1659.js';
import { smr } from '../../lib/smr-v1659.js';
import { directAgeStandardization as das, US2000 } from '../../lib/direct-age-standardization-v1659.js';

test('incidence and prevalence: the Lesson 3 §2 examples', () => {
  assert.equal(ip({ measure: 'rate', cases: '16', denominator: '6400', timeUnit: 'person-years', multiplier: '1000' }).value, 2.5);
  assert.equal(ip({ measure: 'proportion', cases: '100', denominator: '189', multiplier: '100' }).value, 52.91);
  assert.equal(ip({ measure: 'point-prevalence', cases: '7', denominator: '18', multiplier: '100' }).value, 38.889);
  assert.equal(ip({ measure: 'period-prevalence', cases: '10', denominator: '20', multiplier: '100' }).value, 50);
  assert.equal(ip({ measure: 'period-prevalence', cases: '468', denominator: '1150', multiplier: '100' }).value, 40.696);
  assert.match(ip({ measure: 'rate', cases: '16', denominator: '6400', multiplier: '1000' }).message, /unit of person-time/);
  assert.equal(ip({ measure: 'proportion', cases: '20', denominator: '10', multiplier: '100' }).valid, false);
  assert.equal(ip({ measure: 'proportion', cases: '1', denominator: '', multiplier: '100' }).valid, false);
});

test('mortality: the Lesson 3 §3 examples, and the two page misprints', () => {
  assert.equal(Math.round(mm({ measure: 'crude', numerator: '2419921', denominator: '290809777' }).value * 10) / 10, 832.1);
  assert.equal(Math.round(mm({ measure: 'cause-specific', numerator: '108256', denominator: '290809777' }).value * 10) / 10, 37.2);
  assert.equal(Math.round(mm({ measure: 'case-fatality', numerator: '3', denominator: '555' }).value * 10) / 10, 0.5);
  // The page prints 0.0783 and 7.83; 11,228 / 143,497 = 0.078246, 0.0782 to four places.
  assert.equal(mm({ measure: 'death-to-case', numerator: '11228', denominator: '143497' }).value, 7.825);
  // The page prints 6.951; 28,025 / 4,089,950 x 1,000 = 6.852.
  assert.equal(mm({ measure: 'infant', numerator: '28025', denominator: '4089950' }).value, 6.852);
  assert.equal(mm({ measure: 'case-fatality', numerator: '6', denominator: '5' }).valid, false);
  assert.equal(mm({ numerator: '1', denominator: '2' }).valid, false);
});

test('YPLL: Table 3.10 leukemia 2002, 117,033 and 0.5 per 1,000; straddling groups refused', () => {
  const groups = '0, 4, 125\n5, 14, 316\n15, 24, 472\n25, 34, 471\n35, 44, 767\n45, 54, 1459\n55, 64, 2611\n65, 120, 15277';
  const r = ypll({ endPoint: '65', deaths: groups, population: '252755000', multiplier: '1000' });
  assert.equal(Math.round(r.ypll), 117033);
  assert.equal(Math.round(r.rate * 10) / 10, 0.5);
  assert.ok(r.notes[0].startsWith('0-4: 125 deaths × (65 − 2.5) = 7,812.5.'));
  assert.match(ypll({ endPoint: '65', deaths: '60, 69, 10' }).message, /straddles/);
  assert.equal(ypll({ endPoint: '65', deaths: '30\n70\n64' }).ypll, 36);
  assert.equal(ypll({ endPoint: '65', deaths: '' }).valid, false);
});

test('attributable proportion: 87.7%; a lower exposed risk gives the preventive fraction', () => {
  assert.equal(ap({ exposed: '0.57', unexposed: '0.07' }).attributable, 87.7);
  assert.equal(ap({ exposed: '0.2', unexposed: '0.4' }).preventive, 50);
  assert.equal(ap({ exposed: '0', unexposed: '0.1' }).valid, false);
});

test('vaccine effectiveness: the varicella example, 72%; undefined with no unvaccinated cases', () => {
  const r = ve({ casesVaccinated: '18', vaccinated: '152', casesUnvaccinated: '3', unvaccinated: '7', term: 'effectiveness' });
  assert.equal(r.riskRatio, 0.28);
  assert.equal(Math.round(r.ve), 72);
  assert.ok(r.notes.some((n) => /95% interval/.test(n)));
  assert.equal(ve({ casesVaccinated: '1', vaccinated: '10', casesUnvaccinated: '0', unvaccinated: '10' }).ve, null);
  assert.equal(ve({ casesVaccinated: '11', vaccinated: '10', casesUnvaccinated: '1', unvaccinated: '10' }).valid, false);
});

test('SMR: observed over expected, entered or summed from strata', () => {
  assert.equal(smr({ observed: '30', expected: '20' }).smr, 1.5);
  assert.equal(smr({ observed: '30', strata: '10000, 0.001\n5000, 0.002' }).expected, 20);
  assert.equal(smr({ observed: '1.5', expected: '2' }).valid, false);
  assert.match(smr({ observed: '3' }).message, /Or enter the strata/);
});

test('direct standardization: the 2000 standard sums to 274,633,642; CDC Table 3.6 Florida and Alaska', () => {
  assert.equal(US2000.reduce((s, [, p]) => s + p, 0), 274633642);
  const fl = '0, 0, 1548, 205579\n1, 4, 296, 816570\n5, 9, 141, 1046504\n10, 14, 219, 1131068\n15, 19, 734, 1073470\n20, 24, 1146, 1020856\n25, 34, 2627, 2090312\n35, 44, 5993, 2516004\n45, 54, 10730, 2225957\n55, 64, 16137, 1694574\n65, 74, 28959, 1450843\n75, 84, 50755, 1056275\n85, +, 48486, 359056';
  assert.equal(das({ standard: 'us2000', strata: fl }).adjusted, 787.7);
  const ak = '0, 0, 55, 9938\n1, 4, 12, 38503\n5, 9, 6, 50400\n10, 14, 24, 57216\n15, 19, 43, 56634\n20, 24, 63, 42929\n25, 34, 120, 84112\n35, 44, 280, 107305\n45, 54, 427, 103039\n55, 64, 480, 52543\n65, 74, 502, 24096\n75, 84, 645, 11784\n85, +, 373, 3117';
  // CDC prints 794.1 from WISQARS; the 2000 standard applied to the table's own rates gives 794.5.
  assert.equal(das({ standard: 'us2000', strata: ak }).adjusted, 794.5);
  assert.match(das({ standard: 'us2000', strata: '0, 2, 1, 10\n3, 9, 1, 10' }).message, /line up/);
  assert.match(das({ standard: 'us2000', strata: '0, 4, 1, 10\n1, 9, 1, 10' }).message, /line up|overlap/);
  assert.equal(das({ standard: 'own', strata: 'young, 10, 1000, 600\nold, 50, 1000, 400' }).adjusted, 2600);
  assert.equal(das({ strata: 'a, 1, 1, 1\nb, 1, 1, 1' }).valid, false);
});
