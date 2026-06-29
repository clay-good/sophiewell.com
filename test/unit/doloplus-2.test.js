// spec-v175 §2.3: DOLOPLUS-2 behavioural pain scale. 10 items 0-3 across somatic
// (0-15), psychomotor (0-6), psychosocial (0-9); total 0-30; >= 5 indicates pain.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { doloplus2 } from '../../lib/ltcga-v175.js';

const z = {
  somaticComplaints: 0, protectivePostureRest: 0, protectionSoreAreas: 0, facialExpression: 0, sleepPattern: 0,
  washingDressing: 0, mobility: 0, communication: 0, socialLife: 0, behaviorProblems: 0,
};

test('DOLOPLUS-2 0/30 (all absent) -> below threshold', () => {
  const r = doloplus2(z);
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(r.pain, false);
  assert.match(r.band, /below the pain threshold/);
});

test('DOLOPLUS-2 4->5 pain-threshold boundary', () => {
  const four = doloplus2({ ...z, somaticComplaints: 2, protectivePostureRest: 1, protectionSoreAreas: 1 });
  assert.equal(four.total, 4);
  assert.equal(four.pain, false);
  const five = doloplus2({ ...z, somaticComplaints: 2, protectivePostureRest: 1, protectionSoreAreas: 1, facialExpression: 1 });
  assert.equal(five.total, 5);
  assert.equal(five.pain, true);
  assert.match(five.band, /pain indicated/);
});

test('DOLOPLUS-2 domain subtotals add to the total', () => {
  const r = doloplus2({ ...z, somaticComplaints: 3, protectivePostureRest: 2, washingDressing: 2, mobility: 1, communication: 3 });
  assert.equal(r.somatic, 5);
  assert.equal(r.psychomotor, 3);
  assert.equal(r.psychosocial, 3);
  assert.equal(r.total, 11);
  assert.equal(r.somatic + r.psychomotor + r.psychosocial, r.total);
});

test('DOLOPLUS-2 30/30 (all severe) -> pain, subscale ceilings', () => {
  const all = {};
  for (const k of Object.keys(z)) all[k] = 3;
  const r = doloplus2(all);
  assert.equal(r.total, 30);
  assert.equal(r.somatic, 15);
  assert.equal(r.psychomotor, 6);
  assert.equal(r.psychosocial, 9);
  assert.equal(r.pain, true);
});

test('DOLOPLUS-2 rejects out-of-range and blank items', () => {
  assert.equal(doloplus2({ ...z, mobility: 4 }).valid, false);
  assert.equal(doloplus2({ ...z, mobility: '' }).valid, false);
  assert.equal(doloplus2({}).valid, false);
});
