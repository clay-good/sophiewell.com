// spec-v480: Ahlback knee osteoarthritis grading (grades I-V).
// Worked-example tests: each grade and its joint-space/attrition description, numeric input, invalid guard.
// Grades transcribed from Ahlback 1968 (Acta Radiol Diagn) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ahlbackKneeOa } from '../../lib/ahlback-knee-oa-v480.js';

test('grade III: minor bone attrition (the META example)', () => {
  const r = ahlbackKneeOa({ grade: 'III' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 'III');
  assert.match(r.band, /minor bone attrition \(0 to 5 mm of bone loss\)/);
});

test('grade I: joint-space narrowing', () => {
  assert.match(ahlbackKneeOa({ grade: 'I' }).band, /joint-space narrowing/);
});

test('grade II: joint-space obliteration', () => {
  assert.match(ahlbackKneeOa({ grade: 'II' }).band, /joint-space obliteration \(bone-to-bone/);
});

test('grade V: severe attrition', () => {
  const r = ahlbackKneeOa({ grade: 'V' });
  assert.equal(r.grade, 'V');
  assert.match(r.band, /more than 10 mm of bone loss/);
});

test('numeric input maps to the grades', () => {
  assert.equal(ahlbackKneeOa({ grade: 1 }).grade, 'I');
  assert.equal(ahlbackKneeOa({ grade: 5 }).grade, 'V');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(ahlbackKneeOa({}).valid, false);
  assert.equal(ahlbackKneeOa({ grade: 'VI' }).valid, false);
  assert.equal(ahlbackKneeOa({ grade: '0' }).valid, false);
});
