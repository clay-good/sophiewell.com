// spec-v384: Spetzler-Ponce classification of a cerebral AVM (Classes A/B/C). Worked-example tests: each
// class and its Spetzler-Martin-grade grouping, the higher-risk flag on Class C, class + numeric + the
// smGrade-derivation input, and the invalid-input guard. Classes transcribed from Spetzler 2011 (J
// Neurosurg) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spetzlerPonce } from '../../lib/spetzler-ponce-v384.js';

test('Class C: SM grade IV-V, highest surgical risk, flagged (the META example)', () => {
  const r = spetzlerPonce({ class: 'C' });
  assert.equal(r.valid, true);
  assert.equal(r.class, 'C');
  assert.equal(r.spetzlerMartinGrades, 'IV-V');
  assert.equal(r.higherRisk, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /highest surgical risk/);
});

test('Class A is SM grade I-II, lowest risk, not flagged', () => {
  const r = spetzlerPonce({ class: 'A' });
  assert.equal(r.spetzlerMartinGrades, 'I-II');
  assert.equal(r.higherRisk, false);
  assert.match(r.band, /lowest surgical risk/);
});

test('Class B is SM grade III, intermediate, not flagged', () => {
  const r = spetzlerPonce({ class: 'B' });
  assert.equal(r.spetzlerMartinGrades, 'III');
  assert.equal(r.higherRisk, false);
});

test('a Spetzler-Martin grade derives the class', () => {
  assert.equal(spetzlerPonce({ smGrade: '1' }).class, 'A');
  assert.equal(spetzlerPonce({ smGrade: 'II' }).class, 'A');
  assert.equal(spetzlerPonce({ smGrade: '3' }).class, 'B');
  assert.equal(spetzlerPonce({ smGrade: 'V' }).class, 'C');
});

test('class numeric aliases map 1-3 to A-C', () => {
  assert.equal(spetzlerPonce({ class: 1 }).class, 'A');
  assert.equal(spetzlerPonce({ class: 3 }).class, 'C');
});

test('a missing or unknown input is invalid', () => {
  assert.equal(spetzlerPonce({}).valid, false);
  assert.equal(spetzlerPonce({ class: 'D' }).valid, false);
  assert.equal(spetzlerPonce({ smGrade: '6' }).valid, false);
});
