// spec-v797: WHO 2022 neuroendocrine neoplasm grade.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { nenWhoGrade } from '../../lib/nen-who-grade-v797.js';

test('both indices low -> NET G1', () => {
  const r = nenWhoGrade({ ki67: 1, mitoses: 1 });
  assert.equal(r.valid, true);
  assert.equal(r.entity, 'NET G1');
  assert.equal(r.grade, 1);
  assert.equal(r.abnormal, false);
});

test('the HIGHER index wins: Ki-67 of 25 with one mitosis is still G3', () => {
  const r = nenWhoGrade({ ki67: 25, mitoses: 1 });
  assert.equal(r.grade, 3);
  assert.equal(r.ki67Grade, 3);
  assert.equal(r.mitoticGrade, 1);
  assert.match(r.driver, /Ki-67 index drives the grade up/);
});

test('and it works the other way: 25 mitoses with a Ki-67 of 1 is still G3', () => {
  const r = nenWhoGrade({ ki67: 1, mitoses: 25 });
  assert.equal(r.grade, 3);
  assert.match(r.driver, /mitotic count drives the grade up/);
});

test('the Ki-67 boundaries are 3 and 20', () => {
  assert.equal(nenWhoGrade({ ki67: 2.9, mitoses: 0 }).grade, 1);
  assert.equal(nenWhoGrade({ ki67: 3, mitoses: 0 }).grade, 2);
  assert.equal(nenWhoGrade({ ki67: 20, mitoses: 0 }).grade, 2, 'exactly 20 is still G2');
  assert.equal(nenWhoGrade({ ki67: 20.1, mitoses: 0 }).grade, 3);
});

test('the mitotic boundaries are 2 and 20', () => {
  assert.equal(nenWhoGrade({ ki67: 0, mitoses: 1 }).grade, 1);
  assert.equal(nenWhoGrade({ ki67: 0, mitoses: 2 }).grade, 2);
  assert.equal(nenWhoGrade({ ki67: 0, mitoses: 20 }).grade, 2, 'exactly 20 is still G2');
  assert.equal(nenWhoGrade({ ki67: 0, mitoses: 21 }).grade, 3);
});

test('poor differentiation gives NEC and is not graded by these thresholds', () => {
  const r = nenWhoGrade({ ki67: 60, mitoses: 40, differentiation: 'poor' });
  assert.equal(r.entity, 'NEC');
  assert.equal(r.grade, null);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /small-cell or large-cell/);
});

test('either index alone is enough to grade', () => {
  assert.equal(nenWhoGrade({ ki67: 25 }).grade, 3);
  assert.equal(nenWhoGrade({ mitoses: 25 }).grade, 3);
  assert.equal(nenWhoGrade({}).valid, false);
});

test('out-of-range values and an unknown differentiation are rejected', () => {
  assert.equal(nenWhoGrade({ ki67: 101 }).field, 'ki67');
  assert.equal(nenWhoGrade({ mitoses: -1 }).field, 'mitoses');
  assert.equal(nenWhoGrade({ ki67: 5, differentiation: 'moderate' }).field, 'differentiation');
});
