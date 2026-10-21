// Regression tests for the defects two independent reviews found in the WHO field-health tools (spec-v1540 to v1564)
// on 2026-10-20, each with the input that showed it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wastingClassify } from '../../lib/wasting-classify-v1548.js';
import { cragScreenFluconazole } from '../../lib/crag-screen-fluconazole-v1554.js';
import { entericFeverRegimen } from '../../lib/enteric-fever-regimen-v1560.js';
import { brazilSnakebiteAntivenom } from '../../lib/brazil-snakebite-antivenom-v1556.js';
import { snakeNeostigmineTrial } from '../../lib/snake-neostigmine-trial-v1555.js';
import { chagasStageTreatment } from '../../lib/chagas-stage-treatment-v1563.js';
import { leprosyClassifyMdt } from '../../lib/leprosy-classify-mdt-v1561.js';
import { scabiesDiagnosisMda } from '../../lib/scabies-diagnosis-mda-v1561.js';
import { newbornHypoglycemiaWho } from '../../lib/newborn-hypoglycemia-who-v1559.js';
import { newbornTemperatureWho } from '../../lib/newborn-temperature-who-v1559.js';
import { wbct20 } from '../../lib/wbct20-v1555.js';
import { yawsTestAndTreat } from '../../lib/yaws-test-and-treat-v1561.js';
import { rectalArtesunatePrereferral } from '../../lib/rectal-artesunate-prereferral-v1551.js';
import { imciPrereferralInjectables } from '../../lib/imci-prereferral-injectables-v1546.js';
import { vivaxRadicalCure } from '../../lib/vivax-radical-cure-v1552.js';
import { actWeightBandDose } from '../../lib/act-weight-band-dose-v1551.js';
import { whoAnemiaHb } from '../../lib/who-anemia-hb-v1550.js';
import { samWeightGain } from '../../lib/sam-weight-gain-v1549.js';
import { f100RutfAmount } from '../../lib/f100-rutf-amount-v1549.js';

test('MUAC in cm is not rounded before the 115 mm line: 11.499 cm is severe acute malnutrition', () => {
  assert.match(wastingClassify({ ageMonths: 12, edema: 'none', muac: '11.499', muacUnit: 'cm' }).band, /^Severe acute malnutrition, by MUAC 114\.99 mm/);
  assert.match(wastingClassify({ ageMonths: 12, edema: 'none', muac: '11.5', muacUnit: 'cm' }).band, /^Moderate acute malnutrition/);
});

test('per-kg doses: book maxima applied where the source has them, and a dose above the adult one is said', () => {
  assert.match(entericFeverRegimen({ severity: 'mild', resistance: 'high', ageGroup: 'child', weight: 60 }).band, /^Azithromycin 500 mg/);
  assert.match(entericFeverRegimen({ severity: 'severe', resistance: 'high', ageGroup: 'child', weight: 60 }).band, /^Ceftriaxone 3,000 mg/);
  const c = cragScreenFluconazole({ age: 16, cd4: 50, crag: 'pos', meningitis: 'no', weight: 120 });
  assert.ok(c.notes.some((n) => /720 to 800 mg a day \(maximum 800 mg\)/.test(n)));
  assert.ok(c.notes.some((n) => /1,440 mg a day .*above it/.test(n)));
  assert.ok(snakeNeostigmineTrial({ protocol: 'who', ageGroup: 'child', weight: 40, mamba: 'no', response: 'pending' }).notes.some((n) => /above the adult dose/.test(n)));
  const ras = rectalArtesunatePrereferral({ age: 0.5, weight: 1, danger: 'yes', referral: 'over6', imAvailable: 'no' });
  assert.equal(ras.abnormal, true);
  assert.equal(actWeightBandDose({ regimen: 'al', weight: 0.6 }).abnormal, true);
  assert.equal(actWeightBandDose({ regimen: 'al', weight: 9 }).abnormal, false);
});

test('an unassessed finding is not read as absent', () => {
  assert.match(brazilSnakebiteAntivenom({ type: 'bothrops', local: 'none', bleeding: 'none', shock: 'no', renal: 'no' }).band, /not assessed/);
  assert.equal(chagasStageTreatment({ phase: 'chronic', age: 30, weight: 70, ecg: 'normal', hf: 'none', lvef: 60 }).valid, false);
  const lep = leprosyClassifyMdt({ lesions: 3, age: 30, nerve: 'no', smear: 'notdone' });
  assert.doesNotMatch(lep.band, /no bacilli/);
  assert.match(lep.bandLabel, /unless a smear shows bacilli/);
  assert.ok(scabiesDiagnosisMda({ lesions: 'typical', itch: 'yes' }).notes.some((n) => /^Not assessed: burrows/.test(n)));
});

test('a value printed beside a WHO line sits on the side it was judged', () => {
  assert.match(newbornHypoglycemiaWho({ population: 'atrisk', glucose: 2.58 }).band, /glucose 2\.58 mmol\/L \(under 2\.6\)/);
  assert.ok(newbornTemperatureWho({ temp: 35.96 }).notes.some((n) => /35\.96 °C is read as 36 °C/.test(n)));
  assert.match(wbct20({ vessel: 'new-glass', result: 'not-clotted', timing: 'after', hours: 5.96, region: 'asia' }).band, /5\.96 hours.*0\.04 hours from now/);
  assert.match(whoAnemiaHb({ group: 'men', unit: 'gl', hb: '129.96', smoking: 'no' }).band, /129\.96 g\/L/);
  assert.match(samWeightGain({ previous: 5, current: 5.0498, days: 1, phase: 'rehab' }).band, /9\.96 g\/kg\/day: moderate/);
});

test('age and lactation rules the source states are applied', () => {
  assert.equal(imciPrereferralInjectables({ drug: 'gentamicin', weight: 4.5, age: 0.5 }).valid, false);
  const v = vivaxRadicalCure({ weight: 60, age: 30, sex: 'female', pregnant: 'no', bfInfant: 'no', test: 'semi', result: 'gt70', blood: 'cq', southAmerica: 'yes' });
  assert.ok(v.notes.some((n) => /tafenoquine.*Not while breastfeeding/.test(n)));
});

test('small text faults: a positive yaws test without a lesion, and the RUTF top band', () => {
  assert.ok(yawsTestAndTreat({ age: 10, endemic: 'yes', lesion: 'no', rdtC: 'yes', rdtT: 'yes' }).notes.some((n) => /positive test alone is not a case/.test(n)));
  assert.ok(f100RutfAmount({ weight: 11.95, phase: 'outpatient' }).notes.some((n) => /says 5 sachets a day \(35 a week\)/.test(n)));
});
