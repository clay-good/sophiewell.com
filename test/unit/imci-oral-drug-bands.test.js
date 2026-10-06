// spec-v1546 tool 2: IMCI oral drug bands at every edge, weight over age, and the zinc editions.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { imciOralDrugBands as r } from '../../lib/imci-oral-drug-bands-v1546.js';

test('amoxicillin and acetaminophen', () => {
  assert.equal(r({ drug: 'amoxicillin', weight: '9.9' }).bandLabel, '1 tablet twice daily');
  assert.equal(r({ drug: 'amoxicillin', weight: '10' }).bandLabel, '2 tablets twice daily');
  assert.equal(r({ drug: 'amoxicillin', weight: '19' }).bandLabel, '3 tablets twice daily');
  assert.equal(r({ drug: 'amoxicillin', weight: '19.5' }).valid, false);
  assert.ok(r({ drug: 'amoxicillin', weight: '4' }).notes.some((n) => /63 mg\/kg/.test(n)));
  assert.equal(r({ drug: 'acetaminophen', weight: '13.9' }).bandLabel, '100 mg every 6 h');
  assert.equal(r({ drug: 'acetaminophen', weight: '14' }).bandLabel, '150 mg every 6 h');
  assert.equal(r({ drug: 'acetaminophen', weight: '19' }).valid, false, 'acetaminophen top band is open (under 19 kg)');
  assert.ok(r({ drug: 'amoxicillin', weight: '12', age: '6' }).notes.some((n) => /weight is used/.test(n)));
  assert.ok(!r({ drug: 'amoxicillin', weight: '7', age: '3' }).notes.some((n) => /weight is used/.test(n)));
});

test('iron, cipro, zinc, mebendazole, albuterol', () => {
  assert.equal(r({ drug: 'iron', weight: '5', rutf: 'no' }).bandLabel, '1.00 mL daily');
  assert.equal(r({ drug: 'iron', weight: '15', rutf: 'no' }).bandLabel, '2.5 mL daily');
  assert.equal(r({ drug: 'iron', weight: '15', rutf: 'yes' }).bandLabel, 'No iron on RUTF');
  assert.equal(r({ drug: 'cipro', age: '5' }).bandLabel, '½ × 250 mg');
  assert.equal(r({ drug: 'cipro', age: '6' }).bandLabel, '1 × 250 mg');
  assert.equal(r({ drug: 'zinc', age: '5', edition: 'cb14' }).bandLabel, '½ tablet daily');
  assert.equal(r({ drug: 'zinc', edition: 'pd24' }).bandLabel, '5 mg daily');
  assert.equal(r({ drug: 'mebendazole', age: '11' }).bandLabel, 'Not under 1 year');
  assert.equal(r({ drug: 'albuterol' }).bandLabel, '2 puffs with spacer');
  assert.equal(r({ drug: 'amoxicillin' }).valid, false);
  assert.equal(r({ drug: 'amoxicillin', age: '61' }).valid, false);
});
