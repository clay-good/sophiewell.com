// scripts/data/builders/mcd-articles.mjs -- spec-v1517 (mcd-export), for spec-v1505 lcd-diagnosis-check.
//
// The Medicare Coverage Database "current articles" export: a ZIP holding a ZIP of CSV tables. Kept, one
// record per article that lists HCPCS/CPT codes: its id, title and URL, the states its contractors serve,
// its code groups, and its covered and non-covered ICD-10-CM groups (the export already lists every code
// inside a range, flagged B/M/E, so membership is exact), with each group's paragraph as plain text
// (prose rules the tool shows but does not evaluate) and the codes the article asterisks. Dropped: every
// code description (CPT descriptors are the AMA's), revision history and comments. An index file maps each
// code to the articles that list it.

import { zipFind } from '../zip.mjs';
import { decode, parseCsv } from '../text.mjs';

export const URL = 'https://downloads.cms.gov/medicare-coverage-database/downloads/exports/current_article.zip';
export const LANDING = 'https://www.cms.gov/medicare-coverage-database/downloads/downloads.aspx';

// table(zip, name) -> [{ column: value }] for one CSV member.
function table(inner, name) {
  const hit = zipFind(inner, new RegExp(`(^|/)${name}\\.csv$`, 'i'));
  if (!hit) throw new Error(`mcd-articles: no ${name}.csv in the export`);
  const [head, ...rows] = parseCsv(decode(hit.data, 'utf8'));
  const cols = head.map((h) => h.trim());
  return rows.filter((r) => r.length > 1).map((r) => Object.fromEntries(cols.map((c, i) => [c, r[i] ?? ''])));
}

// The paragraph is HTML from the MCD editor: strip tags and entities to readable text, capped.
export function plain(html, cap = 800) {
  const t = String(html || '').replace(/<\s*(br|\/p|\/li)\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, '\'')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/\s+/g, ' ').trim();
  return t.length > cap ? `${t.slice(0, cap - 1).trimEnd()}…` : t;
}

// The export's URL never changes and the data run has no HEAD request: the edition is read from the
// export's own update_period table in parse(), which sets it on `found` before the manifest is written.
export async function discover() {
  return { url: URL, edition: 'weekly', expiresOn: null };
}

const addDays = (iso, n) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);

export async function parse(bytes, found = {}, { bounds = true } = {}) {
  const innerHit = zipFind(bytes, /current_article_csv\.zip$/i);
  if (!innerHit) throw new Error('mcd-articles: no current_article_csv.zip inside the export');
  const inner = innerHit.data;
  const periods = table(inner, 'update_period').map((r) => String(r.end_date || '').slice(0, 10)).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
  const asOf = periods.at(-1);
  if (!asOf) throw new Error('mcd-articles: update_period.csv has no end date');
  Object.assign(found, { edition: `${asOf} weekly`, effectiveFrom: asOf, nextExpected: addDays(asOf, 7), expiresOn: addDays(asOf, 14) });
  const articles = table(inner, 'article');
  const want = ['article_id', 'article_version', 'title', 'date_retired'];
  for (const c of want) if (!(c in (articles[0] || {}))) throw new Error(`mcd-articles: article.csv has no ${c} column`);
  const key = (r) => `${r.article_id}|${r.article_version}`;

  const hcpc = table(inner, 'article_x_hcpc_code');
  const byArticle = new Map();
  const rec = (r) => {
    const k = key(r);
    if (!byArticle.has(k)) byArticle.set(k, { id: r.article_id, version: r.article_version, codes: {}, covered: {}, noncovered: {}, asterisked: [], paragraphs: { codes: {}, covered: {}, noncovered: {} } });
    return byArticle.get(k);
  };
  for (const r of hcpc) {
    const code = r.hcpc_code_id.trim().toUpperCase();
    if (!/^[A-Z0-9]{5}$/.test(code)) continue;
    const a = rec(r); (a.codes[r.hcpc_code_group] ||= []).push(code);
  }
  const keep = new Set(byArticle.keys());
  for (const [name, field, group] of [['article_x_icd10_covered', 'covered', 'icd10_covered_group'], ['article_x_icd10_noncovered', 'noncovered', 'icd10_noncovered_group']]) {
    for (const r of table(inner, name)) {
      if (!keep.has(key(r))) continue;
      const code = r.icd10_code_id.trim().toUpperCase();
      if (!code) continue;
      const a = byArticle.get(key(r)); (a[field][r[group]] ||= []).push(code);
      if (field === 'covered' && r.asterisk === 'Y') a.asterisked.push(code);
    }
  }
  for (const [name, part, group] of [['article_x_hcpc_code_group', 'codes', 'hcpc_code_group'], ['article_x_icd10_covered_group', 'covered', 'icd10_covered_group'], ['article_x_icd10_noncovered_group', 'noncovered', 'icd10_noncovered_group']]) {
    for (const r of table(inner, name)) {
      if (!keep.has(key(r))) continue;
      const t = plain(r.paragraph);
      if (t) byArticle.get(key(r)).paragraphs[part][r[group]] = t;
    }
  }
  // States each article's contractors serve. Some MCD "states" are parts of one (New York downstate,
  // Queens and upstate; Missouri's two halves; Northern and Southern California): read as their state,
  // and kept as a region so the tool can say the article reaches only part of it.
  const PARENT = { DN: 'NY', QN: 'NY', UN: 'NY', EM: 'MO', WM: 'MO', NF: 'CA', SF: 'CA' };
  const regionName = new Map(table(inner, 'state_lookup').map((r) => [r.state_abbrev, r.description]));
  const states = new Map(table(inner, 'state_lookup').map((r) => [r.state_id, r.state_abbrev]));
  const juris = new Map();
  for (const r of table(inner, 'contractor_jurisdiction')) {
    if (r.term_date && r.term_date.trim()) continue;
    const k = `${r.contractor_id}|${r.contractor_type_id}|${r.contractor_version}`;
    if (!juris.has(k)) juris.set(k, new Set());
    if (states.get(r.state_id)) juris.get(k).add(states.get(r.state_id));
  }
  const contractors = new Map(table(inner, 'contractor').map((r) => [`${r.contractor_id}|${r.contractor_type_id}|${r.contractor_version}`, r.contractor_bus_name]));
  const artStates = new Map(); const artMacs = new Map(); const artRegions = new Map();
  for (const r of table(inner, 'article_x_contractor')) {
    if (!keep.has(key(r))) continue;
    const ck = `${r.contractor_id}|${r.contractor_type_id}|${r.contractor_version}`;
    const set = artStates.get(key(r)) || new Set();
    const regions = artRegions.get(key(r)) || new Set();
    for (const s of juris.get(ck) || []) { set.add(PARENT[s] || s); if (PARENT[s]) regions.add(regionName.get(s) || s); }
    artStates.set(key(r), set); artRegions.set(key(r), regions);
    const macs = artMacs.get(key(r)) || new Set(); if (contractors.get(ck)) macs.add(contractors.get(ck)); artMacs.set(key(r), macs);
  }
  const meta = new Map(articles.map((r) => [key(r), r]));
  const records = [];
  for (const [k, a] of byArticle) {
    const m = meta.get(k);
    if (!m || (m.date_retired && m.date_retired.trim())) continue;
    for (const part of ['codes', 'covered', 'noncovered']) for (const g of Object.keys(a[part])) a[part][g] = [...new Set(a[part][g])].sort();
    records.push({
      id: a.id, version: a.version, title: m.title.trim(), displayId: (m.display_id || '').trim() || `A${a.id}`,
      states: [...(artStates.get(k) || [])].sort(), regions: [...(artRegions.get(k) || [])].sort(), contractors: [...(artMacs.get(k) || [])].sort(),
      codes: a.codes, covered: a.covered, noncovered: a.noncovered, asterisked: [...new Set(a.asterisked)].sort(), paragraphs: a.paragraphs,
    });
  }
  records.sort((x, y) => Number(x.id) - Number(y.id));
  if (bounds && (records.length < 400 || records.length > 3000)) throw new Error(`mcd-articles: ${records.length} articles with codes, outside 400-3000`);
  // code -> [[articleId, group], ...]
  const index = {};
  for (const r of records) for (const [g, codes] of Object.entries(r.codes)) for (const c of codes) (index[c] ||= []).push([r.id, g]);
  return { records, ancillary: { 'index.json': index } };
}

const listsCode = (id, code) => (records) => Object.values(records.find((r) => r.id === id).codes).some((g) => g.includes(code));

export default {
  id: 'mcd-articles',
  label: 'CMS Medicare Coverage Database billing and coding articles',
  agency: 'CMS',
  sourceUrl: LANDING,
  cadence: 'weekly',
  notes: 'One record per current article that lists HCPCS/CPT codes: code groups, covered and non-covered ICD-10-CM groups (ranges already listed code by code in the export), group paragraphs as plain text, asterisked codes, and the states its contractors serve. index.json maps each code to [article id, group]. Descriptions dropped.',
  recordBounds: { min: 400, max: 3000 },
  shardKey: (r) => r.id,
  discover,
  parse,
  shape: (r) => (r.title && Object.keys(r.codes).length ? null : 'an article without a title or codes'),
  stableCanaries: [
    { label: 'A52369 lists 29877', value: listsCode('52369', '29877'), expect: true },
  ],
  canaries: null,
};
