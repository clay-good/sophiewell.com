// spec-v774: Boston Carpal Tunnel Questionnaire (BCTQ).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { bctq } from '../../lib/bctq-v774.js';

function fill(s, f) {
  const o = {};
  for (let n = 1; n <= 11; n += 1) o[`s${n}`] = s;
  for (let n = 1; n <= 8; n += 1) o[`f${n}`] = f;
  return o;
}

test('all 1s -> both scales at the floor of 1.00', () => {
  const r = bctq(fill(1, 1));
  assert.equal(r.valid, true);
  assert.equal(r.sssText, '1.00');
  assert.equal(r.fssText, '1.00');
  assert.equal(r.sssSum, 11);
  assert.equal(r.fssSum, 8);
  assert.equal(r.abnormal, false);
});

test('all 5s -> both scales at the ceiling of 5.00', () => {
  const r = bctq(fill(5, 5));
  assert.equal(r.sssText, '5.00');
  assert.equal(r.fssText, '5.00');
  assert.equal(r.sssSum, 55);
  assert.equal(r.fssSum, 40);
  assert.equal(r.abnormal, true);
});

test('worked example: symptoms all 3, function all 2 -> 3.00 and 2.00', () => {
  const r = bctq(fill('3', '2'));
  assert.equal(r.sssText, '3.00');
  assert.equal(r.fssText, '2.00');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /symptom severity 3\.00 of 5/);
  assert.match(r.band, /functional status 2\.00 of 5/);
});

test('the two scales are independent means, not a shared sum', () => {
  const o = fill(1, 1);
  o.s1 = 5;
  const r = bctq(o);
  assert.equal(r.sssSum, 15);
  assert.equal(r.fssSum, 8);
  assert.equal(r.sssText, (15 / 11).toFixed(2));
  assert.equal(r.fssText, '1.00');
});

test('a missing or out-of-range item is invalid, not silently dropped', () => {
  const o = fill(3, 3);
  delete o.f4;
  const bad = bctq(o);
  assert.equal(bad.valid, false);
  assert.equal(bad.field, 'f4');

  const o2 = fill(3, 3);
  o2.s2 = 6;
  assert.equal(bctq(o2).valid, false);
});
