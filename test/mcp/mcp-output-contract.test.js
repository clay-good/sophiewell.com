// spec-v768: what a tool RETURNS must be what its outputSchema DECLARES.
//
// The schema is the machine-readable contract an agent reads before it calls
// anything. A field that is returned but not declared is invisible: the agent
// cannot know to look for it.
//
// That is not hypothetical. spec-v758 and spec-v762 added `via`, `unstated`,
// `unstatedNote`, `missing` and `candidates` to answer_query and declared none
// of them -- including `unstated`, whose entire job is to warn a caller that the
// number it just received was computed without inputs it never mentioned. The
// warning existed and could not be discovered.
//
// Each tool is exercised across its shapes -- success and every error code it
// can produce -- because the undeclared fields lived on the error paths.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TOOL_DEFS, dispatch } from '../../mcp/tools.js';

// One or more argument sets per tool, chosen to reach every branch that returns
// a distinct shape. A tool with no case here is reported, so a new tool cannot
// join the surface without its contract being checked.
const CASES = {
  list_calculators: [{}, { group: 'E' }, { query: 'creatinine' }],
  get_catalog_manifest: [{}],
  describe_calculator: [{ id: 'bmi' }, { id: 'no-such-tile' }],
  compute_calculator: [
    { id: 'bmi', inputs: { w: 80, h: 1.8 } },
    { id: 'bmi', inputs: { w: 'not-a-number', h: 1.8 } },
    { id: 'no-such-tile', inputs: {} },
    {},
  ],
  find_calculator: [{ query: 'stroke risk afib' }, { query: '' }],
  answer_query: [
    { query: 'bmi 80kg 180cm' },                                     // template
    { query: 'wells score for PE, heart rate 110, previous DVT' },   // registry
    { query: 'crcl for a 72 year old woman, creatinine 1.4' },       // MISSING_INPUTS
    { query: 'wells score for PE' },                                 // NO_VALUES
    { query: 'what is the meaning of life' },                        // NO_MATCH
    { query: '   ' },                                                // BAD_ARGS
  ],
  compute_batch: [
    { calculations: [{ id: 'bmi', inputs: { w: 80, h: 1.8 } }] },
    { calculations: [] },
    {},
  ],
  convert_units: [
    { kind: 'glucose', value: 90, direction: 'toSi' },
    { kind: 'not-a-kind', value: 1 },
  ],
};

test('spec-v768: every tool has output-contract cases', () => {
  const named = new Set(Object.keys(CASES));
  const missing = TOOL_DEFS.map((t) => t.name).filter((n) => !named.has(n));
  assert.deepEqual(missing, [], `tools with no output-contract case: ${missing.join(', ')}`);
});

test('spec-v768: every field a tool returns is declared in its outputSchema', () => {
  const undeclared = [];
  for (const tool of TOOL_DEFS) {
    const props = (tool.outputSchema && tool.outputSchema.properties) || {};
    for (const args of CASES[tool.name] || []) {
      const out = dispatch(tool.name, args);
      if (!out || typeof out !== 'object') continue;
      for (const key of Object.keys(out)) {
        if (!(key in props)) {
          undeclared.push(`${tool.name}.${key} (args: ${JSON.stringify(args).slice(0, 60)})`);
        }
      }
    }
  }
  assert.deepEqual(
    [...new Set(undeclared)],
    [],
    `returned but not declared in outputSchema:\n  ${[...new Set(undeclared)].join('\n  ')}`
  );
});

test('spec-v768: answer_query declares the fields that carry its warnings', () => {
  // Named explicitly, because these are the ones that went undeclared and the
  // ones a caller most needs to find: `unstated` says a score is a floor,
  // `candidates` says the query named more than one calculator.
  const tool = TOOL_DEFS.find((t) => t.name === 'answer_query');
  const props = tool.outputSchema.properties;
  for (const key of ['via', 'unstated', 'unstatedNote', 'missing', 'candidates']) {
    assert.ok(props[key], `answer_query.outputSchema must declare ${key}`);
    assert.ok(props[key].description, `${key} needs a description -- this is what an agent reads`);
  }
});
