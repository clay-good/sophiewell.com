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
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = join(ROOT, 'dist');
const SITE = 'https://sophiewell.com';

// Curated topic clusters. Tile ids must exist in UTILITIES; a build-
// time sanity check below drops unknown ids with a warning so the
// build never emits a dead link.
export const TOPICS = {
  cardiology: {
    slug: 'cardiology',
    label: 'Cardiology',
    h1: 'Cardiology calculators and decision tools',
    title: 'Cardiology Calculators - QTc, Wells, CHA2DS2-VASc, ASCVD · Sophie Well',
    description: 'Free cardiology calculators with citations: QTc, Wells PE/DVT, CHA2DS2-VASc, HAS-BLED, HEART, TIMI, GRACE, ASCVD, PREVENT, Sgarbossa. No signup.',
    lede: 'Bedside cardiology math and rule-out scores with the primary citation under every result. QTc by Bazett, Fridericia, Framingham, and Hodges; Wells PE and DVT with the Geneva alternative; CHA2DS2-VASc and HAS-BLED for atrial fibrillation; HEART, TIMI, and GRACE for chest pain risk stratification; ASCVD and PREVENT for primary prevention; Sgarbossa for STEMI in LBBB.',
    tiles: [
      'qtc', 'qtc-suite', 'wells-pe', 'wells-pe-geneva', 'wells-dvt',
      'wells-dvt-caprini', 'perc', 'chads', 'hasbled', 'heart', 'timi',
      'grace', 'ascvd', 'prevent', 'sgarbossa', 'rcri', 'defib',
      'cincinnati', 'fast', 'cpr-numeric', 'adult-arrest-ref',
      'peds-arrest-ref',
    ],
  },
  'medication-safety': {
    slug: 'medication-safety',
    label: 'Medication safety',
    h1: 'Medication safety calculators and references',
    title: 'Medication Safety Tools - MME, Naloxone, Beers, High-Alert · Sophie Well',
    description: 'Free medication-safety tools: opioid MME (CDC 2022), naloxone dosing, Beers criteria, high-alert list, renal antibiotic dosing, anticoag reversal. No signup.',
    lede: 'Tools sized for the moments where a wrong dose hurts somebody: opioid morphine milligram equivalents under the CDC 2022 update, naloxone dosing by weight, Beers criteria for older adults, the ISMP high-alert list, anticoagulation reversal cheats, IV-to-PO conversions, steroid and benzodiazepine equivalencies, renal antibiotic dose adjustments, vasopressor reference, and insulin infusion math.',
    tiles: [
      'opioid-mme', 'naloxone', 'beers', 'high-alert', 'high-alert-card',
      'anticoag-reversal', 'iv-to-po', 'steroid-equiv', 'benzo-equiv',
      'abx-renal', 'vasopressor', 'insulin-drip', 'drip-rate',
      'weight-dose', 'peds-dose', 'peds-weight-dose', 'conc-rate',
      'tpn-macro', 'time-to-dose', 'tdm-levels',
    ],
  },
  triage: {
    slug: 'triage',
    label: 'Triage and acuity',
    h1: 'Triage and acuity tools',
    title: 'Triage Tools - START, JumpSTART, qSOFA, NIHSS, Cincinnati · Sophie Well',
    description: 'Free triage and acuity tools: START and JumpSTART MCI triage, field-trauma triage, qSOFA/SOFA, Cincinnati and FAST stroke, PEWS, ABCD2, NEXUS. No signup.',
    lede: 'Decision tools for "who is sickest, who goes first, who can wait." START and JumpSTART mass-casualty triage, the 2021 CDC field trauma triage criteria, qSOFA and SOFA, shock index, Cincinnati and FAST stroke screens, NIHSS, ABCD2 for TIA, PEWS for pediatric acuity, AVPU/GCS, and the NEXUS C-spine rule.',
    tiles: [
      'start-triage', 'jumpstart-triage', 'field-triage', 'qsofa-sofa',
      'shock-index', 'cincinnati', 'fast', 'nihss', 'abcd2', 'pews',
      'avpu-gcs', 'gcs', 'nexus-cspine', 'em-time', 'apgar',
    ],
  },
  nephrology: {
    slug: 'nephrology',
    label: 'Nephrology and acid-base',
    h1: 'Nephrology and acid-base tools',
    title: 'Nephrology Tools - eGFR CKD-EPI 2021, Anion Gap, KDIGO · Sophie Well',
    description: 'Free nephrology and acid-base tools: eGFR (CKD-EPI 2021, race-free), Cockcroft-Gault, FeNa/FeUrea, KDIGO AKI staging, anion gap, Winters, ABG, SAAG. No signup.',
    lede: 'Renal function, fluid, electrolyte, and acid-base math with the primary citation under every result. eGFR under the 2021 race-free CKD-EPI equation, Cockcroft-Gault, FeNa and FeUrea, KDIGO AKI staging, anion gap (with delta-delta and corrected variants), osmolal gap, SAAG, Winters formula, ABG interpretation, maintenance fluids, sodium correction with the free-water deficit, corrected calcium and sodium.',
    tiles: [
      'egfr', 'egfr-suite', 'cockcroft-gault', 'fena-feurea', 'kdigo-aki',
      'anion-gap', 'corrected-anion-gap', 'anion-gap-dd', 'osmolal-gap',
      'saag', 'winters', 'abg', 'sodium-correction', 'free-water-deficit',
      'corrected-sodium', 'corrected-calcium', 'corrected-ca-na',
      'maint-fluids', 'iron-ganzoni',
    ],
  },
  'obstetrics-pediatrics': {
    slug: 'obstetrics-pediatrics',
    label: 'Obstetrics and pediatrics',
    h1: 'Obstetrics and pediatrics tools',
    title: 'Obstetrics & Pediatrics Tools - APGAR, PEWS, Bishop, EDD · Sophie Well',
    description: 'Free OB and peds tools: estimated due date, pregnancy dating, Bishop, APGAR, pediatric vital ranges, weight-to-dose, ETT size, JumpSTART, PEWS. No signup.',
    lede: 'OB and pediatric reference tools: estimated due date and pregnancy dating, the Bishop score for cervical favorability, APGAR scoring, age-banded pediatric vital ranges, pediatric weight-to-dose and unit conversions, pediatric ETT sizing, JumpSTART MCI triage, PEWS for pediatric acuity, Mentzer for microcytic anemia, pediatric lab reference ranges.',
    tiles: [
      'due-date', 'preg-dating', 'bishop', 'apgar', 'peds-vitals',
      'peds-dose', 'peds-weight-dose', 'peds-weight-conv', 'peds-ett',
      'peds-arrest-ref', 'jumpstart-triage', 'lab-peds', 'pews',
      'mentzer', 'epds',
    ],
  },
  'behavioral-health': {
    slug: 'behavioral-health',
    label: 'Behavioral health',
    h1: 'Behavioral health screeners',
    title: 'Behavioral Health Screeners - PHQ-9, GAD-7, AUDIT-C, CIWA · Sophie Well',
    description: 'Free behavioral-health screeners: PHQ-9 depression, GAD-7 anxiety, AUDIT-C and CAGE alcohol, EPDS postpartum, Mini-Cog, CIWA alcohol withdrawal, COWS opioid withdrawal.',
    lede: 'Validated screeners for the everyday primary-care, OB, and inpatient visit: PHQ-9 for depression, GAD-7 for anxiety, AUDIT-C and CAGE for alcohol use, EPDS for postpartum mood, Mini-Cog for cognition, CIWA-Ar for alcohol withdrawal, and COWS for opioid withdrawal. Every screener ships a worked example and the primary citation.',
    tiles: ['phq9', 'gad7', 'auditc', 'cage', 'epds', 'mini-cog', 'ciwa', 'cows'],
  },
  'billing-and-coding': {
    slug: 'billing-and-coding',
    label: 'Billing and coding',
    h1: 'Medical billing and coding lookups',
    title: 'Medical Billing & Coding Lookups - ICD-10, HCPCS, CARC, DRG · Sophie Well',
    description: 'Free billing and coding lookups: ICD-10-CM and PCS, HCPCS, CPT, NDC, POS, modifiers, CARC/RARC, MS-DRG, APC, NUBC revenue/TOB, CMS-1500 and UB-04 fields.',
    lede: 'Every code lookup, form-locator reference, and denial-decoder Sophie ships, in one place. ICD-10-CM (FY2026) and ICD-10-PCS, HCPCS Level II, CPT structural reference, NDC and RxNorm, place-of-service, billing modifiers, CARC and RARC denial reasons, MS-DRG and APC tables, NUBC revenue and type-of-bill codes, and field-by-field references for the CMS-1500 and UB-04.',
    tiles: [
      'icd10', 'pcs-lookup', 'hcpcs', 'hcpcs-mod', 'cpt', 'ndc',
      'rxnorm-lookup', 'ndc-rxnorm', 'pos-codes', 'pos-lookup',
      'modifier-codes', 'revenue-codes', 'rev-table', 'carc', 'rarc',
      'drg-lookup', 'apc-lookup', 'tob-decode', 'nubc-codes', 'cms1500',
      'ub04', 'eob-glossary',
    ],
  },
  'patient-literacy': {
    slug: 'patient-literacy',
    label: 'Patient and insurance literacy',
    h1: 'Patient and insurance literacy tools',
    title: 'Patient & Insurance Literacy - Bill, EOB, No Surprises · Sophie Well',
    description: 'Free patient-literacy tools: hospital bill decoder, EOB and MSN decoders, No Surprises Act eligibility, IDR, ABN, insurance card reader, appeal letter, COBRA.',
    lede: 'Tools for the conversation patients actually have with billing offices and insurance companies. Paste a hospital bill or an EOB, decode an MSN, check denials against the No Surprises Act, walk through IDR eligibility, read an ABN, draft an appeal letter, and figure out birthday-rule coordination of benefits, COBRA timelines, ACA special enrollment, and Medicare enrollment windows.',
    tiles: [
      'decoder', 'eob-decoder', 'msn-decoder', 'no-surprises',
      'idr-eligibility', 'abn-explainer', 'insurance-card', 'insurance',
      'appeal-letter', 'hipaa-roa', 'birthday-rule', 'cobra-timeline',
      'medicare-enrollment', 'aca-sep', 'wallet-card', 'eob-glossary',
    ],
  },
};

async function loadUtilities() {
  const src = await readFile(join(ROOT, 'app.js'), 'utf8');
  const arr = src.match(/const UTILITIES = \[([\s\S]*?)\n\];/);
  if (!arr) throw new Error('build-topic-pages: could not find UTILITIES in app.js');
  const tiles = new Map();
  for (const line of arr[1].split('\n')) {
    const id = line.match(/id:\s*'([^']+)'/);
    const name = line.match(/name:\s*'([^']+)'/);
    const group = line.match(/group:\s*'([^']+)'/);
    if (id && name && group) {
      tiles.set(id[1], { id: id[1], name: name[1], group: group[1] });
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
    <meta property="og:image" content="${SITE}/logo.png" />
    <meta property="og:locale" content="en_US" />
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="${canonical}" />
    <meta property="twitter:title" content="${esc(topic.title)}" />
    <meta property="twitter:description" content="${esc(topic.description)}" />
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
          <span>Topics</span>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">${esc(topic.label)}</span>
        </nav>

        <h1 class="tp-h1">${esc(topic.h1)}</h1>
        <p class="tp-lede">${esc(topic.lede)}</p>
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
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="manifest" href="/site.webmanifest" />
    <meta name="referrer" content="no-referrer" />
    <meta name="color-scheme" content="dark" />
    <title>Sophie Well Topics - Browse by clinical area · Sophie Well</title>
    <meta name="description" content="Browse Sophie Well's free healthcare tools by clinical topic: cardiology, nephrology, medication safety, triage, OB/peds, behavioral health, billing, literacy." />
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
        <p class="tp-lede">${items.length} clinical and workflow topics, cutting across the home view's organizational groups. Each topic page lists every tile that fits, with internal links to the canonical per-tool pages.</p>

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
      resolved.push({ ...t, desc: descriptions.get(id) || '' });
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
