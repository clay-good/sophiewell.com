// Pure clinical formulas. Citations live in docs/clinical-citations.md and
// in data/clinical/formulas.json. All inputs are numeric; rejections raise
// TypeError or RangeError. Rounding helpers keep display-friendly precision.

const r1 = (n) => Math.round(n * 10) / 10;
const r2 = (n) => Math.round(n * 100) / 100;
const r3 = (n) => Math.round(n * 1000) / 1000;

function num(name, v, { min = -Infinity, max = Infinity } = {}) {
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new TypeError(`${name} must be a finite number`);
  if (v < min || v > max) throw new RangeError(`${name} out of range [${min}, ${max}]`);
  return v;
}

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
  num('sbp', sbp, { min: 0 });
  num('dbp', dbp, { min: 0 });
  return r1(((2 * dbp) + sbp) / 3);
}

// --- Anion gap (31) ------------------------------------------------------
export function anionGap({ sodium, chloride, bicarbonate, albuminGdl }) {
  num('sodium', sodium); num('chloride', chloride); num('bicarbonate', bicarbonate);
  const ag = sodium - (chloride + bicarbonate);
  if (albuminGdl == null) return { anionGap: r1(ag) };
  num('albuminGdl', albuminGdl, { min: 0 });
  const corrected = ag + 2.5 * (4 - albuminGdl);
  return { anionGap: r1(ag), correctedAnionGap: r1(corrected) };
}

// --- Corrected calcium (32) ----------------------------------------------
export function correctedCalcium({ measuredCa, albuminGdl }) {
  num('measuredCa', measuredCa); num('albuminGdl', albuminGdl, { min: 0 });
  return r2(measuredCa + 0.8 * (4 - albuminGdl));
}

// --- Corrected sodium (33) -----------------------------------------------
export function correctedSodium({ measuredNa, glucose }) {
  num('measuredNa', measuredNa); num('glucose', glucose, { min: 0 });
  const factor16 = (glucose - 100) / 100 * 1.6;
  const factor24 = (glucose - 100) / 100 * 2.4;
  return { naBy1_6: r1(measuredNa + factor16), naBy2_4: r1(measuredNa + factor24) };
}

// --- A-a gradient (34) ---------------------------------------------------
export function aaGradient({ fio2, paco2, pao2, atmospheric = 760, waterVapor = 47 }) {
  num('fio2', fio2, { min: 0, max: 1 }); num('paco2', paco2, { min: 0 }); num('pao2', pao2, { min: 0 });
  const PAO2 = (fio2 * (atmospheric - waterVapor)) - (paco2 / 0.8);
  return { PAO2: r2(PAO2), aaGradient: r2(PAO2 - pao2) };
}

// --- eGFR CKD-EPI 2021 race-free (35) ------------------------------------
export function egfrCkdEpi2021({ scr, age, sex }) {
  num('scr', scr, { min: 0.01 });
  num('age', age, { min: 0 });
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
  num('age', age, { min: 0 }); num('weightKg', weightKg, { min: 0 }); num('scr', scr, { min: 0.01 });
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
  if (typeof lmpIso !== 'string') throw new TypeError('lmpIso must be ISO date string');
  const lmp = new Date(lmpIso + 'T00:00:00Z');
  if (Number.isNaN(lmp.getTime())) throw new TypeError('lmpIso invalid');
  const today = todayIso ? new Date(todayIso + 'T00:00:00Z') : new Date();
  const due = new Date(lmp.getTime() + 280 * 86400000);
  const diffDays = Math.floor((today.getTime() - lmp.getTime()) / 86400000);
  const weeks = Math.floor(diffDays / 7);
  const days = diffDays % 7;
  return { dueDate: due.toISOString().slice(0, 10), gestationalWeeks: weeks, gestationalDays: days };
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
  num('pao2', pao2, { min: 0 });
  num('fio2', fio2, { min: 0.01, max: 1 });
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

export function apgar({ appearance, pulse, grimace, activity, respiration }) {
  for (const [k, v] of Object.entries({ appearance, pulse, grimace, activity, respiration })) num(k, v, { min: 0, max: 2 });
  const total = appearance + pulse + grimace + activity + respiration;
  let category = 'Normal';
  if (total < 4) category = 'Severely depressed';
  else if (total < 7) category = 'Moderately depressed';
  return { total, category };
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
  for (const item of NIHSS_ITEMS) {
    const v = answers[item.id];
    if (v == null) continue;
    num(item.id, v, { min: 0, max: item.max });
    total += v;
  }
  let severity = 'No stroke symptoms';
  if (total >= 21) severity = 'Severe stroke';
  else if (total >= 5) severity = 'Moderate stroke';
  else if (total >= 1) severity = 'Minor stroke';
  return { total, severity };
}

// ABG interpretation (52). Decision tree for primary disorder + compensation.
export function abgInterpret({ pH, paco2, hco3, pao2, fio2 }) {
  num('pH', pH, { min: 6, max: 8 }); num('paco2', paco2, { min: 0 }); num('hco3', hco3, { min: 0 });
  let primary;
  if (pH < 7.35) {
    primary = paco2 > 45 ? 'Respiratory acidosis' : (hco3 < 22 ? 'Metabolic acidosis' : 'Mixed acidosis');
  } else if (pH > 7.45) {
    primary = paco2 < 35 ? 'Respiratory alkalosis' : (hco3 > 26 ? 'Metabolic alkalosis' : 'Mixed alkalosis');
  } else {
    primary = 'Normal pH (consider mixed disorder if abnormal PaCO2 or HCO3)';
  }
  // Compensation note.
  let compensation = '';
  if (primary.startsWith('Metabolic acidosis')) {
    const expectedPaco2 = 1.5 * hco3 + 8;
    compensation = `Winter formula: expected PaCO2 ${r1(expectedPaco2 - 2)} to ${r1(expectedPaco2 + 2)} mmHg`;
  } else if (primary.startsWith('Metabolic alkalosis')) {
    const expectedPaco2 = 0.7 * (hco3 - 24) + 40;
    compensation = `Expected PaCO2 ~${r1(expectedPaco2)} mmHg`;
  }
  // A-a gradient and P/F ratio if oxygenation provided.
  const out = { primary, compensation };
  if (Number.isFinite(pao2) && Number.isFinite(fio2) && fio2 > 0) {
    out.aaGradient = aaGradient({ fio2, paco2, pao2 }).aaGradient;
    out.pfRatio = pfRatio({ pao2, fio2 }).ratio;
  }
  return out;
}
