// spec-v127 2.3: AKIN (Mehta 2007). Stage 1-3; RRT forces 3; worst of Cr and UO.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { akinAki } from '../../lib/nephro-v127.js';

test('creatinine x3.5 -> stage 3', () => {
  const r = akinAki({ baselineCr: 1.0, currentCr: 3.5 });
  assert.equal(r.valid, true);
  assert.equal(r.stage, 3);
});

test('RRT initiation forces stage 3', () => {
  const r = akinAki({ rrt: true });
  assert.equal(r.stage, 3);
  assert.match(r.band, /renal replacement therapy/);
});

test('absolute rise >= 0.3 mg/dL -> stage 1', () => {
  const r = akinAki({ baselineCr: 1.0, currentCr: 1.4 });
  assert.equal(r.stage, 1);
});

test('x2 -> stage 2', () => {
  assert.equal(akinAki({ baselineCr: 1.0, currentCr: 2.0 }).stage, 2);
});

test('nothing entered / scalar -> valid:false', () => {
  assert.equal(akinAki({}).valid, false);
  assert.equal(akinAki(9).valid, false);
});
