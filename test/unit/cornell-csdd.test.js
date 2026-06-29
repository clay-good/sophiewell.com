// spec-v174 §2.3: Cornell Scale for Depression in Dementia. 19 items a/0/1/2,
// total 0-38; > 10 probable, > 18 definite major depression. 'a' (unable to
// evaluate) contributes 0 and is reported as unrated.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cornellCsdd } from '../../lib/ltcga-v174.js';

const KEYS = ['anxiety', 'sadness', 'noReactivity', 'irritability', 'agitation', 'retardation', 'physicalComplaints', 'lossOfInterest', 'appetiteLoss', 'weightLoss', 'lackOfEnergy', 'diurnalVariation', 'difficultyFallingAsleep', 'multipleAwakenings', 'earlyAwakening', 'suicide', 'selfDepreciation', 'pessimism', 'delusions'];
// Distribute a target total T across the 19 items (each 0-2), rest 0.
function buildTotal(T) {
  const o = {};
  let rem = T;
  for (const k of KEYS) { const v = Math.min(2, rem); o[k] = v; rem -= v; }
  return o;
}

test('Cornell CSDD 0/38 (all absent) -> no significant depressive symptoms', () => {
  const r = cornellCsdd(buildTotal(0));
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.match(r.band, /no significant depressive symptoms/);
});

test('Cornell CSDD 10 -> some symptoms and 11 -> probable (the > 10 flip)', () => {
  const ten = cornellCsdd(buildTotal(10));
  assert.equal(ten.total, 10);
  assert.match(ten.band, /some depressive symptoms/);
  const eleven = cornellCsdd(buildTotal(11));
  assert.equal(eleven.total, 11);
  assert.match(eleven.band, /probable major depression/);
});

test('Cornell CSDD 18 -> probable and 19 -> definite (the > 18 flip)', () => {
  const eighteen = cornellCsdd(buildTotal(18));
  assert.equal(eighteen.total, 18);
  assert.match(eighteen.band, /probable major depression/);
  const nineteen = cornellCsdd(buildTotal(19));
  assert.equal(nineteen.total, 19);
  assert.match(nineteen.band, /definite major depression/);
});

test('Cornell CSDD 38/38 (all severe) -> definite', () => {
  const r = cornellCsdd(buildTotal(38));
  assert.equal(r.total, 38);
  assert.match(r.band, /definite major depression/);
});

test('Cornell CSDD: "a" (unable to evaluate) contributes 0 and is reported as unrated', () => {
  const o = buildTotal(0);
  o.anxiety = 'a';
  o.sadness = 'a';
  const r = cornellCsdd(o);
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(r.unrated, 2);
  assert.match(r.detail, /2 of 19 items marked unable to evaluate/);
});

test('Cornell CSDD rejects out-of-range and blank items', () => {
  const o = buildTotal(0);
  o.anxiety = 3;
  assert.equal(cornellCsdd(o).valid, false);
  const b = buildTotal(0); b.anxiety = '';
  assert.equal(cornellCsdd(b).valid, false);
  assert.equal(cornellCsdd({}).valid, false);
});
