// spec-v1417: Snyder SLAP types I-IV (Snyder 1990; definitions as given by Hahn 2023).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { snyderSlap } from '../../lib/snyder-slap-v1417.js';

test('the four types from the two findings', () => {
  assert.equal(snyderSlap({ labrum: 'frayed', biceps: 'intact' }).type, 'I');
  assert.equal(snyderSlap({ labrum: 'detached' }).type, 'II');
  assert.equal(snyderSlap({ labrum: 'detached', biceps: 'intact' }).type, 'II');
  assert.equal(snyderSlap({ labrum: 'bucket', biceps: 'intact' }).type, 'III');
  assert.equal(snyderSlap({ labrum: 'bucket', biceps: 'extends' }).type, 'IV');
});

test('type I is the only one not flagged', () => {
  assert.equal(snyderSlap({ labrum: 'frayed', biceps: 'intact' }).abnormal, false);
  assert.equal(snyderSlap({ labrum: 'bucket', biceps: 'extends' }).abnormal, true);
});

test('fraying into the biceps fits no type and is not forced into one', () => {
  const r = snyderSlap({ labrum: 'frayed', biceps: 'extends' });
  assert.equal(r.valid, true);
  assert.equal(r.type, null);
  assert.match(r.band, /Does not fit one Snyder type/);
});

test('every answer carries the arthroscopy and reliability caveats', () => {
  const r = snyderSlap({ labrum: 'detached' });
  assert.ok(r.notes.some((n) => /only at arthroscopy/.test(n)));
  assert.ok(r.notes.some((n) => /kappa 0\.31/.test(n)));
});

test('missing findings are asked for, not guessed', () => {
  assert.equal(snyderSlap({}).valid, false);
  assert.equal(snyderSlap({ labrum: 'torn' }).valid, false);
  assert.match(snyderSlap({ labrum: 'bucket' }).message, /biceps tendon/);
  assert.match(snyderSlap({ labrum: 'frayed' }).message, /biceps tendon/);
});
