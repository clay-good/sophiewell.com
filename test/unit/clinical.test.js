// Unit tests for lib/clinical.js. Worked examples per docs/clinical-citations.md.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../../lib/clinical.js';

const close = (a, b, eps = 0.05) => Math.abs(a - b) <= eps;

// --- Conversions ---------------------------------------------------------
test('convert: kg <-> lb is symmetric', () => {
  const lb = C.convert(70, 'kg', 'lb', 'weight');
  const kg = C.convert(lb, 'lb', 'kg', 'weight');
  assert.ok(Math.abs(kg - 70) < 1e-9);
});
test('convert: mg <-> g exact', () => {
  assert.equal(C.convert(2500, 'mg', 'g', 'weight'), 2.5);
});
test('convertTemp: 32F = 0C', () => {
  assert.equal(C.convertTemp(32, 'F', 'C'), 0);
});
test('convertTemp: 100C = 212F', () => {
  assert.equal(C.convertTemp(100, 'C', 'F'), 212);
});
test('convertTemp: 0C = 273.15K', () => {
  assert.ok(close(C.convertTemp(0, 'C', 'K'), 273.15));
});

// --- BMI -----------------------------------------------------------------
test('bmi: 70 kg / 1.75 m = ~22.9 Normal', () => {
  const r = C.bmi({ weightKg: 70, heightM: 1.75 });
  assert.equal(r.bmi, 22.9);
  assert.equal(r.category, 'Normal');
});
test('bmi: rejects zero height', () => {
  assert.throws(() => C.bmi({ weightKg: 70, heightM: 0 }));
});

// --- BSA -----------------------------------------------------------------
test('bsaDuBois: 70kg/175cm ~ 1.85', () => {
  assert.ok(close(C.bsaDuBois({ weightKg: 70, heightCm: 175 }), 1.85, 0.02));
});
test('bsaMosteller: 70kg/175cm ~ 1.84', () => {
  assert.ok(close(C.bsaMosteller({ weightKg: 70, heightCm: 175 }), 1.84, 0.02));
});

// --- MAP -----------------------------------------------------------------
test('map: 120/80 = 93.3', () => {
  assert.equal(C.map({ sbp: 120, dbp: 80 }), 93.3);
});

// --- Anion gap -----------------------------------------------------------
test('anionGap: Na 140, Cl 100, HCO3 24 = 16', () => {
  const r = C.anionGap({ sodium: 140, chloride: 100, bicarbonate: 24 });
  assert.equal(r.anionGap, 16);
});
test('anionGap: corrected for albumin 2.0 = 21', () => {
  const r = C.anionGap({ sodium: 140, chloride: 100, bicarbonate: 24, albuminGdl: 2.0 });
  assert.equal(r.correctedAnionGap, 21);
});

// --- Corrected calcium ---------------------------------------------------
test('correctedCalcium: 8.0, alb 2.0 = 9.6', () => {
  assert.equal(C.correctedCalcium({ measuredCa: 8.0, albuminGdl: 2.0 }), 9.6);
});

// --- Corrected sodium ----------------------------------------------------
test('correctedSodium: Na 130, glucose 600 - factor 1.6 = 138', () => {
  const r = C.correctedSodium({ measuredNa: 130, glucose: 600 });
  assert.equal(r.naBy1_6, 138);
  assert.equal(r.naBy2_4, 142);
});

// --- A-a gradient --------------------------------------------------------
test('aaGradient: FiO2 0.21, PaCO2 40, PaO2 90 = ~9.7', () => {
  const r = C.aaGradient({ fio2: 0.21, paco2: 40, pao2: 90 });
  assert.ok(close(r.aaGradient, 9.73, 0.05));
});

// --- eGFR CKD-EPI 2021 ---------------------------------------------------
test('egfrCkdEpi2021: 60yo female SCr 1.0 ~ 60 mL/min', () => {
  const v = C.egfrCkdEpi2021({ scr: 1.0, age: 60, sex: 'F' });
  assert.ok(v >= 55 && v <= 65, `expected ~60, got ${v}`);
});
test('egfrCkdEpi2021: rejects unknown sex', () => {
  assert.throws(() => C.egfrCkdEpi2021({ scr: 1, age: 50, sex: 'X' }));
});

// --- Cockcroft-Gault -----------------------------------------------------
test('cockcroftGault: 60yo male 80kg SCr 1.0 ~ 88.9', () => {
  assert.ok(close(C.cockcroftGault({ age: 60, weightKg: 80, scr: 1.0, sex: 'M' }), 88.89));
});
test('cockcroftGault: female multiplier 0.85', () => {
  const m = C.cockcroftGault({ age: 60, weightKg: 80, scr: 1.0, sex: 'M' });
  const f = C.cockcroftGault({ age: 60, weightKg: 80, scr: 1.0, sex: 'F' });
  assert.ok(Math.abs(f - m * 0.85) < 0.05);
});

// --- Pack-years ----------------------------------------------------------
test('packYears: 1.5 ppd x 20y = 30', () => {
  assert.equal(C.packYears({ packsPerDay: 1.5, years: 20 }), 30);
});

// --- Naegele -------------------------------------------------------------
test('naegele: LMP 2025-01-01 -> due 2025-10-08', () => {
  const r = C.naegele({ lmpIso: '2025-01-01', todayIso: '2025-01-01' });
  assert.equal(r.dueDate, '2025-10-08');
  assert.equal(r.gestationalWeeks, 0);
});

// --- QTc -----------------------------------------------------------------
test('qtc: QT 400ms HR 60bpm -> all formulas ~ 400', () => {
  const r = C.qtc({ qtMs: 400, hrBpm: 60 });
  assert.equal(r.bazett, 400);
  assert.equal(r.fridericia, 400);
  assert.equal(r.framingham, 400);
  assert.equal(r.hodges, 400);
});

// --- P/F ratio -----------------------------------------------------------
test('pfRatio: PaO2 90 FiO2 0.5 = 180 (Moderate ARDS)', () => {
  const r = C.pfRatio({ pao2: 90, fio2: 0.5 });
  assert.equal(r.ratio, 180);
  assert.equal(r.category, 'Moderate ARDS (Berlin)');
});

// --- Drip rate -----------------------------------------------------------
test('dripRate: 1000mL over 480min, df 15 -> 125 mL/hr 31 gtts/min', () => {
  const r = C.dripRate({ volumeMl: 1000, durationMin: 480, dropFactor: 15 });
  assert.equal(r.mlPerHr, 125);
  assert.equal(r.gttsPerMin, 31);
});

// --- Weight-based dose ---------------------------------------------------
test('weightDose: 70 kg @ 5 mg/kg = 350', () => {
  assert.equal(C.weightDose({ weightKg: 70, dosePerKg: 5 }), 350);
});

// --- Concentration to rate -----------------------------------------------
test('concentrationToRate: norepi 0.1 mcg/kg/min, 70kg, 64 mcg/mL -> 6.56 mL/hr', () => {
  // dose: 0.1 * 70 = 7 mcg/min = 0.007 mg/min; conc 64 mcg/mL = 0.064 mg/mL
  // mL/min = 0.007 / 0.064 = 0.109375; mL/hr = 6.5625
  const r = C.concentrationToRate({
    doseValue: 0.1, doseUnit: 'mcg/kg/min', weightKg: 70,
    concentrationValue: 0.064, concentrationUnit: 'mg/mL',
  });
  assert.ok(close(r.mlPerHr, 6.56));
});
test('concentrationToRate: heparin 1000 units/hr, 100 units/mL = 10 mL/hr', () => {
  const r = C.concentrationToRate({
    doseValue: 1000, doseUnit: 'units/hr',
    concentrationValue: 100, concentrationUnit: 'units/mL',
  });
  assert.equal(r.mlPerHr, 10);
});

// --- Scoring -------------------------------------------------------------
test('gcs: 4+5+6 = 15 mild', () => {
  const r = C.gcs({ eye: 4, verbal: 5, motor: 6 });
  assert.equal(r.total, 15);
  assert.equal(r.severity, 'Mild');
});
test('gcs: 1+1+4 = 6 severe', () => {
  const r = C.gcs({ eye: 1, verbal: 1, motor: 4 });
  assert.equal(r.total, 6);
  assert.equal(r.severity, 'Severe');
});
test('apgar: all 2s = 10 normal', () => {
  const r = C.apgar({ appearance: 2, pulse: 2, grimace: 2, activity: 2, respiration: 2 });
  assert.equal(r.total, 10);
  assert.equal(r.category, 'Normal');
});
test('wellsPe: spec example', () => {
  const r = C.wellsPe({ clinicalDvtSigns: true, peLikely: true, hrOver100: true });
  assert.equal(r.total, 7.5);
  assert.equal(r.category, 'High probability');
});
test('wellsDvt: spec example = 4 high', () => {
  const r = C.wellsDvt({ activeCancer: true, calfSwellingGt3cm: true, pittingEdema: true, entireLegSwollen: true });
  assert.equal(r.total, 4);
  assert.equal(r.category, 'High probability');
});
test('chadsVasc: 75yo female + HTN + DM = 5', () => {
  const r = C.chadsVasc({ ageGte75: true, female: true, hypertension: true, diabetes: true });
  assert.equal(r.total, 5);
});
test('hasBled: 4 items = 4 high risk', () => {
  const r = C.hasBled({ hypertension: true, abnormalRenal: true, ageGt65: true, drugs: true });
  assert.equal(r.total, 4);
  assert.equal(r.risk, 'High');
});
test('nihss: all zeros = 0 no symptoms', () => {
  const r = C.nihss({});
  assert.equal(r.total, 0);
  assert.equal(r.severity, 'No stroke symptoms');
});
test('nihss: rejects out-of-range item', () => {
  assert.throws(() => C.nihss({ '5': 99 }));
});

// --- ABG -----------------------------------------------------------------
test('abgInterpret: pH 7.30 PaCO2 30 HCO3 14 -> metabolic acidosis', () => {
  const r = C.abgInterpret({ pH: 7.30, paco2: 30, hco3: 14 });
  assert.match(r.primary, /Metabolic acidosis/);
  assert.match(r.compensation, /Winter/);
});
test('abgInterpret: pH 7.50 PaCO2 28 HCO3 24 -> respiratory alkalosis', () => {
  const r = C.abgInterpret({ pH: 7.50, paco2: 28, hco3: 24 });
  assert.match(r.primary, /Respiratory alkalosis/);
});
test('abgInterpret: with PaO2/FiO2 reports A-a and PF', () => {
  const r = C.abgInterpret({ pH: 7.40, paco2: 40, hco3: 24, pao2: 90, fio2: 0.21 });
  assert.ok(Number.isFinite(r.aaGradient));
  assert.ok(Number.isFinite(r.pfRatio));
});
