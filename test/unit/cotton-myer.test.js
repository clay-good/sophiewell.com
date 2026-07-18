// spec-v419: Myer-Cotton grading of subglottic stenosis (grades I/II/III/IV).
// Worked-example tests: each grade and its percent-obstruction description, numeric input, and the
// invalid-grade guard. Grades transcribed from Myer-Cotton 1994 (Ann Otol Rhinol Laryngol) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cottonMyer } from '../../lib/cotton-myer-v419.js';

test('grade II: 51-70% obstruction (the META example)', () => {
  const r = cottonMyer({ grade: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 'II');
  assert.match(r.band, /51% to 70% obstruction of the subglottic lumen/);
});

test('grade I: up to 50% obstruction', () => {
  const r = cottonMyer({ grade: 'I' });
  assert.equal(r.grade, 'I');
  assert.match(r.band, /0% to 50% obstruction/);
});

test('grade III: 71-99% obstruction', () => {
  assert.match(cottonMyer({ grade: 'III' }).band, /71% to 99% obstruction/);
});

test('grade IV: no detectable lumen', () => {
  const r = cottonMyer({ grade: 'IV' });
  assert.equal(r.grade, 'IV');
  assert.match(r.band, /no detectable lumen/);
});

test('numeric input maps to the grades', () => {
  assert.equal(cottonMyer({ grade: 1 }).grade, 'I');
  assert.equal(cottonMyer({ grade: 4 }).grade, 'IV');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(cottonMyer({}).valid, false);
  assert.equal(cottonMyer({ grade: 'V' }).valid, false);
  assert.equal(cottonMyer({ grade: '0' }).valid, false);
});
