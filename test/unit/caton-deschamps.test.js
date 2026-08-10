// spec-v704: Caton-Deschamps patellar-height index.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { catonDeschamps } from '../../lib/caton-deschamps-v704.js';

test('worked example: A 18, B 12 -> 1.5 (patella alta)', () => {
  const r = catonDeschamps({ distanceA: '18', lengthB: '12' });
  assert.equal(r.valid, true);
  assert.equal(r.index, 1.5);
  assert.equal(r.tier, 'alta');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /Caton-Deschamps 1.5/);
});

test('formula is A / B', () => {
  const r = catonDeschamps({ distanceA: '12', lengthB: '15' });
  assert.equal(r.index, 0.8); // 12/15
  assert.equal(r.tier, 'normal');
  assert.equal(r.abnormal, false);
});

test('bands: <0.6 baja, 0.6-1.2 normal, >1.2 alta', () => {
  assert.equal(catonDeschamps({ distanceA: '5', lengthB: '10' }).tier, 'baja');   // 0.5
  assert.equal(catonDeschamps({ distanceA: '6', lengthB: '10' }).tier, 'normal'); // 0.6
  assert.equal(catonDeschamps({ distanceA: '12', lengthB: '10' }).tier, 'normal'); // 1.2
  assert.equal(catonDeschamps({ distanceA: '13', lengthB: '10' }).tier, 'alta');  // 1.3
});

test('inputs are validated', () => {
  assert.equal(catonDeschamps({}).valid, false);
  assert.equal(catonDeschamps({}).code, 'MISSING_INPUT');
  assert.equal(catonDeschamps({ distanceA: '12' }).field, 'lengthB');
  assert.equal(catonDeschamps({ distanceA: '0', lengthB: '10' }).field, 'distanceA');
});
