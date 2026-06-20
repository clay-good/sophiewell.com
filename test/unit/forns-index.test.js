// spec-v124 2.3: Forns index (Forns 2002). Cholesterol term is mg/dL (the v97
// re-fetch correction). < 4.2 rule-out, > 6.9 rule-in.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fornsIndex } from '../../lib/hep-v124.js';

test('rule-out example (< 4.2)', () => {
  const r = fornsIndex({ age: 30, ggt: 20, platelets: 280, cholesterol: 220 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 1.22);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /ruled out/);
});

test('rule-in band (> 6.9) flags', () => {
  const r = fornsIndex({ age: 70, ggt: 300, platelets: 80, cholesterol: 150 });
  assert.equal(r.abnormal, true);
  assert.match(r.band, /likely/);
});

test('cholesterol is mg/dL: a mmol/L-magnitude value would mis-score', () => {
  // 200 mg/dL contributes -2.8; if someone wrongly passed ~5 (mmol/L) the term
  // would be -0.07 -> score grossly higher. Confirm mg/dL magnitude is expected.
  const mg = fornsIndex({ age: 50, ggt: 80, platelets: 150, cholesterol: 200 });
  const wrong = fornsIndex({ age: 50, ggt: 80, platelets: 150, cholesterol: 5 });
  assert.ok(wrong.score - mg.score > 2.5); // mmol/L input inflates the score
});

test('non-positive / missing -> valid:false (no ln(0))', () => {
  assert.equal(fornsIndex({ age: 50, ggt: 0, platelets: 150, cholesterol: 200 }).valid, false);
  assert.equal(fornsIndex({ age: 50 }).valid, false);
  assert.equal(fornsIndex(9).valid, false);
});
