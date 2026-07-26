// spec-v472: Yerdel portal vein thrombosis grading (grades 1-4).
// Worked-example tests: each grade and its thrombus-extent description, Roman-numeral alias, invalid guard.
// Grades transcribed from Yerdel 2000 (Transplantation) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { yerdelPvt } from '../../lib/yerdel-pvt-v472.js';

test('grade 2: more than 50% occlusion (the META example)', () => {
  const r = yerdelPvt({ grade: 2 });
  assert.equal(r.valid, true);
  assert.equal(r.grade, '2');
  assert.match(r.band, /more than 50% occlusion of the portal vein, including total occlusion/);
});

test('grade 1: partial, 50% or less', () => {
  assert.match(yerdelPvt({ grade: 1 }).band, /50% or less of the lumen/);
});

test('grade 3: complete PV + proximal SMV', () => {
  assert.match(yerdelPvt({ grade: 3 }).band, /the proximal SMV, with a patent distal SMV/);
});

test('grade 4: complete PV + entire SMV', () => {
  const r = yerdelPvt({ grade: 4 });
  assert.equal(r.grade, '4');
  assert.match(r.band, /the entire SMV \(both proximal and distal\)/);
});

test('Roman-numeral alias maps to the grades', () => {
  assert.equal(yerdelPvt({ grade: 'I' }).grade, '1');
  assert.equal(yerdelPvt({ grade: 'IV' }).grade, '4');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(yerdelPvt({}).valid, false);
  assert.equal(yerdelPvt({ grade: 5 }).valid, false);
  assert.equal(yerdelPvt({ grade: '0' }).valid, false);
});
