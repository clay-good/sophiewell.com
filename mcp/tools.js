// spec-v183 §2.2: the three dispatch tools, as pure functions independent of
// the MCP SDK. mcp/server.js wires these to a StdioServerTransport; the unit
// tests call them directly. Keeping the tool logic SDK-free means the test
// suite (and CI) needs no transport dependency, and the site stays buildable
// with the MCP subtree removed.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  REGISTRY, TOTAL_TILES, getCalculator, allCalculators, coverageCount, DISCLAIMER, ADMIN_DISCLAIMER,
} from './catalog.js';

// spec-v629: clinical tiles carry the clinical disclaimer; non-clinical
// (billing/coding/admin) tiles carry the administrative one. `domain` lets an
// agent tell decision-support from administrative math.
function disclaimerFor(e) { return e.clinical ? DISCLAIMER : ADMIN_DISCLAIMER; }
function domainOf(e) { return e.clinical ? 'clinical' : 'administrative'; }
import { resolvePromptRanked, rankableWords } from '../lib/prompt.js';
import { buildNameCounts, nameMatch, namesInFull } from '../lib/name-match.js';
import { corpusDesc } from '../lib/search-corpus.js';
import { queryCompute } from '../lib/query-compute.js';
// spec-v758: the generic extractor behind answer_query's second attempt. Reads
// the same adapter field descriptors this module already has in memory, so it
// needs no data file -- see toIndexRows.
import { queryFill, toIndexRows } from '../lib/query-fill.js';
import * as UNITS from '../lib/unit-convert.js';

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
// its name still routes. spec-v736 tiered the corpus into corpus.json (Tier 1:
// name/group/audiences/specialties) + corpus-detail.json (Tier 2: the desc prose);
// merge both per id so ranking sees the same row as the pre-tiering single file.
// Load once, lazily; if absent, find_calculator ranks on names + specialties alone
// (same accelerator-not-dependency contract as the synonym table).
let corpusCache;
function readCorpusFile(name) {
  try {
    const path = fileURLToPath(new URL(`../data/search-corpus/${name}`, import.meta.url));
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return {};
  }
}
function loadCorpus() {
  if (corpusCache !== undefined) return corpusCache;
  const index = readCorpusFile('corpus.json');
  const detail = readCorpusFile('corpus-detail.json');
  corpusCache = {};
  for (const id of Object.keys(index)) corpusCache[id] = { ...index[id], ...(detail[id] || {}) };
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
    domain: domainOf(e),
    disclaimer: disclaimerFor(e),
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
    domain: domainOf(e),
    disclaimer: disclaimerFor(e),
  };
}

// spec plain-language-search / mcp-discovery: a ranked discovery tool. Where
// list_calculators does a single lowercase substring test (so "stroke risk
// afib" matches nothing), find_calculator runs the shared deterministic
// resolver -- the synonym table plus the token ranker from lib/prompt.js -- over
// the exposed registry and returns the top-N candidates with a `why` tag. Same
// ranker, two surfaces (browser prompt bar + MCP). No AI, no model.
// How far past the caller's limit to rank before the name pass reorders.
const PROMOTE_LOOKAHEAD = 5;
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

  // spec-v765: rank on the words. An agent passing a question with its values
  // in it -- which answer_query encourages -- otherwise has those values
  // competing with the name for the match.
  // Rank a few beyond the caller's limit so the name pass below can promote a
  // tile the token ranker put just out of reach, then trim back to `limit`.
  const ranked = resolvePromptRanked(rankableWords(q) || q, tiles, loadSynonymEntries(), 'all', Math.min(FIND_LIMIT_MAX, limit + PROMOTE_LOOKAHEAD));
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

  // spec-v771: the token ranker scores on overlap, so a SHORTER sibling whose
  // name is contained in a longer one wins its own name: "TIMI Risk Score for
  // STEMI (Morrow)" returned `timi` first, "CHADS2 Score" returned `chads`,
  // "Glasgow Coma Scale - Pupils" returned `gcs`. 62 of 1540 calculators could
  // not be reached at rank 1 by their own exact name -- and find_calculator is
  // how an agent looks a calculator up.
  //
  // answer_query already weighs nameMatch (spec-v762); this is the same rule on
  // the discovery path. Reordering happens strictly WITHIN the ranked set, so a
  // group / specialty prefilter can never be bypassed by a promotion.
  if (candidates.length > 1) {
    const best = candidates.reduce((acc, c) => {
      const m = nameMatchFor(q, c);
      // Promote only when the query names the calculator IN FULL -- every
      // distinctive word of its name is present. Weaker rules override curated
      // routes: on `strong` alone, `therapy` (rare among names, common in
      // language) put Therapy Units over CHA2DS2-VASc for "antithrombotic
      // therapy not recommended"; on two-matched-words, "creatinine clearance"
      // put Cockcroft-Gault over the synonym-routed eGFR. Naming a calculator
      // outright is a different act from describing what you want, and only the
      // first should outrank the ranker. The MCP suite caught both.
      return (namesInFull(q, c.name) && m.score > acc.score) ? { score: m.score, id: c.id } : acc;
    }, { score: nameMatchFor(q, candidates[0]).score, id: candidates[0].id });
    if (best.id !== candidates[0].id) {
      const i = candidates.findIndex((c) => c.id === best.id);
      candidates.unshift(candidates.splice(i, 1)[0]);
    }
  }
  candidates.length = Math.min(candidates.length, limit);

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

// spec-v630: one-shot natural-language answer. queryCompute (lib/query-compute.js,
// the same parser the browser search bar uses) turns a sentence with embedded
// values ("bmi 80kg 180cm", "map 120/80") into a computed answer, reusing each
// tile's own lib compute so the number matches the tile. Deterministic, no AI. On
// a match it also attaches the citation and, when the parsed inputs round-trip,
// the full structured result; the `inputs` let an agent re-run compute_calculator.
export function answerQuery(args = {}) {
  const { query } = args;
  const q = typeof query === 'string' ? query.trim() : '';
  if (!q) {
    return { valid: false, code: 'BAD_ARGS', message: 'answer_query needs a non-empty "query". Describe the calculation with its values, e.g. "bmi 80kg 180cm".' };
  }
  const hit = queryCompute(q);
  if (!hit) return answerQueryGeneric(q);
  const out = {
    query: q, matched: true, valid: true, tile: hit.tile, label: hit.label, value: hit.value, unit: hit.unit, text: hit.text, inputs: hit.inputs,
  };
  const e = getCalculator(hit.tile);
  if (e) {
    out.citation = e.citation;
    out.citationUrl = e.citationUrl;
    out.disclaimer = disclaimerFor(e);
  }
  const full = computeCalculator({ id: hit.tile, inputs: hit.inputs });
  if (full.valid) out.result = full.result;
  return out;
}

// spec-v766: name matching moved to lib/name-match.js so the website and this
// server decide the same way. The counts are built once from the exposed
// catalog.
let nameCounts = null;
function counts() {
  if (!nameCounts) nameCounts = buildNameCounts(allCalculators().map((e) => e.name));
  return nameCounts;
}
function nameMatchFor(query, entry) {
  return nameMatch(query, entry && entry.name, counts());
}
function queryNamesTile(query, entry) {
  return nameMatchFor(query, entry).score > 0;
}


// spec-v758: the second attempt, when no hand-written template matches.
//
// queryCompute covers 22 tiles, each verified against a unit-tested expected
// value. Every other query used to come back NO_MATCH and cost the agent two
// more round trips -- find_calculator, then compute_calculator, re-typing the
// values it had already written out in the question. The site solved this by
// reading the adapter field registry; the registry is already in memory here,
// so the same extractor works with no data file.
//
// It answers on its own terms. A confident single match with every required
// input present computes and returns like a template hit, marked `via:
// "registry"` so a caller can tell the two apart. Anything short of that
// returns what it DID work out -- the calculator, the inputs it recovered, and
// the ones it still needs -- which is strictly more useful than NO_MATCH and
// saves the agent the discovery round trip either way.
function answerQueryGeneric(q) {
  const found = findCalculator({ query: q, limit: 5 });
  const candidates = (found && Array.isArray(found.candidates)) ? found.candidates : [];
  if (!candidates.length) {
    return { query: q, matched: false, code: 'NO_MATCH', hint: 'No calculator matches this query. Try find_calculator with different words.' };
  }
  // A query that NAMES a calculator gets that calculator. The ranker scores on
  // tokens and its top hit is routinely a near neighbour: "CHA2DS2-VA" came
  // back as `chads`, and "Modified Glasgow (Imrie)" as `ranson-bisap`. Both
  // then answered -- matched:true, with a citation -- for a calculator the
  // caller never asked about, which is worse than not answering at all.
  // Pick by how strongly the query names each candidate, not by first match:
  // "planned surgery" matched RACHS-1's "Surgery" and stole a POSPOM query,
  // and "Pancreatitis Severity" matched ranson-bisap while the query also said
  // "Glasgow" and "Imrie". Ties keep the ranker's order.
  // Only a STRONG name match may override the ranker; see nameMatch. A weak one
  // leaves the ranker's own ordering alone, which is what it is for.
  const scored = candidates
    .map((c) => ({ c, ...nameMatchFor(q, getCalculator(c.id)) }))
    .filter((x) => x.strong)
    .sort((a, b) => b.score - a.score);
  const bestScore = scored.length ? scored[0].score : 0;

  // Two calculators the query names equally well is not a tie to break, it is a
  // question to hand back. The catalog is full of siblings -- HEART and HEAR,
  // Sternbach and the serotonin-toxicity criteria, osmolal gap and effective
  // osmolality -- and picking one produced a confident, cited answer to a
  // question the caller did not ask. The website refuses the same way
  // (spec-v756); so should this.
  if (bestScore > 0) {
    const tied = scored.filter((x) => x.score >= bestScore * 0.999);
    if (tied.length > 1) {
      return {
        query: q,
        matched: false,
        code: 'AMBIGUOUS',
        candidates: tied.map((x) => x.c.id),
        hint: `The query names ${tied.length} calculators equally well: ${tied.map((x) => x.c.id).join(', ')}. `
          + 'Pick one and call compute_calculator, or ask with the one you mean.',
      };
    }
  }
  const top = scored.length ? scored[0].c : candidates[0];

  const entry = getCalculator(top.id);
  const rows = toIndexRows(entry && entry.fields);
  if (!rows.length) {
    return { query: q, matched: false, code: 'NO_MATCH', tile: top.id, hint: `Closest match is "${top.id}". Call describe_calculator for its inputs, then compute_calculator.` };
  }

  const { filled, missing } = queryFill(q, rows);
  if (!Object.keys(filled).length) {
    // No values means no corroboration, and the ranker always returns its best
    // guess however weak -- "what is the meaning of life" comes back as
    // crop-index. Only name a calculator here when the query actually names it;
    // otherwise this is a miss, and saying so is more useful than a confident
    // pointer at a tile the caller never asked about.
    if (!queryNamesTile(q, entry)) {
      return { query: q, matched: false, code: 'NO_MATCH', hint: 'No calculator matches this query. Try find_calculator with different words.' };
    }
    return {
      query: q, matched: false, code: 'NO_VALUES', tile: top.id,
      hint: `Matched "${top.id}" but the query carries no values it recognizes. Call describe_calculator for its inputs, then compute_calculator.`,
    };
  }
  if (missing.length) {
    return {
      query: q, matched: false, code: 'MISSING_INPUTS', tile: top.id, inputs: filled, missing,
      hint: `Matched "${top.id}" and recovered ${Object.keys(filled).length} input(s). Supply ${missing.join(', ')} and call compute_calculator.`,
    };
  }

  const full = computeCalculator({ id: top.id, inputs: filled });
  if (!full.valid) {
    return {
      query: q, matched: false, code: full.code || 'INVALID_INPUTS', tile: top.id, inputs: filled,
      hint: full.message || `Recovered every input for "${top.id}" but the calculator rejected them. Call describe_calculator for the accepted ranges.`,
    };
  }
  const out = {
    query: q, matched: true, valid: true, via: 'registry', tile: top.id, label: entry.name,
    inputs: filled, result: full.result,
  };
  // Criteria the query never mentioned. `missing` only covers REQUIRED fields,
  // and a scoring tile's criteria are optional by construction -- so pospom
  // answered "3.126% mortality" from three inputs with fifteen comorbidity
  // criteria unstated, and nothing in the response said so. The score is a
  // floor, not an answer, and a caller cannot tell without being told.
  // Any field the query did not provide, not just the boolean criteria. An
  // optional NUMBER matters just as much: gold-spirometry answered with
  // grade:null because the FEV1 percentage never came through, and said
  // nothing about it. `missing` covers only REQUIRED fields, and it returns
  // before computing -- this is the set the calculator was willing to run
  // without.
  const unstated = rows
    .filter((f) => !f.r && !Object.prototype.hasOwnProperty.call(filled, f.d))
    .map((f) => f.d);
  if (unstated.length) {
    out.unstated = unstated;
    out.unstatedNote = `${unstated.length} optional input(s) were not mentioned; the calculator ran `
      + 'without them, so a scored result is a floor. Supply them via compute_calculator for a complete answer.';
  }
  out.citation = entry.citation;
  out.citationUrl = entry.citationUrl;
  out.disclaimer = disclaimerFor(entry);
  return out;
}

// spec-v630: lab + vitals unit conversion, reusing lib/unit-convert.js verbatim.
// Each `kind` has two directions; value in, converted value out, with the unit
// labels. Deterministic and pure. The lab kinds come straight from the LAB table
// so this list can never drift from the library.
const CONVERSIONS = (() => {
  const map = {};
  for (const kind of Object.keys(UNITS.LAB)) {
    const r = UNITS.LAB[kind];
    map[kind] = {
      directions: ['toSi', 'fromSi'],
      units: { toSi: `${r.from} -> ${r.to}`, fromSi: `${r.to} -> ${r.from}` },
      convert: (v, d) => UNITS.labConvert(kind, v, d === 'fromSi' ? 'fromSi' : 'toSi'),
    };
  }
  map.a1c = {
    directions: ['pctToIfcc', 'ifccToPct'],
    units: { pctToIfcc: '% NGSP -> mmol/mol IFCC', ifccToPct: 'mmol/mol IFCC -> % NGSP' },
    convert: (v, d) => (d === 'ifccToPct' ? UNITS.a1cIfccToPct(v) : UNITS.a1cPctToIfcc(v)),
  };
  map.pressure = {
    directions: ['mmHgToKpa', 'kpaToMmHg'],
    units: { mmHgToKpa: 'mmHg -> kPa', kpaToMmHg: 'kPa -> mmHg' },
    convert: (v, d) => (d === 'kpaToMmHg' ? UNITS.kpaToMmHg(v) : UNITS.mmHgToKpa(v)),
  };
  map.temperature = {
    directions: ['fToC', 'cToF'],
    units: { fToC: 'degF -> degC', cToF: 'degC -> degF' },
    convert: (v, d) => (d === 'cToF' ? UNITS.cToF(v) : UNITS.fToC(v)),
  };
  map.length = {
    directions: ['inToCm', 'cmToIn'],
    units: { inToCm: 'in -> cm', cmToIn: 'cm -> in' },
    convert: (v, d) => (d === 'cmToIn' ? UNITS.cmToInches(v) : UNITS.inchesToCm(v)),
  };
  map.weight = {
    directions: ['lbToKg', 'kgToLb'],
    units: { lbToKg: 'lb -> kg', kgToLb: 'kg -> lb' },
    convert: (v, d) => (d === 'kgToLb' ? UNITS.kgToLb(v) : UNITS.lbToKg(v)),
  };
  return map;
})();

export const CONVERT_KINDS = Object.keys(CONVERSIONS);

export function convertUnits(args = {}) {
  const { kind, value, direction } = args;
  const c = CONVERSIONS[kind];
  if (!c) {
    return { valid: false, code: 'BAD_ARGS', field: 'kind', message: `Unknown kind "${kind}". One of: ${CONVERT_KINDS.join(', ')}.` };
  }
  const dir = c.directions.includes(direction) ? direction : c.directions[0];
  const n = typeof value === 'number' ? value : (typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN);
  if (!Number.isFinite(n)) {
    return { valid: false, code: 'INVALID_TYPE', field: 'value', message: '"value" must be a finite number.' };
  }
  let result;
  try {
    result = c.convert(n, dir);
  } catch (err) {
    return { valid: false, code: 'COMPUTE_ERROR', message: err && err.message ? err.message : 'conversion failed' };
  }
  if (!Number.isFinite(result)) {
    return { valid: false, code: 'COMPUTE_ERROR', message: 'conversion produced a non-finite value' };
  }
  return {
    valid: true, kind, direction: dir, value: n, result, units: c.units[dir],
  };
}

// spec-v623: batch compute. A thin, ordered fan-out over computeCalculator so an
// agent assembling a workup (qSOFA + NEWS2 + SOFA, say) pays one round-trip
// instead of N. Each element runs through the exact same validated, output-safe
// path; one element's failure never sinks the others (it returns its own
// { valid:false, code, message } in place). Bounded so a single call cannot be
// turned into a load amplifier. No cross-calculator synthesis (posture): the
// agent reasons over the individual results.
const BATCH_MAX = 25;

export function computeBatch(args = {}) {
  const { calculations } = args;
  if (!Array.isArray(calculations)) {
    return { valid: false, code: 'BAD_ARGS', field: 'calculations', message: 'compute_batch needs a "calculations" array of { id, inputs }.' };
  }
  if (calculations.length === 0) {
    return { valid: false, code: 'BAD_ARGS', field: 'calculations', message: 'compute_batch "calculations" must not be empty.' };
  }
  if (calculations.length > BATCH_MAX) {
    return { valid: false, code: 'BAD_ARGS', field: 'calculations', message: `compute_batch accepts at most ${BATCH_MAX} calculations per call (got ${calculations.length}).` };
  }
  const results = calculations.map((c) => {
    const call = (c && typeof c === 'object' && !Array.isArray(c)) ? c : {};
    return computeCalculator({ id: call.id, inputs: call.inputs });
  });
  return { count: results.length, results, disclaimer: DISCLAIMER };
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
  '"creatinine clearance"), or list_calculators / get_catalog_manifest to browse. (2) Inspect — call',
  'describe_calculator to get a calculator\'s input JSON Schema, a worked example, interpretation bands,',
  'related calculators, and citation before computing. (3) Compute — call compute_calculator with the id',
  'and inputs; inputs are validated against the schema, and invalid or incomplete input returns',
  '{ valid: false, code, message } rather than throwing.',
  '',
  'Shortcuts: answer_query takes a sentence that already contains its values ("bmi 80kg 180cm") and',
  'returns the number directly; convert_units does lab/vitals unit conversion (mg/dL <-> mmol/L, etc.);',
  'compute_batch runs up to 25 calculators in one call for a workup.',
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
        domain: { type: 'string', description: 'clinical | administrative (which disclaimer applies).' },
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
        domain: { type: 'string', description: 'clinical | administrative (which disclaimer applies).' },
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
  {
    name: 'answer_query',
    description: 'One-shot answer: parse a plain-language query that already contains its values ("bmi 80kg 180cm", "map 120/80", "corrected calcium ca 8 albumin 2") and return the computed value directly, with the citation. Deterministic (no AI). Returns matched:false with code NO_MATCH when no template applies — then use find_calculator + compute_calculator.',
    annotations: readOnlyAnnotations('Answer a query in one shot'),
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'A calculation described with its numbers, e.g. "bmi 80kg 180cm".' },
      },
      required: ['query'],
      additionalProperties: false,
    },
    outputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        matched: { type: 'boolean' },
        valid: { type: 'boolean' },
        tile: { type: 'string' },
        label: { type: 'string' },
        value: {},
        unit: { type: 'string' },
        text: { type: 'string' },
        inputs: { type: 'object' },
        result: { type: 'object' },
        citation: { type: ['string', 'null'] },
        citationUrl: { type: ['string', 'null'] },
        disclaimer: { type: 'string' },
        code: { type: 'string' },
        hint: { type: 'string' },
        message: {
          type: 'string',
          description: 'With code BAD_ARGS: what was wrong with the call itself, as opposed to `hint`, which suggests the next tool to reach for.',
        },
        // spec-v768: the fields spec-v758 and spec-v762 added. They were
        // returned but never declared, so an agent reading this contract could
        // not discover them -- including `unstated`, which exists precisely to
        // warn a caller that the number it just received is incomplete.
        via: {
          type: 'string',
          enum: ['registry'],
          description: 'Present only when the answer came from the generic field-registry path rather than a hand-written, unit-tested template. Absent means a template produced it.',
        },
        unstated: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional inputs the query did not supply. The calculator ran without them, so a SCORED result is a floor, not a total. Supply them via compute_calculator for a complete answer.',
        },
        unstatedNote: {
          type: 'string',
          description: 'The same warning as `unstated`, in one sentence.',
        },
        missing: {
          type: 'array',
          items: { type: 'string' },
          description: 'Required inputs still needed, with code MISSING_INPUTS. `inputs` carries what was already recovered, so only these have to be supplied.',
        },
        candidates: {
          type: 'array',
          items: { type: 'string' },
          description: 'With code AMBIGUOUS: the calculator ids the query names equally well. Pick one rather than assuming the first.',
        },
      },
    },
  },
  {
    name: 'compute_batch',
    description: 'Run several calculators in one call. Pass calculations: [{ id, inputs }, ...] (max 25). Returns results in request order; each is the same shape as compute_calculator, and one invalid element does not fail the others. No combined interpretation — reason over the individual results.',
    annotations: readOnlyAnnotations('Compute several calculators'),
    inputSchema: {
      type: 'object',
      properties: {
        calculations: {
          type: 'array',
          description: 'Up to 25 { id, inputs } calculations to run together.',
          maxItems: 25,
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Calculator id.' },
              inputs: { type: 'object', description: 'Inputs keyed per the calculator inputSchema.' },
            },
            required: ['id', 'inputs'],
          },
        },
      },
      required: ['calculations'],
      additionalProperties: false,
    },
    outputSchema: {
      type: 'object',
      properties: {
        count: { type: 'integer' },
        results: { type: 'array', items: { type: 'object' } },
        disclaimer: { type: 'string' },
        valid: { type: 'boolean' },
        code: { type: 'string' },
        field: { type: 'string' },
        message: { type: 'string' },
      },
    },
  },
  {
    name: 'convert_units',
    description: 'Deterministic lab and vitals unit conversion. kind is one of the lab analytes (glucose, cholesterol, creatinine, bun, calcium, uricAcid, albumin, hemoglobin, magnesium, bilirubin, lactate) or a1c, pressure, temperature, length, weight. direction picks which way; the default is the first listed for that kind. Returns the converted value and the unit labels.',
    annotations: readOnlyAnnotations('Convert units'),
    inputSchema: {
      type: 'object',
      properties: {
        kind: { type: 'string', description: 'What to convert, e.g. "glucose", "creatinine", "a1c", "pressure", "temperature".' },
        value: { type: 'number', description: 'The numeric value to convert.' },
        direction: { type: 'string', description: 'e.g. lab: "toSi"|"fromSi"; a1c: "pctToIfcc"|"ifccToPct"; pressure: "mmHgToKpa"|"kpaToMmHg". Defaults to the first for the kind.' },
      },
      required: ['kind', 'value'],
      additionalProperties: false,
    },
    outputSchema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean' },
        kind: { type: 'string' },
        direction: { type: 'string' },
        value: { type: 'number' },
        result: { type: 'number' },
        units: { type: 'string' },
        code: { type: 'string' },
        field: { type: 'string' },
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
    case 'answer_query': return answerQuery(args);
    case 'convert_units': return convertUnits(args);
    case 'compute_batch': return computeBatch(args);
    default: return { valid: false, code: 'UNKNOWN_TOOL', message: `Unknown tool "${name}".` };
  }
}

export { REGISTRY, TOTAL_TILES, coverageCount, DISCLAIMER };
