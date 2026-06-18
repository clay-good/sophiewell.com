// spec-v106 2.6: Constans score for upper-extremity DVT (Constans 2008). Three
// +1 items and one signed -1 item; total -1..+3, bands low <=0 / intermediate 1
// / high 2-3. The band keys on the signed sum, not its absolute value.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { constansUedvt } from '../../lib/vte-v106.js';

test('no items -> 0, low probability', () => {
  const r = constansUedvt({});
  assert.equal(r.total, 0);
  assert.equal(r.probability, 'low');
});

test('one +1 item -> 1, intermediate', () => {
  const r = constansUedvt({ localizedPain: true });
  assert.equal(r.total, 1);
  assert.equal(r.probability, 'intermediate');
});

test('all three +1 items -> 3, high', () => {
  const r = constansUedvt({ venousMaterial: true, localizedPain: true, unilateralEdema: true });
  assert.equal(r.total, 3);
  assert.equal(r.probability, 'high');
});

test('band flip via the signed -1 term: intermediate -> low', () => {
  // localized pain (1) = intermediate; add alternative diagnosis (-1) = 0 -> low
  const inter = constansUedvt({ localizedPain: true });
  assert.equal(inter.probability, 'intermediate');
  const low = constansUedvt({ localizedPain: true, otherDxPlausible: true });
  assert.equal(low.total, 0);
  assert.equal(low.probability, 'low');
});

test('signed total can be negative (-1) and stays low', () => {
  const r = constansUedvt({ otherDxPlausible: true });
  assert.equal(r.total, -1);
  assert.equal(r.probability, 'low');
  assert.match(r.band, /-1/);
});
