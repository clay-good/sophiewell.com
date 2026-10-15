// scripts/data/builders/aca-ful.mjs -- spec-v1638 tool 18 (medicaid-ful-check), its file mode.
//
// CMS's "ACA Federal Upper Limits" on data.medicaid.gov (dataset
// ce4cf49b-a21b-5a53-bbc3-509414940847, public domain): the federal upper limit (42 CFR 447.514) for
// every NDC of each listed multiple source drug product group. The datastore is cumulative, every month
// back to 2019 (2,280,950 rows in September 2026), so only the newest month is kept. That month is found
// by counting rows for this month and the five before it; year and month are strings in the datastore,
// so a sort on them would be lexical ("9" after "10") and is not used.
//
// The product group carries the weighted average of AMPs, the limit and the "over 175%" flag, the same
// for every NDC in it (checked: 1,547 groups, 19,259 NDCs, none inconsistent, September 2026), so the
// groups are written once to groups.json and each NDC record keeps only its group, package size and
// A-rating. Pages are sorted by NDC so offsets are stable.

export const DATASET = 'ce4cf49b-a21b-5a53-bbc3-509414940847';
const API = 'https://data.medicaid.gov/api/1';
export const PAGE = 5000;
const iso = (y, m, d) => new Date(Date.UTC(y, m - 1, d)).toISOString().slice(0, 10);

const qs = (params) => Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
const month = (y, m) => ({
  'conditions[0][property]': 'year', 'conditions[0][value]': String(y), 'conditions[0][operator]': '=',
  'conditions[1][property]': 'month', 'conditions[1][value]': String(m), 'conditions[1][operator]': '=',
});
export function pageUrl(y, m, offset) {
  return `${API}/datastore/query/${DATASET}/0?${qs({
    limit: PAGE, offset, count: 'true', results: 'true', schema: 'false', keys: 'true', ...month(y, m),
    'sorts[0][property]': 'ndc', 'sorts[0][order]': 'asc',
  })}`;
}
const countUrl = (y, m) => `${API}/datastore/query/${DATASET}/0?${qs({ limit: 1, count: 'true', results: 'false', schema: 'false', ...month(y, m) })}`;

export async function discover(http, now = new Date()) {
  let y = now.getUTCFullYear();
  let m = now.getUTCMonth() + 1;
  for (let i = 0; i < 6; i += 1) {
    const count = Number(JSON.parse(await http.getText(countUrl(y, m))).count);
    if (Number.isInteger(count) && count > 0) {
      const parts = [];
      for (let off = PAGE; off < count; off += PAGE) parts.push(pageUrl(y, m, off));
      const mm = String(m).padStart(2, '0');
      // CMS posts a month's file near the end of that month (September 2026's on September 28), so the
      // next is due a month on and the file lapses two months after its own month began.
      return {
        url: pageUrl(y, m, 0), parts, count, year: y, month: m,
        edition: `${y}-${mm} monthly`,
        effectiveFrom: iso(y, m, 1),
        nextExpected: iso(y, m + 1, 28),
        expiresOn: iso(y, m + 2, 15),
      };
    }
    m -= 1;
    if (m === 0) { m = 12; y -= 1; }
  }
  return null;
}

const text = (v) => (v == null ? '' : String(v)).trim();
const ndc11 = (s) => {
  const p = text(s).split('-');
  return p.length === 3 && p[0].length === 5 && p[1].length === 4 && p[2].length === 2 && p.every((x) => /^\d+$/.test(x)) ? p.join('') : null;
};
const num = (v) => { const s = text(v); return s === '' ? null : Number(s); };

export async function parse(bytes, found) {
  const pages = [bytes, ...(found.parts || []).map((u) => found.partBytes[u])];
  const records = [];
  const groups = {};
  for (const p of pages) {
    const j = JSON.parse(Buffer.from(p).toString('utf8'));
    for (const r of j.results || []) {
      if (text(r.year) !== String(found.year) || text(r.month) !== String(found.month)) throw new Error(`aca-ful: a row from ${r.year}-${r.month} in the ${found.edition} file`);
      const ndc = ndc11(r.ndc);
      if (!ndc) throw new Error(`aca-ful: NDC "${r.ndc}" is not in the 5-4-2 form`);
      const group = text(r.product_group);
      const g = {
        ingredient: text(r.ingredient), strength: text(r.strength), dosage: text(r.dosage), route: text(r.route),
        unit: text(r.mdr_unit_type), weightedAmp: num(r.weighted_average_of_amps), ful: num(r.aca_ful),
        over175: text(r.multiplier_greater_than_175_percent_of_weighted_avg_of_amps) === 'Y',
      };
      const seen = groups[group];
      if (seen && JSON.stringify(seen) !== JSON.stringify(g)) throw new Error(`aca-ful: product group ${group} differs between its NDCs`);
      groups[group] = g;
      records.push({ ndc, group, pkg: num(r.package_size), aRated: text(r.arated) === 'Yes' });
    }
  }
  return { records, ancillary: { 'groups.json': groups, 'month.json': { year: found.year, month: found.month, apiCount: found.count } } };
}

export default {
  id: 'aca-ful',
  label: 'CMS ACA Federal Upper Limits',
  agency: 'CMS',
  sourceUrl: `https://data.medicaid.gov/dataset/${DATASET}`,
  cadence: 'monthly',
  notes: 'The newest month only. One record per 11-digit NDC: its product group, package size and A-rating. groups.json holds each product group\'s ingredient, strength, dosage form, route, unit, weighted average of AMPs, federal upper limit per unit and whether the limit is above 175% of that average.',
  recordBounds: { min: 12000, max: 30000 },
  shardKey: (r) => r.ndc.slice(0, 5),
  discover,
  parse,
  shape: (r) => (/^\d{11}$/.test(r.ndc) && r.group ? null : `${r.ndc}: no 11-digit NDC or no product group`),
  stableCanaries: [
    { label: 'row count equals the API count', value: (records, a) => records.length === a['month.json'].apiCount, expect: true },
    { label: 'every NDC has its product group', value: (records, a) => records.every((r) => a['groups.json'][r.group]), expect: true },
    { label: 'every limit is positive', value: (records, a) => Object.values(a['groups.json']).every((g) => g.ful > 0), expect: true },
    { label: 'a limit not flagged over 175% is 175% of the weighted average AMP', value: (records, a) => Object.values(a['groups.json']).every((g) => g.over175 || Math.abs(g.ful - Math.round(g.weightedAmp * 1.75 * 1e6) / 1e6) < 2e-6), expect: true },
    { label: 'a limit flagged over 175% is above it', value: (records, a) => Object.values(a['groups.json']).every((g) => !g.over175 || g.ful > g.weightedAmp * 1.75), expect: true },
  ],
  canaries: null,
};
