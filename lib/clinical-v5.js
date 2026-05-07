// spec-v5 §4: new clinical math, indices, and scoring tools.
// Pure functions only. Citations live alongside each block and in
// docs/clinical-citations.md. Renderers in views/group-v5.js wire these
// to the home grid.

const r1 = (n) => Math.round(n * 10) / 10;
const r2 = (n) => Math.round(n * 100) / 100;
const r3 = (n) => Math.round(n * 1000) / 1000;

function num(name, v, { min = -Infinity, max = Infinity } = {}) {
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new TypeError(`${name} must be a finite number`);
  if (v < min || v > max) throw new RangeError(`${name} out of range [${min}, ${max}]`);
  return v;
}

// --- T1: Sodium correction rate (Adrogue-Madias) -------------------------
// Hyponatremia or hypernatremia. TBW (L) = weight (kg) × (0.6 male / 0.5 female,
// 0.5 male elderly / 0.45 female elderly). Change in serum Na per liter of
// infusate = (infusate_Na − serum_Na) / (TBW + 1). To target a 24 h change of
// `targetChangePer24h` mEq/L, infusion volume = targetChangePer24h /
// changePerLiter. Safety bounds: 8 mEq/L/24h max for chronic, 10 mEq/L/24h
// for acute, to limit osmotic demyelination (hyponatremia) or cerebral edema
// (hypernatremia).
//
// Citation: Adrogue HJ, Madias NE. NEJM 2000;342:1493-1499.
const INFUSATE_NA = {
  '3pct-saline': 513,
  '0.9-saline': 154,
  '0.45-saline': 77,
  'lr': 130,
  'd5w': 0,
};

// `acuity`: 'chronic' (default, ceiling 8 mEq/L/24h, osmotic-demyelination
// risk) or 'acute' (onset < 48 h documented; ceiling 10-12 mEq/L/24h).
// `targetChangePer24h` is the *desired* magnitude of change; sign is
// derived from `direction`. Returns a `directionMismatch` flag if the
// chosen infusate would push Na the wrong way (e.g. D5W in hyponatremia).
const HYPONATREMIA_RAISERS = new Set(['3pct-saline', '0.9-saline']);
const HYPERNATREMIA_LOWERERS = new Set(['d5w', '0.45-saline']);

export function sodiumCorrection({ weightKg, sex, age, currentNa, infusate, targetChangePer24h, acuity = 'chronic' }) {
  num('weightKg', weightKg, { min: 1, max: 400 });
  num('currentNa', currentNa, { min: 90, max: 200 });
  num('targetChangePer24h', targetChangePer24h, { min: 0.1, max: 12 });
  if (!Object.prototype.hasOwnProperty.call(INFUSATE_NA, infusate)) throw new TypeError(`unknown infusate: ${infusate}`);
  if (acuity !== 'acute' && acuity !== 'chronic') throw new RangeError('acuity must be "acute" or "chronic"');
  let factor;
  const elderly = age != null && age >= 65;
  if (sex === 'M') factor = elderly ? 0.5 : 0.6;
  else if (sex === 'F') factor = elderly ? 0.45 : 0.5;
  else throw new RangeError('sex must be "M" or "F"');
  const tbw = weightKg * factor;
  const infusateNa = INFUSATE_NA[infusate];
  const changePerLiter = (infusateNa - currentNa) / (tbw + 1);
  const direction = currentNa < 135 ? 'hyponatremia' : (currentNa > 145 ? 'hypernatremia' : 'normonatremic');

  // Sign of desired change: + for hyponatremia (raise), − for hypernatremia
  // (lower). For normonatremia we default to + and let the caller decide.
  const desiredSign = direction === 'hypernatremia' ? -1 : 1;
  const desiredChange = desiredSign * targetChangePer24h;
  const directionMismatch =
    (direction === 'hyponatremia' && !HYPONATREMIA_RAISERS.has(infusate)) ||
    (direction === 'hypernatremia' && !HYPERNATREMIA_LOWERERS.has(infusate));

  // Volume is only physically meaningful when the infusate moves Na in the
  // desired direction. Otherwise return null and surface the warning.
  const sameSign = changePerLiter !== 0 && Math.sign(changePerLiter) === Math.sign(desiredChange);
  const volumeLiters = sameSign ? desiredChange / changePerLiter : null;
  const ratePerHour = volumeLiters != null ? (volumeLiters * 1000) / 24 : null;

  // Per-Adrogue total Na deficit (hyponatremia, target 140) or excess
  // (hypernatremia, target 140). Informational; rate-based dosing is
  // preferred clinically.
  let totalSodiumDeficitMeq = null;
  if (direction === 'hyponatremia') totalSodiumDeficitMeq = Math.round((140 - currentNa) * (tbw + 1));
  else if (direction === 'hypernatremia') totalSodiumDeficitMeq = Math.round((140 - currentNa) * (tbw + 1)); // negative = excess

  const safetyCap = acuity === 'acute' ? 10 : 8;
  const overCap = targetChangePer24h > safetyCap;
  return {
    tbwLiters: r2(tbw),
    direction,
    acuity,
    totalSodiumDeficitMeq,
    changePerLiterInfusate: r3(changePerLiter),
    volumeLiters: volumeLiters != null ? r2(volumeLiters) : null,
    rateMlPerHour: ratePerHour != null ? r1(ratePerHour) : null,
    safetyCap,
    overCap,
    directionMismatch,
    safetyNote: overCap
      ? `Target change ${targetChangePer24h} mEq/L/24h exceeds the ${acuity} ceiling of ${safetyCap} mEq/L/24h.`
      : `Within the ${acuity} ceiling of ${safetyCap} mEq/L/24h.`,
    directionNote: directionMismatch
      ? `Selected infusate will not move Na toward target in ${direction}.`
      : null,
  };
}

// --- T2: Free water deficit (hypernatremia) ------------------------------
// Deficit (L) = TBW × ([Na_current / Na_target] − 1). Replace over 48 h to
// avoid cerebral edema; targetNa typically 145.
// Citation: Adrogue-Madias.
export function freeWaterDeficit({ weightKg, sex, age, currentNa, targetNa = 145, replaceOverHours = 48 }) {
  num('weightKg', weightKg, { min: 1, max: 400 });
  num('currentNa', currentNa, { min: 130, max: 200 });
  num('targetNa', targetNa, { min: 130, max: 160 });
  num('replaceOverHours', replaceOverHours, { min: 1, max: 168 });
  if (currentNa <= targetNa) {
    throw new RangeError('currentNa must exceed targetNa; free-water deficit only applies to hypernatremia');
  }
  let factor;
  const elderly = age != null && age >= 65;
  if (sex === 'M') factor = elderly ? 0.5 : 0.6;
  else if (sex === 'F') factor = elderly ? 0.45 : 0.5;
  else throw new RangeError('sex must be "M" or "F"');
  const tbw = weightKg * factor;
  const deficitL = tbw * (currentNa / targetNa - 1);
  const ratePerHourMl = (deficitL * 1000) / replaceOverHours;
  // Implied rate of Na drop assuming free-water-only replacement.
  const impliedNaDropPer24h = ((currentNa - targetNa) / replaceOverHours) * 24;
  const exceedsSafeDrop = impliedNaDropPer24h > 10;
  return {
    tbwLiters: r2(tbw),
    deficitLiters: r2(deficitL),
    replacementRateMlPerHour: r1(ratePerHourMl),
    impliedNaDropPer24h: r1(impliedNaDropPer24h),
    safetyNote: exceedsSafeDrop
      ? `Implied Na drop ${r1(impliedNaDropPer24h)} mEq/L/24h exceeds the 10 mEq/L/24h ceiling; extend replaceOverHours or raise targetNa.`
      : 'Within the 10 mEq/L/24h ceiling.',
  };
}

// --- T3: Iron deficit (Ganzoni formula) ----------------------------------
// mg = weight × (target_Hb − actual_Hb) × 2.4 + iron stores.
// Adults > 35 kg: stores = 500 mg. Pediatric < 35 kg: stores = 15 × weight.
// Default targetHb = 15 g/dL.
// Citation: Ganzoni AM. Schweiz Med Wochenschr 1970;100:301-303.
export function ironDeficitGanzoni({ weightKg, currentHb, targetHb = 15, ironStoresMg }) {
  num('weightKg', weightKg, { min: 1, max: 400 });
  num('currentHb', currentHb, { min: 1, max: 25 });
  num('targetHb', targetHb, { min: 5, max: 25 });
  if (currentHb >= targetHb) {
    throw new RangeError('currentHb must be below targetHb; Ganzoni only applies when replacement is needed');
  }
  let stores = ironStoresMg;
  if (stores == null) stores = weightKg >= 35 ? 500 : 15 * weightKg;
  num('ironStoresMg', stores, { min: 0, max: 2000 });
  const replacementMg = weightKg * (targetHb - currentHb) * 2.4;
  const totalMg = replacementMg + stores;
  return {
    replacementComponentMg: Math.round(replacementMg),
    ironStoresMg: Math.round(stores),
    totalDeficitMg: Math.round(totalMg),
  };
}

// --- T4: Predicted body weight + ARDSnet tidal volume target -------------
// PBW (Devine, used in ARMA/ARDSnet): male 50 + 2.3 × (height_in − 60),
// female 45.5 + 2.3 × (height_in − 60). ARDS lung-protective Vt 4-8 mL/kg
// PBW; default target 6.
// Citations: Devine BJ. Drug Intell Clin Pharm 1974;8:650-655.
//            ARDSNet. NEJM 2000;342:1301-1308.
export function pbwArdsnet({ heightCm, sex, mlPerKg = 6 }) {
  num('heightCm', heightCm, { min: 100, max: 230 });
  num('mlPerKg', mlPerKg, { min: 4, max: 8 });
  const heightIn = heightCm / 2.54;
  let pbw;
  if (sex === 'M') pbw = 50 + 2.3 * (heightIn - 60);
  else if (sex === 'F') pbw = 45.5 + 2.3 * (heightIn - 60);
  else throw new RangeError('sex must be "M" or "F"');
  // Devine equation is validated above 60 inches (152.4 cm). Below that,
  // surface a warning rather than silently clamping to zero.
  const belowDevineFloor = heightIn < 60;
  if (pbw < 0) pbw = 0;
  const vt = pbw * mlPerKg;
  const vtLow = pbw * 4;
  const vtHigh = pbw * 8;
  return {
    pbwKg: r1(pbw),
    vtTargetMl: Math.round(vt),
    vtRangeMl: { low: Math.round(vtLow), high: Math.round(vtHigh) },
    warning: belowDevineFloor
      ? 'Height below 60 in (152.4 cm); Devine PBW formula is not validated for pediatric/short-stature ventilation. Use a peds-specific approach.'
      : null,
  };
}

// --- T5: Rapid Shallow Breathing Index (RSBI) ----------------------------
// RSBI = RR / Vt(L). Yang & Tobin: < 105 predicts weaning success;
// > 105 predicts failure.
// Citation: Yang KL, Tobin MJ. NEJM 1991;324:1445-1450.
export function rsbi({ respiratoryRate, tidalVolumeMl }) {
  num('respiratoryRate', respiratoryRate, { min: 1, max: 80 });
  num('tidalVolumeMl', tidalVolumeMl, { min: 50, max: 2000 });
  const value = respiratoryRate / (tidalVolumeMl / 1000);
  return {
    rsbi: r1(value),
    interpretation: value < 105 ? 'Likely to tolerate weaning (< 105).' : 'Likely to fail weaning (>= 105).',
  };
}

// --- T6: Light's criteria (pleural effusion) -----------------------------
// Exudate if any one is true:
//   pleural protein / serum protein > 0.5
//   pleural LDH / serum LDH > 0.6
//   pleural LDH > 2/3 × upper limit of serum LDH (default ULN 222 U/L)
// Citation: Light RW. Ann Intern Med 1972;77:507-513.
export function lightsCriteria({ pleuralProtein, serumProtein, pleuralLdh, serumLdh, serumLdhUln = 222 }) {
  num('pleuralProtein', pleuralProtein, { min: 0, max: 15 });
  num('serumProtein', serumProtein, { min: 1, max: 15 });
  num('pleuralLdh', pleuralLdh, { min: 0, max: 5000 });
  num('serumLdh', serumLdh, { min: 1, max: 5000 });
  num('serumLdhUln', serumLdhUln, { min: 50, max: 1000 });
  const ratioProtein = pleuralProtein / serumProtein;
  const ratioLdh = pleuralLdh / serumLdh;
  const ldhVsUln = pleuralLdh / serumLdhUln;
  const c1 = ratioProtein > 0.5;
  const c2 = ratioLdh > 0.6;
  const c3 = ldhVsUln > 2 / 3;
  const exudate = c1 || c2 || c3;
  return {
    proteinRatio: r2(ratioProtein),
    ldhRatio: r2(ratioLdh),
    ldhVsUlnRatio: r2(ldhVsUln),
    criterionProtein: c1,
    criterionLdhRatio: c2,
    criterionLdhVsUln: c3,
    classification: exudate ? 'Exudate' : 'Transudate',
  };
}

// --- T7: Mentzer index ---------------------------------------------------
// MCV / RBC count (× 10^12/L). < 13 favors thalassemia, > 13 favors
// iron deficiency. = 13 indeterminate.
// Citation: Mentzer WC. Lancet 1973;1:882.
export function mentzerIndex({ mcvFl, rbcMillionsPerUl }) {
  num('mcvFl', mcvFl, { min: 30, max: 200 });
  num('rbcMillionsPerUl', rbcMillionsPerUl, { min: 0.5, max: 10 });
  const value = mcvFl / rbcMillionsPerUl;
  let interp;
  if (value < 13) interp = 'Favors beta-thalassemia trait.';
  else if (value > 13) interp = 'Favors iron-deficiency anemia.';
  else interp = 'Indeterminate.';
  return { index: r1(value), interpretation: interp };
}

// --- T8: SAAG (serum-ascites albumin gradient) ---------------------------
// SAAG = serum albumin − ascites albumin (g/dL). >= 1.1 portal HTN;
// < 1.1 non-portal etiology.
// Citation: Runyon BA. Hepatology 1992;16:240-245.
export function saag({ serumAlbumin, ascitesAlbumin }) {
  num('serumAlbumin', serumAlbumin, { min: 0.1, max: 8 });
  num('ascitesAlbumin', ascitesAlbumin, { min: 0, max: 8 });
  const value = serumAlbumin - ascitesAlbumin;
  return {
    saag: r1(value),
    classification: value >= 1.1 ? 'Portal hypertension' : 'Non-portal etiology',
  };
}

// --- T9: R-factor (drug-induced liver injury pattern) --------------------
// R = (ALT/ALT_ULN) / (ALP/ALP_ULN).
// > 5 hepatocellular; < 2 cholestatic; 2-5 mixed.
// Citation: Bénichou C. J Hepatol 1990;11:272-276 (CIOMS).
export function rFactorLiver({ alt, altUln, alp, alpUln }) {
  num('alt', alt, { min: 0, max: 50000 });
  num('altUln', altUln, { min: 1, max: 500 });
  num('alp', alp, { min: 0.1, max: 20000 });
  num('alpUln', alpUln, { min: 1, max: 500 });
  const r = (alt / altUln) / (alp / alpUln);
  let pattern;
  if (r > 5) pattern = 'Hepatocellular';
  else if (r < 2) pattern = 'Cholestatic';
  else pattern = 'Mixed';
  return { rFactor: r1(r), pattern };
}

// --- T10: KDIGO AKI staging ----------------------------------------------
// Stage by whichever criterion (creatinine OR urine output) is worst.
//   Stage 1: SCr 1.5-1.9 × baseline OR rise >= 0.3 in 48 h; UO < 0.5 ×
//            6-12 h
//   Stage 2: SCr 2.0-2.9 × baseline; UO < 0.5 × 12+ h
//   Stage 3: SCr 3.0+ × baseline OR SCr >= 4.0 with acute rise OR
//            initiation of RRT; UO < 0.3 × 24 h or anuria 12+ h
// Inputs: baselineCr, currentCr, riseInLast48h (mg/dL), uoMlPerKgPerHour,
//         uoDurationHours, anuriaHours (>= 12 → triggers stage 3 by UO),
//         rrtInitiated.
// Citation: KDIGO Clinical Practice Guideline for AKI. Kidney Int Suppl
// 2012;2:1-138.
export function kdigoAki({ baselineCr, currentCr, riseInLast48h, uoMlPerKgPerHour, uoDurationHours, anuriaHours = 0, rrtInitiated = false }) {
  num('baselineCr', baselineCr, { min: 0.1, max: 20 });
  num('currentCr', currentCr, { min: 0.1, max: 30 });
  const ratio = currentCr / baselineCr;
  // KDIGO requires an acute injury context for any creatinine-based stage:
  // either rise ≥0.3 mg/dL within 48 h, or ratio ≥1.5× baseline within 7 d.
  // Without that context, an elevated SCr is chronic kidney disease, not AKI.
  const acuteRise = (riseInLast48h != null && riseInLast48h >= 0.3) || ratio >= 1.5;
  let crStage = 0;
  if (rrtInitiated) {
    crStage = 3;
  } else if (acuteRise) {
    if (ratio >= 3 || currentCr >= 4) crStage = 3;
    else if (ratio >= 2) crStage = 2;
    else crStage = 1;
  }

  let uoStage = 0;
  if (uoMlPerKgPerHour != null && uoDurationHours != null) {
    if (anuriaHours >= 12 || (uoMlPerKgPerHour < 0.3 && uoDurationHours >= 24)) uoStage = 3;
    else if (uoMlPerKgPerHour < 0.5 && uoDurationHours >= 12) uoStage = 2;
    else if (uoMlPerKgPerHour < 0.5 && uoDurationHours >= 6) uoStage = 1;
  }

  const stage = Math.max(crStage, uoStage);
  return {
    creatinineRatio: r2(ratio),
    creatinineStage: crStage,
    urineOutputStage: uoStage,
    stage,
    interpretation: stage === 0 ? 'Does not meet KDIGO AKI criteria.' : `KDIGO AKI Stage ${stage}.`,
  };
}

// --- T11: Modified Sgarbossa (Smith) -------------------------------------
// STEMI in LBBB / paced rhythm. Three criteria, any positive = positive
// study:
//   A: concordant ST elevation >= 1 mm in any lead
//   B: concordant ST depression >= 1 mm in V1, V2, or V3
//   C: ST/S ratio <= -0.25 in any lead with discordant ST elevation
//      >= 1 mm
// Citation: Smith SW et al. Ann Emerg Med 2012;60:766-776.
export function modifiedSgarbossa({ concordantElevation, concordantDepressionV1V3, stToSRatioBelowMinus025 }) {
  const a = !!concordantElevation;
  const b = !!concordantDepressionV1V3;
  const c = !!stToSRatioBelowMinus025;
  const positive = a || b || c;
  return {
    criterionA: a,
    criterionB: b,
    criterionC: c,
    positive,
    interpretation: positive
      ? 'Positive: consistent with acute coronary occlusion in LBBB / paced rhythm.'
      : 'Negative: does not meet modified Sgarbossa criteria.',
  };
}

// --- T12: Revised Cardiac Risk Index (Lee) -------------------------------
// Six binary risk factors. Risk of major cardiac event (cardiac death, MI,
// or non-fatal cardiac arrest) by count, per Lee 1999 derivation cohort:
// 0 → 0.4%, 1 → 0.9%, 2 → 6.6%, >= 3 → ≥11%.
// Citation: Lee TH et al. Circulation 1999;100:1043-1049.
const RCRI_FACTORS = [
  'highRiskSurgery',          // suprainguinal vascular, intraperitoneal, intrathoracic
  'ischemicHeartDisease',
  'congestiveHeartFailure',
  'cerebrovascularDisease',
  'insulinDependentDm',
  'creatinineOver2',
];
export function rcri(input) {
  const present = RCRI_FACTORS.filter((k) => !!input[k]);
  const count = present.length;
  let riskPct;
  let riskBand;
  if (count === 0)      { riskPct = 0.4;  riskBand = 'Class I (very low)'; }
  else if (count === 1) { riskPct = 0.9;  riskBand = 'Class II (low)'; }
  else if (count === 2) { riskPct = 6.6;  riskBand = 'Class III (moderate)'; }
  else                  { riskPct = 11.0; riskBand = 'Class IV (high; >=11%)'; }
  return {
    factorsPresent: present,
    count,
    majorCardiacEventRiskPct: riskPct,
    riskBand,
  };
}

// --- T13: Pediatric Early Warning Score (PEWS, Monaghan 2005) ------------
// Three subscales 0-3, total 0-9. Trigger thresholds vary by institution;
// >=4 commonly triggers escalation, >=7 commonly triggers code-team / PICU.
// Citation: Monaghan A. Paediatr Nurs 2005;17:32-35.
export function pews({ behaviorScore, cardiovascularScore, respiratoryScore }) {
  for (const [name, v] of [['behaviorScore', behaviorScore], ['cardiovascularScore', cardiovascularScore], ['respiratoryScore', respiratoryScore]]) {
    num(name, v, { min: 0, max: 3 });
    if (!Number.isInteger(v)) throw new RangeError(`${name} must be an integer 0-3`);
  }
  const total = behaviorScore + cardiovascularScore + respiratoryScore;
  let band;
  if (total >= 7) band = 'High concern: consider code team / PICU consult.';
  else if (total >= 4) band = 'Escalate: bedside provider review.';
  else band = 'Low concern: continue routine monitoring.';
  return { total, band };
}

// --- T16: AVPU <-> GCS quick reference -----------------------------------
// AVPU (Alert / Verbal / Pain / Unresponsive) maps loosely to GCS bands.
// McNarry & Goldhill, Anaesthesia 2004;59:34-37.
const AVPU_TO_GCS = {
  A: { typical: 15, range: [14, 15], note: 'Alert and oriented.' },
  V: { typical: 13, range: [12, 14], note: 'Responds to voice.' },
  P: { typical: 8,  range: [7, 9],   note: 'Responds to pain only.' },
  U: { typical: 3,  range: [3, 6],   note: 'Unresponsive.' },
};
export function avpuToGcs(level) {
  const key = String(level || '').toUpperCase().trim();
  if (!AVPU_TO_GCS.hasOwnProperty(key)) throw new RangeError('AVPU must be A, V, P, or U');
  return { level: key, ...AVPU_TO_GCS[key] };
}
