// spec-v775: PFDI-20 (Pelvic Floor Distress Inventory short form).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { pfdi20 } from '../../lib/pfdi20-v775.js';

function fill(v) {
  const o = {};
  for (let n = 1; n <= 20; n += 1) o[`q${n}`] = v;
  return o;
}

test('all items 0 -> every subscale and the summary are 0', () => {
  const r = pfdi20(fill(0));
  assert.equal(r.valid, true);
  assert.equal(r.popdi, 0);
  assert.equal(r.cradi, 0);
  assert.equal(r.udi, 0);
  assert.equal(r.total, 0);
  assert.equal(r.abnormal, false);
});

test('all items 4 -> every subscale 100 and the summary 300, the ceiling', () => {
  const r = pfdi20(fill(4));
  assert.equal(r.popdi, 100);
  assert.equal(r.cradi, 100);
  assert.equal(r.udi, 100);
  assert.equal(r.total, 300);
});

test('worked example: all items 2 -> each subscale 50, summary 150', () => {
  const r = pfdi20(fill('2'));
  assert.equal(r.popdi, 50);
  assert.equal(r.cradi, 50);
  assert.equal(r.udi, 50);
  assert.equal(r.total, 150);
  assert.match(r.band, /PFDI-20 summary 150\.0 of 300/);
});

test('subscales are independent: only urinary symptoms score only UDI-6', () => {
  const o = fill(0);
  for (let n = 15; n <= 20; n += 1) o[`q${n}`] = 4;
  const r = pfdi20(o);
  assert.equal(r.popdi, 0);
  assert.equal(r.cradi, 0);
  assert.equal(r.udi, 100);
  assert.equal(r.total, 100);
});

test('a blank item drops out of its own denominator, it does not count as 0', () => {
  const o = fill(0);
  o.q1 = 4;
  o.q2 = '';
  o.q3 = '';
  o.q4 = '';
  o.q5 = '';
  o.q6 = '';
  const r = pfdi20(o);
  assert.equal(r.answered.popdi, 1);
  assert.equal(r.popdi, 100);
});

test('an out-of-range item is invalid, and an all-blank subscale is invalid', () => {
  const bad = pfdi20({ ...fill(2), q7: 5 });
  assert.equal(bad.valid, false);
  assert.equal(bad.field, 'q7');

  const o = fill(2);
  for (let n = 15; n <= 20; n += 1) o[`q${n}`] = '';
  const blank = pfdi20(o);
  assert.equal(blank.valid, false);
  assert.equal(blank.field, 'q15');
});
