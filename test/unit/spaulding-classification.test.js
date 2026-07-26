// spec-v478: Spaulding device-reprocessing classification (critical / semicritical / noncritical).
// Worked-example tests: each category and its required reprocessing, alias input, and the invalid guard.
// Categories transcribed from Spaulding 1968 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spauldingClassification } from '../../lib/spaulding-classification-v478.js';

test('semicritical: high-level disinfection (the META example)', () => {
  const r = spauldingClassification({ category: 'semicritical' });
  assert.equal(r.valid, true);
  assert.equal(r.category, 'Semicritical');
  assert.match(r.band, /at least high-level disinfection/);
});

test('critical: sterilization', () => {
  const r = spauldingClassification({ category: 'critical' });
  assert.equal(r.category, 'Critical');
  assert.match(r.band, /it requires sterilization/);
});

test('noncritical: low-level disinfection', () => {
  assert.match(spauldingClassification({ category: 'noncritical' }).band, /low-level disinfection or cleaning/);
});

test('hyphenated and numeric aliases work', () => {
  assert.equal(spauldingClassification({ category: 'semi-critical' }).category, 'Semicritical');
  assert.equal(spauldingClassification({ category: 'non-critical' }).category, 'Noncritical');
  assert.equal(spauldingClassification({ category: 1 }).category, 'Critical');
});

test('an unknown category is invalid', () => {
  assert.equal(spauldingClassification({}).valid, false);
  assert.equal(spauldingClassification({ category: 'sterile' }).valid, false);
});
