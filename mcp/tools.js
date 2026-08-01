// spec-v183 §2.2: the three dispatch tools, as pure functions independent of
// the MCP SDK. mcp/server.js wires these to a StdioServerTransport; the unit
// tests call them directly. Keeping the tool logic SDK-free means the test
// suite (and CI) needs no transport dependency, and the site stays buildable
// with the MCP subtree removed.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  REGISTRY, TOTAL_TILES, getCalculator, allCalculators, coverageCount, DISCLAIMER,
} from './catalog.js';
import { resolvePromptRanked } from '../lib/prompt.js';
import { corpusDesc } from '../lib/search-corpus.js';

// The hand-curated synonym table (data/synonyms.json) is the same accelerator
// the browser prompt bar uses. Load it once, lazily; if it is absent the ranker
// still works on names + specialties (find_calculator degrades to ranker-only).
let synonymsCache;
function loadSynonymEntries() {
  if (synonymsCache !== undefined) return synonymsCache;
  try {
    const path = fileURLToPath(new URL('../data/synonyms.json', import.meta.url));
    const doc = JSON.parse(readFileSync(path, 'utf8'));
    synonymsCache = Array.isArray(doc && doc.entries) ? doc.entries : [];
  } catch {
    synonymsCache = [];
  }
  return synonymsCache;
}

// The committed search corpus (scripts/build-search-corpus.mjs) carries per-tile
// natural-language prose -- adapter summaries, interpretation-band text, example
// sentences -- so a query term that appears in a tile's summary or bands but not
// its name still routes. Load it once, lazily; if absent, find_calculator ranks
// on names + specialties alone (same accelerator-not-dependency contract as the
// synonym table).
let corpusCache;
function loadCorpus() {
  if (corpusCache !== undefined) return corpusCache;
  try {
    const path = fileURLToPath(new URL('../data/search-corpus/corpus.json', import.meta.url));
    corpusCache = JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    corpusCache = {};
  }
  return corpusCache;
}

// spec-v637 §3: scripts/build-search-corpus.mjs writes a deterministic sha256 of
// the corpus to data/search-corpus/manifest.json each release. Load it once,
// lazily; degrade to {} if absent (accelerator-not-dependency, like the corpus).
let manifestCache;
function loadManifest() {
  if (manifestCache !== undefined) return manifestCache;
  try {
    const path = fileURLToPath(new URL('../data/search-corpus/manifest.json', import.meta.url));
    manifestCache = JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    manifestCache = {};
  }
  return manifestCache;
}

// spec-v637 §3-4: the content version an agent can pin and cache against. The
// hash changes iff the catalog content changes, so results are safe to cache
// keyed by (id, inputs, contentHash). deterministic/cacheable make the standing
// guarantee machine-readable. Counts are read live, never hardcoded.
export function catalogVersion() {
  const m = loadManifest();
  return {
    contentHash: typeof m.hash === 'string' ? m.hash : null,
    tileCount: TOTAL_TILES,
    exposedCount: coverageCount(),
    deterministic: true,
    cacheable: true,
  };
}

// spec-v637 §2: stable-id aliasing. Tile ids are the public API; when a shipped
// id is retired it maps here to its canonical successor so an agent that
// hardcoded the old id self-heals. Loaded once, lazily; empty if absent
// (accelerator-not-dependency). Empty today — no shipped id has been renamed.
let aliasCache;
function loadIdAliases() {
  if (aliasCache !== undefined) return aliasCache;
  try {
    const path = fileURLToPath(new URL('../data/id-aliases.json', import.meta.url));
    const doc = JSON.parse(readFileSync(path, 'utf8'));
    aliasCache = (doc && typeof doc.aliases === 'object' && doc.aliases) ? doc.aliases : {};
  } catch {
    aliasCache = {};
  }
  return aliasCache;
}

// Pure resolver (unit-testable with a synthetic getter + map): a direct hit
// wins; else an alias to a LIVE canonical resolves WITH a deprecation notice;
// else an alias whose canonical was removed reports where it went; else nothing.
// No wall-clock is read (the server stays deterministic) -- `sunset` is advisory
// metadata, and a maintainer removes the entry after that date.
export function resolveWithAliases(id, getCalc, aliases) {
  const direct = getCalc(id);
  if (direct) return { entry: direct, deprecation: null };
  const a = aliases && aliases[id];
  if (a && typeof a.canonical === 'string') {
    const canonical = getCalc(a.canonical);
    if (canonical) {
      return { entry: canonical, deprecation: { deprecatedId: id, canonicalId: a.canonical, sunset: a.sunset || null } };
    }
    return {
      entry: null, deprecation: { deprecatedId: id, canonicalId: a.canonical, since: a.since || null, removed: true },
    };
  }
  return { entry: null, deprecation: null };
}

function resolveEntry(id) {
  return resolveWithAliases(id, getCalculator, loadIdAliases());
}

// spec-v59 output-safety on the JSON surface: a result must serialize with no
// NaN / Infinity. Returns the dotted path of the first non-finite number, or
// null if clean.
function firstNonFinite(value, path = 'result') {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? null : path;
  }
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) {
      const hit = firstNonFinite(value[i], `${path}[${i}]`);
      if (hit) return hit;
    }
    return null;
  }
  if (value && typeof value === 'object') {
    for (const k of Object.keys(value)) {
      const hit = firstNonFinite(value[k], `${path}.${k}`);
      if (hit) return hit;
    }
    return null;
  }
  return null;
}

function matches(entry, { group, specialty, query }) {
  if (group && entry.group !== group) return false;
  if (specialty && !entry.specialties.includes(specialty)) return false;
  if (query) {
    const q = String(query).toLowerCase();
    const hay = `${entry.id} ${entry.name} ${entry.summary} ${entry.specialties.join(' ')}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

// spec-v635 §1-2: list_calculators is capped and paginated so the natural
// "show me everything" call can no longer return a whole context window of rows
// (the full unfiltered set serialized to ~230k tokens). `total` is the full
// match count; `count` is the rows in this page; `nextOffset` is null when the
// page is the last one. `fields: 'compact'` drops the heavy `summary`/`specialties`
// (an ~8x smaller row) for cheap browsing.
const LIST_LIMIT_DEFAULT = 50;
const LIST_LIMIT_MAX = 200;

export function listCalculators(args = {}) {
  const { group, specialty, query, fields } = args;
  const compact = fields === 'compact';
  const matched = allCalculators()
    .filter((e) => matches(e, { group, specialty, query }))
    .sort((a, b) => a.id.localeCompare(b.id));

  let limit = Number.isFinite(args.limit) ? Math.floor(args.limit) : LIST_LIMIT_DEFAULT;
  limit = Math.max(1, Math.min(LIST_LIMIT_MAX, limit));
  let offset = Number.isFinite(args.offset) ? Math.floor(args.offset) : 0;
  offset = Math.max(0, offset);

  const page = matched.slice(offset, offset + limit);
  const rows = page.map((e) => (compact
    ? { id: e.id, name: e.name, group: e.group }
    : {
      id: e.id, name: e.name, group: e.group, specialties: e.specialties, summary: e.summary,
    }));
  const nextOffset = offset + page.length < matched.length ? offset + page.length : null;

  return {
    coverage: `${coverageCount()} of ${TOTAL_TILES} catalog tiles exposed as MCP tools`,
    exposed: coverageCount(),
    catalogTotal: TOTAL_TILES,
    catalogVersion: catalogVersion(),
    total: matched.length,
    count: rows.length,
    offset,
    nextOffset,
    calculators: rows,
  };
}

// spec-v635 §3: a one-shot compact index of every exposed calculator, so an
// agent can reason about the whole catalog in a single call (id/name/group/
// specialties, no summaries) instead of paging list_calculators. A thin
// projection of the live registry -- the same source of truth, no new data.
export function getCatalogManifest() {
  const calculators = allCalculators()
    .map((e) => ({
      id: e.id, name: e.name, group: e.group, specialties: e.specialties,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
  return {
    coverage: `${coverageCount()} of ${TOTAL_TILES} catalog tiles exposed as MCP tools`,
    exposed: coverageCount(),
    catalogTotal: TOTAL_TILES,
    catalogVersion: catalogVersion(),
    count: calculators.length,
    calculators,
  };
}

export function describeCalculator(args = {}) {
  const { id } = args;
  const { entry: e, deprecation } = resolveEntry(id);
  if (!e) {
    if (deprecation) return { id, valid: false, code: 'UNKNOWN_ID', replacedBy: deprecation.canonicalId, deprecatedSince: deprecation.since, message: `Calculator id "${id}" was retired; use "${deprecation.canonicalId}".` };
    return { id, valid: false, code: 'UNKNOWN_ID', message: `Unknown calculator id "${id}". Call list_calculators for available ids.` };
  }
  const out = {
    id: e.id,
    name: e.name,
    group: e.group,
    specialties: e.specialties,
    summary: e.summary,
    inputSchema: e.inputSchema,
    example: e.example,
    citation: e.citation,
    citationUrl: e.citationUrl,
    citationAccessed: e.citationAccessed,
    interpretation: e.interpretation,
    // spec-v630: the curated related calculators, filtered to the exposed set so
    // every id here is one the agent can describe/compute next.
    related: (e.related || []).filter((rid) => getCalculator(rid)),
    disclaimer: DISCLAIMER,
  };
  // spec-v637 §2: if reached via a retired id, tell the agent so it can migrate.
  if (deprecation) {
    out.deprecatedId = deprecation.deprecatedId;
    out.canonicalId = deprecation.canonicalId;
    out.deprecationSunset = deprecation.sunset;
  }
  return out;
}

export function computeCalculator(args = {}) {
  const { id, inputs } = args;
  const { entry: e, deprecation } = resolveEntry(id);
  if (!e) {
    if (deprecation) return { id, valid: false, code: 'UNKNOWN_ID', replacedBy: deprecation.canonicalId, deprecatedSince: deprecation.since, message: `Calculator id "${id}" was retired; use "${deprecation.canonicalId}".` };
    return { id, valid: false, code: 'UNKNOWN_ID', message: `Unknown calculator id "${id}". Call list_calculators for available ids.` };
  }
  // spec-v637 §2: deprecation fields ride on every return when reached via a
  // retired id, so the agent can self-heal and migrate before the sunset date.
  const dep = deprecation
    ? { deprecatedId: deprecation.deprecatedId, canonicalId: deprecation.canonicalId, deprecationSunset: deprecation.sunset }
    : null;

  // spec-v637 §1: pass the validator's stable code/field through unchanged.
  const v = e.validate(inputs || {});
  if (!v.valid) return { id: e.id, valid: false, code: v.code, ...(v.field ? { field: v.field } : {}), ...(dep || {}), message: v.message };

  let raw;
  try {
    raw = e.compute(e.toArgs(inputs || {}));
  } catch (err) {
    return { id: e.id, valid: false, code: 'COMPUTE_ERROR', ...(dep || {}), message: `Computation failed: ${err && err.message ? err.message : 'unknown error'}` };
  }

  // null (some libs) or an explicit { valid: false } shape = incomplete input.
  if (raw == null || raw.valid === false) {
    const message = (raw && (raw.message || raw.band)) || 'Enter the required values.';
    return { id: e.id, valid: false, code: 'INCOMPLETE', ...(dep || {}), message };
  }

  const result = e.formatResult(raw);
  const leak = firstNonFinite(result);
  if (leak) {
    return { id: e.id, valid: false, code: 'COMPUTE_ERROR', ...(dep || {}), message: `Output-safety guard: non-finite value at ${leak}.` };
  }

  return {
    id: e.id,
    valid: true,
    ...(dep || {}),
    result,
    citation: e.citation,
    citationUrl: e.citationUrl,
    citationAccessed: e.citationAccessed,
    disclaimer: DISCLAIMER,
  };
}

// spec plain-language-search / mcp-discovery: a ranked discovery tool. Where
// list_calculators does a single lowercase substring test (so "stroke risk
// afib" matches nothing), find_calculator runs the shared deterministic
// resolver -- the synonym table plus the token ranker from lib/prompt.js -- over
// the exposed registry and returns the top-N candidates with a `why` tag. Same
// ranker, two surfaces (browser prompt bar + MCP). No AI, no model.
const FIND_LIMIT_DEFAULT = 5;
const FIND_LIMIT_MAX = 20;

export function findCalculator(args = {}) {
  const { query, group, specialty } = args;
  const q = typeof query === 'string' ? query.trim() : '';
  if (!q) {
    return { valid: false, code: 'BAD_ARGS', message: 'find_calculator needs a non-empty "query". Describe the calculation in plain words, e.g. "stroke risk afib".' };
  }
  let limit = Number.isFinite(args.limit) ? Math.floor(args.limit) : FIND_LIMIT_DEFAULT;
  limit = Math.max(1, Math.min(FIND_LIMIT_MAX, limit));

  // Rank over the exposed calculators, optionally prefiltered by group /
  // specialty (the prefilters compose with the query). Sort by id so ranker
  // ties resolve deterministically. Each tile's `desc` carries the corpus prose
  // so summary / band terms are matchable, not just the name.
  const corpus = loadCorpus();
  const tiles = allCalculators()
    .filter((e) => (!group || e.group === group) && (!specialty || e.specialties.includes(specialty)))
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((e) => ({ id: e.id, name: e.name, group: e.group, specialties: e.specialties, desc: corpusDesc(corpus[e.id]) }));

  const ranked = resolvePromptRanked(q, tiles, loadSynonymEntries(), 'all', limit);
  const candidates = ranked.map((r) => {
    const e = getCalculator(r.tileId);
    return {
      id: e.id,
      name: e.name,
      group: e.group,
      specialties: e.specialties,
      summary: e.summary,
      why: r.why,
      ...(r.phrase ? { matchedPhrase: r.phrase } : {}),
    };
  });

  if (candidates.length === 0) {
    return {
      query: q,
      count: 0,
      candidates: [],
      code: 'NO_MATCH',
      hint: 'No calculator matched. Try fewer or more common words, or call list_calculators to browse by group / specialty.',
    };
  }
  return { query: q, count: candidates.length, candidates };
}

// spec-v634 §1: the server-level usage guidance the client shows the model on
// connect. One authoritative place that teaches the discover -> describe ->
// compute pipeline and the determinism / read-only / citation posture. Kept
// concise: it is prepended to model context every session.
export const SERVER_INSTRUCTIONS = [
  'Sophie Well exposes deterministic, individually cited clinical calculators as read-only tools.',
  'Nothing here writes data, calls a network, or invokes a model: identical inputs always return',
  'byte-identical output, so results are safe to cache.',
  '',
  'Workflow: (1) Discover — call find_calculator with a plain-language intent ("stroke risk in afib",',
  '"creatinine clearance"), or call list_calculators to enumerate or browse by group / specialty.',
  '(2) Inspect — call describe_calculator to get a calculator\'s input JSON Schema, a worked example,',
  'interpretation bands, and citation before computing. (3) Compute — call compute_calculator with the',
  'id and inputs; inputs are validated against the schema, and invalid or incomplete input returns',
  '{ valid: false, message } rather than throwing.',
  '',
  'Every describe / compute result carries the source citation (with URL and access date) and a',
  'disclaimer: a computed value is decision-support, not a treat / prescribe order. Surface the',
  'citation and leave the clinical decision to the clinician.',
].join('\n');

// spec-v634 §2: every tool is read-only, side-effect-free, deterministic, and
// closed-world (the catalog is a fixed set). These advisory hints let a client
// auto-approve safe reads without a confirmation prompt, cache and safely retry
// results, and treat a find_calculator miss as authoritative rather than a
// transient/network failure. destructiveHint is omitted — it is only meaningful
// when readOnlyHint is false.
function readOnlyAnnotations(title) {
  return { title, readOnlyHint: true, idempotentHint: true, openWorldHint: false };
}

// spec-v634 §3: build the CallTool response envelope. The text block stays for
// back-compat with clients that ignore structuredContent; structuredContent is
// the same payload as a typed object so agents need not re-parse a JSON string.
// Pure (no SDK) so it is unit-testable and mcp/ stays deletable.
// spec-v635 §4: the wire is serialized compact (no 2-space indent) — a free
// ~13-15% token saving on every payload; the transport is machine-read, and
// describe_calculator carries the human-readable detail either way.
export function toCallToolResult(result) {
  return {
    content: [{ type: 'text', text: JSON.stringify(result) }],
    structuredContent: result,
  };
}

// Tool definitions exposed over MCP. inputSchema here is the schema for the
// TOOL's own arguments, not a calculator's. outputSchema documents the stable
// result envelope (the variable per-calculator `result` object is left open);
// the low-level Server performs no output validation, so a loose schema is safe.
export const TOOL_DEFS = [
  {
    name: 'list_calculators',
    description: 'Discover the exposed deterministic clinical calculators. Optional filters: group (catalog group letter), specialty, query (substring over id/name/specialties). Paginated (default 50, max 200 per page) — read `total`, `count`, and `nextOffset`. Pass fields:"compact" for id/name/group only. For a one-shot whole-catalog index use get_catalog_manifest. No computation.',
    annotations: readOnlyAnnotations('List clinical calculators'),
    inputSchema: {
      type: 'object',
      properties: {
        group: { type: 'string', description: 'Catalog group letter, e.g. "G" or "E".' },
        specialty: { type: 'string', description: 'Specialty tag, e.g. "hepatology".' },
        query: { type: 'string', description: 'Substring match over id, name, summary, specialties.' },
        limit: { type: 'integer', description: 'Max rows per page (default 50, capped at 200).' },
        offset: { type: 'integer', description: 'Row offset for pagination (default 0). Use the returned nextOffset to page.' },
        fields: { type: 'string', enum: ['full', 'compact'], description: '"compact" returns id/name/group only (~8x smaller); "full" (default) adds specialties + summary.' },
      },
      additionalProperties: false,
    },
    outputSchema: {
      type: 'object',
      properties: {
        coverage: { type: 'string' },
        exposed: { type: 'integer' },
        catalogTotal: { type: 'integer' },
        catalogVersion: { type: 'object' },
        total: { type: 'integer' },
        count: { type: 'integer' },
        offset: { type: 'integer' },
        nextOffset: { type: ['integer', 'null'] },
        calculators: { type: 'array', items: { type: 'object' } },
      },
    },
  },
  {
    name: 'get_catalog_manifest',
    description: 'Return a compact one-shot index of every exposed calculator (id, name, group, specialties) plus the live coverage counts. Use this once to reason about the whole catalog cheaply, instead of paging list_calculators. No summaries, no computation.',
    annotations: readOnlyAnnotations('Get the catalog manifest'),
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    outputSchema: {
      type: 'object',
      properties: {
        coverage: { type: 'string' },
        exposed: { type: 'integer' },
        catalogTotal: { type: 'integer' },
        catalogVersion: { type: 'object' },
        count: { type: 'integer' },
        calculators: { type: 'array', items: { type: 'object' } },
      },
    },
  },
  {
    name: 'describe_calculator',
    description: 'Return the full contract for one calculator: input JSON Schema, a worked example, the primary citation (with URL and access date), the source interpretation bands, and the clinical-posture disclaimer.',
    annotations: readOnlyAnnotations('Describe a calculator'),
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'Calculator id from list_calculators.' } },
      required: ['id'],
      additionalProperties: false,
    },
    outputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        group: { type: 'string' },
        specialties: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' },
        inputSchema: { type: 'object' },
        example: { type: 'object' },
        citation: { type: ['string', 'null'] },
        citationUrl: { type: ['string', 'null'] },
        citationAccessed: { type: ['string', 'null'] },
        interpretation: {},
        related: { type: 'array', items: { type: 'string' }, description: 'Ids of related calculators, all exposed and describable.' },
        disclaimer: { type: 'string' },
        valid: { type: 'boolean' },
        code: { type: 'string', description: 'Stable error code on failure, e.g. UNKNOWN_ID.' },
        message: { type: 'string' },
      },
    },
  },
  {
    name: 'compute_calculator',
    description: 'Run one calculator deterministically. Inputs are validated against the calculator inputSchema first; invalid or incomplete inputs return { valid: false, message } (never a thrown error or a non-finite number). On success returns the structured result, the citation, and the disclaimer.',
    annotations: readOnlyAnnotations('Compute a calculator'),
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Calculator id from list_calculators.' },
        inputs: { type: 'object', description: 'Inputs keyed per the calculator inputSchema (describe_calculator).' },
      },
      required: ['id', 'inputs'],
      additionalProperties: false,
    },
    outputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        valid: { type: 'boolean' },
        result: { type: 'object' },
        citation: { type: ['string', 'null'] },
        citationUrl: { type: ['string', 'null'] },
        citationAccessed: { type: ['string', 'null'] },
        disclaimer: { type: 'string' },
        code: { type: 'string', description: 'Stable error code on failure: UNKNOWN_ID, MISSING_INPUT, UNKNOWN_INPUT, INVALID_TYPE, INCOMPLETE, or COMPUTE_ERROR.' },
        field: { type: 'string', description: 'The offending input key, when the error is input-specific.' },
        message: { type: 'string' },
      },
    },
  },
  {
    name: 'find_calculator',
    description: 'Find calculators by a plain-language description of the calculation ("stroke risk afib", "creatinine clearance"). Deterministically ranks the exposed calculators (synonym table + token ranker, no AI) and returns the top-N candidates with a match reason. Use this for discovery by intent; use list_calculators to enumerate or browse by group / specialty.',
    annotations: readOnlyAnnotations('Find calculators by intent'),
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Plain-language description of the calculation you want.' },
        limit: { type: 'integer', description: 'Max candidates to return (default 5, capped at 20).' },
        group: { type: 'string', description: 'Optional catalog group letter prefilter, e.g. "G".' },
        specialty: { type: 'string', description: 'Optional specialty-tag prefilter, e.g. "hepatology".' },
      },
      required: ['query'],
      additionalProperties: false,
    },
    outputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        count: { type: 'integer' },
        candidates: { type: 'array', items: { type: 'object' } },
        hint: { type: 'string' },
        code: { type: 'string', description: 'NO_MATCH when nothing ranked; BAD_ARGS for an empty query.' },
        valid: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  },
];

export function dispatch(name, args) {
  switch (name) {
    case 'list_calculators': return listCalculators(args);
    case 'get_catalog_manifest': return getCatalogManifest(args);
    case 'describe_calculator': return describeCalculator(args);
    case 'compute_calculator': return computeCalculator(args);
    case 'find_calculator': return findCalculator(args);
    default: return { valid: false, code: 'UNKNOWN_TOOL', message: `Unknown tool "${name}".` };
  }
}

export { REGISTRY, TOTAL_TILES, coverageCount, DISCLAIMER };
