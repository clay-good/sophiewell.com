// spec-v505: METAVIR necroinflammatory activity grade (A0-A3).
// Worked-example tests: each grade, the separate-axes note, numeric input, invalid-grade guard.
// Grades transcribed from Bedossa and Poynard 1996 (Hepatology) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { metavirActivity } from '../../lib/metavir-activity-v505.js';

test('grade A2: moderate activity (the META example)', () => {
  const r = metavirActivity({ grade: 'A2' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 'A2');
  assert.match(r.band, /moderate necroinflammatory activity/);
});

test('grade A0 is the floor: no activity', () => {
  assert.match(metavirActivity({ grade: 'A0' }).band, /no necroinflammatory activity/);
});

test('grade A3 is the ceiling: severe activity', () => {
  const r = metavirActivity({ grade: 'A3' });
  assert.equal(r.grade, 'A3');
  assert.match(r.band, /severe necroinflammatory activity/);
});

test('grade A1: mild activity', () => {
  assert.match(metavirActivity({ grade: 'A1' }).band, /mild necroinflammatory activity/);
});

test('the note keeps activity and fibrosis as separate axes', () => {
  const n = metavirActivity({ grade: 'A2' }).note;
  assert.match(n, /separate axes/);
  assert.match(n, /A2F3/);
});

test('numeric and lowercase input map to the canonical grades', () => {
  assert.equal(metavirActivity({ grade: 0 }).grade, 'A0');
  assert.equal(metavirActivity({ grade: 3 }).grade, 'A3');
  assert.equal(metavirActivity({ grade: 'a1' }).grade, 'A1');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(metavirActivity({}).valid, false);
  assert.equal(metavirActivity({ grade: 'A4' }).valid, false);
  assert.equal(metavirActivity({ grade: '4' }).valid, false);
});
