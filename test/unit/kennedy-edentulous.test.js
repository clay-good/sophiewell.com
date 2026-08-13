// spec-v719: Kennedy classification of the partially edentulous arch.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { kennedyEdentulous } from '../../lib/kennedy-edentulous-v719.js';

test('Class I, no modifications', () => {
  const r = kennedyEdentulous({ primaryClass: 'I', modifications: '0' });
  assert.equal(r.valid, true);
  assert.equal(r.kennedyClass, 'I');
  assert.equal(r.modifications, 0);
  assert.match(r.band, /Kennedy Class I/);
});

test('worked example: Class II with 1 modification', () => {
  const r = kennedyEdentulous({ primaryClass: 'II', modifications: '1' });
  assert.equal(r.kennedyClass, 'II');
  assert.equal(r.modifications, 1);
  assert.match(r.band, /Kennedy Class II, modification 1/);
});

test('modifications default to 0 when omitted', () => {
  const r = kennedyEdentulous({ primaryClass: 'III' });
  assert.equal(r.valid, true);
  assert.equal(r.modifications, 0);
});

test('Class IV admits no modifications (Applegate rule)', () => {
  assert.equal(kennedyEdentulous({ primaryClass: 'IV', modifications: '0' }).valid, true);
  const bad = kennedyEdentulous({ primaryClass: 'IV', modifications: '1' });
  assert.equal(bad.valid, false);
  assert.equal(bad.code, 'INVALID_INPUT');
});

test('class is required; modifications validated', () => {
  assert.equal(kennedyEdentulous({}).valid, false);
  assert.equal(kennedyEdentulous({}).field, 'primaryClass');
  assert.equal(kennedyEdentulous({ primaryClass: 'V' }).valid, false);
  assert.equal(kennedyEdentulous({ primaryClass: 'I', modifications: '5' }).valid, false);
});
