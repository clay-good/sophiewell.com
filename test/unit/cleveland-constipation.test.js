// spec-v665: Cleveland Clinic (Wexner) Constipation Score.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { clevelandConstipation, CLEVELAND_ITEMS } from '../../lib/cleveland-constipation-v665.js';

const zero = { frequency: '0', difficulty: '0', completeness: '0', pain: '0', time: '0', assistance: '0', failure: '0', history: '0' };
const max = { frequency: '4', difficulty: '4', completeness: '4', pain: '4', time: '4', assistance: '2', failure: '4', history: '4' };

test('8 items; max is 30 (7x4 + assistance 2), min 0', () => {
  assert.equal(CLEVELAND_ITEMS.length, 8);
  assert.equal(clevelandConstipation(zero).total, 0);
  assert.equal(clevelandConstipation(max).total, 30);
});

test('assistance item maxes at 2, not 4', () => {
  assert.equal(clevelandConstipation({ ...zero, assistance: '2' }).total, 2);
  assert.equal(clevelandConstipation({ ...zero, assistance: '3' }).valid, false); // out of range
  assert.equal(clevelandConstipation({ ...zero, frequency: '4' }).total, 4); // a 0-4 item
  assert.equal(clevelandConstipation({ ...zero, frequency: '5' }).valid, false);
});

test('cutoff is strictly > 15: 15 is not constipated, 16 is', () => {
  // build a total of exactly 15: 4+4+4+2+1+0+0+0 = 15
  const at15 = { frequency: '4', difficulty: '4', completeness: '4', pain: '2', time: '1', assistance: '0', failure: '0', history: '0' };
  assert.equal(clevelandConstipation(at15).total, 15);
  assert.equal(clevelandConstipation(at15).constipated, false);
  const at16 = { ...at15, time: '2' };
  assert.equal(clevelandConstipation(at16).total, 16);
  assert.equal(clevelandConstipation(at16).constipated, true);
});

test('META example: 2+3+2+2+2+1+2+3 = 17, above cutoff', () => {
  const r = clevelandConstipation({ frequency: '2', difficulty: '3', completeness: '2', pain: '2', time: '2', assistance: '1', failure: '2', history: '3' });
  assert.equal(r.total, 17);
  assert.equal(r.constipated, true);
  assert.match(r.bandLabel, /Cleveland constipation 17 of 30/);
});

test('all eight items required', () => {
  const partial = { ...zero };
  delete partial.history;
  assert.equal(clevelandConstipation(partial).valid, false);
  assert.equal(clevelandConstipation(partial).code, 'MISSING_INPUT');
});
