// spec-v4 §7 step v4.15: >=6 known conversions per category.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  labConvert, a1cPctToIfcc, a1cIfccToPct,
  mmHgToKpa, kpaToMmHg, fToC, cToF,
  inchesToCm, cmToInches, lbToKg, kgToLb, lbOzToKg, kgToLbOz,
} from '../../lib/unit-convert.js';

const close = (a, b, eps = 0.05) => assert.ok(Math.abs(a - b) <= eps, `expected ~${b}, got ${a}`);

// Lab
test('glucose 90 mg/dL -> 5.0 mmol/L', () => close(labConvert('glucose', 90), 5.0, 0.05));
test('glucose 5.0 mmol/L -> 90 mg/dL', () => close(labConvert('glucose', 5.0, 'fromSi'), 90, 0.5));
test('cholesterol 200 mg/dL -> 5.17 mmol/L', () => close(labConvert('cholesterol', 200), 5.17, 0.02));
test('creatinine 1.0 mg/dL -> 88.4 umol/L', () => close(labConvert('creatinine', 1.0), 88.4, 0.1));
test('BUN 14 mg/dL -> 5.0 mmol/L urea', () => close(labConvert('bun', 14), 5.0, 0.05));
test('calcium 10 mg/dL -> 2.5 mmol/L', () => close(labConvert('calcium', 10), 2.5, 0.01));
test('bilirubin 10 mg/dL -> 171 umol/L', () => close(labConvert('bilirubin', 10), 171, 0.1));
test('bilirubin 171 umol/L -> 10 mg/dL', () => close(labConvert('bilirubin', 171, 'fromSi'), 10, 0.01));
test('lactate 18 mg/dL -> 2.0 mmol/L', () => close(labConvert('lactate', 18), 2.0, 0.01));
test('lactate 2.0 mmol/L -> 18.0 mg/dL', () => close(labConvert('lactate', 2.0, 'fromSi'), 18.0, 0.05));
test('uric acid 6 mg/dL -> 357 umol/L', () => close(labConvert('uricAcid', 6), 357, 1));
test('albumin 4 g/dL -> 40 g/L', () => close(labConvert('albumin', 4), 40, 0.01));
test('albumin 40 g/L -> 4 g/dL', () => close(labConvert('albumin', 40, 'fromSi'), 4, 0.01));
test('magnesium 2.0 mg/dL -> 0.82 mmol/L', () => close(labConvert('magnesium', 2.0), 0.823, 0.01));
test('magnesium 0.5 mmol/L -> 1.215 mg/dL', () => close(labConvert('magnesium', 0.5, 'fromSi'), 1.215, 0.01));
test('labConvert: unknown kind throws', () => assert.throws(() => labConvert('foo', 1)));

// spec-v62 §2 A4: the reusable analyte unit arrays' SI option must convert an
// SI-entered value back to the canonical conventional unit the compute expects.
test('A4 unit arrays: SI option converts back to canonical conventional unit', async () => {
  const { GLUCOSE_UNITS, BUN_UNITS, CALCIUM_UNITS, ALBUMIN_UNITS, MAGNESIUM_UNITS, BILIRUBIN_UNITS } = await import('../../lib/field-units.js');
  const siOpt = (arr) => arr[1].toCanonical;
  close(siOpt(GLUCOSE_UNITS)(5.0), 90, 0.5);   // 5.0 mmol/L glucose -> ~90 mg/dL
  close(siOpt(BUN_UNITS)(5.0), 14, 0.1);        // 5.0 mmol/L urea -> ~14 mg/dL BUN
  close(siOpt(CALCIUM_UNITS)(2.5), 10, 0.05);   // 2.5 mmol/L -> 10 mg/dL
  close(siOpt(ALBUMIN_UNITS)(40), 4, 0.01);     // 40 g/L -> 4 g/dL
  close(siOpt(MAGNESIUM_UNITS)(0.5), 1.215, 0.01); // 0.5 mmol/L -> 1.215 mg/dL
  close(siOpt(BILIRUBIN_UNITS)(171), 10, 0.05); // 171 umol/L -> 10 mg/dL
  // the default (canonical) option is always identity, so examples stay byte-identical
  assert.equal(GLUCOSE_UNITS[0].toCanonical(90), 90);
  assert.equal(ALBUMIN_UNITS[0].toCanonical(4), 4);
  assert.equal(BILIRUBIN_UNITS[0].toCanonical(14), 14);
});

// spec-v62 A4 (final wave): lactate and the CRRT calcium fields take the SI
// unit (mmol/L) as canonical, so the DEFAULT option is identity in mmol/L and
// the ALTERNATE (mg/dL) converts UP to mmol/L -- the inverse layout from the
// conventional-canonical analytes above.
test('A4 SI-canonical arrays: default is mmol/L identity, alternate converts mg/dL up', async () => {
  const { LACTATE_UNITS, CALCIUM_MMOL_UNITS } = await import('../../lib/field-units.js');
  assert.equal(LACTATE_UNITS[0].unit, 'mmol/L');
  assert.equal(LACTATE_UNITS[0].toCanonical(6), 6);          // mmol/L identity
  close(LACTATE_UNITS[1].toCanonical(18), 2.0, 0.01);        // 18 mg/dL -> 2.0 mmol/L
  assert.equal(CALCIUM_MMOL_UNITS[0].unit, 'mmol/L');
  assert.equal(CALCIUM_MMOL_UNITS[0].toCanonical(1.15), 1.15); // mmol/L identity
  close(CALCIUM_MMOL_UNITS[1].toCanonical(4), 1.0, 0.01);      // 4 mg/dL -> 1.0 mmol/L
});

// HbA1c
test('A1C 7.0 % -> 53 mmol/mol IFCC', () => close(a1cPctToIfcc(7.0), 53, 0.5));
test('A1C 53 mmol/mol IFCC -> 7.0 %', () => close(a1cIfccToPct(53), 7.0, 0.05));

// Vitals
test('120 mmHg -> 16 kPa', () => close(mmHgToKpa(120), 16.0, 0.1));
test('16 kPa -> 120 mmHg', () => close(kpaToMmHg(16), 120, 0.5));
test('98.6 F -> 37.0 C', () => close(fToC(98.6), 37.0, 0.05));
test('37 C -> 98.6 F', () => close(cToF(37), 98.6, 0.05));
test('100 C -> 212 F', () => close(cToF(100), 212, 0.05));
test('32 F -> 0 C', () => close(fToC(32), 0, 0.05));

// Basics
test('70 inches -> 177.8 cm', () => close(inchesToCm(70), 177.8, 0.05));
test('100 cm -> 39.37 in', () => close(cmToInches(100), 39.37, 0.05));
test('150 lb -> 68.04 kg', () => close(lbToKg(150), 68.04, 0.05));
test('70 kg -> 154.32 lb', () => close(kgToLb(70), 154.32, 0.05));
test('lb+oz: 7 lb 5 oz -> 3.317 kg', () => close(lbOzToKg(7, 5), 3.317, 0.005));
test('kg -> lb/oz: 3.5 kg -> 7 lb 11.4 oz', () => {
  const r = kgToLbOz(3.5);
  assert.equal(r.lb, 7);
  close(r.oz, 11.46, 0.05);
});
test('lbOzToKg: rejects oz >= 16', () => assert.throws(() => lbOzToKg(7, 16)));
