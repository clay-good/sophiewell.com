// spec-v115 2.1: Mayo Clinic SPN malignancy model (Swensen 1997). Logistic,
// x = -6.8272 + 0.0391*age + 0.7917*smoke + 1.3388*cancer + 0.1274*diameter
//   + 1.0407*spiculation + 0.7838*upperlobe; prob = e^x/(1+e^x). Pretest bands
// low < 5%, intermediate 5-65%, high > 65%.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mayoSpn } from '../../lib/pulmnod-v115.js';

test('worked example: age 51, smoker, 12 mm, spiculated, upper lobe -> 33.4% intermediate', () => {
  const r = mayoSpn({ age: 51, diameter: 12, smoking: true, spiculation: true, upperlobe: true });
  assert.equal(r.valid, true);
  assert.equal(r.pct, 33.4);
  assert.equal(r.tier, 'intermediate');
});

test('low anchor: age 45, no risk factors, 6 mm smooth -> 1.3% low', () => {
  const r = mayoSpn({ age: 45, diameter: 6 });
  assert.equal(r.pct, 1.3);
  assert.equal(r.tier, 'low');
});

test('high anchor: age 70, smoker, prior cancer, 30 mm, spiculated, upper -> > 65% high', () => {
  const r = mayoSpn({ age: 70, diameter: 30, smoking: true, cancer: true, spiculation: true, upperlobe: true });
  assert.equal(r.tier, 'high');
  assert.ok(r.pct > 65);
});

test('partial inputs render a complete-the-fields fallback', () => {
  const r = mayoSpn({ age: 60 });
  assert.equal(r.valid, false);
  assert.match(r.band, /Enter the patient age and the nodule diameter/);
});

test('extreme diameter does not overflow to NaN/Infinity', () => {
  const r = mayoSpn({ age: 1e9, diameter: 1e9 });
  assert.equal(r.valid, true);
  assert.ok(Number.isFinite(r.pct));
  assert.ok(r.pct <= 100);
});
