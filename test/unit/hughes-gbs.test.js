// spec-v800: Hughes Functional Grading Scale.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { hughesGbs } from '../../lib/hughes-gbs-v800.js';

test('every grade 0 to 6 resolves and carries its own description', () => {
  const seen = new Set();
  for (let g = 0; g <= 6; g += 1) {
    const r = hughesGbs({ grade: g });
    assert.equal(r.valid, true, String(g));
    assert.equal(r.grade, g);
    assert.ok(r.description.length > 0, String(g));
    assert.ok(!seen.has(r.description), `grade ${g} must not repeat another grade`);
    seen.add(r.description);
  }
});

test('grade 3 is the disability threshold: 2 retains walking, 3 does not', () => {
  assert.equal(hughesGbs({ grade: 2 }).disabled, false);
  assert.equal(hughesGbs({ grade: 3 }).disabled, true);
  assert.match(hughesGbs({ grade: 2 }).band, /independent walking is retained/);
  assert.match(hughesGbs({ grade: 3 }).band, /independent walking is lost/);
});

test('ventilation is flagged from grade 5', () => {
  assert.equal(hughesGbs({ grade: 4 }).ventilated, false);
  assert.equal(hughesGbs({ grade: 5 }).ventilated, true);
  assert.equal(hughesGbs({ grade: 6 }).ventilated, true);
});

test('grade 6 does not get a walking sentence appended to it', () => {
  const r = hughesGbs({ grade: 6 });
  assert.match(r.band, /death\.$/);
  assert.doesNotMatch(r.band, /independent walking/);
});

test('the grade is required and bounded to 0 through 6', () => {
  assert.equal(hughesGbs({}).field, 'grade');
  assert.equal(hughesGbs({ grade: 7 }).valid, false);
  assert.equal(hughesGbs({ grade: -1 }).valid, false);
  assert.equal(hughesGbs({ grade: 2.5 }).valid, false);
  assert.equal(hughesGbs({ grade: '3' }).grade, 3, 'a string grade is accepted');
});
