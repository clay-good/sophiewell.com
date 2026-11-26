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
  // spec-v1798: the rule spec-v1248 set is that the refusal NAMES the field and states where the floor is
  // -- not that one particular layer phrases it. Since this field's range is declared, `validateInputs`
  // refuses first and says "from 0 (exclusive)" where the library says "greater than 0"; both name the
  // count. Pinning one wording made declaring the range look like a regression when nothing had changed
  // for a reader.
  assert.match(r.message, /Earlier absolute lymphocyte count/);
  assert.match(r.message, /greater than 0|from 0 \(exclusive\)/);
});
