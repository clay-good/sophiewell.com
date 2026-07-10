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

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_DIR = join(ROOT, 'data', 'search-corpus');
const BUDGET_GZIP = 200 * 1024;

// Field length caps (chars, cut at a word boundary). Tuned so the full catalog
// stays comfortably under the gzip budget with headroom for growth.
const CAP = { summary: 200, what: 200, when: 200, expected: 180, band: 120 };
const MAX_BANDS = 5;

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
    const name = line.match(/name:\s*'([^']+)'/);
    const group = line.match(/group:\s*'([^']+)'/);
    if (!(id && name && group)) continue;
    const audMatch = line.match(/audiences:\s*\[([^\]]*)\]/);
    const audiences = audMatch ? [...audMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1]) : [];
    tiles.push({ id: id[1], name: name[1], group: group[1], audiences });
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

  const corpus = {};
  for (const tile of tiles) {
    corpus[tile.id] = await buildRow(tile, META[tile.id], summaries);
  }

  const corpusJson = JSON.stringify(corpus);
  const gzipBytes = gzipSync(corpusJson).length;
  if (gzipBytes > BUDGET_GZIP) {
    throw new Error(
      `build-search-corpus: corpus is ${gzipBytes} bytes gzipped, over the ${BUDGET_GZIP}-byte budget. `
      + 'Tighten the CAP field limits or drop the lowest-signal field.',
    );
  }

  const hash = createHash('sha256').update(corpusJson).digest('hex').slice(0, 16);
  const manifest = {
    version: '1',
    generator: 'scripts/build-search-corpus.mjs',
    note: 'Per-tile natural-language search corpus compiled from existing hand-authored sources (UTILITIES, META, mcp adapter summaries, data/tool-copy). Deterministic and byte-stable; regenerated by npm run build. Accelerator asset: search degrades to name/id/synonym routing if it is absent.',
    fields: ['name', 'group', 'audiences', 'specialties', 'summary', 'what', 'when', 'expected', 'bands'],
    count: tiles.length,
    withSummary: tiles.filter((t) => summaries.has(t.id)).length,
    budgetGzip: BUDGET_GZIP,
    gzipBytes,
    hash,
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(join(OUT_DIR, 'corpus.json'), corpusJson, 'utf8');
  await writeFile(join(OUT_DIR, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  console.log(
    `build-search-corpus: wrote ${tiles.length} rows (${manifest.withSummary} with adapter summary) `
    + `to data/search-corpus/ (${(gzipBytes / 1024).toFixed(1)} KB gzipped, hash ${hash}).`,
  );
}

main().catch((err) => {
  console.error('build-search-corpus: failed', err);
  process.exit(1);
});
