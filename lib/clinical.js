// Pure clinical formulas. Citations live in docs/clinical-citations.md and
// in data/clinical/formulas.json. All inputs are numeric; rejections raise
// TypeError or RangeError. Rounding helpers keep display-friendly precision.
//
// spec-v53 §4.1: r1/r2/r3 and num() now live in lib/num.js (single source of
// truth) and are imported, not re-declared. Behavior is unchanged.

import { r1, r2, r3, num, ymdFault, DATE_MIN_YEAR, DATE_MAX_YEAR } from './num.js';
import { BOUNDS } from './bounds.js';

// spec-v1225: the serum-chemistry identities below take `num(name, v)` with no
// ceiling, and arithmetic has no opinion about physiology. A sodium of 2000
// mEq/L gave an anion gap of 1876; an albumin of 70 g/dL gave a corrected
// calcium of **-44.8 mg/dL**, a negative serum calcium -- an impossible input
// producing an impossible OUTPUT, which is the shape spec-v1181 recorded on
// `cdai-crohns`.
//
// The browser was already advising on some of these (`adviseAll` in
// views/group-e.js calls the same `boundsAdvisory`), and the library was not, so
// an agent got the number with nothing beside it. That is the cross-surface gap
// spec-v1205 named.
//
// `num` already throws a reader-facing RangeError -- "Sodium must be between 90
// and 200 mEq/L. Check the value entered." -- which the renderer's safe()
// wrapper prints. All this does is give it the envelope lib/bounds.js has
// published since spec-v53. Every bound below is BOUNDS'; no clinical number is
// decided here, and each field's UNIT is checked against the envelope's own
// (spec-v1205: an envelope is a claim about a quantity in a unit).
const ENV = (key) => ({ min: BOUNDS[key].min, max: BOUNDS[key].max });

// --- Unit conversions (utility 27) ---------------------------------------
// Bidirectional. Returned values are exact within floating-point tolerance.
export const UNITS = {
  weight: { kg: 1, g: 0.001, mg: 0.000001, lb: 0.45359237, oz: 0.028349523125 },
  volume: { mL: 1, L: 1000, fl_oz: 29.5735295625, cup: 236.5882365 },
  // Temperature handled separately (not a multiplicative unit).
};

export function convert(value, fromUnit, toUnit, kind) {
  num('value', value);
  if (kind === 'temperature') return convertTemp(value, fromUnit, toUnit);
  const table = UNITS[kind];
  if (!table) throw new TypeError(`unknown unit kind: ${kind}`);
  if (!(fromUnit in table) || !(toUnit in table)) throw new TypeError(`unknown unit: ${fromUnit} or ${toUnit}`);
  return value * table[fromUnit] / table[toUnit];
}

export function convertTemp(value, from, to) {
  num('value', value);
  let c;
  if (from === 'C') c = value;
  else if (from === 'F') c = (value - 32) * 5 / 9;
  else if (from === 'K') c = value - 273.15;
  else throw new TypeError(`unknown temperature unit: ${from}`);
  if (to === 'C') return c;
  if (to === 'F') return c * 9 / 5 + 32;
  if (to === 'K') return c + 273.15;
  throw new TypeError(`unknown temperature unit: ${to}`);
}

// --- BMI (28) ------------------------------------------------------------
export function bmi({ weightKg, heightM }) {
  num('weightKg', weightKg, { min: 0 });
  // Hard floor 0.01: heightM is squared in the denominator, so 0 is undefined
  // (spec-v53 §3.3). A height in [0.01, 0.45) m is mathematically fine but
  // clinically impossible (likely a cm/m unit error); the renderer shows
  // boundsAdvisory('heightM', heightM) (lib/bounds.js) next to the result.
  num('heightM', heightM, { min: 0.01 });
  const value = weightKg / (heightM * heightM);
  let category;
  if (value < 18.5) category = 'Underweight';
  else if (value < 25) category = 'Normal';
  else if (value < 30) category = 'Overweight';
  else if (value < 35) category = 'Obesity class I';
  else if (value < 40) category = 'Obesity class II';
  else category = 'Obesity class III';
  return { bmi: r1(value), category };
}

// --- BSA (29) ------------------------------------------------------------
export function bsaDuBois({ weightKg, heightCm }) {
  num('weightKg', weightKg, { min: 0 });
  num('heightCm', heightCm, { min: 0 });
  return r2(0.007184 * Math.pow(weightKg, 0.425) * Math.pow(heightCm, 0.725));
}
export function bsaMosteller({ weightKg, heightCm }) {
  num('weightKg', weightKg, { min: 0 });
  num('heightCm', heightCm, { min: 0 });
  return r2(Math.sqrt((heightCm * weightKg) / 3600));
}

// --- MAP (30) ------------------------------------------------------------
export function map({ sbp, dbp }) {
  // spec-v1230: a MAP is an average of two pressures, so an impossible one in
  // gives an impossible one out -- 3000/80 read "MAP: 1053.3 mmHg", a number with
  // no band beside it to look wrong against.
  num('sbp', sbp, ENV('sbp'));
  num('dbp', dbp, ENV('dbp'));
  return r1(((2 * dbp) + sbp) / 3);
}

// --- Anion gap (31) ------------------------------------------------------
export function anionGap({ sodium, chloride, bicarbonate, albuminGdl }) {
  num('sodium', sodium, ENV('sodium')); num('chloride', chloride, ENV('chloride')); num('bicarbonate', bicarbonate, ENV('bicarbonate'));
  const ag = sodium - (chloride + bicarbonate);
  if (albuminGdl == null) return { anionGap: r1(ag) };
  num('albumin', albuminGdl, ENV('albumin'));
  const corrected = ag + 2.5 * (4 - albuminGdl);
  return { anionGap: r1(ag), correctedAnionGap: r1(corrected) };
}

// --- Corrected calcium (32) ----------------------------------------------
export function correctedCalcium({ measuredCa, albuminGdl }) {
  num('measured calcium', measuredCa, ENV('calcium')); num('albumin', albuminGdl, ENV('albumin'));
  return r2(measuredCa + 0.8 * (4 - albuminGdl));
}

// --- Corrected sodium (33) -----------------------------------------------
export function correctedSodium({ measuredNa, glucose }) {
  num('measured sodium', measuredNa, ENV('sodium')); num('glucose', glucose, ENV('glucose'));
  const factor16 = (glucose - 100) / 100 * 1.6;
  const factor24 = (glucose - 100) / 100 * 2.4;
  return { naBy1_6: r1(measuredNa + factor16), naBy2_4: r1(measuredNa + factor24) };
}

// --- A-a gradient (34) ---------------------------------------------------
export function aaGradient({ fio2, paco2, pao2, atmospheric = 760, waterVapor = 47 }) {
  // spec-v1230: both gas tensions are subtracted, never banded, so nothing in
  // the arithmetic notices. A PaO2 of 7000 mmHg gave an A-a gradient of -6900.
  num('fio2', fio2, ENV('fio2')); num('paco2', paco2, ENV('paCO2')); num('pao2', pao2, ENV('paO2'));
  const PAO2 = (fio2 * (atmospheric - waterVapor)) - (paco2 / 0.8);
  return { PAO2: r2(PAO2), aaGradient: r2(PAO2 - pao2) };
}

// --- eGFR CKD-EPI 2021 race-free (35) ------------------------------------
export function egfrCkdEpi2021({ scr, age, sex }) {
  // spec-v1230: the CKD-EPI creatinine term is a power law, which compresses --
  // an SCr of 250 mg/dL comes out as an eGFR of ~0, indistinguishable from the
  // dialysis-range value a real 8 mg/dL gives. The floor of 0.01 stays: it is a
  // HARD floor (a zero denominator), which spec-v53 §3.3 keeps in the compute
  // function, and BOUNDS.scr.min is the softer clinical one.
  num('scr', scr, ENV('scr'));
  num('age', age, ENV('ageYears'));
  if (sex !== 'M' && sex !== 'F') throw new TypeError('sex must be "M" or "F"');
  const k = sex === 'F' ? 0.7 : 0.9;
  const a = sex === 'F' ? -0.241 : -0.302;
  const minTerm = Math.pow(Math.min(scr / k, 1), a);
  const maxTerm = Math.pow(Math.max(scr / k, 1), -1.200);
  const ageTerm = Math.pow(0.9938, age);
  const sexTerm = sex === 'F' ? 1.012 : 1;
  const egfr = 142 * minTerm * maxTerm * ageTerm * sexTerm;
  return r1(egfr);
}

// --- Cockcroft-Gault (36) ------------------------------------------------
export function cockcroftGault({ age, weightKg, scr, sex }) {
  // Hard floor 0.01: scr is the denominator, so 0 is undefined (spec-v53 §3.3).
  // A scr in [0.01, 0.1) is mathematically fine but clinically impossible; the
  // renderer shows boundsAdvisory('scr', scr) (lib/bounds.js) next to the result.
  // spec-v1230: the comment above says the RENDERER shows the advisory, and it
  // does -- and the library said nothing, so an agent got the clearance with
  // nothing beside it. That is the cross-surface gap spec-v1205 named, written
  // down in this file three lines from where it was happening.
  num('age', age, ENV('ageYears')); num('weightKg', weightKg, ENV('weightKg')); num('scr', scr, ENV('scr'));
  if (sex !== 'M' && sex !== 'F') throw new TypeError('sex must be "M" or "F"');
  const v = ((140 - age) * weightKg) / (72 * scr);
  return r2(sex === 'F' ? v * 0.85 : v);
}

// --- Pack-years (37) -----------------------------------------------------
export function packYears({ packsPerDay, years }) {
  num('packsPerDay', packsPerDay, { min: 0 }); num('years', years, { min: 0 });
  return r1(packsPerDay * years);
}

// --- Naegele due date (38) -----------------------------------------------
export function naegele({ lmpIso, todayIso }) {
  // spec-v1171: the FIFTH copy of "is this a real date", and the one spec-v1170's
  // grep could not find, because it holds no date regex at all -- it appends
  // `T00:00:00Z` and lets the ISO parser decide. That parser does reject 30
  // February, so the calendar was covered here by luck rather than by a rule;
  // what it never checked was the YEAR, so an LMP of 1823-04-01 produced a due
  // date of 1824-01-06. The plausibility guard below is about a real LMP that
  // has run stale (spec-v1018); this is about a date that is not one of these at
  // all, and it refuses rather than dating from it.
  if (typeof lmpIso !== 'string') throw new TypeError('Enter the last menstrual period as YYYY-MM-DD.');
  const fault = ymdFault(lmpIso);
  if (fault === 'window') throw new RangeError(`${lmpIso} is outside the dates this tool works with (${DATE_MIN_YEAR} to ${DATE_MAX_YEAR}). Check the year.`);
  if (fault) throw new TypeError('Enter the last menstrual period as YYYY-MM-DD, for example 2026-03-14.');
  const lmp = new Date(lmpIso + 'T00:00:00Z');
  const today = todayIso ? new Date(todayIso + 'T00:00:00Z') : new Date();
  const due = new Date(lmp.getTime() + 280 * 86400000);
  const diffDays = Math.floor((today.getTime() - lmp.getTime()) / 86400000);
  const weeks = Math.floor(diffDays / 7);
  const days = diffDays % 7;
  // spec-v1018: the due date is arithmetic on the LMP and stands whenever the
  // page is opened. The gestational age is measured from TODAY, and it runs
  // away: the worked example pins an LMP of 2025-01-01, so by September 2026 the
  // tile was reporting "Current gestational age: 87 weeks 1 days". A pregnancy
  // is dated to about 42 weeks and 45 is past every definition of post-term, so
  // beyond that the age is not a reading -- it is a date that needs checking.
  // The EDD keeps reporting either way.
  const MAX_DATEABLE_WEEKS = 45;
  const plausible = diffDays >= 0 && weeks <= MAX_DATEABLE_WEEKS;
  return {
    dueDate: due.toISOString().slice(0, 10),
    gestationalWeeks: weeks,
    gestationalDays: days,
    gestationalAgePlausible: plausible,
    gestationalAgeNote: plausible ? null
      : (diffDays < 0
        ? 'The last menstrual period entered is in the future, so there is no gestational age to report.'
        : `The last menstrual period entered is ${weeks} weeks ago, past the ~42 weeks a pregnancy is dated to. Check the date; the estimated due date above is unaffected.`),
  };
}

// --- QTc (39) ------------------------------------------------------------
// QT in ms, HR in bpm. RR in seconds = 60 / HR.
export function qtc({ qtMs, hrBpm }) {
  num('qtMs', qtMs, { min: 0 }); num('hrBpm', hrBpm, { min: 1 });
  const rrSec = 60 / hrBpm;
  return {
    bazett: Math.round(qtMs / Math.sqrt(rrSec)),
    fridericia: Math.round(qtMs / Math.cbrt(rrSec)),
    framingham: Math.round(qtMs + 154 * (1 - rrSec)),
    hodges: Math.round(qtMs + 1.75 * (hrBpm - 60)),
  };
}

// --- P/F ratio (40) ------------------------------------------------------
export function pfRatio({ pao2, fio2 }) {
  // spec-v1230: the Berlin categories are open at the top, so a PaO2 of 7000
  // simply reads "Normal" -- the reassuring end of an ARDS severity scale.
  num('pao2', pao2, ENV('paO2'));
  num('fio2', fio2, { min: 0.01, max: BOUNDS.fio2.max });
  const ratio = pao2 / fio2;
  let category = 'Normal';
  if (ratio <= 100) category = 'Severe ARDS (Berlin)';
  else if (ratio <= 200) category = 'Moderate ARDS (Berlin)';
  else if (ratio <= 300) category = 'Mild ARDS (Berlin)';
  return { ratio: r1(ratio), category };
}

// --- Group F: medication math --------------------------------------------

// Drip rate (41).
export function dripRate({ volumeMl, durationMin, dropFactor }) {
  num('volumeMl', volumeMl, { min: 0 });
  num('durationMin', durationMin, { min: 0.001 });
  num('dropFactor', dropFactor, { min: 0 });
  const mlPerHr = (volumeMl / durationMin) * 60;
  const gttsPerMin = (volumeMl * dropFactor) / durationMin;
  return { mlPerHr: r2(mlPerHr), gttsPerMin: Math.round(gttsPerMin) };
}

// Weight-based dose (42).
export function weightDose({ weightKg, dosePerKg }) {
  num('weightKg', weightKg, { min: 0 }); num('dosePerKg', dosePerKg, { min: 0 });
  return r3(weightKg * dosePerKg);
}

// Concentration to rate (43).
// rate = (doseRate * unitsPerDose) / concentration
// We accept dose in mcg/kg/min, mcg/min, mg/min, units/hr; concentration in mg/mL or units/mL.
// Returns mL/hr.
export function concentrationToRate({ doseValue, doseUnit, weightKg, concentrationValue, concentrationUnit }) {
  num('doseValue', doseValue, { min: 0 });
  num('concentrationValue', concentrationValue, { min: 0.0000001 });
  // Normalize the dose to mg/min (or units/min).
  let dosePerMin;
  switch (doseUnit) {
    case 'mcg/kg/min': num('weightKg', weightKg, { min: 0 }); dosePerMin = doseValue * weightKg / 1000; break;
    case 'mcg/min':   dosePerMin = doseValue / 1000; break;
    case 'mg/min':    dosePerMin = doseValue; break;
    case 'units/hr':  dosePerMin = doseValue / 60; break;
    case 'units/min': dosePerMin = doseValue; break;
    default: throw new TypeError(`unknown doseUnit ${doseUnit}`);
  }
  // Concentration is per mL: mg/mL or units/mL.
  let mgPerMl;
  switch (concentrationUnit) {
    case 'mg/mL':    mgPerMl = concentrationValue; break;
    case 'units/mL': mgPerMl = concentrationValue; break;
    default: throw new TypeError(`unknown concentrationUnit ${concentrationUnit}`);
  }
  const mlPerMin = dosePerMin / mgPerMl;
  return { mlPerHr: r2(mlPerMin * 60) };
}

// --- Group G: scoring ----------------------------------------------------

export function gcs({ eye, verbal, motor }) {
  num('eye', eye, { min: 1, max: 4 }); num('verbal', verbal, { min: 1, max: 5 }); num('motor', motor, { min: 1, max: 6 });
  const total = eye + verbal + motor;
  let severity = 'Severe';
  if (total >= 13) severity = 'Mild';
  else if (total >= 9) severity = 'Moderate';
  return { total, severity };
}

// spec-v1082: five signs, and all five are looked for at once.
//
// The tile rendered five sliders parked at 2, so a newborn nobody had assessed
// read "APGAR: 10 (Normal)". Adding up only the rated signs is the other error:
// it understates the total and reads as a more depressed baby than the one in
// front of you.
const APGAR_LABELS = {
  appearance: 'appearance (color)', pulse: 'pulse', grimace: 'grimace (reflex irritability)',
  activity: 'activity (tone)', respiration: 'respiration',
};
export function apgar({ appearance, pulse, grimace, activity, respiration }) {
  const given = { appearance, pulse, grimace, activity, respiration };
  const unrated = Object.entries(given)
    .filter(([, v]) => v == null || (typeof v !== 'number' && String(v).trim() === ''))
    .map(([k]) => APGAR_LABELS[k]);
  if (unrated.length) {
    return {
      valid: false, total: null, category: null, unrated,
      signsScored: 5 - unrated.length, signsTotal: 5,
      text: `Apgar not scored: assess ${unrated.join(', ')}. All five signs are scored together at one minute of age; a partial sum reads as a more depressed newborn than the one in front of you.`,
    };
  }
  for (const [k, v] of Object.entries(given)) num(k, v, { min: 0, max: 2 });
  const total = appearance + pulse + grimace + activity + respiration;
  let category = 'Normal';
  if (total < 4) category = 'Severely depressed';
  else if (total < 7) category = 'Moderately depressed';
  return { valid: true, total, category, unrated: [], signsScored: 5, signsTotal: 5 };
}

// Wells PE (53). The original Wells criteria with point values.
const WELLS_PE_ITEMS = {
  clinicalDvtSigns: 3,
  peLikely: 3,
  hrOver100: 1.5,
  immobilizationOrSurgery: 1.5,
  priorPeOrDvt: 1.5,
  hemoptysis: 1,
  malignancy: 1,
};
export function wellsPe(answers) {
  let total = 0;
  for (const [k, points] of Object.entries(WELLS_PE_ITEMS)) {
    if (answers[k]) total += points;
  }
  let category = 'Low probability';
  if (total > 6) category = 'High probability';
  else if (total >= 2) category = 'Moderate probability';
  return { total, category };
}

const WELLS_DVT_ITEMS = {
  activeCancer: 1, paralysis: 1, recentBedrest: 1, tendernessAlongVeins: 1, entireLegSwollen: 1,
  calfSwellingGt3cm: 1, pittingEdema: 1, collateralVeins: 1, priorDvt: 1, alternativeDxAsLikely: -2,
};
export function wellsDvt(answers) {
  let total = 0;
  for (const [k, points] of Object.entries(WELLS_DVT_ITEMS)) {
    if (answers[k]) total += points;
  }
  let category = 'Low probability';
  if (total >= 3) category = 'High probability';
  else if (total >= 1) category = 'Moderate probability';
  return { total, category };
}

const CHADS_ITEMS = {
  chf: 1, hypertension: 1, ageGte75: 2, diabetes: 1, strokeOrTia: 2,
  vascularDisease: 1, ageGte65: 1, female: 1,
};
export function chadsVasc(answers) {
  let total = 0;
  for (const [k, points] of Object.entries(CHADS_ITEMS)) if (answers[k]) total += points;
  return { total };
}

const HASBLED_ITEMS = {
  hypertension: 1, abnormalRenal: 1, abnormalLiver: 1, stroke: 1,
  bleedingHistory: 1, labileInr: 1, ageGt65: 1, drugs: 1, alcohol: 1,
};
export function hasBled(answers) {
  let total = 0;
  for (const [k, points] of Object.entries(HASBLED_ITEMS)) if (answers[k]) total += points;
  let risk = 'Low';
  if (total >= 3) risk = 'High';
  else if (total >= 1) risk = 'Moderate';
  return { total, risk };
}

// NIHSS items: 11 items per the public NIH instrument; max scores per item.
export const NIHSS_ITEMS = [
  { id: '1a', name: 'Level of consciousness', max: 3 },
  { id: '1b', name: 'LOC questions', max: 2 },
  { id: '1c', name: 'LOC commands', max: 2 },
  { id: '2',  name: 'Best gaze', max: 2 },
  { id: '3',  name: 'Visual fields', max: 3 },
  { id: '4',  name: 'Facial palsy', max: 3 },
  { id: '5',  name: 'Motor arm (sum L+R)', max: 8 },
  { id: '6',  name: 'Motor leg (sum L+R)', max: 8 },
  { id: '7',  name: 'Limb ataxia', max: 2 },
  { id: '8',  name: 'Sensory', max: 2 },
  { id: '9',  name: 'Best language', max: 3 },
  { id: '10', name: 'Dysarthria', max: 2 },
  { id: '11', name: 'Extinction and inattention', max: 2 },
];
export function nihss(answers) {
  let total = 0;
  let scored = 0;
  for (const item of NIHSS_ITEMS) {
    const v = answers[item.id];
    // spec-v930: a blank item is an item nobody scored, exactly like an absent one. Without
    // this it reached num() as '' and threw, while an absent item was skipped.
    if (v == null || (typeof v !== 'number' && String(v).trim() === '')) continue;
    num(item.id, v, { min: 0, max: item.max });
    total += v;
    scored += 1;
  }
  const complete = scored === NIHSS_ITEMS.length;
  let severity = 'No stroke symptoms';
  if (total >= 21) severity = 'Severe stroke';
  else if (total >= 5) severity = 'Moderate stroke';
  else if (total >= 1) severity = 'Minor stroke';
  // spec-v1007: every item adds points or leaves them alone, so a partial total is
  // a LOWER BOUND -- which keeps every band above zero true (the exam has already
  // found that much deficit) and makes exactly one reading unsupportable. An
  // unexamined patient is not a patient without stroke symptoms, and a caller that
  // sent no items at all used to be told "No stroke symptoms".
  if (!complete && total === 0) {
    severity = `Not scored: ${NIHSS_ITEMS.length - scored} of ${NIHSS_ITEMS.length} items unscored -- an unscored exam is not a normal exam.`;
  }
  // spec-v1021: the two surfaces have to agree on whether an answer was given.
  // A refusal returned inside a valid-looking result reads to the browser as a
  // prompt and to an agent as a reading: computeCalculator only marks a call
  // INCOMPLETE when the library says `valid: false`, so `severity: "Not scored"`
  // was arriving over MCP with valid: true. With nothing scored there is no
  // exam; with some items scored the total is a real floor and stands.
  const nothingScored = scored === 0;
  // spec-v1088: the footing belongs to the LIBRARY, not to one renderer.
  //
  // itemsScored / itemsTotal / complete said the exam was partial, and the
  // browser turned them into a sentence -- but an agent reading `severity` alone
  // got "Moderate stroke" with nothing in the words to say the exam was
  // three-quarters done. Its sibling mnihss already carries the footing in its
  // own band text, which is what makes the two surfaces agree without the view
  // having to compose it.
  const footing = !complete && !nothingScored
    ? `Scored from ${scored} of ${NIHSS_ITEMS.length} items; each unrated item can only raise the total, so treat this as a floor.`
    : '';
  return {
    ...(nothingScored ? { valid: false } : {}),
    total,
    severity,
    footing,
    itemsScored: scored,
    itemsTotal: NIHSS_ITEMS.length,
    complete,
    ...(nothingScored ? { message: severity } : {}),
  };
}

// ABG interpretation (52). Decision tree for primary disorder + compensation.
export function abgInterpret({ pH, paco2, hco3, pao2, fio2 }) {
  // The pH bound is left at the caller's own 6-8 rather than moved to
  // BOUNDS.pH: `readable('pH')` renders it "p H", and a wave about making a
  // refusal readable should not ship one that is not. Tracked separately.
  num('pH', pH, { min: 6, max: 8 }); num('paco2', paco2, ENV('paCO2')); num('hco3', hco3, ENV('bicarbonate'));
  let primary;
  if (pH < 7.35) {
    primary = paco2 > 45 ? 'Respiratory acidosis' : (hco3 < 22 ? 'Metabolic acidosis' : 'Mixed acidosis');
  } else if (pH > 7.45) {
    primary = paco2 < 35 ? 'Respiratory alkalosis' : (hco3 > 26 ? 'Metabolic alkalosis' : 'Mixed alkalosis');
  } else {
    primary = 'Normal pH (consider mixed disorder if abnormal PaCO2 or HCO3)';
  }
  // Compensation note. Metabolic primaries predict the expected PaCO2; the
  // respiratory primaries predict the expected HCO3 over the acute->chronic
  // adaptation window via the Boston rules (Narins & Emmett 1980), so a
  // measured HCO3 outside that window flags a superimposed metabolic process.
  let compensation = '';
  if (primary.startsWith('Metabolic acidosis')) {
    const expectedPaco2 = 1.5 * hco3 + 8;
    compensation = `Winter formula: expected PaCO2 ${r1(expectedPaco2 - 2)} to ${r1(expectedPaco2 + 2)} mmHg`;
  } else if (primary.startsWith('Metabolic alkalosis')) {
    const expectedPaco2 = 0.7 * (hco3 - 24) + 40;
    compensation = `Expected PaCO2 ~${r1(expectedPaco2)} mmHg`;
  } else if (primary.startsWith('Respiratory acidosis')) {
    const acute = 24 + 0.1 * (paco2 - 40);
    const chronic = 24 + 0.35 * (paco2 - 40);
    compensation = `Boston rules: expected HCO3 ~${r1(acute)} mEq/L if acute (+0.1/mmHg), ~${r1(chronic)} if chronic (+0.35/mmHg). HCO3 above the chronic value suggests an added metabolic alkalosis; below the acute value, an added metabolic acidosis.`;
  } else if (primary.startsWith('Respiratory alkalosis')) {
    const acute = 24 + 0.2 * (paco2 - 40);
    const chronic = 24 + 0.4 * (paco2 - 40);
    compensation = `Boston rules: expected HCO3 ~${r1(acute)} mEq/L if acute (-0.2/mmHg), ~${r1(chronic)} if chronic (-0.4/mmHg). HCO3 below the chronic value suggests an added metabolic acidosis; above the acute value, an added metabolic alkalosis.`;
  }
  // A-a gradient and P/F ratio if oxygenation provided.
  const out = { primary, compensation };
  if (Number.isFinite(pao2) && Number.isFinite(fio2) && fio2 > 0) {
    out.aaGradient = aaGradient({ fio2, paco2, pao2 }).aaGradient;
    out.pfRatio = pfRatio({ pao2, fio2 }).ratio;
  }
  return out;
}
