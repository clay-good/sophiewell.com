// spec-v470: Larsen RA radiographic grading (grades 0-5).
// Worked-example tests: each grade and its radiographic-damage description, Roman-numeral alias, invalid guard.
// Grades transcribed from Larsen, Dale & Eek 1977 (Acta Radiol Diagn) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { larsenRa } from '../../lib/larsen-ra-v470.js';

test('grade 2: definite early abnormality (the META example)', () => {
  const r = larsenRa({ grade: 2 });
  assert.equal(r.valid, true);
  assert.equal(r.grade, '2');
  assert.match(r.band, /definite early abnormality: erosion and joint-space narrowing/);
});

test('grade 0: normal', () => {
  assert.match(larsenRa({ grade: 0 }).band, /normal; intact bony outlines/);
});

test('grade 3: medium destructive', () => {
  assert.match(larsenRa({ grade: 3 }).band, /medium destructive abnormality/);
});

test('grade 5: mutilating', () => {
  const r = larsenRa({ grade: 5 });
  assert.equal(r.grade, '5');
  assert.match(r.band, /mutilating abnormality/);
});

test('Roman-numeral alias maps to grades 1-5', () => {
  assert.equal(larsenRa({ grade: 'I' }).grade, '1');
  assert.equal(larsenRa({ grade: 'V' }).grade, '5');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(larsenRa({}).valid, false);
  assert.equal(larsenRa({ grade: 6 }).valid, false);
  assert.equal(larsenRa({ grade: 'VI' }).valid, false);
});
