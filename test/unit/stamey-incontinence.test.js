// spec-v465: Stamey stress-incontinence grading (grades 1-3).
// Worked-example tests: each grade and its provoking-stress description, alias input, invalid-grade guard.
// Grades transcribed from Stamey 1980 (Ann Surg) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stameyIncontinence } from '../../lib/stamey-incontinence-v465.js';

test('grade 2: lesser stress (the META example)', () => {
  const r = stameyIncontinence({ grade: 2 });
  assert.equal(r.valid, true);
  assert.equal(r.grade, '2');
  assert.match(r.band, /lesser degrees of stress \(walking, standing erect, or sitting up in bed\)/);
});

test('grade 1: sudden increases in abdominal pressure', () => {
  assert.match(stameyIncontinence({ grade: 1 }).band, /sudden increases in intra-abdominal pressure/);
});

test('grade 3: total, continuous incontinence', () => {
  const r = stameyIncontinence({ grade: 3 });
  assert.equal(r.grade, '3');
  assert.match(r.band, /total \(continuous\) incontinence/);
});

test('Roman-numeral alias maps to the grades', () => {
  assert.equal(stameyIncontinence({ grade: 'I' }).grade, '1');
  assert.equal(stameyIncontinence({ grade: 'III' }).grade, '3');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(stameyIncontinence({}).valid, false);
  assert.equal(stameyIncontinence({ grade: 4 }).valid, false);
  assert.equal(stameyIncontinence({ grade: '0' }).valid, false);
});
