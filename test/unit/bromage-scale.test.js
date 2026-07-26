// spec-v467: Bromage neuraxial motor-block scale (grades I-IV).
// Worked-example tests: each grade and its residual-movement description, numeric input, invalid-grade guard.
// Grades transcribed from Bromage 1965/1978 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bromageScale } from '../../lib/bromage-scale-v467.js';

test('grade II: partial (the META example)', () => {
  const r = bromageScale({ grade: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 'II');
  assert.match(r.band, /partial: just able to flex the knees/);
});

test('grade I: nil (no motor block)', () => {
  assert.match(bromageScale({ grade: 'I' }).band, /nil: free flexion of the knees and feet/);
});

test('grade III: almost complete', () => {
  assert.match(bromageScale({ grade: 'III' }).band, /almost complete: unable to flex the knees/);
});

test('grade IV: complete', () => {
  const r = bromageScale({ grade: 'IV' });
  assert.equal(r.grade, 'IV');
  assert.match(r.band, /complete: unable to move the legs or feet/);
});

test('numeric input maps to the grades', () => {
  assert.equal(bromageScale({ grade: 1 }).grade, 'I');
  assert.equal(bromageScale({ grade: 4 }).grade, 'IV');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(bromageScale({}).valid, false);
  assert.equal(bromageScale({ grade: 'V' }).valid, false);
  assert.equal(bromageScale({ grade: '0' }).valid, false);
});
