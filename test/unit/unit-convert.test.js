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
test('uric acid 6 mg/dL -> 357 umol/L', () => close(labConvert('uricAcid', 6), 357, 1));
test('labConvert: unknown kind throws', () => assert.throws(() => labConvert('foo', 1)));

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
