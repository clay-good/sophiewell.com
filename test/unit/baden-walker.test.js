// spec-v432: Baden-Walker prolapse grade (0-4).
// Worked-example tests: each grade and its examination description, and the invalid-grade guard.
// Grades transcribed from Baden & Walker 1972 (Clin Obstet Gynecol) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { badenWalker } from '../../lib/baden-walker-v432.js';

test('grade 2: descent to the hymen (the META example)', () => {
  const r = badenWalker({ grade: '2' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, '2');
  assert.match(r.band, /descent to the hymen/);
});

test('grade 0: normal position', () => {
  const r = badenWalker({ grade: '0' });
  assert.equal(r.grade, '0');
  assert.match(r.band, /normal position/);
});

test('grade 1: halfway to the hymen', () => {
  assert.match(badenWalker({ grade: '1' }).band, /halfway to the hymen/);
});

test('grade 3: halfway past the hymen', () => {
  assert.match(badenWalker({ grade: '3' }).band, /halfway past the hymen/);
});

test('grade 4: maximum descent, procidentia', () => {
  const r = badenWalker({ grade: '4' });
  assert.equal(r.grade, '4');
  assert.match(r.band, /procidentia/);
});

test('numeric input works and out-of-range is invalid', () => {
  assert.equal(badenWalker({ grade: 3 }).grade, '3');
  assert.equal(badenWalker({}).valid, false);
  assert.equal(badenWalker({ grade: '5' }).valid, false);
});
