// spec-v1634 tool 25: GerontoNet ADR risk score, Onder 2010 Table 2 (read in full October 17, 2026).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gerontonetAdrRisk as gn } from '../../lib/gerontonet-adr-risk-v1634.js';

const none = { previousAdr: 'no', comorbidities: 'no', heartFailure: 'no', liverDisease: 'no', renalFailure: 'no' };
const all = { previousAdr: 'yes', comorbidities: 'yes', heartFailure: 'yes', liverDisease: 'yes', renalFailure: 'yes' };

test('Table 2 points: drugs 0 / 1 / 4, previous ADR 2, every other item 1, range 0 to 10', () => {
  assert.equal(gn({ ...none, drugs: '4' }).score, 0);
  assert.equal(gn({ ...none, drugs: '6' }).score, 1);
  assert.equal(gn({ ...none, drugs: '8' }).score, 4);
  assert.equal(gn({ ...all, drugs: '12' }).score, 10);
  assert.equal(gn({ ...none, drugs: '2', previousAdr: 'yes' }).score, 2);
});

test('exactly 5 drugs is reported both ways: the tables print "<=5" and "5-7", the text "<5"', () => {
  const r = gn({ ...none, drugs: '5', renalFailure: 'yes' });
  assert.equal(r.ambiguous, true);
  assert.deepEqual([r.scoreLow, r.scoreHigh], [1, 2]);
  assert.equal(r.score, undefined);
});

test('the result carries the validation band and the authors\' cut point between 3 and 4', () => {
  const r = gn({ ...none, drugs: '9', comorbidities: 'yes', renalFailure: 'yes' });
  assert.equal(r.score, 6);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /11\.5% at 6 to 7/);
  assert.equal(gn({ ...none, drugs: '3', heartFailure: 'yes' }).abnormal, false);
});

test('an unanswered item is asked for, never read as no', () => {
  const r = gn({ drugs: '9', previousAdr: 'yes' });
  assert.equal(r.valid, false);
  assert.match(r.message, /^Answer yes or no for/);
  assert.equal(gn({ ...none }).valid, false, 'no drug count');
  assert.equal(gn({ ...none, drugs: '2.5' }).valid, false);
});
