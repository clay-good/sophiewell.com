// spec-v125 2.5: HSI (Lee 2010). 8*(ALT/AST)+BMI+2(female)+2(DM); <30 out, >36 in.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hepaticSteatosisIndex } from '../../lib/hep-v125.js';

test('rule-in example (> 36)', () => {
  const r = hepaticSteatosisIndex({ alt: 60, ast: 30, bmi: 30, female: true, diabetes: true });
  assert.equal(r.valid, true);
  assert.equal(r.hsi, 50);
  assert.equal(r.abnormal, true);
});

test('rule-out (< 30)', () => {
  const r = hepaticSteatosisIndex({ alt: 20, ast: 25, bmi: 20 });
  assert.ok(r.hsi < 30);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /ruled out/);
});

test('female and diabetes each add 2', () => {
  const base = hepaticSteatosisIndex({ alt: 40, ast: 40, bmi: 28 }).hsi;       // 8*1 + 28 = 36
  const f = hepaticSteatosisIndex({ alt: 40, ast: 40, bmi: 28, female: true }).hsi; // +2 = 38
  assert.equal(base, 36);
  assert.equal(f, 38);
});

test('non-positive / missing (incl. AST 0) -> valid:false (no divide-by-zero)', () => {
  assert.equal(hepaticSteatosisIndex({ alt: 60, ast: 0, bmi: 30 }).valid, false);
  assert.equal(hepaticSteatosisIndex({ alt: 60 }).valid, false);
  assert.equal(hepaticSteatosisIndex(9).valid, false);
});
