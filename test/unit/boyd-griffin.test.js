// spec-v458: Boyd-Griffin trochanteric fracture classification (types I-IV).
// Worked-example tests: each type and its fracture-line description, numeric input, and the invalid-type guard.
// Types transcribed from Boyd & Griffin 1949 (Arch Surg) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boydGriffin } from '../../lib/boyd-griffin-v458.js';

test('type II: comminuted intertrochanteric (the META example)', () => {
  const r = boydGriffin({ type: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'II');
  assert.match(r.band, /comminuted fracture along the intertrochanteric line/);
});

test('type I: simple intertrochanteric', () => {
  assert.match(boydGriffin({ type: 'I' }).band, /simple and undisplaced/);
});

test('type III: essentially subtrochanteric', () => {
  assert.match(boydGriffin({ type: 'III' }).band, /essentially subtrochanteric/);
});

test('type IV: trochanteric region plus proximal shaft', () => {
  const r = boydGriffin({ type: 'IV' });
  assert.equal(r.type, 'IV');
  assert.match(r.band, /proximal shaft in at least two planes/);
});

test('numeric input maps to the types', () => {
  assert.equal(boydGriffin({ type: 1 }).type, 'I');
  assert.equal(boydGriffin({ type: 4 }).type, 'IV');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(boydGriffin({}).valid, false);
  assert.equal(boydGriffin({ type: 'V' }).valid, false);
  assert.equal(boydGriffin({ type: '0' }).valid, false);
});
