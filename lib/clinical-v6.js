// spec-v55: bedside hematology, renal/acid-base, and oxygenation math.
// Pure functions only. Citations live inline in lib/meta.js and in
// docs/clinical-citations.md; renderers in views/group-v7.js wire these to the
// home grid. r1/r2/r3, num, fmt come from lib/num.js (spec-v53 §4.1) — no
// re-declaration. Every division denominator is guarded: a non-positive or
// conditions-invalid denominator returns null so the renderer shows a fmt()
// fallback, never NaN/Infinity/undefined (spec-v53 §3).

import { r1, r2, r3, num } from './num.js';

// --- 2.1 anc: Absolute Neutrophil Count + CTCAE neutropenia grade ----------
// ANC (cells/µL) = WBC (K/µL) × (segs% + bands%) × 10. WBC in K/µL == ×10⁹/L.
// Grades per CTCAE v5.0: normal ≥1500, mild 1000–1499, moderate 500–999,
// severe <500 (<500 = neutropenic precautions; fever is an emergency).
export function anc({ wbc, segs, bands }) {
  num('wbc', wbc, { min: 0, max: 500 });
  num('segs', segs, { min: 0, max: 100 });
  num('bands', bands, { min: 0, max: 100 });
  const fraction = segs + bands;
  if (fraction > 100) throw new RangeError('segs + bands must be <= 100');
  const ancVal = Math.round(wbc * fraction * 10); // cells/µL, integer
  let grade;
  if (ancVal >= 1500) grade = 'Normal (>=1500/uL)';
  else if (ancVal >= 1000) grade = 'Mild neutropenia (1000-1499/uL, CTCAE grade 1)';
  else if (ancVal >= 500) grade = 'Moderate neutropenia (500-999/uL, CTCAE grade 2-3)';
  else grade = 'Severe neutropenia (<500/uL, CTCAE grade 4)';
  const precautions = ancVal < 500;
  return { anc: ancVal, grade, precautions };
}

// --- 2.2 retic-index: corrected reticulocyte % + Reticulocyte Production Index
// Corrected retic % = retic% × (Hct / 45). Maturation factor by Hct (Hillman &
// Finch): Hct >=35 -> 1.0; 25-34.9 -> 1.5; 20-24.9 -> 2.0; <20 -> 2.5.
// RPI = corrected retic / maturation factor. RPI <2 = inadequate marrow
// response (hypoproliferative); RPI >=2 = adequate (hemolysis / blood loss).
function maturationFactor(hct) {
  if (hct >= 35) return 1.0;
  if (hct >= 25) return 1.5;
  if (hct >= 20) return 2.0;
  return 2.5;
}
export function reticIndex({ reticPct, hct }) {
  num('reticPct', reticPct, { min: 0, max: 100 });
  num('hct', hct, { min: 1, max: 70 });
  const corrected = reticPct * (hct / 45);
  const factor = maturationFactor(hct);
  const rpi = corrected / factor;
  const band = rpi < 2
    ? 'RPI <2: inadequate marrow response (hypoproliferative anemia)'
    : 'RPI >=2: adequate marrow response (hemolysis or blood loss)';
  return { correctedRetic: r2(corrected), maturationFactor: factor, rpi: r2(rpi), band };
}

// --- 2.3 tsat: transferrin saturation + iron-studies pattern ----------------
// TSAT (%) = serum iron / TIBC × 100. Pattern per KDIGO anemia / AGA-ACG iron
// guidance. Ferritin optional (ng/mL); a low ferritin (<30) with low TSAT is
// absolute iron deficiency; normal/high ferritin with low TSAT is functional
// iron deficiency / anemia of inflammation.
export function tsat({ ironUgDl, tibcUgDl, ferritinNgMl = null }) {
  num('ironUgDl', ironUgDl, { min: 0, max: 1000 });
  num('tibcUgDl', tibcUgDl, { min: 1, max: 1500 });
  const pct = (ironUgDl / tibcUgDl) * 100;
  let pattern;
  const low = pct < 20;
  const high = pct > 50;
  if (low && ferritinNgMl != null && ferritinNgMl < 30) {
    pattern = 'TSAT <20% with low ferritin: absolute iron deficiency';
  } else if (low && ferritinNgMl != null) {
    pattern = 'TSAT <20% with normal/high ferritin: functional iron deficiency / anemia of inflammation';
  } else if (low) {
    pattern = 'TSAT <20%: iron-deficient pattern (check ferritin to separate absolute vs functional)';
  } else if (high) {
    pattern = 'TSAT >50%: iron-overload pattern; consider hemochromatosis work-up';
  } else {
    pattern = 'TSAT 20-50%: within the usual reference range';
  }
  return { tsat: r1(pct), pattern };
}

// --- 2.4 cci-platelet: Corrected Count Increment (platelet refractoriness) ---
// CCI = (post − pre platelet, ×10⁹/L) × 1000 × BSA (m²) / dose (×10¹¹). The
// ×1000 converts the ×10⁹/L increment to per-µL so the conventional CCI scale
// (good response >7500) holds. Refractory: CCI <5000–7500 on two sequential
// 10–60 min post-transfusion counts (AABB Technical Manual).
export function cciPlatelet({ prePlt, postPlt, bsaM2, doseE11 }) {
  num('prePlt', prePlt, { min: 0, max: 3000 });
  num('postPlt', postPlt, { min: 0, max: 3000 });
  num('bsaM2', bsaM2, { min: 0.1, max: 3 });
  num('doseE11', doseE11, { min: 0.1, max: 20 });
  const increment = postPlt - prePlt;
  const cci = (increment * 1000 * bsaM2) / doseE11;
  const refractory = cci < 7500;
  const band = refractory
    ? 'CCI <7500: inadequate increment; if a second sequential CCI is also low, suspect refractoriness (consider HLA-matched platelets)'
    : 'CCI >=7500: adequate increment for this transfusion';
  return { cci: Math.round(cci), increment, refractory, band };
}

// --- 2.5 ldl-calc: calculated LDL (Friedewald + NIH/Sampson) ----------------
// Friedewald (1972): LDL = TC − HDL − TG/5; invalid for TG >= 400 mg/dL (the
// fixed /5 VLDL factor breaks down). For the second, high-TG-accurate estimate
// this tile ships the closed-form NIH equation (Sampson 2020, JAMA Cardiol)
// rather than the Martin/Hopkins method: Martin/Hopkins requires a 180-cell
// proprietary strata lookup table that cannot be source-verified here, and the
// project's correctness floor (spec-v11) forbids shipping an unverifiable
// clinical table. The NIH equation is a published, validated, closed-form
// estimator designed for the same TG <= 800 / low-LDL use case. See
// docs/audits/v11/ldl-calc.md for this deliberate substitution.
//   NIH LDL = TC/0.948 − HDL/0.971 − (TG/8.56 + TG×nonHDL/2140 − TG²/16100) − 9.44
export function ldlCalc({ totalChol, hdl, tg }) {
  num('totalChol', totalChol, { min: 50, max: 1000 });
  num('hdl', hdl, { min: 5, max: 200 });
  num('tg', tg, { min: 10, max: 5000 });
  const nonHdl = totalChol - hdl;
  const friedewald = tg < 400 ? totalChol - hdl - tg / 5 : null;
  let nih = null;
  if (tg <= 800) {
    nih = totalChol / 0.948
      - hdl / 0.971
      - (tg / 8.56 + (tg * nonHdl) / 2140 - (tg * tg) / 16100)
      - 9.44;
    if (nih < 0) nih = null; // physiologically implausible at extreme inputs
  }
  const note = tg >= 400
    ? 'TG >=400 mg/dL: Friedewald is invalid; use the NIH estimate or a direct LDL assay.'
    : 'Friedewald valid (TG <400). The NIH/Sampson estimate is more accurate at high TG / low LDL.';
  return {
    nonHdl: Math.round(nonHdl),
    friedewald: friedewald == null ? null : Math.round(friedewald),
    nih: nih == null ? null : Math.round(nih),
    note,
  };
}

// --- 2.6 eag-a1c: estimated average glucose from A1c (ADAG) ------------------
// eAG (mg/dL) = 28.7 × A1c − 46.7 (Nathan 2008). mmol/L = mg/dL / 18.0.
export function eagA1c({ a1c }) {
  num('a1c', a1c, { min: 3, max: 20 });
  const mgdl = 28.7 * a1c - 46.7;
  // r3() first to absorb the floating-point error at the .5 rounding boundary
  // (A1c 6.0% -> 125.5 -> 126 mg/dL, the published ADAG value).
  return { eagMgDl: Math.round(r3(mgdl)), eagMmolL: r1(mgdl / 18.0) };
}

// --- 2.7 cao2-do2: arterial O₂ content + O₂ delivery ------------------------
// CaO2 (mL O2/dL) = (1.34 × Hb × SaO2/100) + (0.0031 × PaO2). DO2 (mL O2/min) =
// CaO2 × cardiac output (L/min) × 10 (the 10 converts dL→L). Cardiac output
// optional; DO2 only when supplied.
export function cao2Do2({ hb, sao2, pao2, cardiacOutput = null }) {
  num('hb', hb, { min: 1, max: 25 });
  num('sao2', sao2, { min: 1, max: 100 });
  num('pao2', pao2, { min: 1, max: 700 });
  const bound = 1.34 * hb * (sao2 / 100);
  const dissolved = 0.0031 * pao2;
  const cao2 = bound + dissolved;
  let do2 = null;
  if (cardiacOutput != null) {
    num('cardiacOutput', cardiacOutput, { min: 0.5, max: 20 });
    do2 = cao2 * cardiacOutput * 10;
  }
  return {
    cao2: r2(cao2),
    boundO2: r2(bound),
    dissolvedO2: r2(dissolved),
    do2: do2 == null ? null : Math.round(do2),
  };
}

// --- 2.8 oxygenation-index: OI + OSI (PALICC-2 peds ARDS) -------------------
// OI = (FiO2 × mean airway pressure × 100) / PaO2. OSI = (FiO2 × MAP × 100) /
// SpO2. PALICC-2 invasive bands (OI): mild 4–8, moderate 8–16, severe ≥16;
// (OSI): mild 5–7.5, moderate 7.5–12.3, severe ≥12.3.
function oiBand(oi) {
  if (oi < 4) return 'OI <4: below the pediatric-ARDS threshold';
  if (oi < 8) return 'OI 4-8: mild pediatric ARDS';
  if (oi < 16) return 'OI 8-16: moderate pediatric ARDS';
  return 'OI >=16: severe pediatric ARDS';
}
function osiBand(osi) {
  if (osi < 5) return 'OSI <5: below the pediatric-ARDS threshold';
  if (osi < 7.5) return 'OSI 5-7.5: mild pediatric ARDS';
  if (osi < 12.3) return 'OSI 7.5-12.3: moderate pediatric ARDS';
  return 'OSI >=12.3: severe pediatric ARDS';
}
export function oxygenationIndex({ fio2, map, pao2 = null, spo2 = null }) {
  num('fio2', fio2, { min: 0.21, max: 1.0 });
  num('map', map, { min: 1, max: 60 });
  let oi = null;
  let oiInterp = null;
  if (pao2 != null) {
    num('pao2', pao2, { min: 1, max: 700 });
    oi = (fio2 * map * 100) / pao2;
    oiInterp = oiBand(oi);
  }
  let osi = null;
  let osiInterp = null;
  if (spo2 != null) {
    num('spo2', spo2, { min: 1, max: 100 });
    osi = (fio2 * map * 100) / spo2;
    osiInterp = osiBand(osi);
  }
  return {
    oi: oi == null ? null : r1(oi),
    oiBand: oiInterp,
    osi: osi == null ? null : r1(osi),
    osiBand: osiInterp,
  };
}

// --- 2.9 driving-pressure: ΔP + static/dynamic compliance ------------------
// ΔP = plateau − PEEP; static compliance = Vt / ΔP; dynamic compliance = Vt /
// (peak − PEEP). ΔP ≤15 cmH2O is the lung-protective target (Amato 2015).
export function drivingPressure({ plateau, peep, tidalVolume, peak = null }) {
  num('plateau', plateau, { min: 0, max: 80 });
  num('peep', peep, { min: 0, max: 50 });
  num('tidalVolume', tidalVolume, { min: 1, max: 3000 });
  const dp = plateau - peep;
  if (dp <= 0) {
    return { drivingPressure: null, staticCompliance: null, dynamicCompliance: null,
      band: 'Plateau must exceed PEEP for a valid driving pressure' };
  }
  const cstat = tidalVolume / dp;
  let cdyn = null;
  if (peak != null) {
    num('peak', peak, { min: 0, max: 120 });
    const transAirway = peak - peep;
    cdyn = transAirway > 0 ? tidalVolume / transAirway : null;
  }
  const band = dp <= 15
    ? 'Driving pressure <=15 cmH2O: within the lung-protective target'
    : 'Driving pressure >15 cmH2O: above the lung-protective target (associated with worse ARDS survival)';
  return {
    drivingPressure: r1(dp),
    staticCompliance: r1(cstat),
    dynamicCompliance: cdyn == null ? null : r1(cdyn),
    band,
  };
}

// --- 2.10 ttkg: Transtubular Potassium Gradient -----------------------------
// TTKG = (urine K / plasma K) / (urine osm / plasma osm). Interpretable ONLY
// when urine osm > plasma osm AND urine Na > 25 mEq/L (Halperin & Kamel). The
// renderer surfaces the precondition guard rather than computing on it.
// Interpretation thresholds per spec-v19 3.2.4 (Ethier 1990): hypokalemia
// TTKG >3 = renal K wasting (<3 = appropriate conservation); hyperkalemia
// TTKG <7 = impaired excretion / hypoaldosteronism (>7 = appropriate).
export function ttkg({ urineK, plasmaK, urineOsm, plasmaOsm, urineNa }) {
  num('urineK', urineK, { min: 0, max: 400 });
  num('plasmaK', plasmaK, { min: 1, max: 10 });
  num('urineOsm', urineOsm, { min: 1, max: 1500 });
  num('plasmaOsm', plasmaOsm, { min: 100, max: 400 });
  num('urineNa', urineNa, { min: 0, max: 400 });
  if (!(urineOsm > plasmaOsm)) {
    return { ttkg: null, valid: false,
      note: 'Not interpretable: urine osmolality must exceed plasma osmolality.' };
  }
  if (!(urineNa > 25)) {
    return { ttkg: null, valid: false,
      note: 'Not interpretable: urine Na must be > 25 mEq/L (adequate distal Na delivery).' };
  }
  const value = (urineK / plasmaK) / (urineOsm / plasmaOsm);
  let band;
  if (plasmaK < 3.5) {
    band = value < 3
      ? 'Hypokalemia with TTKG <3: appropriate renal K conservation (extrarenal loss)'
      : 'Hypokalemia with TTKG >3: renal potassium wasting';
  } else if (plasmaK > 5.0) {
    band = value < 7
      ? 'Hyperkalemia with TTKG <7: impaired renal K excretion (e.g. hypoaldosteronism)'
      : 'Hyperkalemia with TTKG >7: appropriate renal K excretion';
  } else {
    band = 'Plasma K within range; TTKG is interpreted in the context of hypo- or hyperkalemia';
  }
  return { ttkg: r1(value), valid: true, band };
}

// --- 2.11 urine-anion-gap: UAG (non-gap metabolic acidosis) -----------------
// UAG = urine Na + urine K − urine Cl. Negative -> appropriate NH4+ excretion
// (GI bicarbonate loss, e.g. diarrhea). Positive -> impaired NH4+ excretion
// (renal tubular acidosis). (Goldstein 1986.)
export function urineAnionGap({ urineNa, urineK, urineCl }) {
  num('urineNa', urineNa, { min: 0, max: 400 });
  num('urineK', urineK, { min: 0, max: 400 });
  num('urineCl', urineCl, { min: 0, max: 400 });
  const uag = urineNa + urineK - urineCl;
  const band = uag < 0
    ? 'Negative UAG: appropriate renal ammonium excretion (GI bicarbonate loss, e.g. diarrhea)'
    : 'Positive UAG: impaired renal ammonium excretion (renal tubular acidosis)';
  return { uag: Math.round(uag), band };
}

// --- 2.12 acid-base-deficit: bicarbonate deficit + sodium deficit -----------
// HCO3 deficit (mEq) = 0.5 × weight × (target − measured HCO3). Na deficit
// (mEq) = TBW × (target − measured Na), TBW = weight × (0.6 male / 0.5 female).
// These are deficit ESTIMATES, not infusion rates. Over-rapid correction is
// dangerous in BOTH directions: raising a chronic hyponatremia by >8 mEq/L/24h
// risks osmotic demyelination, and lowering a chronic hypernatremia by
// >10 mEq/L/24h risks cerebral edema (Adrogue-Madias ceilings).
export function acidBaseDeficit({ weightKg, sex, measuredHco3, targetHco3, measuredNa, targetNa }) {
  num('weightKg', weightKg, { min: 1, max: 400 });
  num('measuredHco3', measuredHco3, { min: 1, max: 50 });
  num('targetHco3', targetHco3, { min: 1, max: 50 });
  num('measuredNa', measuredNa, { min: 90, max: 200 });
  num('targetNa', targetNa, { min: 90, max: 200 });
  const tbwFraction = sex === 'F' ? 0.5 : 0.6;
  const tbw = weightKg * tbwFraction;
  const hco3Deficit = 0.5 * weightKg * (targetHco3 - measuredHco3);
  const naDeficit = tbw * (targetNa - measuredNa);
  const hyponatremiaWarn = measuredNa < 135 && (targetNa - measuredNa) > 8
    ? 'Correcting Na by more than 8 mEq/L in 24 h risks osmotic demyelination; limit the rate.'
    : null;
  const hypernatremiaWarn = measuredNa > 145 && (measuredNa - targetNa) > 10
    ? 'Lowering Na by more than 10 mEq/L in 24 h risks cerebral edema; limit the rate.'
    : null;
  return {
    tbwLiters: r1(tbw),
    hco3DeficitMeq: Math.round(hco3Deficit),
    naDeficitMeq: Math.round(naDeficit),
    hyponatremiaWarn,
    hypernatremiaWarn,
  };
}

// --- 2.13 schwartz-egfr: bedside pediatric eGFR -----------------------------
// eGFR (mL/min/1.73m²) = 0.413 × height (cm) / serum creatinine (mg/dL).
// Validated for ages 1–18 with IDMS-traceable creatinine (Schwartz 2009); not
// for neonates or adults (the adult egfr-suite owns those).
export function schwartzEgfr({ heightCm, scr }) {
  num('heightCm', heightCm, { min: 30, max: 200 });
  num('scr', scr, { min: 0.1, max: 20 });
  const egfr = (0.413 * heightCm) / scr;
  let band;
  if (egfr >= 90) band = 'eGFR >=90: normal/high (CKD stage G1 if other markers present)';
  else if (egfr >= 60) band = 'eGFR 60-89: mildly decreased (G2)';
  else if (egfr >= 45) band = 'eGFR 45-59: mild-moderate decrease (G3a)';
  else if (egfr >= 30) band = 'eGFR 30-44: moderate-severe decrease (G3b)';
  else if (egfr >= 15) band = 'eGFR 15-29: severely decreased (G4)';
  else band = 'eGFR <15: kidney failure (G5)';
  return { egfr: r1(egfr), band };
}
