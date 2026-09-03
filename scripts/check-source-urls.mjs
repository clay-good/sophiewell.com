#!/usr/bin/env node
// spec-v1003: a dataset manifest's `sourceUrl` becomes an href.
//
// app.js renders `Source: <label>` as a link to `manifest.sourceUrl` whenever the
// field is present. Eleven manifests carried a SENTENCE there -- "FDA labels via
// DailyMed", "standard nutrition references", "project-author-original-content" --
// and seven live tiles therefore sent a reader to
// sophiewell.com/FDA%20labels%20via%20DailyMed in a new tab. One carried a real URL
// with a note appended, which is not a URL either.
//
// The renderer now refuses to link anything that is not an absolute http(s) URL, so
// the bug cannot reach a reader again. This is the other half: it stops a
// non-URL being written in the first place, where a maintainer can see it.
//
// A dataset with no canonical page should carry `sourceUrl: null`. That renders the
// label as plain text, which is the honest outcome; a sentence in an href is not.
//
// Offline and deterministic, so it belongs in `npm run lint`. Whether the page is
// still THERE is a network question, answered by scripts/check-citation-links.mjs
// for tile citations and scripts/check-pa-source-urls.mjs for the prior-auth ledger.

import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = process.cwd();

// findBadSourceUrls(manifests) -> [string]. Pure, so a test can prove each rule
// bites without touching the filesystem. `manifests` is { dataset: manifestObject }.
export function findBadSourceUrls(manifests) {
  const out = [];
  for (const [dataset, m] of Object.entries(manifests)) {
    if (!Object.prototype.hasOwnProperty.call(m, 'sourceUrl')) continue;
    const v = m.sourceUrl;
    if (v === null) continue; // deliberate: no canonical page, render plain text
    if (typeof v !== 'string') {
      out.push(`${dataset}: sourceUrl is ${typeof v}, not a string or null`);
      continue;
    }
    if (/\s/.test(v)) {
      out.push(`${dataset}: sourceUrl contains whitespace, so it is prose or a URL with a note appended -- ${JSON.stringify(v.slice(0, 70))}`);
      continue;
    }
    let u;
    try { u = new URL(v); } catch {
      out.push(`${dataset}: sourceUrl does not parse as a URL -- ${JSON.stringify(v.slice(0, 70))}`);
      continue;
    }
    if (u.protocol !== 'https:' && u.protocol !== 'http:') {
      out.push(`${dataset}: sourceUrl is not http(s) -- ${JSON.stringify(v.slice(0, 70))}`);
    }
  }
  return out;
}

async function main() {
  const manifests = {};
  for (const dir of await readdir(join(ROOT, 'data'), { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    try {
      manifests[dir.name] = JSON.parse(await readFile(join(ROOT, 'data', dir.name, 'manifest.json'), 'utf8'));
    } catch { /* a folder with no manifest is not this check's business */ }
  }
  const bad = findBadSourceUrls(manifests);
  if (bad.length) {
    console.error('check-source-urls: a dataset manifest\'s sourceUrl becomes an href, and these are not URLs:');
    for (const b of bad) console.error(`  ${b}`);
    console.error('  Give it the agency\'s canonical page, or set it to null to render the label as plain text.');
    process.exit(1);
  }
  const linked = Object.values(manifests).filter((m) => typeof m.sourceUrl === 'string').length;
  console.log(`check-source-urls: clean (${Object.keys(manifests).length} manifests, ${linked} linkable sourceUrls).`);
}

if (process.argv[1] && process.argv[1].endsWith('check-source-urls.mjs')) {
  main().catch((err) => { console.error(err); process.exit(1); });
}
