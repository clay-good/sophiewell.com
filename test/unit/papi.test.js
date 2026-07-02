// spec-v194 2.1: papi worked examples and guards.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { papi } from '../../lib/hemo-v194.js';

test('reduced PAPi flags advanced-HF RV dysfunction', () => {
  const r = papi({pasp:40,padp:20,rap:18});
  assert.equal(r.valid, true);
  assert.equal(r.value, 1.11);
  assert.equal(r.abnormal, true);
});

test('normal PAPi', () => {
  const r = papi({pasp:40,padp:15,rap:8});
  assert.equal(r.value, 3.13);
  assert.equal(r.abnormal, false);
});

test('guards: RAP must be positive', () => {
  const r = papi({pasp:40,padp:20,rap:0});
  assert.equal(r.valid, false);
});
