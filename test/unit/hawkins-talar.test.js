// spec-v342: Hawkins classification of a talar neck fracture (types I-IV). Worked-example tests: each
// type and its fracture-pattern description, the AVN-risk range, the more-severe flag on types
// III-IV, roman + numeric + case-insensitive input, and the invalid-type guard. Definitions
// transcribed from Hawkins 1970 (JBJS) and Canale-Kelly 1978 (JBJS), cross-verified against
// foot-and-ankle trauma references (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hawkinsTalar } from '../../lib/hawkins-talar-v342.js';

test('type III: subtalar + ankle dislocation, flagged, high AVN (the META example)', () => {
  const r = hawkinsTalar({ type: 'III' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'III');
  assert.equal(r.severe, true);
  assert.equal(r.abnormal, true);
  assert.equal(r.avnRisk, '~70-100%');
  assert.match(r.band, /both the subtalar and the ankle \(tibiotalar\) joints/);
});

test('types I-II are not flagged; I is nondisplaced, II has subtalar dislocation', () => {
  assert.match(hawkinsTalar({ type: 'I' }).band, /nondisplaced talar neck fracture/);
  assert.equal(hawkinsTalar({ type: 'I' }).avnRisk, '~0-15%');
  assert.match(hawkinsTalar({ type: 'II' }).band, /subluxation or dislocation of the subtalar joint/);
  for (const t of ['I', 'II']) {
    assert.equal(hawkinsTalar({ type: t }).severe, false, t);
  }
});

test('type IV is the Canale-Kelly addition (talonavicular) and flagged', () => {
  const r = hawkinsTalar({ type: 'IV' });
  assert.equal(r.severe, true);
  assert.match(r.band, /talonavicular joint/);
});

test('numeric 1-4 and case-insensitive roman input map to the types', () => {
  assert.equal(hawkinsTalar({ type: '1' }).type, 'I');
  assert.equal(hawkinsTalar({ type: 4 }).type, 'IV');
  assert.equal(hawkinsTalar({ type: 'iii' }).type, 'III');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(hawkinsTalar({}).valid, false);
  assert.equal(hawkinsTalar({ type: 'V' }).valid, false);
  assert.equal(hawkinsTalar({ type: '5' }).valid, false);
});
