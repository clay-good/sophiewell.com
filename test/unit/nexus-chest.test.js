// spec-v57 §2.6: NEXUS Chest.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nexusChest } from '../../lib/scoring-v5.js';

test('all absent -> imaging may be deferred', () => {
  const r = nexusChest({});
  assert.equal(r.imagingIndicated, false); assert.match(r.band, /deferred/);
});
test('any criterion -> imaging indicated', () => {
  assert.equal(nexusChest({ abnormalCxr: true }).imagingIndicated, true);
  assert.equal(nexusChest({ age60: true }).imagingIndicated, true);
});
test('multiple criteria still indicated', () => {
  assert.equal(nexusChest({ intoxication: true, alteredAlertness: true }).imagingIndicated, true);
});
