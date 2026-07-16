// spec-v343: Sanders classification of an intra-articular calcaneal fracture (types I-IV).
// Worked-example tests: each type and its CT-fragmentation description, the more-comminuted flag on
// types III-IV, roman + numeric + case-insensitive input, and the invalid-type guard. Definitions
// transcribed from Sanders 1993 (Clin Orthop Relat Res), cross-verified against foot-and-ankle
// trauma references (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sandersCalcaneal } from '../../lib/sanders-calcaneal-v343.js';

test('type III: three-part with depressed fragment, flagged (the META example)', () => {
  const r = sandersCalcaneal({ type: 'III' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'III');
  assert.equal(r.severe, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /three-part fracture \(two fracture lines\)/);
});

test('types I-II are not flagged; I is nondisplaced, II is two-part', () => {
  assert.match(sandersCalcaneal({ type: 'I' }).band, /nondisplaced \(< 2 mm\)/);
  assert.match(sandersCalcaneal({ type: 'II' }).band, /two-part fracture of the posterior facet/);
  for (const t of ['I', 'II']) {
    assert.equal(sandersCalcaneal({ type: t }).severe, false, t);
  }
});

test('type IV is the most comminuted (four or more parts) and flagged', () => {
  const r = sandersCalcaneal({ type: 'IV' });
  assert.equal(r.severe, true);
  assert.match(r.band, /four or more parts/);
});

test('numeric 1-4 and case-insensitive roman input map to the types', () => {
  assert.equal(sandersCalcaneal({ type: '1' }).type, 'I');
  assert.equal(sandersCalcaneal({ type: 4 }).type, 'IV');
  assert.equal(sandersCalcaneal({ type: 'iii' }).type, 'III');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(sandersCalcaneal({}).valid, false);
  assert.equal(sandersCalcaneal({ type: 'V' }).valid, false);
  assert.equal(sandersCalcaneal({ type: '5' }).valid, false);
});
