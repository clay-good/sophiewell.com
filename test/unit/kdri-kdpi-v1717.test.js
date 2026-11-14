// spec-v1717: kdri-kdpi against OPTN's April 2026 guide and its 2025 mapping table.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kdriKdpi, xBeta, kdpiFromScaled, CREATININE_CAP } from '../../lib/kdri-kdpi-v1717.js';
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

// spec-v1718: the guide's extreme-value rule. Left out of the November 7 transcription, and the formula
// it governs runs the wrong way without it: the two creatinine terms sum to -0.0071 per mg/dL above 1.5,
// so an uncapped KDRI FALLS as the donor's creatinine rises, without end.
test('creatinine above 8 mg/dL enters the KDRI as 8, and the page says it did', () => {
  assert.equal(CREATININE_CAP, 8);
  const at8 = kdriKdpi({ ...example, creatinine: 8 }, now);
  for (const cr of [8.01, 9, 15, 25, 40]) {
    const r = kdriKdpi({ ...example, creatinine: cr }, now);
    assert.equal(r.kdpi, at8.kdpi, `Cr ${cr} must read the same KDPI as Cr 8`);
    assert.equal(r.kdriScaled, at8.kdriScaled, `Cr ${cr} must read the same KDRI as Cr 8`);
    assert.match(r.notes.join(' '), /entered the KDRI as 8 mg\/dL/);
  }
  // At or below the cap nothing is capped and nothing is said.
  assert.doesNotMatch(at8.notes.join(' '), /entered the KDRI as 8 mg\/dL/);
  assert.equal(kdriKdpi({ ...example, creatinine: 8 }, now).kdpi, 63);
});

test('without the cap the guide\'s own donor would read as a BETTER kidney the sicker the creatinine', () => {
  // The defect this fixes, pinned as arithmetic so it cannot come back quietly.
  const uncapped = (cr) => xBeta({ age: 52, heightCm: 183, weightKg: 81, hypertension: 1, diabetes: 0, cva: true, dcd: true, creatinine: cr });
  assert.ok(uncapped(20) === uncapped(8), 'xBeta caps, so 20 and 8 agree');
  const raw = (cr) => 0.2128 * (cr - 1) - (cr > 1.5 ? 0.2199 * (cr - 1.5) : 0);
  assert.ok(raw(20) < raw(1.7), 'the published terms really do fall above 1.5 -- this is why the cap matters');
  assert.equal(kdriKdpi({ ...example, creatinine: 20 }, now).kdpi, 63, 'capped, not 54');
});

test('the guide\'s own entry range for creatinine is accepted, and a unit slip still is not', () => {
  assert.equal(kdriKdpi({ ...example, creatinine: 0.01 }, now).valid, true);
  assert.equal(kdriKdpi({ ...example, creatinine: 40 }, now).valid, true);
  assert.equal(kdriKdpi({ ...example, creatinine: 40.1 }, now).valid, false);
  assert.equal(kdriKdpi({ ...example, creatinine: 0 }, now).valid, false);
  assert.equal(kdriKdpi({ ...example, creatinine: 150 }, now).valid, false, 'µmol/L typed as mg/dL');
});
