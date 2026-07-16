// spec-v350: Oestern-Tscherne classification of a closed-fracture soft-tissue injury (grades 0-III /
// C0-C3). Worked-example tests: each grade and its soft-tissue description, the higher-energy flag on
// grades II-III, roman + C-label + numeric + case-insensitive input, and the invalid-grade guard.
// Definitions transcribed from Tscherne & Oestern 1982 (Unfallheilkunde), cross-verified against
// orthopedic-trauma references (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tscherneClosed } from '../../lib/tscherne-closed-v350.js';

test('grade II (C2): deep abrasion, impending compartment syndrome, flagged (the META example)', () => {
  const r = tscherneClosed({ grade: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 'II');
  assert.equal(r.closedGrade, 'C2');
  assert.equal(r.severe, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /impending compartment syndrome/);
});

test('grades 0-I are lower energy and not flagged', () => {
  assert.match(tscherneClosed({ grade: '0' }).band, /little or no soft-tissue injury/);
  assert.match(tscherneClosed({ grade: 'I' }).band, /superficial abrasion or skin contusion/);
  for (const g of ['0', 'I']) {
    assert.equal(tscherneClosed({ grade: g }).severe, false, g);
  }
});

test('grade III (C3) is the most severe (crush / degloving / vascular) and flagged', () => {
  const r = tscherneClosed({ grade: 'III' });
  assert.equal(r.severe, true);
  assert.equal(r.closedGrade, 'C3');
  assert.match(r.band, /extensive skin contusion or crush/);
});

test('C-labels, numeric, and case-insensitive input map to the grades', () => {
  assert.equal(tscherneClosed({ grade: 'C2' }).grade, 'II');
  assert.equal(tscherneClosed({ grade: 'c3' }).grade, 'III');
  assert.equal(tscherneClosed({ grade: 2 }).grade, 'II');
  assert.equal(tscherneClosed({ grade: '0' }).grade, '0');
});

test('a missing or out-of-range grade is invalid', () => {
  assert.equal(tscherneClosed({}).valid, false);
  assert.equal(tscherneClosed({ grade: 'IV' }).valid, false);
  assert.equal(tscherneClosed({ grade: 'C4' }).valid, false);
});
