#!/usr/bin/env node
// spec-v46: catalog-truth check.
//
// `UTILITIES.length` in app.js is the single source of truth for the catalog
// count. This script extracts that count by static parse and asserts that
// every in-scope user-facing surface names the same number.
//
// Surfaces enumerated in docs/spec-v46.md §4. A drift on any of them fails CI
// with a per-surface diff message.

import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = process.cwd();

// spec-v29: the ids the v29 prune removed from the catalog, parsed from the
// `REMOVED_V29_IDS` map in app.js. Used to assert no per-tile copy lingers for
// a removed tile. Each removed group is authored as `...[ 'id', 'id', … ]
// .map((id) => [id, '<tombstone message>'])`; we read ids only from the array
// literals, never the message strings.
function parseRemovedV29Ids(appJsText) {
  const start = appJsText.indexOf('const REMOVED_V29_IDS = new Map([');
  if (start === -1) throw new Error('catalog-truth: cannot locate REMOVED_V29_IDS in app.js');
  const end = appJsText.indexOf(']);', start);
  if (end === -1) throw new Error('catalog-truth: cannot locate end of REMOVED_V29_IDS');
  const block = appJsText.slice(start, end);
  const ids = new Set();
  for (const seg of block.matchAll(/\.\.\.\[([\s\S]*?)\]\.map\(/g)) {
    for (const m of seg[1].matchAll(/'([a-z0-9-]+)'/g)) ids.add(m[1]);
  }
  return ids;
}

function countUtilities(appJsText) {
  const start = appJsText.indexOf('const UTILITIES = [');
  if (start === -1) throw new Error('catalog-truth: cannot locate `const UTILITIES = [` in app.js');
  // Walk character-by-character to find the matching closing `];` for the array.
  let depth = 0;
  let i = appJsText.indexOf('[', start);
  let end = -1;
  for (; i < appJsText.length; i += 1) {
    const ch = appJsText[i];
    if (ch === '[') depth += 1;
    else if (ch === ']') {
      depth -= 1;
      if (depth === 0) { end = i; break; }
    }
  }
  if (end === -1) throw new Error('catalog-truth: cannot locate end of UTILITIES array');
  const body = appJsText.slice(start, end);
  // Top-level entries are lines starting with `  { id: '...'`. The array is
  // a flat list with no nested objects at depth 1 carrying an `id:` key, so
  // counting these is unambiguous.
  const matches = body.match(/^\s{2}\{ id: '[^']+',/gm);
  if (!matches) throw new Error('catalog-truth: zero UTILITIES entries matched; regex stale?');
  return matches.length;
}

// Each surface: { name, file, extract: (text) => number | null }
function makeSurfaces() {
  return [
    {
      name: '<title>',
      file: 'index.html',
      extract: (t) => firstCapture(t, /<title>[^<]*?-\s*(\d{2,4})\s*Tools/i),
    },
    {
      name: 'meta description',
      file: 'index.html',
      extract: (t) => firstCapture(t, /<meta name="description"[^>]*content="[^"]*?(\d{2,4})\s*calculators/i),
    },
    {
      name: 'OG title',
      file: 'index.html',
      extract: (t) => firstCapture(t, /<meta property="og:title"[^>]*content="[^"]*?-\s*(\d{2,4})\s*Tools/i),
    },
    {
      name: 'OG description',
      file: 'index.html',
      extract: (t) => firstCapture(t, /<meta property="og:description"[^>]*content="[^"]*?(\d{2,4})\s*calculators/i),
    },
    {
      name: 'OG image alt',
      file: 'index.html',
      extract: (t) => firstCapture(t, /<meta property="og:image:alt"[^>]*content="[^"]*?(\d{2,4})\s*free healthcare tools/i),
    },
    {
      name: 'Twitter title',
      file: 'index.html',
      extract: (t) => firstCapture(t, /<meta property="twitter:title"[^>]*content="[^"]*?-\s*(\d{2,4})\s*Tools/i),
    },
    {
      name: 'Twitter description',
      file: 'index.html',
      extract: (t) => firstCapture(t, /<meta property="twitter:description"[^>]*content="[^"]*?(\d{2,4})\s*calculators/i),
    },
    {
      name: 'Twitter image alt',
      file: 'index.html',
      extract: (t) => firstCapture(t, /<meta property="twitter:image:alt"[^>]*content="[^"]*?(\d{2,4})\s*free healthcare tools/i),
    },
    // spec-v52 (post-52-6c): the home lede was rewritten to a count-free
    // SEO elevator pitch ("Private healthcare calculators, built for the
    // bedside..."). The catalog count is no longer carried in the visible
    // tagline; it remains enforced on the 12 surfaces below (title, meta /
    // OG / Twitter description + image-alt, JSON-LD, README, package.json,
    // parity ledger).
    // spec-v51: #browse-tile-count surface retired with the homepage
    // tile-grid. 2026-07-04: the hero search label went count-free too
    // ("What do you need to figure out?"), so its surface is retired the
    // same way; the count stays enforced on the surfaces above and below.
    {
      name: 'JSON-LD description',
      file: 'index.html',
      extract: (t) => firstCapture(t, /"description":\s*"[^"]*?(\d{2,4})\s+deterministic\s+utilities/i),
    },
    {
      name: 'README first-section blurb',
      file: 'README.md',
      extract: (t) => firstCapture(t, /At v\d+ close the catalog is\s+(\d{2,4})\s*\n?\s*deterministic\s+tiles/i),
    },
    {
      name: 'package.json description',
      file: 'package.json',
      extract: (t) => firstCapture(t, /"description":\s*"[^"]*?-\s*(\d{2,4})\s+deterministic\s+healthcare\s+calculators/i),
    },
    {
      name: 'scope-mdcalc-parity close-line',
      file: 'docs/scope-mdcalc-parity.md',
      // The most recent vN close-count line in the ledger. The ledger is a
      // running narrative; the final "is N." in the parenthesized history is
      // the current close count.
      extract: (t) => lastCapture(t, /\bis\s+(\d{2,4})\.\)/g),
    },
  ];
}

function firstCapture(text, re) {
  const m = text.match(re);
  return m ? Number(m[1]) : null;
}

function lastCapture(text, re) {
  let last = null;
  let m;
  while ((m = re.exec(text)) !== null) last = Number(m[1]);
  return last;
}

// spec-v52 §3.4 + §8.2: at v52-1b close exactly one tile carries the new
// `shape: 'document-linter'` field. The remaining 254 tiles default to
// `shape: 'numeric'` and have no explicit `shape:` field; counting the
// explicit `shape: 'document-linter'` occurrences in the UTILITIES body
// is sufficient. Raise the expected count as additional document-linter
// tiles are registered.
function countDocumentLinterTiles(appJsText) {
  const start = appJsText.indexOf('const UTILITIES = [');
  if (start === -1) return 0;
  let depth = 0;
  let i = appJsText.indexOf('[', start);
  let end = -1;
  for (; i < appJsText.length; i += 1) {
    const ch = appJsText[i];
    if (ch === '[') depth += 1;
    else if (ch === ']') {
      depth -= 1;
      if (depth === 0) { end = i; break; }
    }
  }
  if (end === -1) return 0;
  const body = appJsText.slice(start, end);
  const matches = body.match(/shape:\s*'document-linter'/g);
  return matches ? matches.length : 0;
}

async function main() {
  const appJs = await readFile(join(ROOT, 'app.js'), 'utf8');
  const truth = countUtilities(appJs);

  const surfaces = makeSurfaces();
  const cache = new Map();
  const diffs = [];
  for (const s of surfaces) {
    if (!cache.has(s.file)) cache.set(s.file, await readFile(join(ROOT, s.file), 'utf8'));
    const text = cache.get(s.file);
    const found = s.extract(text);
    if (found === null) {
      diffs.push(`  ${s.file}  ${s.name}  could not locate a count (regex did not match)`);
      continue;
    }
    if (found !== truth) {
      diffs.push(`  ${s.file}  ${s.name}  expected ${truth} (UTILITIES.length), found ${found}`);
    }
  }

  if (diffs.length > 0) {
    console.error('check-catalog-truth: drift detected.');
    for (const d of diffs) console.error(d);
    process.exit(1);
  }

  // spec-v52 §3.4 + §8.2: shape-aware invariant. v52-1b registers
  // exactly one `shape: 'document-linter'` tile (pa-lint). Lift this
  // floor when additional document-linter tiles ship.
  const docLinters = countDocumentLinterTiles(appJs);
  if (docLinters !== 1) {
    console.error(`check-catalog-truth: expected exactly 1 tile with shape: 'document-linter' (spec-v52 §3.4), found ${docLinters}.`);
    process.exit(1);
  }

  // spec-v29 housekeeping invariant: no per-tile copy may linger for a tile the
  // v29 prune removed. `data/tool-copy/<id>.json` for a REMOVED_V29_IDS id is
  // dead data the build silently skips; fail so it cannot accumulate again
  // (it had drifted to 57 such files before this guard).
  const removed = parseRemovedV29Ids(appJs);
  const copyDir = join(ROOT, 'data', 'tool-copy');
  const copyIds = (await readdir(copyDir))
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''));
  const deadCopy = copyIds.filter((id) => removed.has(id)).sort();
  if (deadCopy.length > 0) {
    console.error(`check-catalog-truth: ${deadCopy.length} data/tool-copy/*.json file(s) belong to spec-v29-removed tiles (dead data; build skips them). Delete: ${deadCopy.join(', ')}`);
    process.exit(1);
  }

  console.log(`check-catalog-truth: clean (${truth} tiles across ${surfaces.length} surfaces, ${docLinters} document-linter, ${removed.size} v29-removed ids guarded, 0 orphan copy)`);
}

main().catch((err) => {
  console.error('check-catalog-truth: error', err);
  process.exit(2);
});
