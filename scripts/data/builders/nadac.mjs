// scripts/data/builders/nadac.mjs -- spec-v1621 §3.5.
//
// NADAC (National Average Drug Acquisition Cost), the latest weekly file only,
// from the data.medicaid.gov datastore API. Each year is a new dataset, found
// by its exact title in the metastore; in early January, before the new
// year's dataset has rows, the prior year's is used. The weekly CSV URL
// changes every week, so it is never hardcoded.
//
// Pages are sorted by NDC so offsets are stable, and every page is fetched and
// hashed as one edition (run.mjs `parts`).

const API = 'https://data.medicaid.gov/api/1';
export const METASTORE = `${API}/metastore/schemas/dataset/items`;
export const PAGE = 5000; // 8,000 works and 10,000 fails; 5,000 leaves margin
const TITLE = (year) => `NADAC (National Average Drug Acquisition Cost) ${year}`;
const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (s, n) => iso(new Date(Date.parse(`${s}T00:00:00Z`) + n * 86400000));

const qs = (params) => Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
export function pageUrl(id, asOf, offset) {
  return `${API}/datastore/query/${id}/0?${qs({
    limit: PAGE, offset, count: 'true', results: 'true', schema: 'false', keys: 'true',
    'conditions[0][property]': 'as_of_date', 'conditions[0][value]': asOf, 'conditions[0][operator]': '=',
    'sorts[0][property]': 'ndc', 'sorts[0][order]': 'asc',
  })}`;
}

async function json(http, url) {
  return JSON.parse(await http.getText(url));
}

async function latestWeek(http, id) {
  const q = await json(http, `${API}/datastore/query/${id}/0?${qs({ limit: 1, count: 'false', schema: 'false', 'sorts[0][property]': 'as_of_date', 'sorts[0][order]': 'desc' })}`);
  return q.results && q.results[0] ? q.results[0].as_of_date : null;
}

export async function discover(http, now = new Date()) {
  const items = await json(http, METASTORE);
  const year = now.getUTCFullYear();
  for (const y of [year, year - 1]) {
    const item = items.find((x) => x.title === TITLE(y));
    if (!item) continue;
    const asOf = await latestWeek(http, item.identifier);
    if (!asOf) continue;
    const first = await json(http, pageUrl(item.identifier, asOf, 0));
    const count = Number(first.count);
    if (!Number.isInteger(count) || count <= 0) continue;
    const parts = [];
    for (let off = PAGE; off < count; off += PAGE) parts.push(pageUrl(item.identifier, asOf, off));
    return {
      url: pageUrl(item.identifier, asOf, 0),
      parts,
      datasetId: item.identifier,
      count,
      edition: `${asOf} weekly`,
      asOf,
      effectiveFrom: asOf,
      nextExpected: addDays(asOf, 7),
      expiresOn: addDays(asOf, 14),
    };
  }
  return null;
}

const text = (v) => (v == null ? '' : String(v)).trim();
const money = (v) => { const s = text(v); return s === '' ? null : Number(s); };
const date = (v) => { const s = text(v); return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null; };

export function toRecord(r) {
  return {
    ndc: text(r.ndc),
    description: text(r.ndc_description),
    perUnit: money(r.nadac_per_unit),
    effectiveDate: date(r.effective_date),
    pricingUnit: text(r.pricing_unit),
    pharmacyType: text(r.pharmacy_type_indicator),
    otc: text(r.otc) === 'Y',
    explanation: text(r.explanation_code),
    classification: text(r.classification_for_rate_setting),
    genericPerUnit: money(r.corresponding_generic_drug_nadac_per_unit),
    genericEffectiveDate: date(r.corresponding_generic_drug_effective_date),
  };
}

export async function parse(bytes, found) {
  const pages = [bytes, ...(found.parts || []).map((u) => found.partBytes[u])];
  const records = [];
  for (const p of pages) {
    const j = JSON.parse(Buffer.from(p).toString('utf8'));
    for (const r of j.results || []) {
      if (r.as_of_date !== found.asOf) throw new Error(`nadac: a row from ${r.as_of_date} in the ${found.asOf} week`);
      records.push(toRecord(r));
    }
  }
  return { records, ancillary: { 'week.json': { asOfDate: found.asOf, datasetId: found.datasetId, apiCount: found.count } } };
}

export default {
  id: 'nadac',
  label: 'CMS NADAC weekly drug acquisition cost',
  agency: 'CMS',
  sourceUrl: 'https://data.medicaid.gov/nadac',
  cadence: 'weekly',
  notes: 'The latest NADAC week only. effectiveDate is when that NDC\'s rate took effect and is often earlier than the as-of date; a tool may use it for the rate on a fill date only within this week, and says so.',
  recordBounds: { min: 25000, max: 40000 },
  shardKey: (r) => r.ndc.slice(0, 5),
  discover,
  parse,
  shape: (r) => (/^\d{11}$/.test(r.ndc) ? (r.perUnit > 0 ? null : `${r.ndc}: NADAC per unit is not positive`) : `NDC "${r.ndc}" is not 11 digits`),
  stableCanaries: [
    { label: 'row count equals the API count', value: (records, a) => records.length === a['week.json'].apiCount, expect: true },
    { label: 'every NDC is 11 digits', value: (records) => records.every((r) => /^\d{11}$/.test(r.ndc)), expect: true },
    { label: 'every NADAC per unit is positive', value: (records) => records.every((r) => r.perUnit > 0), expect: true },
  ],
  // Weekly data has no per-edition canaries: the stable ones are the check,
  // and a new week is never "an edition nobody recorded".
  canaries: null,
};
