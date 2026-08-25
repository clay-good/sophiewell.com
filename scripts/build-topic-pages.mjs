#!/usr/bin/env node
// spec-seo Phase 3 (§10): topic-cluster pages. Each topic groups tiles
// by clinical/workflow topic (not audience) and produces an indexable
// HTML landing page at `dist/topics/<slug>/index.html`. Topics
// complement the five audience hubs from build-hub-pages.mjs - the
// same tile can appear in multiple topics, and topics cut across the
// existing GROUP_LABELS structure (e.g. "cardiology" pulls from
// Clinical Scoring, Field Medicine, and Public Health groups).
//
// Topic -> tile-id mapping is curated here rather than derived from
// UTILITIES because tile groups are organizational, not topical.
//
// Tile links resolve to the Phase 2 pre-rendered /tools/<id>/ pages so
// internal-link equity flows to the canonical per-tool URLs.

import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { getCalculator } from '../mcp/catalog.js';
import { tileLine, ledeParts } from './lib/tile-line.mjs';
import { tileName } from './lib/tile-name.mjs';
import { TOPICS } from './lib/topics.mjs';

export { TOPICS };

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// The tile one-liner shown under each name in the list. The old source (the
// `tc-desc` spans in the retired homepage tile grid) is gone, so every entry
// had been rendering an empty <span>. Fall back to the first sentence of the
// MCP adapter summary, which is specific per tile.
// Hand-authored copy for tiles that have no MCP adapter (document generators,
// decision trees, time-dependent timers). Loaded once by main() and consulted
// ahead of the adapter summary, since it is written for a human reader.
const TOOL_COPY = new Map();
function loadToolCopy() {
  const dir = join(ROOT, 'data', 'tool-copy');
  if (!existsSync(dir)) return;
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.json')) continue;
    try {
      const json = JSON.parse(readFileSync(join(dir, file), 'utf8'));
      if (json?.whatThisIs) TOOL_COPY.set(file.replace(/\.json$/, ''), json.whatThisIs);
    } catch { /* a malformed copy file just falls through to the adapter summary */ }
  }
}

// The opening paragraph: first sentence visible, the rest one click away.
// See ledeParts() in scripts/lib/tile-line.mjs for why.
function ledeHtml(text) {
  const { lead, rest } = ledeParts(text);
  const more = rest
    ? `\n        <details class="hub-lede-more">
          <summary>More about this page</summary>
          <p>${esc(rest)}</p>
        </details>`
    : '';
  return `<p class="tp-lede">${esc(lead)}</p>${more}`;
}

function tileDesc(id, name = '') {
  let rec = null;
  try { rec = getCalculator(id); } catch { rec = null; }
  return tileLine(TOOL_COPY.get(id) || rec?.summary || '', { name });
}
const DIST = join(ROOT, 'dist');
const SITE = 'https://sophiewell.com';

async function loadUtilities() {
  const src = await readFile(join(ROOT, 'app.js'), 'utf8');
  const arr = src.match(/const UTILITIES = \[([\s\S]*?)\n\];/);
  if (!arr) throw new Error('build-topic-pages: could not find UTILITIES in app.js');
  const tiles = new Map();
  for (const line of arr[1].split('\n')) {
    const id = line.match(/id:\s*'([^']+)'/);
    const name = tileName(line);
    const group = line.match(/group:\s*'([^']+)'/);
    if (id && name && group) {
      tiles.set(id[1], { id: id[1], name, group: group[1] });
    }
  }
  if (tiles.size === 0) throw new Error('build-topic-pages: zero tiles parsed.');
  return tiles;
}

async function loadDescriptions() {
  const html = await readFile(join(ROOT, 'index.html'), 'utf8');
  const out = new Map();
  const rx = /data-tool="([^"]+)"[\s\S]*?<span class="tc-desc">([\s\S]*?)<\/span>/g;
  let m;
  while ((m = rx.exec(html))) {
    if (!out.has(m[1])) out.set(m[1], m[2].trim());
  }
  return out;
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildTopicHtml({ topic, tiles }) {
  const canonical = `${SITE}/topics/${topic.slug}/`;

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Sophie Well', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Topics', item: `${SITE}/topics/` },
      { '@type': 'ListItem', position: 3, name: topic.label, item: canonical },
    ],
  };

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: topic.h1,
    description: topic.description,
    url: canonical,
    inLanguage: 'en',
    isAccessibleForFree: true,
    isPartOf: { '@id': `${SITE}/#webapp` },
    publisher: { '@type': 'Organization', name: 'Sophie Well', url: SITE },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: tiles.length,
      itemListElement: tiles.map((t, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE}/tools/${t.id}/`,
        name: t.name,
      })),
    },
  };

  const tileList = tiles.map((t) => `            <li>
              <a href="${SITE}/tools/${t.id}/">
                <span class="hub-tile-name">${esc(t.name)}</span>
                <span class="hub-tile-desc">${esc(t.desc)}</span>
              </a>
            </li>`).join('\n');

  const otherTopics = Object.values(TOPICS)
    .filter((t) => t.slug !== topic.slug)
    .map((t) => `            <li><a href="${SITE}/topics/${t.slug}/">${esc(t.label)}</a></li>`)
    .join('\n');

  return `<!doctype html>
<html lang="en-US">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />

    <meta name="referrer" content="no-referrer" />
    <meta name="color-scheme" content="dark light" />

    <title>${esc(topic.title)}</title>
    <meta name="description" content="${esc(topic.description)}" />
    <meta name="author" content="Clay Good" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
    <link rel="canonical" href="${canonical}" />
    <link rel="author" href="https://claygood.com" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Sophie Well" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${esc(topic.title)}" />
    <meta property="og:description" content="${esc(topic.description)}" />
    <meta property="og:image" content="${SITE}/og/topics/${topic.slug}.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${esc(topic.title)}" />
    <meta property="og:locale" content="en_US" />
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="${canonical}" />
    <meta property="twitter:title" content="${esc(topic.title)}" />
    <meta property="twitter:description" content="${esc(topic.description)}" />
    <meta property="twitter:image" content="${SITE}/og/topics/${topic.slug}.png" />
    <meta property="twitter:image:alt" content="${esc(topic.title)}" />

    <script type="application/ld+json">
${JSON.stringify(collectionLd, null, 2)}
    </script>
    <script type="application/ld+json">
${JSON.stringify(breadcrumb, null, 2)}
    </script>

    <link rel="stylesheet" href="/styles.css" />
    <script src="/theme.js"></script>
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="topbar" role="banner">
      <a href="/" class="topbar-brand" aria-label="Sophie Well, home">
        <img src="/logo.png" alt="Sophie Well logo" width="32" height="32" />
        <span>Sophie Well</span>
      </a>
    </header>

    <div class="container">
      <main id="main" class="hub-page">
        <nav class="tp-breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span aria-hidden="true"> / </span>
          <span>Topics</span>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">${esc(topic.label)}</span>
        </nav>

        <h1 class="tp-h1">${esc(topic.h1)}</h1>
        ${ledeHtml(topic.lede)}
        <p class="hub-count muted">${tiles.length} tool${tiles.length === 1 ? '' : 's'} in this topic, all free, all in your browser.</p>

        <section class="hub-group" aria-labelledby="topic-tiles">
          <h2 id="topic-tiles" class="visually-hidden">Tools in this topic</h2>
          <ul class="hub-tile-list">
${tileList}
          </ul>
        </section>

        <nav class="hub-other" aria-label="Other topics">
          <h2>Other topics</h2>
          <ul>
${otherTopics}
          </ul>
        </nav>

        <p class="tp-author muted">Built by <a href="https://claygood.com" rel="noopener" target="_blank">Clay Good</a>. Source on <a href="https://github.com/clay-good/sophiewell.com" rel="noopener" target="_blank">GitHub</a>.</p>
      </main>
    </div>
  </body>
</html>
`;
}

function buildIndexHtml({ topics }) {
  const canonical = `${SITE}/topics/`;
  const items = Object.values(topics);

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Sophie Well', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Topics', item: canonical },
    ],
  };
  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Sophie Well topics',
    description: 'Browse Sophie Well by clinical and workflow topic.',
    url: canonical,
    isPartOf: { '@id': `${SITE}/#webapp` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((t, i) => ({
        '@type': 'ListItem', position: i + 1, name: t.label,
        url: `${SITE}/topics/${t.slug}/`,
      })),
    },
  };

  const list = items.map((t) => `            <li>
              <a href="${SITE}/topics/${t.slug}/">
                <span class="hub-tile-name">${esc(t.label)}</span>
                <span class="hub-tile-desc">${esc(t.description)}</span>
              </a>
            </li>`).join('\n');

  return `<!doctype html>
<html lang="en-US">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="manifest" href="/site.webmanifest" />
    <meta name="referrer" content="no-referrer" />
    <meta name="color-scheme" content="dark light" />
    <title>Healthcare Tools by Topic · Sophie Well</title>
    <meta name="description" content="Browse Sophie Well's free healthcare tools by topic: cardiology, nephrology, medication safety, triage, OB/peds, behavioral health, billing, literacy." />
    <meta name="author" content="Clay Good" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
    <link rel="canonical" href="${canonical}" />
    <link rel="stylesheet" href="/styles.css" />
    <script src="/theme.js"></script>
    <script type="application/ld+json">
${JSON.stringify(collectionLd, null, 2)}
    </script>
    <script type="application/ld+json">
${JSON.stringify(breadcrumb, null, 2)}
    </script>
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="topbar" role="banner">
      <a href="/" class="topbar-brand" aria-label="Sophie Well, home">
        <img src="/logo.png" alt="Sophie Well logo" width="32" height="32" />
        <span>Sophie Well</span>
      </a>
    </header>
    <div class="container">
      <main id="main" class="hub-page">
        <nav class="tp-breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">Topics</span>
        </nav>
        <h1 class="tp-h1">Browse Sophie Well by topic</h1>
        <p class="tp-lede">${items.length} clinical and workflow topics, cutting across the home view's organizational groups. Each topic page lists every tool that fits, with internal links to the canonical per-tool pages.</p>

        <section class="hub-group" aria-labelledby="topic-index-h">
          <h2 id="topic-index-h" class="visually-hidden">Topic index</h2>
          <ul class="hub-tile-list">
${list}
          </ul>
        </section>

        <p class="tp-author muted">Built by <a href="https://claygood.com" rel="noopener" target="_blank">Clay Good</a>. Source on <a href="https://github.com/clay-good/sophiewell.com" rel="noopener" target="_blank">GitHub</a>.</p>
      </main>
    </div>
  </body>
</html>
`;
}

async function main() {
  if (!existsSync(DIST)) {
    console.error('build-topic-pages: dist/ does not exist. Run after the main build copies static assets.');
    process.exit(1);
  }
  const topicsDir = join(DIST, 'topics');
  if (existsSync(topicsDir)) await rm(topicsDir, { recursive: true, force: true });
  await mkdir(topicsDir, { recursive: true });

  loadToolCopy();
  const [tileMap, descriptions] = await Promise.all([loadUtilities(), loadDescriptions()]);

  let written = 0;
  let totalLinks = 0;
  for (const key of Object.keys(TOPICS)) {
    const topic = TOPICS[key];
    const resolved = [];
    for (const id of topic.tiles) {
      const t = tileMap.get(id);
      if (!t) {
        console.warn(`build-topic-pages: topic "${topic.slug}" references unknown tile "${id}" - skipping.`);
        continue;
      }
      resolved.push({ ...t, desc: descriptions.get(id) || tileDesc(id, t.name) });
    }
    if (resolved.length === 0) {
      console.warn(`build-topic-pages: topic "${topic.slug}" has zero resolved tiles - skipping page.`);
      continue;
    }
    const html = buildTopicHtml({ topic, tiles: resolved });
    const out = join(topicsDir, topic.slug);
    await mkdir(out, { recursive: true });
    await writeFile(join(out, 'index.html'), html, 'utf8');
    written += 1;
    totalLinks += resolved.length;
  }

  await writeFile(join(topicsDir, 'index.html'), buildIndexHtml({ topics: TOPICS }), 'utf8');

  console.log(`build-topic-pages: wrote ${written} topic page${written === 1 ? '' : 's'} (${totalLinks} internal links) plus /topics/ index under dist/topics/.`);
}

main().catch((err) => { console.error('build-topic-pages: failed', err); process.exit(1); });
