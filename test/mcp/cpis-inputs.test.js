// spec-v1255: agent calls validate WBC in CPIS's declared per-mm3 unit.
import test from 'node:test';
import assert from 'node:assert/strict';

import { computeCalculator } from '../../mcp/tools.js';

test('CPIS refuses an impossible leukocyte count on the agent surface', () => {
  const response = computeCalculator({
    id: 'cpis-vap',
    inputs: {
      'cp-temp': '39', 'cp-wbc': '999999', 'cp-sec': 'purulent',
      'cp-oxy': 'low', 'cp-cxr': 'diffuse', 'cp-cult': 'none',
    },
  });

  assert.equal(response.valid, false);
  assert.match(response.message, /Leukocyte count \(per mm\^3\) must be between 0 and 200000/);
});
