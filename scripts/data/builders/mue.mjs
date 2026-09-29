// scripts/data/builders/mue.mjs -- spec-v1621 §3.3.
//
// Medicare NCCI medically unlikely edits, all three settings of the newest
// quarter, as one record per code. The files carry codes only (no
// descriptors); row 1 is a quoted multi-line AMA notice and the header has an
// embedded line break ("HCPCS/\nCPT Code"), so columns are mapped by position:
// code, MUE value, adjudication indicator, rationale.

import { findLinks } from '../discover.mjs';
import { zipFind } from '../zip.mjs';
import { decode, parseCsv, skipPreamble } from '../text.mjs';

export const LANDING = 'https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits/medicare-ncci-medically-unlikely-edits-mues';

export const SETTINGS = {
  practitioner: { slug: 'practitioner-services', bounds: { min: 13000, max: 18000 } },
  hospital: { slug: 'facility-outpatient-hospital-services', bounds: { min: 13000, max: 18000 } },
  dme: { slug: 'dme-supplier-services', bounds: { min: 2500, max: 4000 } },
};

const LINK = /\/files\/zip\/medicare-ncci-(\d{4})-q([1-4])-(practitioner-services|facility-outpatient-hospital-services|dme-supplier-services)-mue-table\.zip$/i;
const iso = (d) => d.toISOString().slice(0, 10);

// Quarter N of a year takes effect on its first day; the next quarter's
// tables are posted about a month ahead; a quarter lapses after two quarters.
export function quarterDates(year, q) {
  const month = (q - 1) * 3;
  return {
    effectiveFrom: iso(new Date(Date.UTC(year, month, 1))),
    nextExpected: iso(new Date(Date.UTC(year, month + 3, 1) - 30 * 86400000)),
    expiresOn: iso(new Date(Date.UTC(year, month + 6, 1))),
  };
}

export async function discover(http) {
  const html = await http.getText(LANDING);
  const byQuarter = new Map();
  for (const href of findLinks(html, LINK, LANDING)) {
    const m = LINK.exec(href);
    const k = `${m[1]}-${m[2]}`;
    if (!byQuarter.has(k)) byQuarter.set(k, { year: Number(m[1]), q: Number(m[2]), urls: {} });
    const setting = Object.keys(SETTINGS).find((s) => SETTINGS[s].slug === m[3].toLowerCase());
    byQuarter.get(k).urls[setting] = href;
  }
  // The newest quarter with all three settings posted.
  const complete = [...byQuarter.values()].filter((x) => Object.keys(SETTINGS).every((s) => x.urls[s]));
  complete.sort((a, b) => (a.year - b.year) || (a.q - b.q));
  const pick = complete.at(-1);
  if (!pick) return null;
  return {
    url: pick.urls.practitioner,
    parts: [pick.urls.hospital, pick.urls.dme],
    urls: pick.urls,
    edition: `${pick.year} Q${pick.q}`,
    ...quarterDates(pick.year, pick.q),
  };
}

// settingRows(zipBytes, setting) -> { member, rows: [{ code, mue, mai, rationale }] }.
// The per-setting row bounds are checked here; tests on trimmed fixtures turn them off.
export function settingRows(bytes, setting, { bounds = true } = {}) {
  const hit = zipFind(bytes, /MCR_MUE_\w+_Eff_\d{2}-\d{2}-\d{4}\.csv$/i);
  if (!hit) throw new Error(`mue: no ${setting} CSV member`);
  const { header, rows } = skipPreamble(parseCsv(decode(hit.data, 'latin1')), (r) => /^HCPCS\/\s*CPT Code$/i.test((r[0] || '').trim()));
  if (!/MUE Values/i.test(header[1] || '') || !/Adjudication Indicator/i.test(header[2] || '') || !/Rationale/i.test(header[3] || '')) {
    throw new Error(`mue: ${hit.entry.name} header changed: ${header.join(' | ')}`);
  }
  const out = [];
  for (const r of rows) {
    const code = (r[0] || '').trim();
    if (!/^[A-Z0-9]{5}$/.test(code)) continue;
    const mue = Number((r[1] || '').trim());
    const mai = Number(/^(\d)/.exec((r[2] || '').trim())?.[1]);
    if (!Number.isInteger(mue) || mue < 0 || ![1, 2, 3].includes(mai)) throw new Error(`mue: ${setting} ${code} has MUE "${r[1]}" and indicator "${r[2]}"`);
    out.push({ code, mue, mai, rationale: (r[3] || '').trim() });
  }
  const { min, max } = SETTINGS[setting].bounds;
  if (bounds && (out.length < min || out.length > max)) throw new Error(`mue: ${out.length} ${setting} rows, outside ${min}-${max}`);
  return { member: hit.entry.name, rows: out };
}

export async function parse(bytes, found, { bounds = true } = {}) {
  const members = {};
  const byCode = new Map();
  for (const setting of Object.keys(SETTINGS)) {
    const zip = setting === 'practitioner' ? bytes : found.partBytes[found.urls[setting]];
    const { member, rows } = settingRows(zip, setting, { bounds });
    members[setting] = member;
    for (const { code, ...edit } of rows) {
      if (!byCode.has(code)) byCode.set(code, { code });
      byCode.get(code)[setting] = edit;
    }
  }
  const records = [...byCode.values()].sort((a, b) => a.code.localeCompare(b.code));
  return { records, ancillary: { 'members.json': members } };
}

const edit = (code, setting) => (records) => records.find((r) => r.code === code)[setting].mue;

export default {
  id: 'mue',
  label: 'CMS NCCI medically unlikely edits',
  agency: 'CMS',
  sourceUrl: LANDING,
  cadence: 'quarterly',
  notes: 'Practitioner, outpatient hospital and DME supplier MUE tables, one record per code. mai is the MUE adjudication indicator (1 line edit, 2 date-of-service policy, 3 date-of-service clinical). Codes only; no descriptors.',
  recordBounds: { min: 15000, max: 22000 },
  shardKey: (r) => r.code.slice(0, 2),
  discover,
  parse,
  shape: (r) => (r.practitioner || r.hospital || r.dme ? null : 'a code with no setting'),
  stableCanaries: [
    { label: '99213 practitioner MUE between 1 and 3', value: edit('99213', 'practitioner'), expect: { min: 1, max: 3 } },
  ],
  canaries: {
    '2026 Q4': [
      { label: '99213 practitioner', value: edit('99213', 'practitioner'), expect: 2 },
      { label: '71046 practitioner', value: edit('71046', 'practitioner'), expect: 2 },
      { label: '71046 outpatient hospital', value: edit('71046', 'hospital'), expect: 3 },
    ],
  },
};
