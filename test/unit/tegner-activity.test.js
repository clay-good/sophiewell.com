// spec-v500: Tegner activity scale (levels 0-10).
// Worked-example tests: the endpoints, the work anchors, the competitive/recreational split, numeric input,
// invalid-level guard. Levels transcribed from Tegner and Lysholm 1985 (Clin Orthop Relat Res) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tegnerActivity } from '../../lib/tegner-activity-v500.js';

test('level 5: heavy labor, competitive cycling (the META example)', () => {
  const r = tegnerActivity({ level: '5' });
  assert.equal(r.valid, true);
  assert.equal(r.level, '5');
  assert.match(r.band, /heavy labor such as construction/);
  assert.match(r.band, /jogging on uneven ground at least twice weekly/);
});

test('level 0 is the floor: sick leave for knee problems', () => {
  assert.match(tegnerActivity({ level: '0' }).band, /sick leave or a disability pension because of knee problems/);
});

test('level 10 is the ceiling: national elite competitive sport', () => {
  const r = tegnerActivity({ level: '10' });
  assert.equal(r.level, '10');
  assert.match(r.band, /national elite level/);
});

test('the work anchors climb from sedentary to heavy labor', () => {
  assert.match(tegnerActivity({ level: '1' }).band, /sedentary work/);
  assert.match(tegnerActivity({ level: '3' }).band, /light labor such as nursing/);
  assert.match(tegnerActivity({ level: '4' }).band, /moderately heavy labor/);
  assert.match(tegnerActivity({ level: '5' }).band, /heavy labor/);
});

test('levels 2 and 3 split on walking in a forest', () => {
  assert.match(tegnerActivity({ level: '2' }).band, /walking in a forest is not/);
  assert.match(tegnerActivity({ level: '3' }).band, /walking in a forest possible/);
});

test('numeric input maps to the levels', () => {
  assert.equal(tegnerActivity({ level: 0 }).level, '0');
  assert.equal(tegnerActivity({ level: 10 }).level, '10');
});

test('a missing or out-of-range level is invalid', () => {
  assert.equal(tegnerActivity({}).valid, false);
  assert.equal(tegnerActivity({ level: '11' }).valid, false);
  assert.equal(tegnerActivity({ level: '-1' }).valid, false);
});
