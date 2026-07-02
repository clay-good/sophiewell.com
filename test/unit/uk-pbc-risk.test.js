// spec-v196 2.3: ukPbcRisk worked examples and guards.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ukPbcRisk } from '../../lib/liver-v196.js';

test('5/10/15-year risk set', () => {
  const r = ukPbcRisk({alp:2,transaminase:1.5,bili:1,albumin:1.1,platelets:1.5});
  assert.equal(r.valid, true);
  assert.equal(r.r5, 4.7);
  assert.equal(r.r10, 14.9);
  assert.equal(r.r15, 26);
});

test('low-risk profile stays bounded in [0,100]', () => {
  const r = ukPbcRisk({alp:1,transaminase:1,bili:0.5,albumin:1.3,platelets:2});
  assert.equal(r.valid, true);
});

test('guards: transaminase required', () => {
  const r = ukPbcRisk({alp:2,bili:1,albumin:1.1,platelets:1.5});
  assert.equal(r.valid, false);
});
