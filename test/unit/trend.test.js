// spec-v62 §2 A1 unit tests for the serial/trend primitive. >=3 boundary
// worked examples including the bad-interval fallback (which must throw
// RangeError, caught by the renderer safe() wrapper, never a signed-infinity
// rate leak).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../lib/trend.js';

test('trend: NEWS2 3 -> 7 over 4 h -> +4, 1/h, rising', () => {
  const r = T.trend({ prior: 3, current: 7, hours: 4 });
  assert.equal(r.delta, 4);
  assert.equal(r.ratePerHour, 1);
  assert.equal(r.direction, 'rising');
});

test('trend: 8 -> 4 over 2 h -> -4, falling; equal -> unchanged', () => {
  assert.equal(T.trend({ prior: 8, current: 4, hours: 2 }).direction, 'falling');
  assert.equal(T.trend({ prior: 5, current: 5, hours: 1 }).direction, 'unchanged');
});

test('trend: zero/negative interval throws (no signed-infinity rate)', () => {
  assert.throws(() => T.trend({ prior: 3, current: 7, hours: 0 }), RangeError);
  assert.throws(() => T.trend({ prior: 3, current: NaN, hours: 4 }), TypeError);
});

test('correctionRate: Na 120 -> 126 over 12 h, ceiling 8 -> +0.5/h, +12/24h, exceeds', () => {
  const r = T.correctionRate({ prior: 120, current: 126, hours: 12, ceilingPer24h: 8 });
  assert.equal(r.delta, 6);
  assert.equal(r.ratePerHour, 0.5);
  assert.equal(r.projectedPer24h, 12);
  assert.equal(r.exceedsCeiling, true);
});

test('correctionRate: Na 120 -> 123 over 12 h, ceiling 8 -> +6/24h, within ceiling', () => {
  const r = T.correctionRate({ prior: 120, current: 123, hours: 12, ceilingPer24h: 8 });
  assert.equal(r.projectedPer24h, 6);
  assert.equal(r.exceedsCeiling, false);
});

test('correctionRate: over-rapid fall is flagged too (direction-agnostic)', () => {
  const r = T.correctionRate({ prior: 150, current: 144, hours: 6, ceilingPer24h: 8 });
  assert.equal(r.delta, -6);
  assert.equal(r.projectedPer24h, -24);
  assert.equal(r.exceedsCeiling, true);
});

test('correctionRate: zero/negative interval throws (no divide-by-zero rate)', () => {
  assert.throws(() => T.correctionRate({ prior: 120, current: 126, hours: 0, ceilingPer24h: 8 }), RangeError);
  assert.throws(() => T.correctionRate({ prior: 120, current: 126, hours: -3, ceilingPer24h: 8 }), RangeError);
  assert.throws(() => T.correctionRate({ prior: 120, current: NaN, hours: 12, ceilingPer24h: 8 }), TypeError);
  assert.throws(() => T.correctionRate({ prior: 120, current: 126, hours: 12, ceilingPer24h: 0 }), RangeError);
});
