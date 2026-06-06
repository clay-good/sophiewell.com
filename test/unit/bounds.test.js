// spec-v59 §2.5: physiologic-envelope advisories. boundsAdvisory(key, value)
// returns a visible advisory string when an entered value is frankly impossible
// (outside [min, max]) and null otherwise. It never changes the computed number
// -- it surfaces a "verify the units" note next to a result (the renderers wire
// it at the Class-B sites: corrected sodium/calcium, MAP, A-a gradient, eGFR,
// Cockcroft-Gault, BMI).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BOUNDS, boundsAdvisory } from '../../lib/bounds.js';

test('the envelope set covers the catalog analytes (spec-v59 §2.5)', () => {
  const required = ['scr', 'glucose', 'sodium', 'potassium', 'calcium', 'albumin',
    'paO2', 'paCO2', 'fio2', 'pH', 'dbp', 'sbp', 'temperature', 'gcs', 'rr',
    'bilirubin', 'platelets', 'inr', 'lactate', 'hemoglobin', 'wbc', 'bun', 'eGFR'];
  for (const k of required) assert.ok(BOUNDS[k], `BOUNDS missing envelope: ${k}`);
  assert.ok(Object.keys(BOUNDS).length >= 30, 'expected the full ~30-envelope set');
});

test('flags a frankly-impossible glucose (the B1-1 correctedSodium repro)', () => {
  const adv = boundsAdvisory('glucose', 1e9);
  assert.ok(adv && /above the plausible range/.test(adv));
});

test('flags an impossibly high calcium (B1-2) and a sub-floor creatinine (B1-5)', () => {
  assert.ok(boundsAdvisory('calcium', 1e9));
  assert.ok(/below the plausible range/.test(boundsAdvisory('scr', 0.01)));
});

test('a plausible value yields no advisory; FiO2 above 1.0 is flagged', () => {
  assert.equal(boundsAdvisory('glucose', 110), null);
  assert.equal(boundsAdvisory('sodium', 140), null);
  assert.ok(boundsAdvisory('fio2', 2));   // FiO2 > 1.0 is physically impossible
  assert.equal(boundsAdvisory('fio2', 0.5), null);
});

test('non-finite or unknown keys are ignored (no throw, no false advisory)', () => {
  assert.equal(boundsAdvisory('glucose', NaN), null);
  assert.equal(boundsAdvisory('glucose', Infinity), null);
  assert.equal(boundsAdvisory('not-a-key', 5), null);
});
