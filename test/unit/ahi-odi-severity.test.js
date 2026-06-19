// spec-v114 2.6: AHI/ODI severity (AASM 1999/2012). AHI bands normal<5, mild
// 5-<15, moderate 15-<30, severe>=30. Negative/non-finite AHI is guarded.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ahiOdiSeverity } from '../../lib/pulm-v114.js';

test('worked example: AHI 22 -> moderate', () => {
  const r = ahiOdiSeverity({ ahi: 22 });
  assert.equal(r.severity, 'moderate');
  assert.equal(r.ahi, 22);
  assert.match(r.band, /moderate obstructive sleep apnea/);
});

test('band boundaries are half-open: 5 mild, 15 moderate, 30 severe', () => {
  assert.equal(ahiOdiSeverity({ ahi: 4.9 }).severity, 'normal');
  assert.equal(ahiOdiSeverity({ ahi: 5 }).severity, 'mild');
  assert.equal(ahiOdiSeverity({ ahi: 14.9 }).severity, 'mild');
  assert.equal(ahiOdiSeverity({ ahi: 15 }).severity, 'moderate');
  assert.equal(ahiOdiSeverity({ ahi: 29.9 }).severity, 'moderate');
  assert.equal(ahiOdiSeverity({ ahi: 30 }).severity, 'severe');
});

test('ODI is shown alongside with the desaturation criterion (default 3%)', () => {
  const r = ahiOdiSeverity({ ahi: 22, odi: 18 });
  assert.equal(r.odi, 18);
  assert.equal(r.criterion, '3%');
  assert.match(r.odiText, /3% desaturation criterion/);
  const r4 = ahiOdiSeverity({ ahi: 22, odi: 18, criterion: '4%' });
  assert.equal(r4.criterion, '4%');
});

test('a negative AHI is guarded with a surfaced fallback', () => {
  assert.equal(ahiOdiSeverity({ ahi: -5 }).valid, false);
});

test('a missing AHI returns a complete-the-fields fallback', () => {
  assert.equal(ahiOdiSeverity({}).valid, false);
});
