// spec-v167 2.6: Rutgeerts post-op Crohn's endoscopic recurrence grade. Every
// finding resolves to exactly one i-grade; the i1→i2 recurrence transition is
// asserted.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rutgeerts } from '../../lib/oneformula-v167.js';

test('tile example: i2 predicts clinical recurrence', () => {
  const r = rutgeerts({ finding: 'i2' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, 'i2');
  assert.equal(r.recurrence, true);
});

test('i1 → i2 recurrence-risk transition', () => {
  const i1 = rutgeerts({ finding: 'i1' });
  assert.equal(i1.recurrence, false);
  assert.match(i1.band, /low risk/);
  const i2 = rutgeerts({ finding: 'i2' });
  assert.equal(i2.recurrence, true);
  assert.match(i2.band, /predicts clinical recurrence/);
});

test('every grade resolves and i3/i4 are high-risk', () => {
  for (const g of ['i0', 'i1', 'i2', 'i3', 'i4']) {
    assert.equal(rutgeerts({ finding: g }).grade, g);
  }
  assert.equal(rutgeerts({ finding: 'i0' }).recurrence, false);
  assert.equal(rutgeerts({ finding: 'i3' }).recurrence, true);
  assert.equal(rutgeerts({ finding: 'i4' }).recurrence, true);
});

test('guards: missing/invalid finding', () => {
  assert.equal(rutgeerts({}).valid, false);
  assert.equal(rutgeerts({ finding: 'i9' }).valid, false);
});
