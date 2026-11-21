// spec-v1758: fields left blank in the worked example were never driven past their lib/bounds.js envelope.
// Each now refuses a value just past the ceiling, and an in-range value still answers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { interpretLab } from '../../lib/lab-interpret.js';
import { abgInterpret } from '../../lib/clinical.js';
import { cerebralPerfusionPressure } from '../../lib/clinical-v8.js';
import clinicalAdapters from '../../mcp/adapters/clinical.js';

const LAB = [
  // [analyte, just past the ceiling, in range]
  ['sodium', 200.1, 140],
  ['potassium', 15.1, 4], // spec-v1762: the ceiling rose to 15 (survival from 14.0 mmol/L is reported)
  ['chloride', 160.1, 100],
  ['bicarbonate', 60.1, 24],
  ['bun', 300.1, 15],
  ['creatinine', 25.1, 1],
  ['glucose', 2000.1, 90],
  ['calcium', 20.1, 9.5],
  ['albumin', 7.1, 4],
  ['ast', 30001, 25],
  ['alt', 30001, 25],
  ['bilirubin', 60.1, 0.8],
  ['wbc', 200.1, 7],
  ['hemoglobin', 25.1, 14],
  ['hematocrit', 75.1, 42],
  ['platelets', 2000.1, 250],
  ['triglycerides', 30001, 120],
];

for (const [id, over, ok] of LAB) {
  test(`lab-interpret ${id}: past the envelope ceiling is refused, an in-range value answers`, () => {
    assert.throws(() => interpretLab(id, over), RangeError);
    assert.equal(typeof interpretLab(id, ok).flag, 'string');
  });
}

test('abg: an entered PaO2 past the envelope is refused even without an FiO2', () => {
  assert.throws(() => abgInterpret({ pH: 7.4, paco2: 40, hco3: 24, pao2: 700.1 }), RangeError);
  assert.throws(() => abgInterpret({ pH: 7.4, paco2: 40, hco3: 24, pao2: 700.1, fio2: 0.21 }), RangeError);
  assert.ok(abgInterpret({ pH: 7.4, paco2: 40, hco3: 24, pao2: 90 }).primary);
  assert.ok(abgInterpret({ pH: 7.4, paco2: 40, hco3: 24, pao2: null }).primary);
});

test('cerebral-perfusion-pressure: a diastolic past the envelope is refused; blank (0) still allowed', () => {
  assert.throws(() => cerebralPerfusionPressure({ map: 90, dbp: 200.1, icp: 20 }), RangeError);
  assert.equal(cerebralPerfusionPressure({ map: 90, dbp: 60, icp: 20 }).cpp, 70);
  assert.equal(cerebralPerfusionPressure({ map: 90, icp: 20 }).cpp, 70);
});

const egfr = clinicalAdapters.find((t) => t.id === 'egfr');

test('egfr: an entered height or weight past the envelope is refused on its own', () => {
  const base = { scr: 1, age: 50, sex: 'F' };
  assert.throws(() => egfr.compute({ ...base, heightCm: 250.1 }), RangeError);
  assert.throws(() => egfr.compute({ ...base, weightKg: 500.1 }), RangeError);
  assert.equal(typeof egfr.compute({ ...base, heightCm: 165 }).egfr, 'number');
  assert.equal(typeof egfr.compute({ ...base, weightKg: 70 }).egfr, 'number');
  assert.equal(typeof egfr.compute({ ...base, heightCm: 165, weightKg: 70 }).egfrMlMin, 'number');
  assert.equal(typeof egfr.compute(base).egfr, 'number');
});
