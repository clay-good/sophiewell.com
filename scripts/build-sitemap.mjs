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

// spec-seo §10: topic clusters at /topics/<slug>/. Mirrors the keys of
// the TOPICS map in scripts/build-topic-pages.mjs. Listed here (rather
// than re-parsed) so the sitemap does not depend on the topic script
// having run first.
const TOPIC_SLUGS = [
  'cardiology', 'medication-safety', 'triage', 'nephrology',
  'obstetrics-pediatrics', 'behavioral-health', 'billing-and-coding',
  'patient-literacy',
];

// spec-v1030: there is no date in this file any more.
//
// Every URL used to carry `<lastmod>` stamped from `new Date()`. That made the
// build non-idempotent across a UTC date boundary: spec-v1028 was committed on
// the 3rd, its CI build ran at 00:09 on the 4th, and the "build must be
// idempotent" job failed on 1,700 changed lines with nothing wrong in the
// change. It is the rule spec-v993 wrote down for the corpus manifest's
// gzipBytes -- never diff a value the environment stamps -- reaching a second
// file.
//
// The date could not simply be pinned to a commit either: any git-derived date
// is one commit behind at build time and current when CI rebuilds the commit
// that carries it, which is the same failure with extra machinery.
//
// So it is gone. A `lastmod` of "today" on all 1,704 URLs on every build was
// never true anyway -- it told crawlers the entire catalog changed daily, which
// is why sitemaps with unreliable lastmod get discounted (docs/spec-seo.md
// already listed the undifferentiated stamp as a weakness). Without it the file
// changes when the URL SET changes, which is the only thing it actually knows.
const urls = [
  `  <url><loc>${SITE}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
  // spec-v51: /commitments/ is unlinked from the minimal homepage but
  // remains a real route. It must stay in the sitemap so crawlers find
  // the eight public-infrastructure commitments codified in spec-v50.
  `  <url><loc>${SITE}/commitments/</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>`,
  // spec-v757: the full catalog listing. Linked from the footer, and the only
  // internal hub that reaches every pre-rendered /tools/<id>/ page.
  `  <url><loc>${SITE}/tools/</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>`,
  `  <url><loc>${SITE}/topics/</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>`,
  ...HUB_SLUGS.map((slug) =>
    `  <url><loc>${SITE}/for/${slug}/</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>`
  ),
  ...TOPIC_SLUGS.map((slug) =>
    `  <url><loc>${SITE}/topics/${slug}/</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>`
  ),
  ...ids.map((id) =>
    `  <url><loc>${SITE}/tools/${id}/</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`
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
