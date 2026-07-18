// spec-v415: Geissler arthroscopic classification of interosseous carpal-ligament injury
// (grades I/II/III/IV). Worked-example tests: each grade and its arthroscopic-appearance description,
// numeric input, and the invalid-grade guard. Grades transcribed from Geissler 1996 (J Bone Joint Surg Am)
// (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { geisslerCarpal } from '../../lib/geissler-carpal-v415.js';

test('grade II: midcarpal incongruency, no probe (the META example)', () => {
  const r = geisslerCarpal({ grade: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 'II');
  assert.match(r.band, /incongruency or step-off of carpal alignment in the midcarpal space/);
  assert.match(r.band, /not yet wide enough to pass a probe/);
});

test('grade I: radiocarpal attenuation, midcarpal congruent', () => {
  const r = geisslerCarpal({ grade: 'I' });
  assert.equal(r.grade, 'I');
  assert.match(r.band, /carpal alignment still congruent in the midcarpal space/);
});

test('grade III: a probe passes the interval', () => {
  const r = geisslerCarpal({ grade: 'III' });
  assert.equal(r.grade, 'III');
  assert.match(r.band, /a probe can be passed through the gap/);
});

test('grade IV: arthroscope passes, drive-through sign', () => {
  const r = geisslerCarpal({ grade: 'IV' });
  assert.equal(r.grade, 'IV');
  assert.match(r.band, /2\.7 mm arthroscope can be passed/);
  assert.match(r.band, /drive-through sign/);
});

test('numeric input maps to the grades', () => {
  assert.equal(geisslerCarpal({ grade: 1 }).grade, 'I');
  assert.equal(geisslerCarpal({ grade: 4 }).grade, 'IV');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(geisslerCarpal({}).valid, false);
  assert.equal(geisslerCarpal({ grade: 'V' }).valid, false);
  assert.equal(geisslerCarpal({ grade: '0' }).valid, false);
});
