#!/usr/bin/env node
// Copies the static site to dist/ for Cloudflare Pages deployment.
// Stamps sw.js BUILD_HASH with the current commit-ish (or fetchDate fallback).

import { copyFile, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const ROOT = resolve(fileURLToPath(import.meta.url), '..', '..');
const DIST = join(ROOT, 'dist');

const COPY_FILES = [
  'index.html', 'styles.css', 'app.js', 'sw.js',
  '_headers', 'robots.txt', 'sitemap.xml', 'site.webmanifest',
  'CHANGELOG.md', 'sbom.json', 'sbom.md',
];
const COPY_DIRS = ['lib', 'views', 'data', 'docs'];

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

async function ensureDir(p) { await mkdir(p, { recursive: true }); }

async function copyTree(src) {
  for await (const file of walk(src)) {
    const rel = relative(ROOT, file);
    const dest = join(DIST, rel);
    await ensureDir(dirname(dest));
    await copyFile(file, dest);
  }
}

async function buildHash() {
  // Hash a manifest of important file mtimes + contents for a stable build id.
  const h = createHash('sha256');
  for (const f of [...COPY_FILES, 'data/icd10cm/manifest.json']) {
    const p = join(ROOT, f);
    if (!existsSync(p)) continue;
    h.update(f);
    h.update(await readFile(p));
  }
  return h.digest('hex').slice(0, 12);
}

async function regenerate() {
  // Regenerate JSON-LD and sitemap from the live UTILITIES list before
  // copying static assets into dist/. Both scripts are idempotent.
  const { spawnSync } = await import('node:child_process');
  for (const script of ['build-favicons.mjs', 'build-ld.mjs', 'build-sitemap.mjs', 'build-sbom.mjs']) {
    const r = spawnSync(process.execPath, [join(ROOT, 'scripts', script)], { stdio: 'inherit' });
    if (r.status !== 0) throw new Error(`${script} exited with status ${r.status}`);
  }
}

async function main() {
  await regenerate();
  await ensureDir(DIST);
  for (const f of COPY_FILES) {
    if (!existsSync(join(ROOT, f))) continue;
    await copyFile(join(ROOT, f), join(DIST, f));
  }
  for (const d of COPY_DIRS) await copyTree(join(ROOT, d));
  // Copy favicon assets if present (created by build-favicons.mjs in v4.7).
  for (const f of ['favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png', 'apple-touch-icon.png', 'logo.png']) {
    const src = join(ROOT, f);
    if (existsSync(src)) await copyFile(src, join(DIST, f));
  }

  const hash = await buildHash();
  // Stamp BUILD_HASH in dist/sw.js.
  const swPath = join(DIST, 'sw.js');
  const sw = await readFile(swPath, 'utf8');
  const stamped = sw.replace(/const BUILD_HASH = '[^']*';/, `const BUILD_HASH = '${hash}';`);
  await writeFile(swPath, stamped, 'utf8');

  console.log(`build: dist/ ready (BUILD_HASH=${hash})`);
}

main().catch((err) => { console.error('build: failed', err); process.exit(1); });
