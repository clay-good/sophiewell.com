// scripts/data/builders/purple-book.mjs -- spec-v1517 (purple-book), for spec-v1512 substitution-check.
//
// The FDA Purple Book monthly data download (CSV). The file holds two tables with the same header: the
// month's new and updated products, then every licensed biological product. The second (the last header
// row and everything after it) is read. One record per product (BLA and product number): proprietary and
// proper names, license type (351(a), 351(k) Biosimilar, 351(k) Interchangeable), strength, dosage form,
// route, presentation, marketing status and, for a 351(k) product, its reference product. Discontinued
// products are dropped.

import { findLinks } from '../discover.mjs';
import { decode, parseCsv } from '../text.mjs';

export const LANDING = 'https://purplebooksearch.fda.gov/downloads';
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const LINK = /\/PurpleBook\/(\d{4})\/purplebook-search-([a-z]+)-data-download\.csv$/i;
const iso = (d) => d.toISOString().slice(0, 10);

export async function discover(http) {
  const html = await http.getText(LANDING);
  const found = findLinks(html, LINK, LANDING).map((href) => {
    const m = LINK.exec(href);
    return { href, year: Number(m[1]), month: MONTHS.indexOf(m[2].toLowerCase()) + 1 };
  }).filter((x) => x.month > 0).sort((a, b) => (a.year - b.year) || (a.month - b.month));
  const pick = found.at(-1);
  if (!pick) return null;
  const first = new Date(Date.UTC(pick.year, pick.month - 1, 1));
  return {
    url: pick.href, edition: `${pick.year}-${String(pick.month).padStart(2, '0')}`, effectiveFrom: iso(first),
    // FDA posts a month's file about a month after it ends (August's was the newest on October 2, 2026).
    nextExpected: iso(new Date(Date.UTC(pick.year, pick.month + 1, 1))), expiresOn: iso(new Date(Date.UTC(pick.year, pick.month + 3, 1))),
  };
}

const HEAD = ['N/R/U', 'Applicant', 'BLA Number', 'Proprietary Name', 'Proper Name', 'License Type', 'Strength', 'Dosage Form', 'Route of Administration', 'Product Presentation', 'Marketing Status', 'Licensure', 'Approval Date', 'Inter. Approval Date', 'Ref. Product Proper Name', 'Ref. Product Proprietary Name'];

export async function parse(bytes, _found = {}, { bounds = true } = {}) {
  const rows = parseCsv(decode(bytes, 'utf8').replace(/^﻿/, ''));
  const heads = rows.map((r, i) => ((r[0] || '').trim() === 'N/R/U' ? i : -1)).filter((i) => i >= 0);
  if (!heads.length) throw new Error('purple-book: no header row');
  const at = heads.at(-1);
  const h = rows[at].map((c) => (c || '').trim());
  if (HEAD.some((f, i) => h[i] !== f)) throw new Error(`purple-book: header changed: ${h.slice(0, 16).join(' | ')}`);
  const records = [];
  for (const r of rows.slice(at + 1)) {
    const c = r.map((x) => (x || '').trim());
    if (!c[2] || !c[4]) continue;
    if (/^disc/i.test(c[10])) continue;
    records.push({
      bla: c[2], product: c[20] || '', proprietary: c[3], proper: c[4], license: c[5], strength: c[6].replace(/\s+/g, ' '),
      form: c[7], route: c[8], presentation: c[9], marketing: c[10], refProper: c[14], refProprietary: c[15],
    });
  }
  if (bounds && (records.length < 1000 || records.length > 5000)) throw new Error(`purple-book: ${records.length} products, outside 1000-5000`);
  return { records };
}

const licenseOf = (name) => (records) => (records.find((r) => r.proprietary.toLowerCase().startsWith(name)) || {}).license;

export default {
  id: 'purple-book',
  label: 'FDA Purple Book (licensed biological products)',
  agency: 'FDA',
  sourceUrl: LANDING,
  cadence: 'monthly',
  notes: 'One record per marketed licensed biological product from the full listing in the monthly data download: proprietary and proper names, license type, strength, dosage form, route, presentation, marketing status, and the reference product of a 351(k) biosimilar or interchangeable. Discontinued products are dropped.',
  recordBounds: { min: 1000, max: 5000 },
  // Under 2,000 products: one shard, which a page loads whole.
  shardKey: () => 'all',
  discover,
  parse,
  shape: (r) => (r.bla && r.proper && r.license ? null : 'a product without BLA, proper name or license type'),
  stableCanaries: [
    { label: 'Humira is a 351(a) reference product', value: licenseOf('humira'), expect: '351(a)' },
  ],
  canaries: null,
};
