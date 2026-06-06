// spec-v57 §2.14: Shock Index, Pediatric Age-Adjusted.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sipa } from '../../lib/scoring-v5.js';

test('age 5, HR 140 / SBP 100 -> SI 1.4 > 1.22 elevated', () => {
  const r = sipa({ ageYears: 5, hr: 140, sbp: 100 });
  assert.equal(r.shockIndex, 1.4); assert.equal(r.cutoff, 1.22); assert.equal(r.elevated, true);
});
test('age band cutoffs: 7-12 -> 1.0, 13-16 -> 0.9', () => {
  assert.equal(sipa({ ageYears: 10, hr: 100, sbp: 100 }).cutoff, 1.0);
  assert.equal(sipa({ ageYears: 15, hr: 90, sbp: 100 }).cutoff, 0.9);
});
test('within range not elevated', () => {
  const r = sipa({ ageYears: 5, hr: 100, sbp: 100 });
  assert.equal(r.shockIndex, 1.0); assert.equal(r.elevated, false);
});
test('age outside 4-16 -> no cutoff, caution band', () => {
  const r = sipa({ ageYears: 2, hr: 120, sbp: 90 });
  assert.equal(r.cutoff, null); assert.equal(r.elevated, null);
  assert.match(r.band, /4-16/);
});
test('rejects impossible vitals', () => {
  assert.throws(() => sipa({ ageYears: 5, hr: 140, sbp: 0 }), /sbp/);
  assert.throws(() => sipa({ ageYears: NaN, hr: 140, sbp: 100 }), /ageYears/);
});
