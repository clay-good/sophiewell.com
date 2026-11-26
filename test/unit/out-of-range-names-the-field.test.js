// spec-v1836: an agent-surface range refusal names the field the way the page names it.
//
// spec-v1248 set the rule for `lymphocyte-doubling-time` -- "Earlier absolute lymphocyte count", never
// `"ldt-alc1"` -- and spec-v1798 moved it into `validateInputs`, with the dom standing in above sixty
// characters because a long label is no use in a sentence. That cap sent 114 fields to the dom: `niss`
// told an agent `"ni-a2" must be from 1 to 6` where the control reads "Second-highest AIS".
//
// A FIELD NAMES ITS QUANTITY IN THE FIRST CLAUSE OF ITS LABEL and the rest is explanation, which is the
// rule spec-v1800 wrote for scripts/lib/quantity-name.mjs. Taking that clause fits every declared field
// inside the cap, so no refusal needs the dom at all.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allCalculators } from '../../mcp/catalog.js';
import { validateInputs } from '../../mcp/fields.js';
import { META } from '../../lib/meta.js';

test('no range refusal falls back to the dom key', () => {
  const anonymous = [];
  let named = 0;
  for (const tool of allCalculators()) {
    const ex = META[tool.id]?.example?.fields;
    if (!ex) continue;
    for (const f of (tool.fields || [])) {
      if (f.kind !== 'number' || Array.isArray(f.values)) continue;
      if (f.max === undefined && f.min === undefined && !f.bound) continue;
      const r = validateInputs({ ...ex, [f.dom]: '999999' }, tool.fields);
      if (r?.valid !== false || r.code !== 'OUT_OF_RANGE') continue;
      if (/^"/.test(String(r.message))) anonymous.push(`${tool.id}|${f.dom}: ${r.message}`);
      else named += 1;
    }
  }
  assert.ok(named > 1500, `expected the declared fields to be reached; named ${named}`);
  assert.deepEqual(anonymous, [], `range refusal(s) naming a dom key instead of the field:\n${anonymous.join('\n')}`);
});

test('the clause is the name, not the whole label', () => {
  const niss = allCalculators().find((t) => t.id === 'niss');
  const r = validateInputs({ 'ni-a1': '6', 'ni-a2': '999999', 'ni-a3': '2' }, niss.fields);
  assert.equal(r.code, 'OUT_OF_RANGE');
  assert.match(r.message, /^Second-highest AIS must be from 1 to 6/);
  // The explanation after the bracket is not dragged into the sentence.
  assert.doesNotMatch(r.message, /partial total/);
  assert.doesNotMatch(r.message, /ni-a2/);
});
