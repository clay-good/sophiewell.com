// spec-v571: the E-FACED score.
//
// The load-bearing tests are the uneven weighting (six items, nine points) and the fact that the bands do
// not carry over from the predecessor - the error this tile exists to correct.

import test from 'node:test';
import assert from 'node:assert/strict';
import { eFaced, E_FACED_ITEMS, E_FACED_MAX, FACED_MAX } from '../../lib/e-faced-v571.js';

const all = (v) => Object.fromEntries(E_FACED_ITEMS.map((i) => [i.key, v]));
const only = (...keys) => {
  const o = all('no');
  for (const k of keys) o[k] = 'yes';
  return o;
};

test('there are six items totalling nine points', () => {
  assert.equal(E_FACED_ITEMS.length, 6);
  assert.equal(E_FACED_ITEMS.reduce((a, i) => a + i.points, 0), E_FACED_MAX);
  assert.equal(E_FACED_MAX, 9);
});

test('the weighting is uneven: three items carry 2 points and three carry 1', () => {
  const twos = E_FACED_ITEMS.filter((i) => i.points === 2).map((i) => i.key);
  const ones = E_FACED_ITEMS.filter((i) => i.points === 1).map((i) => i.key);
  assert.deepEqual(twos, ['severeExacerbation', 'fev1Under50', 'ageAtLeast70']);
  assert.deepEqual(ones, ['pseudomonas', 'extensionOver2Lobes', 'dyspnea3or4']);
});

test('the extremes are 0 and 9', () => {
  assert.equal(eFaced(all('no')).total, 0);
  assert.equal(eFaced(all('yes')).total, E_FACED_MAX);
});

// THE band difference.
test('the E-FACED bands are 0-3, 4-6 and 7-9, not the FACED bands', () => {
  assert.equal(eFaced(only('pseudomonas', 'dyspnea3or4', 'extensionOver2Lobes')).total, 3);
  assert.match(eFaced(only('pseudomonas', 'dyspnea3or4', 'extensionOver2Lobes')).band, /Mild/);
  assert.equal(eFaced(only('severeExacerbation', 'fev1Under50')).total, 4);
  assert.match(eFaced(only('severeExacerbation', 'fev1Under50')).band, /Moderate/);
  assert.equal(eFaced(only('severeExacerbation', 'fev1Under50', 'ageAtLeast70')).total, 6);
  assert.match(eFaced(only('severeExacerbation', 'fev1Under50', 'ageAtLeast70')).band, /Moderate/);
  assert.equal(eFaced(only('severeExacerbation', 'fev1Under50', 'ageAtLeast70', 'pseudomonas')).total, 7);
  assert.match(eFaced(only('severeExacerbation', 'fev1Under50', 'ageAtLeast70', 'pseudomonas')).band, /Severe/);
});

test('a score of 5 is moderate here, where the FACED bands would call it severe', () => {
  const r = eFaced(only('severeExacerbation', 'fev1Under50', 'pseudomonas'));
  assert.equal(r.total, 5);
  assert.match(r.band, /Moderate/);
  assert.match(r.bandText, /FACED bands would call it severe/);
});

test('the predecessor maximum is exposed and differs', () => {
  assert.equal(FACED_MAX, 7);
  assert.notEqual(FACED_MAX, E_FACED_MAX);
  assert.match(eFaced(all('no')).bandText, /do NOT carry over from FACED/);
});

// The intra-source contradiction.
test('the abstract-versus-body discrepancy is stated in every result', () => {
  assert.match(eFaced(all('no')).bandText, /abstract and results section disagree/);
  assert.match(eFaced(all('no')).bandText, /body describes the actual model construction/);
});

test('the added item is the hospitalization one, per the body', () => {
  const item = E_FACED_ITEMS.find((i) => i.key === 'severeExacerbation');
  assert.match(item.text, /at least one severe exacerbation/i);
  assert.match(item.detail, /require hospitalization/);
  assert.equal(item.points, 2);
});

// The different outcome.
test('the result states that the outcome differs from FACED', () => {
  assert.match(eFaced(all('no')).bandText, /FUTURE EXACERBATIONS/);
  assert.match(eFaced(all('no')).bandText, /predecessor FACED was built to predict MORTALITY/);
});

// Input handling.
test('a missing item is refused and named', () => {
  const o = all('no');
  delete o.pseudomonas;
  const r = eFaced(o);
  assert.equal(r.valid, false);
  assert.match(r.message, /pseudomonas/);
});

test('an unrecognized answer is refused', () => {
  const o = all('no');
  o.fev1Under50 = 'maybe';
  assert.equal(eFaced(o).valid, false);
});

test('the scope note refuses to diagnose or select treatment, and names the causes it misses', () => {
  const r = eFaced(all('yes'));
  assert.match(r.note, /does not diagnose bronchiectasis/);
  assert.match(r.note, /allergic bronchopulmonary aspergillosis/);
  assert.match(r.note, /does not select antibiotics/);
});
