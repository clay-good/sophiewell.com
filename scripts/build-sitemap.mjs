#!/usr/bin/env node
// spec-seo §8.1: the sitemap now enumerates the pre-rendered tool
// pages at `/tools/<id>/` that `scripts/build-tool-pages.mjs` writes
// into `dist/`. Each tool is its own canonical URL, with a real <h1>,
// per-tool schema, and SEO-shaped <title>/<description>. The prior
// `#hash` URLs collapsed to one indexable URL because search engines
// strip fragments before indexing.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const SITE = 'https://sophiewell.com';

const appSource = await readFile(resolve(ROOT, 'app.js'), 'utf8');
const arrMatch = appSource.match(/const UTILITIES = \[([\s\S]*?)\n\];/);
if (!arrMatch) {
  console.error('build-sitemap: could not find UTILITIES array in app.js');
  process.exit(1);
}

const ids = [];
for (const line of arrMatch[1].split('\n')) {
  const m = line.match(/id:\s*'([^']+)'/);
  if (m) ids.push(m[1]);
}
if (ids.length === 0) {
  console.error('build-sitemap: zero ids parsed  -  refusing to overwrite.');
  process.exit(1);
}

// spec-seo §10: five audience hubs at /for/<slug>/. Kept in sync with
// the HUBS map in scripts/build-hub-pages.mjs. Listed here (rather than
// re-parsed) so the sitemap does not depend on the hub script having
// run first.
const HUB_SLUGS = ['patients', 'billers', 'clinicians', 'ems', 'educators'];

const today = new Date().toISOString().slice(0, 10);
const urls = [
  `  <url><loc>${SITE}/</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
  ...HUB_SLUGS.map((slug) =>
    `  <url><loc>${SITE}/for/${slug}/</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>`
  ),
  ...ids.map((id) =>
    `  <url><loc>${SITE}/tools/${id}/</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`
  ),
];
const tileCount = ids.length;

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

await writeFile(resolve(ROOT, 'sitemap.xml'), xml);
console.log(`build-sitemap: wrote ${urls.length} URL${urls.length === 1 ? '' : 's'} to sitemap.xml (sanity-checked ${tileCount} tiles).`);
