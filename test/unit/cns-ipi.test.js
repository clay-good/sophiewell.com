// spec-v198 2.1: cnsIpi worked examples and guards.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cnsIpi } from '../../lib/subspecialty-v198.js';

test('high-risk band', () => {
  const r = cnsIpi({age:true,ldh:true,ecog:true,stage:true});
  assert.equal(r.valid, true);
  assert.equal(r.score, 4);
  assert.equal(r.abnormal, true);
});

test('low-risk band', () => {
  const r = cnsIpi({age:true});
  assert.equal(r.score, 1);
  assert.equal(r.abnormal, false);
});

test('intermediate band', () => {
  const r = cnsIpi({age:true,ldh:true});
  assert.equal(r.score, 2);
});
