// spec-v1561 tool 1: PB or MB and the 2018 MDT. The 5/6 lesion edge, nerve and smear, unassessed nerve, the
// child doses, and refusals.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leprosyClassifyMdt as l } from '../../lib/leprosy-classify-mdt-v1561.js';

test('1-5 lesions with no nerve involvement and no bacilli is PB; more than 5, nerves or a positive smear is MB', () => {
  assert.equal(l({ lesions: '5', nerve: 'no', smear: 'negative', age: '30' }).bandLabel, 'PB, 6 months');
  assert.equal(l({ lesions: '6', age: '30' }).bandLabel, 'MB, 12 months');
  assert.equal(l({ lesions: '2', nerve: 'yes', age: '30' }).bandLabel, 'MB, 12 months');
  assert.equal(l({ lesions: '1', nerve: 'no', smear: 'positive', age: '30' }).bandLabel, 'MB, 12 months');
  assert.equal(l({ lesions: '0', nerve: 'yes', age: '30' }).bandLabel, 'MB, 12 months');
});

test('an unassessed nerve never defaults to PB; a missing smear is disclosed', () => {
  assert.match(l({ lesions: '3', age: '30' }).message, /never read as none/);
  assert.match(l({ lesions: '3', nerve: 'no', age: '30' }).notes[0], /No smear result was entered/);
});

test('MDT doses by age and weight', () => {
  assert.match(l({ lesions: '6', age: '30' }).band, /rifampicin 600 mg once a month, clofazimine 300 mg once a month and 50 mg daily, and dapsone 100 mg daily, for 12 months/);
  assert.match(l({ lesions: '6', age: '12', weight: '45' }).band, /rifampicin 450 mg/);
  assert.match(l({ lesions: '6', age: '12', weight: '30' }).band, /rifampicin 300 mg once a month \(10 mg\/kg\).*dapsone 60 mg daily/);
  assert.match(l({ lesions: '6', age: '8', weight: '25' }).band, /rifampicin 250 mg/);
  assert.equal(l({ lesions: '6', age: '8' }).valid, false, 'under 10 needs a weight');
});

test('refusals', () => {
  assert.equal(l({ lesions: '0', nerve: 'no', age: '30' }).valid, false);
  assert.equal(l({ age: '30' }).valid, false);
});
