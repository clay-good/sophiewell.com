#!/usr/bin/env node
// Copies the static site to dist/ for Cloudflare Pages deployment.
// Stamps sw.js BUILD_HASH with the current commit-ish (or fetchDate fallback).

import { copyFile, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { withInlineHashes } from './csp.mjs';

const ROOT = resolve(fileURLToPath(import.meta.url), '..', '..');
const DIST = join(ROOT, 'dist');

const COPY_FILES = [
  'index.html', 'styles.css', 'app.js', 'report-feedback.js', 'report-policy.js', 'sw.js', 'theme.js', 'file-origin-guard.js',
  '_headers', 'robots.txt', 'sitemap.xml', 'site.webmanifest',
  'CHANGELOG.md', 'sbom.json', 'sbom.md',
];
const COPY_DIRS = ['lib', 'views', 'data', 'docs', 'vendored'];

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
  // spec-v753: build-field-index writes data/fields/, which the copy step below
  // picks up with the rest of data/. It runs before build-sbom so the shards are
  // on disk when the bill of materials counts source files.
  // spec-v990: `build-favicons.mjs` is NOT in this list. It writes the five
  // icon files back into the repo root, and its output bytes depend on which
  // image backend is present -- `sharp`, which reaches us only as a transitive
  // dependency of miniflare inside wrangler, or the macOS `sips` fallback. So
  // running the documented build dirtied five tracked files, and the icons the
  // site deployed were never the icons committed here. The icons are committed
  // artifacts now; regenerate them deliberately with `npm run favicons` when
  // logo.png changes.
  for (const script of ['build-search-corpus.mjs', 'build-field-index.mjs', 'build-report-catalog.mjs', 'build-ld.mjs', 'build-sitemap.mjs', 'build-sbom.mjs']) {
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
  // Copy the committed favicon set. spec-v990: these are required, not
  // optional. They used to be generated a few lines above, so "if present"
  // could never fail; now that they are checked-in artifacts, a missing one
  // means the site deploys with no icon and should stop the build instead.
  for (const f of ['favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png', 'apple-touch-icon.png', 'logo.png']) {
    const src = join(ROOT, f);
    if (!existsSync(src)) {
      throw new Error(`build: ${f} is missing. It is a committed artifact -- run \`npm run favicons\` to regenerate the set from logo.png.`);
    }
    await copyFile(src, join(DIST, f));
  }

  // Inject sha256 hashes for the inline <script> blocks in the built
  // index.html into dist/_headers so the strict CSP (script-src 'self')
  // still permits them without falling back to 'unsafe-inline'.
  const distIndex = await readFile(join(DIST, 'index.html'), 'utf8');
  const headersPath = join(DIST, '_headers');
  const headersText = await readFile(headersPath, 'utf8');
  const patchedHeaders = headersText.replace(
    /^(\s*Content-Security-Policy:\s*)(.+)$/m,
    (_, prefix, csp) => prefix + withInlineHashes(csp, distIndex),
  );
  await writeFile(headersPath, patchedHeaders, 'utf8');

  // spec-seo §5: pre-render one HTML page per tile at dist/tools/<id>/
  // after the static assets are copied so /tools/<id>/index.html can
  // reference /styles.css and /theme.js at the deployed root. Runs
  // here rather than in regenerate() because it writes into dist/.
  // spec-seo §10: build-hub-pages.mjs writes five audience hubs at
  // dist/for/<slug>/, each pointing into the per-tool pages above.
  // build-topic-pages.mjs writes topical landing pages at
  // dist/topics/<slug>/ that cut across the home view's groups.
  const { spawnSync } = await import('node:child_process');
  // spec-seo §6.3: build-og-images.mjs writes 1200x630 PNG OG cards
  // into dist/og/ so per-tool / hub / topic link previews stop
  // letterboxing the square logo.png on wide-card consumers.
  // check-page-copy.mjs runs last of the page builders: it reads the pages a
  // reader gets, which is the only place a defect made by correct source text
  // meeting a template can be seen. Every source-reading gate in `npm run lint`
  // was clean while a 663-character lede and 23 example-less pages were live.
  for (const script of ['build-tool-pages.mjs', 'build-tools-index.mjs', 'build-hub-pages.mjs', 'build-topic-pages.mjs', 'build-commitments-page.mjs', 'build-og-images.mjs', 'check-page-copy.mjs']) {
    const r = spawnSync(process.execPath, [join(ROOT, 'scripts', script)], { stdio: 'inherit' });
    if (r.status !== 0) throw new Error(`${script} exited with status ${r.status}`);
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
