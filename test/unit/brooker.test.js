// spec-v452: Brooker heterotopic ossification classification (classes I-IV).
// Worked-example tests: each class and its radiographic description, numeric input, and the invalid-class guard.
// Classes transcribed from Brooker 1973 (J Bone Joint Surg Am) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { brooker } from '../../lib/brooker-v452.js';

test('class II: spurs, >= 1 cm gap (the META example)', () => {
  const r = brooker({ cls: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.cls, 'II');
  assert.match(r.band, /at least 1 cm between opposing bone surfaces/);
});

test('class I: islands of bone in soft tissue', () => {
  const r = brooker({ cls: 'I' });
  assert.equal(r.cls, 'I');
  assert.match(r.band, /islands of bone within the soft tissues/);
});

test('class III: spurs, < 1 cm gap', () => {
  assert.match(brooker({ cls: 'III' }).band, /less than 1 cm/);
});

test('class IV: apparent bony ankylosis', () => {
  const r = brooker({ cls: 'IV' });
  assert.equal(r.cls, 'IV');
  assert.match(r.band, /apparent bony ankylosis/);
});

test('numeric input maps to the classes', () => {
  assert.equal(brooker({ cls: 1 }).cls, 'I');
  assert.equal(brooker({ cls: 4 }).cls, 'IV');
});

test('a missing or out-of-range class is invalid', () => {
  assert.equal(brooker({}).valid, false);
  assert.equal(brooker({ cls: 'V' }).valid, false);
  assert.equal(brooker({ cls: '0' }).valid, false);
});
