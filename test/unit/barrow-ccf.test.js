// spec-v440: Barrow classification of carotid-cavernous fistula (types A-D).
// Worked-example tests: each type and its arterial-supply description, alias input, and the invalid-type guard.
// Types transcribed from Barrow 1985 (J Neurosurg) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { barrowCcf } from '../../lib/barrow-ccf-v440.js';

test('type A: direct high-flow shunt (the META example)', () => {
  const r = barrowCcf({ type: 'A' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'A');
  assert.match(r.band, /direct high-flow shunt/);
});

test('type B: dural, ICA meningeal branches', () => {
  const r = barrowCcf({ type: 'B' });
  assert.equal(r.type, 'B');
  assert.match(r.band, /meningeal branches of the ICA/);
});

test('type C: dural, ECA meningeal branches', () => {
  assert.match(barrowCcf({ type: 'C' }).band, /external carotid artery \(ECA\)/);
});

test('type D: dural, both ICA and ECA', () => {
  const r = barrowCcf({ type: 'D' });
  assert.equal(r.type, 'D');
  assert.match(r.band, /both the ICA and the ECA/);
});

test('aliases: case-insensitive and 1-4 map to the types', () => {
  assert.equal(barrowCcf({ type: 'd' }).type, 'D');
  assert.equal(barrowCcf({ type: 1 }).type, 'A');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(barrowCcf({}).valid, false);
  assert.equal(barrowCcf({ type: 'E' }).valid, false);
  assert.equal(barrowCcf({ type: '0' }).valid, false);
});
