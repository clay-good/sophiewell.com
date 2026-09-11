// spec-v124 2.5: Fatty Liver Index (Bedogni 2006). Logistic 0-100; <30 rule-out,
// >=60 rule-in.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fattyLiverIndex } from '../../lib/hep-v124.js';

test('rule-in example (>= 60)', () => {
  const r = fattyLiverIndex({ tg: 150, bmi: 30, ggt: 60, waist: 100 });
  assert.equal(r.valid, true);
  assert.equal(r.fli, 80.84);
  assert.equal(r.abnormal, true);
});

test('rule-out (< 30)', () => {
  const r = fattyLiverIndex({ tg: 50, bmi: 20, ggt: 15, waist: 70 });
  assert.ok(r.fli < 30);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /ruled out/);
});

test('overflow-safe: extreme inputs cap at 100, never Infinity', () => {
  // spec-v1237: the BMI is the one predictor here with a plausibility envelope,
  // so the overflow probe drives it to the top of that envelope and fuzzes the
  // rest. A BMI past it is refused, not computed. (The fifth test in this
  // programme found using an impossible value as a convenience -- see
  // docs/spec-v1234.md.)
  const r = fattyLiverIndex({ tg: 1e9, bmi: 200, ggt: 1e9, waist: 1e9 });
  assert.equal(r.fli, 100);
  assert.equal(Number.isFinite(r.fli), true);
  assert.equal(fattyLiverIndex({ tg: 150, bmi: 1e9, ggt: 60, waist: 100 }).valid, false);
});

test('non-positive / missing -> valid:false (no ln(0))', () => {
  assert.equal(fattyLiverIndex({ tg: 0, bmi: 30, ggt: 60, waist: 100 }).valid, false);
  assert.equal(fattyLiverIndex({ tg: 150 }).valid, false);
  assert.equal(fattyLiverIndex(9).valid, false);
});
