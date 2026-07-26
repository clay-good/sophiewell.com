// spec-v456: Leddy-Packer FDP avulsion ("jersey finger") classification (types I-III).
// Worked-example tests: each type and its retraction/fragment description, numeric input, invalid-type guard.
// Types transcribed from Leddy & Packer 1977 (J Hand Surg Am) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leddyPacker } from '../../lib/leddy-packer-v456.js';

test('type II: retraction to the PIP joint (the META example)', () => {
  const r = leddyPacker({ type: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'II');
  assert.match(r.band, /retracts to the level of the PIP joint/);
  assert.match(r.band, /most common/);
});

test('type I: retraction into the palm', () => {
  const r = leddyPacker({ type: 'I' });
  assert.equal(r.type, 'I');
  assert.match(r.band, /retracts into the palm/);
});

test('type III: bony fragment at the A4 pulley', () => {
  assert.match(leddyPacker({ type: 'III' }).band, /bony avulsion fragment is caught at the A4 pulley/);
});

test('numeric input maps to the types', () => {
  assert.equal(leddyPacker({ type: 1 }).type, 'I');
  assert.equal(leddyPacker({ type: 3 }).type, 'III');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(leddyPacker({}).valid, false);
  assert.equal(leddyPacker({ type: 'IV' }).valid, false);
  assert.equal(leddyPacker({ type: '0' }).valid, false);
});
