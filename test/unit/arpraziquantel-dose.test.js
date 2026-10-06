// spec-v1562 tool 4: arpraziquantel bands (EMA product information) at every edge, floors and contraindications.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { arpraziquantelDose as r } from '../../lib/arpraziquantel-dose-v1562.js';

const t = (species, w) => r({ species, weight: String(w), age: '3', cysticercosis: 'no', acute: 'no', inducer: 'no' }).bandLabel;

test('S. mansoni bands', () => {
  assert.deepEqual([5, 6.9, 7, 9.9, 10, 12.9, 13, 16.9, 17, 22.9, 23, 30].map((w) => t('mansoni', w)),
    ['2 tablets once', '2 tablets once', '3 tablets once', '3 tablets once', '4 tablets once', '4 tablets once', '5 tablets once', '5 tablets once', '7 tablets once', '7 tablets once', '9 tablets once', '9 tablets once']);
});

test('S. haematobium and mixed bands', () => {
  assert.deepEqual([5, 5.9, 6, 7.9, 8, 10.9, 11, 13.9, 14, 18.9, 19, 23.9, 24, 30].map((w) => t('haematobium', w)),
    ['2 tablets once', '2 tablets once', '3 tablets once', '3 tablets once', '4 tablets once', '4 tablets once', '5 tablets once', '5 tablets once', '7 tablets once', '7 tablets once', '9 tablets once', '9 tablets once', '11 tablets once', '11 tablets once']);
  assert.equal(t('mixed', 24), '11 tablets once');
});

test('floors and contraindications', () => {
  assert.equal(r({ species: 'mansoni', weight: '4.9', age: '1' }).bandLabel, 'Below the label');
  assert.equal(r({ species: 'mansoni', weight: '6', age: '0.2' }).bandLabel, 'Below the label');
  assert.equal(r({ species: 'mansoni', weight: '31', age: '6' }).bandLabel, 'Outside the label');
  assert.equal(r({ species: 'mansoni', weight: '12', age: '3', cysticercosis: 'yes' }).bandLabel, 'Contraindicated');
  assert.ok(r({ species: 'mansoni', weight: '12', age: '3' }).notes.some((n) => /not all entered/.test(n)));
  assert.equal(r({ weight: '12', age: '3' }).valid, false);
});
