// spec-v430: Papile grade of germinal matrix / IVH (grades I-IV).
// Worked-example tests: each grade and its imaging description, numeric input, and the invalid-grade guard.
// Grades transcribed from Papile 1978 (J Pediatr) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { papileIvh } from '../../lib/papile-ivh-v430.js';

test('grade III: IVH with ventricular dilatation (the META example)', () => {
  const r = papileIvh({ grade: 'III' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 'III');
  assert.match(r.band, /with ventricular dilatation/);
});

test('grade I: germinal matrix only', () => {
  const r = papileIvh({ grade: 'I' });
  assert.equal(r.grade, 'I');
  assert.match(r.band, /germinal matrix/);
});

test('grade II: IVH without ventricular dilatation', () => {
  assert.match(papileIvh({ grade: 'II' }).band, /without ventricular dilatation/);
});

test('grade IV: parenchymal extension', () => {
  const r = papileIvh({ grade: 'IV' });
  assert.equal(r.grade, 'IV');
  assert.match(r.band, /parenchymal .intraparenchymal. extension/);
});

test('numeric input maps to the grades', () => {
  assert.equal(papileIvh({ grade: 1 }).grade, 'I');
  assert.equal(papileIvh({ grade: 4 }).grade, 'IV');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(papileIvh({}).valid, false);
  assert.equal(papileIvh({ grade: 'V' }).valid, false);
  assert.equal(papileIvh({ grade: '0' }).valid, false);
});
