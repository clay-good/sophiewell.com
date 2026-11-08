// spec-v1717: kdri-kdpi against OPTN's April 2026 guide and its 2025 mapping table.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kdriKdpi, xBeta, kdpiFromScaled } from '../../lib/kdri-kdpi-v1717.js';
import { KDPI_TABLE, UPPERS } from '../../lib/optn-kdpi.js';

const now = new Date('2026-11-07T12:00:00Z');
const example = { age: 52, heightCm: 183, weightKg: 81, hypertension: 'yes', diabetes: 'no', cva: 'yes', creatinine: 1.7, dcd: 'yes' };

test('the guide\'s worked example: Xβ 0.53787 and KDRI_RAO 1.71235565748184, exactly as printed', () => {
  const xb = xBeta({ ...example, hypertension: 1, diabetes: 0, cva: true, dcd: true });
  assert.ok(Math.abs(xb - 0.53787) < 1e-12);
  assert.ok(Math.abs(Math.exp(xb) - 1.71235565748184) < 1e-12);
  // The guide's scaled value used the 2024 factor; the tool uses the 2025 table's.
  assert.ok(Math.abs(Math.exp(xb) / 1.40436817065005 - 1.21930679808076) < 1e-12);
});

test('with the 2025 table the example is KDRI 1.17496 and KDPI 67% (1.16396 < 1.17496 <= 1.17560)', () => {
  const r = kdriKdpi(example, now);
  assert.equal(r.kdriScaled, 1.17496);
  assert.equal(r.kdpi, 67);
  assert.equal(r.band, 'KDPI 67%; KDRI 1.17 (scaled to the median 2025 donor).');
});

test('the mapping table: 100 rising bounds; each upper bound is inclusive, each lower bound exclusive', () => {
  assert.equal(UPPERS.length, 100);
  assert.ok(UPPERS.every((x, i) => !i || x > UPPERS[i - 1]));
  assert.equal(kdpiFromScaled(UPPERS[0]), 0);
  assert.equal(kdpiFromScaled(UPPERS[0] + 1e-12), 1);
  assert.equal(kdpiFromScaled(UPPERS[19]), 19);
  assert.equal(kdpiFromScaled(UPPERS[99] + 1e-9), 100);
  assert.equal(kdpiFromScaled(50), 100);
  assert.equal(KDPI_TABLE.scalingFactor, 1.45737870501158);
});

test('piecewise terms: under 18, over 50, weight under 80 kg, creatinine over 1.5', () => {
  const base = { age: 40, heightCm: 170, weightKg: 80, hypertension: 0, diabetes: 0, cva: false, creatinine: 1, dcd: false };
  assert.equal(xBeta(base), 0);
  assert.ok(Math.abs(xBeta({ ...base, age: 10 }) - (0.0092 * -30 + 0.0113 * -8)) < 1e-12);
  assert.ok(Math.abs(xBeta({ ...base, age: 60 }) - (0.0092 * 20 + 0.0067 * 10)) < 1e-12);
  assert.ok(Math.abs(xBeta({ ...base, age: 50 }) - 0.0092 * 10) < 1e-12, 'age 50 gets no over-50 term');
  assert.ok(Math.abs(xBeta({ ...base, weightKg: 70 }) - 0.0666) < 1e-12);
  assert.ok(Math.abs(xBeta({ ...base, weightKg: 90 })) < 1e-12, 'no weight term at 80 kg or more');
  assert.ok(Math.abs(xBeta({ ...base, creatinine: 1.5 }) - 0.1064) < 1e-12);
  assert.ok(Math.abs(xBeta({ ...base, creatinine: 2 }) - (0.2128 - 0.2199 * 0.5)) < 1e-12);
});

test('unknown history enters at the 2025 share and says so; blank answers are refused, not read as no', () => {
  const r = kdriKdpi({ ...example, hypertension: 'unknown', diabetes: 'unknown' }, now);
  assert.ok(Math.abs(r.xBeta - Number((0.53787 - 0.1106 + 0.1106 * KDPI_TABLE.hypertensionShare + 0.2577 * KDPI_TABLE.diabetesShare).toPrecision(6))) < 1e-9);
  assert.match(r.notes.join(' '), /hypertension at 46\.63%, diabetes at 18\.7%/);
  for (const key of ['hypertension', 'diabetes', 'cva', 'dcd']) assert.equal(kdriKdpi({ ...example, [key]: '' }, now).valid, false, key);
  assert.equal(kdriKdpi({ ...example, age: 52.5 }, now).valid, false);
  assert.equal(kdriKdpi({ ...example, heightCm: 6 }, now).valid, false, 'feet typed as cm');
  assert.equal(kdriKdpi({ ...example, creatinine: 150 }, now).valid, false, 'µmol/L typed as mg/dL');
});

test('the table is refused after its re-read date', () => {
  assert.match(kdriKdpi(example, new Date('2027-07-01T12:00:00Z')).message, /past its re-read date/);
});

test('KDPI 20% or less names longevity matching; the guide\'s cautions are always shown', () => {
  const young = kdriKdpi({ ...example, age: 25, hypertension: 'no', cva: 'no', creatinine: 0.8, dcd: 'no' }, now);
  assert.ok(young.kdpi <= 20);
  assert.match(young.notes.join(' '), /EPTS is 20% or less/);
  assert.match(kdriKdpi(example, now).notes.join(' '), /never alone rule a kidney in/);
});
