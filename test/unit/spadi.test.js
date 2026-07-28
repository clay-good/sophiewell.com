// spec-v561: the Shoulder Pain and Disability Index.
//
// The load-bearing test is that the total is the mean of two subscale percentages and NOT the sum over 130,
// pinned by a case where the two computations visibly diverge.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  spadi, SPADI_ITEMS, SPADI_PAIN_ITEMS, SPADI_DISABILITY_ITEMS,
  PAIN_MAX, DISABILITY_MAX, ITEM_MAX, SPADI_MDC,
} from '../../lib/spadi-v561.js';

const all = (v) => Object.fromEntries(SPADI_ITEMS.map((i) => [i.key, String(v)]));
const build = (pain, disability) => {
  const o = {};
  SPADI_PAIN_ITEMS.forEach((i) => { o[i.key] = String(pain); });
  SPADI_DISABILITY_ITEMS.forEach((i) => { o[i.key] = String(disability); });
  return o;
};

test('there are 5 pain items and 8 disability items', () => {
  assert.equal(SPADI_PAIN_ITEMS.length, 5);
  assert.equal(SPADI_DISABILITY_ITEMS.length, 8);
  assert.equal(SPADI_ITEMS.length, 13);
  assert.equal(PAIN_MAX, 50);
  assert.equal(DISABILITY_MAX, 80);
});

test('the extremes are 0 and 100 percent', () => {
  assert.equal(spadi(all(0)).total, 0);
  assert.equal(spadi(all(ITEM_MAX)).total, 100);
});

// THE scoring rule.
test('the total is the mean of the two subscale percentages', () => {
  const r = spadi(build(10, 0));
  assert.equal(r.painPercent, 100);
  assert.equal(r.disabilityPercent, 0);
  assert.equal(r.total, 50);
});

test('the mean-of-subscales total differs from the naive sum over 130', () => {
  const r = spadi(build(10, 0));
  assert.equal(r.total, 50);
  // 50 raw points out of 130 = 38.5 percent
  assert.equal(r.naiveTotal, 38.5);
  assert.notEqual(r.total, r.naiveTotal);
});

test('the two computations agree only when both subscales are at the same level', () => {
  const same = spadi(build(6, 6));
  assert.equal(same.total, same.naiveTotal);

  const different = spadi(build(9, 2));
  assert.notEqual(different.total, different.naiveTotal);
});

test('one pain item moves the total more than one disability item', () => {
  const base = spadi(all(0));
  const onePain = { ...all(0) }; onePain[SPADI_PAIN_ITEMS[0].key] = '10';
  const oneDisability = { ...all(0) }; oneDisability[SPADI_DISABILITY_ITEMS[0].key] = '10';

  const painDelta = spadi(onePain).total - base.total;
  const disabilityDelta = spadi(oneDisability).total - base.total;
  assert.ok(painDelta > disabilityDelta);
  // 5 pain items share 50 percent; 8 disability items share 50 percent. Ratio 8/5 = 1.6.
  assert.equal(Math.round((painDelta / disabilityDelta) * 10) / 10, 1.6);
});

test('the result states the weighting consequence', () => {
  assert.match(spadi(all(5)).bandText, /1\.6 times one disability item/);
  assert.match(spadi(all(5)).bandText, /not the sum of all 13 items over 130/);
});

// Subscale arithmetic.
test('the subscale percentages use their own denominators', () => {
  const r = spadi(build(5, 5));
  assert.equal(r.painSum, 25);
  assert.equal(r.disabilityPercent, 50);
  assert.equal(r.painPercent, 50);
  assert.equal(r.total, 50);
});

// Complete data only.
test('an omitted item is refused, and the refusal explains that the rules disagree', () => {
  const o = all(4);
  delete o.washBack;
  const r = spadi(o);
  assert.equal(r.valid, false);
  assert.match(r.message, /DISAGREE/);
  assert.match(r.message, /washBack/);
});

test('no missing-data imputation happens silently', () => {
  const o = all(4);
  o.painWorst = '';
  assert.equal(spadi(o).valid, false);
});

test('an out-of-range item is refused', () => {
  const o = all(4);
  o.painWorst = '11';
  assert.equal(spadi(o).valid, false);
  o.painWorst = '-1';
  assert.equal(spadi(o).valid, false);
});

// The MDC belongs to a change.
test('the MDC is exposed and framed as applying to a difference', () => {
  assert.equal(SPADI_MDC, 13);
  const r = spadi(all(5));
  assert.equal(r.mdc, 13);
  assert.match(r.bandText, /DIFFERENCE between two of the same patient/);
});

test('the response format is stated', () => {
  assert.match(spadi(all(5)).bandText, /numeric rating scale/);
});

test('the scope note names the causes it cannot distinguish and the red flags', () => {
  const r = spadi(all(8));
  assert.match(r.note, /adhesive capsulitis/);
  assert.match(r.note, /acute traumatic tear/);
  assert.match(r.note, /neither range of motion nor strength/);
});
