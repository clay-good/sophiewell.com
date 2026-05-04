#!/usr/bin/env node
// Regenerate sitemap.xml from the UTILITIES list in app.js. Mirrors
// encryptalotta/scripts/build-sitemap.js: emits the root URL plus one
// fragment URL per tool. Run as `node scripts/build-sitemap.mjs`.

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

const today = new Date().toISOString().slice(0, 10);
const urls = [
  `  <url><loc>${SITE}/</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
  ...ids.map((id) => `  <url><loc>${SITE}/#${id}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

await writeFile(resolve(ROOT, 'sitemap.xml'), xml);
console.log(`build-sitemap: wrote ${urls.length} URLs to sitemap.xml`);
