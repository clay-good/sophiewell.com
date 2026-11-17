// spec-v125 2.4: West Haven (Conn 1977) HE grade 0-4; grades 2+ are overt.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { westHavenHe } from '../../lib/hep-v125.js';

test('grade 0 -> minimal, not overt', () => {
  const r = westHavenHe({ grade: 0 });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 0);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /minimal/);
});

test('grade 1 -> not overt', () => {
  assert.equal(westHavenHe({ grade: 1 }).abnormal, false);
});

test('grade 2 band-flip -> overt encephalopathy', () => {
  const r = westHavenHe({ grade: 2 });
  assert.equal(r.abnormal, true);
  assert.match(r.band, /overt hepatic encephalopathy/);
});

test('grade 4 -> coma', () => {
  assert.match(westHavenHe({ grade: 4 }).band, /coma/);
});

// spec-v1756: an out-of-range grade is refused, not clamped to grade 4 (or a -1 to grade 0, "minimal").
test('an out-of-range grade is refused; a scalar input never throws', () => {
  assert.equal(westHavenHe({ grade: 9 }).valid, false);
  assert.equal(westHavenHe({ grade: -1 }).valid, false);
  assert.equal(westHavenHe(9).grade, 0);
});

// spec-v1755: an ordinal item or a count has no value between its steps; a half-step is refused.
test('spec-v1755: west-haven-he refuses a half-step grade; whole grades and the worked example answer', () => {
  const r = westHavenHe({ grade: 2.5 });
  assert.equal(r.valid, false);
  assert.match(r.message, /West Haven grade must be a whole number/);
  assert.equal(westHavenHe({ grade: '3' }).grade, 3);
  assert.equal(westHavenHe({ grade: 2 }).grade, 2);
});
