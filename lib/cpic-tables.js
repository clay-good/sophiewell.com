// The CPIC tables (data/cpic, scripts/data/builders/cpic.mjs) as the pharmacogenomic tools of spec-v1640
// read them: an index over the shards, the dataset's check date, and the attribution CPIC asks for.
// The page loads the shards through lib/cpic-load.js and the MCP server reads them from disk
// (mcp/cpic-disk.js); both hand the same object here.
//
// CPIC's data usage policy (read October 10, 2026): "All curated content published by CPIC is available
// free of restriction under the CC0 1.0 Universal (CC0 1.0) Public Domain Dedication." CPIC asks that
// content be cited with "the URL, the date accessed, and the version number"; footer() says so.
//
// Pure: no DOM, no network; `now` is passed in.

import { datasetStatus } from './data.js';

export const CPIC_URL = 'https://cpicpgx.org/';
const index = new WeakMap();

// cpicIndex(db) -> null when the tables are missing or past their check date, else the index.
// db: { manifest, allele, rule, gene, rec, guideline, pair, strings } (any table may be absent if unused).
export function cpicIndex(db, now) {
  if (!db || typeof db !== 'object' || !db.manifest) return { ok: false, why: 'The CPIC tables did not load.' };
  const st = datasetStatus(db.manifest, now);
  if (st.status === 'expired' || st.status === 'sample') return { ok: false, why: `The CPIC tables of ${db.manifest.sourceEdition} are past their check date (${db.manifest.expiresOn}).` };
  if (!index.has(db)) {
    const byGene = (rows) => { const m = new Map(); for (const r of rows || []) { if (!m.has(r.gene)) m.set(r.gene, []); m.get(r.gene).push(r); } return m; };
    index.set(db, {
      alleles: byGene(db.allele), rules: byGene(db.rule),
      methods: new Map((db.gene || []).map((g) => [g.gene, g])),
      str: (i) => (db.strings && i !== null && i !== undefined ? db.strings[i] : ''),
    });
  }
  return { ok: true, edition: db.manifest.sourceEdition, fetchedAt: db.manifest.fetchedAt, ...index.get(db) };
}

// The footer CPIC asks for, on every result.
export function footer(ix) {
  return `Source: CPIC (Clinical Pharmacogenetics Implementation Consortium), ${CPIC_URL}, through its database API, CC0. Data version: change log of ${ix.edition}; read ${ix.fetchedAt}. CPIC guidelines and content are subject to updates; confirm the current content at ClinPGx.`;
}

const normName = (s) => String(s ?? '').trim().replace(/\s+/g, '').replace(/>=/g, '≥').replace(/X(?=\d|≥)/g, 'x');

// findAllele(ix, gene, raw) -> the CPIC allele row named by raw, matched without case or spaces, with a
// leading * supplied for a star-allele gene when the reader left it off.
export function findAllele(ix, gene, raw) {
  const rows = ix.alleles.get(gene) || [];
  const q = normName(raw).toLowerCase();
  if (!q) return null;
  const hit = rows.find((a) => normName(a.name).toLowerCase() === q);
  if (hit) return hit;
  if (!q.startsWith('*') && rows.some((a) => a.name.startsWith('*'))) return rows.find((a) => normName(a.name).toLowerCase() === `*${q}`) || null;
  // A variant CPIC names with an alias in brackets ("c.1905+1G>A (*2A)") answers to either part alone,
  // when only one row does.
  const parts = rows.filter((a) => { const m = /^(.*?)\s*\(([^)]+)\)$/.exec(a.name); return m && [m[1], m[2]].some((x) => normName(x).toLowerCase() === q); });
  return parts.length === 1 ? parts[0] : null;
}

// The value of an allele in the gene's lookup key: its activity value for an activity-score gene, else
// its function.
export const keyOf = (ix, gene, a) => ((ix.methods.get(gene) || {}).method === 'ACTIVITY_SCORE' ? a.value : a.fn);

// matchRule(ix, gene, keys) -> the rule whose lookup key is exactly this multiset of keys, or null.
export function matchRule(ix, gene, keys) {
  const want = {};
  for (const k of keys) want[k] = (want[k] || 0) + 1;
  const sig = JSON.stringify(Object.entries(want).sort());
  return (ix.rules.get(gene) || []).find((r) => JSON.stringify(Object.entries(r.key).sort()) === sig) || null;
}
