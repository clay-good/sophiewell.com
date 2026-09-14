// spec-v1258: agent calls cannot invent measurement context for King's College criteria.
import test from 'node:test';
import assert from 'node:assert/strict';

import { computeCalculator } from '../../mcp/tools.js';

test('King’s College leaves a lactate limb incomplete when timing is omitted', () => {
  const response = computeCalculator({
    id: 'kings-college',
    inputs: { 'kc-lac': '3.4' },
  });

  assert.equal(response.valid, true);
  assert.equal(response.result.meets, false);
  assert.equal(response.result.lactateLimb, null);
  assert.match(response.result.band, /modified lactate limb is incomplete/);
});

test('King’s College leaves a creatinine limb incomplete when units are omitted', () => {
  const response = computeCalculator({
    id: 'kings-college',
    inputs: { 'kc-inr': '7', 'kc-cr': '4', 'kc-enc': 'yes' },
  });

  assert.equal(response.valid, true);
  assert.equal(response.result.meets, false);
  assert.equal(response.result.creatHigh, null);
  assert.match(response.result.band, /enter the creatinine unit/);
});
