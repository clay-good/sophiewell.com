// spec-v433: Modic classification of vertebral endplate MRI changes (types 1/2/3).
// Worked-example tests: each type and its T1/T2 signal, alias input, and the invalid-type guard.
// Types transcribed from Modic 1988 (Radiology) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { modicChanges } from '../../lib/modic-changes-v433.js';

test('type 1: edema, T1 low T2 high (the META example)', () => {
  const r = modicChanges({ type: '1' });
  assert.equal(r.valid, true);
  assert.equal(r.type, '1');
  assert.match(r.band, /edema \/ inflammation/);
  assert.match(r.band, /T1 hypointense, T2 hyperintense/);
});

test('type 2: fatty marrow', () => {
  const r = modicChanges({ type: '2' });
  assert.equal(r.type, '2');
  assert.match(r.band, /fatty \(yellow\) marrow/);
});

test('type 3: bony sclerosis, T1 low T2 low', () => {
  const r = modicChanges({ type: '3' });
  assert.equal(r.type, '3');
  assert.match(r.band, /subchondral bony sclerosis/);
  assert.match(r.band, /T1 hypointense, T2 hypointense/);
});

test('aliases: roman numerals map to the types', () => {
  assert.equal(modicChanges({ type: 'II' }).type, '2');
  assert.equal(modicChanges({ type: 3 }).type, '3');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(modicChanges({}).valid, false);
  assert.equal(modicChanges({ type: '4' }).valid, false);
  assert.equal(modicChanges({ type: '0' }).valid, false);
});
