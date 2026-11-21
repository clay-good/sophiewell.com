// spec-v1758: fields left blank in each tool's worked example were never driven past
// their lib/bounds.js envelope. Each case below refuses the just-past-ceiling value
// and still answers an in-range one.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kfre } from '../../lib/nephro-v127.js';
import { ckdEpiCystatin } from '../../lib/nephro-v92.js';
import { fourPeps } from '../../lib/vte-v106.js';
import { fickCardiacOutput } from '../../lib/gaps-v185.js';
import { hysLaw } from '../../lib/hys-law-v908.js';
import { kawasakiCriteria } from '../../lib/peds-v98.js';
import { kingsCollege } from '../../lib/rheum-periop-v89.js';
import { tlsCairoBishop } from '../../lib/metabolic-onc-v88.js';
import { iretonJones } from '../../lib/nutrition-energy-v152.js';
import { pedsBmiPercentile } from '../../lib/peds-growth-v141.js';
import { sbpAsciticFluid } from '../../lib/sbp-ascitic-fluid-v852.js';
import { shanghaiBrugada } from '../../lib/shanghai-brugada-v581.js';
import { digoxin } from '../../lib/medication-v5.js';

const refused = (r) => { assert.equal(r.valid, false, JSON.stringify(r)); assert.match(String(r.message || r.band), /plausible range/); };
const answered = (r) => assert.notEqual(r.valid, false, JSON.stringify(r));

test('kfre: the 8-variable labs are checked even on the 4-variable form', () => {
  const base = { mode: '4', age: 60, male: true, egfr: 30, acr: 300 };
  for (const [k, past, ok] of [['calcium', 20.1, 9.5], ['phosphate', 20.1, 4], ['bicarbonate', 60.1, 24], ['albumin', 7.1, 4]]) {
    refused(kfre({ ...base, [k]: past }));
    refused(kfre({ ...base, mode: '8', calcium: 9.5, phosphate: 4, bicarbonate: 24, albumin: 4, [k]: past }));
    answered(kfre({ ...base, [k]: ok }));
  }
});

test('ckd-epi-cystatin: height (cm) and weight (kg)', () => {
  const base = { cystatinC: 1.2, creatinine: 1.1, age: 60, sex: 'male' };
  refused(ckdEpiCystatin({ ...base, heightCm: 251, weightKg: 70 }));
  refused(ckdEpiCystatin({ ...base, heightCm: 170, weightKg: 501 }));
  answered(ckdEpiCystatin({ ...base, heightCm: 170, weightKg: 70 }));
});

test('4peps: heart rate and SpO2', () => {
  refused(fourPeps({ age: 50, heartRate: 301 }));
  refused(fourPeps({ age: 50, spo2: 101 }));
  answered(fourPeps({ age: 50, heartRate: 90, spo2: 96 }));
});

test('fick-cardiac-output: age and heart rate are checked even with a measured VO2', () => {
  const base = { method: 'measured', vo2: 250, hb: 14, sao2: 98, svo2: 70, bsa: 1.9 };
  refused(fickCardiacOutput({ ...base, age: 131 }));
  refused(fickCardiacOutput({ ...base, hr: 301 }));
  answered(fickCardiacOutput({ ...base, age: 50, hr: 80 }));
});

test('hys-law: AST', () => {
  const base = { alt: 250, altUln: 40, astUln: 40, bilirubin: 3, bilirubinUln: 1.2, alp: 100, alpUln: 120 };
  refused(hysLaw({ ...base, ast: 30001 }));
  answered(hysLaw({ ...base, ast: 300 }));
});

test('kawasaki-criteria: ESR on the classic pathway', () => {
  const base = { feverDays: 6, principal: ['conjunctivitis', 'oral', 'rash', 'extremity'] };
  refused(kawasakiCriteria({ ...base, esr: 201 }));
  answered(kawasakiCriteria({ ...base, esr: 50 }));
});

test('kings-college: lactate', () => {
  const base = { ph: 7.2, lactateTiming: 'early' };
  refused(kingsCollege({ ...base, lactate: 40.1 }));
  answered(kingsCollege({ ...base, lactate: 4 }));
});

test('tls-cairo-bishop: the three baselines', () => {
  const base = { potassium: 5, phosphate: 4, calcium: 9, uricAcid: 7 };
  refused(tlsCairoBishop({ ...base, potassiumBaseline: 15.1 }));
  refused(tlsCairoBishop({ ...base, phosphateBaseline: 20.1 }));
  refused(tlsCairoBishop({ ...base, calciumBaseline: 20.1 }));
  answered(tlsCairoBishop({ ...base, potassiumBaseline: 4, phosphateBaseline: 3.5, calciumBaseline: 9.5 }));
});

test('ireton-jones: height is checked even on the ventilated form', () => {
  const base = { mode: 'ventilated', age: 50, weight: 70, sex: 'male' };
  refused(iretonJones({ ...base, height: 251 }));
  answered(iretonJones({ ...base, height: 170 }));
});

test('peds-bmi-percentile: weight and height are checked even when a BMI is entered', () => {
  const base = { sex: 'male', ageYears: 10, bmi: 18 };
  refused(pedsBmiPercentile({ ...base, weightKg: 501, heightCm: 140 }));
  refused(pedsBmiPercentile({ ...base, weightKg: 35, heightCm: 251 }));
  answered(pedsBmiPercentile({ ...base, weightKg: 35, heightCm: 140 }));
});

test('sbp-ascitic-fluid: bilirubin', () => {
  refused(sbpAsciticFluid({ pmnCount: 300, bilirubin: 60.1 }));
  answered(sbpAsciticFluid({ pmnCount: 300, bilirubin: 5 }));
});

test('shanghai-brugada: age is checked whether or not the age-gated item is chosen', () => {
  const base = { ecg: 'none', clinical: 'none', family: 'none', geneticMutation: 'no' };
  refused(shanghaiBrugada({ ...base, age: 131 }));
  answered(shanghaiBrugada({ ...base, age: 40 }));
});

test('digoxin: age', () => {
  assert.throws(() => digoxin({ crCl: 60, ageYears: 131, indication: 'hf' }), { name: 'RangeError', message: /plausible range/ });
  assert.ok(digoxin({ crCl: 60, ageYears: 70, indication: 'hf' }).doseGuidance);
});
