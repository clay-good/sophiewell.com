// spec-v1563: the yellow fever case definition, each level.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { yellowFeverCaseDef as yf } from '../../lib/yellow-fever-case-def-v1563.js';

test('yellow fever and the vaccine windows', () => {
  const s = { fever: 'yes', jaundice: 'yes' };
  assert.equal(yf(s).bandLabel, 'Suspected');
  assert.equal(yf({ ...s, igm: 'yes', vaccine: 'none' }).bandLabel, 'Probable');
  assert.equal(yf({ ...s, igm: 'yes', vaccine: 'd15to30' }).bandLabel, 'Suspected', 'IgM within 30 days of vaccine does not count');
  assert.equal(yf({ ...s, epi: 'yes', virology: 'yes', vaccine: 'd15to30' }).bandLabel, 'Confirmed', 'PCR needs only 14 days');
  assert.equal(yf({ ...s, epi: 'yes', virology: 'yes', vaccine: 'lt15' }).bandLabel, 'Probable');
  assert.equal(yf({ ...s, epi: 'yes', serology: 'yes', vaccine: 'd15to30' }).bandLabel, 'Probable');
  assert.equal(yf({ ...s, epi: 'yes', serology: 'yes', vaccine: 'none' }).bandLabel, 'Confirmed');
  assert.equal(yf({ fever: 'yes', jaundice: 'no' }).bandLabel, 'Not suspected');
  assert.equal(yf({ fever: 'yes' }).valid, false);
});
