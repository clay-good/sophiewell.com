// spec-v420: Friedman tongue position (grades I/II/III/IV).
// Worked-example tests: each grade and its visualization description, numeric input, and the invalid-grade
// guard. Grades transcribed from Friedman 2002 (Otolaryngol Head Neck Surg) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { friedmanTongue } from '../../lib/friedman-tongue-v420.js';

test('grade II: uvula but not tonsils (the META example)', () => {
  const r = friedmanTongue({ grade: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 'II');
  assert.match(r.band, /visualize the uvula but not the tonsils/);
});

test('grade I: entire uvula and tonsils', () => {
  const r = friedmanTongue({ grade: 'I' });
  assert.equal(r.grade, 'I');
  assert.match(r.band, /the entire uvula and the tonsils/);
});

test('grade III: soft palate but not uvula', () => {
  assert.match(friedmanTongue({ grade: 'III' }).band, /the soft palate but not the uvula/);
});

test('grade IV: only the hard palate', () => {
  const r = friedmanTongue({ grade: 'IV' });
  assert.equal(r.grade, 'IV');
  assert.match(r.band, /only the hard palate/);
});

test('numeric input maps to the grades', () => {
  assert.equal(friedmanTongue({ grade: 1 }).grade, 'I');
  assert.equal(friedmanTongue({ grade: 4 }).grade, 'IV');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(friedmanTongue({}).valid, false);
  assert.equal(friedmanTongue({ grade: 'V' }).valid, false);
  assert.equal(friedmanTongue({ grade: '0' }).valid, false);
});
