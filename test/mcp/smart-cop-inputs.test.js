// spec-v1253: agent calls preserve invalid optional oxygenation values.
import test from 'node:test';
import assert from 'node:assert/strict';

import { computeCalculator } from '../../mcp/tools.js';

test('SMART-COP refuses an entered impossible PaO2 on the agent surface', () => {
  const response = computeCalculator({
    id: 'smart-cop',
    inputs: {
      'sc-age': '55', 'sc-rr': '20', 'sc-pao2': '999999',
      'sc-spo2': '96', 'sc-pf': '400',
    },
  });

  assert.equal(response.valid, false);
  assert.match(response.message, /^PaO2 \(mmHg\) must be between 10 and 700/);
});

test('SMART-COP refuses an age outside the existing human envelope on the agent surface', () => {
  const response = computeCalculator({
    id: 'smart-cop',
    inputs: {
      'sc-age': '999999', 'sc-rr': '20', 'sc-spo2': '96',
    },
  });

  assert.equal(response.valid, false);
  assert.match(response.message, /plausible range for age \(0 to 130 yr\)/);
});
