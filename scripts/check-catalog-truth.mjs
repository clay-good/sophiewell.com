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
import { pathToFileURL } from 'node:url';
import { LABEL_FILES, parseGroupLabels, findLabelDrift } from './lib/group-labels.mjs';

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

// parseUtilityIds(appJsText) -> [id]. The same walk as countUtilities, but
// returning the ids rather than counting them, so a check can ask "does a live
// tile own this file?" instead of the narrower "was this id pruned at v29?".
export function parseUtilityIds(appJsText) {
  const start = appJsText.indexOf('const UTILITIES = [');
  if (start === -1) throw new Error('catalog-truth: cannot locate `const UTILITIES = [` in app.js');
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
  return [...body.matchAll(/^\s{2}\{ id: '([^']+)',/gm)].map((m) => m[1]);
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
    // The home lede carries a visible count again ("Search N calculators..."),
    // so it is enforced rather than left to drift the way the README headline
    // did (it had reached 1145 against a catalog of 1564).
    // spec-v751: retired again. The home page takes a question now, and the
    // lede is one sentence about what you get back ("Type the question the way
    // you'd say it..."). A catalog size is a browse-era brag; it is not what a
    // nurse standing at a bedside needs to read first. The count stays enforced
    // on the surfaces above and below -- title, meta / OG / Twitter description
    // + image-alt, JSON-LD, README x2, package.json, parity ledger. Follow the
    // spec-v51 / spec-v52 rule if it ever comes back: a visible count and a
    // surface here, in the same change, or it will drift.
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
    // The README's *visible* headline count was previously unenforced and had
    // drifted to 1145 while the catalog reached 1564. It is the first number a
    // reader sees, so it is now a checked surface like every other.
    {
      name: 'README headline count',
      file: 'README.md',
      extract: (t) => firstCapture(t, /(\d{2,4})\s+free healthcare calculators/i),
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
  // spec-v992: this used to ask only whether the id was in REMOVED_V29_IDS,
  // which is one way a tile stops existing and not the common one. Four files
  // -- bsa_burn, qtc-suite, cincinnati, lights -- belonged to tiles retired
  // LATER, and the summary line below went on printing "0 orphan copy" with
  // all four on disk. The question is whether a live tile renders the file, so
  // ask that.
  const liveIds = new Set(parseUtilityIds(appJs));
  const deadCopy = copyIds.filter((id) => !liveIds.has(id)).sort();
  if (deadCopy.length > 0) {
    console.error(`check-catalog-truth: ${deadCopy.length} data/tool-copy/*.json file(s) belong to no live tile (dead data; the build skips them). Delete: ${deadCopy.join(', ')}`);
    process.exit(1);
  }

  // spec-v992: docs/data-sources.md states how many tiles have hand-authored
  // per-tile copy. It is not the catalog total, so it carries the
  // `catalog-truth:historical` escape that exempts it from the blunt
  // catalog-count rule in grep-check -- and that escape was the ONLY thing
  // holding it, so it read 122 against a live 124. An escape from one check is
  // not a licence to go unchecked; gate it here against the real number.
  const dataSources = await readFile(join(ROOT, 'docs', 'data-sources.md'), 'utf8');
  const statedCopy = Number((dataSources.match(/for the ([\d,]+) tiles that have bespoke pre-rendered copy/) || [])[1]?.replace(/,/g, ''));
  if (!Number.isFinite(statedCopy)) {
    console.error('check-catalog-truth: docs/data-sources.md no longer states how many tiles have hand-authored per-tile copy.');
    process.exit(1);
  }
  if (statedCopy !== copyIds.length) {
    console.error(`check-catalog-truth: docs/data-sources.md says ${statedCopy} tiles have hand-authored copy; data/tool-copy/ holds ${copyIds.length}.`);
    process.exit(1);
  }

  // The README shows one worked example, so a reader can see what a result
  // looks like before opening anything: "Wells PE total 4.5 (PE-likely group,
  // moderate probability)". It is the same string the tile computes and MCP
  // returns, and nothing kept the two in step -- change a band label and the
  // README would quietly go on quoting the old one. A count is not the only
  // number on a page that can drift.
  const readmeText = cache.get('README.md') || await readFile(join(ROOT, 'README.md'), 'utf8');
  const readmeExample = (readmeText.match(/`(Wells PE total[^`]*)`/) || [])[1] || '';
  const { META } = await import(pathToFileURL(join(ROOT, 'lib', 'meta.js')).href);
  const live = String(META['wells-pe']?.example?.expected || '').replace(/\.$/, '');
  if (!readmeExample) {
    console.error('check-catalog-truth: README no longer shows the Wells PE worked example.');
    process.exit(1);
  }
  if (readmeExample !== live) {
    console.error(`check-catalog-truth: README quotes "${readmeExample}" but wells-pe computes "${live}".`);
    process.exit(1);
  }

  // spec-v955: the README's second number. The catalog size above is gated on
  // twelve surfaces; the count of tiles that link straight through to their
  // source paper was not gated anywhere, and it went stale the same day it was
  // written -- spec-v949 wrote 1,592 and spec-v954 linked nine more tiles. It
  // is derived from META rather than from a build artifact, so it can be
  // checked without a dist/ on disk. Twelve tiles link a PubMed search rather
  // than the paper (spec-v943), and the sentence counts them separately.
  const readmeLinked = Number((readmeText.match(/([\d,]+) of the [\d,]+ link straight through to the source paper/) || [])[1]?.replace(/,/g, ''));
  const readmeSearch = /Twelve more say "Search PubMed for this source"/.test(readmeText);
  const searchUrl = (u) => { try { return ['term', 'q', 'query', 'search'].some((k) => new URL(u).searchParams.has(k)); } catch { return false; } };
  let straightThrough = 0;
  let searchLinks = 0;
  for (const m of Object.values(META)) {
    const url = m.citationUrl;
    if (Array.isArray(m.citationUrls) && m.citationUrls.length) straightThrough += 1;
    else if (url) { if (searchUrl(url)) searchLinks += 1; else straightThrough += 1; }
  }
  if (!Number.isFinite(readmeLinked)) {
    console.error('check-catalog-truth: README no longer states how many tiles link straight through to their source.');
    process.exit(1);
  }
  if (readmeLinked !== straightThrough) {
    console.error(`check-catalog-truth: README says ${readmeLinked} tiles link straight through to the source paper; META has ${straightThrough}.`);
    process.exit(1);
  }
  if (searchLinks !== 12 || !readmeSearch) {
    console.error(`check-catalog-truth: README says twelve tiles link a PubMed search; META has ${searchLinks}.`);
    process.exit(1);
  }

  // spec-v953: the visible group name is declared five times -- once in app.js and once in each
  // builder that renders it onto a pre-rendered page, plus the audit report. Nothing held them
  // in step, and audit-coverage had already lost group B. Same rule as the counts above: a
  // visible surface with more than one copy drifts unless something checks it.
  const labelFiles = [];
  for (const path of LABEL_FILES) {
    const text = cache.get(path) || await readFile(join(ROOT, path), 'utf8');
    labelFiles.push({ path, labels: parseGroupLabels(text) });
  }
  const labelDrift = findLabelDrift(labelFiles);
  if (labelDrift.length) {
    console.error('check-catalog-truth: the visible group labels have drifted between copies:');
    for (const d of labelDrift) console.error(`  ${d}`);
    process.exit(1);
  }

  console.log(`check-catalog-truth: clean (${truth} tiles across ${surfaces.length} surfaces, ${docLinters} document-linter, ${removed.size} v29-removed ids guarded, 0 orphan copy, ${copyIds.length} hand-authored copy files stated, README example matches, ${Object.keys(labelFiles[0].labels).length} group labels agree across ${labelFiles.length} files, README source-link count ${straightThrough} matches)`);
}

// spec-v992: only when run as a script. `parseUtilityIds` is imported by
// test/unit/catalog-count-rule.test.js, and a check that runs at import turns
// every importer into a second copy of the gate.
if (process.argv[1] && process.argv[1].endsWith('check-catalog-truth.mjs')) {
  main().catch((err) => {
    console.error('check-catalog-truth: error', err);
    process.exit(2);
  });
}
