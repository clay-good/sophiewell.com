// scripts/data/builders/asp-ndc.mjs -- spec-v1517 (asp-ndc-hcpcs-crosswalk), for the spec-v1505
// ndc-hcpcs-units backfill.
//
// The CMS ASP NDC-HCPCS crosswalk of the newest quarter: the "section 508" CSV of the ASP crosswalk in the
// quarterly ZIP (latin-1, a title preamble, then a header starting "_<year>_CODE"). One record per NDC:
// its HCPCS code, the code's dosage (the billing unit, "10 MG"), the package size and quantity, and the
// billable units per item and per package. The short descriptor is dropped (CPT descriptors are the
// AMA's); the labeler and drug name are kept so a reader can see the match. Links are found on the
// landing page by name.

import { findLinks } from '../discover.mjs';
import { zipFind } from '../zip.mjs';
import { decode, parseCsv, skipPreamble, num } from '../text.mjs';
import { quarterDates } from './mue.mjs';
import { LANDING } from './asp.mjs';

const MONTHS = { january: 1, april: 2, july: 3, october: 4 };
const LINK = /\/files\/zip\/(january|april|july|october)-(\d{4})-(?:asp-)?ndc-hcpcs-crosswalks?[^/]*\.zip$/i;

export async function discover(http) {
  const html = await http.getText(LANDING);
  const found = [];
  for (const href of findLinks(html, LINK, LANDING)) {
    if (/seasonal|vaccine/i.test(href)) continue;
    const m = LINK.exec(href);
    found.push({ href, year: Number(m[2]), q: MONTHS[m[1].toLowerCase()] });
  }
  found.sort((a, b) => (a.year - b.year) || (a.q - b.q));
  const pick = found.at(-1);
  if (!pick) return null;
  return { url: pick.href, edition: `${pick.year} Q${pick.q}`, ...quarterDates(pick.year, pick.q) };
}

const ndc11 = (s) => {
  const p = String(s || '').trim().split('-');
  return p.length === 3 && p[0].length === 5 && p[1].length === 4 && p[2].length === 2 && p.every((x) => /^\d+$/.test(x)) ? p.join('') : null;
};

export async function parse(bytes, found = {}, { bounds = true } = {}) {
  const hit = zipFind(bytes, /section 508 version of .*\bASP NDC-HCPCS Crosswalk.*\.csv$/i);
  if (!hit) throw new Error('asp-ndc: no section 508 ASP crosswalk CSV member');
  const all = parseCsv(decode(hit.data, 'latin1'));
  const { header, rows } = skipPreamble(all, (r) => /^_\d{4}_CODE$/i.test((r[0] || '').trim()));
  const h = header.map((c) => (c || '').trim().toUpperCase());
  const want = ['NDC', 'HCPCS DOSAGE', 'PKG SIZE', 'PKG QTY', 'BILLUNITS', 'BILLUNITSPKG'];
  if (h[3] !== 'NDC' || h[5] !== 'HCPCS DOSAGE' || h[6] !== 'PKG SIZE' || h[7] !== 'PKG QTY' || h[8] !== 'BILLUNITS' || h[9] !== 'BILLUNITSPKG') {
    throw new Error(`asp-ndc: ${hit.entry.name} header changed: ${h.join(' | ')} (want ${want.join(', ')} at 3 and 5-9)`);
  }
  const byNdc = new Map();
  const skipped = [];
  let seen = 0;
  for (const r of rows) {
    const code = (r[0] || '').trim();
    if (!/^[A-Z0-9]{5}$/.test(code)) continue;
    seen += 1;
    const ndc = ndc11(r[3]);
    // A device billed under a drug code can carry another product number (J7331 lists a 12-digit one):
    // skipped and named, never guessed into an NDC.
    if (!ndc) { skipped.push({ code, id: (r[3] || '').trim() }); continue; }
    const rec = {
      ndc, code, labeler: (r[2] || '').trim(), drug: (r[4] || '').trim(), dosage: (r[5] || '').trim(),
      pkgSize: num(r[6]), pkgQty: num(r[7]), billUnits: num(r[8]), billUnitsPkg: num(r[9]),
    };
    // An NDC can map to more than one code (a drug billed under two codes): keep every pair.
    if (!byNdc.has(ndc)) byNdc.set(ndc, { ndc, codes: [] });
    const { ndc: _n, ...pair } = rec;
    byNdc.get(ndc).codes.push(pair);
  }
  if (skipped.length > Math.max(1, seen / 100)) throw new Error(`asp-ndc: ${skipped.length} of ${seen} rows have no 5-4-2 NDC`);
  const records = [...byNdc.values()].sort((a, b) => a.ndc.localeCompare(b.ndc));
  if (bounds && (records.length < 5000 || records.length > 12000)) throw new Error(`asp-ndc: ${records.length} NDCs, outside 5000-12000`);
  return { records, ancillary: { 'member.json': { member: hit.entry.name, quarter: found.edition || null, skipped } } };
}

const unitsOf = (ndc, code) => (records) => records.find((r) => r.ndc === ndc).codes.find((c) => c.code === code).billUnitsPkg;

export default {
  id: 'asp-ndc',
  label: 'CMS ASP NDC-HCPCS crosswalk',
  agency: 'CMS',
  sourceUrl: LANDING,
  cadence: 'quarterly',
  notes: 'One record per 11-digit NDC with each HCPCS code it is billed under: the code\'s dosage (billing unit), package size and quantity, and billable units per item and per package. Descriptors dropped; labeler and drug name kept.',
  recordBounds: { min: 5000, max: 12000 },
  shardKey: (r) => r.ndc.slice(0, 5),
  discover,
  parse,
  shape: (r) => (Array.isArray(r.codes) && r.codes.length && r.codes.every((c) => /^[A-Z0-9]{5}$/.test(c.code)) ? null : 'an NDC without a code'),
  stableCanaries: [
    { label: 'Avastin 400 mg vial bills as J9035, 40 units', value: unitsOf('50242006101', 'J9035'), expect: 40 },
  ],
  canaries: null,
};
