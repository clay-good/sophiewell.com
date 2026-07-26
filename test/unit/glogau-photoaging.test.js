// spec-v475: Glogau photoaging classification (types I-IV).
// Worked-example tests: each type and its photoaging-severity description, numeric input, invalid-type guard.
// Types transcribed from Glogau 1996 (Semin Cutan Med Surg) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { glogauPhotoaging } from '../../lib/glogau-photoaging-v475.js';

test('type II: wrinkles in motion (the META example)', () => {
  const r = glogauPhotoaging({ type: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'II');
  assert.match(r.band, /"wrinkles in motion"/);
  assert.match(r.band, /dynamic/);
});

test('type I: no wrinkles', () => {
  assert.match(glogauPhotoaging({ type: 'I' }).band, /"no wrinkles"/);
});

test('type III: wrinkles at rest', () => {
  assert.match(glogauPhotoaging({ type: 'III' }).band, /"wrinkles at rest"/);
});

test('type IV: only wrinkles', () => {
  const r = glogauPhotoaging({ type: 'IV' });
  assert.equal(r.type, 'IV');
  assert.match(r.band, /"only wrinkles"/);
});

test('numeric input maps to the types', () => {
  assert.equal(glogauPhotoaging({ type: 1 }).type, 'I');
  assert.equal(glogauPhotoaging({ type: 4 }).type, 'IV');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(glogauPhotoaging({}).valid, false);
  assert.equal(glogauPhotoaging({ type: 'V' }).valid, false);
  assert.equal(glogauPhotoaging({ type: '0' }).valid, false);
});
