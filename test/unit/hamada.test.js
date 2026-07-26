// spec-v439: Hamada grade of cuff tear arthropathy (1-5).
// Worked-example tests: each grade and its radiographic description, and the invalid-grade guard.
// Grades transcribed from Hamada 1990 (Clin Orthop Relat Res) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hamada } from '../../lib/hamada-v439.js';

test('grade 1: AHI 6 mm or more (the META example)', () => {
  const r = hamada({ grade: '1' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, '1');
  assert.match(r.band, /acromiohumeral interval \(AHI\) 6 mm or more/);
});

test('grade 2: AHI 5 mm or less', () => {
  const r = hamada({ grade: '2' });
  assert.equal(r.grade, '2');
  assert.match(r.band, /5 mm or less/);
});

test('grade 3: acetabularization', () => {
  assert.match(hamada({ grade: '3' }).band, /acetabularization of the acromion/);
});

test('grade 4: glenohumeral arthritis', () => {
  assert.match(hamada({ grade: '4' }).band, /glenohumeral joint narrowing/);
});

test('grade 5: humeral head collapse', () => {
  const r = hamada({ grade: '5' });
  assert.equal(r.grade, '5');
  assert.match(r.band, /humeral head collapse/);
});

test('numeric input works and out-of-range is invalid', () => {
  assert.equal(hamada({ grade: 3 }).grade, '3');
  assert.equal(hamada({}).valid, false);
  assert.equal(hamada({ grade: '6' }).valid, false);
});
