// spec-v193 2.4: timiRiskIndex worked examples and guards.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { timiRiskIndex } from '../../lib/acs-v193.js';

test('age-squared term computed', () => {
  const r = timiRiskIndex({hr:100,age:70,sbp:120});
  assert.equal(r.valid, true);
  assert.equal(r.value, 40.8);
});

test('lower index for lower heart rate', () => {
  const r = timiRiskIndex({hr:60,age:50,sbp:140});
  assert.equal(r.value, 10.7);
});

test('guards: SBP required and positive', () => {
  const r = timiRiskIndex({hr:100,age:70});
  assert.equal(r.valid, false);
});
