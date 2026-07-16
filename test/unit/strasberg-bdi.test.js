// spec-v348: Strasberg classification of a bile duct injury (types A-E). Worked-example tests: each
// type and its injury description, the major-injury flag on types D-E, case-insensitive input, and
// the invalid-type guard. Definitions transcribed from Strasberg 1995 (J Am Coll Surg),
// cross-verified against hepatobiliary references (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { strasbergBdi } from '../../lib/strasberg-bdi-v348.js';

test('type D: lateral extrahepatic injury, flagged major (the META example)', () => {
  const r = strasbergBdi({ type: 'D' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'D');
  assert.equal(r.major, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /lateral injury to the extrahepatic bile duct/);
});

test('types A-C are minor and not flagged', () => {
  assert.match(strasbergBdi({ type: 'A' }).band, /small duct still in continuity/);
  assert.match(strasbergBdi({ type: 'B' }).band, /occlusion \(ligation\) of an aberrant/);
  for (const t of ['A', 'B', 'C']) {
    assert.equal(strasbergBdi({ type: t }).major, false, t);
  }
});

test('type E is transection of the main bile duct and flagged major', () => {
  const r = strasbergBdi({ type: 'E' });
  assert.equal(r.major, true);
  assert.match(r.band, /transection of the main bile duct/);
});

test('case-insensitive input maps to the types', () => {
  assert.equal(strasbergBdi({ type: 'a' }).type, 'A');
  assert.equal(strasbergBdi({ type: 'e' }).type, 'E');
  assert.equal(strasbergBdi({ type: 'D' }).type, 'D');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(strasbergBdi({}).valid, false);
  assert.equal(strasbergBdi({ type: 'F' }).valid, false);
  assert.equal(strasbergBdi({ type: '1' }).valid, false);
});
