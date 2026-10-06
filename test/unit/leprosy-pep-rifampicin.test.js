// spec-v1561 tool 2: SDR for leprosy contacts. Each Table 5 row, the weight precedence, the table gap, and refusals.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leprosyPepRifampicin as r } from '../../lib/leprosy-pep-rifampicin-v1561.js';

test('Table 5 rows', () => {
  assert.equal(r({ age: '15', weight: '50' }).bandLabel, '600 mg once');
  assert.equal(r({ age: '14', weight: '35' }).bandLabel, '450 mg once');
  assert.equal(r({ age: '7', weight: '22' }).bandLabel, '300 mg once');
  assert.equal(r({ age: '7', weight: '18' }).bandLabel, '180-270 mg once');
  assert.equal(r({ age: '12', weight: '19' }).bandLabel, '190-285 mg once', 'under 20 kg the weight row takes precedence');
  assert.equal(r({ age: '1.9', weight: '10' }).bandLabel, 'Under 2 years');
  assert.equal(r({ age: '5', weight: '21' }).valid, false, 'the table has no row for under 6 years at 20 kg or more');
});

test('refusals', () => {
  assert.equal(r({ weight: '20' }).valid, false);
  assert.equal(r({ age: '10' }).valid, false);
});
