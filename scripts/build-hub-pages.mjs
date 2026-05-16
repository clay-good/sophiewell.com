#!/usr/bin/env node
// spec-seo Phase 3 (§10): audience hub pages. One indexable HTML page
// per audience at `dist/for/<audience>/index.html`, listing every
// Sophie Well tile whose UTILITIES audience tag matches, grouped by
// the same group labels the home view uses.
//
// Five hubs (patients, billers, clinicians, field, educators) become
// five SEO landing pages that own queries like "healthcare tools for
// nurses" or "medical billing tools for patients." Each tool link
// resolves to its pre-rendered /tools/<id>/ page from Phase 2, not
// the SPA hash, so the internal link equity flows to canonical URLs.

import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = join(ROOT, 'dist');
const SITE = 'https://sophiewell.com';

const GROUP_LABELS = {
  A: 'Code Reference',
  C: 'Patient Bill & Insurance Literacy',
  E: 'Clinical Math & Conversions',
  F: 'Medication & Infusion',
  G: 'Clinical Scoring & Reference',
  H: 'Workflow & Templates',
  I: 'Field Medicine',
  J: 'Public Health Decision Trees',
  K: 'Lab Reference',
  L: 'Forms & Numbers Literacy',
  N: 'Literacy Helpers',
  O: 'Patient Safety',
};
const GROUP_ORDER = ['A', 'C', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'N', 'O'];

// Per-audience SEO copy + workflow framing. These are the indexable
// paragraphs that earn the long-tail "healthcare tools for X" queries.
export const HUBS = {
  patients: {
    slug: 'patients',
    label: 'Patients',
    h1: 'Healthcare tools for patients',
    title: 'Healthcare Tools for Patients - Free, in your browser · Sophie Well',
    description: 'Free patient-facing tools to decode medical bills, read insurance cards, and verify charges. Runs in your browser, no signup, no tracking.',
    lede: 'Tools sized for the conversation you actually have with your care team and your insurance company. Paste a bill, decode an EOB, check a denial against the No Surprises Act, or draft an appeal letter. Every input stays on your device.',
  },
  billers: {
    slug: 'billers',
    label: 'Billers and coders',
    h1: 'Medical billing and coding tools',
    title: 'Medical Billing & Coding Tools - Free, in your browser · Sophie Well',
    description: 'Free ICD-10, HCPCS, CPT, NDC, CARC, RARC, DRG, APC, and form-locator lookups for billers and coders. Runs in your browser, no signup.',
    lede: 'Code lookups and form decoders for the day-to-day of medical billing and coding: ICD-10-CM, HCPCS Level II, CPT structural rows, NDC, CARC and RARC, MS-DRG, APC, NUBC revenue and TOB, CMS-1500 and UB-04 field-by-field references.',
  },
  clinicians: {
    slug: 'clinicians',
    label: 'Nurses and clinicians',
    h1: 'Clinical calculators and references',
    title: 'Clinical Calculators & References - Free, with citations · Sophie Well',
    description: 'Free clinical calculators (BMI, eGFR, QTc, Wells, NIHSS, CHA2DS2-VASc, MELD-3.0, MME) with worked examples and primary citations. No signup.',
    lede: 'Deterministic bedside math and clinical scoring with the primary citation under every result. eGFR (CKD-EPI 2021), QTc (Bazett / Fridericia / Framingham / Hodges), Wells PE and DVT, MME (CDC 2022), ABG interpretation, ARDSnet PBW, and dozens more, all in your browser.',
  },
  field: {
    slug: 'ems',
    label: 'EMS and field medicine',
    h1: 'Tools for EMS and field medicine',
    title: 'EMS and Field Medicine Tools - Free, in your browser · Sophie Well',
    description: 'Free EMS / field-medicine references: pediatric dose, START/JumpSTART triage, burn fluids, naloxone, defib energy, AHA CPR numerics, DOT ERG, NIOSH Pocket Guide.',
    lede: 'Field-tested references for the back of the rig: pediatric weight-to-dose, START and JumpSTART MCI triage, Parkland and Modified Brooke burn fluids, naloxone dosing, defibrillation energy, AHA CPR numeric reference, DOT ERG hazmat lookup, NIOSH Pocket Guide.',
  },
  educators: {
    slug: 'educators',
    label: 'Educators',
    h1: 'Healthcare tools for educators',
    title: 'Healthcare Tools for Educators - Free, with citations · Sophie Well',
    description: 'Free deterministic reference tools for clinical educators, coding instructors, and EMS trainers. Every tool ships a primary citation and a worked example.',
    lede: 'Citation-first reference tools you can use in lectures, simulation, and skills labs. Every clinical formula links its primary source; every lookup ships the authoritative dataset name and fetched-on date; every scoring tile carries a worked example.',
  },
};

async function loadUtilities() {
  const src = await readFile(join(ROOT, 'app.js'), 'utf8');
  const arr = src.match(/const UTILITIES = \[([\s\S]*?)\n\];/);
  if (!arr) throw new Error('build-hub-pages: could not find UTILITIES in app.js');
  const tiles = [];
  for (const line of arr[1].split('\n')) {
    const id = line.match(/id:\s*'([^']+)'/);
    const name = line.match(/name:\s*'([^']+)'/);
    const group = line.match(/group:\s*'([^']+)'/);
    const aud = line.match(/audiences:\s*\[([^\]]*)\]/);
    if (id && name && group && aud) {
      const audiences = aud[1].split(',').map((s) => s.replace(/['\s]/g, '')).filter(Boolean);
      tiles.push({ id: id[1], name: name[1], group: group[1], audiences });
    }
  }
  if (tiles.length === 0) throw new Error('build-hub-pages: zero tiles parsed.');
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

function buildHubHtml({ hub, tilesByGroup, totalCount }) {
  const canonical = `${SITE}/for/${hub.slug}/`;

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Sophie Well', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: hub.label, item: canonical },
    ],
  };

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: hub.h1,
    description: hub.description,
    url: canonical,
    inLanguage: 'en',
    isAccessibleForFree: true,
    isPartOf: { '@id': `${SITE}/#webapp` },
    publisher: { '@type': 'Organization', name: 'Sophie Well', url: SITE },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: totalCount,
      itemListElement: Object.values(tilesByGroup).flat().map((t, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE}/tools/${t.id}/`,
        name: t.name,
      })),
    },
  };

  const groupSections = GROUP_ORDER
    .filter((g) => tilesByGroup[g] && tilesByGroup[g].length)
    .map((g) => {
      const tiles = tilesByGroup[g];
      return `        <section class="hub-group" aria-labelledby="hub-g-${g}">
          <h2 id="hub-g-${g}">${esc(GROUP_LABELS[g])}</h2>
          <ul class="hub-tile-list">
${tiles.map((t) => `            <li>
              <a href="${SITE}/tools/${t.id}/">
                <span class="hub-tile-name">${esc(t.name)}</span>
                <span class="hub-tile-desc">${esc(t.desc)}</span>
              </a>
            </li>`).join('\n')}
          </ul>
        </section>`;
    })
    .join('\n\n');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />

    <meta name="referrer" content="no-referrer" />
    <meta name="color-scheme" content="dark" />

    <title>${esc(hub.title)}</title>
    <meta name="description" content="${esc(hub.description)}" />
    <meta name="author" content="Clay Good" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
    <link rel="canonical" href="${canonical}" />
    <link rel="author" href="https://claygood.com" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Sophie Well" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${esc(hub.title)}" />
    <meta property="og:description" content="${esc(hub.description)}" />
    <meta property="og:image" content="${SITE}/logo.png" />
    <meta property="og:locale" content="en_US" />
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="${canonical}" />
    <meta property="twitter:title" content="${esc(hub.title)}" />
    <meta property="twitter:description" content="${esc(hub.description)}" />
    <meta property="twitter:image" content="${SITE}/logo.png" />

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
          <span aria-current="page">For ${esc(hub.label.toLowerCase())}</span>
        </nav>

        <h1 class="tp-h1">${esc(hub.h1)}</h1>
        <p class="tp-lede">${esc(hub.lede)}</p>
        <p class="hub-count muted">${totalCount} tool${totalCount === 1 ? '' : 's'} in this hub, all free, all in your browser.</p>

${groupSections}

        <nav class="hub-other" aria-label="Other audience hubs">
          <h2>Other audience hubs</h2>
          <ul>
${Object.values(HUBS).filter((h) => h.slug !== hub.slug).map((h) =>
    `            <li><a href="${SITE}/for/${h.slug}/">${esc(h.label)}</a></li>`).join('\n')}
          </ul>
        </nav>

        <p class="tp-author muted">Built by <a href="https://claygood.com" rel="noopener" target="_blank">Clay Good</a>. Source on <a href="https://github.com/clay-good/sophiewell.com" rel="noopener" target="_blank">GitHub</a>.</p>
      </main>
    </div>
  </body>
</html>
`;
}

async function main() {
  if (!existsSync(DIST)) {
    console.error('build-hub-pages: dist/ does not exist. Run after the main build copies static assets.');
    process.exit(1);
  }
  const hubsDir = join(DIST, 'for');
  if (existsSync(hubsDir)) await rm(hubsDir, { recursive: true, force: true });
  await mkdir(hubsDir, { recursive: true });

  const [tiles, descriptions] = await Promise.all([loadUtilities(), loadDescriptions()]);

  let written = 0;
  for (const audKey of Object.keys(HUBS)) {
    const hub = HUBS[audKey];
    const matched = tiles
      .filter((t) => t.audiences.includes(audKey))
      .map((t) => ({ ...t, desc: descriptions.get(t.id) || '' }));
    const byGroup = {};
    for (const t of matched) {
      (byGroup[t.group] ||= []).push(t);
    }
    const html = buildHubHtml({ hub, tilesByGroup: byGroup, totalCount: matched.length });
    const out = join(hubsDir, hub.slug);
    await mkdir(out, { recursive: true });
    await writeFile(join(out, 'index.html'), html, 'utf8');
    written += 1;
  }
  console.log(`build-hub-pages: wrote ${written} audience hub pages under dist/for/.`);
}

main().catch((err) => { console.error('build-hub-pages: failed', err); process.exit(1); });
