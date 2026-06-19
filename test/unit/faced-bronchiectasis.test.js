// spec-v114 2.4: FACED score (Martinez-Garcia 2014). FEV1<50%(2), Age>=70(2),
// Pseudomonas(1), Extension>=3 lobes(1), Dyspnea mMRC>=3(1); total 0-7; bands
// mild 0-2, moderate 3-4, severe 5-7. SOURCE-CORRECTED thresholds: extension is
// >=3 lobes (not the spec draft's >=2), dyspnea is mMRC>=3 (not >=2).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { facedBronchiectasis } from '../../lib/pulm-v114.js';

test('worked example crosses into severe', () => {
  // FEV1 45 (<50 -> 2) + age 72 (>=70 -> 2) + Pseudomonas (1) = 5
  const r = facedBronchiectasis({ fev1: 45, age: 72, pseudomonas: true });
  assert.equal(r.total, 5);
  assert.equal(r.tier, 'severe');
  assert.equal(r.mortality, '68.8%');
});

test('FEV1 and Age each contribute 2 points at their thresholds', () => {
  assert.equal(facedBronchiectasis({ fev1: 49, age: 50 }).total, 2);
  assert.equal(facedBronchiectasis({ fev1: 50, age: 70 }).total, 2); // FEV1 50 is NOT <50; age 70 is >=70
  assert.equal(facedBronchiectasis({ fev1: 49, age: 70 }).total, 4);
});

test('band boundary: 2 mild, 3 moderate, 5 severe', () => {
  assert.equal(facedBronchiectasis({ fev1: 60, age: 80 }).tier, 'mild'); // 2
  assert.equal(facedBronchiectasis({ fev1: 60, age: 80, pseudomonas: true }).tier, 'moderate'); // 3
  assert.equal(facedBronchiectasis({ fev1: 40, age: 80, pseudomonas: true }).tier, 'severe'); // 5
});

test('the three 1-point items are extension >=3 lobes, dyspnea mMRC>=3, Pseudomonas', () => {
  const base = { fev1: 90, age: 50 };
  assert.equal(facedBronchiectasis({ ...base, extension: true }).total, 1);
  assert.equal(facedBronchiectasis({ ...base, dyspnea: true }).total, 1);
  assert.equal(facedBronchiectasis({ ...base, pseudomonas: true, extension: true, dyspnea: true }).total, 3);
});

test('partial input returns a complete-the-fields fallback', () => {
  assert.equal(facedBronchiectasis({ fev1: 45 }).valid, false);
  assert.equal(facedBronchiectasis({}).valid, false);
});
