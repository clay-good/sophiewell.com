// spec-v476: Nash-Moe vertebral rotation grading (grades 0-4).
// Worked-example tests: each grade and its pedicle-position description, and the invalid-grade guard.
// Grades transcribed from Nash & Moe 1969 (J Bone Joint Surg Am) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nashMoeRotation } from '../../lib/nash-moe-rotation-v476.js';

test('grade 2: convex pedicle in the middle third (the META example)', () => {
  const r = nashMoeRotation({ grade: 2 });
  assert.equal(r.valid, true);
  assert.equal(r.grade, '2');
  assert.match(r.band, /lies within the middle third of the vertebral body/);
});

test('grade 0: symmetric pedicles', () => {
  assert.match(nashMoeRotation({ grade: 0 }).band, /both pedicles are symmetric; no rotation/);
});

test('grade 3: convex pedicle central', () => {
  assert.match(nashMoeRotation({ grade: 3 }).band, /central segment of the vertebral body/);
});

test('grade 4: convex pedicle past the midline', () => {
  const r = nashMoeRotation({ grade: 4 });
  assert.equal(r.grade, '4');
  assert.match(r.band, /migrated past the midline/);
});

test('numeric and string input both work', () => {
  assert.equal(nashMoeRotation({ grade: 1 }).grade, '1');
  assert.equal(nashMoeRotation({ grade: '4' }).grade, '4');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(nashMoeRotation({}).valid, false);
  assert.equal(nashMoeRotation({ grade: 5 }).valid, false);
  assert.equal(nashMoeRotation({ grade: 'I' }).valid, false);
});
