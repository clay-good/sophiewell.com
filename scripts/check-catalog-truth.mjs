#!/usr/bin/env node
// spec-v46: catalog-truth check.
//
// `UTILITIES.length` in app.js is the single source of truth for the catalog
// count. This script extracts that count by static parse and asserts that
// every in-scope user-facing surface names the same number.
//
// Surfaces enumerated in docs/spec-v46.md §4. A drift on any of them fails CI
// with a per-surface diff message.

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = process.cwd();

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
    {
      name: 'home lede',
      file: 'index.html',
      extract: (t) => firstCapture(t, /<p class="home-lede">\s*(\d{2,4})\s+deterministic\s+calculators/i),
    },
    // spec-v51: #browse-tile-count surface retired with the homepage
    // tile-grid; the count now lives in the search-input label
    // ("Search NNN tools") and the existing surfaces (lede, JSON-LD,
    // <title>, OG/Twitter, README, package.json, parity ledger).
    {
      name: 'hero search label',
      file: 'index.html',
      extract: (t) => firstCapture(t, /<label[^>]*for="hero-search"[^>]*>Search\s+(\d{2,4})\s+tools<\/label>/i),
    },
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
  console.log(`check-catalog-truth: clean (${truth} tiles across ${surfaces.length} surfaces)`);
}

main().catch((err) => {
  console.error('check-catalog-truth: error', err);
  process.exit(2);
});
