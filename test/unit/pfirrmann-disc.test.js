// spec-v434: Pfirrmann disc degeneration grade (I-V).
// Worked-example tests: each grade and its MRI description, numeric input, and the invalid-grade guard.
// Grades transcribed from Pfirrmann 2001 (Spine) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pfirrmannDisc } from '../../lib/pfirrmann-disc-v434.js';

test('grade III: gray, unclear distinction (the META example)', () => {
  const r = pfirrmannDisc({ grade: 'III' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 'III');
  assert.match(r.band, /inhomogeneous gray, unclear/);
});

test('grade I: homogeneous bright white', () => {
  const r = pfirrmannDisc({ grade: 'I' });
  assert.equal(r.grade, 'I');
  assert.match(r.band, /homogeneous bright white/);
});

test('grade II: inhomogeneous bright', () => {
  assert.match(pfirrmannDisc({ grade: 'II' }).band, /horizontal bands/);
});

test('grade IV: gray to black, lost distinction', () => {
  assert.match(pfirrmannDisc({ grade: 'IV' }).band, /gray to black/);
});

test('grade V: black, collapsed disc space', () => {
  const r = pfirrmannDisc({ grade: 'V' });
  assert.equal(r.grade, 'V');
  assert.match(r.band, /collapsed disc space/);
});

test('numeric input maps to the grades', () => {
  assert.equal(pfirrmannDisc({ grade: 1 }).grade, 'I');
  assert.equal(pfirrmannDisc({ grade: 5 }).grade, 'V');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(pfirrmannDisc({}).valid, false);
  assert.equal(pfirrmannDisc({ grade: 'VI' }).valid, false);
  assert.equal(pfirrmannDisc({ grade: '0' }).valid, false);
});
