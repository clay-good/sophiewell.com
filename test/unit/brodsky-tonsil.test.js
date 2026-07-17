// spec-v388: Brodsky tonsil grading scale (grades 0-4). Worked-example tests: each grade and its
// oropharyngeal-width description, the obstructive flag on grades 3-4, numeric input, and the
// invalid-grade guard. Grades transcribed from Brodsky 1989 (Pediatr Clin North Am) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { brodskyTonsil } from '../../lib/brodsky-tonsil-v388.js';

test('grade 3: 50-75%, obstructive, flagged (the META example)', () => {
  const r = brodskyTonsil({ grade: '3' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, '3');
  assert.equal(r.obstructive, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /50-75%/);
});

test('grade 0: within the fossa, not obstructive', () => {
  const r = brodskyTonsil({ grade: '0' });
  assert.equal(r.obstructive, false);
  assert.match(r.band, /within the tonsillar fossa/);
});

test('grade 2: 25-50%, not obstructive', () => {
  const r = brodskyTonsil({ grade: '2' });
  assert.equal(r.obstructive, false);
  assert.match(r.band, /25-50%/);
});

test('grade 4: >75% kissing tonsils, obstructive', () => {
  const r = brodskyTonsil({ grade: '4' });
  assert.equal(r.obstructive, true);
  assert.match(r.band, /kissing tonsils/);
});

test('numeric input maps to the grades', () => {
  assert.equal(brodskyTonsil({ grade: 3 }).grade, '3');
  assert.equal(brodskyTonsil({ grade: 0 }).grade, '0');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(brodskyTonsil({}).valid, false);
  assert.equal(brodskyTonsil({ grade: '5' }).valid, false);
  assert.equal(brodskyTonsil({ grade: 'I' }).valid, false);
});
