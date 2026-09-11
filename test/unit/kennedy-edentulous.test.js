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

// spec-v1239: this test asserted the defect, and its title said so. An omitted
// modification count was read as 0, and 0 here is a CLAIM -- that there are no
// additional edentulous areas. Class II mod 1 is a different arch from Class II
// and a partial denture is designed to it, so "nobody said" and "none" are not
// the same answer.
//
// The class itself is settled by the most-posterior area alone, so the tile
// still answers; what it adds is which part it does not know.
test('an omitted modification count is not a count of zero', () => {
  const r = kennedyEdentulous({ primaryClass: 'III' });
  assert.equal(r.valid, true);
  assert.equal(r.modifications, null);
  assert.equal(r.modificationsStated, false);
  assert.equal(r.bandLabel, 'Kennedy Class III');
  assert.match(r.band, /not stated/);
});

test('a stated zero is still an answer, and says nothing extra', () => {
  const r = kennedyEdentulous({ primaryClass: 'III', modifications: 0 });
  assert.equal(r.modifications, 0);
  assert.equal(r.modificationsStated, true);
  assert.doesNotMatch(r.band, /not stated/);
});

// Class IV admits no modifications under the Applegate rule, so there is
// nothing left unstated and nothing to disclose.
test('Class IV says nothing about modifications, because it cannot have any', () => {
  const r = kennedyEdentulous({ primaryClass: 'IV' });
  assert.equal(r.valid, true);
  assert.doesNotMatch(r.band, /not stated/);
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
