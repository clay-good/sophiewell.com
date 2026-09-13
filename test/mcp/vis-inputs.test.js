// spec-v1247: the agent surface must propagate the same negative-dose refusal
// as the browser instead of returning a reduced support score.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeCalculator } from '../../mcp/tools.js';

test('VIS refuses a negative infusion on the agent surface', () => {
  const r = computeCalculator({
    id: 'vis',
    inputs: {
      'vs-dop': -5,
      'vs-dob': 0,
      'vs-epi': 0,
      'vs-ne': 0.05,
      'vs-mil': 0,
      'vs-vaso': 0,
    },
  });

  assert.equal(r.valid, false);
  assert.match(r.message, /Dopamine dose cannot be negative/);
});
