// spec-v115 2.5: RAPID score for pleural infection (Rahman 2014). Renal (urea
// band) + Age band + Purulence + Infection source + Dietary albumin, total 0-7.
// Bands low 0-2, medium 3-4, high 5-7; derivation-cohort 3-month mortality
// ~1.5 / 17 / 47%.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rapidPleural } from '../../lib/pulmnod-v115.js';

test('worked example: urea > 8, age 74, non-purulent, hospital-acquired, albumin 24 -> 7 high', () => {
  const r = rapidPleural({ urea: 'high', age: 74, nonPurulent: true, hospitalAcquired: true, albumin: 24 });
  assert.equal(r.valid, true);
  assert.equal(r.total, 7);
  assert.equal(r.tier, 'high');
  assert.equal(r.mortality, '~47%');
});

test('low anchor: urea < 5, age 45, purulent, community, albumin 30 -> 0 low', () => {
  const r = rapidPleural({ urea: 'low', age: 45, albumin: 30 });
  assert.equal(r.total, 0);
  assert.equal(r.tier, 'low');
});

test('age bands: < 50 = 0, 50-70 = 1, > 70 = 2', () => {
  assert.equal(rapidPleural({ urea: 'low', age: 49, albumin: 30 }).total, 0);
  assert.equal(rapidPleural({ urea: 'low', age: 60, albumin: 30 }).total, 1);
  assert.equal(rapidPleural({ urea: 'low', age: 75, albumin: 30 }).total, 2);
});

test('band boundary: 2 is low, 3 is medium, 5 is high', () => {
  // urea +2, age <50, albumin ok -> 2 low
  assert.equal(rapidPleural({ urea: 'high', age: 40, albumin: 30 }).tier, 'low');
  // urea +2 + age 50-70 (+1) -> 3 medium
  assert.equal(rapidPleural({ urea: 'high', age: 60, albumin: 30 }).tier, 'medium');
  // urea +2 + age >70 (+2) + albumin <27 (+1) -> 5 high
  assert.equal(rapidPleural({ urea: 'high', age: 75, albumin: 20 }).tier, 'high');
});

test('partial inputs render a complete-the-fields fallback', () => {
  const r = rapidPleural({ urea: 'high' });
  assert.equal(r.valid, false);
  assert.match(r.band, /Enter the patient age and the serum albumin/);
});
