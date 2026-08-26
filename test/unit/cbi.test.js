// spec-v780: Copenhagen Burnout Inventory (CBI).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { cbi } from '../../lib/cbi-v780.js';

function fill(p, w, c) {
  const o = {};
  for (let n = 1; n <= 6; n += 1) o[`p${n}`] = p;
  for (let n = 1; n <= 7; n += 1) o[`w${n}`] = w;
  for (let n = 1; n <= 6; n += 1) o[`c${n}`] = c;
  return o;
}

test('all items at the floor -> every scale 0', () => {
  const r = cbi(fill(0, 0, 0));
  assert.equal(r.valid, true);
  assert.equal(r.personal, 0);
  // w7 is reverse scored, so a raw 0 on it contributes 100.
  assert.equal(r.work, Math.round((100 / 7) * 100) / 100);
  assert.equal(r.client, 0);
});

test('the last work item is reverse scored', () => {
  const r = cbi(fill(75, 75, 75));
  assert.equal(r.personal, 75);
  assert.equal(r.client, 75);
  // six items at 75 plus a reversed 75 scoring 25 = 475 / 7.
  assert.equal(r.work, 67.86);
});

test('worked example: personal 75, work 75, client 50', () => {
  const r = cbi(fill('75', '75', '50'));
  assert.equal(r.personal, 75);
  assert.equal(r.work, 67.86);
  assert.equal(r.client, 50);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /personal burnout 75\.0 of 100/);
  assert.match(r.band, /client-related 50\.0 of 100/);
});

test('a scale with no answers is reported as not answered, not as zero', () => {
  const o = fill(50, 50, 50);
  for (let n = 1; n <= 6; n += 1) o[`c${n}`] = '';
  const r = cbi(o);
  assert.equal(r.client, null);
  assert.equal(r.answered.client, 0);
  assert.match(r.band, /client-related not answered/);
});

test('the published non-responder minimums are enforced', () => {
  const o = fill('', '', '');
  o.p1 = 100; o.p2 = 100;
  const two = cbi(o);
  assert.equal(two.personal, null, 'two answered personal items is under the minimum of three');
  o.p3 = 100;
  assert.equal(cbi(o).personal, 100);

  const w = fill('', '', '');
  w.w1 = 100; w.w2 = 100; w.w3 = 100;
  assert.equal(cbi(w).work, null, 'three answered work items is under the minimum of four');
  w.w4 = 100;
  assert.equal(cbi(w).work, 100);
});

test('the scales are independent and are never summed', () => {
  const o = fill(100, '', '');
  const r = cbi(o);
  assert.equal(r.personal, 100);
  assert.equal(r.work, null);
  assert.equal(r.client, null);
  assert.equal(r.total, undefined);
});

test('an off-scale value is rejected, and an entirely blank form falls back', () => {
  const bad = cbi({ ...fill(50, 50, 50), p2: 60 });
  assert.equal(bad.valid, false);
  assert.equal(bad.field, 'p2');
  assert.equal(cbi({}).valid, false);
});
