// scripts/data/builders/fda-ddi-examples.mjs -- spec-v1701 (drug-interaction-kinetics tool 4).
//
// FDA, "Healthcare Professionals: FDA's Examples of Drugs that Interact with CYP Enzymes and Transporter
// Systems". A US government page (public domain). It is server-rendered HTML with six tables; Table 1, the
// examples, is chosen by its first header cell ("Drug or Other Substance"), never by position, and its eleven
// column headers are checked by name, so a reordered or renamed column fails the build instead of shifting
// every role by one. Footnote markers (<sup>14, 15, 16</sup>) are taken out of each value and kept beside it;
// the footnotes themselves are kept as FDA wrote them. A drug on two rows (aprepitant) is merged. A
// combination row ("lopinavir and ritonavir") keeps FDA's wording and lists its components, so the tool can
// find it from one of them.
//
// The edition is the page's "Content current as of" date. The check date is the fetch plus 14 days, renewed by
// every successful fetch (spec-v1517), and recordBounds fail a parse that loses more than 10% of the 244 drugs
// of the first build.

const PAGE = 'https://www.fda.gov/drugs/drug-interactions-labeling/healthcare-professionals-fdas-examples-drugs-interact-cyp-enzymes-and-transporter-systems';
const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (d, n) => iso(new Date(d.getTime() + n * 86400000));

// The eleven columns, in FDA's order, and what each means.
export const COLUMNS = [
  ['Drug or Other Substance', 'name'],
  ['CYP Strg INH', 'strongInhibitor'],
  ['CYP Mod INH', 'moderateInhibitor'],
  ['CYP WK INH', 'weakInhibitor'],
  ['CYP Strg IND', 'strongInducer'],
  ['CYP Mod IND', 'moderateInducer'],
  ['CYP WK IND', 'weakInducer'],
  ['CYP SENS SUB', 'sensitiveSubstrate'],
  ['CYP Mod SENS SUB', 'moderateSensitiveSubstrate'],
  ['TRNSP INH', 'transporterInhibitor'],
  ['TRNSP SUB', 'transporterSubstrate'],
];

const ENTITY = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', ge: '≥', le: '≤', mdash: '-', ndash: '-' };
const decode = (s) => String(s)
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
  .replace(/&([a-z]+);/gi, (m, n) => (ENTITY[n.toLowerCase()] ?? m));
const clean = (s) => decode(String(s).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

// cell(html) -> { text, markers } with every <sup> marker taken out of the text.
export function cell(html) {
  const markers = [];
  const body = String(html).replace(/<sup[^>]*>([\s\S]*?)<\/sup>/gi, (_, m) => {
    for (const n of clean(m).split(/[,\s]+/)) if (/^\d+$/.test(n)) markers.push(Number(n));
    return ' ';
  });
  return { text: clean(body).replace(/\s+([;,])/g, '$1').replace(/[;,]\s*$/, ''), markers };
}

const ENZYME = /\b(1A2|2A6|2B6|2C8|2C9|2C19|2D6|2E1|3A4|3A5|3A)\b/g;
export const enzymes = (text) => [...new Set([...String(text).matchAll(ENZYME)].map((m) => (m[1] === '3A4' || m[1] === '3A5' ? '3A' : m[1])))];

// components("paritaprevir and ritonavir and (ombitasvir and/or dasabuvir)") -> the four drug names.
export const components = (name) => String(name).toLowerCase().replace(/[()]/g, ' ').split(/\s+and\/or\s+|\s+and\s+/).map((s) => s.trim()).filter(Boolean);

function tablesOf(html) {
  return [...String(html).matchAll(/<table[\s\S]*?<\/table>/gi)].map((m) => m[0]);
}
const rowsOf = (table) => [...table.matchAll(/<tr[\s\S]*?<\/tr>/gi)].map((m) => [...m[0].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) => c[1]));

export async function discover(http, now = new Date()) {
  const html = await http.getText(PAGE);
  const m = /Content current as of:\s*(\d{2})\/(\d{2})\/(\d{4})/.exec(clean(html));
  if (!m) throw new Error('fda-ddi-examples: the page gave no "Content current as of" date');
  return { url: PAGE, edition: `${m[3]}-${m[1]}-${m[2]}`, nextExpected: addDays(now, 7), expiresOn: addDays(now, 14) };
}

export async function parse(bytes, found = {}, { bounds = true } = {}) {
  const html = Buffer.isBuffer(bytes) ? bytes.toString('utf8') : String(bytes);
  const table = tablesOf(html).find((t) => { const r = rowsOf(t); return r.length && clean(r[0][0]) === COLUMNS[0][0]; });
  if (!table) throw new Error('fda-ddi-examples: no table starts with "Drug or Other Substance"');
  const [head, ...body] = rowsOf(table);
  const names = head.map(clean);
  if (names.length !== COLUMNS.length || names.some((n, i) => n !== COLUMNS[i][0])) throw new Error(`fda-ddi-examples: Table 1's columns changed: ${names.join(' | ')}`);
  const byName = new Map();
  for (const r of body) {
    if (r.length !== COLUMNS.length) throw new Error(`fda-ddi-examples: a row has ${r.length} cells, not ${COLUMNS.length}`);
    const name = cell(r[0]);
    if (!name.text) throw new Error('fda-ddi-examples: a row has no drug name');
    const key = name.text.toLowerCase();
    const rec = byName.get(key) || { name: name.text, markers: [], components: components(name.text), cells: {} };
    for (const n of name.markers) if (!rec.markers.includes(n)) rec.markers.push(n);
    for (let i = 1; i < COLUMNS.length; i += 1) {
      const c = cell(r[i]);
      if (!c.text) continue;
      const col = COLUMNS[i][1];
      const prev = rec.cells[col];
      const merged = prev ? { text: `${prev.text}; ${c.text}`, markers: [...new Set([...prev.markers, ...c.markers])] } : c;
      if (!col.startsWith('transporter')) merged.enzymes = enzymes(merged.text);
      rec.cells[col] = merged;
    }
    byName.set(key, rec);
  }
  const records = [...byName.values()].sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
  if (bounds && (records.length < 220 || records.length > 400)) throw new Error(`fda-ddi-examples: ${records.length} drugs, outside 220 to 400 (the first build had 244)`);
  // The footnotes, as FDA wrote them: "Footnotes 1 These drugs ... 2 Bupropion ...".
  const text = clean(html);
  const start = text.indexOf('Footnotes 1 ');
  const footnotes = {};
  if (start !== -1) {
    const tail = text.slice(start + 'Footnotes '.length, text.indexOf('Content current as of', start) === -1 ? undefined : text.indexOf('Content current as of', start));
    const parts = tail.split(/(?:^|\s)(\d{1,2}) (?=[A-Z])/).slice(1);
    for (let i = 0; i + 1 < parts.length; i += 2) {
      const n = Number(parts[i]);
      if (n === Object.keys(footnotes).length + 1) footnotes[n] = parts[i + 1].trim();
      else if (footnotes[n - 1] !== undefined) footnotes[Object.keys(footnotes).length] += ` ${parts[i]} ${parts[i + 1]}`.trimEnd();
    }
  }
  const used = new Set(records.flatMap((r) => [...r.markers, ...Object.values(r.cells).flatMap((c) => c.markers)]));
  for (const n of used) if (!footnotes[n]) throw new Error(`fda-ddi-examples: marker ${n} has no footnote`);
  const notice = /the examples in Table 1 are a guide and not considered a comprehensive list.*?that fit these categories\./.exec(text);
  if (!notice) throw new Error('fda-ddi-examples: the "not considered a comprehensive list" sentence was not found');
  return { records, ancillary: { 'footnotes.json': footnotes, 'notice.json': { sentence: notice[0] } } };
}

const find = (records, name) => records.find((r) => r.name.toLowerCase() === name) || { cells: {} };

export default {
  id: 'fda-ddi-examples',
  label: 'FDA Examples of Drugs that Interact with CYP Enzymes and Transporter Systems (Table 1)',
  agency: 'FDA',
  status: 'public-domain',
  sourceUrl: PAGE,
  cadence: 'weekly',
  notes: 'Table 1 of FDA\'s examples page: each drug\'s CYP inhibitor, inducer and substrate cells with their strength, transporter cells as written, footnote markers and the footnotes. The edition is the page\'s "Content current as of" date; the check date is the fetch plus 14 days.',
  recordBounds: { min: 220, max: 400 },
  shardKey: () => 'drugs',
  renewOnUnchanged: true,
  discover,
  parse,
  shape: (r) => (r.name && r.cells ? null : 'a drug without its name or cells'),
  stableCanaries: [
    { label: 'clarithromycin is a strong CYP3A inhibitor', value: (rs) => (find(rs, 'clarithromycin').cells.strongInhibitor || {}).text, expect: '3A strong inhibitor' },
    { label: 'midazolam is a sensitive CYP3A substrate', value: (rs) => ((find(rs, 'midazolam').cells.sensitiveSubstrate || {}).enzymes || []).join(','), expect: '3A' },
    { label: 'rifampin is a strong CYP3A inducer', value: (rs) => ((find(rs, 'rifampin').cells.strongInducer || {}).enzymes || []).includes('3A'), expect: true },
  ],
  canaries: null,
};
