#!/usr/bin/env node
// spec-v1605 open exports: builds /open-data/, the page that lists the datasets curated for the
// public-utility tools as downloads a researcher, journalist, regulator or another free tool can use.
//
// A fetched dataset is offered as the very files the tools read (data/<id>/manifest.json, its shards and
// changelog.json), so the download is the bundled dataset byte for byte. A dataset kept as a dated
// constant in lib/ (the preventive code map) is written to dist/open-data/<id>.json from that constant,
// one row per fact with its source URL and the date it was read. Nothing here is about a person.

import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DATED_PREVENTIVE_CODES } from '../lib/preventive-codes.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://sophiewell.com';
const CANONICAL = `${SITE}/open-data/`;
const TITLE = 'Open data - Sophie Well';
const DESCRIPTION = 'Free downloads of the datasets curated for Sophie Well\'s coverage tools, one row per fact, each with its source and the date it was read.';

// preventiveCodesExport() -> the JSON document for /open-data/preventive-codes.json.
export function preventiveCodesExport() {
  const [id, row] = Object.entries(DATED_PREVENTIVE_CODES).at(-1);
  return {
    dataset: 'preventive-codes',
    version: id,
    edition: row.edition,
    validThrough: row.validThrough,
    license: 'Codes as published by CMS (a US government work). CPT is a registered trademark of the American Medical Association; no descriptors are included. Our curation (which codes, the service and basis columns) is CC-BY-4.0.',
    source: row.source,
    rows: row.values.services.flatMap((s) => s.codes.map((code) => ({ code, service: s.service, basis: s.basis, sourceUrl: row.source.url, readOn: row.readOn }))),
  };
}

// The datasets on the page. `files` are site paths of the bundled files themselves.
export function openDatasets(root = ROOT) {
  const uspstf = JSON.parse(readFileSync(join(root, 'data', 'uspstf', 'manifest.json'), 'utf8'));
  const codes = preventiveCodesExport();
  const pam = JSON.parse(readFileSync(join(root, 'data', 'pa-metrics', 'manifest.json'), 'utf8'));
  return [
    {
      id: 'uspstf',
      name: 'USPSTF A and B recommendations',
      what: 'Each recommendation on the Task Force\'s A and B list: topic, population, its text verbatim, grade, release month and link, with the age, sex, pregnancy and risk conditions we read from it. Used by Preventive Services Covered at $0 (USPSTF A and B List).',
      edition: uspstf.sourceEdition,
      readOn: uspstf.fetchedAt,
      rows: uspstf.recordCount,
      sha256: uspstf.recordsSha256,
      license: 'The recommendations are a US government work; the Task Force asks that they be reproduced verbatim with the source cited. Our population columns are CC-BY-4.0.',
      source: uspstf.sourceUrl,
      files: ['/data/uspstf/manifest.json', ...uspstf.shards.map((s) => `/data/uspstf/shards/${s.name}`), '/data/uspstf/changelog.json'],
    },
    {
      id: 'pa-metrics',
      name: 'Prior authorization metrics as payers posted them',
      what: 'One row per report a payer posted under the CMS prior authorization rule (CMS-0057-F): approval, denial, appeal and extended-review rates, counts where the payer gave them, and decision times as posted, each with the report\'s URL. Calendar 2025 reports from UnitedHealthcare, Aetna, Humana, Kaiser Permanente, Centene, Elevance, Molina, Oscar and HCSC so far: Medicare Advantage contracts, Medicaid managed care and CHIP plans, and Marketplace issuers. Used by Payer Prior Authorization Report Check.',
      edition: pam.sourceEdition,
      readOn: pam.curatedAt,
      rows: pam.recordCount,
      sha256: pam.recordsSha256,
      license: 'The figures are each payer\'s, as posted on its own site (URL on every row). Our curation is CC-BY-4.0.',
      source: 'https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-B/part-422/subpart-C/section-422.122',
      files: ['/data/pa-metrics/manifest.json', ...pam.shards.map((s) => `/data/pa-metrics/${s.name}`)],
    },
    {
      id: 'preventive-codes',
      name: 'Preventive service codes',
      what: 'The HCPCS and CPT codes that are screening, counseling, vaccine or PrEP codes by their own descriptor, each with the service and why most plans must cover it at $0 (USPSTF, ACIP or HRSA). Codes also billed for diagnosis are left out. Used by Read My Health Insurance Claims File.',
      edition: `CMS MLN006559, ${codes.edition}`,
      readOn: codes.rows[0].readOn,
      rows: codes.rows.length,
      license: codes.license,
      source: codes.source.url,
      files: ['/open-data/preventive-codes.json'],
    },
  ];
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const usDate = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

function datasetHtml(d) {
  return `        <section class="commitments-item" id="${esc(d.id)}" aria-labelledby="${esc(d.id)}-h">
          <h2 id="${esc(d.id)}-h">${esc(d.name)}</h2>
          <p class="commitments-body">${esc(d.what)}</p>
          <p class="commitments-body">${esc(d.rows.toLocaleString('en-US'))} rows. Edition: ${esc(d.edition)}. Read on ${esc(usDate(d.readOn))} from <a href="${esc(d.source)}" rel="noopener" target="_blank">the source</a>.</p>
          <p class="commitments-enforcement"><strong>Terms:</strong> ${esc(d.license)}</p>
          <ul>
${d.files.map((f) => `            <li><a href="${esc(f)}">${esc(f.split('/').pop())}</a></li>`).join('\n')}
          </ul>
        </section>`;
}

export function pageHtml(datasets) {
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

    <title>${esc(TITLE)}</title>
    <meta name="description" content="${esc(DESCRIPTION)}" />
    <meta name="author" content="Clay Good" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
    <link rel="canonical" href="${CANONICAL}" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Sophie Well" />
    <meta property="og:url" content="${CANONICAL}" />
    <meta property="og:title" content="${esc(TITLE)}" />
    <meta property="og:description" content="${esc(DESCRIPTION)}" />
    <meta property="og:locale" content="en_US" />

    <link rel="stylesheet" href="/styles.css" />
    <script src="/theme.js" defer></script>
  </head>
  <body class="commitments-page">
    <header class="topbar" role="banner">
      <div class="topbar-inner">
        <a class="topbar-home" href="/">
          <img src="/logo.png" alt="" width="28" height="28" />
          <span>Sophie Well</span>
        </a>
      </div>
    </header>

    <main id="main" class="commitments-main" tabindex="-1">
      <article class="commitments-article">
        <h1>Open data</h1>
        <p class="commitments-lede">
          The datasets we curated for the coverage tools, free to download and reuse.
          Each row is one fact, with the page it came from and the date we read it.
          None of it is about a person.
        </p>
        <p class="commitments-meta">
          A fetched dataset's download is the same file the tools read, and its
          changelog lists what each refresh added, removed or changed.
        </p>

${datasets.map(datasetHtml).join('\n\n')}
      </article>
    </main>

    <footer class="site-footer" role="contentinfo">
      <p><a href="/">&larr; Back to Sophie Well</a></p>
    </footer>
  </body>
</html>
`;
}

async function main() {
  const outDir = join(ROOT, 'dist', 'open-data');
  await mkdir(outDir, { recursive: true });
  const datasets = openDatasets();
  await writeFile(join(outDir, 'index.html'), pageHtml(datasets), 'utf8');
  await writeFile(join(outDir, 'preventive-codes.json'), JSON.stringify(preventiveCodesExport(), null, 2) + '\n', 'utf8');
  for (const d of datasets) for (const f of d.files) if (f.startsWith('/data/') && !existsSync(join(ROOT, f))) throw new Error(`build-open-data: ${f} is listed but not bundled`);
  console.log(`build-open-data: wrote /open-data/ (${datasets.length} datasets).`);
}

if (process.argv[1] && process.argv[1].endsWith('build-open-data.mjs')) {
  main().catch((err) => { console.error('build-open-data: failed', err); process.exit(1); });
}
