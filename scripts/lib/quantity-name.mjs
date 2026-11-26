// spec-v1799: WHICH QUANTITY IS THIS FIELD? One answer, in one place.
//
// `probe-borrowed-envelope` (spec-v1796) had to decide whether a field's own words name a `lib/bounds.js`
// envelope, and got it wrong four times before it was right: a substring is not a word, an alias that is
// also a unit is not an alias, the same analyte in another compartment is a different quantity, and a unit
// settles what is left. Those four lessons are the whole value here, and the second finder that needed them
// (`probe-envelope-unenforced`) would have had to learn each one again from its own wrong answers.
//
// So the matcher lives here, with `test/unit/quantity-name.test.js` holding it to the cases that taught it.
// See docs/spec-v1083.md on the same rule for `lib/num.js`, and docs/spec-v1794.md for the range-sentence
// list, which was hoisted for exactly this reason.
import { BOUNDS } from '../../lib/bounds.js';

export const words = (...parts) => new Set(
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
export const ALIASES = {
  sodium: ['na'], potassium: ['k'], chloride: ['cl'], bicarbonate: ['hco3'],
  scr: ['cr', 'creat', 'creatinine'], bun: ['urea'], eGFR: ['egfr', 'gfr', 'filtration'],
  hemoglobin: ['hb', 'hgb'], hematocrit: ['hct'], platelets: ['plt', 'platelet'],
  albumin: ['alb'], bilirubin: ['bili', 'tbili'], inr: ['inr'],
  alt: ['alanine'], ast: ['aspartate'], wbc: ['leukocyte', 'leukocytes', 'leucocyte', 'white'],
  weightKg: ['weight', 'wt'], heightM: ['height', 'ht'], ageYears: ['age'],
  bmi: ['bmi'], percentWeightLoss: [], sixMinuteWalkM: ['walk', '6mwd'],
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
export const COMPARTMENT = new Set(['urine', 'urinary', 'pleural', 'csf', 'ascitic', 'ascites', 'dialysate',
  'drain', 'sputum', 'saliva', 'stool', 'fecal', 'synovial', 'peritoneal', 'effusion']);
// AND A BODY QUANTITY IS NOT THE SAME QUANTITY MEASURED OFF THE BODY. BOUNDS.temperature is 13 to 47 C
// because it is a BODY temperature; a wet-bulb globe temperature of 6.5 C is ordinary weather, and
// `wind-chill` reads an air temperature. BOUNDS.weightKg is a patient's weight; `specific-gravity` weighs
// an empty cylinder and `niosh-lifting` a load. These words say the measurement is not of the patient.
export const NOT_THE_PATIENT = new Set(['globe', 'bulb', 'dewpoint', 'dew', 'air', 'ambient', 'outdoor',
  'room', 'wind', 'water', 'cylinder', 'empty', 'tare', 'container', 'bag', 'package', 'load', 'vial',
  'bottle', 'tablet', 'capsule', 'powder', 'diluent', 'syringe',
  // A CONCENTRATION per unit mass of tissue is not a body weight: `hepatic-iron-index` reads micromoles of
  // iron per gram of liver, "dry weight".
  'dry', 'concentration']);
export const BODY = new Set(['temperature', 'weightKg', 'heightM', 'bmi', 'percentWeightLoss']);

export const BLOOD = new Set(['sodium', 'potassium', 'chloride', 'bicarbonate', 'scr', 'bun', 'albumin',
  'bilirubin', 'glucose', 'calcium', 'magnesium', 'phosphate', 'lactate', 'alt', 'ast', 'wbc',
  'hemoglobin', 'hematocrit', 'platelets', 'triglycerides', 'esr', 'hcg', 'inr']);

// Does a field's own vocabulary name this envelope? Its key, split into words, or any of its aliases.
// spec-v1800: A FIELD NAMES ITS QUANTITY IN THE FIRST CLAUSE OF ITS LABEL; what follows is explanation,
// and explanation names OTHER quantities. `hlh-2004`'s fibrinogen is labelled "Fibrinogen. Meets at 150
// mg/dL or BELOW (source ...)", and the HLH criteria pair fibrinogen with triglycerides, so a sentence
// further along named the triglyceride envelope and the field was matched to it. Up to the first full stop
// or bracket, then. `unitOf` still reads the whole label, since a unit is often in a later parenthetical.
const firstClause = (label) => String(label || '').split(/[.(;:]/)[0];

export const names = (key, f) => {
  const have = words(f.arg, firstClause(f.label), f.unit);
  // spec-v1799: a key word of two letters is not evidence, for the reason `mg` and `be` were dropped as
  // aliases: it is a unit as often as a quantity. `hr` matched the DENOMINATOR of every rate -- a urine
  // output in mL/kg/hr, an infusion in mL/hr -- and called them heart rates. Three letters or more, so
  // `hr` reaches a field only through `pulse` or `heart`, which is how a heart rate is actually written.
  const own = [...words(key)].filter((w) => w.length > 2);
  if (own.length && own.every((w) => have.has(w))) return true;
  return (ALIASES[key] || []).some((a) => have.has(a));
};

// The envelope a field's own words DO name, if any -- the RENAME verdict's answer. Longest key first, so
// `percentWeightLoss` wins over `weightKg` on a field about weight loss.
const KEYS = Object.keys(BOUNDS).sort((a, b) => b.length - a.length);
export const elsewhere = (f) => [...words(f.arg, f.label, f.unit)].some((w) => COMPARTMENT.has(w));
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
  .replace(/[^a-z0-9/.%]/g, '');

// spec-v1799: THE UNIT IS OFTEN IN THE LABEL, not in `unit`. "Birth weight (g)", "Weight in pounds",
// "Unplanned weight loss in past 3-6 months (%)", "Measured value (kg or cm)" -- every one of those states
// its unit where this matcher was not looking, so `unitFits` saw no unit at all, returned true, and let a
// birth weight in GRAMS and a weight loss in PERCENT match the kilogram envelope. A parenthetical at the
// end of a label is a unit by convention throughout this catalog, and the few that spell it in words are
// caught by the table below.
const WORD_UNITS = [[/\bpounds?\b|\blbs?\b/, 'lb'], [/\bgrams?\b/, 'g'], [/\bkilograms?\b/, 'kg'],
  [/\bmonths?\b/, 'months'], [/\bweeks?\b/, 'weeks'], [/\bpercent\b/, '%'],
  [/\binches\b|\binch\b/, 'in'], [/\bcentimet/, 'cm'], [/\bmet(er|re)s?\b/, 'm']];
// spec-v1800: AND THE UNIT IS OFTEN THE LAST CAMEL SEGMENT OF THE ARGUMENT. `gnri` reads `albuminGL` -- an
// albumin in g/L, where BOUNDS.albumin is g/dL -- beside `pni-onodera`'s `albuminGdl`, and neither states a
// unit or puts one in its label. 14 g/L is 1.4 g/dL, an ordinary low albumin, so without this the two were
// indistinguishable and one was reported as answering past its envelope when it was well inside it.
const ARG_UNITS = { gl: 'g/L', gdl: 'g/dL', mgdl: 'mg/dL', mmol: 'mmol/L', meq: 'mEq/L', kg: 'kg', lb: 'lb',
  cm: 'cm', mm: 'mm', ms: 'ms', pct: '%', percent: '%', mmhg: 'mmHg', iul: 'IU/L', umoll: 'umol/L' };

export const unitOf = (f) => {
  if (f.unit) return String(f.unit);
  const argWords = [...words(f.arg)];
  const tail = argWords[argWords.length - 1];
  if (argWords.length > 1 && tail && ARG_UNITS[tail]) return ARG_UNITS[tail];
  const label = String(f.label || '');
  // The LAST parenthetical, since a label often opens with a qualifier in brackets.
  const parens = [...label.matchAll(/\(([^)]{1,24})\)/g)].map((m) => m[1]);
  const last = parens[parens.length - 1];
  // A parenthetical that is prose, not a unit: "(0 if none)", "(optional)", "(< 3rd percentile)".
  if (last && !/\s(if|or\s+more|and)\s|optional|percentile|none|each|preferred/i.test(last)) return last;
  const hit = WORD_UNITS.find(([re]) => re.test(label.toLowerCase()));
  return hit ? hit[1] : '';
};

export const unitFits = (key, f) => {
  const a = unitKey(unitOf(f));
  const b = unitKey(BOUNDS[key].unit);
  if (!a || !b) return true;
  // spec-v1799: substring containment only where there is enough of a unit to contain. `snappe-ii` reads a
  // birth weight in GRAMS and "kg".includes("g") let it match the kilogram envelope, so a 1,000 kg birth
  // weight was reported as answered when the field is in grams throughout.
  if (a === b) return true;
  if (Math.min(a.length, b.length) >= 3 && (a.includes(b) || b.includes(a))) return true;
  return UNIT_SAME.some(([x, y]) => (a === x && b === y) || (a === y && b === x));
};
// The envelope a field's own words name, if any: a blood analyte's envelope cannot fit a field measured
// somewhere else or derived from two of them, and a stated unit must agree.
// A REFERENCE LIMIT, A SCORE OR A CONSTANT IS NOT A MEASUREMENT OF THE QUANTITY IT NAMES. `apri` and
// `hys-law` read an AST or ALT **upper limit of normal** -- a laboratory's reference ceiling of about 40,
// not an AST; `cac-agatston` reads a calcium SCORE, not a serum calcium; `ddi-basic-screen` reads a Ki, an
// inhibition constant. The envelope for the analyte says nothing about any of them.
export const NOT_A_MEASUREMENT = new Set(['uln', 'lln', 'upper', 'lower', 'limit', 'normal', 'reference',
  'score', 'agatston', 'constant', 'coefficient', 'threshold', 'cutoff', 'target', 'multiple',
  // spec-v1800: A CHANGE IN A QUANTITY IS NOT THE QUANTITY. `peds-transfusion-volume` asks for the desired
  // hemoglobin RISE, and a rise of 0.5 g/dL is an ordinary transfusion order, not a hemoglobin of 0.5.
  'rise', 'increment', 'change', 'delta', 'difference', 'drop', 'fall', 'gain', 'deficit']);
// And an end-tidal CO2 is not an arterial one, which is the compartment rule in its respiratory spelling.
export const NOT_ARTERIAL = new Set(['etco2', 'endtidal', 'tidal', 'expired', 'exhaled', 'alveolar']);

const offBody = (f) => [...words(f.arg, f.label, f.unit)].some((w) => NOT_THE_PATIENT.has(w));
// A disqualifier reads the WHOLE label on purpose: "per gram dry weight" or "(Agatston)" can sit after
// the first clause, and a false match is worse than a missed one here.
const notMeasured = (f) => [...words(f.arg, f.label)].some((w) => NOT_A_MEASUREMENT.has(w));
const notArterial = (f) => [...words(f.arg, f.label)].some((w) => NOT_ARTERIAL.has(w));
export const envelopeFor = (f) => KEYS.find((k) => names(k, f)
  && !(BLOOD.has(k) && (elsewhere(f) || derived(f)))
  && !(BODY.has(k) && offBody(f))
  && !notMeasured(f)
  && !(['paO2', 'paCO2'].includes(k) && notArterial(f))
  && unitFits(k, f)) || null;

