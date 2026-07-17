// spec-v385: Schwab & England ADL scale (0-100%, 10% steps). Worked-example tests: representative levels
// and their functional descriptions, the never-abnormal invariant, numeric + trailing-'%' input, the
// step-of-10 validation, and the invalid-input guard. Levels transcribed from Schwab & England 1969,
// cross-verified against movement-disorder references (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { schwabEngland } from '../../lib/schwab-england-v385.js';

test('50%: more dependent, needs help with half of chores (the META example)', () => {
  const r = schwabEngland({ percent: '50' });
  assert.equal(r.valid, true);
  assert.equal(r.percent, 50);
  assert.equal(r.level, '50%');
  assert.equal(r.abnormal, false);
  assert.match(r.band, /needs help with half of chores/);
});

test('100%: completely independent, essentially normal', () => {
  const r = schwabEngland({ percent: 100 });
  assert.equal(r.level, '100%');
  assert.match(r.band, /completely independent/);
  assert.match(r.band, /essentially normal/);
});

test('0%: bedridden, vegetative functions failing', () => {
  const r = schwabEngland({ percent: '0' });
  assert.equal(r.percent, 0);
  assert.match(r.band, /bedridden/);
});

test('a functional level is never flagged abnormal', () => {
  for (const p of [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]) {
    assert.equal(schwabEngland({ percent: p }).abnormal, false);
  }
});

test('a trailing percent sign is accepted', () => {
  assert.equal(schwabEngland({ percent: '80%' }).percent, 80);
});

test('a non-multiple-of-10 or out-of-range value is invalid', () => {
  assert.equal(schwabEngland({}).valid, false);
  assert.equal(schwabEngland({ percent: '55' }).valid, false);
  assert.equal(schwabEngland({ percent: '110' }).valid, false);
  assert.equal(schwabEngland({ percent: '-10' }).valid, false);
});
