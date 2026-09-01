#!/usr/bin/env node
// spec-v945: does the link go to the paper the citation names?
//
// scripts/check-citation-links.mjs answers "does the link resolve?". Every one
// of the 1,627 source links passed that check while 61 of them opened a
// *different paper* -- right journal, right year, wrong article. `pipkin-femoral-head`
// opened an elbow electromyography study; `russe-scaphoid` opened a Hungarian
// case report on congenital hemangiomatosis.
//
// This script asks the second question. For every DOI and PubMed link it pulls
// the record's own metadata and compares three things against the citation the
// link sits under:
//
//   year   -- the record's year (or a year either side, for online-first)
//   page   -- the record's first page
//   author -- the first author's surname
//
// Disagreeing on ONE of the three is normal: a citation may name a page range
// the index records differently, or lead with a corporate author. Disagreeing
// on TWO is the signature of a wrong record, and that is what this reports.
//
//   node scripts/check-citation-agreement.mjs
//
// Like the liveness checker, it is NOT part of `npm run lint`: it needs the
// network, and Crossref rate-limits. Run it at the quarterly source pull.
//
// Exit 0 when nothing disagrees outside the frozen list, 1 otherwise.

import { META } from '../lib/meta.js';

// The one link whose record and citation still disagree and cannot be
// reconciled here. `savary-miller` links a 1992 study of intestinal
// permeability in Crohn's disease -- a paper with nothing to do with
// esophagitis grading. Its citation names the 1978 Savary & Miller endoscopy
// atlas and the Ollyo modification of grade V, and NO INDEX CARRIES EITHER:
// PubMed has no Savary-Miller classification paper, and Europe PMC full text
// finds the grades quoted but never defined. Removing the wrong link would
// leave a dated citation with no link at all, and both escape hatches --
// SEARCH_URL_GRANDFATHERED and data/citation-url-backlog.json -- are
// shrink-only sets. That is an owner's call between the two, not a lint fix;
// see docs/spec-v968.md. Frozen at spec-v945, cut from twelve at spec-v946,
// from five at spec-v950, from four at spec-v961 and from three at spec-v968;
// shrinks only.
export const KNOWN_DISAGREEMENTS = new Set([
  'savary-miller',
]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Medical citations write surnames without their diacritics far more often than
// the index does -- "Allgower" against PubMed's "Allgöwer", "Raiche" against
// "Raîche". Decompose and drop the combining marks before comparing, or every
// such author reads as a mismatch and the pair trips the two-strike rule.
const norm = (s) => (s || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

// linkRows() -> [{ id, url, citation }]. One row per link.
export function linkRows(meta = META) {
  const rows = [];
  for (const [id, m] of Object.entries(meta)) {
    if (!m.citation) continue;
    if (m.citationUrl) rows.push({ id, url: m.citationUrl, citation: m.citation });
    for (const e of m.citationUrls || []) rows.push({ id, url: e.url, citation: m.citation });
  }
  return rows;
}

// disagreements(citation, record) -> [string]. Pure, so the shape of the rule
// is testable without the network.
export function disagreements(citation, rec) {
  const out = [];
  if (rec.year) {
    const near = [rec.year - 1, rec.year, rec.year + 1].some((y) => citation.includes(String(y)));
    if (!near) out.push(`year ${rec.year}`);
  }
  const first = String(rec.page || '').split(/[-\u2013;]/)[0].trim();
  if (first && !citation.includes(first)) out.push(`page ${first}`);
  if (rec.author && rec.author.length > 2 && !norm(citation).includes(norm(rec.author))) {
    out.push(`author ${rec.author}`);
  }
  return out;
}

function keyOf(url) {
  if (url.startsWith('https://doi.org/')) return decodeURI(url.slice('https://doi.org/'.length)).toLowerCase();
  const pmid = (url.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)\/?$/) || [])[1];
  return pmid ? `pmid:${pmid}` : null;
}

async function main() {
  const rows = linkRows();
  const keys = [...new Set(rows.map((r) => keyOf(r.url)).filter(Boolean))];
  const records = {};

  const dois = keys.filter((k) => !k.startsWith('pmid:'));
  for (let i = 0; i < dois.length; i += 25) {
    const chunk = dois.slice(i, i + 25);
    const url = 'https://api.crossref.org/works?rows=25&select=DOI,volume,page,issued,published-print,title,author&filter='
      + chunk.map((d) => `doi:${d}`).join(',');
    for (let a = 0; a < 4; a++) {
      try {
        const res = await fetch(url, { headers: { 'User-Agent': 'sophiewell-citation-agree/1.0' } });
        if (!res.ok) { await sleep(2500); continue; }
        const j = JSON.parse(await res.text());
        for (const it of j.message?.items || []) {
          records[it.DOI.toLowerCase()] = {
            year: it.issued?.['date-parts']?.[0]?.[0] || it['published-print']?.['date-parts']?.[0]?.[0],
            page: it.page, title: (it.title || [])[0], author: it.author?.[0]?.family,
          };
        }
        break;
      } catch { await sleep(2500); }
    }
    await sleep(700);
  }

  const pmids = keys.filter((k) => k.startsWith('pmid:')).map((k) => k.slice(5));
  for (let i = 0; i < pmids.length; i += 180) {
    const chunk = pmids.slice(i, i + 180);
    try {
      const j = await (await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=${chunk.join(',')}`)).json();
      for (const p of chunk) {
        const r = j.result?.[p];
        if (r) {
          records[`pmid:${p}`] = {
            year: Number((r.pubdate || '').slice(0, 4)), page: r.pages, title: r.title,
            author: (r.authors?.[0]?.name || '').split(' ')[0],
          };
        }
      }
    } catch (e) { console.error(`esummary request failed: ${e.message}`); }
    await sleep(500);
  }

  const problems = [];
  const cleared = new Set(KNOWN_DISAGREEMENTS);
  let checked = 0;
  for (const r of rows) {
    const rec = records[keyOf(r.url)];
    if (!rec) continue;
    checked += 1;
    const notes = disagreements(r.citation, rec);
    if (notes.length < 2) continue;
    if (KNOWN_DISAGREEMENTS.has(r.id)) { cleared.delete(r.id); continue; }
    problems.push(`${r.id}: ${notes.join(', ')} -- link opens "${(rec.title || '').slice(0, 70)}" (${r.url})`);
  }
  for (const id of cleared) {
    problems.push(`${id}: listed in KNOWN_DISAGREEMENTS but its link and citation now agree (or the tile is gone); remove it`);
  }

  if (problems.length) {
    console.error('check-citation-agreement: FAIL - links that open a different paper than the citation names:');
    for (const p of problems) console.error(`  ${p}`);
    process.exit(1);
  }
  console.log(`check-citation-agreement: clean (${checked} links checked against their record; ${KNOWN_DISAGREEMENTS.size} known disagreements).`);
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
