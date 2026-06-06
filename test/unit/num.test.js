// spec-v53 §4.1 / §6: the shared numeric helpers and the display guard.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { r1, r2, r3, num, fmt } from '../../lib/num.js';
import { boundsAdvisory, BOUNDS } from '../../lib/bounds.js';

test('r1/r2/r3 round to 1/2/3 decimals (behavior unchanged from the pre-v53 copies)', () => {
  assert.equal(r1(2.345), 2.3);
  assert.equal(r2(2.345), 2.35);
  assert.equal(r3(2.3456), 2.346);
  assert.equal(r1(10), 10);
});

test('num() returns the value for valid input, throws TypeError on non-finite, RangeError out of range', () => {
  assert.equal(num('x', 5, { min: 0, max: 10 }), 5);
  assert.throws(() => num('x', NaN), TypeError);
  assert.throws(() => num('x', Infinity), TypeError);
  assert.throws(() => num('x', 'a'), TypeError);
  assert.throws(() => num('x', undefined), TypeError);
  assert.throws(() => num('x', 11, { max: 10 }), RangeError);
  assert.throws(() => num('x', -1, { min: 0 }), RangeError);
});

test('fmt() shows formatted value with unit on the happy path', () => {
  assert.equal(fmt(2.345, { digits: 2, unit: 'mL/hr' }), '2.35 mL/hr');
  assert.equal(fmt(7, { unit: 'mmHg' }), '7 mmHg');
  assert.equal(fmt(7), '7');
});

test('fmt() returns the fallback (never a leaked token) for null/undefined/non-finite', () => {
  assert.equal(fmt(null, { fallback: '(enter SBP)' }), '(enter SBP)');
  assert.equal(fmt(undefined, { fallback: '(enter SBP)' }), '(enter SBP)');
  assert.equal(fmt(NaN, { fallback: '(check inputs)' }), '(check inputs)');
  assert.equal(fmt(Infinity, { fallback: '(check inputs)' }), '(check inputs)');
  assert.equal(fmt(-Infinity, { fallback: '(check inputs)' }), '(check inputs)');
  assert.equal(fmt(null), '--'); // default fallback
});

test('fmt() never emits the banned literal tokens for any of the adversarial values', () => {
  for (const bad of [null, undefined, NaN, Infinity, -Infinity]) {
    const out = fmt(bad, { fallback: 'n/a' });
    for (const token of ['NaN', 'undefined', 'Infinity', 'null']) {
      assert.ok(!out.includes(token), `fmt(${String(bad)}) leaked "${token}"`);
    }
  }
});

// ---- spec-v53 §6: Class-B plausibility advisories pinned per confirmed site ----

test('boundsAdvisory flags an impossible serum creatinine (Cockcroft-Gault Class-B site)', () => {
  const adv = boundsAdvisory('scr', 0.01);
  assert.ok(adv && adv.includes('scr'));
  assert.equal(boundsAdvisory('scr', 1.0), null); // a normal creatinine is not flagged
});

test('boundsAdvisory flags an impossible height (BMI / PBW Class-B sites)', () => {
  assert.ok(boundsAdvisory('heightM', 0.05)); // cm/m unit error
  assert.equal(boundsAdvisory('heightM', 1.75), null); // a normal height is not flagged
});

test('boundsAdvisory returns null for unknown keys and non-finite values (never throws)', () => {
  assert.equal(boundsAdvisory('not-a-key', 5), null);
  assert.equal(boundsAdvisory('scr', NaN), null);
  assert.equal(boundsAdvisory('scr', undefined), null);
});

test('every BOUNDS entry is well-formed (min < max, has unit + note)', () => {
  for (const [key, b] of Object.entries(BOUNDS)) {
    assert.ok(b.min < b.max, `${key}: min must be < max`);
    assert.equal(typeof b.unit, 'string');
    assert.ok(b.note && b.note.length > 0, `${key}: note required`);
  }
});
