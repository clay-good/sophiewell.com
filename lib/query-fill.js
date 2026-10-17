// spec-v753: turn a plain-language query into filled inputs for any tile in the
// catalog.
//
// lib/query-compute.js does this for 22 tiles, each a hand-written template. It
// stays -- where a template fires it is verified against a unit-tested expected
// value, which nothing here can claim. This module is the other 1500: it reads
// the tile's own field descriptors (dom key, kind, unit, label, enum values)
// out of data/fields/<bucket>.json and matches the query against them.
//
//   queryFill(query, fields) -> { filled, missing, unmatched }
//     filled     { [domKey]: value }  in the field's canonical unit
//     missing    [domKey]             required fields nothing filled, in order
//     unmatched  [string]             query fragments that matched nothing, or
//                                     that matched ambiguously and were vetoed
//
// It never computes and never routes. No model, no network beyond the one
// bucket fetch, no storage. Every rule below is a table lookup or a regex.
//
// THE GOVERNING RULE: a wrong prefill is worse than no prefill. A nurse who
// sees an empty field knows to fill it. A nurse who sees a filled field with
// the wrong number has to notice. So every ambiguity resolves to "leave it
// blank", and the caller shows what was filled and where it came from.

import { bucketFor } from './field-bucket.js';
// Field labels are written for an agent reading a schema, and many run to a
// paragraph of guidance ("Serum creatinine. Above 2 adds 1 to ACEF and 2 to
// ACEF II..."). Only the first sentence identifies the field; the rest is
// commentary, and it is full of numbers that are the SOURCE's thresholds, not
// the reader's values. The pre-rendered tool pages already trim labels this
// way -- same helper, same rule.
import { splitLead } from './long-note.js';

// ---------------------------------------------------------------------------
// Unit canonicalization
//
// The registry's unit strings are not normalized -- '×10⁹/L', 'x10^9/L' and
// '×10³/µL' all appear, as do 'mcg' and 'µg'. Everything is folded to one
// spelling before comparison, on both sides.
// ---------------------------------------------------------------------------

export function canonUnit(unit) {
  if (!unit) return '';
  return String(unit)
    .toLowerCase()
    .replace(/µ|μ/g, 'u')          // micro sign, Greek mu -> u
    .replace(/×/g, 'x')
    .replace(/\^/g, '')            // x10^9 -> x109
    .replace(/⁹/g, '9').replace(/³/g, '3').replace(/⁶/g, '6')
    .replace(/°/g, '')
    .replace(/\s+/g, '')
    .replace(/s$/, '');            // 'years' -> 'year', 'lbs' -> 'lb'
}

// Units that mean the same thing and need no conversion.
const UNIT_ALIASES = new Map([
  // Plurals are listed rather than matched with a trailing `s?`: an optional s
  // on every unit would read "5 ms" as five meters.
  ['lb', 'lb'], ['lbs', 'lb'], ['pound', 'lb'], ['pounds', 'lb'],
  ['kilo', 'kg'], ['kilos', 'kg'], ['kilogram', 'kg'], ['kilograms', 'kg'], ['kg', 'kg'],
  ['in', 'in'], ['inch', 'in'], ['inches', 'in'], ['"', 'in'], ['cm', 'cm'], ['m', 'm'],
  ['ft', 'ft'], ['foot', 'ft'], ['feet', 'ft'],
  ['yr', 'year'], ['yrs', 'year'], ['year', 'year'], ['years', 'year'], ['yo', 'year'], ['y/o', 'year'],
  ['mmhg', 'mmhg'], ['bpm', 'bpm'], ['beat/min', 'bpm'],
  ['breath/min', 'breath/min'], ['rr', 'breath/min'],
  ['mg/dl', 'mg/dl'], ['mmol/l', 'mmol/l'], ['meq/l', 'meq/l'], ['umol/l', 'umol/l'],
  ['g/dl', 'g/dl'], ['g/l', 'g/l'], ['u/l', 'u/l'], ['iu/l', 'iu/l'],
  ['ng/ml', 'ng/ml'], ['mg/l', 'mg/l'], ['ml', 'ml'], ['mg', 'mg'], ['l', 'l'],
  ['%', '%'], ['c', 'c'], ['f', 'f'], ['kg/m2', 'kg/m2'], ['ml/min', 'ml/min'],
  ['hour', 'hour'], ['hours', 'hour'], ['hr', 'hour'], ['hrs', 'hour'], ['h', 'hour'],
  ['min', 'min'], ['mins', 'min'], ['day', 'day'], ['days', 'day'],
  ['x109/l', 'x109/l'], ['x103/ul', 'x109/l'], ['k/ul', 'x109/l'],
]);

function unitKey(unit) {
  const c = canonUnit(unit);
  return UNIT_ALIASES.get(c) || c;
}

// Cross-unit conversions, keyed `from>to`. Only the dimensional cases a bedside
// query actually produces. A pair not listed here is not convertible, and a
// candidate in an unlisted unit simply does not match that field.
const CONVERT = new Map([
  ['lb>kg', (v) => v * 0.45359237],
  ['kg>lb', (v) => v / 0.45359237],
  ['in>cm', (v) => v * 2.54],
  ['cm>in', (v) => v / 2.54],
  ['ft>cm', (v) => v * 30.48],
  ['cm>m', (v) => v / 100],
  ['in>m', (v) => v * 0.0254],
  ['ft>m', (v) => v * 0.3048],
  ['m>in', (v) => v / 0.0254],
  ['m>cm', (v) => v * 100],
  ['f>c', (v) => (v - 32) * 5 / 9],
  ['c>f', (v) => v * 9 / 5 + 32],
]);

// Convert `value` from one unit to another. Returns null when the pair is not
// convertible -- the caller treats that as "this candidate is not for this
// field", never as "close enough".
export function convertUnit(value, from, to) {
  const f = unitKey(from);
  const t = unitKey(to);
  if (!f || !t) return null;
  if (f === t) return value;
  const fn = CONVERT.get(`${f}>${t}`);
  return fn ? fn(value) : null;
}

// ---------------------------------------------------------------------------
// Label -> the words a nurse would actually type
// ---------------------------------------------------------------------------

// Field labels are written out in full ("Serum creatinine"); queries are not
// ("cr 1.4"). This maps a label keyword to the short forms that mean it. Kept
// deliberately small and boring: every entry is an abbreviation in routine
// chart use, not a clever inference.
const ALIASES = new Map([
  ['creatinine', ['cr', 'scr', 'creat']],
  ['sodium', ['na']],
  ['potassium', ['k']],
  ['chloride', ['cl']],
  ['bicarbonate', ['hco3', 'bicarb']],
  ['glucose', ['bg', 'gluc', 'sugar']],
  ['weight', ['wt']],
  ['height', ['ht']],
  ['albumin', ['alb']],
  ['calcium', ['ca']],
  ['magnesium', ['mg']],
  ['hemoglobin', ['hgb', 'hb']],
  ['hematocrit', ['hct']],
  ['platelet', ['plt', 'platelets']],
  ['bilirubin', ['bili', 'tbili']],
  ['temperature', ['temp']],
  ['respiratory', ['rr', 'resp']],
  ['heart', ['hr', 'pulse']],
  ['systolic', ['sbp']],
  ['diastolic', ['dbp']],
  ['saturation', ['sat', 'spo2', 'o2 sat']],
  ['bun', ['urea']],
  ['prior', ['previous', 'past', 'history']],
  ['previous', ['prior', 'past', 'history']],
]);

const STOPWORDS = new Set([
  'the', 'a', 'an', 'of', 'in', 'on', 'at', 'or', 'and', 'to', 'for', 'per',
  'is', 'was', 'has', 'with', 'by', 'from', 'this', 'that', 'any', 'all',
  'patient', 'patients', 'value', 'level', 'levels', 'total', 'score',
  // Labels double as guidance ("Above 2 adds 1 to ACEF"), so the vocabulary of
  // guidance identifies nothing. Without these, a field's terms are half
  // commentary and the wrong field claims the reader's number.
  'above', 'below', 'over', 'under', 'adds', 'add', 'each', 'point', 'points',
  'only', 'term', 'nothing', 'required', 'optional', 'default', 'defaulted',
  'not', 'never', 'always', 'original', 'derived', 'both', 'either', 'one',
  'two', 'three', 'four', 'five', 'per', 'and/or', 'if', 'when', 'where',
]);

// The words that identify a field in free text: the label's content words plus
// their aliases, longest first so "serum creatinine" beats "creatinine".
// Qualifiers that are noise in prose and the whole point in a field label.
// "Current creatinine" and "Baseline creatinine" are the two inputs AKIN
// compares; strip the qualifier from both and they collide, veto each other,
// and neither fills. 280 field pairs across the catalog collide this way.
const QUALIFIERS = new Set([
  'total', 'free', 'direct', 'indirect', 'mean', 'peak', 'trough', 'initial',
  'current', 'baseline', 'prior', 'repeat', 'first', 'second', 'third',
  'highest', 'lowest', 'worst', 'best', 'left', 'right', 'upper', 'lower',
  'systolic', 'diastolic', 'pre', 'post', 'admission', 'discharge',
]);

/**
 * The words that identify a field in free text.
 *
 * @param {object} field
 * @param {object} [opts]
 * @param {boolean} [opts.strict]  keep digits and qualifiers. Used when two
 *   fields on the same tile would otherwise collide -- see queryFill.
 */
const SHORT_TERMS = new Set(['ph']);

export function fieldTerms(field, opts = {}) {
  const raw = foldSubscripts(String(field.l || field.d || '')).replace(/\s*[\u2013\u2014]\s*/g, ' ').replace(/\s+:\s+/g, ' ');
  // Same floor the tool pages use for a field label (build-tool-pages.mjs):
  // "Patient age." IS the whole label, and the default paragraph floor of 20
  // would refuse to split it from the qualification that follows.
  const parts = splitLead(raw, { minLead: 4 });
  // A bracketed glossary is the adapter documenting its own enum for an agent --
  // "Cellularity ... [low = ...; moderate = ...; high = ...]" -- and every one
  // of those option words is a word this field must NOT be identified by. Left
  // in, the extractor reads the glossary's first option instead of the value it
  // was given. Dropped for the same reason "(mg/dL)" is.
  const lead = String(parts ? parts.lead : raw).replace(/\[[^\]]*\]?/g, ' ');
  const label = (opts.strict
    ? lead.replace(/\([^)]*\)/g, ' ')
    : lead
      .replace(/\([^)]*\)/g, ' ')        // drop "(mg/dL)", "(% confidence)"
      // A standalone number in a label is the source's threshold. Digits INSIDE a word are part of its
      // name: stripping them made "PaCO2" "paco" and "HCO3" "hco", so "paco2 30" never filled.
      .replace(/(^|[^a-z0-9])\d+(?:\.\d+)?(?![a-z0-9])/gi, '$1 ')   // a number in a label is the source's
  )
    .replace(/[^a-z0-9\s/-]/gi, ' ')    // threshold, never a word we match on
    .toLowerCase();
  // A negation can be the ONLY thing separating two fields: abc-scale asks
  // about riding an escalator "holding the rail" and "NOT holding the rail",
  // and dropping `not` makes them the same field. Kept in strict mode, which is
  // exactly the mode a collision turns on.
  const NEGATION = new Set(['not', 'non', 'without', 'never', 'no']);
  const words = label.split(/\s+/).filter((w) => {
    if (!w) return false;
    if (opts.strict && NEGATION.has(w)) return true;
    if (STOPWORDS.has(w)) return false;
    // In strict mode a qualifier is the discriminator, not noise.
    //
    // Never applied to a boolean: its criteria already use these words for
    // corroboration (boolTokens/WEAK_WORDS), and stripping them here cost the
    // Wells tiebreak -- "previous DVT" lost the very word that separates
    // "Prior PE or DVT" from "Clinical signs of DVT".
    if (!opts.strict && field.k !== 'bool' && QUALIFIERS.has(w)) return false;
    return true;
  });
  const terms = new Set();
  // A label that is nothing but stopwords ("Value", "Level") leaves no way to
  // name the field. Its dom key usually carries one ("cp-val", "lk-dis-l").
  if (!words.length) {
    for (const w of String(field.d || '').split(/[-_]/)) {
      if (w.length >= 3 && !STOPWORDS.has(w)) terms.add(w.toLowerCase());
    }
    return [...terms].sort((a, b) => b.length - a.length);
  }
  if (words.length) terms.add(words.join(' '));
  // The label's head before its first comma names the field on its own: "Carvedilol CR, total a day" is
  // typed "carvedilol cr 25", and the whole-label term ("carvedilol cr day") cannot match that.
  if (field.k !== 'bool' && lead.includes(',')) {
    const headSet = new Set(lead.split(',')[0].toLowerCase().replace(/[^a-z0-9\s/-]/g, ' ').split(/\s+/));
    let k = 0;
    while (k < words.length && headSet.has(words[k])) k += 1;
    if (k >= 2 && k < words.length) terms.add(words.slice(0, k).join(' '));
  }
  for (const w of words) {
    // Two-letter words are too ambiguous to name a field, except these: "Arterial pH" could not be
    // filled by "ph 7.3", the way a blood gas is written.
    if (w.length >= 3 || SHORT_TERMS.has(w)) terms.add(w);
    for (const alias of ALIASES.get(w) || []) terms.add(alias);
  }
  return [...terms].sort((a, b) => b.length - a.length);
}

// ---------------------------------------------------------------------------
// Negation
// ---------------------------------------------------------------------------

// Words that flip the sense of a criterion mentioned after them. The window is
// short on purpose: "no chest pain, hemoptysis" should not silently negate the
// hemoptysis three words later, so a comma ends the window too.
const NEGATORS = /\b(no|not|non|never|without|denies|denied|negative|absent|afebrile|r\/o|ruled out)\b/;

export function isNegated(query, index) {
  const before = query.slice(0, index);
  const clause = before.split(/[,;.]|\band\b/).pop() || '';
  const window = clause.trim().split(/\s+/).slice(-4).join(' ');
  return NEGATORS.test(window);
}

// ---------------------------------------------------------------------------
// The extractor
// ---------------------------------------------------------------------------

// Not glued to a letter or digit before it, nor to a hyphen inside a word: "cd4 count" read 4, "IL-6"
// read 6 and "CC-0" read 0. A minus sign after a space or at the start still reads ("point c -2").
const NUM = '(?<![a-z0-9.])(?<![a-z0-9]-)(-?\\d+(?:\\.\\d+)?)';

// A unit is only a unit when the word ends there. Without this the optional
// unit group eats the first letter of the NEXT word -- "na 140 cl 104" read the
// `c` of `cl` as degrees Celsius, the conversion to mEq/L failed, and the only
// hit for sodium was dropped on the floor. Every unit match carries it.
const UNIT_END = '(?![a-z0-9/])';

// Every unit spelling the query might use, longest first so 'mg/dl' is tried
// before 'mg'. Built once from the alias table.
const UNIT_PATTERN = [...UNIT_ALIASES.keys()]
  .filter((u) => /^[a-z%/0-9]+$/.test(u))
  .sort((a, b) => b.length - a.length)
  .map((u) => u.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&'))
  .join('|');

// Find every `<term> <number> <unit?>` and `<number> <unit?> <term>` for one
// field's terms. Returns every hit, so the caller can veto when there is more
// than one.
// A term as a regex fragment. A multi-word term is built by dropping stopwords
// from the label ("Bend over and pick up" -> "bend pick up"), but the query
// still HAS those words, so matching the term contiguously can never succeed.
// 325 fields -- a third of every miss in the catalog -- failed on exactly that.
// Allow a couple of filler words between the term's words, bounded so the
// looseness cannot reach across a clause.
const MAX_GAP_WORDS = 3;
function termPattern(term) {
  const esc = (w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const words = String(term).trim().split(/\s+/).filter(Boolean).map(esc);
  if (words.length <= 1) return words[0] || '';
  // A label's own comma comes through when people type it: "Shoulder abduction, left 4". Either that
  // comma or a few gap words, never both: with both, a term ran across a list boundary ("surface 2 icdas
  // code 2, surface 3 icdas code 3" read Surface 2 as 3).
  return words.join(`(?:,|(?:\\s+\\w+){0,${MAX_GAP_WORDS}})\\s+`);
}

function namedHits(query, terms) {
  // "name then value" ("creatinine 1.4") is how clinical shorthand is written,
  // and it wins outright. The reverse order ("1.4 creatinine") is real but rare,
  // and in a run of labs it manufactures a false hit for every analyte: in
  // "na 140 cl 104", the fragment "140 cl" reads as a value for chloride, which
  // vetoed both fields and filled neither. So it is only consulted when the
  // dominant form found nothing at all.
  for (const dir of ['after', 'before']) {
    for (const term of terms) {
      const t = termPattern(term);
      if (!t) continue;
      const re = dir === 'after'
        // A filler word the label's terms dropped may stand between name and value: "calcium score 250",
        // "creatinine level 1.4". It is one word from a closed list, never an open gap.
        ? new RegExp(`\\b${t}\\b(?:\\s+(?:score|level|value|points?|total|count))?\\s*(?:is|of|at)?\\s*[:=]?\\s*${NUM}(?:\\s*(${UNIT_PATTERN})${UNIT_END})?`, 'gi')
        : new RegExp(`${NUM}(?:\\s*(${UNIT_PATTERN})${UNIT_END})?\\s*\\b${t}\\b`, 'gi');
      const hits = [];
      let m;
      while ((m = re.exec(query)) !== null) {
        const value = Number(m[1]);
        if (!Number.isFinite(value)) continue;
        // The start of a range is not a reading: "power grade 0 to 5, grade 3" filled 0.
        if (dir === 'after' && /^\s*(?:to\s+|–\s*|-)-?\d/i.test(query.slice(m.index + m[0].length))) continue;
        hits.push({ value, unit: m[2] || null, index: m.index, raw: m[0].trim(), before: dir === 'before' });
      }
      // The longest term that matches at all decides the field, hit or veto.
      if (hits.length) return hits;
    }
  }
  return [];
}

// Find every `<number> <unit>` whose unit is compatible with the field's unit.
// Used only when the field's own name is absent from the query -- a unit alone
// is weaker evidence, so it must be unique to be trusted.
function unitHits(query, fieldUnit) {
  if (!fieldUnit) return [];
  const hits = [];
  const re = new RegExp(`${NUM}\\s*(${UNIT_PATTERN})${UNIT_END}`, 'gi');
  let m;
  while ((m = re.exec(query)) !== null) {
    const value = Number(m[1]);
    if (!Number.isFinite(value)) continue;
    const converted = convertUnit(value, m[2], fieldUnit);
    if (converted === null) continue;
    hits.push({ value: converted, unit: m[2], index: m.index, raw: m[0].trim() });
  }
  return hits;
}

// Enum values are often codes ('M'/'F', 'Y'/'N'), which no one types. This maps
// a code to the words that mean it. An enum whose values are already words
// ('mild'/'moderate'/'severe') needs nothing here -- it matches directly.
const ENUM_WORDS = new Map([
  ['m', ['male', 'man', 'boy', 'm']],
  ['f', ['female', 'woman', 'girl', 'f']],
  ['male', ['male', 'man', 'boy']],
  ['female', ['female', 'woman', 'girl']],
  ['y', ['yes', 'present']],
  ['n', ['no', 'absent']],
]);


// `<field name> <value>` for an enum: "la grade B", "cad-rads category 3".
// Filler words between the name and the value ("type", "category", "grade",
// "stage", "class") are skipped, because the label usually contains one of them
// already and the reader repeats it.
const ENUM_FILLER = '(?:type|category|grade|stage|class|group|level|score|step|band)?';

function namedEnumHits(query, field, values, terms) {
  const alts = values
    .map((v) => String(v))
    .sort((a, b) => b.length - a.length)
    .map((v) => v.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&').replace(/[-_\s]+/g, '[-_\\s]+'))
    .join('|');
  if (!alts) return [];
  // Separators in a value match one another ("mg m2" is `mg-m2`); longest first, so the shorter value
  // inside it ("mg") does not answer for it.
  const norm = (x) => String(x).toLowerCase().replace(/[-_\s]+/g, '-');
  for (const term of (terms || fieldTerms(field))) {
    const t = termPattern(term);
    if (!t) continue;
    const re = new RegExp(`\\b${t}\\b\\s*${ENUM_FILLER}\\s*[:=]?\\s*(${alts})\\b`, 'gi');
    const hits = [];
    let m;
    while ((m = re.exec(query)) !== null) {
      const match = values.find((v) => norm(v) === norm(m[1]));
      if (match !== undefined) hits.push({ value: match, index: m.index, raw: m[0].trim() });
    }
    if (hits.length) return hits;
  }
  return [];
}

function enumHits(query, field, terms) {
  const values = field.v || [];
  const useTerms = terms || fieldTerms(field);
  const hits = [];

  // A stage or grade enum takes numeric values ("0".."4"), and a bare digit is
  // meaningless on its own -- "2" appears in half the queries that mention a
  // date or a dose. So a numeric enum is read the way a number field is: by its
  // own name, with the value it names, and only when that value is one the
  // field actually offers. "liver stage 2" fills; a stray "2" does not.
  if (values.length && values.every((v) => /^-?\d+(?:\.\d+)?$/.test(String(v)))) {
    const named = namedHits(query, useTerms);
    for (const h of named) {
      const match = values.find((v) => Number(v) === h.value);
      if (match !== undefined) hits.push({ value: match, index: h.index, raw: h.raw });
    }
    return hits;
  }

  // The other short-value enum: a grade or type named by a letter or a roman
  // numeral ("LA grade B", "Strasberg type D", "Kudo pit-pattern type V"). A
  // bare "B" means nothing on its own, so the same rule applies -- the field's
  // own name has to be right next to it.
  const named = namedEnumHits(query, field, values, useTerms);
  if (named.length) return named;

  for (const v of values) {
    const words = ENUM_WORDS.get(String(v).toLowerCase()) || [String(v).toLowerCase()];
    for (const w of words) {
      if (w.length < 2) continue;
      // A value ending in punctuation -- "O-", "3+", "63+" -- has no word
      // boundary after it, so a trailing \\b can never match. Anchor on what is
      // actually there: not a word character.
      // A hyphen, underscore or space inside a value matches any of the three: "very-high" is typed
      // "very high", and when it could not match, "high" inside it answered instead.
      const esc = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/[-_\s]+/g, '[-_\\s]+');
      const tail = /\w$/.test(w) ? '\\b' : '(?!\\w)';
      const re = new RegExp(`\\b${esc}${tail}`, 'i');
      const m = re.exec(query);
      if (m) { hits.push({ value: v, index: m.index, raw: m[0] }); break; }
    }
  }
  // A value found inside a longer value's match is that longer value being read ("high" inside "very
  // high", "solid" inside "part solid", "severe" inside "moderately severe").
  return hits.filter((h) => !hits.some((o) => o !== h && o.index <= h.index
    && h.index + h.raw.length <= o.index + o.raw.length && o.raw.length > h.raw.length));
}


// ---------------------------------------------------------------------------
// Boolean criteria
//
// The riskiest thing this module does. A criterion is one checkbox that moves a
// score, so a false positive changes a risk band silently. Three rules keep it
// honest.
// ---------------------------------------------------------------------------

// Words that appear in dozens of criterion labels and identify nothing on their
// own. Matching one of these is not evidence.
const WEAK_WORDS = new Set([
  'active', 'acute', 'chronic', 'clinical', 'signs', 'sign', 'symptoms', 'past',
  'recent', 'current', 'present', 'prior', 'previous', 'history', 'known',
  'other', 'new', 'old', 'severe', 'mild', 'moderate', 'high', 'low', 'yes',
  'no', 'age', 'sex', 'male', 'female', 'rate', 'time', 'day', 'days', 'week',
  'weeks', 'hour', 'hours', 'year', 'years', 'more', 'less', 'than', 'over',
  'under', 'within', 'first', 'second', 'third', 'need', 'needs', 'requires',
  'required', 'use', 'used', 'using', 'positive', 'abnormal', 'normal',
]);

// A label that states a threshold ("Heart rate > 100", "Age >= 65") is not a
// question about whether the words appear -- it is a question about a number.
// Matching on the words alone made "heart rate 110" and "heart rate 80" both
// tick the box; only one of those is true. Pull the comparison out of the label
// so it can actually be evaluated.
const THRESHOLD = /([<>]=?|≥|≤|>|<)\s*(-?\d+(?:\.\d+)?)/;

export function labelThreshold(label) {
  const m = THRESHOLD.exec(String(label || ''));
  if (!m) return null;
  const op = m[1].replace('≥', '>=').replace('≤', '<=');
  return { op, value: Number(m[2]) };
}

function meets(value, { op, value: bound }) {
  if (op === '>') return value > bound;
  if (op === '>=') return value >= bound;
  if (op === '<') return value < bound;
  if (op === '<=') return value <= bound;
  return null;
}

// The label's own words, split into the ones that can identify a criterion on
// their own and the ones that can only corroborate. Two-letter tokens are
// excluded outright -- "PE" in "wells score for PE" is the name of the tool the
// reader is asking for, not an assertion that PE is the most likely diagnosis.
//
// A weak word cannot qualify a match by itself, but it still COUNTS toward the
// score, which is what separates two criteria that share their strong word:
// "previous DVT" matches `dvt` for both "Clinical signs of DVT" and "Prior PE
// or DVT", and only the second also matches `prior`.
export function boolTokens(field, terms) {
  const all = (terms || fieldTerms(field)).filter((t) => t.length >= 3 && !t.includes(' '));
  return {
    strong: all.filter((t) => !WEAK_WORDS.has(t)),
    weak: all.filter((t) => WEAK_WORDS.has(t)),
  };
}

// Decide one boolean field. Returns a hit, or null to leave it alone.
export function boolHit(query, field, terms) {
  const { strong, weak } = boolTokens(field, terms);
  const matched = [];
  const corroborating = [];
  for (const t of weak) {
    const re = new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (re.test(query)) corroborating.push(t);
  }
  // Every place a strong word appears, not just the first: "vte prophylaxis risk ..., no prior VTE" met
  // "vte" first inside the words that name the calculator, un-negated, and ticked Prior VTE although the
  // reader said no. A criterion that is negated anywhere in the query is left unfilled (see below for
  // a mention that only shares a word with it).
  const negatedAt = (m) => {
    // An explicitly negated criterion is left unfilled rather than set false.
    // Unchecked already means "not asserted", so filling false would add
    // nothing, and treating "denies hemoptysis" as evidence about a DIFFERENT
    // criterion is exactly the guess this module does not make.
    if (isNegated(query, m.index)) return true;
    // An "and" that is part of the criterion's own name does not end the negation: "no clinical and EEG
    // improvement" was read as yes, because the clause was cut at "and" before "EEG".
    {
      const clause = (query.slice(0, m.index).split(/[,;.]/).pop() || '').trim().split(/\s+/).filter(Boolean);
      const own = new Set(String(field.l || '').toLowerCase().match(/[a-z0-9]+/g) || []);
      const neg = clause.findIndex((w) => NEGATORS.test(w));
      if (neg >= 0 && clause.slice(neg + 1).every((w) => own.has(w.toLowerCase().replace(/[^a-z0-9]/g, '')))
        && clause.slice(neg + 1).length > 0) return true;
    }
    // ... or negated after it, in the same clause: "history of ponv: no" was read as yes.
    const rest = (query.slice(m.index + m[0].length).split(/[,;.]/)[0] || '');
    if (/^\s*[:=-]?\s*(no|none|absent|negative|false|denies|denied)\b/i.test(rest)) return true;
    return false;
  };
  // A word that is only ever negated vetoes the criterion. A word negated in one place and not in another
  // ("vte prophylaxis risk ..., no prior VTE") vetoes it too, unless the criterion has another word the
  // query uses and never negates: "no Change in shape" then says nothing about "Change in color", nor "no
  // Brain failure" about "Renal failure" -- that negated mention is a different item sharing a word.
  const wordRe = (t) => new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
  const seen = strong.map((t) => {
    const occurrences = [...query.matchAll(wordRe(t))];
    const free = occurrences.filter((m) => !negatedAt(m));
    return { t, count: occurrences.length, free, negated: occurrences.length - free.length };
  }).filter((x) => x.count > 0);
  if (seen.some((x) => x.negated && !x.free.length)) return null;
  const anchored = seen.some((x) => x.free.length && !x.negated);
  if (!anchored && seen.some((x) => x.negated)) return null;
  for (const x of seen) matched.push({ token: x.t, index: x.free[0].index, count: x.count });
  // A criterion claims the place of its rarest word: "Change in size" and "Change in color" both start
  // with "change", and claiming that shared first word made them one fragment that vetoed both.
  matched.sort((a, b) => a.count - b.count);
  if (matched.length === 0) return null;

  const threshold = labelThreshold(field.l);
  if (threshold) {
    // The words are here; now the number has to agree. Look for a value
    // attached to this field's own name, and require it to satisfy the label's
    // comparison. No number, or a number that fails it, means no fill.
    const hits = namedHits(query, terms || fieldTerms(field));
    if (hits.length !== 1) return null;
    const verdict = meets(hits[0].value, threshold);
    if (verdict !== true) return null;
    return { value: true, index: hits[0].index, raw: hits[0].raw, score: matched.length + corroborating.length };
  }

  return {
    value: true,
    index: matched[0].index,
    raw: matched.map((x) => x.token).join(' '),
    score: matched.length + corroborating.length,
    tokens: matched.map((x) => x.token),
  };
}


// ---------------------------------------------------------------------------
// Compound forms
//
// Two things a nurse writes as one token that the field matcher reads as none:
// a blood pressure ("120/80") and a height in feet and inches ("5'10", "5 ft 10
// in"). Rather than special-case them at every field, rewrite them into the
// long form the matcher already understands, once, up front. Everything
// downstream then works unchanged.
// ---------------------------------------------------------------------------

const FEET_INCHES = /\b(\d)\s*(?:'|’|ft\b|feet\b|foot\b)\s*(\d{1,2}(?:\.\d+)?)\s*(?:"|''|in\b|inch(?:es)?\b)?/;
const FEET_ONLY = /\b(\d)\s*(?:'|’|ft\b|feet\b|foot\b)(?!\s*\d)/;
// A slash pair only reads as a blood pressure inside plausible bedside bounds.
// Outside them it is a date, a ratio, or a dose, and rewriting it would invent
// a reading nobody typed.
const BP_PAIR = /\b(\d{2,3})\s*\/\s*(\d{2,3})\b/;

// Subscript digits are plain digits to a reader: "SaO\u2082" and "sao2" are one word.
const foldSubscripts = (text) => String(text).replace(/[\u2080-\u2089]/g, (c) => String(c.charCodeAt(0) - 0x2080));

export function normalizeQuery(query) {
  // A spaced dash or colon is a separator a label carries ("Forehead \u2014 Area 4", "Group 1 : events
  // 141"); left in, it stood between a field's words and broke the match.
  let q = foldSubscripts(String(query || '').toLowerCase())
    .replace(/\s*[\u2013\u2014]\s*/g, ' ')
    .replace(/\s+:\s+/g, ' ');

  const bp = BP_PAIR.exec(q);
  if (bp) {
    const sys = Number(bp[1]);
    const dia = Number(bp[2]);
    if (sys >= 40 && sys <= 300 && dia >= 20 && dia <= 200 && dia < sys) {
      q = q.replace(BP_PAIR, ` systolic ${sys} mmhg diastolic ${dia} mmhg `);
    }
  }

  const fi = FEET_INCHES.exec(q);
  if (fi) {
    const cm = (Number(fi[1]) * 12 + Number(fi[2])) * 2.54;
    q = q.replace(FEET_INCHES, ` height ${Math.round(cm * 100) / 100} cm `);
  } else {
    const f = FEET_ONLY.exec(q);
    if (f) {
      const cm = Number(f[1]) * 12 * 2.54;
      q = q.replace(FEET_ONLY, ` height ${Math.round(cm * 100) / 100} cm `);
    }
  }

  return q.replace(/\s+/g, ' ').trim();
}

function round(x) {
  return Math.round(x * 1e6) / 1e6;
}

/**
 * Fill what the query says, report what it does not.
 *
 * @param {string} query   the reader's words, verbatim
 * @param {Array}  fields  the tile's rows from data/fields/<bucket>.json
 */
export function queryFill(query, fields) {
  const empty = { filled: {}, missing: [], unmatched: [] };
  if (!query || !Array.isArray(fields) || fields.length === 0) return empty;
  const q = normalizeQuery(query);

  // Which fields need their qualifiers and digits kept. Two fields whose loose
  // terms are identical -- "Current creatinine" and "Baseline creatinine", or
  // "Quadrant 1/2/3/4 pocket depth" -- cannot be told apart, so they veto each
  // other and NEITHER fills. Stripping is there to keep the source's own
  // thresholds out of the terms ("Above 2 adds 1 point"); where it destroys the
  // discriminator instead, it is turned off for those fields only.
  const strictKeys = new Set();
  const groups = new Map();
  {
    const byTerm = new Map();
    for (const f of fields) {
      if (!f || !f.d) continue;
      const key = fieldTerms(f).join('|');
      if (!key) continue;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(f);
      if (byTerm.has(key)) { strictKeys.add(f.d); strictKeys.add(byTerm.get(key)); }
      else byTerm.set(key, f.d);
    }
  }
  const termsFor = (f) => fieldTerms(f, { strict: strictKeys.has(f.d) });

  // Words that belong to a COLLIDING sibling and not to this field. Keeping the
  // qualifier is only half the job: "ride escalator holding rail" still matches
  // "ride an escalator NOT holding the rail" once gaps are allowed, so the
  // unqualified field matches both phrases and vetoes itself. A hit carrying a
  // sibling's exclusive word is a hit on the sibling's phrase.
  const foreignWords = new Map();
  for (const [key, members] of groups) {
    if (members.length < 2) continue;
    const wordsOf = (f) => new Set(fieldTerms(f, { strict: true })
      .flatMap((t) => t.split(/\s+/)).filter(Boolean));
    const sets = new Map(members.map((f) => [f.d, wordsOf(f)]));
    for (const f of members) {
      const own = sets.get(f.d);
      const foreign = new Set();
      for (const other of members) {
        if (other.d === f.d) continue;
        for (const w of sets.get(other.d)) if (!own.has(w)) foreign.add(w);
      }
      if (foreign.size) foreignWords.set(f.d, foreign);
    }
    void key;
  }
  const dropForeign = (dom, hits) => {
    const foreign = foreignWords.get(dom);
    if (!foreign) return hits;
    // The value itself is not a word of the name: in "item 1 2" the 2 is the reading, and it was being
    // taken for Item 2's distinguishing word, so all ten BASFI items were dropped.
    return hits.filter((h) => !String(h.raw || '').toLowerCase().split(/\s+/)
      .map((w) => w.replace(/[^a-z0-9-]/g, ''))
      .filter((w) => !(w !== '' && Number(w) === Number(h.value)))
      .some((w) => foreign.has(w)));
  };

  // Pass 1: collect every candidate each field could take, without committing.
  const proposals = new Map();   // dom -> { value, index, raw, strength }
  const vetoed = new Set();
  const claimed = new Map();     // char index -> [dom]

  for (const f of fields) {
    if (!f || !f.d) continue;
    let hits = [];
    let strength = 'name';

    if (f.k === 'enum' && Array.isArray(f.v)) {
      // The sibling-word check number fields get: "surface 2 icdas code 2, surface 3 icdas code 3" filled
      // Surface 2 with 3.
      hits = dropForeign(f.d, enumHits(q, f, termsFor(f)));
    } else if (f.k === 'bool') {
      const hit = boolHit(q, f, termsFor(f));
      if (hit) hits = [hit];
    } else if (f.k === 'number') {
      hits = dropForeign(f.d, namedHits(q, termsFor(f)));
      // A label can start with its own item number ("5 Motor arm, sum of left + right"). Typed back as
      // written, that number sits BEFORE the name, which is the reverse reading's shape: NIHSS item 5
      // filled with 5. The label's own leading number is never its value.
      const own = /^\s*(\d+)[a-z]?\b/i.exec(String(f.l || ''));
      if (own) hits = hits.filter((h) => !(h.before && Number(h.value) === Number(own[1])));
      // More generally, a reading whose last two words are a word-and-number pair the label itself prints
      // ("Final rate, step 12" typed back as "final rate, step 12 80") is the label's number, not the
      // reader's: that filled 12. A value that merely equals a number in the label (10 on a "0 to 10"
      // scale) is not touched.
      const labelText = ` ${String(f.l || '').toLowerCase().replace(/\([^)]*\)/g, ' ').replace(/[^a-z0-9.\s-]/g, ' ').replace(/\s+/g, ' ')} `;
      hits = hits.filter((h) => {
        const tokens = String(h.raw || '').toLowerCase().replace(/[^a-z0-9.\s-]/g, ' ').split(/\s+/).filter(Boolean);
        const v = String(h.value);
        const i = h.before ? tokens.findIndex((t) => Number(t) === h.value) : tokens.map(Number).lastIndexOf(h.value);
        if (i < 0) return true;
        const pair = h.before ? `${v} ${tokens[i + 1] || ''}` : `${tokens[i - 1] || ''} ${v}`;
        return !labelText.includes(` ${pair.trim()} `);
      });
      if (hits.length === 0 && f.u) { hits = unitHits(q, f.u); strength = 'unit'; }
      // A named hit still has to be in a unit the field can take.
      if (strength === 'name') {
        hits = hits.map((h) => {
          if (!h.unit) return h;
          const converted = convertUnit(h.value, h.unit, f.u || h.unit);
          return converted === null ? null : { ...h, value: converted };
        }).filter(Boolean);
      }
    }

    if (hits.length === 0) continue;
    // One field, two readings -> fill neither. "sodium 140 ... sodium 122" is a
    // question we cannot answer, and picking the first is a guess.
    if (hits.length > 1) {
      vetoed.add(f.d);
      empty.unmatched.push(...hits.map((h) => h.raw));
      continue;
    }
    const hit = hits[0];
    proposals.set(f.d, { ...hit, strength });
    if (!claimed.has(hit.index)) claimed.set(hit.index, []);
    claimed.get(hit.index).push(f.d);
  }

  // A number a field read BY NAME is that field's number. A field that only matched it by unit ("any mmHg
  // value") does not take it too: once "PaCO2" matched by name, PaO2's unit fallback read the same
  // "30 mmHg" and both filled with it. Before, both fell back to the unit and vetoed each other.
  // The same holds between two named readings: "group 1 events 141" is Group 1's match, and Group 2's
  // bare "events 141" lying inside it is not a second reading of a different field.
  const span = (x) => [x.index, x.index + String(x.raw || '').length];
  for (const [dom, p] of [...proposals]) {
    const [ps, pe] = span(p);
    const inside = [...proposals.values()].some((o) => {
      if (o === p) return false;
      const [os, oe] = span(o);
      if (p.strength === 'unit' && o.strength === 'name') return os <= ps && ps < oe;
      return o.strength === 'name' && p.strength === 'name' && os <= ps && pe <= oe && (oe - os) > (pe - ps);
    });
    if (!inside) continue;
    proposals.delete(dom);
    const at = claimed.get(p.index) || [];
    claimed.set(p.index, at.filter((d) => d !== dom));
  }

  // Pass 2: one fragment claimed by two fields. Two fields reading the same
  // number is the case where a wrong answer looks right, so the default is to
  // refuse both -- unless one reading is strictly better supported than every
  // other, which is what the corroborating-word score is for. "previous DVT"
  // matches `dvt` for both "Clinical signs of DVT" and "Prior PE or DVT"; only
  // the latter also matches `prior`, so it wins outright and the tie is not a
  // tie. Equal scores stay vetoed.
  const byDom = new Map(fields.filter((f) => f && f.d).map((f) => [f.d, f]));
  for (const [at, doms] of claimed) {
    if (doms.length < 2) continue;
    // A field whose own words -- the ones its rivals' names do not share -- are missing from the clause
    // the value sits in was not the one named: "carvedilol 25" is read by both "Carvedilol" and
    // "Carvedilol CR", and only the second has a word ("cr") that is not there. One field left standing
    // takes the value. The clause, not the whole query: "pleural fluid" further along did not make
    // "upper limit of normal for serum LDH 250" the pleural LDH.
    const end = Math.max(...doms.map((d) => at + String(proposals.get(d)?.raw || '').length));
    const qWords = new Set(q.slice(Math.max(q.lastIndexOf(',', at), q.lastIndexOf(';', at)) + 1, end).toLowerCase().match(/[a-z0-9]+/g) || []);
    const wordsOf = (d) => new Set((termsFor(byDom.get(d))[0] || '').match(/[a-z0-9]+/g) || []);
    const standing = doms.filter((d) => {
      const others = new Set(doms.filter((o) => o !== d).flatMap((o) => [...wordsOf(o)]));
      return [...wordsOf(d)].every((w) => others.has(w) || qWords.has(w));
    });
    if (standing.length === 1) {
      for (const d of doms) if (d !== standing[0]) vetoed.add(d);
      continue;
    }
    const scored = doms.map((d) => ({ d, score: proposals.get(d)?.score || 0 }));
    const best = Math.max(...scored.map((x) => x.score));
    const winners = scored.filter((x) => x.score === best);
    for (const { d } of scored) {
      if (winners.length === 1 && d === winners[0].d) continue;
      vetoed.add(d);
    }
  }

  const filled = {};
  const unmatched = [...empty.unmatched];
  for (const [dom, hit] of proposals) {
    if (vetoed.has(dom)) { unmatched.push(hit.raw); continue; }
    filled[dom] = typeof hit.value === 'number' ? round(hit.value) : hit.value;
  }

  const missing = fields
    .filter((f) => f && f.r && !Object.prototype.hasOwnProperty.call(filled, f.d))
    .map((f) => f.d);

  return { filled, missing, unmatched };
}

// ---------------------------------------------------------------------------
// Loading a tile's fields
// ---------------------------------------------------------------------------

// Adapter field descriptors, in the short-keyed shape this module reads. The
// browser gets these pre-built from data/fields/<bucket>.json; a caller that
// already holds the registry -- the MCP server, which imports the adapters
// directly -- converts them here instead of round-tripping through a file.
//
// `kind: 'boolean'` folds to 'bool' for the same reason the build does it: 90
// descriptors spell it that way and mcp/fields.js only recognizes 'bool'.
export function toIndexRows(fields) {
  if (!Array.isArray(fields)) return [];
  const rows = [];
  for (const f of fields) {
    if (!f || !f.dom) continue;
    const kind = f.kind === 'boolean' ? 'bool' : f.kind;
    const row = { d: f.dom, k: kind, l: f.label || f.arg || f.dom };
    if (f.unit) row.u = f.unit;
    if (f.required) row.r = 1;
    if (kind === 'enum' && Array.isArray(f.values)) row.v = f.values.slice();
    rows.push(row);
  }
  return rows;
}

const bucketCache = new Map();

// Fetch the bucket a tile's fields live in, once per session. A miss -- no
// shard, an offline device, a 404 -- resolves to null and the caller falls back
// to the tile's own empty form, which is what happens today.
export async function loadFields(tileId, { base = '/data/fields' } = {}) {
  if (!tileId) return null;
  const bucket = bucketFor(tileId);
  if (!bucketCache.has(bucket)) {
    bucketCache.set(bucket, fetch(`${base}/${bucket}.json`)
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null));
  }
  const rows = await bucketCache.get(bucket);
  return (rows && rows[tileId]) || null;
}
