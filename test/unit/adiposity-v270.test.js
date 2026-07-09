// spec-v270: worked examples for the Cardiometabolic Index (CMI). Formula spec-v97
// verified against Wakabayashi & Daimon 2015 (Clin Chim Acta): CMI = (TG/HDL) x (waist/height).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cmi } from '../../lib/adiposity-v270.js';

test('cmi: a worked example', () => {
  const r = cmi({ tg: 150, hdl: 50, waist: 90, height: 170 });
  // TG/HDL = 3.0; waist/height = 90/170 = 0.5294; CMI = 1.5882 -> r2 1.59.
  assert.equal(r.valid, true);
  assert.equal(r.score, 1.59);
  assert.equal(r.abnormal, false);
  assert.ok(r.band.includes('Cardiometabolic Index 1.59'));
  assert.ok(r.detail.includes('TG/HDL 3'));
});

test('cmi: a higher (worse) profile', () => {
  const r = cmi({ tg: 300, hdl: 35, waist: 110, height: 165 });
  // TG/HDL = 8.5714; waist/height = 0.6667; CMI = 5.7143 -> r2 5.71.
  assert.equal(r.valid, true);
  assert.equal(r.score, 5.71);
  assert.ok(r.score > 1.59);
});

test('cmi: missing any field is invalid, not a crash', () => {
  assert.equal(cmi({ tg: 150, hdl: 50, waist: 90 }).valid, false);
  assert.equal(cmi({}).valid, false);
  assert.equal(cmi().valid, false);
});

test('cmi: out-of-range inputs are rejected', () => {
  assert.equal(cmi({ tg: 150, hdl: 0, waist: 90, height: 170 }).valid, false);
  assert.equal(cmi({ tg: 150, hdl: 50, waist: 90, height: 0 }).valid, false);
});
