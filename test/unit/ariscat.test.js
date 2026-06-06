// spec-v58 §2.10: ARISCAT postoperative pulmonary risk.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ariscat } from '../../lib/scoring-v6.js';

test('example: total 42, intermediate risk', () => {
  const r = ariscat({ agePts: 3, spo2Pts: 8, incisionPts: 15, durationPts: 16 });
  assert.equal(r.total, 42);
  assert.match(r.band, /Intermediate/);
});
test('low and high bands', () => {
  assert.match(ariscat({ agePts: 0, spo2Pts: 0 }).band, /Low risk/);
  assert.match(ariscat({ agePts: 16, spo2Pts: 24, incisionPts: 24 }).band, /High risk/);
});
test('empty input -> 0 low (no throw)', () => {
  assert.equal(ariscat({}).total, 0);
});
