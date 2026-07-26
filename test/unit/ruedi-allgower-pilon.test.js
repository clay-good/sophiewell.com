// spec-v490: Ruedi-Allgower pilon fracture classification (types I-III).
// Worked-example tests: each type and its displacement/comminution description, numeric input, invalid guard.
// Types transcribed from Ruedi and Allgower 1979 (Clin Orthop Relat Res) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ruediAllgowerPilon } from '../../lib/ruedi-allgower-pilon-v490.js';

test('type II: displaced, minimal comminution (the META example)', () => {
  const r = ruediAllgowerPilon({ type: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'II');
  assert.match(r.band, /significant displacement of the articular surface, but with minimal comminution/);
});

test('type I: nondisplaced cleavage', () => {
  assert.match(ruediAllgowerPilon({ type: 'I' }).band, /a cleavage \(split\) fracture .* without significant displacement/);
});

test('type III: comminuted and impacted', () => {
  const r = ruediAllgowerPilon({ type: 'III' });
  assert.equal(r.type, 'III');
  assert.match(r.band, /comminution and impaction of the distal tibial articular surface/);
});

test('numeric input maps to the types', () => {
  assert.equal(ruediAllgowerPilon({ type: 1 }).type, 'I');
  assert.equal(ruediAllgowerPilon({ type: 3 }).type, 'III');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(ruediAllgowerPilon({}).valid, false);
  assert.equal(ruediAllgowerPilon({ type: 'IV' }).valid, false);
  assert.equal(ruediAllgowerPilon({ type: '0' }).valid, false);
});
