#!/usr/bin/env node
// spec-v1796: a field that names an envelope for a DIFFERENT quantity.
//
// `bound: 'weightKg'` resolves against `lib/bounds.js` on every read, so a declaration cannot fall behind
// the envelope it names ([spec-v1779](../docs/spec-v1779.md)). That indirection is the right mechanism, and
// [spec-v1794](../docs/spec-v1794.md) found it pointed at the wrong quantity sixteen times: ten audiogram
// thresholds in dB declared `bound: 'ageYears'` because the age envelope's ceiling of 130 happened to fit,
// a refractive sphere declared `bound: 'platelets'` scaled by a hundredth, and a proficiency-testing panel
// declared `bound: 'hcg'` as a stand-in for "some analyte, some unit". Each published a floor of 0 that the
// quantity does not have, so an agent could not send the -10 dB HL a good ear reaches or the -1.25 D of
// ordinary short sight -- values the page answers.
//
// Those sixteen were found one at a time, by `probe-adapter-only-bounds`, and only where the borrowed floor
// happened to be wrong. This asks the question directly, of all of them.
//
// A declaration is accepted on either of two grounds, because either one settles it:
//
//   * THE LIBRARY NAMES IT. The library behind this tool mentions the envelope in its own source, so the
//     declaration restates a rule the tool actually applies. This is the strongest ground there is and it
//     needs no judgment at all.
//   * THE FIELD NAMES IT. The envelope's key appears in the field's argument name, label or unit --
//     `bound: 'platelets'` on a field called `platelets`. The library may guard it with a literal of its
//     own instead of the envelope; the declaration still names the right quantity.
//
// What is left is a field whose own words have nothing to do with the envelope it names, and whose library
// never mentions that envelope either. Each row prints a VERDICT, which is the shape of the fix:
//
//   * RENAME -- an envelope exists whose key the field's own words DO name, so the declaration is one word
//     from being true. This is the whole fix and it keeps the indirection.
//   * LITERAL -- no envelope fits, and the library enforces a range of its own. State that, as a literal:
//     `probe-undeclared-cap` and `probe-declared-cap-configs` then police it.
//   * DROP -- no envelope fits and the library enforces nothing, so the published range is invented. It
//     documents rather than refuses (`mcp/fields.js` pre-refuses literals only), so nothing is turned away
//     on the agent surface -- but an agent is told a range the tool does not have.
//
// Asserts nothing; prints a report.
//
//   node scripts/probe-borrowed-envelope.mjs
//   node scripts/probe-borrowed-envelope.mjs --all        # the accepted declarations too, with the ground
import { readFileSync, readdirSync } from 'node:fs';
import { allCalculators } from '../mcp/catalog.js';
import { BOUNDS } from '../lib/bounds.js';
import { META } from '../lib/meta.js';
import { computeCalculator } from '../mcp/tools.js';
import { RANGE_SENTENCE } from './lib/range-sentence.mjs';

const ALL = process.argv.includes('--all');
const ADAPTERS = 'mcp/adapters/';
const LIB = 'lib/';

// Each adapter file, the lib modules it imports, and the tool ids it declares. The adapter is where a
// `bound:` is written and the lib modules are where the rule it claims would live.
const libsOf = new Map();
const fileOf = new Map();
for (const a of readdirSync(ADAPTERS).filter((f) => f.endsWith('.js'))) {
  const src = readFileSync(ADAPTERS + a, 'utf8');
  libsOf.set(a, [...src.matchAll(/from '\.\.\/\.\.\/lib\/([\w.-]+\.js)'/g)].map((m) => m[1]));
  for (const m of src.matchAll(/id: '([a-z0-9-]+)'/g)) fileOf.set(m[1], a);
}
const libCache = new Map();
const libSrc = (f) => {
  if (!libCache.has(f)) {
    try { libCache.set(f, readFileSync(LIB + f, 'utf8')); } catch { libCache.set(f, ''); }
  }
  return libCache.get(f);
};

// A field's own vocabulary, as WORDS. The first draft of this matched the envelope key as a SUBSTRING of
// the field's argument and label, and was absurd in both directions at once: `rr` matched "cu(rr)entCr",
// `alt` matched "tot(alt)ime in minutes", `ast` matched "w(ast)e", `ph` matched "(ph)armacists". It called a
// creatinine a respiratory rate and a staff count a pH, and the same looseness quietly ACCEPTED real
// borrowings on the other side. Words, then, split at camelCase boundaries and at anything that is not a
// letter or a digit.
const words = (...parts) => new Set(
  parts.filter(Boolean).join(' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean),
);

// What each envelope is CALLED in a field's own words, beyond its key. These are the spellings in use in
// this catalog -- a urine potassium is `urineK`, a creatinine is `currentCr`, a haemoglobin is `hb` -- and
// the table is deliberately explicit rather than clever: a wrong entry here accepts a borrowed envelope
// silently, which is the failure this finder exists to catch. One entry per envelope, keys included.
const ALIASES = {
  sodium: ['na'], potassium: ['k'], chloride: ['cl'], bicarbonate: ['hco3'],
  scr: ['cr', 'creat', 'creatinine'], bun: ['urea'], eGFR: ['egfr', 'gfr', 'filtration'],
  hemoglobin: ['hb', 'hgb'], hematocrit: ['hct'], platelets: ['plt', 'platelet'],
  albumin: ['alb'], bilirubin: ['bili', 'tbili'], inr: ['inr'],
  alt: ['alanine'], ast: ['aspartate'], wbc: ['leukocyte', 'leukocytes', 'leucocyte', 'white'],
  weightKg: ['weight', 'wt'], heightM: ['height', 'ht'], ageYears: ['age', 'years', 'yr'],
  bmi: ['bmi'], percentWeightLoss: ['loss'], sixMinuteWalkM: ['walk', '6mwd'],
  sbp: ['systolic'], dbp: ['diastolic'], hr: ['pulse', 'heart'], rr: ['respiratory'],
  spo2: ['sao2', 'saturation'], fio2: ['fio2'], paO2: ['pao2'], paCO2: ['paco2'], pH: ['ph'],
  qtMs: ['qt', 'qtc'], gcs: ['gcs'], temperature: ['temp'], glucose: ['glu'],
  lactate: ['lactic'], calcium: [], magnesium: [], phosphate: ['phos'],
  triglycerides: ['tg', 'triglyceride'], esr: ['sedimentation'], baseExcess: [],
  // `mg`, `ca` and `be` are gone from the three above: `mg` is a MASS UNIT and matched every label that
  // states one ("Serum IgG4, mg/dL", a CRP in mg/L), `ca` is a word fragment, and `be` is English -- it
  // matched "...beneficiaries for the cap year (may be ...)". An alias that is also a unit or a common word
  // suggests a rename that is pure coincidence, which is the same mistake the envelopes themselves made.
  hcg: ['bhcg'], daysNoIntake: ['intake'], eosinophils: ['eos'],
};

// THE SAME ANALYTE IN ANOTHER COMPARTMENT IS A DIFFERENT QUANTITY. `lib/bounds.js`'s sodium envelope is a
// SERUM sodium, 90 to 208 mEq/L; a urine sodium of 20 is ordinary. So "urineNa declares bound: 'platelets'"
// is a borrowed envelope and renaming it to `sodium` would only borrow a closer one. These words mark a
// field as measured somewhere other than blood, and an envelope keyed on a blood analyte cannot fit it.
const COMPARTMENT = new Set(['urine', 'urinary', 'pleural', 'csf', 'ascitic', 'ascites', 'dialysate',
  'drain', 'sputum', 'saliva', 'stool', 'fecal', 'synovial', 'peritoneal', 'effusion']);
const BLOOD = new Set(['sodium', 'potassium', 'chloride', 'bicarbonate', 'scr', 'bun', 'albumin',
  'bilirubin', 'glucose', 'calcium', 'magnesium', 'phosphate', 'lactate', 'alt', 'ast', 'wbc',
  'hemoglobin', 'hematocrit', 'platelets', 'triglycerides', 'esr', 'hcg', 'inr']);

// Does a field's own vocabulary name this envelope? Its key, split into words, or any of its aliases.
const names = (key, f) => {
  const have = words(f.arg, f.label, f.unit);
  const own = [...words(key)].filter((w) => w.length > 1);
  if (own.length && own.every((w) => have.has(w))) return true;
  return (ALIASES[key] || []).some((a) => have.has(a));
};

// The envelope a field's own words DO name, if any -- the RENAME verdict's answer. Longest key first, so
// `percentWeightLoss` wins over `weightKg` on a field about weight loss.
const KEYS = Object.keys(BOUNDS).sort((a, b) => b.length - a.length);
const elsewhere = (f) => [...words(f.arg, f.label, f.unit)].some((w) => COMPARTMENT.has(w));
// A RATIO or an INDEX of two analytes is a third quantity. `bonacini-cds` takes an ALT/AST ratio, whose
// words name both analytes and whose range is neither of theirs.
const derived = (f) => [...words(f.arg, f.label)].some((w) => w === 'ratio' || w === 'index');
// And a unit settles what is left. An envelope states one; where a field states one too and they are not
// the same quantity's, nothing about the numbers can make them fit: `niosh-lifting` reads a load in POUNDS,
// and `apc-payment`'s conversion factor is in "$ per weight unit", whose stray "weight" is what suggested
// the kilogram envelope in the first place.
const UNIT_SAME = [['mmol/l', 'meq/l'], ['yr', 'years'], ['x10^3/ul', '10^9/l'], ['c', '°c']];
// Superscripts and spacing are presentation: BOUNDS.eGFR reads "mL/min/1.73m2" and the field beside it
// "mL/min/1.73 m\u00b2", which are the same unit and were being called different ones.
const SUPER = { '\u00b2': '2', '\u00b3': '3', '\u00b9': '1', '\u2070': '0' };
const unitKey = (u) => String(u || '').toLowerCase().replace(/[\u00b2\u00b3\u00b9\u2070]/g, (c) => SUPER[c])
  .replace(/[^a-z0-9/.]/g, '');
const unitFits = (key, f) => {
  const a = unitKey(f.unit);
  const b = unitKey(BOUNDS[key].unit);
  if (!a || !b) return true;
  if (a === b || a.includes(b) || b.includes(a)) return true;
  return UNIT_SAME.some(([x, y]) => (a === x && b === y) || (a === y && b === x));
};
const fits = (f) => KEYS.find((k) => names(k, f)
  && !(BLOOD.has(k) && (elsewhere(f) || derived(f)))
  && unitFits(k, f)) || null;

// Does the library refuse a value past this field's declared edges, in its own words? That is the LITERAL
// verdict's evidence: there is a rule to state, even though no envelope names it.
const enforcesSomething = (id, f) => {
  const ex = META[id] && META[id].example && META[id].example.fields;
  if (!ex || !Object.prototype.hasOwnProperty.call(ex, f.dom)) return null;
  const base = computeCalculator({ id, inputs: ex });
  if (!base || base.valid !== true) return null;
  for (const v of [1e9, -1e9, 1e-9]) {
    let r;
    try { r = computeCalculator({ id, inputs: { ...ex, [f.dom]: String(v) } }); } catch { return true; }
    if (r && r.valid === false && RANGE_SENTENCE.test(String(r.message || r.band || ''))) return true;
  }
  return false;
};

// A library names an envelope two ways, and the first draft of this looked for only one of them:
// `boundsAdvisory('albumin', v)` passes the key as a STRING, while `albi-grade` and `nafld-fibrosis` write
// `if (albuminDl > BOUNDS.albumin.max)` and quote nothing. Both were reported as borrowing an envelope they
// in fact apply exactly, and chasing that produced three wrong fixes before the real cause showed up.
const mentions = (src, key) => src.includes(`'${key}'`) || src.includes(`"${key}"`)
  || new RegExp(`BOUNDS(?:\\.\\w+)*\\.${key}\\b`).test(src)
  || new RegExp(`\\[\\s*['"\`]${key}['"\`]\\s*\\]`).test(src);

const rows = [];
const accepted = [];
let checked = 0;
for (const t of allCalculators()) {
  for (const f of t.fields || []) {
    if (f.kind !== 'number' || !f.bound || !BOUNDS[f.bound]) continue;
    checked += 1;
    const libs = libsOf.get(fileOf.get(t.id)) || [];
    if (libs.some((l) => mentions(libSrc(l), f.bound))) { accepted.push(`${t.id}\t${f.dom}\t${f.bound}\tthe library names it`); continue; }
    if (names(f.bound, f)) { accepted.push(`${t.id}\t${f.dom}\t${f.bound}\tthe field names it`); continue; }
    const better = fits(f);
    const verdict = better ? `RENAME to ${better}` : (enforcesSomething(t.id, f) ? 'LITERAL' : 'DROP');
    rows.push(`${verdict}\t${t.id}\t${f.dom}\t${f.arg || ''}\t${f.bound}\t${String(f.label || '').slice(0, 44)}`);
  }
}

if (ALL) for (const a of accepted.sort()) console.log(`OK\t${a}`);
for (const r of rows.sort()) console.log(r);
const count = (p) => rows.filter((r) => r.startsWith(p)).length;
console.error(`\n${rows.length} of ${checked} envelope declaration(s) name a quantity the field is not and the library `
  + `never mentions: ${count('RENAME')} name an envelope that does fit, ${count('LITERAL')} have a range of `
  + `their own to state, ${count('DROP')} publish a range nothing enforces.\n`
  + `Reach: ${accepted.length} accepted -- ${accepted.filter((a) => a.endsWith('the library names it')).length} because the `
  + `library names the envelope, ${accepted.filter((a) => a.endsWith('the field names it')).length} because the field does. `
  + `--all lists them.`);
