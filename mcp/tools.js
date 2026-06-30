// spec-v183 §2.2: the three dispatch tools, as pure functions independent of
// the MCP SDK. mcp/server.js wires these to a StdioServerTransport; the unit
// tests call them directly. Keeping the tool logic SDK-free means the test
// suite (and CI) needs no transport dependency, and the site stays buildable
// with the MCP subtree removed.

import {
  REGISTRY, TOTAL_TILES, getCalculator, allCalculators, coverageCount, DISCLAIMER,
} from './catalog.js';

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

// Tool definitions exposed over MCP (the fixed three-tool surface). inputSchema
// here is the schema for the TOOL's own arguments, not a calculator's.
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
];

export function dispatch(name, args) {
  switch (name) {
    case 'list_calculators': return listCalculators(args);
    case 'describe_calculator': return describeCalculator(args);
    case 'compute_calculator': return computeCalculator(args);
    default: return { valid: false, message: `Unknown tool "${name}".` };
  }
}

export { REGISTRY, TOTAL_TILES, coverageCount, DISCLAIMER };
