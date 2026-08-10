// spec-v703: Reimers migration percentage.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { reimersMigrationPercentage } from '../../lib/reimers-migration-percentage-v703.js';

test('worked example: a 20, b 50 -> 40% (subluxated)', () => {
  const r = reimersMigrationPercentage({ lateralWidth: '20', totalWidth: '50' });
  assert.equal(r.valid, true);
  assert.equal(r.migrationPercentage, 40);
  assert.equal(r.tier, 'subluxated');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /Reimers MP 40%/);
});

test('formula is (a / b) * 100', () => {
  const r = reimersMigrationPercentage({ lateralWidth: '15', totalWidth: '60' });
  assert.equal(r.migrationPercentage, 25); // 15/60*100
  assert.equal(r.tier, 'normal');
  assert.equal(r.abnormal, false);
});

test('bands: <=33 normal, 34-89 subluxated, >=90 dislocated', () => {
  assert.equal(reimersMigrationPercentage({ lateralWidth: '33', totalWidth: '100' }).tier, 'normal');     // 33
  assert.equal(reimersMigrationPercentage({ lateralWidth: '34', totalWidth: '100' }).tier, 'subluxated'); // 34
  assert.equal(reimersMigrationPercentage({ lateralWidth: '95', totalWidth: '100' }).tier, 'dislocated'); // 95
});

test('the 33% threshold is normal; just above is abnormal', () => {
  assert.equal(reimersMigrationPercentage({ lateralWidth: '33', totalWidth: '100' }).abnormal, false);
  assert.equal(reimersMigrationPercentage({ lateralWidth: '34', totalWidth: '100' }).abnormal, true);
});

test('inputs are validated; lateral cannot exceed total', () => {
  assert.equal(reimersMigrationPercentage({}).valid, false);
  assert.equal(reimersMigrationPercentage({}).code, 'MISSING_INPUT');
  assert.equal(reimersMigrationPercentage({ lateralWidth: '20' }).field, 'totalWidth');
  const bad = reimersMigrationPercentage({ lateralWidth: '60', totalWidth: '50' });
  assert.equal(bad.valid, false);
  assert.equal(bad.code, 'INVALID_INPUT');
});
