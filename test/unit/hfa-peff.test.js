// spec-v102 2.4: HFA-PEFF Diagnostic Score (Pieske 2019).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hfaPeff } from '../../lib/cardio-v102.js';

test('no domains -> 0, unlikely', () => {
  const r = hfaPeff({});
  assert.equal(r.total, 0);
  assert.equal(r.verdict, 'unlikely');
});

test('major + minor + minor -> 4, indeterminate', () => {
  const r = hfaPeff({ functional: 'major', morphological: 'minor', biomarker: 'minor' });
  assert.equal(r.total, 4);
  assert.equal(r.verdict, 'indeterminate');
});

test('4 -> 5 flips indeterminate to confirmed', () => {
  const r = hfaPeff({ functional: 'major', morphological: 'major', biomarker: 'minor' });
  assert.equal(r.total, 5);
  assert.equal(r.verdict, 'confirmed');
});

test('each domain caps at 2 (max total 6)', () => {
  const r = hfaPeff({ functional: 'major', morphological: 'major', biomarker: 'major' });
  assert.equal(r.total, 6);
  assert.equal(r.verdict, 'confirmed');
});

test('a single minor domain -> 1, unlikely (edge)', () => {
  const r = hfaPeff({ functional: 'minor' });
  assert.equal(r.total, 1);
  assert.equal(r.verdict, 'unlikely');
});
