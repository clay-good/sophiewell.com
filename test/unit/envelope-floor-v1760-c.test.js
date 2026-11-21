// spec-v1760: a value below the floor lib/bounds.js declares used to answer. Each case drives half the floor (or a
// value just under it) and checks the tool refuses, then checks an in-range value still answers.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { bmi, bsaDuBois, bsaMosteller, qtc, weightDose } from '../../lib/clinical.js';
import { crusade, scaiShock, timiRiskIndex } from '../../lib/acs-v193.js';
import { kineticEgfr } from '../../lib/kinetic-egfr-v1631.js';
import { cerebralPerfusionPressure, minuteVentilation } from '../../lib/clinical-v8.js';
import { batt, ets } from '../../lib/mixed-v227.js';
import { ivPhosphateOrderCheck } from '../../lib/iv-phosphate-order-check-v1630.js';
import { ali } from '../../lib/inflam-v268.js';
import { compartmentDeltaPressure } from '../../lib/ortho-v145.js';
import { fibroq } from '../../lib/hepatology-prognosis-v220.js';
import { methemoglobin } from '../../lib/methemoglobin-v864.js';
import { qcsi } from '../../lib/qcsi-v698.js';
import { sawchukZaskeDosing as sawchukZaske } from '../../lib/sawchuk-zaske-dosing-v1631.js';

const PLAUSIBLE = /plausible range/;
const refused = (r) => { assert.equal(r.valid, false); assert.match(r.message, PLAUSIBLE); };
const answered = (r) => assert.equal(r.valid, true);

test('bmi: a 150 g weight is refused; 70 kg answers', () => {
  assert.throws(() => bmi({ weightKg: 0.15, heightM: 1.7 }), PLAUSIBLE);
  assert.equal(typeof bmi({ weightKg: 70, heightM: 1.7 }).bmi, 'number');
});

test('bsa: a 150 g weight or a 22.5 cm height is refused by both formulas', () => {
  for (const f of [bsaDuBois, bsaMosteller]) {
    assert.throws(() => f({ weightKg: 0.15, heightCm: 170 }), PLAUSIBLE);
    assert.throws(() => f({ weightKg: 70, heightCm: 22.5 }), PLAUSIBLE);
    assert.ok(f({ weightKg: 70, heightCm: 170 }) > 1.5);
    assert.ok(f({ weightKg: 3.5, heightCm: 50 }) > 0);
  }
});

test('qtc: a 100 ms QT or a heart rate of 5 is refused; 400 ms at 60 answers', () => {
  assert.throws(() => qtc({ qtMs: 100, hrBpm: 60 }), PLAUSIBLE);
  assert.throws(() => qtc({ qtMs: 400, hrBpm: 5 }), PLAUSIBLE);
  assert.equal(qtc({ qtMs: 400, hrBpm: 60 }).bazett, 400);
});

test('weight-dose: a 150 g weight is refused; 70 kg answers', () => {
  assert.throws(() => weightDose({ weightKg: 0.15, dosePerKg: 1 }), PLAUSIBLE);
  assert.equal(weightDose({ weightKg: 70, dosePerKg: 1 }), 70);
});

test('crusade: a heart rate of 5 or a systolic of 10 is refused', () => {
  const base = { hct: 40, crcl: 80, hr: 80, sbp: 120, sex: 'male' };
  refused(crusade({ ...base, hr: 5 }));
  refused(crusade({ ...base, sbp: 10 }));
  answered(crusade(base));
  answered(crusade({ ...base, sbp: 310 }));
});

test('scai-shock: a systolic of 10 is refused', () => {
  const base = { sbp: 85, lactate: 3, support: 'none' };
  refused(scaiShock({ ...base, sbp: 10 }));
  answered(scaiShock(base));
});

test('timi-risk-index: a heart rate of 5 or a systolic of 10 is refused', () => {
  const base = { hr: 80, age: 60, sbp: 120 };
  refused(timiRiskIndex({ ...base, hr: 5 }));
  refused(timiRiskIndex({ ...base, sbp: 10 }));
  answered(timiRiskIndex(base));
});

test('kinetic-egfr: a creatinine of 0.05 or a 150 g weight is refused', () => {
  const base = { baselineCreatinine: 1, baselineClearance: 90, creatinine1: 1.5, creatinine2: 2, hours: 24, weight: 70 };
  refused(kineticEgfr({ ...base, baselineCreatinine: 0.05 }));
  refused(kineticEgfr({ ...base, creatinine1: 0.05 }));
  refused(kineticEgfr({ ...base, creatinine2: 0.05 }));
  refused(kineticEgfr({ ...base, weight: 0.15 }));
  answered(kineticEgfr(base));
});

test('cerebral-perfusion-pressure: a systolic of 10 is refused; a blank (0) systolic still answers', () => {
  assert.throws(() => cerebralPerfusionPressure({ map: 80, sbp: 10, icp: 15 }), PLAUSIBLE);
  assert.equal(cerebralPerfusionPressure({ map: 80, icp: 15 }).cpp, 65);
  assert.equal(cerebralPerfusionPressure({ sbp: 120, dbp: 60, icp: 10 }).cpp, 70);
});

test('minute-ventilation: a rate of 1.5 or an ideal weight of 150 g is refused; a blank (0) ideal weight answers', () => {
  assert.throws(() => minuteVentilation({ respiratoryRate: 1.5, tidalVolumeMl: 450 }), PLAUSIBLE);
  assert.throws(() => minuteVentilation({ respiratoryRate: 16, tidalVolumeMl: 450, ibwKg: 0.15 }), PLAUSIBLE);
  assert.equal(minuteVentilation({ respiratoryRate: 16, tidalVolumeMl: 450 }).minuteVentilationLMin, 7.2);
  assert.ok(minuteVentilation({ respiratoryRate: 16, tidalVolumeMl: 450, ibwKg: 70 }).alveolarVentilationLMin > 0);
});

test('batt and ets: a systolic of 10 is refused', () => {
  refused(batt({ age: 40, sbp: 10, gcs: 15 }));
  answered(batt({ age: 40, sbp: 120, gcs: 15 }));
  refused(ets({ sbp: 10, age: 40 }));
  answered(ets({ sbp: 120, age: 40 }));
  // 0 is a pulseless trauma patient, not an impossible value.
  answered(batt({ age: 40, sbp: 0, gcs: 15 }));
  answered(ets({ sbp: 0, age: 40 }));
});

test('iv-phosphate-order-check: a serum phosphorus of 0.1 or a potassium of 0.5 is refused', () => {
  const base = { salt: 'potassium', ageBand: '12-plus', weight: 70, weightUnit: 'kg', dose: 15, doseUnit: 'mmol', finalVolume: 250, hours: 4, line: 'central' };
  answered(ivPhosphateOrderCheck(base));
  refused(ivPhosphateOrderCheck({ ...base, serumPhosphorus: 0.1 }));
  refused(ivPhosphateOrderCheck({ ...base, serumPotassium: 0.5 }));
  answered(ivPhosphateOrderCheck({ ...base, serumPhosphorus: 1.5, serumPotassium: 3.5 }));
});

test('ali-index: a BMI of 2.5 is refused', () => {
  const base = { bmi: 22, albumin: 3.5, anc: 4, alc: 1.5 };
  refused(ali({ ...base, bmi: 2.5 }));
  answered(ali(base));
});

test('compartment-delta-pressure: a diastolic of 2.5 is refused; a compartment pressure of 2 still answers', () => {
  refused(compartmentDeltaPressure({ diastolic: 2.5, compartment: 45 }));
  answered(compartmentDeltaPressure({ diastolic: 70, compartment: 45 }));
  answered(compartmentDeltaPressure({ diastolic: 70, compartment: 2 }));
});

test('fibroq: an INR of 0.25 is refused', () => {
  const base = { age: 50, ast: 60, inr: 1.1, alt: 50, platelets: 200 };
  refused(fibroq({ ...base, inr: 0.25 }));
  answered(fibroq(base));
});

test('methemoglobin: a PaO2 of 5 is refused; a blank PaO2 still answers', () => {
  refused(methemoglobin({ level: 20, pao2: 5 }));
  answered(methemoglobin({ level: 20 }));
  answered(methemoglobin({ level: 20, pao2: 95 }));
});

test('qcsi: a respiratory rate of 1.5 is refused', () => {
  refused(qcsi({ respiratoryRate: 1.5, spo2: 95, o2Flow: 0 }));
  answered(qcsi({ respiratoryRate: 18, spo2: 95, o2Flow: 0 }));
});

test('sawchuk-zaske-dosing: a 150 g weight is refused; a blank weight still answers', () => {
  const base = { doseState: 'first', dose: 1000, infusionHours: 1, interval: 12, level1: 30, time1: 1, level2: 10, time2: 8 };
  answered(sawchukZaske(base));
  refused(sawchukZaske({ ...base, weight: 0.15 }));
  answered(sawchukZaske({ ...base, weight: 70 }));
});

test('ventilatory-ratio: a height below the floor is refused with the height range', async () => {
  const { ventilatoryRatio } = await import('../../lib/vent-v195.js');
  const r = ventilatoryRatio({ ve: 9000, paco2: 40, height: 22.5, sex: 'male' });
  assert.equal(r.valid, false);
  assert.match(r.message, /plausible range for height/);
  assert.equal(ventilatoryRatio({ ve: 9000, paco2: 40, height: 175, sex: 'male' }).valid, true);
});
