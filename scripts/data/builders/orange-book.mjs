// scripts/data/builders/orange-book.mjs -- spec-v1517 (orange-book), for spec-v1512 substitution-check.
//
// The FDA Orange Book data files: the monthly ZIP's products.txt (tilde-delimited), one record per
// approved drug product (application number and product number) with its ingredient, dosage form and
// route, strength, trade name, applicant, therapeutic equivalence code, and whether it is the reference
// listed drug or the reference standard. Discontinued products (Type DISCN) carry no TE code and are
// dropped. The edition is the products.txt date inside the ZIP: the landing page's "content current as
// of" date can lag the file by weeks.

import { findLinks } from '../discover.mjs';
import { zipEntries, zipExtract } from '../zip.mjs';
import { decode } from '../text.mjs';

export const LANDING = 'https://www.fda.gov/drugs/drug-approvals-and-databases/orange-book-data-files';
const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (s, n) => iso(new Date(Date.parse(`${s}T00:00:00Z`) + n * 86400000));

export async function discover(http) {
  const html = await http.getText(LANDING);
  // The data-files ZIP is the first /media/<id>/download link on the page (the others are PDFs of the
  // data description and the preface).
  const [href] = findLinks(html, /\/media\/\d+\/download(\?attachment)?$/, LANDING);
  if (!href) return null;
  // The edition is set by parse() from the file's own date; this placeholder is replaced.
  return { url: href, edition: 'pending', expiresOn: null };
}

const shardKey = (r) => (/^[A-Z]/.test(r.ingredient) ? r.ingredient[0] : '_');

const FIELDS = ['Ingredient', 'DF;Route', 'Trade_Name', 'Applicant', 'Strength', 'Appl_Type', 'Appl_No', 'Product_No', 'TE_Code', 'Approval_Date', 'RLD', 'RS', 'Type', 'Applicant_Full_Name'];

export async function parse(bytes, found = {}, { bounds = true } = {}) {
  const entry = zipEntries(bytes).find((e) => /(^|\/)products\.txt$/i.test(e.name));
  if (!entry) throw new Error('orange-book: no products.txt in the ZIP');
  if (!entry.modified) throw new Error('orange-book: products.txt has no date');
  const lines = decode(zipExtract(bytes, entry), 'latin1').split(/\r?\n/).filter((l) => l.trim());
  const header = lines[0].split('~').map((h) => h.trim());
  if (FIELDS.some((f, i) => header[i] !== f)) throw new Error(`orange-book: products.txt header changed: ${header.join(' | ')}`);
  const records = [];
  for (const line of lines.slice(1)) {
    const c = line.split('~').map((x) => x.trim());
    if (c[12] === 'DISCN') continue;
    // A strength can carry FDA's note after "**" (the levothyroxine special situation, a Federal Register
    // determination); it is kept apart so strengths compare as strengths.
    const [strength, ...note] = c[4].split('**');
    records.push({
      ingredient: c[0], form: c[1], trade: c[2], applicant: c[3], strength: strength.replace(/\s+/g, ' ').trim(),
      ...(note.join(' ').replace(/\*/g, '').trim() ? { note: note.join(' ').replace(/\*/g, '').replace(/\s+/g, ' ').trim() } : {}),
      appl: `${c[5]}${c[6]}`, product: c[7], te: c[8], rld: c[10] === 'Yes', rs: c[11] === 'Yes', type: c[12],
    });
  }
  records.sort((a, b) => a.ingredient.localeCompare(b.ingredient) || a.appl.localeCompare(b.appl) || a.product.localeCompare(b.product));
  if (bounds && (records.length < 15000 || records.length > 40000)) throw new Error(`orange-book: ${records.length} products, outside 15000-40000`);
  const date = iso(entry.modified);
  found.edition = `${date.slice(0, 7)} (products.txt of ${date})`;
  found.effectiveFrom = date;
  found.nextExpected = addDays(date, 35);
  // spec-v1517: expiresOn is twice the cadence (two months for a monthly file).
  found.expiresOn = addDays(date, 61);
  // names.json: every trade name and ingredient, to the shards that hold it, so a page can load only those.
  const names = {};
  for (const r of records) for (const n of [r.trade, r.ingredient]) { const k = shardKey(r); (names[n] ||= []).includes(k) || names[n].push(k); }
  return { records, ancillary: { 'names.json': names } };
}

const teOf = (trade, strength) => (records) => (records.find((r) => r.trade === trade && r.strength === strength) || {}).te;

export default {
  id: 'orange-book',
  label: 'FDA Orange Book (approved drug products with therapeutic equivalence evaluations)',
  agency: 'FDA',
  sourceUrl: LANDING,
  cadence: 'monthly',
  notes: 'One record per marketed (Rx or OTC) product from products.txt: ingredient, dosage form and route, strength, trade name, applicant, application and product number, therapeutic equivalence code, and the RLD and RS flags. Discontinued products are dropped. The Orange Book has no NDCs.',
  recordBounds: { min: 15000, max: 40000 },
  shardKey,
  discover,
  parse,
  shape: (r) => (r.ingredient && r.form && r.appl && r.product ? null : 'a product without ingredient, form or application'),
  stableCanaries: [
    { label: 'Lipitor 10 mg is the reference listed drug, rated AB', value: teOf('LIPITOR', 'EQ 10MG BASE'), expect: 'AB' },
  ],
  canaries: null,
};
