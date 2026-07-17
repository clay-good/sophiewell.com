// spec-v381: Winquist-Hansen classification of a femoral shaft fracture (types 0-IV). Worked-example
// tests: each type and its comminution/cortical-contact description, the unstable flag on types III-IV,
// roman + numeric + case-insensitive input, and the invalid-type guard. Types transcribed from Winquist
// 1984 (JBJS), cross-verified against orthopedic references (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { winquistHansen } from '../../lib/winquist-hansen-v381.js';

test('type III: large fragment, <50% cortical contact, flagged (the META example)', () => {
  const r = winquistHansen({ type: 'III' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'III');
  assert.equal(r.unstable, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /over 50% of the bone width/);
  assert.match(r.band, /less than 50% cortical contact/);
});

test('type 0 is no comminution, stable, not flagged', () => {
  const r = winquistHansen({ type: '0' });
  assert.equal(r.unstable, false);
  assert.match(r.band, /no comminution/);
});

test('type II retains >=50% cortical contact, not flagged', () => {
  const r = winquistHansen({ type: 'II' });
  assert.equal(r.unstable, false);
  assert.match(r.band, /at least 50% cortical contact/);
});

test('type IV is circumferential with no cortical contact, flagged', () => {
  const r = winquistHansen({ type: 'IV' });
  assert.equal(r.unstable, true);
  assert.match(r.band, /no cortical contact/);
});

test('numeric and case-insensitive input map to the types', () => {
  assert.equal(winquistHansen({ type: 3 }).type, 'III');
  assert.equal(winquistHansen({ type: 0 }).type, '0');
  assert.equal(winquistHansen({ type: 'iv' }).type, 'IV');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(winquistHansen({}).valid, false);
  assert.equal(winquistHansen({ type: 'V' }).valid, false);
  assert.equal(winquistHansen({ type: '5' }).valid, false);
});
