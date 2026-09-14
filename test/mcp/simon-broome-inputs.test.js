// spec-v1252: agent calls preserve invalid-versus-omitted optional LDL-C.
import test from 'node:test';
import assert from 'node:assert/strict';

import { computeCalculator } from '../../mcp/tools.js';

test('Simon Broome refuses an entered invalid LDL-C on the agent surface', () => {
  const response = computeCalculator({
    id: 'simon-broome-fh',
    inputs: { 'sb-tc': '8', 'sb-ldl': '999999', 'sb-xanthoma': '1' },
  });

  assert.equal(response.valid, false);
  assert.match(response.message, /^LDL-C \(mmol\/L\) must be between 0 and 50/);
});
