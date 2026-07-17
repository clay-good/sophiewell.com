// spec-v397: El Khoury (Boodhwani) functional classification of aortic regurgitation (types I/II/III).
// Worked-example tests: each type and its mechanism description, roman + numeric + Ia-Id subtype input,
// and the invalid-type guard. Types transcribed from Boodhwani 2009 (J Thorac Cardiovasc Surg)
// (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { elKhouryAr } from '../../lib/el-khoury-ar-v397.js';

test('type II: cusp prolapse (the META example)', () => {
  const r = elKhouryAr({ type: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'II');
  assert.match(r.band, /cusp prolapse/);
  assert.match(r.band, /excessive cusp motion/);
});

test('type I: normal motion with annulus dilatation, subtypes noted', () => {
  const r = elKhouryAr({ type: 'I' });
  assert.equal(r.type, 'I');
  assert.match(r.band, /functional aortic annulus/);
  assert.match(r.band, /Ia sinotubular junction/);
});

test('type III: cusp restriction', () => {
  const r = elKhouryAr({ type: 'III' });
  assert.equal(r.type, 'III');
  assert.match(r.band, /cusp restriction/);
});

test('numeric and Ia-Id subtype input map to the types', () => {
  assert.equal(elKhouryAr({ type: 2 }).type, 'II');
  assert.equal(elKhouryAr({ type: 'Ib' }).type, 'I');
  assert.equal(elKhouryAr({ type: 'ic' }).type, 'I');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(elKhouryAr({}).valid, false);
  assert.equal(elKhouryAr({ type: 'IV' }).valid, false);
  assert.equal(elKhouryAr({ type: '0' }).valid, false);
});
