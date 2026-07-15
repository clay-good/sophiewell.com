// spec-v318: LA classification of erosive esophagitis. Worked-example tests: each of the
// four grades and its definition, the A-B (mild) vs C-D (severe) split, case-insensitive
// input, and the invalid-grade guard. Criteria transcribed from Lundell 1999 (Gut),
// cross-verified against the IWGCO LA classification (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { laEsophagitis } from '../../lib/la-esophagitis-v318.js';

test('grade B: breaks > 5 mm, not between fold tops (the META example)', () => {
  const r = laEsophagitis({ grade: 'B' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 'B');
  assert.equal(r.severe, false);
  assert.match(r.band, /> 5 mm long, none extending between the tops of two mucosal folds/);
});

test('grade A is the mildest, not severe', () => {
  const r = laEsophagitis({ grade: 'A' });
  assert.equal(r.grade, 'A');
  assert.equal(r.severe, false);
  assert.match(r.band, /<= 5 mm/);
});

test('grade C: between >= 2 fold tops but < 75% circumference, severe', () => {
  const r = laEsophagitis({ grade: 'C' });
  assert.equal(r.severe, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /less than 75% of the esophageal circumference/);
});

test('grade D: >= 75% circumference, the most severe', () => {
  const r = laEsophagitis({ grade: 'D' });
  assert.equal(r.grade, 'D');
  assert.equal(r.severe, true);
  assert.match(r.band, /at least 75% of the esophageal circumference/);
});

test('grade input is case-insensitive', () => {
  assert.equal(laEsophagitis({ grade: 'b' }).grade, 'B');
  assert.equal(laEsophagitis({ grade: ' d ' }).grade, 'D');
});

test('a missing or unknown grade is invalid', () => {
  assert.equal(laEsophagitis({}).valid, false);
  assert.equal(laEsophagitis({ grade: 'X' }).valid, false);
  assert.equal(laEsophagitis({ grade: '' }).valid, false);
});
