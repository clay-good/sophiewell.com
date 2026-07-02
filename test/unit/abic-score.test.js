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
