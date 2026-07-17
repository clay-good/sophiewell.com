// spec-v364: Clinical Activity Score (CAS) for thyroid eye disease (7-item checklist). Worked-example
// tests: the count sums the checked items, the CAS >= 3 active threshold, the present-item list, boolean
// input forms, and the empty (0) case. Items transcribed from Mourits 1989 / EUGOGO (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { casTed } from '../../lib/cas-ted-v364.js';

test('three items -> CAS 3 of 7, active (the META example)', () => {
  const r = casTed({ pain: true, gazePain: true, lidSwelling: true });
  assert.equal(r.valid, true);
  assert.equal(r.total, 3);
  assert.equal(r.active, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /active thyroid eye disease/);
});

test('two items -> CAS 2, inactive (below the >= 3 threshold)', () => {
  const r = casTed({ chemosis: true, lidErythema: true });
  assert.equal(r.total, 2);
  assert.equal(r.active, false);
  assert.match(r.band, /inactive by CAS/);
});

test('all seven items -> CAS 7, active; present list is complete', () => {
  const r = casTed({ pain: true, gazePain: true, lidSwelling: true, lidErythema: true, conjRedness: true, chemosis: true, caruncle: true });
  assert.equal(r.total, 7);
  assert.equal(r.active, true);
  assert.equal(r.present.length, 7);
});

test('boolean input forms (true / "1" / "yes" / "on") all count', () => {
  assert.equal(casTed({ pain: true, gazePain: '1', chemosis: 'yes', caruncle: 'on' }).total, 4);
  assert.equal(casTed({ pain: '1', gazePain: '1', lidSwelling: '1' }).active, true);
});

test('no items checked -> CAS 0, inactive (always valid)', () => {
  const r = casTed({});
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(r.active, false);
});
