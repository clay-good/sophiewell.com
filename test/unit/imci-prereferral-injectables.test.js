// spec-v1546 tool 3: pre-referral injection bands, quinine weight bands, diazepam, exact mg/kg volumes.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { imciPrereferralInjectables as r } from '../../lib/imci-prereferral-injectables-v1546.js';

test('antibiotics', () => {
  assert.equal(r({ drug: 'ampicillin', weight: '5' }).bandLabel, '1 mL');
  assert.equal(r({ drug: 'ampicillin', weight: '14' }).bandLabel, '5 mL');
  assert.equal(r({ drug: 'gentamicin', weight: '8' }).bandLabel, '1.1-1.8 mL');
  assert.ok(r({ drug: 'gentamicin', weight: '8' }).notes.some((n) => /60 mg = 1\.5 mL/.test(n)));
  assert.equal(r({ drug: 'ampicillin', age: '40' }).bandLabel, '5 mL');
});

test('quinine and diazepam', () => {
  assert.equal(r({ drug: 'quinine150', weight: '11' }).bandLabel, '0.8 mL');
  assert.equal(r({ drug: 'quinine300', weight: '12' }).bandLabel, '0.5 mL');
  assert.equal(r({ drug: 'quinine150', age: '30' }).bandLabel, '1.0 mL');
  assert.equal(r({ drug: 'diazepam', weight: '6' }).bandLabel, '0.5 mL');
  assert.equal(r({ drug: 'diazepam', weight: '4.5' }).valid, false);
  assert.equal(r({ drug: 'diazepam', age: '6' }).bandLabel, '1.0 mL');
  assert.equal(r({ drug: 'ampicillin', weight: '20' }).valid, false);
  assert.equal(r({ drug: 'ampicillin' }).valid, false);
});
