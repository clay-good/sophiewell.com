// spec-v200 2.2: LODS worked examples, per-system levels, and mortality model.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lods } from '../../lib/critcare-severity-v200.js';

const NORMAL = { gcs: 15, hr: 80, sbp: 120, bun: 10, creatinine: 1.0, urineL: 1.5, wbc: 8, platelets: 200, bilirubin: 1, mechVent: false };

test('all-normal -> LODS 0, low mortality', () => {
  const r = lods(NORMAL);
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
  assert.ok(r.mortality < 5);
});

test('each system contributes its worst-variable level', () => {
  const r = lods({ gcs: 7, hr: 150, sbp: 60, bun: 60, creatinine: 2.0, urineL: 0.3, wbc: 0.5, platelets: 30, bilirubin: 3, mechVent: true, pf: 100, ptLow: true });
  // neuro 3 + cardio 3 + renal 5 + pulmonary 3 + hematologic 3 + hepatic 1
  assert.equal(r.score, 18);
  assert.ok(r.mortality > 90);
  assert.equal(r.abnormal, true);
});

test('cardiovascular takes the larger of heart-rate and systolic-BP points', () => {
  const r = lods({ ...NORMAL, hr: 145, sbp: 50 });
  // hr 145 -> 1, sbp 50 -> 3, system = 3
  assert.equal(r.score, 3);
});

test('pulmonary scores only when ventilated / on CPAP', () => {
  const notVented = lods({ ...NORMAL, pf: 90, mechVent: false });
  assert.equal(notVented.score, 0);
  const vented = lods({ ...NORMAL, pf: 90, mechVent: true });
  assert.equal(vented.score, 3);
});

test('ventilated without a P/F ratio -> complete-the-fields', () => {
  const r = lods({ ...NORMAL, mechVent: true });
  assert.equal(r.valid, false);
  assert.match(r.message, /PaO/);
});

test('total is capped at the published maximum of 22', () => {
  const r = lods({ gcs: 3, hr: 20, sbp: 30, bun: 100, creatinine: 5, urineL: 0.1, wbc: 0.5, platelets: 10, bilirubin: 5, mechVent: true, pf: 50, ptLow: true });
  assert.equal(r.score, 22);
});
