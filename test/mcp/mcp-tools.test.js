// spec-v183 §4: contracts for the three MCP dispatch tools. These import the
// pure tool logic directly (no SDK / transport), so the suite runs standalone
// and the site test path is untouched if mcp/ is removed.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  TOOL_DEFS, dispatch, toCallToolResult, SERVER_INSTRUCTIONS, catalogVersion,
  listCalculators, getCatalogManifest, describeCalculator, computeCalculator, findCalculator,
} from '../../mcp/tools.js';

test('five tools, each with a valid object inputSchema', () => {
  // spec-v183 §2.2 fixed a three-tool surface; mcp-discovery added find_calculator
  // (four); spec-v635 added get_catalog_manifest (five).
  assert.equal(TOOL_DEFS.length, 5);
  assert.deepEqual(TOOL_DEFS.map((t) => t.name).sort(),
    ['compute_calculator', 'describe_calculator', 'find_calculator', 'get_catalog_manifest', 'list_calculators']);
  for (const t of TOOL_DEFS) {
    assert.equal(t.inputSchema.type, 'object');
    assert.ok(typeof t.description === 'string' && t.description.length > 20);
  }
});

test('list_calculators: coverage line, paginated totals, and filters', () => {
  const all = listCalculators();
  assert.match(all.coverage, /^\d+ of \d+ catalog tiles exposed/);
  assert.ok(all.exposed >= 20, 'first wave exposes at least 20');
  assert.ok(all.catalogTotal > all.exposed, 'exposed is a strict subset of the catalog');
  // spec-v635: total is the full match count; count/calculators is one capped page.
  assert.ok(all.total > 200, 'many calculators match the empty filter');
  assert.equal(all.count, all.calculators.length);
  assert.ok(all.count <= 50, 'default page is capped at 50 rows');
  assert.equal(all.offset, 0);
  assert.equal(all.nextOffset, 50, 'more rows remain after the first page');
  for (const row of all.calculators) {
    assert.ok(row.id && row.name && row.group && Array.isArray(row.specialties) && row.summary);
  }

  const hep = listCalculators({ specialty: 'hepatology' });
  assert.ok(hep.total >= 6 && hep.total < all.total);
  assert.ok(hep.calculators.every((r) => r.specialties.includes('hepatology')));

  const q = listCalculators({ query: 'osmolal' });
  assert.ok(q.calculators.some((r) => r.id === 'urine-osmolal-gap'));

  const none = listCalculators({ group: 'ZZZ' });
  assert.equal(none.count, 0);
  assert.equal(none.total, 0);
  assert.equal(none.nextOffset, null);
});

// spec-v635 §1-2: pagination is deterministic and non-overlapping; compact drops summary.
test('list_calculators: limit/offset paginate without overlap; compact mode is lean', () => {
  const p1 = listCalculators({ limit: 10, offset: 0 });
  const p2 = listCalculators({ limit: 10, offset: 10 });
  assert.equal(p1.count, 10);
  assert.equal(p1.nextOffset, 10);
  assert.equal(p2.offset, 10);
  const ids1 = new Set(p1.calculators.map((r) => r.id));
  assert.ok(p2.calculators.every((r) => !ids1.has(r.id)), 'pages do not overlap');
  assert.equal(p1.total, p2.total, 'total is stable across pages');

  const over = listCalculators({ limit: 9999 });
  assert.ok(over.count <= 200, 'limit hard-capped at 200');

  const compact = listCalculators({ fields: 'compact', limit: 5 });
  for (const row of compact.calculators) {
    assert.ok(row.id && row.name && row.group);
    assert.ok(!('summary' in row) && !('specialties' in row), 'compact rows drop summary/specialties');
  }
});

// spec-v635 §3: the one-shot manifest indexes every exposed calculator compactly.
test('get_catalog_manifest: every exposed calculator, compact, no summaries', () => {
  const m = getCatalogManifest();
  assert.equal(m.count, m.exposed, 'manifest lists exactly the exposed set');
  assert.equal(m.count, m.calculators.length);
  assert.ok(m.count > 200);
  for (const row of m.calculators) {
    assert.ok(row.id && row.name && row.group && Array.isArray(row.specialties));
    assert.ok(!('summary' in row), 'manifest rows carry no summary');
  }
  // every manifest id is describable (it is a real exposed tile)
  assert.equal(describeCalculator({ id: m.calculators[0].id }).id, m.calculators[0].id);
  assert.equal(dispatch('get_catalog_manifest', {}).count, m.count);
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
  assert.equal(dispatch('find_calculator', { query: 'stroke risk afib' }).candidates[0].id, 'chads');
  assert.equal(dispatch('bogus_tool', {}).valid, false);
});

test('find_calculator: plain-language queries rank the right calculator first', () => {
  // The substring-only list_calculators query matches nothing for these; the
  // ranked resolver surfaces the intended tile as the top candidate.
  assert.equal(listCalculators({ query: 'stroke risk afib' }).count, 0, 'substring baseline misses');
  const afib = findCalculator({ query: 'stroke risk afib' });
  assert.equal(afib.count > 0, true);
  assert.equal(afib.candidates[0].id, 'chads');
  assert.ok(afib.candidates[0].why, 'each candidate carries a match reason');

  // "creatinine clearance" surfaces the renal estimators.
  const crcl = findCalculator({ query: 'creatinine clearance', limit: 5 });
  const ids = crcl.candidates.map((c) => c.id);
  assert.ok(ids.includes('egfr') || ids.includes('cockcroft-gault'), `renal tiles ranked, got ${ids.join(',')}`);
});

test('find_calculator: limit is respected and capped; candidates are exposed tiles', () => {
  const r = findCalculator({ query: 'score', limit: 3 });
  assert.ok(r.candidates.length <= 3);
  for (const c of r.candidates) {
    assert.ok(c.id && c.name && c.group && Array.isArray(c.specialties) && c.summary);
    assert.equal(describeCalculator({ id: c.id }).id, c.id, 'a returned candidate is describable');
  }
  const capped = findCalculator({ query: 'risk', limit: 999 });
  assert.ok(capped.candidates.length <= 20, 'limit hard-capped at 20');
});

test('find_calculator: group / specialty prefilters compose with the query', () => {
  const hep = findCalculator({ query: 'fibrosis', specialty: 'hepatology', limit: 10 });
  assert.ok(hep.candidates.every((c) => c.specialties.includes('hepatology')));
});

test('find_calculator: corpus prose lets a band-text term route (recall the name misses)', () => {
  // "antithrombotic therapy" appears in CHA2DS2-VASc's interpretation bands, not
  // its name -- name-only ranking misses it; the corpus desc channel recovers it.
  const r = findCalculator({ query: 'antithrombotic therapy not recommended' });
  assert.ok(r.count > 0, 'a prose-term query surfaces candidates');
  assert.equal(r.candidates[0].id, 'chads');
  // And the marquee synonym/name routes are unchanged by the enrichment.
  assert.equal(findCalculator({ query: 'stroke risk afib' }).candidates[0].id, 'chads');
  assert.equal(findCalculator({ query: 'creatinine clearance' }).candidates[0].id, 'egfr');
});

test('find_calculator: blank query is a structured error; no match is a structured miss', () => {
  const blank = findCalculator({ query: '   ' });
  assert.equal(blank.valid, false);
  assert.ok(blank.message.length > 0);

  const miss = findCalculator({ query: 'qwxzptv nonsense token' });
  assert.equal(miss.count, 0);
  assert.deepEqual(miss.candidates, []);
  assert.ok(miss.hint);
});

// spec-v634 §1: server-level instructions orient the model on the tool pipeline.
test('SERVER_INSTRUCTIONS: a concise usage brief naming the discover/describe/compute tools', () => {
  assert.equal(typeof SERVER_INSTRUCTIONS, 'string');
  assert.ok(SERVER_INSTRUCTIONS.length > 200 && SERVER_INSTRUCTIONS.length < 2000, 'kept concise');
  for (const tool of ['find_calculator', 'list_calculators', 'describe_calculator', 'compute_calculator']) {
    assert.ok(SERVER_INSTRUCTIONS.includes(tool), `mentions ${tool}`);
  }
  assert.match(SERVER_INSTRUCTIONS, /deterministic|byte-identical/i);
  assert.match(SERVER_INSTRUCTIONS, /citation/i);
});

// spec-v634 §2: every tool is read-only, idempotent, closed-world, and titled.
test('every tool carries read-only annotations and an object outputSchema', () => {
  for (const t of TOOL_DEFS) {
    assert.ok(t.annotations, `${t.name} has annotations`);
    assert.equal(t.annotations.readOnlyHint, true, `${t.name} readOnlyHint`);
    assert.equal(t.annotations.idempotentHint, true, `${t.name} idempotentHint`);
    assert.equal(t.annotations.openWorldHint, false, `${t.name} openWorldHint`);
    assert.ok(typeof t.annotations.title === 'string' && t.annotations.title.length > 0, `${t.name} title`);
    assert.ok(!('destructiveHint' in t.annotations), `${t.name} omits destructiveHint (meaningless when read-only)`);
    assert.equal(t.outputSchema.type, 'object', `${t.name} outputSchema is an object`);
  }
});

// spec-v637 §1: every failure carries a stable machine-readable code (+ field).
test('spec-v637: failures carry a stable code and, where applicable, the field', () => {
  assert.equal(dispatch('bogus_tool', {}).code, 'UNKNOWN_TOOL');
  assert.equal(computeCalculator({ id: 'nope', inputs: {} }).code, 'UNKNOWN_ID');
  assert.equal(describeCalculator({ id: 'nope' }).code, 'UNKNOWN_ID');
  assert.equal(describeCalculator({ id: 'nope' }).id, 'nope', 'describe echoes the id on error');

  const missing = computeCalculator({ id: 'meld-xi', inputs: {} });
  assert.equal(missing.code, 'MISSING_INPUT');
  assert.ok(missing.field, 'missing-input error names the offending field');

  const unknownKey = computeCalculator({ id: 'meld-xi', inputs: { 'mx-bili': 1, zzz: 2 } });
  assert.equal(unknownKey.code, 'UNKNOWN_INPUT');
  assert.equal(unknownKey.field, 'zzz');

  const badType = computeCalculator({ id: 'meld-xi', inputs: { 'mx-bili': 'abc', 'mx-creat': 1 } });
  assert.equal(badType.code, 'INVALID_TYPE');
  assert.equal(badType.field, 'mx-bili');

  assert.equal(findCalculator({ query: '  ' }).code, 'BAD_ARGS');
  assert.equal(findCalculator({ query: 'qwxzptv nonsense token' }).code, 'NO_MATCH');
});

// spec-v637 §3-4: a deterministic content version agents can pin and cache against.
test('spec-v637: catalogVersion is a cacheable content-version on the discovery surfaces', () => {
  const cv = catalogVersion();
  assert.equal(cv.deterministic, true);
  assert.equal(cv.cacheable, true);
  assert.equal(cv.tileCount, listCalculators().catalogTotal);
  assert.equal(cv.exposedCount, listCalculators().exposed);
  assert.ok(cv.contentHash === null || /^[0-9a-f]{8,}$/.test(cv.contentHash), 'contentHash is a hex digest or null');
  assert.deepEqual(listCalculators().catalogVersion, cv, 'list_calculators carries the version');
  assert.deepEqual(getCatalogManifest().catalogVersion, cv, 'get_catalog_manifest carries the version');
});

// spec-v634 §3: the CallTool envelope keeps the text block AND adds structuredContent.
test('toCallToolResult: text block preserved, structuredContent equals the payload', () => {
  const payload = computeCalculator({ id: 'meld-xi', inputs: { 'mx-bili': 2.0, 'mx-creat': 1.5 } });
  const env = toCallToolResult(payload);
  assert.equal(env.content[0].type, 'text');
  assert.deepEqual(JSON.parse(env.content[0].text), payload, 'text parses back to the payload');
  assert.deepEqual(env.structuredContent, payload, 'structuredContent is the typed payload');

  // Error payloads must also carry structuredContent (tools declare an outputSchema).
  const errEnv = toCallToolResult(computeCalculator({ id: 'no-such', inputs: {} }));
  assert.equal(errEnv.structuredContent.valid, false);
});
