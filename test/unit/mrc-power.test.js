// spec-v428: MRC muscle-power grade (0-5).
// Worked-example tests: each grade and its examination description, and the invalid-grade guard.
// Grades transcribed from the MRC 1976 memorandum / Compston 2010 (Brain) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mrcPower } from '../../lib/mrc-power-v428.js';

test('grade 3: active movement against gravity (the META example)', () => {
  const r = mrcPower({ grade: '3' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, '3');
  assert.match(r.band, /active movement against gravity/);
});

test('grade 0: no contraction', () => {
  const r = mrcPower({ grade: '0' });
  assert.equal(r.grade, '0');
  assert.match(r.band, /no contraction/);
});

test('grade 1: a flicker or trace', () => {
  assert.match(mrcPower({ grade: '1' }).band, /flicker or trace/);
});

test('grade 2: gravity eliminated', () => {
  assert.match(mrcPower({ grade: '2' }).band, /gravity eliminated/);
});

test('grade 4: against gravity and resistance', () => {
  assert.match(mrcPower({ grade: '4' }).band, /against gravity and resistance/);
});

test('grade 5: normal power', () => {
  const r = mrcPower({ grade: '5' });
  assert.equal(r.grade, '5');
  assert.match(r.band, /normal power/);
});

test('numeric input works and out-of-range is invalid', () => {
  assert.equal(mrcPower({ grade: 4 }).grade, '4');
  assert.equal(mrcPower({}).valid, false);
  assert.equal(mrcPower({ grade: '6' }).valid, false);
  assert.equal(mrcPower({ grade: '4+' }).valid, false);
});
