// spec-v390: Knosp grading of cavernous sinus invasion by a pituitary adenoma (grades 0-4).
// Worked-example tests: each grade and its ICA-landmark description, the invasion flag on 3-4, numeric +
// 3a/3b input, and the invalid-grade guard. Grades transcribed from Knosp 1993 (Neurosurgery) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { knospAdenoma } from '../../lib/knosp-adenoma-v390.js';

test('grade 4: total ICA encasement, invasion, flagged (the META example)', () => {
  const r = knospAdenoma({ grade: '4' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, '4');
  assert.equal(r.cavernousInvasion, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /total encasement/);
});

test('grade 0: medial to the medial tangent, no invasion', () => {
  const r = knospAdenoma({ grade: '0' });
  assert.equal(r.cavernousInvasion, false);
  assert.match(r.band, /medial to the medial tangent/);
});

test('grade 2: to the lateral tangent, not flagged', () => {
  const r = knospAdenoma({ grade: '2' });
  assert.equal(r.cavernousInvasion, false);
  assert.match(r.band, /lateral tangent/);
});

test('grade 3: lateral to the lateral tangent, invasion likely, flagged', () => {
  const r = knospAdenoma({ grade: '3' });
  assert.equal(r.cavernousInvasion, true);
  assert.match(r.band, /lateral to the lateral tangent/);
});

test('numeric and 3a/3b input map to the grades', () => {
  assert.equal(knospAdenoma({ grade: 4 }).grade, '4');
  assert.equal(knospAdenoma({ grade: 0 }).grade, '0');
  assert.equal(knospAdenoma({ grade: '3a' }).grade, '3');
  assert.equal(knospAdenoma({ grade: '3B' }).grade, '3');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(knospAdenoma({}).valid, false);
  assert.equal(knospAdenoma({ grade: '5' }).valid, false);
  assert.equal(knospAdenoma({ grade: 'I' }).valid, false);
});
