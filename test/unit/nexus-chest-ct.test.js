// spec-v108 2.6: NEXUS Chest CT (Rodriguez 2015). Any-positive -> CT may be indicated.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nexusChestCt } from '../../lib/trauma-v108.js';

test('all negative -> chest CT can be deferred', () => {
  const r = nexusChestCt({});
  assert.equal(r.positive, 0);
  assert.equal(r.ctIndicated, false);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /can be deferred/);
});

test('band flip: one positive criterion flips defer -> CT', () => {
  const r = nexusChestCt({ ageOver60: true });
  assert.equal(r.positive, 1);
  assert.equal(r.ctIndicated, true);
  assert.match(r.band, /1 positive criterion \(Age > 60 years\): chest CT may be indicated\./);
});

test('multiple positives are named', () => {
  const r = nexusChestCt({ abnormalCxr: true, intoxication: true });
  assert.equal(r.positive, 2);
  assert.match(r.band, /2 positive criteria/);
  assert.ok(r.flagged.includes('Abnormal chest x-ray'));
  assert.ok(r.flagged.includes('Intoxication'));
});

test('all seven positive', () => {
  const r = nexusChestCt({
    abnormalCxr: true, distractingInjury: true, chestTenderness: true, rapidDeceleration: true,
    ageOver60: true, intoxication: true, abnormalAlertness: true,
  });
  assert.equal(r.positive, 7);
  assert.equal(r.ctIndicated, true);
});
