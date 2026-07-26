// spec-v493: Lown grading of ventricular ectopy (grades 0-5, with the 4A/4B split).
// Worked-example tests: each grade and its ectopy description, lowercase subgrade input, invalid-grade guard.
// Grades transcribed from Lown and Wolf 1971 (Circulation) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lownEctopy } from '../../lib/lown-ectopy-v493.js';

test('grade 4B: salvos, a run of ventricular tachycardia (the META example)', () => {
  const r = lownEctopy({ grade: '4B' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, '4B');
  assert.match(r.band, /three or more consecutive ventricular ectopic beats/);
});

test('grade 0: no ventricular ectopic beats', () => {
  assert.match(lownEctopy({ grade: '0' }).band, /no ventricular ectopic beats/);
});

test('grades 1 and 2 split on the 30-per-hour frequency', () => {
  assert.match(lownEctopy({ grade: '1' }).band, /fewer than 30 per hour/);
  assert.match(lownEctopy({ grade: '2' }).band, /30 or more per hour/);
});

test('grade 3: multiform', () => {
  assert.match(lownEctopy({ grade: '3' }).band, /multiform \(polymorphic\)/);
});

test('grade 4A: couplets', () => {
  const r = lownEctopy({ grade: '4A' });
  assert.equal(r.grade, '4A');
  assert.match(r.band, /two consecutive ventricular ectopic beats/);
});

test('grade 5: the R-on-T phenomenon', () => {
  assert.match(lownEctopy({ grade: '5' }).band, /R-on-T phenomenon/);
});

test('a lowercase subgrade maps to the canonical grade', () => {
  assert.equal(lownEctopy({ grade: '4a' }).grade, '4A');
  assert.equal(lownEctopy({ grade: '4b' }).grade, '4B');
});

test('a numeric grade maps for the unsplit grades', () => {
  assert.equal(lownEctopy({ grade: 0 }).grade, '0');
  assert.equal(lownEctopy({ grade: 5 }).grade, '5');
});

test('a missing, ambiguous, or out-of-range grade is invalid', () => {
  assert.equal(lownEctopy({}).valid, false);
  assert.equal(lownEctopy({ grade: '4' }).valid, false);
  assert.equal(lownEctopy({ grade: '6' }).valid, false);
});
