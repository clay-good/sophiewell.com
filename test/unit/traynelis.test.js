// spec-v448: Traynelis atlanto-occipital dislocation classification (types I-III).
// Worked-example tests: each type and its displacement description, numeric input, and the invalid-type guard.
// Types transcribed from Traynelis 1986 (J Neurosurg) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { traynelis } from '../../lib/traynelis-v448.js';

test('type II: longitudinal distraction (the META example)', () => {
  const r = traynelis({ type: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'II');
  assert.match(r.band, /longitudinal distraction \(vertical separation\)/);
});

test('type I: anterior displacement', () => {
  const r = traynelis({ type: 'I' });
  assert.equal(r.type, 'I');
  assert.match(r.band, /anterior displacement of the occiput/);
});

test('type III: posterior displacement', () => {
  assert.match(traynelis({ type: 'III' }).band, /posterior displacement of the occiput/);
});

test('numeric input maps to the types', () => {
  assert.equal(traynelis({ type: 1 }).type, 'I');
  assert.equal(traynelis({ type: 3 }).type, 'III');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(traynelis({}).valid, false);
  assert.equal(traynelis({ type: 'IV' }).valid, false);
  assert.equal(traynelis({ type: '0' }).valid, false);
});
