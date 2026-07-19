// spec-v437: Goutallier grade of rotator cuff fatty infiltration (0-4).
// Worked-example tests: each grade and its fat-vs-muscle description, and the invalid-grade guard.
// Grades transcribed from Goutallier 1994 (Clin Orthop Relat Res) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { goutallier } from '../../lib/goutallier-v437.js';

test('grade 2: less fat than muscle (the META example)', () => {
  const r = goutallier({ grade: '2' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, '2');
  assert.match(r.band, /less fat than muscle/);
});

test('grade 0: normal, no fatty streaks', () => {
  const r = goutallier({ grade: '0' });
  assert.equal(r.grade, '0');
  assert.match(r.band, /no fatty streaks/);
});

test('grade 1: some fatty streaks', () => {
  assert.match(goutallier({ grade: '1' }).band, /some fatty streaks/);
});

test('grade 3: fat equals muscle', () => {
  assert.match(goutallier({ grade: '3' }).band, /fat equals muscle/);
});

test('grade 4: more fat than muscle', () => {
  const r = goutallier({ grade: '4' });
  assert.equal(r.grade, '4');
  assert.match(r.band, /more fat than muscle/);
});

test('numeric input works and out-of-range is invalid', () => {
  assert.equal(goutallier({ grade: 3 }).grade, '3');
  assert.equal(goutallier({}).valid, false);
  assert.equal(goutallier({ grade: '5' }).valid, false);
});
