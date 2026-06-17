// spec-v99 2.3: Simplified Acute Physiology Score II (Le Gall 1993). Point total
// -> predicted hospital mortality via the published logistic conversion.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sapsII } from '../../lib/idcrit-v99.js';

const SICK = {
  age: 70, heartRate: 130, sbp: 90, temperature: 38, ventilated: true, paO2: 80, fio2: 0.5,
  urineOutput: 0.4, bun: 60, sodium: 140, potassium: 4.0, bicarbonate: 18, bilirubin: 2.0,
  wbc: 15, gcs: 12, chronicDisease: 'none', admissionType: 'medical',
};

test('worked point total and mortality match the published conversion', () => {
  // age 70 (15) + HR 130 (4) + SBP 90 (5) + temp 38 (0) + P/F 160 (9) + urine 0.4 (11)
  //  + BUN 60 (6) + Na 140 (0) + K 4 (0) + HCO3 18 (3) + bili 2 (0) + WBC 15 (0)
  //  + GCS 12 (5) + chronic none (0) + medical (6) = 64.
  const r = sapsII(SICK);
  assert.equal(r.valid, true);
  assert.equal(r.score, 64);
  // logit = -7.7631 + 0.0737*64 + 0.9971*ln(65); mortality ~ 75.3%.
  assert.equal(r.mortality, 75.3);
});

test('a young, physiologically normal scheduled-surgical admission scores low', () => {
  const r = sapsII({
    age: 30, heartRate: 80, sbp: 120, temperature: 37, ventilated: false,
    urineOutput: 2.0, bun: 15, sodium: 140, potassium: 4.0, bicarbonate: 24, bilirubin: 1.0,
    wbc: 8, gcs: 15, chronicDisease: 'none', admissionType: 'scheduled-surgical',
  });
  assert.equal(r.score, 0);
  assert.ok(r.mortality < 1);
});

test('a blank required variable surfaces the complete-the-fields fallback', () => {
  const r = sapsII({ ...SICK, sodium: null });
  assert.equal(r.valid, false);
  assert.ok(!/NaN/.test(r.band));
});

test('overflow / extreme inputs yield a finite mortality in [0,100]', () => {
  const r = sapsII({ ...SICK, age: 1e9, wbc: 1e9, bun: 1e9, gcs: 3 });
  assert.equal(r.valid, true);
  assert.ok(Number.isFinite(r.mortality));
  assert.ok(r.mortality >= 0 && r.mortality <= 100);
});

test('PaO2/FiO2 only scores when ventilated', () => {
  const vented = sapsII({ ...SICK, ventilated: true });
  const notVented = sapsII({ ...SICK, ventilated: false });
  assert.ok(vented.score > notVented.score);
});
