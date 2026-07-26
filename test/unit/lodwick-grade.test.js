// spec-v496: Lodwick grading of bone-lesion aggressiveness (grades IA, IB, IC, II, III).
// Worked-example tests: each grade, the geographic/moth-eaten split, alias input, invalid-grade guard.
// Grades transcribed from Lodwick and colleagues 1980 (Radiology) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lodwickGrade } from '../../lib/lodwick-grade-v496.js';

test('grade IC: geographic with an ill-defined margin (the META example)', () => {
  const r = lodwickGrade({ grade: 'IC' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 'IC');
  assert.match(r.band, /a geographic lesion with an ill-defined margin/);
});

test('the grade I margins run sclerotic to ill-defined', () => {
  assert.match(lodwickGrade({ grade: 'IA' }).band, /a sclerotic margin/);
  assert.match(lodwickGrade({ grade: 'IB' }).band, /well-defined margin but no sclerotic rim/);
  assert.match(lodwickGrade({ grade: 'IC' }).band, /an ill-defined margin/);
});

test('grade II is the combined pattern', () => {
  assert.match(lodwickGrade({ grade: 'II' }).band, /moth-eaten or permeative areas: a combined pattern/);
});

test('grade III has no geographic component', () => {
  const r = lodwickGrade({ grade: 'III' });
  assert.equal(r.grade, 'III');
  assert.match(r.band, /no geographic component/);
});

test('lowercase and arabic aliases map to the canonical grades', () => {
  assert.equal(lodwickGrade({ grade: 'ia' }).grade, 'IA');
  assert.equal(lodwickGrade({ grade: '1c' }).grade, 'IC');
  assert.equal(lodwickGrade({ grade: 3 }).grade, 'III');
});

test('a missing, bare-I, or out-of-range grade is invalid', () => {
  assert.equal(lodwickGrade({}).valid, false);
  assert.equal(lodwickGrade({ grade: 'I' }).valid, false);
  assert.equal(lodwickGrade({ grade: 'IV' }).valid, false);
});
