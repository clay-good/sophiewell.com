// spec-v196 2.1: abicScore worked examples and guards.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { abicScore } from '../../lib/liver-v196.js';

test('intermediate band', () => {
  const r = abicScore({age:50,bilirubin:8,creatinine:1,inr:1.5});
  assert.equal(r.valid, true);
  assert.equal(r.value, 7.14);
  assert.equal(r.abnormal, true);
});

test('low band', () => {
  const r = abicScore({age:40,bilirubin:2,creatinine:0.8,inr:1.1});
  assert.equal(r.value, 5.28);
  assert.equal(r.abnormal, false);
});

test('guards: INR required', () => {
  const r = abicScore({age:50,bilirubin:8,creatinine:1});
  assert.equal(r.valid, false);
});

// spec-v1753: the envelope lib/bounds.js declares; 1.5 times its ceiling was answered, ten times was refused.
test('spec-v1753: bilirubin and creatinine past their envelopes are refused', () => {
  const ex = { age: 50, bilirubin: 8, creatinine: 1.0, inr: 1.5 };
  // spec-v1763: bound widened (source in lib/bounds.js)
  for (const [k, v, re] of [['bilirubin', 90, /bilirubin/], ['creatinine', 75.5, /creatinine/i]]) {
    const r = abicScore({ ...ex, [k]: v });
    assert.equal(r.valid, false, k);
    assert.match(r.message, re);
  }
  assert.equal(abicScore({ ...ex, bilirubin: 60, creatinine: 25 }).valid, true);
  assert.equal(abicScore(ex).value, 7.14);
});
