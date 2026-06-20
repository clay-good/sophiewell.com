// spec-v133 (Wave 6 of the spec-v100 MDCalc Parity Completion program):
// warfarin start-up support, the oral-anticoagulant counterpart to the existing
// heparin-nomogram (the catalog's only "compute the next dose from inputs" tool).
// None duplicates a live tile.
//
//   warfarinIwpc       - IWPC pharmacogenetic maintenance-dose model (Klein 2009)
//   warfarinGage       - Gage pharmacogenomic maintenance-dose model (Gage 2008)
//   warfarinInit10mg   - Kovacs 10 mg initiation nomogram (Kovacs 2003)
//   warfarinInit5mg    - Crowther 5 mg initiation nomogram (Crowther 1999)
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v133.js render the spec-v11 §5.3 /
// spec-v100 §2 clause-5 high-stakes second-check caveat on each dosing tile.
//
// COEFFICIENTS / TABLES RE-FETCHED, NEVER RECALLED (spec-v97 lesson), each
// cross-verified against the primary source:
//   - IWPC (Klein TE, et al; International Warfarin Pharmacogenetics Consortium,
//     N Engl J Med 2009;360:753-764, supplementary appendix S1e): the
//     PHARMACOGENETIC dose model. sqrt(weekly dose mg) = 5.6044
//       - 0.2614 x age-in-decades              (decade = floor(age/10): 10-19 = 1)
//       + 0.0087 x height(cm)
//       + 0.0128 x weight(kg)
//       - 0.8677 x VKORC1 A/G  - 1.6974 x VKORC1 A/A  - 0.4854 x VKORC1 unknown
//       - 0.5211 x CYP2C9 *1/*2  - 0.9357 x *1/*3  - 1.0616 x *2/*2
//       - 1.9206 x *2/*3  - 2.3312 x *3/*3  - 0.2188 x CYP2C9 unknown
//       - 0.1092 x Asian  - 0.2760 x Black/African American  - 0.1032 x missing/mixed race
//       + 1.1816 x enzyme-inducer (carbamazepine/phenytoin/rifampin)
//       - 0.5503 x amiodarone
//     then SQUARE the result for mg/week. Reference baseline (all terms 0):
//     VKORC1 G/G, CYP2C9 *1/*1, White/Caucasian, no inducer, no amiodarone. The
//     height coefficient is 0.0087 (pharmacogenetic) -- NOT 0.0118 (the clinical
//     model); the unknown-genotype terms are real and retained. Class A.
//   - Gage (Gage BF, et al, Clin Pharmacol Ther 2008;84:326-331): the
//     pharmacogenomic therapeutic-dose model. dose(mg/day) = exp(0.9751
//       + 0.4317 x BSA(m^2)  - 0.00745 x age(yr)
//       - 0.2066 x CYP2C9*2 alleles  - 0.4008 x CYP2C9*3 alleles
//       - 0.3238 x VKORC1 (-1639/3673 G>A) A-alleles
//       + 0.2029 x target INR  - 0.2538 x amiodarone  + 0.0922 x smoker
//       - 0.0901 x African-American race  + 0.0664 x DVT/PE indication).
//     Coefficients confirmed verbatim against the Shin & Cao 2009 validation
//     reprint and cross-reconciled to the original Gage Table-3 percentages
//     (e.g. VKORC1 -28%/allele = e^-0.3238 - 1). The original 2008 model carries
//     NO CYP4F2 term (added later by Sagreiya 2010 to the IWPC model, not Gage).
//     BSA uses the DuBois formula -- the BSA reference the Gage 2008 paper itself
//     cites (DuBois & DuBois 1916): BSA = 0.007184 x wt(kg)^0.425 x ht(cm)^0.725.
//     Predicts mg/day directly (x7 for mg/week). Class A. (The published model
//     gives no numeric worked example; the test pins our own arithmetic.)
//   - Kovacs 10 mg nomogram (Kovacs MJ, et al, Ann Intern Med 2003;138:714-719,
//     Figure 1; reproduced identically by AAFP 2005;71(4):763 and the RxFiles
//     warfarin nomogram table): day 1-2 = 10 mg; the day-3 INR sets BOTH the
//     day-3 and day-4 doses (they can differ); the day-5 INR sets days 5/6/7,
//     and WHICH day-5 sub-table applies depends on the day-3 band (four
//     sub-tables; the highest day-3 band shifts its day-5 edges to 3.1-4.0 />4.0).
//     The 1.5-1.9 day-3 range is SPLIT (1.5-1.6 vs 1.7-1.9), resolving the common
//     reproduction disagreement. INR is checked on days 3 and 5 only. A fixed
//     lookup, no interpolation; a missing day-3 INR (days 3-7) or day-5 INR
//     (days 5-7) surfaces the fallback. Class A. NB: the 63.835/INR maintenance
//     formula is Kovacs Blood 2007 (NOT this nomogram), and the AAFP day-5 mg/week
//     maintenance table is Pengo 2001 (NOT Kovacs) -- both deliberately excluded.
//   - Crowther 5 mg nomogram (Crowther MA, et al, Arch Intern Med 1999;159:46-48,
//     Table 1, faithfully reproduced by AAFP 2005;71(4):763): day 1 = 5 mg, day 2
//     = 5 mg (no INR branch), then INR-banded days 3-6. Day 5's low band is < 2.0
//     (NOT < 1.5 like days 3-4) -- preserved exactly. A fixed lookup, no
//     interpolation; an out-of-range day or blank INR on an INR-driven day
//     surfaces the fallback. Class A.

const obj = (input) => (input && typeof input === 'object' ? input : {});
const num = (v) => {
  // Number(null) === 0 and Number('') === 0, so reject the empty cases up front:
  // a blank required field must surface a fallback, never silently score 0.
  if (v === null || v === undefined || v === '' || typeof v === 'boolean') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};
const pos = (v) => {
  const n = num(v);
  return n !== null && n > 0 ? n : null;
};
const flag = (v) => {
  if (v === true || v === 1 || v === '1' || v === 'yes') return true;
  if (v === false || v === 0 || v === '0' || v === 'no') return false;
  return null;
};
const r1 = (n) => Math.round(n * 10) / 10;

// --- 2.1 warfarin-iwpc --------------------------------------------------------
const IWPC_NOTE = 'IWPC pharmacogenetic warfarin dose (Klein TE, et al; International Warfarin Pharmacogenetics Consortium, N Engl J Med 2009): a published linear model that predicts the stable maintenance dose from age, height, weight, race, enzyme-inducer and amiodarone use, and the entered VKORC1 (-1639 G>A) and CYP2C9 genotypes. It regresses the square root of the weekly dose, so the tile squares the result. An estimate of a starting point -- confirm it against your institutional protocol, the indication’s target INR, and an independent second check, and titrate to the measured INR; the prescribe decision stays with the clinician.';

// VKORC1 (-1639 G>A) indicator coefficients. G/G is the reference (0).
const IWPC_VKORC1 = { GG: 0, AG: -0.8677, AA: -1.6974, unknown: -0.4854 };
// CYP2C9 indicator coefficients. *1/*1 is the reference (0).
const IWPC_CYP2C9 = {
  '*1/*1': 0, '*1/*2': -0.5211, '*1/*3': -0.9357, '*2/*2': -1.0616,
  '*2/*3': -1.9206, '*3/*3': -2.3312, unknown: -0.2188,
};
// Race indicator coefficients. White/Caucasian is the reference (0).
const IWPC_RACE = { white: 0, asian: -0.1092, black: -0.2760, mixed: -0.1032 };

export function warfarinIwpc(input = {}) {
  const o = obj(input);
  const age = num(o.age);
  const height = pos(o.height);
  const weight = pos(o.weight);
  const vkorc1 = IWPC_VKORC1[o.vkorc1];
  const cyp2c9 = IWPC_CYP2C9[o.cyp2c9];
  const race = IWPC_RACE[o.race];
  const inducer = flag(o.inducer);
  const amiodarone = flag(o.amiodarone);
  if (age === null || age < 0 || age > 130 || height === null || weight === null
      || vkorc1 === undefined || cyp2c9 === undefined || race === undefined
      || inducer === null || amiodarone === null) {
    return { valid: false, message: 'Enter age, height (cm) and weight (kg); select the VKORC1 (-1639 G>A) and CYP2C9 genotypes and race; and answer the enzyme-inducer and amiodarone questions.' };
  }
  const decades = Math.floor(age / 10);
  const sqrtDose = 5.6044
    - 0.2614 * decades
    + 0.0087 * height
    + 0.0128 * weight
    + vkorc1
    + cyp2c9
    + race
    + (inducer ? 1.1816 : 0)
    + (amiodarone ? -0.5503 : 0);
  // The model can in principle drive sqrtDose <= 0 for extreme/fuzzed inputs;
  // a negative root has no dose meaning -> surface the fallback, never square a
  // negative into a spurious positive dose.
  if (!Number.isFinite(sqrtDose) || sqrtDose <= 0) {
    return { valid: false, message: 'The entered combination falls outside the model’s valid range; re-check the inputs.' };
  }
  const weekly = sqrtDose * sqrtDose;
  if (!Number.isFinite(weekly)) {
    return { valid: false, message: 'The entered combination falls outside the model’s valid range; re-check the inputs.' };
  }
  const weeklyR = r1(weekly);
  const daily = r1(weekly / 7);
  return {
    valid: true,
    weekly: weeklyR,
    daily,
    band: `IWPC predicted maintenance dose ${weeklyR} mg/week (~${daily} mg/day). A model estimate of a starting point -- titrate to the measured INR.`,
    note: IWPC_NOTE,
  };
}

// --- 2.2 warfarin-gage --------------------------------------------------------
const GAGE_NOTE = 'Gage pharmacogenomic warfarin dose (Gage BF, et al, Clin Pharmacol Ther 2008): a published exponential model that predicts the therapeutic daily dose from body-surface area, age, target INR, smoking, amiodarone use, race, the DVT/PE indication, and the entered CYP2C9 and VKORC1 genotypes. Body-surface area uses the DuBois formula the source cites; the original 2008 model carries no CYP4F2 term. An estimate of a starting point -- confirm it against your institutional protocol, the indication’s target INR, and an independent second check, and titrate to the measured INR; the prescribe decision stays with the clinician.';

// Per-A-allele VKORC1 (-1639/3673 G>A) allele count.
const GAGE_VKORC1 = { GG: 0, AG: 1, AA: 2, GA: 1 };
// CYP2C9 -> [*2 allele count, *3 allele count].
const GAGE_CYP2C9 = {
  '*1/*1': [0, 0], '*1/*2': [1, 0], '*1/*3': [0, 1], '*2/*2': [2, 0],
  '*2/*3': [1, 1], '*3/*3': [0, 2],
};

export function warfarinGage(input = {}) {
  const o = obj(input);
  const age = num(o.age);
  const height = pos(o.height);
  const weight = pos(o.weight);
  const targetInr = pos(o.targetInr);
  const vk = GAGE_VKORC1[o.vkorc1];
  const cyp = GAGE_CYP2C9[o.cyp2c9];
  const amiodarone = flag(o.amiodarone);
  const smoker = flag(o.smoker);
  const africanAmerican = flag(o.africanAmerican);
  const dvtPe = flag(o.dvtPe);
  if (age === null || age < 0 || age > 130 || height === null || weight === null
      || targetInr === null || targetInr > 10 || vk === undefined || cyp === undefined
      || amiodarone === null || smoker === null || africanAmerican === null || dvtPe === null) {
    return { valid: false, message: 'Enter age, height (cm), weight (kg) and target INR; select the VKORC1 (-1639 G>A) and CYP2C9 genotypes; and answer the amiodarone, smoking, race and DVT/PE-indication questions.' };
  }
  // DuBois & DuBois (1916) body-surface area -- the reference the Gage paper cites.
  const bsa = 0.007184 * Math.pow(weight, 0.425) * Math.pow(height, 0.725);
  const lnDose = 0.9751
    + 0.4317 * bsa
    - 0.00745 * age
    - 0.2066 * cyp[0]
    - 0.4008 * cyp[1]
    - 0.3238 * vk
    + 0.2029 * targetInr
    + (amiodarone ? -0.2538 : 0)
    + (smoker ? 0.0922 : 0)
    + (africanAmerican ? -0.0901 : 0)
    + (dvtPe ? 0.0664 : 0);
  const daily = Math.exp(lnDose);
  if (!Number.isFinite(daily) || daily <= 0) {
    return { valid: false, message: 'The entered combination falls outside the model’s valid range; re-check the inputs.' };
  }
  const dailyR = r1(daily);
  const weekly = r1(daily * 7);
  return {
    valid: true,
    daily: dailyR,
    weekly,
    bsa: r1(bsa),
    band: `Gage predicted therapeutic dose ${dailyR} mg/day (~${weekly} mg/week). A model estimate of a starting point -- titrate to the measured INR.`,
    note: GAGE_NOTE,
  };
}

// --- 2.3 warfarin-init-10mg ---------------------------------------------------
const KOVACS_NOTE = 'Kovacs 10 mg warfarin initiation nomogram (Kovacs MJ, et al, Ann Intern Med 2003): the early-day warfarin dose when genotype is unknown. Day 1-2 are a fixed 10 mg; the day-3 INR sets the day-3 and day-4 doses; the day-5 INR sets days 5, 6 and 7, with the day-5 sub-table chosen by which day-3 band the patient was in. INR is checked on days 3 and 5 only. A nomogram estimate -- confirm it against your institutional protocol and the indication’s target INR, overlap with a parenteral anticoagulant per the indication, and use an independent second check before prescribing.';

// Day-3 bands (low INR -> high). Each: [predicate(inr3), label, day3 dose, day4
// dose, sub-table key]. Ordered so the first match wins; covers the real line.
const KOVACS_DAY3 = [
  [(i) => i < 1.3, 'INR < 1.3', 15, 15, 'A'],
  [(i) => i < 1.5, 'INR 1.3-1.4', 10, 10, 'A'],
  [(i) => i < 1.7, 'INR 1.5-1.6', 10, 5, 'B'],
  [(i) => i < 2.0, 'INR 1.7-1.9', 5, 5, 'B'],
  [(i) => i < 2.3, 'INR 2.0-2.2', 2.5, 2.5, 'C'],
  [(i) => i <= 3.0, 'INR 2.3-3.0', 0, 2.5, 'C'],
  [() => true, 'INR > 3.0', 0, 0, 'D'],
];
// Day-5 sub-tables, keyed by the day-3 band group. Each: [predicate(inr5),
// label, [day5, day6, day7]]. Sub-table D shifts its upper edges to 3.1-4.0/>4.0.
const KOVACS_DAY5 = {
  A: [
    [(i) => i < 2.0, 'INR < 2.0', [15, 15, 15]],
    [(i) => i <= 3.0, 'INR 2.0-3.0', [7.5, 5, 7.5]],
    [(i) => i <= 3.5, 'INR 3.1-3.5', [0, 5, 5]],
    [() => true, 'INR > 3.5', [0, 0, 2.5]],
  ],
  B: [
    [(i) => i < 2.0, 'INR < 2.0', [7.5, 7.5, 7.5]],
    [(i) => i <= 3.0, 'INR 2.0-3.0', [5, 5, 5]],
    [(i) => i <= 3.5, 'INR 3.1-3.5', [2.5, 2.5, 2.5]],
    [() => true, 'INR > 3.5', [0, 2.5, 2.5]],
  ],
  C: [
    [(i) => i < 2.0, 'INR < 2.0', [5, 5, 5]],
    [(i) => i <= 3.0, 'INR 2.0-3.0', [2.5, 5, 2.5]],
    [(i) => i <= 3.5, 'INR 3.1-3.5', [0, 2.5, 0]],
    [() => true, 'INR > 3.5', [0, 0, 2.5]],
  ],
  D: [
    [(i) => i < 2.0, 'INR < 2.0', [2.5, 2.5, 2.5]],
    [(i) => i <= 3.0, 'INR 2.0-3.0', [2.5, 0, 2.5]],
    [(i) => i <= 4.0, 'INR 3.1-4.0', [0, 2.5, 0]],
    [() => true, 'INR > 4.0', [0, 0, 2.5]],
  ],
};

export function warfarinInit10mg(input = {}) {
  const o = obj(input);
  const day = num(o.day);
  if (day === null || !Number.isInteger(day) || day < 1 || day > 7) {
    return { valid: false, message: 'Select the warfarin treatment day (1-7).' };
  }
  if (day <= 2) {
    return {
      valid: true, day, dose: 10, inrDriven: false,
      band: `Day ${day}: 10 mg (fixed loading dose, no INR check).`,
      note: KOVACS_NOTE,
    };
  }
  const inr3 = pos(o.inr3);
  if (inr3 === null) {
    return { valid: false, message: `Enter the day-3 INR (it sets the day-3 to day-4 dose and selects the day-5 sub-table).` };
  }
  const d3 = KOVACS_DAY3.find((b) => b[0](inr3));
  if (day === 3 || day === 4) {
    const dose = day === 3 ? d3[2] : d3[3];
    return {
      valid: true, day, dose, inrDriven: true, inr3, day3Band: d3[1],
      band: `Day ${day} (day-3 ${d3[1]}, entered ${inr3}): ${dose} mg.${dose === 0 ? ' Hold today’s dose.' : ''}`,
      note: KOVACS_NOTE,
    };
  }
  // days 5-7: need the day-5 INR; the day-3 band selects the sub-table.
  const inr5 = pos(o.inr5);
  if (inr5 === null) {
    return { valid: false, message: `Enter the day-5 INR for day ${day} (with the day-3 INR).` };
  }
  const sub = KOVACS_DAY5[d3[4]];
  const row = sub.find((b) => b[0](inr5));
  const dose = row[2][day - 5];
  return {
    valid: true, day, dose, inrDriven: true, inr3, inr5, day3Band: d3[1], day5Band: row[1],
    band: `Day ${day} (day-3 ${d3[1]}, day-5 ${row[1]} entered ${inr5}): ${dose} mg.${dose === 0 ? ' Hold today’s dose.' : ''}`,
    note: KOVACS_NOTE,
  };
}

// --- 2.4 warfarin-init-5mg ----------------------------------------------------
const CROWTHER_NOTE = 'Crowther 5 mg warfarin initiation nomogram (Crowther MA, et al, Arch Intern Med 1999): the early-day warfarin dose when genotype is unknown. Day 1 and day 2 are a fixed 5 mg; from day 3 the dose is set by that morning’s INR. (Day 5’s low band is < 2.0, unlike the < 1.5 band on days 3-4.) A nomogram estimate -- confirm it against your institutional protocol and the indication’s target INR, overlap with a parenteral anticoagulant per the indication, and use an independent second check before prescribing.';

// Crowther 1999 Table 1. Day 1-2 are flat 5 mg. Days 3-6 are INR-banded.
// Each band is [predicate(inr), dose]. The first matching band wins; bands are
// ordered low-INR to high-INR and cover the whole real line for each day.
const CROWTHER_BANDS = {
  3: [[(i) => i < 1.5, 10], [(i) => i < 2.0, 5], [(i) => i <= 3.0, 2.5], [() => true, 0]],
  4: [[(i) => i < 1.5, 10], [(i) => i < 2.0, 7.5], [(i) => i <= 3.0, 5], [() => true, 0]],
  5: [[(i) => i < 2.0, 10], [(i) => i <= 3.0, 5], [() => true, 0]],
  6: [[(i) => i < 1.5, 12.5], [(i) => i < 2.0, 10], [(i) => i <= 3.0, 7.5], [() => true, 0]],
};
const CROWTHER_BAND_LABEL = {
  3: ['INR < 1.5', 'INR 1.5-1.9', 'INR 2.0-3.0', 'INR > 3.0'],
  4: ['INR < 1.5', 'INR 1.5-1.9', 'INR 2.0-3.0', 'INR > 3.0'],
  5: ['INR < 2.0', 'INR 2.0-3.0', 'INR > 3.0'],
  6: ['INR < 1.5', 'INR 1.5-1.9', 'INR 2.0-3.0', 'INR > 3.0'],
};

export function warfarinInit5mg(input = {}) {
  const o = obj(input);
  const day = num(o.day);
  if (day === null || !Number.isInteger(day) || day < 1 || day > 6) {
    return { valid: false, message: 'Select the warfarin treatment day (1-6).' };
  }
  if (day <= 2) {
    return {
      valid: true, day, dose: 5, inrDriven: false,
      band: `Day ${day}: 5 mg (fixed loading dose, no INR check).`,
      note: CROWTHER_NOTE,
    };
  }
  const inr = pos(o.inr);
  if (inr === null) {
    return { valid: false, message: `Enter this morning’s INR for day ${day}.` };
  }
  const bands = CROWTHER_BANDS[day];
  const labels = CROWTHER_BAND_LABEL[day];
  let dose = null;
  let label = '';
  for (let k = 0; k < bands.length; k += 1) {
    if (bands[k][0](inr)) { dose = bands[k][1]; label = labels[k]; break; }
  }
  return {
    valid: true, day, dose, inrDriven: true, inr,
    band: `Day ${day}, ${label} (entered ${inr}): ${dose} mg.${dose === 0 ? ' Hold today’s dose and recheck the INR.' : ''}`,
    note: CROWTHER_NOTE,
  };
}
