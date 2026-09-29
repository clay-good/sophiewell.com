// scripts/data/builders/mpfs.mjs -- spec-v1621 §3.1.
//
// The CMS physician fee schedule relative value file (PPRRVU), its GPCIs and
// its conversion factors, from the newest quarterly release (RVU26D today).
//
// Licensing: the CSV carries AMA CPT short descriptors. The DESCRIPTION column
// is dropped here and never written. Codes, modifiers, RVUs, indicators and
// the conversion factor are public domain.

import { findLinks, newest } from '../discover.mjs';
import { zipFind } from '../zip.mjs';
import { decode, parseCsv, skipPreamble, num } from '../text.mjs';

export const LANDING = 'https://www.cms.gov/medicare/payment/fee-schedules/physician/pfs-relative-value-files';

// The last of the four stacked header rows, asserted so a moved column fails
// the parse instead of shifting every value one place.
export const PPRRVU_HEADER = ['HCPCS', 'MOD', 'DESCRIPTION', 'CODE', 'PAYMENT', 'RVU', 'PE RVU', 'INDICATOR', 'PE RVU', 'INDICATOR', 'RVU', 'TOTAL', 'TOTAL', 'IND', 'DAYS', 'OP', 'OP', 'OP', 'PROC', 'SURG', 'SURG', 'SURG', 'SURG', 'IND', 'BASE', 'FACTOR', 'PROCEDURES', 'FLAG', 'INDICATOR', 'AMOUNT', 'AMOUNT', 'AMOUNT'];

// release key: rvu26d -> [26, 'd', correction?, n]. rvu24ar and rvu24ar1 are
// corrections of rvu24a; rvu25d-0 is a Drupal duplicate-slug suffix.
export function releaseKey(href) {
  const m = /\/rvu(\d{2})([a-d])(r(\d*))?(?:-(\d+))?\/?$/i.exec(href);
  if (!m) return null;
  return { year: 2000 + Number(m[1]), letter: m[2].toLowerCase(), correction: m[3] ? Number(m[4] || 0) + 1 : 0, dup: Number(m[5] || 0), edition: `RVU${m[1]}${m[2].toUpperCase()}${m[3] ? m[3].toUpperCase() : ''}` };
}

export function compareReleases(a, b) {
  const x = releaseKey(a); const y = releaseKey(b);
  return (x.year - y.year) || x.letter.localeCompare(y.letter) || (x.correction - y.correction) || (x.dup - y.dup);
}

const QUARTER_MONTH = { a: 0, b: 3, c: 6, d: 9 };
const iso = (d) => d.toISOString().slice(0, 10);

// Dates for a release: it takes effect on the first day of its quarter, the
// next one is posted about five weeks before the following quarter, and it
// lapses after two quarters (spec-v1517: twice the cadence).
export function releaseDates(key) {
  const eff = new Date(Date.UTC(key.year, QUARTER_MONTH[key.letter], 1));
  const nextQuarter = new Date(Date.UTC(key.year, QUARTER_MONTH[key.letter] + 3, 1));
  const nextExpected = new Date(nextQuarter.getTime() - 35 * 86400000);
  const expires = new Date(Date.UTC(key.year, QUARTER_MONTH[key.letter] + 6, 1));
  return { effectiveFrom: iso(eff), nextExpected: iso(nextExpected), expiresOn: iso(expires) };
}

export async function discover(http) {
  const html = await http.getText(LANDING);
  const releases = findLinks(html, /\/pfs-relative-value-files\/rvu\d{2}[a-d]/i, LANDING).filter(releaseKey);
  const release = newest(releases, compareReleases);
  if (!release) return null;
  const page = await http.getText(release);
  const [zip] = findLinks(page, /\/files\/zip\/rvu\d{2}[a-d][^"']*\.zip$/i, release);
  if (!zip) return null;
  const key = releaseKey(release);
  return { url: zip, release, edition: key.edition, ...releaseDates(key) };
}

function rvuRows(bytes, pattern) {
  const hit = zipFind(bytes, pattern);
  if (!hit) throw new Error(`mpfs: no member matching ${pattern}`);
  const { header, rows } = skipPreamble(parseCsv(decode(hit.data, 'latin1')), (r) => r[0] === 'HCPCS');
  if (header.length !== PPRRVU_HEADER.length || header.some((h, i) => h.trim() !== PPRRVU_HEADER[i])) {
    throw new Error(`mpfs: ${hit.entry.name} header changed: ${header.join(',')}`);
  }
  return rows.filter((r) => /^[A-Z0-9]{5}$/.test(r[0]));
}

const str = (v) => (v || '').trim();

function toRecord(r) {
  const rec = {
    code: r[0],
    ...(str(r[1]) ? { modifier: str(r[1]) } : {}),
    statusCode: str(r[3]),
    workRvu: num(r[5]),
    peRvuNonFacility: num(r[6]),
    ...(str(r[7]) ? { peNonFacilityNa: str(r[7]) } : {}),
    peRvuFacility: num(r[8]),
    ...(str(r[9]) ? { peFacilityNa: str(r[9]) } : {}),
    mpRvu: num(r[10]),
    totalNonFacility: num(r[11]),
    totalFacility: num(r[12]),
    pctc: str(r[13]),
    globalPeriod: str(r[14]),
    multProc: str(r[18]),
    bilatSurg: str(r[19]),
    asstSurg: str(r[20]),
    coSurg: str(r[21]),
    teamSurg: str(r[22]),
  };
  const endo = str(r[24]);
  if (endo) rec.endoBase = endo;
  return rec;
}

function conversionFactor(rows, label) {
  const cfs = new Set(rows.map((r) => str(r[25])));
  if (cfs.size !== 1) throw new Error(`mpfs: ${label} rows carry ${cfs.size} conversion factors`);
  return num([...cfs][0]);
}

export async function parse(bytes, found) {
  const nonQpp = rvuRows(bytes, /PPRRVU\d{4}_\w+_nonQPP\.csv$/i);
  const qpp = rvuRows(bytes, /PPRRVU\d{4}_\w+_QPP\.csv$/i);
  // The QPP file repeats the RVUs for the codes a qualifying APM participant
  // bills; only the conversion factor differs. Prove that rather than assume it,
  // so one record set and two factors are the whole truth.
  const byKey = new Map(nonQpp.map((r) => [`${r[0]}|${r[1]}`, r]));
  for (const r of qpp) {
    const x = byKey.get(`${r[0]}|${r[1]}`);
    if (!x) throw new Error(`mpfs: QPP code ${r[0]} is not in the nonQPP file`);
    for (const i of [5, 6, 8, 10, 11, 12]) if (r[i] !== x[i]) throw new Error(`mpfs: QPP and nonQPP RVUs differ for ${r[0]}`);
  }
  const gpciHit = zipFind(bytes, /GPCI\d{4}\.csv$/i);
  if (!gpciHit) throw new Error('mpfs: no GPCI member');
  const { rows: gRows } = skipPreamble(parseCsv(decode(gpciHit.data, 'latin1')), (r) => /Locality Number/i.test(r[2] || ''));
  const gpci = [];
  for (const r of gRows) {
    if (!str(r[2])) break; // footnotes follow the data
    gpci.push({ mac: str(r[0]), state: str(r[1]), locality: str(r[2]), name: str(r[3]).replace(/\*+$/, ''), workGpci: num(r[4]), peGpci: num(r[5]), mpGpci: num(r[6]) });
  }
  if (gpci.length < 100 || gpci.length > 130) throw new Error(`mpfs: ${gpci.length} GPCI localities, outside 100-130`);
  const cf = {
    conversionFactor: conversionFactor(nonQpp, 'nonQPP'),
    qppConversionFactor: conversionFactor(qpp, 'QPP'),
    effectiveDate: found.effectiveFrom,
    edition: found.edition,
    source: `CMS PFS relative value file ${found.edition}: nonqualifying and qualifying APM conversion factors`,
  };
  return { records: nonQpp.map(toRecord), ancillary: { 'gpci.json': gpci, 'conversion-factor.json': cf } };
}

const rvu = (code, field) => (records) => records.find((r) => r.code === code && !r.modifier)[field];

export default {
  id: 'mpfs',
  label: 'CMS Physician Fee Schedule relative values',
  agency: 'CMS',
  sourceUrl: LANDING,
  cadence: 'quarterly',
  notes: 'PPRRVU nonQPP rows, GPCIs and both conversion factors. AMA CPT short descriptors are dropped at parse. See docs/legal.md.',
  recordBounds: { min: 15000, max: 25000 },
  shardKey: (r) => r.code.slice(0, 2),
  discover,
  parse,
  shape: (r) => (/^[A-Z0-9]{5}$/.test(r.code) && r.statusCode ? null : 'missing code or status'),
  // Every edition: the factor is in a sane range and a common visit's work RVU is plausible.
  stableCanaries: [
    { label: 'conversion factor between $30 and $40', value: (_, a) => a['conversion-factor.json'].conversionFactor, expect: { min: 30, max: 40 } },
    { label: '99213 work RVU between 1.0 and 1.6', value: rvu('99213', 'workRvu'), expect: { min: 1.0, max: 1.6 } },
  ],
  // Per edition, from the release itself. A new edition with none recorded goes to review.
  canaries: {
    RVU26D: [
      { label: 'nonQPP conversion factor', value: (_, a) => a['conversion-factor.json'].conversionFactor, expect: 33.4009 },
      { label: 'QPP conversion factor', value: (_, a) => a['conversion-factor.json'].qppConversionFactor, expect: 33.5675 },
      { label: '99213 work RVU', value: rvu('99213', 'workRvu'), expect: 1.3 },
      { label: '99213 non-facility total', value: rvu('99213', 'totalNonFacility'), expect: 2.85 },
      { label: '99213 facility total', value: rvu('99213', 'totalFacility'), expect: 1.72 },
      { label: '99214 work RVU', value: rvu('99214', 'workRvu'), expect: 1.92 },
    ],
  },
};
