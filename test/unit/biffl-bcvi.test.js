// spec-v436: Biffl BCVI grade (I-V).
// Worked-example tests: each grade and its angiographic description, numeric input, and the invalid-grade guard.
// Grades transcribed from Biffl 1999 (J Trauma) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bifflBcvi } from '../../lib/biffl-bcvi-v436.js';

test('grade III: pseudoaneurysm (the META example)', () => {
  const r = bifflBcvi({ grade: 'III' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 'III');
  assert.match(r.band, /pseudoaneurysm/);
});

test('grade I: irregularity, <25% narrowing', () => {
  const r = bifflBcvi({ grade: 'I' });
  assert.equal(r.grade, 'I');
  assert.match(r.band, /less than 25% luminal narrowing/);
});

test('grade II: dissection, >=25% narrowing', () => {
  assert.match(bifflBcvi({ grade: 'II' }).band, /25% or more luminal narrowing/);
});

test('grade IV: occlusion', () => {
  assert.match(bifflBcvi({ grade: 'IV' }).band, /occlusion/);
});

test('grade V: transection with extravasation', () => {
  const r = bifflBcvi({ grade: 'V' });
  assert.equal(r.grade, 'V');
  assert.match(r.band, /transection with free extravasation/);
});

test('numeric input maps to the grades', () => {
  assert.equal(bifflBcvi({ grade: 1 }).grade, 'I');
  assert.equal(bifflBcvi({ grade: 5 }).grade, 'V');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(bifflBcvi({}).valid, false);
  assert.equal(bifflBcvi({ grade: 'VI' }).valid, false);
  assert.equal(bifflBcvi({ grade: '0' }).valid, false);
});
