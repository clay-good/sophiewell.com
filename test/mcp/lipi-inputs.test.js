// spec-v1250: the agent surface accepts either consistent count unit too.
import test from 'node:test';
import assert from 'node:assert/strict';

import { computeCalculator } from '../../mcp/tools.js';

test('LIPI computes equivalent results from counts per microliter', () => {
  const response = computeCalculator({
    id: 'lipi',
    inputs: { 'lipi-anc': '7000', 'lipi-wbc': '9000', 'lipi-ldh': '1' },
  });

  assert.equal(response.valid, true, response.message);
  assert.equal(response.result.dnlr, 3.5);
  assert.equal(response.result.score, 2);
});
