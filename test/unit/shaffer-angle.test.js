// spec-v363: Shaffer gonioscopy angle grade (grades 0-4). Worked-example tests: each grade and its
// angle-width description, the narrow (angle-closure-risk) flag on grades 0-2, numeric/string input,
// and the invalid-grade guard. Grades transcribed from Shaffer 1960, cross-verified against AAO /
// EyeWiki (spec-v97); angular widths are approximate.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shafferAngle } from '../../lib/shaffer-angle-v363.js';

test('grade 1: very narrow, closure probable, flagged (the META example)', () => {
  const r = shafferAngle({ grade: '1' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, '1');
  assert.equal(r.narrow, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /very narrow angle/);
  assert.match(r.band, /closure is probable/);
});

test('grades 3-4 are open angles and not flagged', () => {
  assert.match(shafferAngle({ grade: '4' }).band, /wide open/);
  assert.match(shafferAngle({ grade: '3' }).band, /open angle/);
  for (const g of ['3', '4']) {
    assert.equal(shafferAngle({ grade: g }).narrow, false, g);
  }
});

test('grades 0-2 are narrow angles at angle-closure risk and flagged', () => {
  assert.match(shafferAngle({ grade: '2' }).band, /moderately narrow/);
  assert.match(shafferAngle({ grade: '0' }).band, /closed anterior chamber angle/);
  for (const g of ['0', '1', '2']) {
    assert.equal(shafferAngle({ grade: g }).narrow, true, g);
  }
});

test('numeric and string input both resolve', () => {
  assert.equal(shafferAngle({ grade: 4 }).grade, '4');
  assert.equal(shafferAngle({ grade: '0' }).grade, '0');
  assert.equal(shafferAngle({ grade: 2 }).narrow, true);
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(shafferAngle({}).valid, false);
  assert.equal(shafferAngle({ grade: '5' }).valid, false);
  assert.equal(shafferAngle({ grade: 'IV' }).valid, false);
});
