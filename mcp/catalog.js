// spec-v183 §2.3-§2.4: assemble the MCP calculator registry.
//
// Single source of truth (spec-v183 §1.2): compute logic stays in lib/*.js,
// citations/examples/specialties/interpretation stay in lib/meta.js, and the
// tile's name/group/clinical flag stay in app.js `UTILITIES`. This module joins
// the three at load time. The adapter contributes ONLY the input schema and the
// pure mapping functions; everything else is read, never re-typed.
//
// app.js is parsed as TEXT (the same static-parse discipline as
// scripts/check-catalog-truth.mjs) rather than imported, because app.js couples
// to the browser DOM and must never be loaded in the Node MCP process.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { META } from '../lib/meta.js';
import { fieldSchema, makeToArgs, validateInputs } from './fields.js';

import toxV86 from './adapters/tox-v86.js';
import hepV124 from './adapters/hep-v124.js';
import acidbaseV129 from './adapters/acidbase-v129.js';
import cardioV90 from './adapters/cardio-v90.js';
import pulmV91 from './adapters/pulm-v91.js';
import neuroV118 from './adapters/neuro-v118.js';
import endoV136 from './adapters/endo-v136.js';
import periopV97 from './adapters/periop-v97.js';
import oneformulaV167 from './adapters/oneformula-v167.js';

const ADAPTER_MODULES = [
  ['tox-v86', toxV86],
  ['hep-v124', hepV124],
  ['acidbase-v129', acidbaseV129],
  ['cardio-v90', cardioV90],
  ['pulm-v91', pulmV91],
  ['neuro-v118', neuroV118],
  ['endo-v136', endoV136],
  ['periop-v97', periopV97],
  ['oneformula-v167', oneformulaV167],
];

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');

// Parse the { id, name, group, clinical } of every UTILITIES row from app.js
// text. Rows are single-line `  { id: '...', name: '...', group: '...', ...,
// clinical: true|false }`, verified by scripts/check-catalog-truth.mjs's count
// regex. Returns a Map keyed by id.
function parseUtilities() {
  const text = readFileSync(join(ROOT, 'app.js'), 'utf8');
  const start = text.indexOf('const UTILITIES = [');
  if (start === -1) throw new Error('mcp/catalog: cannot locate UTILITIES in app.js');
  let depth = 0;
  let i = text.indexOf('[', start);
  let end = -1;
  for (; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '[') depth += 1;
    else if (ch === ']') { depth -= 1; if (depth === 0) { end = i; break; } }
  }
  if (end === -1) throw new Error('mcp/catalog: cannot locate end of UTILITIES array');
  const body = text.slice(start, end);
  const rows = new Map();
  const rowRe = /\{\s*id:\s*'([^']+)',\s*name:\s*'((?:\\.|[^'])*)',\s*group:\s*'([^']*)'[^}]*?clinical:\s*(true|false)\b/g;
  let m;
  while ((m = rowRe.exec(body)) !== null) {
    rows.set(m[1], { id: m[1], name: m[2].replace(/\\'/g, "'"), group: m[3], clinical: m[4] === 'true' });
  }
  return rows;
}

// spec-v50 §3 clinical-posture disclaimer carried on every compute/describe.
export const DISCLAIMER = 'This is a computed quantity for decision support, not a treat / escalate / prescribe order. The value and its interpretation are the cited source’s; the decision stays with the clinician and local protocol.';

function buildRegistry() {
  const utilities = parseUtilities();
  const registry = new Map();
  const errors = [];

  for (const [moduleName, entries] of ADAPTER_MODULES) {
    for (const a of entries) {
      const { id, fields, compute, summary } = a;
      if (!id) { errors.push(`${moduleName}: adapter with no id`); continue; }
      if (registry.has(id)) { errors.push(`${id}: duplicate adapter`); continue; }
      const util = utilities.get(id);
      if (!util) { errors.push(`${id}: not present in UTILITIES (app.js)`); continue; }
      if (!util.clinical) { errors.push(`${id}: not clinical:true (spec-v183 §2.4 first wave is clinical only)`); continue; }
      const meta = META[id];
      if (!meta) { errors.push(`${id}: no META entry`); continue; }
      if (!Array.isArray(fields) || fields.length === 0) { errors.push(`${id}: no fields`); continue; }
      if (typeof compute !== 'function') { errors.push(`${id}: compute is not a function`); continue; }
      if (typeof summary !== 'string' || summary.length < 8) { errors.push(`${id}: missing summary`); continue; }

      const toArgs = typeof a.toArgs === 'function' ? a.toArgs : makeToArgs(fields);
      const formatResult = typeof a.formatResult === 'function' ? a.formatResult : (raw) => raw;

      registry.set(id, {
        id,
        module: moduleName,
        name: util.name,
        group: util.group,
        clinical: util.clinical,
        specialties: meta.specialties || [],
        summary,
        fields,
        inputSchema: fieldSchema(fields),
        compute,
        toArgs,
        formatResult,
        validate: (inputs) => validateInputs(inputs, fields),
        citation: meta.citation || null,
        citationUrl: meta.citationUrl || null,
        citationAccessed: meta.citationAccessed || null,
        interpretation: meta.interpretation || null,
        example: meta.example || null,
      });
    }
  }

  if (errors.length) {
    throw new Error('mcp/catalog: registry assembly failed:\n  ' + errors.join('\n  '));
  }
  return { registry, totalTiles: utilities.size };
}

const { registry, totalTiles } = buildRegistry();

export const REGISTRY = registry;
export const TOTAL_TILES = totalTiles;

export function getCalculator(id) { return registry.get(id) || null; }
export function allCalculators() { return [...registry.values()]; }
export function coverageCount() { return registry.size; }
