// spec-v1255: agent calls validate WBC in CPIS's declared per-mm3 unit.
import test from 'node:test';
import assert from 'node:assert/strict';

import { computeCalculator } from '../../mcp/tools.js';

test('CPIS refuses an impossible leukocyte count on the agent surface', () => {
  const response = computeCalculator({
    id: 'cpis-vap',
    inputs: {
      'cp-temp': '39', 'cp-wbc': '9999999', 'cp-sec': 'purulent',
      'cp-oxy': 'low', 'cp-cxr': 'diffuse', 'cp-cult': 'none',
    },
  });

  assert.equal(response.valid, false);
  // spec-v1764: the converted ceiling follows BOUNDS.wbc (2000 x10^9/L is 2,000,000/mm^3).
  assert.match(response.message, /Leukocyte count \(per mm\^3\) must be between 0 and 2000000/);
});
