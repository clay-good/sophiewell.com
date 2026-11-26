// spec-v1821: the gap a tile owns in its STRUCTURE rather than in a sentence.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ownsAGapKey } from '../lib/asking-language.js';

test('a gap list that GAINED the dropped field owns the gap', () => {
  assert.equal(ownsAGapKey({ unanswered: ['In writing, signed and dated'] }, { unanswered: [] }), true);
  assert.equal(ownsAGapKey({ missing: ['item 2, a serum IgG4'] }, { missing: [] }), true);
  assert.equal(ownsAGapKey({ unassessed: ['the mean deviation'] }, { unassessed: [] }), true);
});

test('a list that was already populated owns nothing -- the movement rule (spec-v1196)', () => {
  const same = ['the mean deviation'];
  assert.equal(ownsAGapKey({ unassessed: same }, { unassessed: same }), false);
  assert.equal(ownsAGapKey({ missing: ['a'] }, { missing: ['a', 'b'] }), false, 'a list that SHRANK');
});

test('the key is matched on its camelCase segments, not as a substring', () => {
  assert.equal(ownsAGapKey({ intensityMissing: ['x'] }, {}), true);
  assert.equal(ownsAGapKey({ missingAtCeiling: ['x'] }, {}), true);
  assert.equal(ownsAGapKey({ notEntered: ['x'] }, {}), true, 'two segments, tested as a phrase');
  assert.equal(ownsAGapKey({ dismissing: ['x'] }, {}), false, 'a substring is not a word');
  assert.equal(ownsAGapKey({ notes: ['x'] }, {}), false);
  assert.equal(ownsAGapKey({ criteria: ['x'] }, {}), false);
});

test('only a list of strings counts, and only on an object', () => {
  assert.equal(ownsAGapKey({ missing: [{ name: 'x' }] }, {}), false, 'a list of objects names nothing');
  assert.equal(ownsAGapKey({ missing: 'a string' }, {}), false);
  assert.equal(ownsAGapKey(null, {}), false);
  assert.equal(ownsAGapKey('band', {}), false);
});
