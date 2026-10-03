#!/usr/bin/env node
// scripts/build-precache.mjs -- spec-v1541 §1: the offline pack.
//
// Writes dist/precache-manifest.json: every file the app can run, so that one
// complete install is enough to use every tool without a connection. The list
// is walked from the code, not kept by hand: the shell below, then every module
// reachable from it by a static `import`, a literal `import()`, or a
// `new URL('...', import.meta.url)` (how the views start their workers), then
// the search corpus, the search-prefill field shards and the tool copy.
//
// Each entry carries a content hash, so an update fetches only the entries that
// changed. The pack version is a hash of what the app runs -- the entries plus
// every other file under lib/, views/, data/, vendored/ and samples/ (which a
// tool can still fetch lazily) -- and never the commit. A commit that changes
// only docs, tests, scripts or a prerendered page leaves it unchanged, so a
// phone does not download anything for it.
//
// The version is stamped into dist/sw.js as PACK. The browser compares sw.js
// byte for byte when it checks for an update, so an unchanged pack means the
// check ends there.

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, posix, relative, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// The application shell: every local file index.html loads. Guarded in both
// directions by test/unit/sw-shell.test.js (spec-v75, spec-v84).
export const SHELL_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './theme.js',
  './file-origin-guard.js',
  './lib/upload-worker.js',
  './lib/rx-match-worker.js',
  './lib/x12-835-worker.js',
  './lib/remittance-analysis-worker.js',
  './lib/intake-worker.js',
  './favicon.ico',
  './favicon-32x32.png',
  './favicon-16x16.png',
  './apple-touch-icon.png',
  './site.webmanifest',
  './logo.png',
];

// Data the app reads with no tool open (search) or for any tool (prefill, copy).
const DATA_DIRS = ['data/search-corpus', 'data/fields', 'data/tool-copy'];
const DATA_FILES = ['data/synonyms.json'];

// Read by the version hash without being precached; a tool may fetch them.
const LAZY_DIRS = ['lib', 'views', 'data', 'vendored', 'samples'];

// Written per commit (the receipts' "built from" line). Precached, but kept out
// of the version: the code it describes is byte-identical across such commits.
const PER_COMMIT = new Set(['lib/build-info.js']);

const IMPORT_RES = [
  /\bimport\s+(?:[\w*{}\s,$]+?\s+from\s+)?['"]([^'"]+)['"]/g,
  /\bexport\s+(?:\*|\{[^}]*\})(?:\s+as\s+\w+)?\s+from\s+['"]([^'"]+)['"]/g,
  /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g,
  /new URL\(\s*['"]([^'"]+)['"]\s*,\s*import\.meta\.url\s*\)/g,
];

function* files(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* files(p);
    else yield p;
  }
}

const rel = (base, p) => relative(base, p).split(sep).join('/');

// moduleGraph(base, starts) -> sorted repo-relative paths of every .js reachable from starts.
export function moduleGraph(base, starts) {
  const seen = new Set();
  const queue = [...starts];
  while (queue.length) {
    const f = queue.pop();
    if (seen.has(f)) continue;
    const abs = join(base, f);
    if (!existsSync(abs)) throw new Error(`build-precache: ${f} is imported but not in ${base}`);
    seen.add(f);
    if (!f.endsWith('.js')) continue;
    const src = readFileSync(abs, 'utf8');
    for (const re of IMPORT_RES) {
      for (const m of src.matchAll(re)) {
        const spec = m[1];
        if (!spec.startsWith('.')) continue;
        queue.push(posix.normalize(posix.join(posix.dirname(f), spec)));
      }
    }
  }
  return [...seen].sort();
}

const sha = (buf) => createHash('sha256').update(buf).digest('hex');

// precacheManifest(base) -> { version, date, entries: [{ url, hash }] }, read from a built dist/.
export function precacheManifest(base, date = packDate()) {
  const shell = SHELL_ASSETS.filter((u) => u !== './').map((u) => u.slice(2));
  const modules = moduleGraph(base, shell.filter((f) => f.endsWith('.js')));
  const data = [
    ...DATA_FILES,
    ...DATA_DIRS.flatMap((d) => [...files(join(base, d))].map((p) => rel(base, p))),
  ];
  const paths = [...new Set([...shell, ...modules, ...data])].sort();
  const entries = [{ url: './', hash: sha(readFileSync(join(base, 'index.html'))).slice(0, 16) }]
    .concat(paths.map((p) => ({ url: `./${p}`, hash: sha(readFileSync(join(base, p))).slice(0, 16) })));
  const inPack = new Set(paths);
  const v = createHash('sha256');
  for (const e of entries) if (!PER_COMMIT.has(e.url.slice(2))) v.update(`${e.url} ${e.hash}\n`);
  for (const d of LAZY_DIRS) {
    if (!existsSync(join(base, d))) continue;
    for (const p of [...files(join(base, d))].map((x) => rel(base, x)).sort()) {
      if (inPack.has(p) || PER_COMMIT.has(p)) continue;
      v.update(`${p} ${sha(readFileSync(join(base, p)))}\n`);
    }
  }
  return { version: v.digest('hex').slice(0, 16), date, entries };
}

// The pack's date: the last commit that touched what the pack is built from, so
// two builds of the same pack print the same date. A shallow or absent history
// falls back to today.
function packDate() {
  const r = spawnSync('git', ['log', '-1', '--format=%cs', '--', 'index.html', 'styles.css', 'app.js', 'theme.js', 'file-origin-guard.js', ...LAZY_DIRS], { cwd: ROOT, encoding: 'utf8' });
  const d = r.status === 0 ? r.stdout.trim() : '';
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : new Date().toISOString().slice(0, 10);
}

function main() {
  const dist = join(ROOT, 'dist');
  const m = precacheManifest(dist);
  writeFileSync(join(dist, 'precache-manifest.json'), JSON.stringify(m) + '\n');
  const swPath = join(dist, 'sw.js');
  const sw = readFileSync(swPath, 'utf8');
  if (!/const PACK = '[^']*';/.test(sw)) throw new Error('build-precache: sw.js has no PACK constant to stamp');
  writeFileSync(swPath, sw.replace(/const PACK = '[^']*';/, `const PACK = '${m.version}';`));
  const bytes = m.entries.reduce((n, e) => n + (e.url === './' ? 0 : statSync(join(dist, e.url.slice(2))).size), 0);
  console.log(`build-precache: ${m.entries.length} entries, ${(bytes / 1048576).toFixed(1)} MB, pack ${m.version} of ${m.date}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) main();
