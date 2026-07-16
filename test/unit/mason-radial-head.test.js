// spec-v341: Mason-Johnston classification of a radial head fracture (types I-IV). Worked-example
// tests: each type and its fracture-pattern description, the more-severe flag on types III-IV, roman
// + numeric + case-insensitive input, and the invalid-type guard. Definitions transcribed from Mason
// 1954 (Br J Surg) and Johnston 1962 (Ulster Med J), cross-verified against elbow-trauma references
// (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { masonRadialHead } from '../../lib/mason-radial-head-v341.js';

test('type III: comminuted whole head, flagged severe (the META example)', () => {
  const r = masonRadialHead({ type: 'III' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'III');
  assert.equal(r.severe, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /comminuted fracture of the entire radial head/);
});

test('types I-II are not flagged; I is nondisplaced, II is displaced partial-articular', () => {
  assert.match(masonRadialHead({ type: 'I' }).band, /nondisplaced or minimally displaced/);
  assert.match(masonRadialHead({ type: 'II' }).band, /displaced \(> 2 mm\) partial-articular/);
  for (const t of ['I', 'II']) {
    assert.equal(masonRadialHead({ type: t }).severe, false, t);
  }
});

test('type IV is the Johnston addition (with elbow dislocation) and flagged', () => {
  const r = masonRadialHead({ type: 'IV' });
  assert.equal(r.severe, true);
  assert.match(r.band, /associated elbow \(ulnohumeral\) dislocation/);
});

test('numeric 1-4 and case-insensitive roman input map to the types', () => {
  assert.equal(masonRadialHead({ type: '1' }).type, 'I');
  assert.equal(masonRadialHead({ type: 4 }).type, 'IV');
  assert.equal(masonRadialHead({ type: 'iii' }).type, 'III');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(masonRadialHead({}).valid, false);
  assert.equal(masonRadialHead({ type: 'V' }).valid, false);
  assert.equal(masonRadialHead({ type: '5' }).valid, false);
});
