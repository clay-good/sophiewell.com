// spec-v12 §3.8.1 wave 12-8: Killip Classification boundary examples
// per Killip T, Kimball JT. Am J Cardiol. 1967;20(4):457-464.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { killip } from '../../lib/scoring-v4.js';

test('killip I: mortality 6% (Killip 1967 original cohort)', () => {
  const r = killip({ klass: 1 });
  assert.equal(r.klass, 1);
  assert.equal(r.inHospitalMortalityPct, 6);
  assert.match(r.band, /6%/);
});

test('killip II: mortality 17%', () => {
  const r = killip({ klass: 2 });
  assert.equal(r.inHospitalMortalityPct, 17);
});

test('killip III: mortality 38%', () => {
  const r = killip({ klass: 3 });
  assert.equal(r.inHospitalMortalityPct, 38);
});

test('killip IV: mortality 81%', () => {
  const r = killip({ klass: 4 });
  assert.equal(r.inHospitalMortalityPct, 81);
  assert.match(r.descriptor, /Cardiogenic shock/);
});

test('killip clamps out-of-range to 1-4', () => {
  assert.equal(killip({ klass: 0 }).klass, 1);
  assert.equal(killip({ klass: 99 }).klass, 4);
});
