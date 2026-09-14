// spec-v1256: the agent surface enumerates the published ROX timepoints.
import test from 'node:test';
import assert from 'node:assert/strict';

import { computeCalculator } from '../../mcp/tools.js';

test('ROX refuses an unpublished timepoint on the agent surface', () => {
  const response = computeCalculator({
    id: 'rox',
    inputs: { 'rx-spo2': '90', 'rx-fio2': '0.6', 'rx-rr': '50', 'rx-hr': '3' },
  });

  assert.equal(response.valid, false);
  assert.match(response.message, /rx-hr|Hours after HFNC start|2.*6.*12/i);
});
