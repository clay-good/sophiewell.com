// spec-v1552 tool 1: single low-dose primaquine (WHO 2026). Weight bands at 25 and 50 kg, the 5/100 kg table
// edges, the exclusions, transmission, and refusals.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { primaquineSingleLowDose as p } from '../../lib/primaquine-single-low-dose-v1552.js';

const B = { lowTransmission: 'yes', pregnant: 'no', infant: 'no', breastfeeding: 'no' };

test('weight bands: 3.75 mg to under 25 kg, 7.5 mg to under 50, 15 mg to 100', () => {
  assert.equal(p({ ...B, weight: '5' }).bandLabel, '3.75 mg once');
  assert.match(p({ ...B, weight: '8' }).notes.join(' '), /under 10 kg is limited/);
  assert.equal(p({ ...B, weight: '24.9' }).bandLabel, '3.75 mg once');
  assert.equal(p({ ...B, weight: '25' }).bandLabel, '7.5 mg once');
  assert.equal(p({ ...B, weight: '50' }).bandLabel, '15 mg once');
  assert.match(p({ ...B, weight: '60' }).band, /two 7\.5 mg tablets, once on the first day with the ACT/);
  assert.equal(p({ ...B, weight: '4.9' }).valid, false);
  assert.equal(p({ ...B, weight: '100.1' }).valid, false);
});

test('not in moderate or high transmission; excluded groups', () => {
  assert.equal(p({ ...B, weight: '60', lowTransmission: 'no' }).bandLabel, 'Not recommended');
  assert.equal(p({ ...B, weight: '60', pregnant: 'yes' }).bandLabel, 'Excluded');
  assert.equal(p({ ...B, weight: '3', infant: 'yes' }).bandLabel, 'Excluded');
  assert.match(p({ ...B, weight: '60', breastfeeding: 'yes' }).band, /breastfeeding an infant under 1 month/);
});

test('every required answer is asked for', () => {
  for (const k of Object.keys(B)) assert.equal(p({ ...B, weight: '60', [k]: '' }).valid, false, k);
  assert.equal(p({ ...B }).valid, false);
});
