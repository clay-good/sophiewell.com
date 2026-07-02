// spec-v198 2.2: isthBat worked examples and guards.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isthBat } from '../../lib/subspecialty-v198.js';

test('abnormal for adult male at 5', () => {
  const r = isthBat({group:'male',epistaxis:2,surgery:3});
  assert.equal(r.valid, true);
  assert.equal(r.total, 5);
  assert.equal(r.abnormal, true);
});

test('same score normal for adult female threshold', () => {
  const r = isthBat({group:'female',epistaxis:2,surgery:2});
  assert.equal(r.total, 4);
  assert.equal(r.abnormal, false);
});

test('guards: group required', () => {
  const r = isthBat({epistaxis:2});
  assert.equal(r.valid, false);
});
