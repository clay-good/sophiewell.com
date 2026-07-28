// spec-v557: the modified Severity-Weighted Assessment Tool.
//
// The load-bearing tests are the 0-400 range, the mutually exclusive categories, the vocabulary switch, and
// the absence of any severity band.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mswat, MSWAT_CATEGORIES, categoryLabel, MSWAT_MAX, MSWAT_TUMOR_WEIGHT,
  SWAT_ORIGINAL_TUMOR_WEIGHT, MAX_TOTAL_BSA, PARTIAL_SKIN_RESPONSE_REDUCTION,
} from '../../lib/mswat-v557.js';

const score = (w1, w2, w4, erythrodermic = 'no') => mswat({
  erythrodermic, weight1: String(w1), weight2: String(w2), weight4: String(w4),
});

test('the three weights are 1, 2 and 4', () => {
  assert.deepEqual(MSWAT_CATEGORIES.map((c) => c.weight), [1, 2, 4]);
  assert.equal(MSWAT_TUMOR_WEIGHT, 4);
});

test('the original SWAT tumor weight is exposed for comparison and differs', () => {
  assert.equal(SWAT_ORIGINAL_TUMOR_WEIGHT, 3);
  assert.notEqual(SWAT_ORIGINAL_TUMOR_WEIGHT, MSWAT_TUMOR_WEIGHT);
});

// THE range.
test('the score runs to 400, not 100', () => {
  assert.equal(MSWAT_MAX, 400);
  assert.equal(score(0, 0, 100).total, 400);
  assert.equal(score(100, 0, 0).total, 100);
  assert.equal(score(0, 100, 0).total, 200);
});

test('a score above 100 is ordinary, and the result says the range is not a percentage', () => {
  const r = score(0, 90, 0);
  assert.equal(r.total, 180);
  assert.match(r.bandText, /NOT 0 to 100/);
});

test('the formula is area times weight, summed', () => {
  const r = score(10, 20, 5);
  assert.equal(r.total, 10 + 40 + 20);
  assert.equal(r.totalBsa, 35);
});

test('no involvement scores zero', () => {
  const r = score(0, 0, 0);
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
});

// Mutual exclusivity.
test('areas totalling more than 100 percent are refused', () => {
  const r = score(50, 40, 30);
  assert.equal(r.valid, false);
  assert.match(r.message, /counted once, in one category only/);
});

test('areas totalling exactly 100 percent are accepted', () => {
  const r = score(50, 30, 20);
  assert.equal(r.valid, true);
  assert.equal(r.totalBsa, MAX_TOTAL_BSA);
});

test('a single area above 100 is refused', () => {
  assert.equal(score(101, 0, 0).valid, false);
  assert.equal(score(0, 0, -1).valid, false);
});

// The vocabulary switch.
test('the lesion labels switch with the erythroderma answer', () => {
  const flat = MSWAT_CATEGORIES[0];
  assert.equal(categoryLabel(flat, true), 'Patch (flat lesion)');
  assert.equal(categoryLabel(flat, false), 'Mild infiltration');

  const raised = MSWAT_CATEGORIES[1];
  assert.equal(categoryLabel(raised, true), 'Plaque (raised lesion)');
  assert.equal(categoryLabel(raised, false), 'Moderate infiltration');
});

test('the tumor category is worded the same under both forms', () => {
  const tumor = MSWAT_CATEGORIES[2];
  assert.equal(categoryLabel(tumor, true), categoryLabel(tumor, false));
});

test('the vocabulary switch does not change the arithmetic', () => {
  assert.equal(score(10, 20, 5, 'yes').total, score(10, 20, 5, 'no').total);
});

test('the result reports the labels for the form actually chosen', () => {
  assert.equal(mswat({ erythrodermic: 'yes', weight1: '10' }).categories[0].label, 'Patch (flat lesion)');
  assert.equal(mswat({ erythrodermic: 'no', weight1: '10' }).categories[0].label, 'Mild infiltration');
});

test('the erythroderma answer is required', () => {
  const r = mswat({ weight1: '10' });
  assert.equal(r.valid, false);
  assert.match(r.message, /erythrodermic/);
});

// No bands.
test('no severity band is emitted, and the response threshold is framed as a change', () => {
  const r = score(20, 20, 20);
  assert.equal(r.bandsPublished, false);
  assert.equal(r.band, undefined);
  assert.match(r.bandText, /NO published severity bands/);
  assert.match(r.bandText, new RegExp(`${PARTIAL_SKIN_RESPONSE_REDUCTION} percent or more is a partial skin response`));
  assert.match(r.bandText, /property of a comparison/);
});

test('the scope note separates skin burden from staging and names the blood compartment', () => {
  const r = score(10, 0, 0);
  assert.match(r.note, /does not stage mycosis fungoides/);
  assert.match(r.note, /blood involvement this instrument cannot see/);
  assert.match(r.note, /does not select therapy/);
});
