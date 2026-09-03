#!/usr/bin/env node
// spec-v943: does every source link actually reach a source?
//
// The lint gate (scripts/check-citations.mjs) is syntactic on purpose - it runs
// offline in CI, so it can prove a citationUrl is a well-formed https URL and
// that it is not a search-results page, but not that the document is there.
// This script is the network half, run by hand:
//
//   node scripts/check-citation-links.mjs            # every link
//   node scripts/check-citation-links.mjs --only doi # one kind
//
// It is deliberately NOT part of `npm run lint`: a publisher outage would fail
// CI for a reason that has nothing to do with the change under test.
//
// Three kinds of link, three ways to check one:
//   doi.org/...     -> the DOI handle API (no publisher involved, so no 403s)
//   pubmed/<pmid>/  -> one esummary call for every PMID at once
//   anything else   -> a GET, counting only 404/410/5xx as broken (publishers
//                      routinely answer a script with 401/403)
//
// Exit 0 when every link resolves, 1 otherwise.

import { META } from '../lib/meta.js';

const HANDLE = 'https://doi.org/api/handles/';
const ESUMMARY = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=';
const ESEARCH = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax=1&term=';
const UA = 'sophiewell-citation-linkcheck/1.0 (https://sophiewell.com)';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// linkPairs() -> [{ id, url }]. Both link shapes, one row per tile per link.
export function linkPairs(meta = META) {
  const out = [];
  for (const [id, m] of Object.entries(meta)) {
    if (m.citationUrl) out.push({ id, url: m.citationUrl });
    for (const e of m.citationUrls || []) out.push({ id, url: e.url });
  }
  return out;
}

// kindOf(url) -> 'doi' | 'pubmed' | 'pubmed-search' | 'web'.
//
// spec-v999: 'pubmed-search' is its own kind because a search URL always
// answers 200, whatever it finds. Twelve tiles cite a book chapter or a
// pre-1946 paper no index carries and render "Search PubMed for this source"
// instead of a direct link (spec-v943); FOUR of those searches returned an
// EMPTY results page. A 200 is not proof the page is useful, the same way a
// 200 was not proof a prior-auth source was there (spec-v980).
export function kindOf(url) {
  if (url.startsWith('https://doi.org/')) return 'doi';
  if (/^https:\/\/pubmed\.ncbi\.nlm\.nih\.gov\/\d+\/?$/.test(url)) return 'pubmed';
  if (/^https:\/\/pubmed\.ncbi\.nlm\.nih\.gov\/\?term=/.test(url)) return 'pubmed-search';
  return 'web';
}

// termOf(url) -> string | null. The query a 'pubmed-search' link runs.
export function termOf(url) {
  try { return new URL(url).searchParams.get('term'); } catch { return null; }
}

// checkPubmedSearch(url) -> string | null. Runs the reader's own query and
// fails when it returns nothing, so "Search PubMed for this source" cannot
// quietly become "here is an empty page".
async function checkPubmedSearch(url) {
  const term = termOf(url);
  if (!term) return 'search link carries no term';
  for (let a = 0; a < 3; a++) {
    try {
      const res = await fetch(`${ESEARCH}${encodeURIComponent(term)}`, { headers: { 'User-Agent': UA } });
      const j = await res.json();
      const count = Number(j.esearchresult?.count);
      if (!Number.isFinite(count)) { await sleep(1000 * (a + 1)); continue; }
      return count > 0 ? null : 'PubMed search returns no results';
    } catch { await sleep(1000 * (a + 1)); }
  }
  return 'PubMed search check failed after 3 attempts';
}

// pmidOf(url) -> string | null.
export function pmidOf(url) {
  return (url.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)\/?$/) || [])[1] || null;
}

async function checkDoi(url) {
  const doi = decodeURI(url.slice('https://doi.org/'.length));
  for (let a = 0; a < 3; a++) {
    try {
      const j = await (await fetch(HANDLE + encodeURI(doi), { headers: { 'User-Agent': UA } })).json();
      return j.responseCode === 1 ? null : `DOI does not resolve (handle responseCode ${j.responseCode})`;
    } catch { await sleep(1000 * (a + 1)); }
  }
  return 'DOI check failed after 3 attempts';
}

// Publisher and society sites are behind bot filters that answer an unfamiliar
// User-Agent with 504 or 403 while serving a browser normally. The question
// this check asks is "can a reader open this page", so it asks as a browser.
const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36';

// spec-v999: 404 and 410 are the server saying the document is gone, and are
// believed the first time. A 5xx or a dropped connection is the server having a
// bad moment -- three runs of this checker in a row produced three different
// "failures" (an esummary batch, apps.who.int, federalregister.gov), and every
// one of them answered 200 on retry. Reporting those as dead links teaches the
// reader of this report to ignore it, so retry them before believing them.
async function checkWeb(url) {
  let last = null;
  for (let a = 0; a < 3; a++) {
    try {
      const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': BROWSER_UA } });
      if (res.status === 404 || res.status === 410) return `HTTP ${res.status}`;
      if (res.status < 500) return null;
      last = `HTTP ${res.status}`;
    } catch (e) {
      last = `request failed (${e.message})`;
    }
    await sleep(1500 * (a + 1));
  }
  return `${last} on three attempts`;
}

async function main() {
  const onlyIdx = process.argv.indexOf('--only');
  const only = onlyIdx > -1 ? process.argv[onlyIdx + 1] : null;
  const pairs = linkPairs().filter((p) => !only || kindOf(p.url) === only);
  const seen = new Map();
  for (const p of pairs) {
    if (!seen.has(p.url)) seen.set(p.url, []);
    seen.get(p.url).push(p.id);
  }
  const problems = [];

  // PubMed: one round trip for every record.
  const pmids = [...seen.keys()].filter((u) => kindOf(u) === 'pubmed');
  const known = new Set();
  for (let i = 0; i < pmids.length; i += 180) {
    const chunk = pmids.slice(i, i + 180).map(pmidOf);
    try {
      const j = await (await fetch(ESUMMARY + chunk.join(','), { headers: { 'User-Agent': UA } })).json();
      for (const uid of j.result?.uids || []) known.add(uid);
    } catch (e) {
      problems.push(`esummary request failed: ${e.message}`);
    }
    await sleep(400);
  }
  for (const u of pmids) {
    if (!known.has(pmidOf(u))) problems.push(`${seen.get(u).join(', ')}: no PubMed record for ${u}`);
  }

  for (const u of [...seen.keys()].filter((x) => kindOf(x) === 'doi')) {
    const bad = await checkDoi(u);
    if (bad) problems.push(`${seen.get(u).join(', ')}: ${bad} -- ${u}`);
    await sleep(60);
  }
  for (const u of [...seen.keys()].filter((x) => kindOf(x) === 'pubmed-search')) {
    const bad = await checkPubmedSearch(u);
    if (bad) problems.push(`${seen.get(u).join(', ')}: ${bad} -- ${u}`);
    await sleep(400);
  }
  for (const u of [...seen.keys()].filter((x) => kindOf(x) === 'web')) {
    const bad = await checkWeb(u);
    if (bad) problems.push(`${seen.get(u).join(', ')}: ${bad} -- ${u}`);
    await sleep(300);
  }

  if (problems.length) {
    console.error('check-citation-links: FAIL - source links that do not reach a source:');
    for (const p of problems) console.error(`  ${p}`);
    process.exit(1);
  }
  console.log(`check-citation-links: clean (${seen.size} distinct links across ${pairs.length} tile references).`);
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
