// spec-v501: Ludwig scale of female-pattern hair loss (grades I, II, III).
// Worked-example tests: each grade, the preserved frontal hairline, alias input, invalid-grade guard.
// Grades transcribed from Ludwig 1977 (Br J Dermatol) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ludwigHairloss } from '../../lib/ludwig-hairloss-v501.js';

test('grade II: pronounced crown thinning (the META example)', () => {
  const r = ludwigHairloss({ grade: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 'II');
  assert.match(r.band, /pronounced thinning of the hair on the crown/);
});

test('grade I: perceptible thinning behind the frontal line', () => {
  assert.match(ludwigHairloss({ grade: 'I' }).band, /perceptible thinning/);
  assert.match(ludwigHairloss({ grade: 'I' }).band, /1-3 cm behind the frontal hairline/);
});

test('grade III: full baldness of the crown', () => {
  const r = ludwigHairloss({ grade: 'III' });
  assert.equal(r.grade, 'III');
  assert.match(r.band, /full baldness \(total denudation\)/);
});

test('the note states the frontal hairline is preserved throughout', () => {
  assert.match(ludwigHairloss({ grade: 'I' }).note, /frontal hairline preserved throughout/);
});

test('lowercase and numeric aliases map to the canonical grades', () => {
  assert.equal(ludwigHairloss({ grade: 'iii' }).grade, 'III');
  assert.equal(ludwigHairloss({ grade: 1 }).grade, 'I');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(ludwigHairloss({}).valid, false);
  assert.equal(ludwigHairloss({ grade: '0' }).valid, false);
  assert.equal(ludwigHairloss({ grade: 'IV' }).valid, false);
});
