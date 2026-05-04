#!/usr/bin/env node
// Regenerate the JSON-LD block in index.html from the live UTILITIES list
// in app.js. Output is written between the <!-- LD-JSON:START --> and
// <!-- LD-JSON:END --> markers. Idempotent.
//
// Source-of-truth: the UTILITIES array in ../app.js. This script imports it,
// not a duplicate copy, so the JSON-LD `featureList` always matches the
// runtime tile grid.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const INDEX = resolve(ROOT, 'index.html');

// Pull UTILITIES out of app.js without executing browser-only side effects.
// app.js guards `document` references behind a typeof check, so we can import
// it under Node  -  but it also imports view modules that touch the DOM at
// module-init time. Safer path: parse the UTILITIES literal directly.
const appSource = await readFile(resolve(ROOT, 'app.js'), 'utf8');
const arrMatch = appSource.match(/const UTILITIES = \[([\s\S]*?)\n\];/);
if (!arrMatch) {
  console.error('build-ld: could not find UTILITIES array in app.js');
  process.exit(1);
}
const lines = arrMatch[1].split('\n');
const featureList = [];
for (const line of lines) {
  const m = line.match(/name:\s*'([^']+)'/);
  if (m) featureList.push(m[1]);
}
if (featureList.length === 0) {
  console.error('build-ld: parsed zero tools from UTILITIES  -  refusing to overwrite.');
  process.exit(1);
}

const ld = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': 'https://sophiewell.com/#webapp',
      name: 'sophiewell',
      url: 'https://sophiewell.com/',
      description: `Free, client-side healthcare toolbox with ${featureList.length} deterministic utilities for patients, billers, coders, nurses, clinicians, EMS, and educators.`,
      applicationCategory: ['HealthApplication', 'MedicalApplication', 'UtilitiesApplication'],
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript. Modern browser.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      isAccessibleForFree: true,
      inLanguage: ['en'],
      creator: { '@type': 'Person', name: 'Clay Good', url: 'https://claygood.com' },
      image: 'https://sophiewell.com/logo.png',
      featureList,
      softwareHelp: { '@type': 'CreativeWork', url: 'https://github.com/clay-good/sophiewell.com' },
      license: 'https://github.com/clay-good/sophiewell.com/blob/main/LICENSE',
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Is sophiewell really free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. sophiewell is free, open source under MIT, and ad-free. The full source is on GitHub.' } },
        { '@type': 'Question', name: 'Are my inputs sent to any server?', acceptedAnswer: { '@type': 'Answer', text: 'No. Every calculation runs locally in your browser. The site enforces a strict Content Security Policy and ships no analytics, telemetry, or third-party CDN.' } },
        { '@type': 'Question', name: 'Is this medical advice?', acceptedAnswer: { '@type': 'Answer', text: 'No. sophiewell is a deterministic math and reference aid sourced from public datasets. It does not replace clinician judgment, institutional protocols, professional billing review, or legal counsel.' } },
        { '@type': 'Question', name: 'Where does the data come from?', acceptedAnswer: { '@type': 'Answer', text: 'Public datasets (CMS, FDA, OIG, AHA, CDC, ATSDR, NIOSH, DOT). Each tool surfaces a Source label with a fetched-on date. See docs/data-sources.md for the full source catalog.' } },
        { '@type': 'Question', name: 'Does it work offline?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, after first load. A service worker caches the static bundle so every tool keeps working without an internet connection.' } },
      ],
    },
  ],
};

const indented = JSON.stringify(ld, null, 2)
  .split('\n')
  .map((l) => '    ' + l)
  .join('\n');

const block = `    <!-- LD-JSON:START -->
    <script type="application/ld+json">
${indented}
    </script>
    <!-- LD-JSON:END -->`;

const html = await readFile(INDEX, 'utf8');
if (!/<!-- LD-JSON:START -->/.test(html) || !/<!-- LD-JSON:END -->/.test(html)) {
  console.error('build-ld: LD-JSON markers not found in index.html.');
  process.exit(1);
}
const replaced = html.replace(
  /[ \t]*<!-- LD-JSON:START -->[\s\S]*?<!-- LD-JSON:END -->/,
  block,
);
await writeFile(INDEX, replaced);
const note = replaced === html ? 'no change' : 'updated';
console.log(`build-ld: ${note}, ${featureList.length} tools (${INDEX})`);
