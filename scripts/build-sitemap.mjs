#!/usr/bin/env node
// spec-seo §8.1 / §3 (audit point 4): the prior implementation emitted
// one `https://sophiewell.com/#<tool-id>` URL per tile. Every search
// engine strips the `#fragment` before indexing, so all 178 of those
// URLs collapsed to a single indexable URL (`/`) and Google Search
// Console reported them as "Duplicate without user-selected canonical."
//
// Until the spec-seo Phase 2 pre-rendered tool pages land at
// `/tools/<id>/`, the sitemap stays minimal: the root only. When
// Phase 2 lands, this script regrows to enumerate the new pre-rendered
// paths instead.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const SITE = 'https://sophiewell.com';

// Sanity check: keep the UTILITIES parse so the build still fails loudly
// if app.js drifts away from a recognizable tile array. We don't emit
// the per-tile URLs, but a zero-tile parse is a strong signal something
// upstream broke.
const appSource = await readFile(resolve(ROOT, 'app.js'), 'utf8');
const arrMatch = appSource.match(/const UTILITIES = \[([\s\S]*?)\n\];/);
if (!arrMatch) {
  console.error('build-sitemap: could not find UTILITIES array in app.js');
  process.exit(1);
}
const tileCount = arrMatch[1].split('\n').filter((l) => /id:\s*'[^']+'/.test(l)).length;
if (tileCount === 0) {
  console.error('build-sitemap: zero tile ids parsed  -  refusing to overwrite.');
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const urls = [
  `  <url><loc>${SITE}/</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

await writeFile(resolve(ROOT, 'sitemap.xml'), xml);
console.log(`build-sitemap: wrote ${urls.length} URL${urls.length === 1 ? '' : 's'} to sitemap.xml (sanity-checked ${tileCount} tiles).`);
