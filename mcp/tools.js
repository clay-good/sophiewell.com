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

export function listCalculators(args = {}) {
  const { group, specialty, query } = args;
  const rows = allCalculators()
    .filter((e) => matches(e, { group, specialty, query }))
    .map((e) => ({
      id: e.id,
      name: e.name,
      group: e.group,
      specialties: e.specialties,
      summary: e.summary,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
  return {
    coverage: `${coverageCount()} of ${TOTAL_TILES} catalog tiles exposed as MCP tools`,
    exposed: coverageCount(),
    catalogTotal: TOTAL_TILES,
    count: rows.length,
    calculators: rows,
  };
}

export function describeCalculator(args = {}) {
  const { id } = args;
  const e = getCalculator(id);
  if (!e) return { valid: false, message: `Unknown calculator id "${id}". Call list_calculators for available ids.` };
  return {
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
    disclaimer: DISCLAIMER,
  };
}

export function computeCalculator(args = {}) {
  const { id, inputs } = args;
  const e = getCalculator(id);
  if (!e) return { id, valid: false, message: `Unknown calculator id "${id}". Call list_calculators for available ids.` };

  const v = e.validate(inputs || {});
  if (!v.valid) return { id, valid: false, message: v.message };

  let raw;
  try {
    raw = e.compute(e.toArgs(inputs || {}));
  } catch (err) {
    return { id, valid: false, message: `Computation failed: ${err && err.message ? err.message : 'unknown error'}` };
  }

  // null (some libs) or an explicit { valid: false } shape = incomplete input.
  if (raw == null || raw.valid === false) {
    const message = (raw && (raw.message || raw.band)) || 'Enter the required values.';
    return { id, valid: false, message };
  }

  const result = e.formatResult(raw);
  const leak = firstNonFinite(result);
  if (leak) {
    return { id, valid: false, message: `Output-safety guard: non-finite value at ${leak}.` };
  }

  return {
    id,
    valid: true,
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
    return { valid: false, message: 'find_calculator needs a non-empty "query". Describe the calculation in plain words, e.g. "stroke risk afib".' };
  }
  let limit = Number.isFinite(args.limit) ? Math.floor(args.limit) : FIND_LIMIT_DEFAULT;
  limit = Math.max(1, Math.min(FIND_LIMIT_MAX, limit));

  // Rank over the exposed calculators, optionally prefiltered by group /
  // specialty (the prefilters compose with the query). Sort by id so ranker
  // ties resolve deterministically.
  const tiles = allCalculators()
    .filter((e) => (!group || e.group === group) && (!specialty || e.specialties.includes(specialty)))
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((e) => ({ id: e.id, name: e.name, group: e.group, specialties: e.specialties, desc: '' }));

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
      hint: 'No calculator matched. Try fewer or more common words, or call list_calculators to browse by group / specialty.',
    };
  }
  return { query: q, count: candidates.length, candidates };
}

// Tool definitions exposed over MCP. inputSchema here is the schema for the
// TOOL's own arguments, not a calculator's.
export const TOOL_DEFS = [
  {
    name: 'list_calculators',
    description: 'Discover the exposed deterministic clinical calculators. Optional filters: group (catalog group letter), specialty, query (substring over id/name/specialties). Returns lightweight rows plus the live coverage count. No computation.',
    inputSchema: {
      type: 'object',
      properties: {
        group: { type: 'string', description: 'Catalog group letter, e.g. "G" or "E".' },
        specialty: { type: 'string', description: 'Specialty tag, e.g. "hepatology".' },
        query: { type: 'string', description: 'Substring match over id, name, summary, specialties.' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'describe_calculator',
    description: 'Return the full contract for one calculator: input JSON Schema, a worked example, the primary citation (with URL and access date), the source interpretation bands, and the clinical-posture disclaimer.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'Calculator id from list_calculators.' } },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'compute_calculator',
    description: 'Run one calculator deterministically. Inputs are validated against the calculator inputSchema first; invalid or incomplete inputs return { valid: false, message } (never a thrown error or a non-finite number). On success returns the structured result, the citation, and the disclaimer.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Calculator id from list_calculators.' },
        inputs: { type: 'object', description: 'Inputs keyed per the calculator inputSchema (describe_calculator).' },
      },
      required: ['id', 'inputs'],
      additionalProperties: false,
    },
  },
  {
    name: 'find_calculator',
    description: 'Find calculators by a plain-language description of the calculation ("stroke risk afib", "creatinine clearance"). Deterministically ranks the exposed calculators (synonym table + token ranker, no AI) and returns the top-N candidates with a match reason. Use this for discovery by intent; use list_calculators to enumerate or browse by group / specialty.',
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
  },
];

export function dispatch(name, args) {
  switch (name) {
    case 'list_calculators': return listCalculators(args);
    case 'describe_calculator': return describeCalculator(args);
    case 'compute_calculator': return computeCalculator(args);
    case 'find_calculator': return findCalculator(args);
    default: return { valid: false, message: `Unknown tool "${name}".` };
  }
}

export { REGISTRY, TOTAL_TILES, coverageCount, DISCLAIMER };
