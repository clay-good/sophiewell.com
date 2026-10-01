// scripts/data/builders/asp.mjs -- spec-v1517 (asp-payment-limits), for spec-v1510 tool 1.
//
// The Medicare Part B drug payment limit file of the newest quarter, from the "section 508" CSV in the
// quarterly ZIP: latin-1, a title preamble, then a header row starting "HCPCS Code". The payment limit is
// what CMS posts per HCPCS dosage unit (106% of ASP for most drugs; the file's Notes say where a
// biosimilar add-on of 8% of the reference product's ASP was applied). File names change between
// quarters, so links are found on the landing page, never built. Codes only: the short descriptors are
// dropped (CPT descriptors are the AMA's).

import { findLinks } from '../discover.mjs';
import { zipFind } from '../zip.mjs';
import { decode, parseCsv, skipPreamble, num } from '../text.mjs';
import { quarterDates } from './mue.mjs';

export const LANDING = 'https://www.cms.gov/medicare/payment/part-b-drugs/asp-pricing-files';
const MONTHS = { january: 1, april: 2, july: 3, october: 4 };
// 2026 on: "<month>-<year>-medicare-part-b-payment-limit-files[...].zip"; before: "<month>-<year>-asp-pricing-file[...].zip".
const LINK = /\/files\/zip\/(january|april|july|october)-(\d{4})-(?:medicare-part-b-payment-limit-files|asp-pricing(?:-final)?-file)[^/]*\.zip$/i;
const MONTH_NAME = ['January', 'April', 'July', 'October'];

export async function discover(http) {
  const html = await http.getText(LANDING);
  const found = [];
  for (const href of findLinks(html, LINK, LANDING)) {
    const m = LINK.exec(href);
    found.push({ href, year: Number(m[2]), q: MONTHS[m[1].toLowerCase()] });
  }
  found.sort((a, b) => (a.year - b.year) || (a.q - b.q));
  const pick = found.at(-1);
  if (!pick) return null;
  return { url: pick.href, edition: `${pick.year} Q${pick.q}`, ...quarterDates(pick.year, pick.q) };
}

const MONTH_NUM = { January: 1, February: 2, March: 3, April: 4, May: 5, June: 6, July: 7, August: 8, September: 9, October: 10, November: 11, December: 12 };
const isoOf = (s) => {
  const m = /^([A-Z][a-z]+) (\d{1,2}), (\d{4})$/.exec(s.trim());
  return m && MONTH_NUM[m[1]] ? `${m[3]}-${String(MONTH_NUM[m[1]]).padStart(2, '0')}-${m[2].padStart(2, '0')}` : null;
};

// parse(zipBytes) -> { records: [{ code, dosage, limit, coinsurance, notes }], ancillary: { 'period.json' } }.
export async function parse(bytes, found = {}, { bounds = true } = {}) {
  const hit = zipFind(bytes, /section 508 version of .*Payment Limit File.*\.csv$/i) || zipFind(bytes, /section 508 version of .*ASP Pricing File.*\.csv$/i);
  if (!hit) throw new Error('asp: no section 508 payment limit CSV member');
  const all = parseCsv(decode(hit.data, 'latin1'));
  const period = all.map((r) => (r[0] || '').trim()).find((c) => /^Effective .+ through .+$/.test(c));
  const pm = period && /^Effective (.+) through (.+)$/.exec(period);
  const effectiveFrom = pm && isoOf(pm[1]);
  const effectiveTo = pm && isoOf(pm[2]);
  if (!effectiveFrom || !effectiveTo) throw new Error(`asp: no "Effective ... through ..." line in ${hit.entry.name}`);
  if (found.effectiveFrom && found.effectiveFrom !== effectiveFrom) throw new Error(`asp: the file is effective ${effectiveFrom}, not the ${found.effectiveFrom} its link names`);
  const { header, rows } = skipPreamble(all, (r) => /^HCPCS Code$/i.test((r[0] || '').trim()));
  const h = header.map((c) => (c || '').trim());
  if (h[2] !== 'HCPCS Code Dosage' || h[3] !== 'Payment Limit' || h[4] !== 'Co-insurance Percentage' || h[10] !== 'Notes') {
    throw new Error(`asp: ${hit.entry.name} header changed: ${h.join(' | ')}`);
  }
  const records = [];
  for (const r of rows) {
    const code = (r[0] || '').trim();
    if (!/^[A-Z0-9]{5}$/.test(code)) continue;
    // A few rows post "N/A" and explain the price in Notes (radium-223 is priced from AWP): kept, unpriced.
    const na = /^n\/?a$/i.test((r[3] || '').trim());
    const limit = na ? null : num(r[3]);
    const coinsurance = num(r[4]);
    if (!na && (limit == null || limit < 0)) throw new Error(`asp: ${code} has payment limit "${r[3]}"`);
    if (na && !(r[10] || '').trim()) throw new Error(`asp: ${code} posts no limit and no note`);
    if (coinsurance == null || coinsurance < 0 || coinsurance > 20) throw new Error(`asp: ${code} has coinsurance "${r[4]}"`);
    records.push({ code, dosage: (r[2] || '').trim() || null, limit, coinsurance, notes: (r[10] || '').trim() || null });
  }
  if (bounds && (records.length < 700 || records.length > 1400)) throw new Error(`asp: ${records.length} codes, outside 700-1400`);
  records.sort((a, b) => a.code.localeCompare(b.code));
  return { records, ancillary: { 'period.json': { effectiveFrom, effectiveTo, member: hit.entry.name, quarter: found.edition || null, month: MONTH_NAME[(Number(effectiveFrom.slice(5, 7)) - 1) / 3] || null } } };
}

const limitOf = (code) => (records) => records.find((r) => r.code === code).limit;

export default {
  id: 'asp',
  label: 'CMS Medicare Part B drug payment limits (ASP)',
  agency: 'CMS',
  sourceUrl: LANDING,
  cadence: 'quarterly',
  notes: 'The Part B payment limit per HCPCS dosage unit for the quarter (106% of ASP for most drugs; the Notes column marks a biosimilar add-on of 8% of the reference ASP and inflation-adjusted coinsurance). coinsurance is the file\'s percentage. Codes only; descriptors dropped.',
  recordBounds: { min: 700, max: 1400 },
  shardKey: (r) => r.code.slice(0, 1),
  discover,
  parse,
  shape: (r) => (typeof r.coinsurance === 'number' && (typeof r.limit === 'number' || r.notes) ? null : 'a code without a limit or a note'),
  stableCanaries: [
    { label: 'J9035 bevacizumab limit between $1 and $500 per 10 mg', value: limitOf('J9035'), expect: { min: 1, max: 500 } },
  ],
  canaries: {
    '2026 Q4': [
      { label: 'J9035 bevacizumab', value: limitOf('J9035'), expect: 75.492 },
      { label: 'Q5107 Mvasi', value: limitOf('Q5107'), expect: 28.294 },
    ],
  },
};
