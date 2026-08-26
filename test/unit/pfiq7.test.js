// spec-v776: PFIQ-7 (Pelvic Floor Impact Questionnaire short form).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { pfiq7 } from '../../lib/pfiq7-v776.js';

function fill(v) {
  const o = {};
  for (const p of ['u', 'c', 'p']) for (let n = 1; n <= 7; n += 1) o[`${p}${n}`] = v;
  return o;
}

test('all items 0 -> every scale and the summary are 0', () => {
  const r = pfiq7(fill(0));
  assert.equal(r.valid, true);
  assert.equal(r.uiq, 0);
  assert.equal(r.craiq, 0);
  assert.equal(r.popiq, 0);
  assert.equal(r.total, 0);
  assert.equal(r.abnormal, false);
});

test('all items 3 -> every scale 100 and the summary 300, the ceiling', () => {
  const r = pfiq7(fill(3));
  assert.equal(r.uiq, 100);
  assert.equal(r.craiq, 100);
  assert.equal(r.popiq, 100);
  assert.equal(r.total, 300);
});

test('worked example: all items 1 -> each scale 33.33, summary 99.99', () => {
  const r = pfiq7(fill('1'));
  assert.equal(r.uiq, 33.33);
  assert.equal(r.craiq, 33.33);
  assert.equal(r.popiq, 33.33);
  assert.equal(r.total, 99.99);
  assert.match(r.band, /PFIQ-7 summary 99\.99 of 300/);
});

test('scales are independent: bowel answers score only CRAIQ-7', () => {
  const o = fill(0);
  for (let n = 1; n <= 7; n += 1) o[`c${n}`] = 3;
  const r = pfiq7(o);
  assert.equal(r.uiq, 0);
  assert.equal(r.craiq, 100);
  assert.equal(r.popiq, 0);
  assert.equal(r.total, 100);
});

test('a blank item drops out of its own denominator, it does not count as 0', () => {
  const o = fill(0);
  o.u1 = 3;
  for (let n = 2; n <= 7; n += 1) o[`u${n}`] = '';
  const r = pfiq7(o);
  assert.equal(r.answered.uiq, 1);
  assert.equal(r.uiq, 100);
});

test('an out-of-range item is invalid, and an all-blank scale is invalid', () => {
  const bad = pfiq7({ ...fill(1), p3: 4 });
  assert.equal(bad.valid, false);
  assert.equal(bad.field, 'p3');

  const o = fill(1);
  for (let n = 1; n <= 7; n += 1) o[`p${n}`] = '';
  const blank = pfiq7(o);
  assert.equal(blank.valid, false);
  assert.equal(blank.field, 'p1');
});
