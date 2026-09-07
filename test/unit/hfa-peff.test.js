// spec-v102 2.4: HFA-PEFF Diagnostic Score (Pieske 2019).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hfaPeff } from '../../lib/cardio-v102.js';

// spec-v1112: all three domains assessed, with the ones under test overridden.
// The two "unlikely" assertions below assessed nothing or one domain and read
// the rest as domains looked at and scoring nothing.
const assessed = (o = {}) => ({ functional: 'none', morphological: 'none', biomarker: 'none', ...o });

test('no domains -> 0, unlikely', () => {
  const r = hfaPeff(assessed());
  assert.equal(r.total, 0);
  assert.equal(r.verdict, 'unlikely');
  assert.deepEqual(r.unassessed, []);
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
  const r = hfaPeff(assessed({ functional: 'minor' }));
  assert.equal(r.total, 1);
  assert.equal(r.verdict, 'unlikely');
});

// --- spec-v1112: an unassessed domain was a domain scoring nothing ---

test('spec-v1112: HFpEF is neither confirmed nor excluded without the workup', () => {
  const r = hfaPeff({});
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(r.unassessed.length, 3);
  assert.equal(r.floorOnly, true);
  assert.equal(r.verdict, null);
  assert.match(r.band, /at least 0\/6 on what was assessed/);
  assert.match(r.band, /3 of the 3 domains were not assessed/);
  assert.doesNotMatch(r.band, /HFpEF unlikely/);
  assert.equal(r.items.every((i) => i.assessed === false), true);
});

test('spec-v1112: "indeterminate" is withheld too, because it also rules out confirmation', () => {
  const r = hfaPeff({ functional: 'major', morphological: 'major' });
  assert.equal(r.total, 4);
  assert.equal(r.verdict, null);
  assert.deepEqual(r.unassessed, ['the biomarker domain']);
  assert.doesNotMatch(r.band, /indeterminate/);
});

test('spec-v1112: confirmed rules in from two domains', () => {
  // Rule 13: five points is five whatever the third domain holds.
  const r = hfaPeff({ functional: 'major', morphological: 'major', biomarker: 'minor' });
  assert.equal(r.verdict, 'confirmed');
  assert.equal(r.floorOnly, false);
  assert.match(r.band, /HFpEF confirmed/);
});
