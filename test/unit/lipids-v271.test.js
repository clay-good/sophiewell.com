// spec-v271: worked examples for the Castelli Risk Index (I and II). Formula spec-v97
// verified against Castelli 1983 (Circulation) and standard lipid references:
// Risk Index-I = total cholesterol / HDL-C; Risk Index-II = LDL-C / HDL-C.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { castelli } from '../../lib/lipids-v271.js';

test('castelli: a worked example', () => {
  const r = castelli({ tc: 200, ldl: 130, hdl: 50 });
  // CRI-I = 200/50 = 4.0; CRI-II = 130/50 = 2.6.
  assert.equal(r.valid, true);
  assert.equal(r.score, 4);
  assert.equal(r.cri2, 2.6);
  assert.equal(r.abnormal, false);
  assert.ok(r.band.includes('Risk Index-I 4'));
  assert.ok(r.band.includes('Risk Index-II 2.6'));
});

test('castelli: a higher (more atherogenic) profile', () => {
  const r = castelli({ tc: 280, ldl: 190, hdl: 35 });
  // CRI-I = 280/35 = 8.0; CRI-II = 190/35 = 5.4286 -> r2 5.43.
  assert.equal(r.score, 8);
  assert.equal(r.cri2, 5.43);
});

test('castelli: missing any field is invalid, not a crash', () => {
  assert.equal(castelli({ tc: 200, ldl: 130 }).valid, false);
  assert.equal(castelli({}).valid, false);
  assert.equal(castelli().valid, false);
});

test('castelli: out-of-range inputs are rejected', () => {
  assert.equal(castelli({ tc: 200, ldl: 130, hdl: 0 }).valid, false);
  assert.equal(castelli({ tc: 0, ldl: 130, hdl: 50 }).valid, false);
});
