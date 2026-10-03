// scripts/data/builders/mfp-negotiated-prices.mjs -- spec-v1517 route A: Medicare negotiated prices.
//
// CMS, "Selected Drug List and Negotiated Prices (also known as Maximum Fair Prices in Statute)": a ZIP of
// one CSV (and the same data as XLSX), one row per NDC-11 and price period, with its single price per
// 30-day equivalent supply, NDC-9 per-unit price, effective and end dates and the "Type of Update" (End
// Date, Inflation, New NDC, Deselect, Recalc, New IPAY, HCPCS Code Removed).
//
// THE TRAP: rows are added, inflation-updated or deselected, never replaced, so the file is a dated
// history. Every row is kept. A row whose end date falls before its effective date is an NDC dropped
// before its price took effect; it stays in the shard and adds no period to its drug.
//
// The edition is the date in the CSV's own file name (..._20260921.csv). Besides the NDC shard, the run
// writes drugs.js, the per-drug table partd-mfp-price-check imports: the 30-day price is the same for
// every NDC of a drug in a period, so each drug's periods are the union of its NDCs', merged where the
// price is the same. The table is good through December 31 of the newest price year, because the prices
// are adjusted for inflation every January 1.

import { findLinks } from '../discover.mjs';
import { zipEntries, zipExtract } from '../zip.mjs';
import { decode, parseCsv } from '../text.mjs';

export const LANDING = 'https://www.cms.gov/initiatives/medicare-prescription-drug-affordability/overview/medicare-drug-price-negotiation-program/selected-drugs-negotiated-prices';

const COLUMNS = ['IPAY', 'Selected Drug Name', 'Active Ingredient Name or Active Moiety Name', 'NDC-9', 'NDC-11', 'HCPCS Code',
  'MFP Effective Date', 'MFP End Date', 'Single MFP per 30 DES', 'NDC-9 MFP per Unit Price', 'As of Date', 'Type of Update'];

export async function discover(http) {
  const html = await http.getText(LANDING);
  const [href] = findLinks(html, /selected-drug-list-negotiated-prices[^/]*\.zip$/i, LANDING);
  if (!href) return null;
  // The edition is set by parse() from the CSV's file name.
  return { url: href, edition: 'pending', expiresOn: null };
}

// mm/dd/yyyy -> yyyy-mm-dd; '' -> null.
function isoDate(s, what) {
  const t = String(s || '').trim();
  if (!t) return null;
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(t);
  if (!m) throw new Error(`mfp-negotiated-prices: ${what} "${t}" is not mm/dd/yyyy`);
  return `${m[3]}-${m[1]}-${m[2]}`;
}

const money = (s, what) => {
  const t = String(s || '').trim();
  if (!t) return null;
  const n = Number(t.replace(/[$,]/g, ''));
  if (!Number.isFinite(n) || n < 0) throw new Error(`mfp-negotiated-prices: ${what} "${t}" is not an amount`);
  return n;
};

// drugId('ELIQUIS; ELIQUIS SPRINKLE') -> 'eliquis'
export const drugId = (name) => name.split(';')[0].trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const nextDay = (iso) => new Date(Date.parse(`${iso}T00:00:00Z`) + 86400000).toISOString().slice(0, 10);

// drugTable(records) -> [[id, CMS name, first price year, [[effective, end or null, price or null]]]], in file order.
export function drugTable(records) {
  const by = new Map();
  for (const r of records) {
    if (!by.has(r.drug)) by.set(r.drug, { year: r.ipay, periods: [] });
    const d = by.get(r.drug);
    d.year = Math.min(d.year, r.ipay);
    if (r.end && r.end < r.effective) continue;
    d.periods.push([r.effective, r.end, r.per30]);
  }
  const out = [];
  for (const [name, d] of by) {
    const sorted = d.periods.slice().sort((a, b) => a[0].localeCompare(b[0]) || String(a[1] ?? '9999').localeCompare(String(b[1] ?? '9999')));
    const merged = [];
    for (const p of sorted) {
      const last = merged[merged.length - 1];
      // Same price, and touching or overlapping: one period.
      if (last && last[2] === p[2] && (last[1] === null || p[0] <= nextDay(last[1]))) {
        if (last[1] !== null && (p[1] === null || p[1] > last[1])) last[1] = p[1];
      } else merged.push([...p]);
    }
    out.push([drugId(name), name, d.year, merged]);
  }
  const ids = out.map((x) => x[0]);
  const dup = ids.find((id, i) => ids.indexOf(id) !== i);
  if (dup) throw new Error(`mfp-negotiated-prices: two drugs share the id "${dup}"`);
  return out;
}

// The table is good through December 31 of the newest year with a price.
const validThrough = (records) => `${Math.max(...records.filter((r) => r.per30 !== null).map((r) => Number(r.effective.slice(0, 4))))}-12-31`;

export function moduleText(edition, records) {
  const drugs = drugTable(records);
  return '// Written by scripts/data/builders/mfp-negotiated-prices.mjs from the CMS negotiated-prices file.\n'
    + '// Do not edit: the weekly data refresh rewrites it. drugs: [id, CMS name, first price year,\n'
    + '// [[effective, end or null, price per 30-day equivalent supply or null]]].\n'
    + `export const MFP_FILE = ${JSON.stringify({ edition, validThrough: validThrough(records), drugs })};\n`;
}

export async function parse(bytes, found = {}, { bounds = true } = {}) {
  const entry = zipEntries(bytes).find((e) => /\.csv$/i.test(e.name));
  if (!entry) throw new Error('mfp-negotiated-prices: no CSV in the ZIP');
  const dated = /_(\d{4})(\d{2})(\d{2})\.csv$/i.exec(entry.name);
  if (!dated) throw new Error(`mfp-negotiated-prices: the CSV name "${entry.name}" carries no yyyymmdd date`);
  const edition = `${dated[1]}-${dated[2]}-${dated[3]}`;
  const rows = parseCsv(decode(zipExtract(bytes, entry), 'utf8')).filter((r) => r.some((c) => c.trim()));
  const head = rows[0].map((h) => h.trim());
  const col = Object.fromEntries(head.map((h, i) => [h, i]));
  const missing = COLUMNS.filter((c) => !(c in col));
  if (missing.length) throw new Error(`mfp-negotiated-prices: the header lost ${missing.join(', ')}`);
  const get = (r, c) => String(r[col[c]] ?? '').trim();
  const records = [];
  const keys = new Set();
  for (const r of rows.slice(1)) {
    const ndc11 = get(r, 'NDC-11');
    if (!/^\d{5}-\d{4}-\d{2}$/.test(ndc11)) throw new Error(`mfp-negotiated-prices: NDC-11 "${ndc11}" is not 5-4-2`);
    const ipay = Number(get(r, 'IPAY'));
    if (!Number.isInteger(ipay)) throw new Error(`mfp-negotiated-prices: ${ndc11} IPAY "${get(r, 'IPAY')}" is not a year`);
    const rec = {
      key: '', ipay, drug: get(r, 'Selected Drug Name'), ingredient: get(r, 'Active Ingredient Name or Active Moiety Name'),
      ndc9: get(r, 'NDC-9'), ndc11, hcpcs: get(r, 'HCPCS Code') || null,
      effective: isoDate(get(r, 'MFP Effective Date'), `${ndc11} effective date`), end: isoDate(get(r, 'MFP End Date'), `${ndc11} end date`),
      per30: money(get(r, 'Single MFP per 30 DES'), `${ndc11} 30-day price`), perUnit: money(get(r, 'NDC-9 MFP per Unit Price'), `${ndc11} unit price`),
      asOf: isoDate(get(r, 'As of Date'), `${ndc11} as-of date`), type: get(r, 'Type of Update'),
    };
    if (!rec.effective) throw new Error(`mfp-negotiated-prices: ${ndc11} has no effective date`);
    rec.key = `${ndc11}|${rec.effective}|${rec.end ?? ''}`;
    if (keys.has(rec.key)) rec.key += `|${records.length}`;
    keys.add(rec.key);
    records.push(rec);
  }
  if (bounds && (records.length < 300 || records.length > 5000)) throw new Error(`mfp-negotiated-prices: ${records.length} rows, outside 300-5000`);
  found.edition = edition;
  found.effectiveFrom = edition;
  found.expiresOn = validThrough(records);
  return { records, ancillary: { 'drugs.js': moduleText(edition, records) } };
}

export default {
  id: 'mfp-negotiated-prices',
  label: 'Medicare negotiated drug prices',
  agency: 'CMS',
  sourceUrl: LANDING,
  cadence: 'as updated',
  notes: 'One record per NDC-11 and price period, every row of the file kept (it is a dated history): drug, NDC-9 and NDC-11, HCPCS code, effective and end dates, the single price per 30-day equivalent supply, the NDC-9 per-unit price, and the type of update. drugs.js carries the per-drug periods for partd-mfp-price-check.',
  recordBounds: { min: 300, max: 5000 },
  shardKey: () => 'prices',
  discover,
  parse,
  shape: (r) => (r.ndc11 && r.drug && r.effective ? null : 'a row without NDC-11, drug or effective date'),
  stableCanaries: [
    { label: 'Eliquis 00003-0893-21: $231.00 per 30 days from 2026-01-01', value: (rs) => (rs.find((r) => r.ndc11 === '00003-0893-21' && r.effective === '2026-01-01') || {}).per30, expect: 231 },
  ],
  canaries: null,
};
