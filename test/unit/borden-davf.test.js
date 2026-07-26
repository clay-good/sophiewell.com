// spec-v441: Borden classification of dural AV fistula (types I-III).
// Worked-example tests: each type and its venous-drainage description, numeric input, and the invalid-type guard.
// Types transcribed from Borden 1995 (J Neurosurg) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bordenDavf } from '../../lib/borden-davf-v441.js';

test('type II: cortical venous reflux (the META example)', () => {
  const r = bordenDavf({ type: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'II');
  assert.match(r.band, /retrograde flow into cortical veins/);
});

test('type I: benign, no cortical drainage', () => {
  const r = bordenDavf({ type: 'I' });
  assert.equal(r.type, 'I');
  assert.match(r.band, /no cortical venous drainage \(benign\)/);
});

test('type III: cortical drainage only, aggressive', () => {
  const r = bordenDavf({ type: 'III' });
  assert.equal(r.type, 'III');
  assert.match(r.band, /cortical veins only, without a dural sinus \(aggressive\)/);
});

test('numeric input maps to the types', () => {
  assert.equal(bordenDavf({ type: 1 }).type, 'I');
  assert.equal(bordenDavf({ type: 3 }).type, 'III');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(bordenDavf({}).valid, false);
  assert.equal(bordenDavf({ type: 'IV' }).valid, false);
  assert.equal(bordenDavf({ type: '0' }).valid, false);
});
