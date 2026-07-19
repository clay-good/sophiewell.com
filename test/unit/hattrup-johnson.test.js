// spec-v492: Hattrup-Johnson hallux rigidus grading (grades I-III).
// Worked-example tests: each grade and its osteophyte/joint-space description, numeric input, invalid guard.
// Grades transcribed from Hattrup and Johnson 1988 (Clin Orthop Relat Res) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hattrupJohnson } from '../../lib/hattrup-johnson-v492.js';

test('grade II: moderate (the META example)', () => {
  const r = hattrupJohnson({ grade: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 'II');
  assert.match(r.band, /dorsal, medial, and lateral osteophytes with joint-space narrowing/);
});

test('grade I: mild, preserved joint space', () => {
  assert.match(hattrupJohnson({ grade: 'I' }).band, /a dorsal osteophyte with a well-preserved joint space/);
});

test('grade III: severe, joint-space loss', () => {
  const r = hattrupJohnson({ grade: 'III' });
  assert.equal(r.grade, 'III');
  assert.match(r.band, /loss or obliteration of the joint space, often with subchondral cysts/);
});

test('numeric input maps to the grades', () => {
  assert.equal(hattrupJohnson({ grade: 1 }).grade, 'I');
  assert.equal(hattrupJohnson({ grade: 3 }).grade, 'III');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(hattrupJohnson({}).valid, false);
  assert.equal(hattrupJohnson({ grade: 'IV' }).valid, false);
  assert.equal(hattrupJohnson({ grade: '0' }).valid, false);
});
