// spec-v483: Vancouver periprosthetic femoral fracture classification (types AG/AL/B1/B2/B3/C).
// Worked-example tests: each type and its location/stem-stability description, and the invalid-type guard.
// Types transcribed from Duncan & Masri 1995 (Instr Course Lect) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vancouverPeriprosthetic } from '../../lib/vancouver-periprosthetic-v483.js';

test('type B2: stem loose, adequate bone (the META example)', () => {
  const r = vancouverPeriprosthetic({ type: 'B2' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'B2');
  assert.match(r.band, /the stem loose but adequate proximal bone stock/);
});

test('type AG: greater trochanter', () => {
  assert.match(vancouverPeriprosthetic({ type: 'AG' }).band, /fracture of the greater trochanter/);
});

test('type B1: stem well-fixed', () => {
  assert.match(vancouverPeriprosthetic({ type: 'B1' }).band, /the stem well-fixed/);
});

test('type B3: stem loose, deficient bone', () => {
  assert.match(vancouverPeriprosthetic({ type: 'B3' }).band, /poor or deficient proximal bone stock/);
});

test('type C: well below the stem tip', () => {
  const r = vancouverPeriprosthetic({ type: 'C' });
  assert.equal(r.type, 'C');
  assert.match(r.band, /well below the stem tip/);
});

test('lowercase input works', () => {
  assert.equal(vancouverPeriprosthetic({ type: 'al' }).type, 'AL');
});

test('an unknown type is invalid', () => {
  assert.equal(vancouverPeriprosthetic({}).valid, false);
  assert.equal(vancouverPeriprosthetic({ type: 'D' }).valid, false);
  assert.equal(vancouverPeriprosthetic({ type: 'A' }).valid, false);
});
