// spec-v701: SAD PERSONS scale for suicide risk.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { sadPersons } from '../../lib/sad-persons-v701.js';

test('no factors -> 0, lower risk', () => {
  const r = sadPersons({});
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.tier, 'lower');
  assert.equal(r.abnormal, false);
});

test('all ten -> 10, high risk', () => {
  const r = sadPersons({ maleSex: true, ageRisk: true, depression: true, previousAttempt: true, substanceUse: true, rationalThinkingLoss: true, lackingSupports: true, organizedPlan: true, noSpouse: true, sickness: true });
  assert.equal(r.score, 10);
  assert.equal(r.tier, 'high');
});

test('bands: 0-4 lower, 5-6 moderate, 7-10 high', () => {
  const four = sadPersons({ depression: true, previousAttempt: true, substanceUse: true, organizedPlan: true });
  assert.equal(four.score, 4);
  assert.equal(four.tier, 'lower');
  assert.equal(four.abnormal, false);
  const seven = sadPersons({ maleSex: true, ageRisk: true, depression: true, previousAttempt: true, substanceUse: true, organizedPlan: true, noSpouse: true });
  assert.equal(seven.score, 7);
  assert.equal(seven.tier, 'high');
});

test('worked example: depression + previous attempt + ethanol + plan + no spouse -> 5 (moderate)', () => {
  const r = sadPersons({ depression: 'true', previousAttempt: 'true', substanceUse: 'true', organizedPlan: 'true', noSpouse: 'true' });
  assert.equal(r.score, 5);
  assert.equal(r.tier, 'moderate');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /SAD PERSONS 5 of 10/);
});
