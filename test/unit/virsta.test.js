// spec-v198 2.3: virsta worked examples and guards.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { virsta } from '../../lib/subspecialty-v198.js';

test('higher-risk score', () => {
  const r = virsta({emboli:true,valve:true});
  assert.equal(r.valid, true);
  assert.equal(r.score, 8);
  assert.equal(r.abnormal, true);
});

test('low-risk rule-out', () => {
  const r = virsta({sepsis:true,crp:true});
  assert.equal(r.score, 2);
  assert.equal(r.abnormal, false);
});

test('single embolus alone crosses the threshold', () => {
  const r = virsta({emboli:true});
  assert.equal(r.score, 5);
  assert.equal(r.abnormal, true);
});
