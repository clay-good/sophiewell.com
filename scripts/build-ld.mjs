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
      // spec-seo §9.4: expand to 12 questions, each phrased as the
      // literal search query, answers <=50 words, primary citation
      // / source surfaced inline so the snippet reads as a complete
      // answer in the SERP.
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Is Sophie Well free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Sophie Well is free, open source under the MIT license, and ad-free. The full source is on GitHub.' } },
        { '@type': 'Question', name: 'Is Sophie Well safe to use with patient data?', acceptedAnswer: { '@type': 'Answer', text: 'Every calculation runs locally in your browser. Nothing you type is sent to any server. The site enforces a strict Content Security Policy and ships no analytics, telemetry, or third-party CDN. You alone control whether information stays on your device.' } },
        { '@type': 'Question', name: 'Does Sophie Well work offline?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, after first load. A service worker caches the static bundle so every tool keeps working without an internet connection.' } },
        { '@type': 'Question', name: 'Does Sophie Well replace my EHR calculator?', acceptedAnswer: { '@type': 'Answer', text: 'No. Sophie Well is a deterministic reference aid. Your EHR remains the system of record for documentation, orders, and billing. Use Sophie Well as a check, not a replacement.' } },
        { '@type': 'Question', name: "Where does Sophie Well's data come from?", acceptedAnswer: { '@type': 'Answer', text: 'Public datasets (CMS, FDA, OIG, AHA, CDC, ATSDR, NIOSH, DOT) plus published clinical literature. Each tool shows its primary citation and, where applicable, a dataset Source label with the fetched-on date in the References region under the result.' } },
        { '@type': 'Question', name: 'Can I use Sophie Well for billing decisions?', acceptedAnswer: { '@type': 'Answer', text: 'Sophie Well is a reference and educational tool. Use it to look up codes, decode statements, and learn the workflow; payer-specific rules, contracted rates, and certified billing review govern actual claims.' } },
        { '@type': 'Question', name: 'Is Sophie Well HIPAA compliant?', acceptedAnswer: { '@type': 'Answer', text: "HIPAA applies to covered entities and their business associates. Sophie Well is neither: it is a static website that stores no data and transmits nothing you type. Whether you may use it with PHI depends on your organization's policies, not on a vendor BAA." } },
        { '@type': 'Question', name: 'Does Sophie Well use AI?', acceptedAnswer: { '@type': 'Answer', text: 'No. Every tool is a pure deterministic function or a lookup against a bundled public dataset. No models, no inference, no LLM calls, in the browser or anywhere else.' } },
        { '@type': 'Question', name: 'How current are the codes (ICD-10, HCPCS, CPT)?', acceptedAnswer: { '@type': 'Answer', text: 'ICD-10-CM follows the annual fiscal-year update (October). HCPCS is refreshed quarterly. CPT descriptors are AMA-owned and are not bundled; structural CPT rows come from the CMS Medicare Physician Fee Schedule. Each tool surfaces its dataset fetched-on date.' } },
        { '@type': 'Question', name: "Can I trust Sophie Well's clinical scores?", acceptedAnswer: { '@type': 'Answer', text: 'Every clinical formula is implemented from the primary citation shown in its References region, and is covered by unit tests against the published example values. Sophie Well is a check on the math, not a substitute for clinical judgment.' } },
        { '@type': 'Question', name: 'How do I report a bug or wrong answer?', acceptedAnswer: { '@type': 'Answer', text: 'Open an issue at github.com/clay-good/sophiewell.com/issues. Include the tile, the inputs, the expected output, and the citation you compared against. Bug fixes ship as small PRs against main.' } },
        { '@type': 'Question', name: 'Who built Sophie Well?', acceptedAnswer: { '@type': 'Answer', text: 'Clay Good (claygood.com) builds and maintains Sophie Well. It is a personal project shipped as a public utility under the MIT license.' } },
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
