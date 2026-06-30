// spec-v183 §4: contracts for the three MCP dispatch tools. These import the
// pure tool logic directly (no SDK / transport), so the suite runs standalone
// and the site test path is untouched if mcp/ is removed.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  TOOL_DEFS, dispatch,
  listCalculators, describeCalculator, computeCalculator,
} from '../../mcp/tools.js';

test('exactly three tools, each with a valid object inputSchema', () => {
  assert.equal(TOOL_DEFS.length, 3);
  assert.deepEqual(TOOL_DEFS.map((t) => t.name).sort(), ['compute_calculator', 'describe_calculator', 'list_calculators']);
  for (const t of TOOL_DEFS) {
    assert.equal(t.inputSchema.type, 'object');
    assert.ok(typeof t.description === 'string' && t.description.length > 20);
  }
});

test('list_calculators: coverage line, subset count, and filters', () => {
  const all = listCalculators();
  assert.match(all.coverage, /^\d+ of \d+ catalog tiles exposed/);
  assert.ok(all.exposed >= 20, 'first wave exposes at least 20');
  assert.ok(all.catalogTotal > all.exposed, 'exposed is a strict subset of the catalog');
  assert.equal(all.count, all.calculators.length);
  for (const row of all.calculators) {
    assert.ok(row.id && row.name && row.group && Array.isArray(row.specialties) && row.summary);
  }

  const hep = listCalculators({ specialty: 'hepatology' });
  assert.ok(hep.count >= 6 && hep.count < all.count);
  assert.ok(hep.calculators.every((r) => r.specialties.includes('hepatology')));

  const q = listCalculators({ query: 'osmolal' });
  assert.ok(q.calculators.some((r) => r.id === 'urine-osmolal-gap'));

  const none = listCalculators({ group: 'ZZZ' });
  assert.equal(none.count, 0);
});

test('describe_calculator: full contract; unknown id is a structured error', () => {
  const d = describeCalculator({ id: 'meld-xi' });
  assert.equal(d.id, 'meld-xi');
  assert.equal(d.inputSchema.type, 'object');
  assert.ok(d.citation && d.citationUrl && d.citationAccessed);
  assert.ok(d.example && d.example.fields && d.example.expected);
  assert.ok(d.disclaimer.length > 20);

  const bad = describeCalculator({ id: 'does-not-exist' });
  assert.equal(bad.valid, false);
  assert.match(bad.message, /Unknown calculator id/);
});

test('compute_calculator: success carries result, citation, and disclaimer', () => {
  const r = computeCalculator({ id: 'meld-xi', inputs: { 'mx-bili': 2.0, 'mx-creat': 1.5 } });
  assert.equal(r.valid, true);
  assert.equal(r.result.score, 18);
  assert.ok(r.citation && r.disclaimer);
});

test('compute_calculator: every invalid path is a structured { valid:false, message }', () => {
  const cases = [
    { id: 'meld-xi', inputs: {} },                                  // missing required
    { id: 'meld-xi', inputs: { 'mx-bili': 'abc', 'mx-creat': 1 } }, // non-numeric
    { id: 'meld-xi', inputs: { 'mx-bili': 1, 'zzz': 2 } },          // unknown key
    { id: 'no-such-tile', inputs: {} },                             // unknown id
  ];
  for (const c of cases) {
    const r = computeCalculator(c);
    assert.equal(r.valid, false, JSON.stringify(c));
    assert.ok(typeof r.message === 'string' && r.message.length > 0);
    assert.ok(!('result' in r));
  }
});

test('compute_calculator is deterministic across repeated identical calls', () => {
  const call = () => JSON.stringify(computeCalculator({ id: 'aortic-valve-area', inputs: { 'av-d': 2.0, 'av-lvti': 20, 'av-avti': 100 } }));
  assert.equal(call(), call());
  assert.equal(call(), call());
});

test('dispatch routes to each tool and rejects unknown tools', () => {
  assert.ok(dispatch('list_calculators', {}).coverage);
  assert.equal(dispatch('describe_calculator', { id: 'ecg-axis' }).id, 'ecg-axis');
  assert.equal(dispatch('compute_calculator', { id: 'ecg-axis', inputs: { 'ea-i': 8, 'ea-avf': 6 } }).valid, true);
  assert.equal(dispatch('bogus_tool', {}).valid, false);
});
