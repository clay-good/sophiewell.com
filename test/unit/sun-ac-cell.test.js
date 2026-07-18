// spec-v421: SUN anterior chamber cell grade (0/0.5+/1+/2+/3+/4+).
// Worked-example tests: each grade and its cell-count range, alias input, and the invalid-grade guard.
// Grades transcribed from the SUN Working Group 2005 (Am J Ophthalmol) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sunAcCell } from '../../lib/sun-ac-cell-v421.js';

test('grade 1+: 6 to 15 cells (the META example)', () => {
  const r = sunAcCell({ grade: '1+' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, '1+');
  assert.match(r.band, /6 to 15 cells/);
});

test('grade 0: less than 1 cell', () => {
  const r = sunAcCell({ grade: '0' });
  assert.equal(r.grade, '0');
  assert.match(r.band, /less than 1 cell/);
});

test('grade 0.5+: 1 to 5 cells', () => {
  assert.match(sunAcCell({ grade: '0.5+' }).band, /1 to 5 cells/);
});

test('grade 3+: 26 to 50 cells', () => {
  assert.match(sunAcCell({ grade: '3+' }).band, /26 to 50 cells/);
});

test('grade 4+: more than 50 cells', () => {
  const r = sunAcCell({ grade: '4+' });
  assert.equal(r.grade, '4+');
  assert.match(r.band, /more than 50 cells/);
});

test('aliases: bare numbers and "trace" map to the grades', () => {
  assert.equal(sunAcCell({ grade: '2' }).grade, '2+');
  assert.equal(sunAcCell({ grade: 'trace' }).grade, '0.5+');
  assert.equal(sunAcCell({ grade: '.5' }).grade, '0.5+');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(sunAcCell({}).valid, false);
  assert.equal(sunAcCell({ grade: '5+' }).valid, false);
  assert.equal(sunAcCell({ grade: 'X' }).valid, false);
});
