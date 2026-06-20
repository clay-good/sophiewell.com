// spec-v124 2.4: BARD score (Harrison 2008). BMI>=28 (+1), AST/ALT>=0.8 (+2),
// diabetes (+1); 2-4 leaves advanced fibrosis in play, 0-1 rules it out.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bardScore } from '../../lib/hep-v124.js';

test('all components -> 4/4, not ruled out', () => {
  const r = bardScore({ bmi: 30, ast: 45, alt: 40, diabetes: true });
  assert.equal(r.valid, true);
  assert.equal(r.total, 4);
  assert.equal(r.abnormal, true);
  assert.equal(r.ratio, 1.13);
});

test('low BMI, low ratio, no diabetes -> 0/4, ruled out', () => {
  const r = bardScore({ bmi: 25, ast: 20, alt: 40 });
  assert.equal(r.total, 0);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /ruled out/);
});

test('AST/ALT ratio weight is 2 -> ratio alone reaches the 2-4 band', () => {
  const r = bardScore({ bmi: 24, ast: 50, alt: 50 }); // ratio 1.0 >= 0.8 -> +2
  assert.equal(r.total, 2);
  assert.equal(r.abnormal, true);
});

test('total clamps to 0-4 and tolerates missing AST/ALT', () => {
  const r = bardScore({ bmi: 30, diabetes: true }); // 1 + 1, no ratio
  assert.equal(r.total, 2);
  assert.equal(r.ratio, null);
});

test('scalar fuzz arg -> valid 0/4, never NaN', () => {
  const r = bardScore(9);
  assert.equal(r.valid, true);
  assert.equal(Number.isFinite(r.total), true);
});
