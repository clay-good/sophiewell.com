// spec-v445: Revised Atlanta acute-pancreatitis severity (mild/moderately-severe/severe).
// Worked-example tests: each category and its definition, alias input, and the invalid-severity guard.
// Categories transcribed from Banks 2013 (Gut) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { atlantaPancreatitis } from '../../lib/atlanta-pancreatitis-v445.js';

test('moderately-severe: transient organ failure (the META example)', () => {
  const r = atlantaPancreatitis({ severity: 'moderately-severe' });
  assert.equal(r.valid, true);
  assert.equal(r.category, 'moderately severe');
  assert.match(r.band, /transient organ failure/);
});

test('mild: no organ failure, no complications', () => {
  const r = atlantaPancreatitis({ severity: 'mild' });
  assert.equal(r.category, 'mild');
  assert.match(r.band, /no organ failure and no local or systemic complications/);
});

test('severe: persistent organ failure', () => {
  const r = atlantaPancreatitis({ severity: 'severe' });
  assert.equal(r.category, 'severe');
  assert.match(r.band, /persistent organ failure \(more than 48 hours\)/);
});

test('aliases: "moderately severe" spelling and numbers map to the categories', () => {
  assert.equal(atlantaPancreatitis({ severity: 'moderately severe' }).category, 'moderately severe');
  assert.equal(atlantaPancreatitis({ severity: '1' }).category, 'mild');
  assert.equal(atlantaPancreatitis({ severity: '3' }).category, 'severe');
});

test('a missing or unknown severity is invalid', () => {
  assert.equal(atlantaPancreatitis({}).valid, false);
  assert.equal(atlantaPancreatitis({ severity: 'critical' }).valid, false);
});
