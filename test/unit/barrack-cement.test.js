// spec-v484: Barrack cement mantle grading (grades A-D).
// Worked-example tests: each grade and its cement-mantle-quality description, numeric alias, invalid guard.
// Grades transcribed from Barrack 1992 (J Bone Joint Surg Br) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { barrackCement } from '../../lib/barrack-cement-v484.js';

test('grade C: 50-99% radiolucency (the META example)', () => {
  const r = barrackCement({ grade: 'C' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 'C');
  assert.match(r.band, /50% to 99% of the cement-bone interface/);
});

test('grade A: complete white-out', () => {
  assert.match(barrackCement({ grade: 'A' }).band, /"white-out" at the cement-bone interface/);
});

test('grade B: slight radiolucency', () => {
  assert.match(barrackCement({ grade: 'B' }).band, /a slight radiolucency at the cement-bone interface/);
});

test('grade D: 100% radiolucency or unfilled canal', () => {
  const r = barrackCement({ grade: 'D' });
  assert.equal(r.grade, 'D');
  assert.match(r.band, /100% of the cement-bone interface, or a failure to fill the canal/);
});

test('numeric alias maps to the grades', () => {
  assert.equal(barrackCement({ grade: 1 }).grade, 'A');
  assert.equal(barrackCement({ grade: 4 }).grade, 'D');
});

test('a missing or unknown grade is invalid', () => {
  assert.equal(barrackCement({}).valid, false);
  assert.equal(barrackCement({ grade: 'E' }).valid, false);
  assert.equal(barrackCement({ grade: '0' }).valid, false);
});
