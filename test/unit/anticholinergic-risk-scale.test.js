// spec-v179 §2.2: ARS. total = 1*c1 + 2*c2 + 3*c3 (continuous, no official cut).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { anticholinergicRiskScale as ars } from '../../lib/ltcga-v179.js';

test('ARS total = sum(point x count)', () => {
  assert.equal(ars({ point1Count: '0', point2Count: '1', point3Count: '1' }).total, 5);
  assert.equal(ars({ point1Count: '3', point2Count: '0', point3Count: '0' }).total, 3);
});

test('ARS all-blank -> complete-the-fields; single field ok', () => {
  assert.equal(ars({}).valid, false);
  assert.equal(ars({ point3Count: '2' }).total, 6);
});

test('ARS rejects non-integer / negative', () => {
  assert.equal(ars({ point1Count: '2.5' }).valid, false);
  assert.equal(ars({ point1Count: '-2' }).valid, false);
});
