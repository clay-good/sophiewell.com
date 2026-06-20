// spec-v124 2.6: Lok index (Lok 2005, HALT-C). Logistic probability; <0.2
// rule-out, >0.5 rule-in. Platelets in 10^9/L (~150).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lokIndex } from '../../lib/hep-v124.js';

test('rule-in example (> 0.5)', () => {
  const r = lokIndex({ platelets: 120, ast: 60, alt: 50, inr: 1.2 });
  assert.equal(r.valid, true);
  assert.equal(r.probability, 0.77);
  assert.equal(r.abnormal, true);
});

test('rule-out (< 0.2)', () => {
  const r = lokIndex({ platelets: 250, ast: 20, alt: 40, inr: 1.0 });
  assert.ok(r.probability < 0.2);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /ruled out/);
});

test('overflow-safe: extreme inputs stay in [0,1]', () => {
  const hi = lokIndex({ platelets: 0.001, ast: 1e9, alt: 0.001, inr: 1e9 });
  assert.equal(hi.probability, 1);
  assert.equal(Number.isFinite(hi.probability), true);
});

test('non-positive / missing -> valid:false (no divide-by-zero / ln issues)', () => {
  assert.equal(lokIndex({ platelets: 120, ast: 60, alt: 0, inr: 1.2 }).valid, false);
  assert.equal(lokIndex({ platelets: 120 }).valid, false);
  assert.equal(lokIndex(9).valid, false);
});
