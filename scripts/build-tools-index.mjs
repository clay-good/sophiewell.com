#!/usr/bin/env node
// spec-v757: the catalog page at /tools/.
//
// The home page takes a question and does not offer a menu, which is right for
// the reader who knows what they need. It is not right for the one who does
// not: search only works if you can name the thing. Browsing answers a
// different question -- "what does this site even have?" -- and a catalog of
// 1564 with no way to see the catalog reads as a site hiding its inventory.
//
// So the escape hatch lives one click away in the footer, never on the path of
// the reader who types. It is also the internal-linking hub 1564 pre-rendered
// pages never had: until now /tools/<id>/ existed only in the sitemap and in
// whatever "Related tools" picked, and /tools/ itself was a 404.
//
// Grouped by the catalog's own specialty taxonomy rather than A-Z, because a
// flat list of 1564 names is not browsable -- the groups are what let a reader
// find the neighbourhood before the name. Every count is computed from
// UTILITIES at build time, so nothing here can drift the way a hand-typed
// count does.
//
// Output: `dist/tools/index.html`.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

import { tileName } from './lib/tile-name.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = join(ROOT, 'dist');
const SITE = 'https://sophiewell.com';

// The same visible specialty labels the app uses (app.js GROUP_LABELS), in the
// order they should read on the page: clinical work first, then the workflow
// and administrative groups.
const GROUP_LABELS = {
  E: 'Clinical Math & Conversions',
  G: 'Clinical Scoring & Risk',
  F: 'Medication & Infusion',
  O: 'High-Alert & Safety',
  N: 'Pediatrics & Neonatal',
  J: 'Immunization & Infectious Disease',
  I: 'EMS & Field Medicine',
  K: 'Reference Ranges',
  H: 'Workflow & Documentation',
  A: 'Billing & Coding',
  B: 'Billing & Reimbursement',
  P: 'Revenue Cycle & Utilization',
  C: 'Insurance & Patient Literacy',
  L: 'Insurance Glossary',
  M: 'State & Coverage Reference',
};

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

async function loadUtilities() {
  const src = await readFile(join(ROOT, 'app.js'), 'utf8');
  const arr = src.match(/const UTILITIES = \[([\s\S]*?)\n\];/);
  if (!arr) throw new Error('build-tools-index: could not find UTILITIES in app.js');
  const tiles = [];
  for (const line of arr[1].split('\n')) {
    const id = line.match(/id:\s*'([^']+)'/);
    // Via the shared reader, not `name: '([^']+)'` -- that stops at the escaped
    // quote inside `'CDAI (Crohn\'s Disease Activity Index)'`, and this page
    // listed two tiles as "CDAI (Crohn\" and "SES-CD (Crohn\". The other six
    // generators were fixed in 34053398; this one was missed, so the bug stayed
    // live on the page that lists every tool.
    const name = tileName(line);
    const group = line.match(/group:\s*'([^']+)'/);
    if (id && name && group) tiles.push({ id: id[1], name, group: group[1] });
  }
  if (tiles.length === 0) throw new Error('build-tools-index: zero tiles parsed.');
  return tiles;
}

function buildHtml(tiles) {
  const canonical = `${SITE}/tools/`;
  const byGroup = new Map();
  for (const t of tiles) {
    if (!byGroup.has(t.group)) byGroup.set(t.group, []);
    byGroup.get(t.group).push(t);
  }
  // Declared order first, then anything the label map does not name, so a new
  // group shows up on the page instead of vanishing from it.
  const order = [...Object.keys(GROUP_LABELS).filter((g) => byGroup.has(g)),
    ...[...byGroup.keys()].filter((g) => !(g in GROUP_LABELS))].sort((a, b) => {
    const ai = Object.keys(GROUP_LABELS).indexOf(a);
    const bi = Object.keys(GROUP_LABELS).indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const sections = order.map((g) => {
    const rows = byGroup.get(g).slice().sort((a, b) => a.name.localeCompare(b.name));
    const label = GROUP_LABELS[g] || `Group ${g}`;
    const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `        <section class="ti-group" aria-labelledby="g-${slug}">
          <h2 id="g-${slug}">${esc(label)} <span class="ti-count">${rows.length}</span></h2>
          <ul class="ti-list">
${rows.map((t) => `            <li><a href="${SITE}/tools/${t.id}/">${esc(t.name)}</a></li>`).join('\n')}
          </ul>
        </section>`;
  }).join('\n');

  const jump = order.map((g) => {
    const label = GROUP_LABELS[g] || `Group ${g}`;
    const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `            <li><a href="#g-${slug}">${esc(label)}</a></li>`;
  }).join('\n');

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Sophie Well', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'All tools', item: canonical },
    ],
  };
  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'All Sophie Well calculators',
    description: `Every one of the ${tiles.length} calculators, scores, and clinical references on Sophie Well, grouped by specialty.`,
    url: canonical,
    isPartOf: { '@id': `${SITE}/#webapp` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: tiles.length,
      itemListElement: order.map((g, i) => ({
        '@type': 'ListItem', position: i + 1, name: GROUP_LABELS[g] || `Group ${g}`,
      })),
    },
  };

  return `<!doctype html>
<html lang="en-US">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="manifest" href="/site.webmanifest" />
    <meta name="referrer" content="no-referrer" />
    <meta name="color-scheme" content="dark light" />
    <title>All ${tiles.length} Calculators - Every Tool on Sophie Well · Sophie Well</title>
    <meta name="description" content="Every one of the ${tiles.length} free healthcare calculators, scores, and clinical references on Sophie Well, grouped by specialty. No signup, no tracking." />
    <meta name="author" content="Clay Good" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
    <link rel="canonical" href="${canonical}" />
    <link rel="stylesheet" href="/styles.css" />
    <script src="/theme.js"></script>
    <script type="application/ld+json">
${JSON.stringify(breadcrumb, null, 2)}
    </script>
    <script type="application/ld+json">
${JSON.stringify(collectionLd, null, 2)}
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
      <main id="main" class="tools-index">
        <nav class="tp-breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">All tools</span>
        </nav>

        <h1 class="ti-h1">All ${tiles.length} tools</h1>
        <p class="ti-lede">
          Every calculator, score, and reference on Sophie Well, grouped by
          specialty. If you already know what you need, asking is faster.
        </p>
        <p class="ti-cta"><a class="ti-ask" href="/">Ask for it instead &rarr;</a></p>

        <nav class="ti-jump" aria-label="Jump to a specialty">
          <ul>
${jump}
          </ul>
        </nav>

${sections}

        <p class="tp-author muted">Built by <a href="https://claygood.com" rel="noopener" target="_blank">Clay Good</a>. Source on <a href="https://github.com/clay-good/sophiewell.com" rel="noopener" target="_blank">GitHub</a>.</p>
      </main>
    </div>
  </body>
</html>
`;
}

async function main() {
  if (!existsSync(DIST)) {
    console.error('build-tools-index: dist/ does not exist. Run after the main build copies static assets.');
    process.exit(1);
  }
  const tiles = await loadUtilities();
  const dir = join(DIST, 'tools');
  await mkdir(dir, { recursive: true });
  const html = buildHtml(tiles);
  await writeFile(join(dir, 'index.html'), html, 'utf8');
  console.log(`build-tools-index: wrote /tools/ listing ${tiles.length} tiles (${(html.length / 1024).toFixed(0)} KB).`);
}

main().catch((err) => { console.error('build-tools-index: failed', err); process.exit(1); });
