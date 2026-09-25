// spec-v1496: the Turesky modified Quigley-Hein plaque index.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASKING } from '../lib/asking-language.js';
import { tureskyPlaque as t } from '../../lib/turesky-plaque-v1496.js';

const EX = { n0: '10', n1: '20', n2: '30', n3: '20', n4: '10', n5: '6' };

test('the worked example: the mean over 96 surfaces', () => {
  assert.equal(t(EX).band, 'Turesky plaque index 2.19 across 96 surfaces; 36 (38%) scored 3 or more, plaque beyond 1 mm from the margin.');
});

test('the mean is weighted by the surfaces at each score', () => {
  assert.equal(t({ n0: '0', n1: '0', n2: '0', n3: '0', n4: '0', n5: '4' }).index, 5);
  assert.equal(t({ n0: '5', n1: '0', n2: '0', n3: '0', n4: '0', n5: '0' }).abnormal, false);
});

test('every count is required, all-zero and fractions are refused', () => {
  const r = t({ ...EX, n3: '' });
  assert.equal(r.valid, false);
  assert.match(r.message, ASKING);
  assert.equal(t({ n0: '0', n1: '0', n2: '0', n3: '0', n4: '0', n5: '0' }).valid, false);
  assert.equal(t({ ...EX, n2: '1.5' }).valid, false);
});
