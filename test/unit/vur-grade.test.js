// spec-v425: vesicoureteral reflux grade (VCUG), grades I-V.
// Worked-example tests: each grade and its imaging description, numeric input, and the invalid-grade guard.
// Grades transcribed from the International Reflux Study Committee 1981 (Pediatrics) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vurGrade } from '../../lib/vur-grade-v425.js';

test('grade III: mild to moderate dilatation (the META example)', () => {
  const r = vurGrade({ grade: 'III' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 'III');
  assert.match(r.band, /mild to moderate dilatation/);
});

test('grade I: ureter only', () => {
  const r = vurGrade({ grade: 'I' });
  assert.equal(r.grade, 'I');
  assert.match(r.band, /ureter only/);
});

test('grade II: up to the renal pelvis, no dilatation', () => {
  assert.match(vurGrade({ grade: 'II' }).band, /up to the renal pelvis, no dilatation/);
});

test('grade IV: moderate dilatation and tortuosity', () => {
  assert.match(vurGrade({ grade: 'IV' }).band, /moderate dilatation and tortuosity/);
});

test('grade V: gross dilatation, intrarenal reflux', () => {
  const r = vurGrade({ grade: 'V' });
  assert.equal(r.grade, 'V');
  assert.match(r.band, /intrarenal reflux/);
});

test('numeric input maps to the grades', () => {
  assert.equal(vurGrade({ grade: 1 }).grade, 'I');
  assert.equal(vurGrade({ grade: 5 }).grade, 'V');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(vurGrade({}).valid, false);
  assert.equal(vurGrade({ grade: 'VI' }).valid, false);
  assert.equal(vurGrade({ grade: '0' }).valid, false);
});
