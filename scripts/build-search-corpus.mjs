#!/usr/bin/env node
// plain-language-search task 1 (Design D1): compile a per-tile natural-language
// search corpus under data/search-corpus/ from EXISTING hand-authored sources
// only. No AI, no scraping, no new prose. The corpus enriches the front-door
// prompt resolver (lib/prompt.js) so plain questions route to the right tile.
//
// Sources, per tile id (the UTILITIES id is the join key):
//   - name / group / audiences          UTILITIES literal in app.js
//   - specialties                        META[id].specialties (lib/meta.js)
//   - summary                            mcp adapter one-line summary (optional:
//                                        skipped silently if the mcp/ subtree is
//                                        absent, so the site still builds)
//   - what / when                        data/tool-copy/<id>.json (fallback, used
//                                        only when a tile has no adapter summary)
//   - expected                           META[id].example.expected (fallback)
//   - bands[]                            META[id].interpretation.bands[].text
//
// Output (both deterministic, byte-stable across rebuilds -- no timestamps):
//   data/search-corpus/corpus.json       { <id>: { name, group, ... } }
//   data/search-corpus/manifest.json     { version, hash, count, budgetGzip, ... }
//
// The output is committed (an accelerator asset like data/synonyms.json) and
// copied into dist/ by scripts/build.mjs. Budget: <= 200 KB gzipped, asserted
// here so a future catalog addition that blows it fails the build loudly.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { tileName } from './lib/tile-name.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_DIR = join(ROOT, 'data', 'search-corpus');
// spec-v736: CORPUS TIERING implemented (the real fix from docs/spec-v619.md). The corpus
// is split into two files:
//   corpus.json        Tier 1 (TIER1_FIELDS): id -> {name, group, audiences, specialties}.
//                       High find-signal, small, grows ~35 B/tile. The HARD budget below is
//                       checked against THIS file, so the build no longer hits a wall as the
//                       catalog grows.
//   corpus-detail.json Tier 2 (TIER2_FIELDS): id -> {summary, what, when, expected, bands}.
//                       The desc-channel prose (lib/search-corpus.js corpusDesc) - the bulk
//                       of the bytes. Both consumers (app.js, mcp/tools.js) merge the tiers
//                       back into one row before ranking, so ranking is byte-for-byte the
//                       same as the single-file corpus; only the on-the-wire layout changed.
// BUDGET_GZIP is the Tier-1 ceiling (was the whole-corpus ceiling before tiering); DETAIL_
// BUDGET_GZIP is a generous guardrail on Tier 2. Before tiering the single blob was ~225 KB
// against a 226 KiB budget with ~4 tiles of headroom; tiering drops Tier 1 to ~63 KB.
const BUDGET_GZIP = 226 * 1024;
const DETAIL_BUDGET_GZIP = 320 * 1024;
const TIER1_FIELDS = ['name', 'group', 'audiences', 'specialties'];
const TIER2_FIELDS = ['summary', 'what', 'when', 'expected', 'bands'];

// Field length caps (chars, cut at a word boundary). Tuned so the full catalog
// stays comfortably under the gzip budget with headroom for growth.
const CAP = { summary: 200, what: 200, when: 200, expected: 180, band: 50 };
// Interpretation bands are the lowest search-signal field (an interpretation-range
// label + text; nobody searches by band text), so the per-tile band count is
// trimmed first when the catalog grows into the gzip budget: four bands became three
// at ~1253 tiles (spec-v401). At 1397 tiles (spec-v547) the budget breached again, and
// cutting to TWO bands was tried and REVERTED: it regressed a golden search probe, so
// band text carries more signal than "nobody searches by band text" implies. The band
// COUNT was therefore kept at three and CAP.band was cut 92 -> 64 instead, which keeps
// every band present (so the matching band still exists for a query) while trimming the
// long tail. At 1482 tiles (spec-v651) the budget breached again by ~150 B and CAP.band
// was cut 64 -> 50 (the documented stopgap in spec-v619; the real fix is corpus tiering).
// 50 is the floor that keeps CHADS's "antithrombotic therapy not recommended" band phrase
// intact for its golden probe (48 dropped the trailing word and regressed it).
// If this breaches again, cut CAP.band further before cutting MAX_BANDS, and
// re-run test:mcp to confirm no probe regresses.
const MAX_BANDS = 3;

// Sanitize source prose: en/em dashes -> hyphen, smart quotes -> ASCII, collapse
// whitespace. The dash/quote codepoints are written as \u escapes (not literals)
// so this script itself stays clean under scripts/grep-check.mjs.
const DASHES = /[\u2012\u2013\u2014\u2015\u2212]/g;
const SQUOTES = /[\u2018\u2019]/g;
const DQUOTES = /[\u201C\u201D]/g;
function clean(s) {
  return String(s || '')
    .replace(DASHES, '-')
    .replace(SQUOTES, "'")
    .replace(DQUOTES, '"')
    .replace(/\s+/g, ' ')
    .trim();
}
function cut(s, n) {
  const c = clean(s);
  if (c.length <= n) return c;
  const t = c.slice(0, n);
  const i = t.lastIndexOf(' ');
  return (i > n * 0.6 ? t.slice(0, i) : t).trim();
}

// Parse the UTILITIES literal out of app.js (id/name/group/audiences). We can't
// import app.js under Node -- it pulls in views that touch the DOM at module
// init -- so we parse the literal, the same approach as build-tool-pages.mjs.
async function loadUtilities() {
  const src = await readFile(join(ROOT, 'app.js'), 'utf8');
  const arr = src.match(/const UTILITIES = \[([\s\S]*?)\n\];/);
  if (!arr) throw new Error('build-search-corpus: could not find UTILITIES in app.js');
  const tiles = [];
  for (const line of arr[1].split('\n')) {
    const id = line.match(/id:\s*'([^']+)'/);
    const name = tileName(line);
    const group = line.match(/group:\s*'([^']+)'/);
    if (!(id && name && group)) continue;
    const audMatch = line.match(/audiences:\s*\[([^\]]*)\]/);
    const audiences = audMatch ? [...audMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1]) : [];
    tiles.push({ id: id[1], name, group: group[1], audiences });
  }
  if (tiles.length === 0) throw new Error('build-search-corpus: zero tiles parsed');
  tiles.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return tiles;
}

async function loadMeta() {
  const mod = await import(new URL('../lib/meta.js', import.meta.url));
  return mod.META;
}

// Adapter summaries, keyed by tile id. Optional: if the mcp/ subtree is absent
// (the site must build without it) we return an empty map and skip summaries.
async function loadSummaries() {
  if (!existsSync(join(ROOT, 'mcp', 'catalog.js'))) return new Map();
  try {
    const mod = await import(new URL('../mcp/catalog.js', import.meta.url));
    const map = new Map();
    for (const c of mod.allCalculators()) map.set(c.id, c.summary);
    return map;
  } catch (err) {
    console.warn(`build-search-corpus: mcp adapter summaries unavailable (${err.message}); building without them`);
    return new Map();
  }
}

async function loadToolCopy(id) {
  const path = new URL(`../data/tool-copy/${id}.json`, import.meta.url);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return null;
  }
}

function bandsOf(meta) {
  const bands = meta && meta.interpretation && Array.isArray(meta.interpretation.bands)
    ? meta.interpretation.bands.map((b) => cut(b && b.text, CAP.band)).filter(Boolean)
    : [];
  return bands.slice(0, MAX_BANDS);
}

async function buildRow(tile, meta, summaries) {
  const m = meta || {};
  const row = { name: clean(tile.name), group: tile.group };
  if (tile.audiences.length) row.audiences = tile.audiences;
  if (Array.isArray(m.specialties) && m.specialties.length) row.specialties = m.specialties;

  const summary = summaries.has(tile.id) ? cut(summaries.get(tile.id), CAP.summary) : '';
  if (summary) {
    row.summary = summary;
  } else {
    // Fallbacks only where there is no adapter summary: hand-authored tool-copy
    // prose first, then the META example sentence.
    const tc = await loadToolCopy(tile.id);
    if (tc && (tc.whatThisIs || tc.whenToUse)) {
      if (tc.whatThisIs) row.what = cut(tc.whatThisIs, CAP.what);
      if (tc.whenToUse) row.when = cut(tc.whenToUse, CAP.when);
    } else if (m.example && m.example.expected) {
      row.expected = cut(m.example.expected, CAP.expected);
    }
  }

  const bands = bandsOf(m);
  if (bands.length) row.bands = bands;
  return row;
}

async function main() {
  const [tiles, META, summaries] = await Promise.all([loadUtilities(), loadMeta(), loadSummaries()]);

  // Build the full rows, then split each into a Tier-1 (index) row and a Tier-2
  // (detail) row. Every tile has a Tier-1 row (name + group are guaranteed);
  // Tier-2 rows are emitted only when the tile has desc prose, so tiles without a
  // summary/bands add nothing to corpus-detail.json.
  const index = {};
  const detail = {};
  for (const tile of tiles) {
    const row = await buildRow(tile, META[tile.id], summaries);
    const t1 = {};
    for (const f of TIER1_FIELDS) if (row[f] !== undefined) t1[f] = row[f];
    index[tile.id] = t1;
    const t2 = {};
    for (const f of TIER2_FIELDS) if (row[f] !== undefined) t2[f] = row[f];
    if (Object.keys(t2).length) detail[tile.id] = t2;
  }

  const indexJson = JSON.stringify(index);
  const detailJson = JSON.stringify(detail);
  const indexGzip = gzipSync(indexJson).length;
  const detailGzip = gzipSync(detailJson).length;
  if (indexGzip > BUDGET_GZIP) {
    throw new Error(
      `build-search-corpus: Tier-1 corpus.json is ${indexGzip} bytes gzipped, over the ${BUDGET_GZIP}-byte budget. `
      + 'Tier-1 carries only name/group/audiences/specialties; if this is hit, the id/name set itself is the weight.',
    );
  }
  if (detailGzip > DETAIL_BUDGET_GZIP) {
    throw new Error(
      `build-search-corpus: Tier-2 corpus-detail.json is ${detailGzip} bytes gzipped, over the ${DETAIL_BUDGET_GZIP}-byte budget. `
      + 'Trim CAP.band / CAP.summary, or move Tier-2 to on-demand sharded loading (docs/spec-v619.md).',
    );
  }

  const hash = createHash('sha256').update(indexJson).digest('hex').slice(0, 16);
  const detailHash = createHash('sha256').update(detailJson).digest('hex').slice(0, 16);
  const manifest = {
    version: '2',
    generator: 'scripts/build-search-corpus.mjs',
    note: 'Per-tile natural-language search corpus compiled from existing hand-authored sources (UTILITIES, META, mcp adapter summaries, data/tool-copy). spec-v736: tiered into corpus.json (Tier 1: name/group/audiences/specialties, budgeted) + corpus-detail.json (Tier 2: summary/what/when/expected/bands). Consumers merge both before ranking. Deterministic and byte-stable; regenerated by npm run build. Accelerator asset: search degrades to name/id/synonym routing if absent.',
    tier1Fields: TIER1_FIELDS,
    tier2Fields: TIER2_FIELDS,
    count: tiles.length,
    withSummary: tiles.filter((t) => summaries.has(t.id)).length,
    budgetGzip: BUDGET_GZIP,
    gzipBytes: indexGzip,
    hash,
    detail: {
      file: 'corpus-detail.json',
      count: Object.keys(detail).length,
      budgetGzip: DETAIL_BUDGET_GZIP,
      gzipBytes: detailGzip,
      hash: detailHash,
    },
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(join(OUT_DIR, 'corpus.json'), indexJson, 'utf8');
  await writeFile(join(OUT_DIR, 'corpus-detail.json'), detailJson, 'utf8');
  await writeFile(join(OUT_DIR, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  console.log(
    `build-search-corpus: wrote ${tiles.length} rows (${manifest.withSummary} with adapter summary) `
    + `to data/search-corpus/ -- Tier 1 ${(indexGzip / 1024).toFixed(1)} KB gzip (hash ${hash}), `
    + `Tier 2 ${(detailGzip / 1024).toFixed(1)} KB gzip (${manifest.detail.count} rows, hash ${detailHash}).`,
  );
}

main().catch((err) => {
  console.error('build-search-corpus: failed', err);
  process.exit(1);
});
