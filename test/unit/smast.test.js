// spec-v737: Short Michigan Alcoholism Screening Test (SMAST).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { smast } from '../../lib/smast-v737.js';

const ITEMS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11', 'q12', 'q13'];
const all = (v) => Object.fromEntries(ITEMS.map((k) => [k, v]));
// "Healthy" answers score 0: yes on the reverse items (1,4,5), no on the rest.
const healthy = () => ({ ...all('no'), q1: 'yes', q4: 'yes', q5: 'yes' });

test('maximum: reverse items no + others yes -> 13, positive', () => {
  const r = smast({ ...all('yes'), q1: 'no', q4: 'no', q5: 'no' });
  assert.equal(r.valid, true);
  assert.equal(r.score, 13);
  assert.equal(r.tier, 'positive');
  assert.equal(r.abnormal, true);
});

test('worked example: total 4 -> positive', () => {
  const r = smast({ ...healthy(), q1: 'no', q2: 'yes', q3: 'yes', q5: 'no' }); // 1+1+1+1 = 4
  assert.equal(r.score, 4);
  assert.equal(r.tier, 'positive');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /SMAST 4 of 13 /);
});

test('the 3 cut: 2 borderline, 3 positive', () => {
  const two = smast({ ...healthy(), q1: 'no', q2: 'yes' }); // 2
  assert.equal(two.score, 2);
  assert.equal(two.tier, 'borderline');
  assert.equal(two.abnormal, false);
  const three = smast({ ...healthy(), q1: 'no', q2: 'yes', q3: 'yes' }); // 3
  assert.equal(three.score, 3);
  assert.equal(three.tier, 'positive');
  assert.equal(three.abnormal, true);
});

test('all healthy answers -> 0, no problem', () => {
  const r = smast(healthy());
  assert.equal(r.score, 0);
  assert.equal(r.tier, 'none');
  assert.equal(r.abnormal, false);
});

test('reverse-keying: items 1/4/5 score on "no", not "yes"', () => {
  // Isolate q1: "no" scores, "yes" does not (all other items healthy).
  assert.equal(smast({ ...healthy(), q1: 'no' }).score, 1);
  assert.equal(smast({ ...healthy(), q1: 'yes' }).score, 0);
  // Isolate a normal-keyed item q2: "yes" scores, "no" does not.
  assert.equal(smast({ ...healthy(), q2: 'yes' }).score, 1);
  assert.equal(smast({ ...healthy(), q2: 'no' }).score, 0);
  // All three reverse items answered "no" -> exactly 3 points.
  assert.equal(smast({ ...healthy(), q1: 'no', q4: 'no', q5: 'no' }).score, 3);
});

test('items require yes/no; all required', () => {
  assert.equal(smast({}).valid, false);
  assert.equal(smast({}).code, 'MISSING_INPUT');
  assert.equal(smast({ ...healthy(), q13: 'maybe' }).valid, false);
  assert.equal(smast({ ...healthy(), q13: '' }).field, 'q13');
});
