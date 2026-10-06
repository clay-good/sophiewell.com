// spec-v1562 tool 5: LF MDA regimen by area and person eligibility; loiasis never defaulted.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lfMdaRegimen as r } from '../../lib/lf-mda-regimen-v1562.js';

const p = { age: '30', height: '165', pregnant: 'no', ill: 'no', seizures: 'no' };

test('area regimens', () => {
  assert.equal(r({ ...p, oncho: 'no', loiasis: 'no', status: 'routine' }).bandLabel, 'Eligible for DA');
  assert.equal(r({ ...p, oncho: 'no', loiasis: 'no', status: 'early' }).bandLabel, 'Eligible for IDA');
  assert.equal(r({ ...p, oncho: 'yes', loiasis: 'no' }).bandLabel, 'Eligible for IA');
  assert.equal(r({ ...p, oncho: 'no', loiasis: 'yes', ivermectinGiven: 'no' }).bandLabel, 'Eligible for albendazole');
  assert.equal(r({ ...p, oncho: 'no' }).valid, false, 'loiasis is never defaulted');
  assert.equal(r({ ...p, oncho: 'no', loiasis: 'yes' }).valid, false);
});

test('person eligibility', () => {
  assert.equal(r({ ...p, oncho: 'no', loiasis: 'no', status: 'routine', pregnant: 'later' }).bandLabel, 'Not eligible');
  assert.equal(r({ ...p, oncho: 'yes', loiasis: 'no', height: '85' }).bandLabel, 'Not eligible');
  assert.equal(r({ ...p, oncho: 'no', loiasis: 'no', status: 'early', age: '3', height: '95' }).bandLabel, 'Eligible for DA');
  assert.equal(r({ ...p, oncho: 'no', loiasis: 'no', status: 'early', age: '1.5' }).bandLabel, 'Not eligible');
  assert.equal(r({ ...p, oncho: 'no', loiasis: 'yes', ivermectinGiven: 'no', pregnant: 'later' }).bandLabel, 'Eligible for albendazole');
  assert.equal(r({ ...p, oncho: 'no', loiasis: 'yes', ivermectinGiven: 'no', pregnant: 'first' }).bandLabel, 'Not eligible');
  assert.equal(r({ ...p, oncho: 'no', loiasis: 'yes', ivermectinGiven: 'no', seizures: 'yes' }).bandLabel, 'Not eligible');
});
