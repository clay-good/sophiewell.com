// spec-v196 2.4: pageB worked examples and guards.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pageB } from '../../lib/liver-v196.js';

test('high-risk band', () => {
  const r = pageB({age:65,platelets:90,sex:'male'});
  assert.equal(r.valid, true);
  assert.equal(r.score, 23);
  assert.equal(r.abnormal, true);
});

test('low-risk band', () => {
  const r = pageB({age:25,platelets:250,sex:'female'});
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});

test('guards: sex required', () => {
  const r = pageB({age:65,platelets:90});
  assert.equal(r.valid, false);
});
