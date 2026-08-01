// spec-v183 §4: contracts for the three MCP dispatch tools. These import the
// pure tool logic directly (no SDK / transport), so the suite runs standalone
// and the site test path is untouched if mcp/ is removed.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  TOOL_DEFS, dispatch, toCallToolResult, SERVER_INSTRUCTIONS, catalogVersion, resolveWithAliases,
  listCalculators, getCatalogManifest, describeCalculator, computeCalculator, findCalculator,
  answerQuery, convertUnits, computeBatch,
} from '../../mcp/tools.js';

test('eight tools, each with a valid object inputSchema', () => {
  // spec-v183 fixed three; mcp-discovery added find_calculator (four); spec-v635
  // added get_catalog_manifest (five); spec-v630 added answer_query + convert_units
  // (seven); spec-v623 added compute_batch (eight).
  assert.equal(TOOL_DEFS.length, 8);
  assert.deepEqual(TOOL_DEFS.map((t) => t.name).sort(),
    ['answer_query', 'compute_batch', 'compute_calculator', 'convert_units', 'describe_calculator', 'find_calculator', 'get_catalog_manifest', 'list_calculators']);
  for (const t of TOOL_DEFS) {
    assert.equal(t.inputSchema.type, 'object');
    assert.ok(typeof t.description === 'string' && t.description.length > 20);
  }
});

// Every declared tool must be wired into dispatch and documented in the README,
// so the surface can't silently drift out of sync with its docs (as it did when
// answer_query/convert_units/compute_batch were added after the v636 README pass).
test('every tool is wired into dispatch and documented in mcp/README.md', () => {
  const readme = readFileSync(fileURLToPath(new URL('../../mcp/README.md', import.meta.url)), 'utf8');
  for (const t of TOOL_DEFS) {
    assert.notEqual(dispatch(t.name, {}).code, 'UNKNOWN_TOOL', `${t.name} is routed by dispatch`);
    assert.ok(readme.includes(`\`${t.name}\``), `${t.name} is documented in mcp/README.md`);
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

// spec-v629: non-clinical (administrative) calculators are exposed with the
// admin disclaimer/domain; clinical tiles are unchanged.
test('spec-v629: non-clinical validators exposed with the administrative domain', () => {
  const npi = computeCalculator({ id: 'npi-validate', inputs: { 'npi-in': '1234567893' } });
  assert.equal(npi.valid, true);
  assert.equal(npi.domain, 'administrative');
  assert.match(npi.result.note, /Valid NPI/);
  assert.ok(/payment|coverage|compliance/i.test(npi.disclaimer), 'carries the admin disclaimer, not the clinical one');

  assert.equal(computeCalculator({ id: 'icd10-validate', inputs: { 'icd-in': 'M54.5' } }).valid, true);
  assert.equal(describeCalculator({ id: 'mbi-validate' }).domain, 'administrative');

  // clinical tiles keep the clinical domain and a different disclaimer
  const meld = computeCalculator({ id: 'meld-xi', inputs: { 'mx-bili': 2.0, 'mx-creat': 1.5 } });
  assert.equal(meld.domain, 'clinical');
  assert.notEqual(meld.disclaimer, npi.disclaimer, 'clinical and admin disclaimers differ');
});

// spec-v629 wave 2: facility pricing — dollar->cents scaling and apc line parsing.
test('spec-v629 wave 2: era/drg/apc price correctly through the adapters', () => {
  const era = computeCalculator({ id: 'era-balance', inputs: { 'era-billed': '200', 'era-paid': '120', 'era-co': '50', 'era-pr': '30' } });
  assert.equal(era.valid, true);
  assert.equal(era.result.residualCents, 0, 'balances to zero');
  assert.equal(era.result.patientResponsibilityCents, 3000, 'PR $30.00 = 3000 cents (dollar->cents scaling)');

  const drg = computeCalculator({ id: 'drg-payment', inputs: { 'drg-weight': '1.5', 'drg-oper': '6000', 'drg-cap': '500', 'drg-wage': '1' } });
  assert.equal(drg.valid, true);
  assert.equal(drg.result.baseDrgCents, 975000, 'base DRG $9750.00');

  const apc = computeCalculator({ id: 'apc-payment', inputs: { 'apc-list': '10, T\n4, T\n2, N', 'apc-cf': '87', 'apc-wage': '1' } });
  assert.equal(apc.valid, true);
  assert.equal(apc.result.totalUsd, 1044, 'total OPPS $1044 (lines parsed, N packaged, T discounted)');
  assert.deepEqual(apc.result.lines.map((l) => l.payUsd), [870, 174, 0]);
  assert.equal(apc.domain, 'administrative');
});

// spec-v630: one-shot natural-language answer via queryCompute.
test('spec-v630: answer_query computes a value from a sentence with embedded numbers', () => {
  const bmi = answerQuery({ query: 'bmi 80kg 180cm' });
  assert.equal(bmi.matched, true);
  assert.equal(bmi.valid, true);
  assert.equal(bmi.tile, 'bmi');
  assert.equal(bmi.value, 24.7);
  assert.ok(bmi.citation, 'carries the tile citation');
  assert.ok(bmi.result, 'attaches the full result when inputs round-trip');

  const map = answerQuery({ query: 'map 120/80' });
  assert.equal(map.tile, 'map');
  assert.ok(Math.abs(map.value - 93.3) < 0.5);

  const miss = answerQuery({ query: 'what is the meaning of life' });
  assert.equal(miss.matched, false);
  assert.equal(miss.code, 'NO_MATCH');

  assert.equal(answerQuery({ query: '   ' }).code, 'BAD_ARGS');
  // deterministic
  assert.deepEqual(answerQuery({ query: 'bmi 80kg 180cm' }), bmi);
});

// spec-v630: deterministic lab/vitals unit conversion.
test('spec-v630: convert_units converts labs and vitals both directions', () => {
  const g = convertUnits({ kind: 'glucose', value: 90, direction: 'toSi' });
  assert.equal(g.valid, true);
  assert.ok(Math.abs(g.result - 5.0) < 0.05, `glucose 90 mg/dL ~= 5.0 mmol/L, got ${g.result}`);
  assert.equal(g.units, 'mg/dL -> mmol/L');

  const back = convertUnits({ kind: 'glucose', value: 5, direction: 'fromSi' });
  assert.ok(Math.abs(back.result - 90) < 1, `5 mmol/L ~= 90 mg/dL, got ${back.result}`);

  const t = convertUnits({ kind: 'temperature', value: 98.6, direction: 'fToC' });
  assert.ok(Math.abs(t.result - 37) < 0.1);

  const a1c = convertUnits({ kind: 'a1c', value: 7, direction: 'pctToIfcc' });
  assert.ok(Math.abs(a1c.result - 53) < 1, `A1c 7% ~= 53 mmol/mol, got ${a1c.result}`);

  // default direction when omitted
  assert.equal(convertUnits({ kind: 'pressure', value: 120 }).direction, 'mmHgToKpa');
  // errors
  assert.equal(convertUnits({ kind: 'nope', value: 1 }).code, 'BAD_ARGS');
  assert.equal(convertUnits({ kind: 'glucose', value: 'abc' }).code, 'INVALID_TYPE');
  // via dispatch too
  assert.equal(dispatch('convert_units', { kind: 'weight', value: 220, direction: 'lbToKg' }).valid, true);
});

// spec-v623: batch compute is an ordered fan-out; one failure doesn't sink the rest.
test('spec-v623: compute_batch runs many, isolates failures, and is bounded', () => {
  const r = computeBatch({
    calculations: [
      { id: 'meld-xi', inputs: { 'mx-bili': 2.0, 'mx-creat': 1.5 } },
      { id: 'meld-xi', inputs: {} }, // invalid: missing input
      { id: 'no-such-tile', inputs: {} }, // invalid: unknown id
    ],
  });
  assert.equal(r.count, 3);
  assert.equal(r.results.length, 3);
  assert.equal(r.results[0].valid, true);
  assert.equal(r.results[0].result.score, 18);
  assert.equal(r.results[1].valid, false);
  assert.equal(r.results[1].code, 'MISSING_INPUT');
  assert.equal(r.results[2].valid, false);
  assert.equal(r.results[2].code, 'UNKNOWN_ID');
  assert.ok(r.disclaimer);
  // ordering preserved + deterministic
  assert.deepEqual(computeBatch({ calculations: [{ id: 'meld-xi', inputs: { 'mx-bili': 2.0, 'mx-creat': 1.5 } }] }).results[0].result.score, 18);

  // guards
  assert.equal(computeBatch({}).code, 'BAD_ARGS');
  assert.equal(computeBatch({ calculations: [] }).code, 'BAD_ARGS');
  const tooMany = computeBatch({ calculations: Array.from({ length: 26 }, () => ({ id: 'meld-xi', inputs: {} })) });
  assert.equal(tooMany.code, 'BAD_ARGS');
  assert.match(tooMany.message, /at most 25/);
  // via dispatch
  assert.equal(dispatch('compute_batch', { calculations: [{ id: 'ecg-axis', inputs: { 'ea-i': 8, 'ea-avf': 6 } }] }).count, 1);
});

// spec-v630: describe_calculator exposes the curated related-tile graph.
test('spec-v630: describe_calculator returns related ids, all exposed/describable', () => {
  const d = describeCalculator({ id: 'chads' });
  assert.ok(Array.isArray(d.related), 'related is an array');
  assert.ok(d.related.length > 0, 'chads has related calculators');
  assert.ok(d.related.includes('hasbled'), 'chads relates to hasbled');
  for (const rid of d.related) {
    assert.equal(describeCalculator({ id: rid }).id, rid, `related id ${rid} is itself describable`);
  }
  // a tile with no META.related still returns an array (never undefined)
  const any = describeCalculator({ id: getCatalogManifest().calculators[0].id });
  assert.ok(Array.isArray(any.related));
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

// spec-v637 §2: stable-id aliasing resolves retired ids to their canonical successor.
test('spec-v637: resolveWithAliases resolves, reports removals, and passes unknowns through', () => {
  const reg = { chads: { id: 'chads', name: 'CHA2DS2-VASc' } };
  const get = (x) => reg[x] || null;
  const aliases = {
    'chads-vasc': { canonical: 'chads', since: '2026-01-01', sunset: '2026-12-31' },
    gone: { canonical: 'removed-tile', since: '2025-01-01' },
  };
  // direct hit: no deprecation
  assert.deepEqual(resolveWithAliases('chads', get, aliases), { entry: reg.chads, deprecation: null });
  // alias -> live canonical, with a deprecation notice
  const r = resolveWithAliases('chads-vasc', get, aliases);
  assert.equal(r.entry, reg.chads);
  assert.equal(r.deprecation.canonicalId, 'chads');
  assert.equal(r.deprecation.deprecatedId, 'chads-vasc');
  assert.equal(r.deprecation.sunset, '2026-12-31');
  // alias -> removed canonical, reports where it went
  const g = resolveWithAliases('gone', get, aliases);
  assert.equal(g.entry, null);
  assert.equal(g.deprecation.removed, true);
  assert.equal(g.deprecation.canonicalId, 'removed-tile');
  // truly unknown
  assert.deepEqual(resolveWithAliases('nope', get, aliases), { entry: null, deprecation: null });
});

test('spec-v637: the live alias file is empty, so an unknown id is a plain UNKNOWN_ID', () => {
  const r = describeCalculator({ id: 'definitely-not-a-tile' });
  assert.equal(r.code, 'UNKNOWN_ID');
  assert.ok(!('replacedBy' in r), 'no alias record maps an unknown id today');
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
