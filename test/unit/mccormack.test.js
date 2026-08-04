// spec-v646: McCormack Load-Sharing Classification of spine fractures.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { mccormackLsc } from '../../lib/mccormack-v646.js';

test('range: minimum 3 (all 1) and maximum 9 (all 3)', () => {
  assert.equal(mccormackLsc({ comminution: '1', apposition: '1', kyphosis: '1' }).total, 3);
  assert.equal(mccormackLsc({ comminution: '3', apposition: '3', kyphosis: '3' }).total, 9);
});

test('META example: comminution 3 + apposition 2 + kyphosis 2 = 7, predicts short-segment failure', () => {
  const r = mccormackLsc({ comminution: '3', apposition: '2', kyphosis: '2' });
  assert.equal(r.total, 7);
  assert.equal(r.abnormal, true);
  assert.match(r.bandLabel, /Load-Sharing 7 of 9/);
  assert.match(r.bandLabel, /anterior support or a longer construct/);
});

test('threshold is 6/7: 6 says short-segment suffices, 7 predicts failure', () => {
  const six = mccormackLsc({ comminution: '2', apposition: '2', kyphosis: '2' });
  assert.equal(six.total, 6);
  assert.equal(six.abnormal, false);
  assert.match(six.bandLabel, /short-segment posterior fixation is likely to suffice/);
  const seven = mccormackLsc({ comminution: '3', apposition: '2', kyphosis: '2' });
  assert.equal(seven.total, 7);
  assert.equal(seven.abnormal, true);
});

test('each component contributes its own 1-3 value', () => {
  const base = { comminution: '1', apposition: '1', kyphosis: '1' }; // 3
  assert.equal(mccormackLsc({ ...base, comminution: '3' }).total, 5);
  assert.equal(mccormackLsc({ ...base, apposition: '3' }).total, 5);
  assert.equal(mccormackLsc({ ...base, kyphosis: '3' }).total, 5);
});

test('all three components are required', () => {
  const r = mccormackLsc({ comminution: '2', apposition: '2' });
  assert.equal(r.valid, false);
  assert.equal(r.code, 'MISSING_INPUT');
  assert.equal(r.field, 'kyphosis');
});

test('out-of-range levels are rejected', () => {
  assert.equal(mccormackLsc({ comminution: '4', apposition: '2', kyphosis: '2' }).valid, false);
  assert.equal(mccormackLsc({ comminution: '0', apposition: '2', kyphosis: '2' }).valid, false);
  assert.equal(mccormackLsc({ comminution: '2.5', apposition: '2', kyphosis: '2' }).valid, false);
});
