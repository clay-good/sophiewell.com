// scripts/data/builders/cpic.mjs -- spec-v1640 shared machinery, for the CPIC pharmacogenomic tools.
//
// The CPIC database through its public API (PostgREST at api.cpicpgx.org). "All curated content published
// by CPIC is available free of restriction under the CC0 1.0 Universal (CC0 1.0) Public Domain
// Dedication" (clinpgx.org dataUsagePolicy, read October 10, 2026). Seven tables are read and only the
// columns the tools use are kept: allele function, the diplotype-to-phenotype rules (gene_result_lookup
// joined to gene_result), each gene's lookup method, the recommendations (drug named from pair_view),
// the guidelines with their publication years, and the gene-drug pairs without the two PharmGKB columns
// (clinpgxlevel, pgxtesting), which are CC BY-SA and do not ship. Recommendation texts repeat across
// rows, so they are stored once in strings.json and referenced by index. Each recommendation also carries
// the SHA-256 of its own text, so the dose side table of spec-v1640 can tell, with no hashing in the page,
// whether CPIC has reworded the sentence a factor was read from.
//
// The API has no version or ETag. The edition is the newest date in CPIC's change log; the check date
// is the fetch plus 14 days (spec-v1517's rule for a weekly fetched file), renewed by every successful
// fetch even when nothing moved (`renewOnUnchanged`), so a quiet month does not silence the tools.

import { createHash } from 'node:crypto';

export const API = 'https://api.cpicpgx.org/v1';
const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (d, n) => iso(new Date(d.getTime() + n * 86400000));

export const TABLES = {
  allele: `${API}/allele?select=genesymbol,name,clinicalfunctionalstatus,activityvalue&order=genesymbol,name`,
  result: `${API}/gene_result?select=id,genesymbol,result,activityscore&order=id`,
  lookup: `${API}/gene_result_lookup?select=phenotypeid,lookupkey,totalactivityscore,description&order=id`,
  gene: `${API}/gene?select=symbol,lookupmethod,notesondiplotype&order=symbol`,
  recommendation: `${API}/recommendation?select=id,guidelineid,drugid,implications,drugrecommendation,classification,lookupkey,population,comments&order=id`,
  guideline: `${API}/guideline?select=id,name,url,genes,notesonusage&order=id`,
  pair: `${API}/pair_view?select=drugid,drugname,genesymbol,guidelinename,cpiclevel,usedforrecommendation,provisional&order=pairid`,
  publication: `${API}/publication?select=guidelineid,year,pmid&guidelineid=not.is.null&order=guidelineid,year`,
};
const ORDER = Object.keys(TABLES);

export async function discover(http, now = new Date()) {
  const log = JSON.parse(await http.getText(`${API}/change_log?select=date&order=date.desc&limit=1`));
  const edition = log && log[0] && log[0].date;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(edition || '')) throw new Error('cpic: the change log gave no date');
  return {
    url: TABLES[ORDER[0]], parts: ORDER.slice(1).map((k) => TABLES[k]),
    edition, nextExpected: addDays(now, 7), expiresOn: addDays(now, 14),
  };
}

const CLASSES = new Set(['Strong', 'Moderate', 'Optional', 'No Recommendation', 'n/a']);
const text = (v) => (v === null || v === undefined ? '' : String(v));

export async function parse(bytes, found = {}, { bounds = true } = {}) {
  const read = (k) => JSON.parse((k === ORDER[0] ? bytes : found.partBytes[TABLES[k]]).toString('utf8'));
  const t = Object.fromEntries(ORDER.map((k) => [k, read(k)]));
  for (const k of ORDER) if (!Array.isArray(t[k])) throw new Error(`cpic: ${k} is not a list`);
  const strings = []; const at = new Map();
  const s = (v) => { const x = text(v); if (!at.has(x)) { at.set(x, strings.length); strings.push(x); } return at.get(x); };
  const records = [];
  for (const a of t.allele) records.push({ t: 'allele', gene: a.genesymbol, name: a.name, fn: a.clinicalfunctionalstatus ?? null, value: a.activityvalue ?? null });
  const results = new Map(t.result.map((r) => [r.id, r]));
  for (const l of t.lookup) {
    const r = results.get(l.phenotypeid);
    if (!r) throw new Error(`cpic: lookup row names phenotype ${l.phenotypeid}, which gene_result does not hold`);
    records.push({ t: 'rule', gene: r.genesymbol, result: r.result, score: r.activityscore ?? null, key: l.lookupkey, total: l.totalactivityscore ?? null, desc: s(l.description) });
  }
  const used = new Set(records.filter((r) => r.t === 'rule').map((r) => r.gene));
  const drugNames = new Map(t.pair.map((p) => [p.drugid, p.drugname]));
  for (const c of t.recommendation) {
    if (!CLASSES.has(c.classification)) throw new Error(`cpic: unknown classification "${c.classification}"`);
    for (const g of Object.keys(c.lookupkey || {})) used.add(g);
    records.push({
      t: 'rec', guideline: c.guidelineid, drug: drugNames.get(c.drugid) || c.drugid, pop: c.population, key: c.lookupkey,
      impl: Object.fromEntries(Object.entries(c.implications || {}).map(([g, v]) => [g, s(v)])), rec: s(c.drugrecommendation),
      sha: createHash('sha256').update(text(c.drugrecommendation)).digest('hex'), cls: c.classification, comments: s(c.comments),
    });
  }
  for (const g of t.gene) if (used.has(g.symbol)) records.push({ t: 'gene', gene: g.symbol, method: g.lookupmethod, notes: g.notesondiplotype ? s(g.notesondiplotype) : null });
  const years = new Map();
  for (const p of t.publication) { if (!years.has(p.guidelineid)) years.set(p.guidelineid, []); years.get(p.guidelineid).push({ year: p.year, pmid: p.pmid || null }); }
  for (const g of t.guideline) {
    const pubs = (years.get(g.id) || []).filter((p) => p.year);
    records.push({ t: 'guideline', id: g.id, name: g.name, url: g.url, genes: g.genes || [], notes: g.notesonusage ? s(g.notesonusage) : null,
      first: pubs.length ? Math.min(...pubs.map((p) => p.year)) : null, latest: pubs.length ? Math.max(...pubs.map((p) => p.year)) : null,
      pmid: (pubs.filter((p) => p.pmid).at(-1) || {}).pmid || null });
  }
  for (const p of t.pair) records.push({ t: 'pair', drug: p.drugname, gene: p.genesymbol, guideline: p.guidelinename || null, level: p.cpiclevel || null, used: p.usedforrecommendation === 'Yes', provisional: Boolean(p.provisional) });
  const n = (k) => records.filter((r) => r.t === k).length;
  if (bounds) {
    for (const [k, lo] of [['allele', 1000], ['rule', 150], ['rec', 1500], ['guideline', 20], ['pair', 400]]) if (n(k) < lo) throw new Error(`cpic: ${n(k)} ${k} rows, under ${lo}`);
  }
  return { records, ancillary: { 'strings.json': strings } };
}

const find = (records, pred) => records.find(pred) || {};

export default {
  id: 'cpic',
  label: 'CPIC database (Clinical Pharmacogenetics Implementation Consortium)',
  agency: 'CPIC',
  status: 'cc0',
  sourceUrl: 'https://cpicpgx.org/',
  cadence: 'weekly',
  notes: 'Allele function, diplotype-to-phenotype rules, recommendations, guidelines and gene-drug pairs read from the CPIC API (CC0). The PharmGKB columns of pair_view are not kept. The edition is the newest CPIC change-log date; the check date is the fetch plus 14 days.',
  recordBounds: { min: 3000, max: 9000 },
  shardKey: (r) => r.t,
  renewOnUnchanged: true,
  discover,
  parse,
  shape: (r) => (r.t ? null : 'a record without its table'),
  stableCanaries: [
    { label: 'CYP2D6 *4 has activity value 0.0', value: (rs) => find(rs, (r) => r.t === 'allele' && r.gene === 'CYP2D6' && r.name === '*4').value, expect: '0.0' },
    { label: 'CYP2C19 *17 is an increased function allele', value: (rs) => find(rs, (r) => r.t === 'allele' && r.gene === 'CYP2C19' && r.name === '*17').fn, expect: 'Increased function' },
    { label: 'CYP2D6 is looked up by activity score', value: (rs) => find(rs, (r) => r.t === 'gene' && r.gene === 'CYP2D6').method, expect: 'ACTIVITY_SCORE' },
  ],
  canaries: null,
};
