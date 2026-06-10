// spec-v62 §3 Part B + §4 Part C: the bedside-necessary clinical computations
// in the confirmed ICU-infusion, med-surg, and OB/neonatal gaps, plus the two
// §3-converting reverse-table calculators (peds-dose, anticoag-reversal). Pure
// functions only. Citations live inline in lib/meta.js; renderers in
// views/group-f.js and views/group-v10.js wire these to the catalog.
//
// The two tiles named in spec-v62 §3.1 (norepi-equiv) and §3.3
// (neo-phototherapy) were deferred from wave 1 until their published constants
// could be pinned exactly; wave 2 (2026-06-10) ships them: `norepinephrineEquivalent`
// below encodes the Kotani 2023 proposed-standard conversion factors, and
// `neoPhototherapy` (lib/scoring-v6.js) reads the AAP-2022 phototherapy AND
// exchange-transfusion curves (Kemper 2022, Figs 5-6) at the same anchored
// fidelity already validated for `bhutani-bilirubin`.
//
// Contract (spec-v59 / spec-v53): every numeric field is validated through
// num() (lib/num.js), so a missing/non-finite/out-of-range value throws a
// TypeError/RangeError (caught by the renderer safe() wrapper) rather than
// producing NaN/Infinity. Every division guards its denominator. Enum-driven
// branches return null on an unrecognized selector (never a thrown bare Error,
// never a leaked token). Each dosing/replacement tile is a planning estimate,
// not an order; the renderer prints the "verify per local protocol" note
// (spec-v62 §5).

import { num, r1, r2 } from './num.js';

// --- 3.1 infusion-time-remaining — bag/syringe time-to-empty & rate-to-last --
// Utility-class arithmetic (like drip-rate): no clinical constant, just the
// most-asked bedside infusion question. ISMP smart-pump framing in meta.

export function infusionTimeRemaining({ volumeMl, rateMlHr }) {
  num('volumeMl', volumeMl, { min: 0, max: 100000 });
  num('rateMlHr', rateMlHr, { min: 0.001, max: 100000 });
  const hours = volumeMl / rateMlHr;
  return { hoursToEmpty: r2(hours), minutesToEmpty: Math.round(hours * 60) };
}

// Inverse: the rate (mL/hr) that makes a given volume last exactly N hours.
export function infusionRateToLast({ volumeMl, hours }) {
  num('volumeMl', volumeMl, { min: 0, max: 100000 });
  num('hours', hours, { min: 0.001, max: 1000 });
  return { rateMlHr: r1(volumeMl / hours) };
}

// --- 3.2 enteral-free-water — tube-feed free-water delivery & flush target ---
// ASPEN safe-practices framing. free water in formula = daily volume * fraction;
// flush = goal - formula-delivered (never negative), divided per shift.

export function enteralFreeWater({ dailyVolumeMl, freeWaterPct, goalMl }) {
  num('dailyVolumeMl', dailyVolumeMl, { min: 0, max: 20000 });
  num('freeWaterPct', freeWaterPct, { min: 0, max: 100 });
  num('goalMl', goalMl, { min: 0, max: 20000 });
  const fromFormula = dailyVolumeMl * (freeWaterPct / 100);
  const flush = Math.max(0, goalMl - fromFormula);
  return {
    freeWaterFromFormulaMl: r1(fromFormula),
    additionalFlushMl: r1(flush),
    flushPerShiftMlQ6h: r1(flush / 4),
  };
}

// --- 3.2 apap-24h-max — acetaminophen running total & ceiling ---------------
// Per-source contribution and a ceiling check. The renderer sums the sources
// and calls apapCeilingCheck against the selected ceiling.

export function apapSourceTotal({ doseMg, dosesPerDay }) {
  num('doseMg', doseMg, { min: 0, max: 10000 });
  num('dosesPerDay', dosesPerDay, { min: 0, max: 48 });
  return { totalMg: r1(doseMg * dosesPerDay) };
}

export function apapCeilingCheck({ totalMg, ceilingMg }) {
  num('totalMg', totalMg, { min: 0, max: 1000000 });
  num('ceilingMg', ceilingMg, { min: 1, max: 1000000 });
  return {
    over: totalMg > ceilingMg,
    remainingMg: r1(ceilingMg - totalMg),
    pctOfCeiling: r1((totalMg / ceilingMg) * 100),
  };
}

// --- 3.1 icu-nutrition-target — ICU energy & protein target -----------------
// ASPEN/SCCM 2016: 25-30 kcal/kg/day; 1.2-2.0 g/kg/day protein. Banded range
// from the user's weight and (optionally adjusted) band.

export function icuNutritionTarget({ weightKg, kcalLow, kcalHigh, proteinLow, proteinHigh }) {
  num('weightKg', weightKg, { min: 0.3, max: 500 });
  num('kcalLow', kcalLow, { min: 1, max: 100 });
  num('kcalHigh', kcalHigh, { min: 1, max: 100 });
  num('proteinLow', proteinLow, { min: 0.1, max: 10 });
  num('proteinHigh', proteinHigh, { min: 0.1, max: 10 });
  return {
    energyLowKcal: Math.round(weightKg * kcalLow),
    energyHighKcal: Math.round(weightKg * kcalHigh),
    proteinLowG: r1(weightKg * proteinLow),
    proteinHighG: r1(weightKg * proteinHigh),
  };
}

// --- 3.3 neonatal-feeding-volume — newborn enteral feeding volume -----------
// AAP Pediatric Nutrition: term newborn 120-180 mL/kg/day (typ. 150). Daily and
// per-feed volume for the selected frequency.

export function neonatalFeedingVolume({ weightKg, mlPerKgDay, feedsPerDay }) {
  num('weightKg', weightKg, { min: 0.3, max: 10 });
  num('mlPerKgDay', mlPerKgDay, { min: 1, max: 300 });
  num('feedsPerDay', feedsPerDay, { min: 1, max: 24 });
  const daily = weightKg * mlPerKgDay;
  return { dailyMl: r1(daily), perFeedMl: r1(daily / feedsPerDay) };
}

// --- 3.2 vte-prophylaxis-dose — enoxaparin by weight, indication, renal -----
// Lovenox US PI + CHEST (Gould 2012). Prophylaxis 40 mg q24h (30 mg q24h if
// CrCl <30); treatment 1 mg/kg q12h or 1.5 mg/kg q24h (1 mg/kg q24h if
// CrCl <30). Returns null on an unrecognized indication.

export function enoxaparinDose({ weightKg, crcl, indication, regimen }) {
  num('weightKg', weightKg, { min: 0.3, max: 500 });
  num('crcl', crcl, { min: 0, max: 300 });
  const renal = crcl < 30;
  const ind = String(indication);
  if (ind === 'prophylaxis') {
    return { doseMg: renal ? 30 : 40, interval: 'q24h', mgPerKg: null, renalAdjusted: renal };
  }
  if (ind === 'treatment') {
    const reg = String(regimen);
    let mgPerKg;
    let interval;
    if (renal) { mgPerKg = 1; interval = 'q24h'; }
    else if (reg === 'daily') { mgPerKg = 1.5; interval = 'q24h'; }
    else { mgPerKg = 1; interval = 'q12h'; }
    return { doseMg: r1(weightKg * mgPerKg), interval, mgPerKg, renalAdjusted: renal };
  }
  return null;
}

// --- 3.3 oxytocin-titration — mU/min <-> mL/hr -------------------------------
// ACOG Induction of Labor. The pump runs mL/hr; the order is mU/min. Concentration
// is milliunits per mL (e.g. 30 units/500 mL = 60 mU/mL). Pure conversion, both
// directions.

export function oxytocinConvert({ milliunitsPerMl, doseMilliunitsMin, rateMlHr }) {
  num('milliunitsPerMl', milliunitsPerMl, { min: 0.001, max: 100000 });
  num('doseMilliunitsMin', doseMilliunitsMin, { min: 0, max: 100000 });
  num('rateMlHr', rateMlHr, { min: 0, max: 100000 });
  return {
    rateFromDoseMlHr: r2((doseMilliunitsMin * 60) / milliunitsPerMl),
    doseFromRateMuMin: r2((rateMlHr * milliunitsPerMl) / 60),
  };
}

// --- 3.1 norepi-equiv — norepinephrine-equivalent total vasopressor dose -----
// Kotani Y, et al. An updated "norepinephrine equivalent" score in intensive
// care as a marker of shock severity. Crit Care. 2023;27:29 (proposed standard);
// Goradia S, et al. J Crit Care. 2021;61:233-240. NEE (mcg/kg/min) is the sum of
// each agent's dose times its published factor. Each agent is entered in its
// native units (the factor carries the unit conversion): norepinephrine,
// epinephrine and dopamine in mcg/kg/min; phenylephrine in mcg/kg/min;
// vasopressin in units/min (not weight-keyed); angiotensin II in ng/kg/min.

export const NEE_FACTORS = Object.freeze({
  norepinephrine: 1,       // x mcg/kg/min
  epinephrine: 1,          // x mcg/kg/min
  dopamine: 1 / 100,       // x mcg/kg/min
  phenylephrine: 0.06,     // x mcg/kg/min
  vasopressin: 2.5,        // x units/min
  angiotensin2: 0.0025,    // x ng/kg/min
});

export function norepinephrineEquivalent({
  norepinephrine = 0, epinephrine = 0, dopamine = 0,
  phenylephrine = 0, vasopressin = 0, angiotensin2 = 0,
}) {
  num('norepinephrine', norepinephrine, { min: 0, max: 100 });
  num('epinephrine', epinephrine, { min: 0, max: 100 });
  num('dopamine', dopamine, { min: 0, max: 100 });
  num('phenylephrine', phenylephrine, { min: 0, max: 100 });
  num('vasopressin', vasopressin, { min: 0, max: 10 });
  num('angiotensin2', angiotensin2, { min: 0, max: 1000 });
  const contributions = {
    norepinephrine: norepinephrine * NEE_FACTORS.norepinephrine,
    epinephrine: epinephrine * NEE_FACTORS.epinephrine,
    dopamine: dopamine * NEE_FACTORS.dopamine,
    phenylephrine: phenylephrine * NEE_FACTORS.phenylephrine,
    vasopressin: vasopressin * NEE_FACTORS.vasopressin,
    angiotensin2: angiotensin2 * NEE_FACTORS.angiotensin2,
  };
  const total = Object.values(contributions).reduce((a, b) => a + b, 0);
  return {
    totalNeeMcgKgMin: r2(total),
    contributions: Object.fromEntries(
      Object.entries(contributions).map(([k, v]) => [k, r2(v)]),
    ),
  };
}

// --- 4.2 peds-dose (converted) — weight-driven pediatric quick-dose panel ----
// Static-table → calculator. The same curated common-pediatric drugs the old
// reference table listed, computed to actual mg at the entered weight with the
// per-dose cap applied and a flag when the cap binds. Estimate, not an order.

export const PEDS_DOSE_PANEL = Object.freeze([
  { drug: 'Acetaminophen (PO/PR)', lowPerKg: 10, highPerKg: 15, maxSingleMg: 1000, freq: 'q4-6h', note: 'Max 75 mg/kg/day' },
  { drug: 'Ibuprofen (PO)', lowPerKg: 5, highPerKg: 10, maxSingleMg: 400, freq: 'q6-8h', note: 'Avoid age <6 mo, dehydration' },
  { drug: 'Amoxicillin (PO)', lowPerKg: 25, highPerKg: 50, maxSingleMg: 1000, freq: 'divided/day', note: 'High-dose 80-100 mg/kg/day for AOM' },
  { drug: 'Dexamethasone (croup)', lowPerKg: 0.6, highPerKg: 0.6, maxSingleMg: 16, freq: 'once', note: 'Single dose PO/IM/IV' },
  { drug: 'Epinephrine IM (anaphylaxis)', lowPerKg: 0.01, highPerKg: 0.01, maxSingleMg: 0.5, freq: 'q5-15min PRN', note: '1 mg/mL concentration' },
  { drug: 'Ondansetron (PO/IV)', lowPerKg: 0.1, highPerKg: 0.15, maxSingleMg: 4, freq: 'q8h PRN', note: 'Max 4 mg/dose pediatric' },
]);

export function pedsDosePanel({ weightKg }) {
  num('weightKg', weightKg, { min: 0.3, max: 150 });
  return {
    weightKg,
    rows: PEDS_DOSE_PANEL.map((d) => {
      const low = Math.min(d.lowPerKg * weightKg, d.maxSingleMg);
      const high = Math.min(d.highPerKg * weightKg, d.maxSingleMg);
      return {
        drug: d.drug,
        lowMg: r2(low),
        highMg: r2(high),
        capped: d.highPerKg * weightKg > d.maxSingleMg,
        freq: d.freq,
        note: d.note,
      };
    }),
  };
}

// --- 4.1 anticoag-reversal (converted) — weight/INR-driven reversal dose -----
// Static-table → calculator. Neurocritical Care Society / SCCM (Frontera 2016) +
// agent labels. 4F-PCC by INR band (Kcentra label: dosing weight capped at
// 100 kg; INR 2-<4 = 25 u/kg max 2500, 4-6 = 35 u/kg max 3500, >6 = 50 u/kg max
// 5000), idarucizumab fixed 5 g, andexanet low/high per ANNEXA-4, protamine
// 1 mg/100 units (max 50 mg single dose). Estimate, not an order.

export function anticoagReversalDose({ weightKg, inr, agent }) {
  num('weightKg', weightKg, { min: 0.3, max: 500 });
  num('inr', inr, { min: 0, max: 30 });
  const a = String(agent);
  const dosingW = Math.min(weightKg, 100);
  if (a === 'warfarin') {
    if (inr < 2) return { agent: a, product: '4F-PCC (e.g. Kcentra)', units: null, note: 'INR <2: 4F-PCC dosing not defined by the label band; reassess indication.' };
    let unitsPerKg;
    let maxUnits;
    if (inr < 4) { unitsPerKg = 25; maxUnits = 2500; }
    else if (inr <= 6) { unitsPerKg = 35; maxUnits = 3500; }
    else { unitsPerKg = 50; maxUnits = 5000; }
    return {
      agent: a,
      product: '4F-PCC (e.g. Kcentra)',
      units: Math.min(Math.round(unitsPerKg * dosingW), maxUnits),
      unitsPerKg,
      adjunct: 'Vitamin K 10 mg IV',
      capped: weightKg > 100,
    };
  }
  if (a === 'dabigatran') {
    return { agent: a, product: 'Idarucizumab', doseG: 5, note: 'Fixed 5 g IV (two 2.5 g vials); hemodialysis as adjunct.' };
  }
  if (a === 'apixaban-rivaroxaban') {
    return {
      agent: a,
      product: 'Andexanet alfa',
      altPcc4Units: Math.round(50 * dosingW),
      note: 'Low-dose (400 mg bolus + 4 mg/min x 120 min) or high-dose (800 mg bolus + 8 mg/min x 120 min) per ANNEXA-4, by agent, dose, and time since last dose. If andexanet unavailable: 4F-PCC 50 units/kg.',
    };
  }
  return null;
}

// Protamine reversal of heparin (UFH): 1 mg per 100 units, single-dose max 50 mg.
export function protamineDose({ heparinUnits }) {
  num('heparinUnits', heparinUnits, { min: 0, max: 1000000 });
  const raw = heparinUnits / 100;
  return { protamineMg: r1(Math.min(raw, 50)), capped: raw > 50 };
}

// --- spec-v65 §2.1 o2-cylinder-duration — oxygen cylinder time-to-empty ------
// Usable volume = (gauge psi - safe residual psi) x cylinder factor (L/psi);
// minutes to residual = usable volume / flow. Cylinder factors are physical
// constants of the cylinder geometry (Egan's Fundamentals of Respiratory Care,
// 12th ed.), not a derived clinical constant -- utility-class arithmetic, the
// respiratory-safety analog of infusion-time-remaining (which is liquid IV-bag
// arithmetic). Every denominator is guarded; a gauge at or below the residual
// yields a zero usable volume and an explicit flag rather than a negative
// duration.
export const O2_CYLINDER_FACTORS = Object.freeze({
  D: 0.16, E: 0.28, M: 1.56, G: 2.41, H: 3.14,
});

export function o2CylinderDuration({
  factorLPsi, gaugePsi, flowLpm, residualPsi = 200, targetMinutes = 0,
}) {
  num('factorLPsi', factorLPsi, { min: 0.001, max: 100 });
  num('gaugePsi', gaugePsi, { min: 0, max: 10000 });
  num('flowLpm', flowLpm, { min: 0, max: 100 });
  num('residualPsi', residualPsi, { min: 0, max: 10000 });
  num('targetMinutes', targetMinutes, { min: 0, max: 100000 });
  const usableVolumeL = Math.max(0, (gaugePsi - residualPsi) * factorLPsi);
  const atOrBelowResidual = gaugePsi <= residualPsi;
  const minutesRemaining = flowLpm > 0 ? Math.floor(usableVolumeL / flowLpm) : null;
  const maxFlowLpm = targetMinutes > 0 ? usableVolumeL / targetMinutes : null;
  return {
    usableVolumeL: r1(usableVolumeL),
    minutesRemaining,
    atOrBelowResidual,
    maxFlowLpm: maxFlowLpm == null ? null : r2(maxFlowLpm),
  };
}

// --- spec-v65 §2.2 minute-ventilation — V̇E & target-PaCO2 rate adjustment ----
// V̇E = respiratory rate x tidal volume (Marino, The ICU Book, 4th ed.). When
// ideal body weight is given, alveolar ventilation subtracts anatomic dead space
// (~2.2 mL/kg IBW; West, Respiratory Physiology). Since PaCO2 is proportional to
// 1 / alveolar ventilation at a fixed CO2 production, the rate that reaches a
// target PaCO2 at the current tidal volume scales with the current/target PaCO2
// ratio: requiredRate = RR x (currentPaCO2 / targetPaCO2). Physiology/utility-
// class. Zero respiratory rate or zero target PaCO2 returns null for the rate
// adjustment rather than dividing by zero.
export function minuteVentilation({
  respiratoryRate, tidalVolumeMl, ibwKg = 0, currentPaco2 = 0, targetPaco2 = 0,
}) {
  num('respiratoryRate', respiratoryRate, { min: 0, max: 80 });
  num('tidalVolumeMl', tidalVolumeMl, { min: 0, max: 3000 });
  num('ibwKg', ibwKg, { min: 0, max: 250 });
  num('currentPaco2', currentPaco2, { min: 0, max: 300 });
  num('targetPaco2', targetPaco2, { min: 0, max: 300 });
  const minuteVentilationLMin = (respiratoryRate * tidalVolumeMl) / 1000;
  let alveolarVentilationLMin = null;
  if (ibwKg > 0) {
    const effectiveVt = Math.max(0, tidalVolumeMl - (2.2 * ibwKg));
    alveolarVentilationLMin = (respiratoryRate * effectiveVt) / 1000;
  }
  const requiredRate = (currentPaco2 > 0 && targetPaco2 > 0 && respiratoryRate > 0)
    ? respiratoryRate * (currentPaco2 / targetPaco2)
    : null;
  return {
    minuteVentilationLMin: r2(minuteVentilationLMin),
    alveolarVentilationLMin: alveolarVentilationLMin == null ? null : r2(alveolarVentilationLMin),
    requiredRate: requiredRate == null ? null : r1(requiredRate),
  };
}

// --- spec-v65 §2.3 cerebral-perfusion-pressure — CPP = MAP - ICP -------------
// Carney N, et al. Guidelines for the Management of Severe Traumatic Brain
// Injury, 4th ed. Neurosurgery 2017;80(1):6-15. CPP = MAP - ICP; recommended
// target band 60-70 mmHg. MAP is taken directly when measured, else computed
// from SBP/DBP by the same ((2*DBP)+SBP)/3 formula as the `map` tile. A negative
// CPP (ICP > MAP) is reported with an explicit critical-low flag, never hidden.
export function cerebralPerfusionPressure({ map = 0, sbp = 0, dbp = 0, icp }) {
  num('map', map, { min: 0, max: 300 });
  num('sbp', sbp, { min: 0, max: 400 });
  num('dbp', dbp, { min: 0, max: 300 });
  num('icp', icp, { min: 0, max: 200 });
  let mapVal = map > 0 ? map : null;
  if (mapVal == null && sbp > 0 && dbp > 0) mapVal = ((2 * dbp) + sbp) / 3;
  if (mapVal == null) return null;
  const cpp = mapVal - icp;
  let band;
  if (cpp < 60) band = 'Below the 60-70 mmHg target: cerebral ischemia risk -- raise MAP or lower ICP.';
  else if (cpp <= 70) band = '60-70 mmHg: recommended Brain Trauma Foundation 2017 target band.';
  else band = 'Above the 60-70 mmHg target: caution maintaining with aggressive fluids/pressors (ARDS risk).';
  return {
    map: r1(mapVal),
    cpp: r1(cpp),
    band,
    critical: cpp < 60,
    negative: cpp < 0,
  };
}
