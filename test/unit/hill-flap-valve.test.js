// spec-v392: Hill classification of the gastroesophageal flap valve (grades I-IV). Worked-example tests:
// each grade and its ridge/valve description, the abnormal-valve flag on III-IV, roman + numeric input,
// and the invalid-grade guard. Grades transcribed from Hill 1996 (Gastrointest Endosc) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hillFlapValve } from '../../lib/hill-flap-valve-v392.js';

test('grade III: diminished ridge, fails to close, flagged (the META example)', () => {
  const r = hillFlapValve({ grade: 'III' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 'III');
  assert.equal(r.abnormalValve, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /fails to close/);
  assert.match(r.band, /hiatal hernia/);
});

test('grade I: prominent ridge, normal, not flagged', () => {
  const r = hillFlapValve({ grade: 'I' });
  assert.equal(r.abnormalValve, false);
  assert.match(r.band, /prominent ridge/);
});

test('grade II: less pronounced ridge, not flagged', () => {
  const r = hillFlapValve({ grade: 'II' });
  assert.equal(r.abnormalValve, false);
  assert.match(r.band, /may open with respiration/);
});

test('grade IV: no ridge, junction open, flagged', () => {
  const r = hillFlapValve({ grade: 'IV' });
  assert.equal(r.abnormalValve, true);
  assert.match(r.band, /no ridge/);
});

test('numeric input maps to the grades', () => {
  assert.equal(hillFlapValve({ grade: 3 }).grade, 'III');
  assert.equal(hillFlapValve({ grade: '1' }).grade, 'I');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(hillFlapValve({}).valid, false);
  assert.equal(hillFlapValve({ grade: 'V' }).valid, false);
  assert.equal(hillFlapValve({ grade: '0' }).valid, false);
});
