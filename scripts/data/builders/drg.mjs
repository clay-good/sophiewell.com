// scripts/data/builders/drg.mjs -- spec-v1621 §3.2.
//
// IPPS Table 5: MS-DRG relative weights and mean lengths of stay, from the
// final rule of the newest fiscal year that has taken effect (October 1). A
// published next year is kept beside it as `upcoming.json`, so the table is
// ready the day it takes effect and a tool can say which year it used.
//
// The file is tab-delimited Windows-1252 with a quoted two-line title, and its
// column names carry the year, so columns are mapped by position. A correction
// notice member (`-CN`) is preferred over the final rule (`-F`/`-FR`).

import { findLinks } from '../discover.mjs';
import { zipEntries, zipExtract } from '../zip.mjs';
import { decode, parseCsv, skipPreamble, num } from '../text.mjs';

export const LANDING = 'https://www.cms.gov/medicare/payment/prospective-payment-systems/acute-inpatient-pps';

const fyOf = (href) => { const m = /fy-?(\d{4})-ipps-final-rule-home-page/i.exec(href); return m ? Number(m[1]) : null; };
const iso = (y, m, d) => new Date(Date.UTC(y, m, d)).toISOString().slice(0, 10);

// FY N runs October 1 of N-1 through September 30 of N. The next final rule
// is expected by August 1; the table lapses two years after it took effect.
export function fiscalDates(fy) {
  return { effectiveFrom: iso(fy - 1, 9, 1), nextExpected: iso(fy, 7, 1), expiresOn: iso(fy + 1, 9, 1) };
}

async function tableLink(http, page) {
  const html = await http.getText(page);
  const [zip] = findLinks(html, /\/files\/zip\/fy\d{4}-ipps-f[r]?-table-5\.zip$/i, page);
  return zip || null;
}

export async function discover(http, now = new Date()) {
  const html = await http.getText(LANDING);
  const pages = findLinks(html, /fy-?\d{4}-ipps-final-rule-home-page/i, LANDING).filter(fyOf).sort((a, b) => fyOf(a) - fyOf(b));
  const today = now.toISOString().slice(0, 10);
  const inEffect = pages.filter((p) => fiscalDates(fyOf(p)).effectiveFrom <= today);
  const current = inEffect.at(-1);
  if (!current) return null;
  const url = await tableLink(http, current);
  if (!url) return null;
  const fy = fyOf(current);
  const next = pages.find((p) => fyOf(p) === fy + 1);
  const upcomingUrl = next ? await tableLink(http, next) : null;
  const dates = fiscalDates(fy);
  if (!upcomingUrl) return { url, edition: `FY${fy}`, fy, ...dates };
  // Next year's table is already in hand, so no newer edition is outstanding
  // until the one after it.
  return { url, edition: `FY${fy}`, fy, ...dates, nextExpected: fiscalDates(fy + 1).nextExpected, parts: [upcomingUrl], upcoming: { url: upcomingUrl, edition: `FY${fy + 1}`, fy: fy + 1 } };
}

// parseTable5(zipBytes) -> { member, rows }
export function parseTable5(bytes) {
  const txt = zipEntries(bytes).filter((e) => /table 5\.txt$/i.test(e.name));
  const pick = txt.find((e) => /-CN\b/i.test(e.name)) || txt.find((e) => /-F[R]?\b/i.test(e.name)) || txt[0];
  if (!pick) throw new Error('drg: no Table 5 text member');
  const rows = parseCsv(decode(zipExtract(bytes, pick), 'latin1'), '\t');
  const { header, rows: body } = skipPreamble(rows, (r) => /^MS-DRG\s*$/i.test(r[0] || ''));
  if (header.length < 10 || !/Title/i.test(header[5]) || !/10% Cap/i.test(header[7]) || !/Geometric/i.test(header[8])) {
    throw new Error(`drg: ${pick.name} header changed: ${header.join(' | ')}`);
  }
  const out = [];
  for (const r of body) {
    const drg = (r[0] || '').trim();
    if (!/^\d{3}$/.test(drg)) continue;
    out.push({
      drg,
      mdc: (r[3] || '').trim() || null,
      type: (r[4] || '').trim(),
      title: (r[5] || '').trim(),
      postAcute: /^yes$/i.test((r[1] || '').trim()),
      specialPay: /^yes$/i.test((r[2] || '').trim()),
      weightBeforeCap: num(r[6]),
      relativeWeight: num(r[7]),
      gmlos: num(r[8]),
      amlos: num(r[9]),
    });
  }
  return { member: pick.name, rows: out };
}

export async function parse(bytes, found) {
  const { member, rows } = parseTable5(bytes);
  const ancillary = {};
  if (found.upcoming) {
    const next = parseTable5(found.partBytes[found.upcoming.url]);
    ancillary['upcoming.json'] = { edition: found.upcoming.edition, effectiveFrom: fiscalDates(found.upcoming.fy).effectiveFrom, member: next.member, drgs: next.rows };
  }
  return { records: rows, ancillary, member };
}

const weight = (drg) => (records) => records.find((r) => r.drg === drg).relativeWeight;
const upcomingWeight = (drg) => (_, a) => a['upcoming.json'].drgs.find((r) => r.drg === drg).relativeWeight;

export default {
  id: 'drg',
  label: 'CMS IPPS MS-DRG relative weights (Table 5)',
  agency: 'CMS',
  sourceUrl: LANDING,
  cadence: 'annual',
  notes: 'Table 5 of the IPPS final rule (correction notice when published). relativeWeight is the weight with the 10% cap applied.',
  recordBounds: { min: 740, max: 800 },
  shardKey: (r) => r.drg[0],
  discover,
  parse,
  shape: (r) => (r.relativeWeight === null && !['998', '999'].includes(r.drg) ? 'a payable DRG with no weight' : null),
  stableCanaries: [
    { label: 'DRG 470 weight between 1.5 and 2.5', value: weight('470'), expect: { min: 1.5, max: 2.5 } },
  ],
  canaries: {
    FY2026: [
      { label: 'FY2026 DRG 470', value: weight('470'), expect: 1.9289 },
      { label: 'FY2026 DRG 871', value: weight('871'), expect: 1.9425 },
      { label: 'FY2026 DRG 291', value: weight('291'), expect: 1.2838 },
      { label: 'FY2027 CN DRG 470 (upcoming)', value: upcomingWeight('470'), expect: 1.9563 },
      { label: 'FY2027 CN DRG 871 (upcoming)', value: upcomingWeight('871'), expect: 1.932 },
      { label: 'FY2027 CN DRG 291 (upcoming)', value: upcomingWeight('291'), expect: 1.2685 },
    ],
    FY2027: [
      { label: 'FY2027 CN DRG 470', value: weight('470'), expect: 1.9563 },
      { label: 'FY2027 CN DRG 871', value: weight('871'), expect: 1.932 },
      { label: 'FY2027 CN DRG 291', value: weight('291'), expect: 1.2685 },
    ],
  },
};
