// spec-v435: Van Herick angle grade (0-4).
// Worked-example tests: each grade and its PACD:CT description, and the invalid-grade guard.
// Grades transcribed from Van Herick 1969 (Am J Ophthalmol) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vanHerick } from '../../lib/van-herick-v435.js';

test('grade 2: 1/4 CT, closure possible (the META example)', () => {
  const r = vanHerick({ grade: '2' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, '2');
  assert.match(r.band, /angle closure possible/);
});

test('grade 0: angle closed', () => {
  const r = vanHerick({ grade: '0' });
  assert.equal(r.grade, '0');
  assert.match(r.band, /angle closed/);
});

test('grade 1: closure likely', () => {
  assert.match(vanHerick({ grade: '1' }).band, /angle closure likely/);
});

test('grade 3: closure unlikely', () => {
  assert.match(vanHerick({ grade: '3' }).band, /angle closure unlikely/);
});

test('grade 4: wide open', () => {
  const r = vanHerick({ grade: '4' });
  assert.equal(r.grade, '4');
  assert.match(r.band, /angle wide open/);
});

test('numeric input works and out-of-range is invalid', () => {
  assert.equal(vanHerick({ grade: 3 }).grade, '3');
  assert.equal(vanHerick({}).valid, false);
  assert.equal(vanHerick({ grade: '5' }).valid, false);
});
