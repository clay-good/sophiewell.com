// spec-v739: Mayo classification of olecranon fractures.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { mayoOlecranon } from '../../lib/mayo-olecranon-v739.js';

test('undisplaced -> Type I (stability ignored)', () => {
  const r = mayoOlecranon({ displacement: 'undisplaced', comminution: 'noncomminuted' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'I');
  assert.equal(r.code, 'IA');
  assert.equal(r.abnormal, false);
});

test('undisplaced + comminuted -> IB', () => {
  const r = mayoOlecranon({ displacement: 'undisplaced', comminution: 'comminuted' });
  assert.equal(r.code, 'IB');
});

test('displaced + stable -> Type II', () => {
  const a = mayoOlecranon({ displacement: 'displaced', stability: 'stable', comminution: 'noncomminuted' });
  assert.equal(a.type, 'II');
  assert.equal(a.code, 'IIA');
  assert.equal(a.abnormal, false);
  const b = mayoOlecranon({ displacement: 'displaced', stability: 'stable', comminution: 'comminuted' });
  assert.equal(b.code, 'IIB');
});

test('displaced + unstable -> Type III (fracture-dislocation)', () => {
  const r = mayoOlecranon({ displacement: 'displaced', stability: 'unstable', comminution: 'comminuted' });
  assert.equal(r.type, 'III');
  assert.equal(r.code, 'IIIB');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /Mayo type IIIB /);
});

test('stability is the II-vs-III discriminator when displaced', () => {
  const two = mayoOlecranon({ displacement: 'displaced', stability: 'stable', comminution: 'noncomminuted' });
  const three = mayoOlecranon({ displacement: 'displaced', stability: 'unstable', comminution: 'noncomminuted' });
  assert.equal(two.type, 'II');
  assert.equal(three.type, 'III');
});

test('validation: displacement + comminution required; stability required only when displaced', () => {
  assert.equal(mayoOlecranon({}).valid, false);
  assert.equal(mayoOlecranon({}).field, 'displacement');
  assert.equal(mayoOlecranon({ displacement: 'displaced' }).field, 'comminution');
  assert.equal(mayoOlecranon({ displacement: 'displaced', comminution: 'noncomminuted' }).field, 'stability');
  assert.equal(mayoOlecranon({ displacement: 'bogus', comminution: 'noncomminuted' }).valid, false);
  // undisplaced does not require stability
  assert.equal(mayoOlecranon({ displacement: 'undisplaced', comminution: 'noncomminuted' }).valid, true);
});
