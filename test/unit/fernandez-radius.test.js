// spec-v489: Fernandez distal radius fracture classification (types I-V).
// Worked-example tests: each type and its mechanism description, numeric input, invalid-type guard.
// Types transcribed from Fernandez 1993 (Instr Course Lect) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fernandezRadius } from '../../lib/fernandez-radius-v489.js';

test('type I: bending fracture (the META example)', () => {
  const r = fernandezRadius({ type: 'I' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'I');
  assert.match(r.band, /a bending fracture of the metaphysis .*Colles and Smith/);
});

test('type II: shearing fracture', () => {
  assert.match(fernandezRadius({ type: 'II' }).band, /a shearing fracture of the joint surface/);
});

test('type III: compression / die-punch', () => {
  assert.match(fernandezRadius({ type: 'III' }).band, /compression of the articular surface/);
});

test('type IV: avulsion / radiocarpal fracture-dislocation', () => {
  assert.match(fernandezRadius({ type: 'IV' }).band, /avulsion fractures and radiocarpal fracture-dislocations/);
});

test('type V: combined high-velocity', () => {
  const r = fernandezRadius({ type: 'V' });
  assert.equal(r.type, 'V');
  assert.match(r.band, /combined fractures; high-velocity/);
});

test('numeric input maps to the types', () => {
  assert.equal(fernandezRadius({ type: 1 }).type, 'I');
  assert.equal(fernandezRadius({ type: 5 }).type, 'V');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(fernandezRadius({}).valid, false);
  assert.equal(fernandezRadius({ type: 'VI' }).valid, false);
  assert.equal(fernandezRadius({ type: '0' }).valid, false);
});
