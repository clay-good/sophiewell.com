// spec-v444: McCormick spinal-cord function grade (I-IV).
// Worked-example tests: each grade and its functional description, numeric input, and the invalid-grade guard.
// Grades transcribed from McCormick 1990 (J Neurosurg) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mccormick } from '../../lib/mccormick-v444.js';

test('grade II: deficit but independent (the META example)', () => {
  const r = mccormick({ grade: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 'II');
  assert.match(r.band, /functions and ambulates independently/);
});

test('grade I: intact, normal gait', () => {
  const r = mccormick({ grade: 'I' });
  assert.equal(r.grade, 'I');
  assert.match(r.band, /neurologically intact/);
});

test('grade III: needs a cane or brace', () => {
  assert.match(mccormick({ grade: 'III' }).band, /requires a cane or brace/);
});

test('grade IV: severe, wheelchair', () => {
  const r = mccormick({ grade: 'IV' });
  assert.equal(r.grade, 'IV');
  assert.match(r.band, /requires a wheelchair/);
});

test('numeric input maps to the grades', () => {
  assert.equal(mccormick({ grade: 1 }).grade, 'I');
  assert.equal(mccormick({ grade: 4 }).grade, 'IV');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(mccormick({}).valid, false);
  assert.equal(mccormick({ grade: 'V' }).valid, false);
  assert.equal(mccormick({ grade: '0' }).valid, false);
});
