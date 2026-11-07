// spec-v1701 (drug-interaction-kinetics tool 4): which drugs on a list FDA names in Table 1 of its examples of drugs
// that interact with CYP enzymes and transporters, each cell quoted, and every pair where one listed drug is a CYP
// inhibitor or inducer and another is a sensitive or moderate sensitive substrate of the same enzyme.
//
// The table is data/fda-ddi-examples, read weekly from FDA's page (scripts/data/builders/fda-ddi-examples.mjs).
// A drug not found is "not on this edition of FDA's examples", never "no interaction": FDA says the examples "are a
// guide and not considered a comprehensive list". No pair is called safe or unsafe and no action is given.
// Transporter cells are listed per drug and not paired (their legend uses different index drugs and thresholds).
//
// Pure: no DOM, no network; `now` is passed in.

import { datasetStatus } from './data.js';

export const SOURCE_URL = 'https://www.fda.gov/drugs/drug-interactions-labeling/healthcare-professionals-fdas-examples-drugs-interact-cyp-enzymes-and-transporter-systems';

const ROLES = [
  ['strongInhibitor', 'strong inhibitor', 'precipitant'],
  ['moderateInhibitor', 'moderate inhibitor', 'precipitant'],
  ['weakInhibitor', 'weak inhibitor', 'precipitant'],
  ['strongInducer', 'strong inducer', 'precipitant'],
  ['moderateInducer', 'moderate inducer', 'precipitant'],
  ['weakInducer', 'weak inducer', 'precipitant'],
  ['sensitiveSubstrate', 'sensitive substrate', 'substrate'],
  ['moderateSensitiveSubstrate', 'moderate sensitive substrate', 'substrate'],
  ['transporterInhibitor', 'transporter inhibitor', 'transporter'],
  ['transporterSubstrate', 'transporter substrate', 'transporter'],
];

// Words that name a salt, a strength or a dose form rather than the drug.
const NOISE = new Set(['hydrochloride', 'hcl', 'sodium', 'potassium', 'calcium', 'magnesium', 'maleate', 'mesylate', 'besylate', 'succinate', 'tartrate', 'citrate', 'sulfate', 'phosphate', 'acetate', 'fumarate', 'bromide', 'chloride', 'hyclate', 'monohydrate', 'dihydrate', 'trihydrate', 'tablet', 'tablets', 'tab', 'tabs', 'capsule', 'capsules', 'cap', 'caps', 'oral', 'solution', 'suspension', 'injection', 'injectable', 'er', 'xr', 'sr', 'xl', 'cr', 'la', 'dr', 'ec', 'extended', 'delayed', 'release', 'film', 'coated', 'chewable', 'patch', 'cream', 'iv', 'po', 'daily', 'once', 'twice', 'bid', 'tid', 'qd', 'qhs', 'prn']);

// normalize("Clarithromycin 500 mg tablet") -> "clarithromycin"
export function normalize(line) {
  let s = String(line ?? '').toLowerCase();
  s = s.replace(/,.*$/, ''); // a CSV row is read up to its first comma
  s = s.replace(/\(.*?\)/g, ' ');
  s = s.replace(/\b\d+(\.\d+)?\s*(mg|mcg|µg|g|ml|units?|iu|%|mg\/ml|mcg\/hr|mg\/\d+\s*ml)\b.*$/, ' ');
  s = s.replace(/\b\d+(\.\d+)?\b.*$/, ' ');
  const words = s.split(/[^a-z'-]+/).filter((w) => w && !NOISE.has(w));
  return words.join(' ').trim();
}

// key(s) -> the lookup key: normalize() with apostrophes (straight or curly) dropped first, applied the same way to
// FDA's row names and to the reader's lines, so "St. John's wort" finds "St. John’s wort" (spec-v1714).
const key = (s) => normalize(String(s ?? '').replace(/['\u2018\u2019]/g, ''));

const index = new WeakMap();
function build(db) {
  if (index.has(db)) return index.get(db);
  const byName = new Map();
  const byComponent = new Map();
  for (const d of db.drugs || []) {
    byName.set(d.name.toLowerCase(), d);
    const k = key(d.name);
    if (k && !byName.has(k)) byName.set(k, d);
    if (d.components && d.components.length > 1) {
      for (const c of d.components) {
        for (const ck of new Set([c, key(c)])) {
          if (!ck) continue;
          if (!byComponent.has(ck)) byComponent.set(ck, []);
          if (!byComponent.get(ck).includes(d)) byComponent.get(ck).push(d);
        }
      }
    }
  }
  const ix = { byName, byComponent };
  index.set(db, ix);
  return ix;
}

const cellsOf = (d) => ROLES.filter(([k]) => d.cells[k]).map(([k, label, kind]) => ({ key: k, label, kind, ...d.cells[k] }));
const marks = (m) => (m && m.length ? ` [FDA footnote ${m.join(', ')}]` : '');

export function cypListCheck(input = {}, db = null, now = undefined) {
  const o = input && typeof input === 'object' ? input : {};
  const lines = String(o.drugs ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { valid: false, message: 'Enter the medications, one per line (generic names; strengths and dose forms are ignored).' };
  if (lines.length > 200) return { valid: false, message: 'Enter at most 200 medications.' };
  if (!db || !db.manifest || !Array.isArray(db.drugs)) return { valid: false, message: 'FDA\'s examples table did not load, so no drug can be looked up. Reload the page, or read the table at FDA.' };
  const st = datasetStatus(db.manifest, now);
  if (st.status === 'expired' || st.status === 'sample') return { valid: false, message: `FDA's examples table (current as of ${db.manifest.sourceEdition}) was last fetched ${db.manifest.fetchedAt} and is past its check date (${db.manifest.expiresOn}), so this tool does not answer from it. Read the current table at FDA.` };
  const { byName, byComponent } = build(db);
  const edition = db.manifest.sourceEdition;
  const [y, m, d] = String(edition).split('-');
  const editionUs = y && m && d ? `${m}/${d}/${y}` : edition;

  const seen = new Set();
  const found = [];
  const missing = [];
  const look = (raw, k) => {
    const own = byName.get(k) || byName.get(String(raw).trim().toLowerCase());
    const combos = byComponent.get(k) || [];
    if (own) found.push({ input: raw, key: k, row: own, via: null, combos: combos.length });
    else if (combos.length) for (const c of combos) found.push({ input: raw, key: k, row: c, via: k, combos: 0 });
    return Boolean(own || combos.length);
  };
  for (const raw of lines) {
    const k = key(raw);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    if (look(raw, k)) continue;
    // A combination written with a slash ("lopinavir/ritonavir") is looked up by its parts.
    const split = raw.includes('/') ? raw.split('/').map((x) => x.trim()).filter(Boolean) : [];
    const parts = split.length > 1 ? split : [];
    if (parts.length > 1) seen.delete(k); // counted by its parts instead
    for (const part of parts) {
      const pk = key(part);
      if (!pk || seen.has(pk)) continue;
      seen.add(pk);
      if (!look(part, pk)) missing.push(part);
    }
    if (parts.length < 2) missing.push(raw);
  }

  const notes = [];
  const usedMarkers = new Set();
  for (const f of found) {
    const cells = cellsOf(f.row);
    for (const c of cells) for (const n of c.markers || []) usedMarkers.add(n);
    for (const n of f.row.markers || []) usedMarkers.add(n);
    const head = f.via ? `${f.input}: in FDA's combination row "${f.row.name}"` : f.input.toLowerCase() === f.row.name.toLowerCase() ? f.row.name : `${f.input}: ${f.row.name}`;
    notes.push(`${head}${marks(f.row.markers)}. ${cells.map((c) => `${c.label}: ${c.text}${marks(c.markers)}`).join('; ')}.`);
    if (f.combos) notes.push(`${f.row.name} also appears in ${f.combos} combination row${f.combos === 1 ? '' : 's'} of the table.`);
  }

  // Pairs: a CYP inhibitor or inducer and a substrate of the same enzyme, two different drugs on the list.
  const pairs = [];
  for (const a of found) {
    for (const b of found) {
      if (a.key === b.key || a.row === b.row) continue;
      for (const pc of cellsOf(a.row).filter((c) => c.kind === 'precipitant')) {
        for (const sc of cellsOf(b.row).filter((c) => c.kind === 'substrate')) {
          for (const e of (pc.enzymes || []).filter((x) => (sc.enzymes || []).includes(x))) {
            pairs.push({ precipitant: a.row.name, strength: pc.label, substrate: b.row.name, sensitivity: sc.label, enzyme: `CYP${e}` });
          }
        }
      }
    }
  }
  const pairLines = pairs.map((p) => `CYP pair: ${p.precipitant} (${p.enzyme} ${p.strength}) with ${p.substrate} (${p.enzyme} ${p.sensitivity}).`);
  const missLines = missing.map((x) => `${x}: not on this edition of FDA's examples (current as of ${editionUs}). That is not a finding of no interaction.`);
  const footnotes = [...usedMarkers].sort((p, q) => p - q).map((n) => `FDA footnote ${n}: ${(db.footnotes || {})[n] || ''}`);
  const sentence = db.notice && db.notice.sentence ? `FDA: "${db.notice.sentence.charAt(0).toUpperCase()}${db.notice.sentence.slice(1)}"` : 'FDA says its examples are a guide and not a comprehensive list.';
  const nFound = new Set(found.map((f) => f.key)).size;
  return {
    valid: true,
    found: nFound, notFound: missing.length, pairs,
    abnormal: false,
    band: `${nFound} of ${seen.size} on FDA's examples; ${pairs.length} CYP pair${pairs.length === 1 ? '' : 's'} where one is an inhibitor or inducer and another a substrate of the same enzyme.`,
    bandLabel: `${pairs.length} pair${pairs.length === 1 ? '' : 's'}`,
    notes: [...pairLines, ...notes, ...missLines, ...footnotes, `Transporter cells are listed but not paired. FDA table current as of ${editionUs}; fetched ${db.manifest.fetchedAt}.`, sentence],
    note: 'A list of FDA\'s examples and the pairs they form, not an interaction check: no pair is graded or given an action, and a drug missing from FDA\'s examples can still interact.',
  };
}
