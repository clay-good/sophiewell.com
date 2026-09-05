import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mnihss } from '../../lib/scoring-v4.js';

// spec-v1078: this test used to assert `mnihss({})` -> "no stroke symptoms",
// which is the defect, not the contract. It was written when the tile rendered
// its eleven items as sliders: a slider cannot be blank, so an untouched form
// really did send eleven zeros and "the tile example" really was an all-zero
// exam. The control is now a number input, so an unrated item arrives absent,
// and the two cases have to be told apart.
test('spec-v1078: nothing rated is not a normal exam', () => {
  const r = mnihss({});
  assert.equal(r.total, 0);
  assert.equal(r.complete, false);
  assert.equal(r.itemsScored, 0);
  assert.equal(r.severity, 'not scored');
  assert.match(r.band, /an unscored exam is not a normal exam/);
});

test('spec-v1078: eleven items rated zero IS a normal exam', () => {
  const all = {};
  for (const id of ['locQuestions', 'locCommands', 'gaze', 'visualFields', 'motorArmL',
    'motorArmR', 'motorLegL', 'motorLegR', 'sensory', 'language', 'extinction']) all[id] = 0;
  const r = mnihss(all);
  assert.equal(r.total, 0);
  assert.equal(r.complete, true);
  assert.equal(r.severity, 'no stroke symptoms');
  assert.doesNotMatch(r.band, /unscored|floor/);
});

test('spec-v1078: a partial exam states its footing', () => {
  const r = mnihss({ gaze: 2, motorArmL: 4, language: 2 });
  assert.equal(r.total, 8);
  assert.equal(r.itemsScored, 3);
  assert.equal(r.severity, 'moderate stroke', 'a band above zero stays true as a floor');
  assert.match(r.band, /Scored from 3 of 11 items/);
  assert.match(r.band, /can only raise the total/);
});

test('mnihss 1 -> minor stroke', () => {
  const r = mnihss({ locQuestions: 1 });
  assert.equal(r.total, 1);
  assert.equal(r.severity, 'minor stroke');
});

test('mnihss 4 (upper edge of minor) -> minor stroke', () => {
  const r = mnihss({ locQuestions: 2, locCommands: 2 });
  assert.equal(r.total, 4);
  assert.equal(r.severity, 'minor stroke');
});

test('mnihss 5 (lower edge of moderate) -> moderate stroke', () => {
  const r = mnihss({ locQuestions: 2, locCommands: 2, gaze: 1 });
  assert.equal(r.total, 5);
  assert.equal(r.severity, 'moderate stroke');
});

test('mnihss 15 (upper edge of moderate) -> moderate stroke', () => {
  const r = mnihss({ motorArmL: 4, motorArmR: 4, motorLegL: 4, language: 3 });
  assert.equal(r.total, 15);
  assert.equal(r.severity, 'moderate stroke');
});

test('mnihss 20 (upper edge of moderate-severe) -> moderate-severe stroke', () => {
  const r = mnihss({ motorArmL: 4, motorArmR: 4, motorLegL: 4, motorLegR: 4, gaze: 2, language: 2 });
  assert.equal(r.total, 20);
  assert.equal(r.severity, 'moderate-severe stroke');
});

test('mnihss 21 (lower edge of severe) -> severe stroke', () => {
  const r = mnihss({ motorArmL: 4, motorArmR: 4, motorLegL: 4, motorLegR: 4, gaze: 2, language: 3 });
  assert.equal(r.total, 21);
  assert.equal(r.severity, 'severe stroke');
});

test('mnihss 31 (all maxima) -> severe stroke', () => {
  const r = mnihss({
    locQuestions: 2, locCommands: 2, gaze: 2, visualFields: 3,
    motorArmL: 4, motorArmR: 4, motorLegL: 4, motorLegR: 4,
    sensory: 1, language: 3, extinction: 2,
  });
  assert.equal(r.total, 31);
  assert.equal(r.severity, 'severe stroke');
});

test('mnihss rejects out-of-range item', () => {
  assert.throws(() => mnihss({ sensory: 2 }));
  assert.throws(() => mnihss({ motorArmL: 5 }));
});
