// spec-v201 2.4: CLIP score worked examples spanning the survival strata.
// Child-Pugh 0/1/2 + morphology 0/1/2 + AFP 0/1 + PVT 0/1, total 0-6
// (spec-v97 cross-verified). Median survival by score: 0/1/2/3/4-6 = 36/22/9/7/3 mo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clip } from '../../lib/hepatology-gibleed-v201.js';

test('CLIP 0 -> best prognosis (~36 months)', () => {
  const r = clip({ childPugh: 'A', morphology: 'uni', afp: 100, pvt: false });
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /36 months/);
});

test('CLIP 4 -> poor prognosis (~3 months, worked example)', () => {
  const r = clip({ childPugh: 'B', morphology: 'multi', afp: 500, pvt: true });
  assert.equal(r.score, 4);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /3 months/);
});

test('CLIP 6 -> maximum score', () => {
  const r = clip({ childPugh: 'C', morphology: 'massive', afp: 500, pvt: true });
  assert.equal(r.score, 6);
});

test('CLIP 2 -> intermediate (~9 months)', () => {
  const r = clip({ childPugh: 'A', morphology: 'massive', afp: 100, pvt: false });
  assert.equal(r.score, 2);
  assert.match(r.band, /9 months/);
});

test('AFP threshold at 400 ng/mL', () => {
  const below = clip({ childPugh: 'A', morphology: 'uni', afp: 399, pvt: false });
  const at = clip({ childPugh: 'A', morphology: 'uni', afp: 400, pvt: false });
  assert.equal(below.score, 0);
  assert.equal(at.score, 1);
});

test('missing morphology -> complete-the-fields', () => {
  const r = clip({ childPugh: 'A', afp: 100, pvt: false });
  assert.equal(r.valid, false);
  assert.match(r.message, /morphology/);
});
