// spec-v782: FABQ (Fear-Avoidance Beliefs Questionnaire).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { fabq, UNSCORED_ITEMS } from '../../lib/fabq-v782.js';

function fill(v) {
  const o = {};
  for (let n = 1; n <= 16; n += 1) o[`q${n}`] = v;
  return o;
}

test('every item at 0 -> both subscales 0', () => {
  const r = fabq(fill(0));
  assert.equal(r.valid, true);
  assert.equal(r.physicalActivity, 0);
  assert.equal(r.work, 0);
  assert.equal(r.abnormal, false);
});

test('every item at 6 -> 24 and 42, the two ceilings', () => {
  const r = fabq(fill(6));
  assert.equal(r.physicalActivity, 24);
  assert.equal(r.work, 42);
});

test('the five unscored items change neither subscale', () => {
  const base = fabq(fill(0));
  const o = fill(0);
  for (const n of UNSCORED_ITEMS) o[`q${n}`] = 6;
  const r = fabq(o);
  assert.deepEqual(UNSCORED_ITEMS, [1, 8, 13, 14, 16]);
  assert.equal(r.physicalActivity, base.physicalActivity);
  assert.equal(r.work, base.work);
});

test('worked example: activity items 4 and work items 5 -> 16 and 35', () => {
  const o = { q2: '4', q3: '4', q4: '4', q5: '4', q6: '5', q7: '5', q9: '5', q10: '5', q11: '5', q12: '5', q15: '5' };
  const r = fabq(o);
  assert.equal(r.physicalActivity, 16);
  assert.equal(r.work, 35);
  assert.match(r.band, /physical activity 16 of 24/);
  assert.match(r.band, /work 35 of 42/);
});

test('item 11 counts toward work, and item 8 does not', () => {
  assert.equal(fabq({ ...fill(0), q11: 6 }).work, 6);
  assert.equal(fabq({ ...fill(0), q8: 6 }).work, 0);
});

test('the subscales are independent and no combined total is produced', () => {
  const o = fill(0);
  for (const n of [2, 3, 4, 5]) o[`q${n}`] = 6;
  const r = fabq(o);
  assert.equal(r.physicalActivity, 24);
  assert.equal(r.work, 0);
  assert.equal(r.total, undefined);
});

test('an unanswered subscale reports as not answered rather than as zero', () => {
  const o = {};
  for (const n of [2, 3, 4, 5]) o[`q${n}`] = 3;
  const r = fabq(o);
  assert.equal(r.physicalActivity, 12);
  assert.equal(r.work, null);
  assert.match(r.band, /work not answered/);
});

test('an out-of-range value is rejected, including on an unscored item', () => {
  assert.equal(fabq({ ...fill(3), q5: 7 }).field, 'q5');
  assert.equal(fabq({ ...fill(3), q8: 9 }).field, 'q8');
  assert.equal(fabq({}).valid, false);
});
