import test from 'node:test';
import assert from 'node:assert/strict';
import { masldCriteria as masld, BMI_GENERAL, BMI_ASIAN, HDL_MALE, HDL_FEMALE } from '../../lib/masld-criteria-v837.js';

test('masld: steatosis plus any one cardiometabolic criterion is MASLD', () => {
  assert.equal(masld({ hepaticSteatosis: true, bmi: 31 }).category, 'MASLD');
  assert.equal(masld({ hepaticSteatosis: true, fastingGlucose: 110 }).category, 'MASLD');
  assert.equal(masld({ hepaticSteatosis: true, hba1c: 6.1 }).category, 'MASLD');
  assert.equal(masld({ hepaticSteatosis: true, systolic: 140 }).category, 'MASLD');
  assert.equal(masld({ hepaticSteatosis: true, triglycerides: 200 }).category, 'MASLD');
  assert.equal(masld({ hepaticSteatosis: true, hdl: 35, sex: 'male' }).category, 'MASLD');
});

test('masld: steatosis is the entry finding', () => {
  assert.equal(masld({ bmi: 31 }).category, null);
  assert.equal(masld({ hepaticSteatosis: true }).category, 'Cryptogenic SLD');
  assert.equal(masld({ hepaticSteatosis: true, otherCause: true }).category, 'SLD of specific etiology');
});

test('masld: alcohol moves the CATEGORY rather than removing the diagnosis', () => {
  // The change that matters. Under the old nomenclature this patient was excluded entirely.
  const base = { hepaticSteatosis: true, bmi: 31, sex: 'female' };
  assert.equal(masld({ ...base, alcoholGramsPerWeek: 100 }).category, 'MASLD');
  const metald = masld({ ...base, alcoholGramsPerWeek: 200 });
  assert.equal(metald.category, 'MetALD');
  assert.ok(metald.nomenclatureNote.includes('excluded from a fatty liver diagnosis'));
  assert.equal(masld({ ...base, alcoholGramsPerWeek: 500 }).category, 'ALD, alcohol-related liver disease');
});

test('masld: the MetALD band is sex-specific and per WEEK', () => {
  const base = { hepaticSteatosis: true, bmi: 31 };
  // 200 g/week is MetALD in a female (band 140-350) and still MASLD in a male (band 210-420).
  assert.equal(masld({ ...base, sex: 'female', alcoholGramsPerWeek: 200 }).category, 'MetALD');
  assert.equal(masld({ ...base, sex: 'male', alcoholGramsPerWeek: 200 }).category, 'MASLD');
  assert.deepEqual(masld({ ...base, sex: 'male' }).metaldBand, [210, 420]);
  assert.deepEqual(masld({ ...base, sex: 'female' }).metaldBand, [140, 350]);
  assert.ok(masld({ ...base, alcoholGramsPerWeek: 100 }).alcoholUnitNote.includes('per WEEK'));
});

test('masld: the BMI cut is ancestry-specific', () => {
  assert.equal(BMI_GENERAL, 25);
  assert.equal(BMI_ASIAN, 23);
  // A BMI of 24 meets it under the Asian cut and not the general one.
  assert.equal(masld({ hepaticSteatosis: true, bmi: 24, ancestry: 'south-asian-chinese' }).category, 'MASLD');
  assert.equal(masld({ hepaticSteatosis: true, bmi: 24 }).category, 'Cryptogenic SLD');
  assert.ok(masld({ hepaticSteatosis: true, bmi: 24, ancestry: 'japanese' }).thresholdNote.includes('ancestry-specific'));
});

test('masld: the HDL cut is sex-specific', () => {
  assert.equal(HDL_MALE, 40);
  assert.equal(HDL_FEMALE, 50);
  // An HDL of 45 meets it in a female and not in a male.
  assert.equal(masld({ hepaticSteatosis: true, hdl: 45, sex: 'female' }).category, 'MASLD');
  assert.equal(masld({ hepaticSteatosis: true, hdl: 45, sex: 'male' }).category, 'Cryptogenic SLD');
  assert.ok(masld({ hepaticSteatosis: true, hdl: 45, sex: 'female' }).thresholdNote.includes('sex-specific'));
});

test('masld: waist thresholds vary by ancestry AND sex', () => {
  // Japanese thresholds invert the usual sex ordering: 85 male, 90 female.
  assert.equal(masld({ hepaticSteatosis: true, waistCm: 87, ancestry: 'japanese', sex: 'male' }).category, 'MASLD');
  assert.equal(masld({ hepaticSteatosis: true, waistCm: 87, ancestry: 'japanese', sex: 'female' }).category, 'Cryptogenic SLD');
  assert.equal(masld({ hepaticSteatosis: true, sex: 'male', ancestry: 'european' }).waistCut, 94);
});

test('masld: treatment clauses satisfy their criteria without a measurement', () => {
  assert.equal(masld({ hepaticSteatosis: true, type2Diabetes: true }).category, 'MASLD');
  assert.equal(masld({ hepaticSteatosis: true, antihypertensive: true }).category, 'MASLD');
  assert.equal(masld({ hepaticSteatosis: true, lipidLowering: true }).criteriaMet.length, 2);
});

test('masld: empty, invalid and out-of-range input', () => {
  const empty = masld({});
  assert.equal(empty.valid, true);
  assert.equal(empty.category, null);
  assert.equal(masld({ sex: 'other' }).valid, false);
  assert.equal(masld({ ancestry: 'martian' }).valid, false);
  assert.equal(masld({ bmi: 1e308 }).valid, false);
  assert.equal(masld({ alcoholGramsPerWeek: -1 }).valid, false);
  assert.equal(masld().valid, true);
  assert.doesNotMatch(JSON.stringify(masld({ hepaticSteatosis: true, bmi: 31 })), /NaN|Infinity/);
});
