// spec-v486: Samilson-Prieto shoulder dislocation-arthropathy grading (mild/moderate/severe).
// Worked-example tests: each grade and its osteophyte-size description, alias input, invalid guard.
// Grades transcribed from Samilson & Prieto 1983 (J Bone Joint Surg Am) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { samilsonPrieto } from '../../lib/samilson-prieto-v486.js';

test('moderate: 3-7 mm osteophyte (the META example)', () => {
  const r = samilsonPrieto({ grade: 'moderate' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 'Moderate');
  assert.match(r.band, /an inferior osteophyte 3 to 7 mm/);
});

test('mild: osteophyte less than 3 mm', () => {
  assert.match(samilsonPrieto({ grade: 'mild' }).band, /less than 3 mm in size/);
});

test('severe: greater than 7 mm', () => {
  const r = samilsonPrieto({ grade: 'severe' });
  assert.equal(r.grade, 'Severe');
  assert.match(r.band, /greater than 7 mm, with glenohumeral joint-space narrowing/);
});

test('numeric and Roman aliases work', () => {
  assert.equal(samilsonPrieto({ grade: 1 }).grade, 'Mild');
  assert.equal(samilsonPrieto({ grade: 'III' }).grade, 'Severe');
});

test('a missing or unknown grade is invalid', () => {
  assert.equal(samilsonPrieto({}).valid, false);
  assert.equal(samilsonPrieto({ grade: 'none' }).valid, false);
});
