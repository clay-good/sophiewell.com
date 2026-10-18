// spec-v1634 tools 22, 23 and 24, built from verified reprints (owner's rule, October 17, 2026).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dipsInteraction as dips, QUESTIONS } from '../../lib/dips-interaction-v1634.js';
import { maiScore as mai, CRITERIA } from '../../lib/mai-score-v1634.js';
import { sedativeLoad as sl } from '../../lib/sedative-load-v1634.js';

test('DIPS reproduces the totals the reprints report for their own cases', () => {
  // Fan 2024 (PMC10720802): +1 +1 +1 +1, dechallenge NA (6 skipped), alternatives no (+1), 8 no, 9 no, 10 yes -> +6.
  assert.equal(dips({ reports: 'yes', precipitant: 'yes', object: 'yes', timeCourse: 'yes', dechallenge: 'unknown', alternatives: 'no', levels: 'no', objective: 'no', doseResponse: 'yes' }).score, 6);
  // van Dijk 2024 (PMC11383621) case 3: 0 +1 +1 +1 +1 +2 0 0 +1 +1 -> 8.
  assert.equal(dips({ reports: 'unknown', precipitant: 'yes', object: 'yes', timeCourse: 'yes', dechallenge: 'yes', rechallenge: 'yes', alternatives: 'unknown', levels: 'unknown', objective: 'yes', doseResponse: 'yes' }).score, 8);
});

test('DIPS range is -9 to +11 and the bands sit at 2, 5 and 9', () => {
  const pick = (hi) => Object.fromEntries(QUESTIONS.map(([k, , y, n]) => [k, (y > n) === hi ? 'yes' : 'no']));
  assert.equal(dips(pick(true)).score, 11);
  assert.equal(dips(pick(true)).category, 'highly probable');
  assert.equal(dips(pick(false)).score, -9);
  assert.equal(dips(pick(false)).category, 'doubtful');
  assert.equal(dips({ ...pick(true), rechallenge: undefined }).valid, false, 'rechallenge is asked for after a dechallenge');
});

test('MAI: weights total 18; only an inappropriate rating scores', () => {
  assert.equal(CRITERIA.reduce((s, [, , w]) => s + w, 0), 18);
  const A = Object.fromEntries(CRITERIA.map(([k]) => [k, 'appropriate']));
  assert.equal(mai(A).score, 0);
  assert.equal(mai({ ...A, directionsPractical: 'inappropriate' }).score, 1, 'practical directions weighs 1');
  assert.equal(mai({ ...A, interactionsDisease: 'inappropriate' }).score, 2, 'drug-disease interactions weigh 2');
  assert.equal(mai({ ...A, indication: 'marginal' }).score, 0);
  assert.equal(mai({ ...A, indication: 'inappropriate', otherScores: '4\n0' }).regimenScore, 7);
  assert.equal(mai({ indication: 'appropriate' }).valid, false);
});

test('sedative load: 2 per group 1 drug and 1 per group 2 drug', () => {
  assert.equal(sl({ group1: '1', group2: '2' }).load, 4);
  assert.equal(sl({ group1: '0', group2: '0' }).load, 0);
  assert.equal(sl({ group1: '1.5', group2: '0' }).valid, false);
  assert.equal(sl({ group1: '', group2: '1' }).valid, false);
});
