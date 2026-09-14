// spec-v1248: the agent surface must preserve an entered invalid ALC.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeCalculator } from '../../mcp/tools.js';

test('lymphocyte doubling time names an invalid ALC on the agent surface', () => {
  const r = computeCalculator({
    id: 'lymphocyte-doubling-time',
    inputs: { 'ldt-alc1': -20, 'ldt-alc2': 40, 'ldt-int': 6 },
  });

  assert.equal(r.valid, false);
  assert.match(r.message, /Earlier absolute lymphocyte count.*greater than 0/);
});
