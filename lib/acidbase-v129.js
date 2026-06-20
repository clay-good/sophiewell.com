// spec-v129 (Wave 5 of the spec-v100 MDCalc Parity Completion program): six
// deterministic acid-base tiles that complete the compensation set `winters`
// opened and fill the physicochemical / urine-gap gaps beside `anion-gap-dd`.
// None duplicates a live tile; each takes clinician-entered gas/electrolyte
// values as input.
//
//   stewartSidSig              - Stewart SID / strong ion gap (unmeasured anions)
//   baseExcess                 - Hgb-corrected base excess (Van Slyke, NCCLS)
//   respAcidosisCompensation   - expected HCO3, respiratory acidosis (acute/chronic)
//   respAlkalosisCompensation  - expected HCO3, respiratory alkalosis (acute/chronic)
//   metAlkalosisCompensation   - expected PaCO2, metabolic alkalosis
//   urineOsmolalGap            - urine osmolal gap; half estimates urinary NH4+
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v129.js render the spec-v50 §3 clinical-
// posture note. Each tile reports the quantity and the source's framing; the
// management decision stays with the clinician (spec-v11 §5.3). All six are
// Class A (fixed physiologic formulas / compensation coefficients) -- no
// docs/citation-staleness.md row.
//
// FORMULAS RE-FETCHED, NEVER RECALLED (spec-v97 lesson), each cross-verified
// across >= 2 independent sources. NO-FABRICATION / SOURCE-GOVERNANCE:
//   - stewartSidSig (Stewart 1983; Figge 1992): apparent SID = (Na + K + Ca +
//     Mg) - (Cl + lactate), all mEq/L; effective SID = HCO3 + albumin charge +
//     phosphate charge; SIG = SIDa - SIDe. The pH-dependent Figge weak-acid
//     charges are evaluated at the physiologic pH 7.4 (the spec input set omits
//     pH), giving the fixed bedside coefficients albumin 2.8 mEq/L per g/dL
//     [(0.123x7.4-0.631)x10 = 2.79] and phosphate 0.59 mEq/L per mg/dL
//     [(0.309x7.4-0.469)/3.097 = 0.587]. SIG > 2 suggests unmeasured strong
//     anions. The assumed-pH-7.4 simplification is stated to the user; the
//     signed SIG is reported, never capped.
//   - baseExcess (Siggaard-Andersen 1977 Van Slyke equation, NCCLS C12-T2
//     constants): BE = (1 - 0.0143 x Hb) x (HCO3 - 24.8 + (9.5 + 1.63 x Hb) x
//     (pH - 7.4)), Hb in g/dL. Verified neutral (pH 7.4, HCO3 24.8) -> 0;
//     pH 7.2 / HCO3 15 / Hb 15 -> -13.0 (base deficit). Negative = base deficit
//     (metabolic acidosis); positive = base excess. The 24.8 / 9.5 / 1.63
//     constants are kept as one matched NCCLS pair (Lang & Zander 2002 warn
//     against crossing editions). Signed result reported, never capped.
//   - respAcidosisCompensation (Brackett 1965 acute; Schwartz 1965 chronic):
//     expected HCO3 = 24 + k x (PaCO2 - 40)/10, k = 1 (acute) or 4 (chronic;
//     3.5-4 range). Measured below/above the expected band flags an added
//     metabolic acidosis / alkalosis.
//   - respAlkalosisCompensation (Gennari 1972): expected HCO3 = 24 - k x
//     (40 - PaCO2)/10, k = 2 (acute) or 4 (chronic; 4-5 range). HCO3 is clamped
//     to a physiologic floor (acute ~18, chronic ~12); measured outside the band
//     flags an added metabolic disorder.
//   - metAlkalosisCompensation (Narins & Emmett 1980): expected PaCO2 =
//     0.7 x (HCO3 - 24) + 40 (+/- 5). Measured PaCO2 outside the band flags an
//     added respiratory disorder. Near-neighbor of `winters` (the metabolic-
//     acidosis complement), cross-linked, both kept.
//   - urineOsmolalGap (Halperin 1988): calculated urine osm = 2 x (Na + K) +
//     urine urea nitrogen(mg/dL)/2.8 + urine glucose(mg/dL)/18; gap = measured -
//     calculated; gap/2 ~ urinary NH4+. A large gap (intact NH4+ excretion)
//     points to an extrarenal non-anion-gap acidosis (e.g. diarrhea); a low
//     gap points to impaired distal acidification (renal tubular acidosis).

import { r1, r2 } from './num.js';

const pos = (v) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};
const nonneg = (v) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
};
const fin = (v) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};
const obj = (input) => (input && typeof input === 'object' ? input : {});

// --- 2.1 stewart-sid-sig ------------------------------------------------------
const SID_NOTE = 'Stewart strong ion difference and strong ion gap (Stewart PA, Can J Physiol Pharmacol 1983; albumin/phosphate charge per Figge J, Fencl V, J Lab Clin Med 1992). Apparent SID = (Na + K + Ca + Mg) - (Cl + lactate), all in mEq/L. Effective SID = bicarbonate + albumin charge + phosphate charge, where the pH-dependent Figge weak-acid charges are evaluated at the physiologic pH 7.4 (albumin 2.8 mEq/L per g/dL, phosphate 0.59 mEq/L per mg/dL). The strong ion gap (SIG) = apparent SID - effective SID; a SIG above about 2 mEq/L suggests unmeasured strong anions (ketoacids, sulfate, citrate, salicylate). It frames the unmeasured-anion burden; the management decision stays with the clinician.';

export function stewartSidSig(input = {}) {
  const o = obj(input);
  const na = fin(o.sodium);
  const k = fin(o.potassium);
  const ca = nonneg(o.calcium);   // ionized, mEq/L
  const mg = nonneg(o.magnesium); // ionized, mEq/L
  const cl = fin(o.chloride);
  const lactate = nonneg(o.lactate);
  const hco3 = pos(o.bicarbonate);
  const alb = nonneg(o.albumin);  // g/dL
  const phos = nonneg(o.phosphate); // mg/dL
  if (na === null || k === null || ca === null || mg === null || cl === null ||
      lactate === null || hco3 === null || alb === null || phos === null) {
    return { valid: false, message: 'Enter sodium, potassium, ionized calcium and magnesium (mEq/L), chloride, lactate, bicarbonate, albumin (g/dL), and phosphate (mg/dL).' };
  }
  const sida = na + k + ca + mg - cl - lactate;
  const albCharge = alb * 2.8;   // (0.123 x 7.4 - 0.631) x 10 = 2.79 mEq/L per g/dL
  const phosCharge = phos * 0.59; // (0.309 x 7.4 - 0.469) / 3.097 = 0.587 mEq/L per mg/dL
  const side = hco3 + albCharge + phosCharge;
  const sig = sida - side;
  const sidaR = r1(sida);
  const sideR = r1(side);
  const sigR = r1(sig);
  const elevated = sigR > 2;
  return {
    valid: true, sida: sidaR, side: sideR, sig: sigR,
    abnormal: elevated,
    band: `SIG ${sigR} mEq/L (apparent SID ${sidaR}, effective SID ${sideR}): ${elevated ? 'above ~2 mEq/L, suggesting unmeasured strong anions (ketoacids, sulfate, citrate, salicylate)' : 'at or below ~2 mEq/L, no excess unmeasured strong anions'}.`,
    note: SID_NOTE,
  };
}

// --- 2.2 base-excess ----------------------------------------------------------
const BE_NOTE = 'Standard base excess (Siggaard-Andersen O, the Van Slyke equation, Scand J Clin Lab Invest 1977; NCCLS C12-T2 constants): BE = (1 - 0.0143 x Hb) x (HCO3 - 24.8 + (9.5 + 1.63 x Hb) x (pH - 7.4)), with hemoglobin in g/dL. It is the hemoglobin-corrected titratable base read off a blood gas: a negative value is a base deficit (metabolic acidosis), a positive value is a base excess (metabolic alkalosis). The sign flips at zero. It frames the metabolic component; the management decision stays with the clinician.';

export function baseExcess(input = {}) {
  const o = obj(input);
  const ph = pos(o.ph);
  const hco3 = pos(o.bicarbonate);
  const hb = pos(o.hemoglobin); // g/dL
  if (ph === null || hco3 === null || hb === null) {
    return { valid: false, message: 'Enter arterial pH, bicarbonate (mEq/L), and hemoglobin (g/dL).' };
  }
  const be = (1 - 0.0143 * hb) * (hco3 - 24.8 + (9.5 + 1.63 * hb) * (ph - 7.4));
  const shown = r1(be);
  const deficit = shown < 0;
  const excess = shown > 0;
  return {
    valid: true, be: shown,
    abnormal: deficit,
    band: `Base excess ${shown > 0 ? '+' : ''}${shown} mEq/L: ${deficit ? 'a base deficit, consistent with a metabolic acidosis' : excess ? 'a base excess, consistent with a metabolic alkalosis' : 'neutral, no metabolic acid-base derangement'}.`,
    note: BE_NOTE,
  };
}

// --- shared compensation comparison -------------------------------------------
function compare(measured, expected, tol, unit, raisedLabel, loweredLabel) {
  if (measured > expected + tol) return `the measured ${measured} ${unit} is above the expected ${expected} ${unit} (+/-${tol}), suggesting a superimposed ${raisedLabel}`;
  if (measured < expected - tol) return `the measured ${measured} ${unit} is below the expected ${expected} ${unit} (+/-${tol}), suggesting a superimposed ${loweredLabel}`;
  return `the measured ${measured} ${unit} matches the expected ${expected} ${unit} (+/-${tol}), consistent with appropriate compensation`;
}

// --- 2.3 resp-acidosis-compensation -------------------------------------------
const RESP_ACID_NOTE = 'Expected HCO3 in respiratory acidosis (Brackett NC, Cohen JJ, Schwartz WB, NEJM 1965, acute; Schwartz WB, 1965, chronic): the kidney raises bicarbonate by about 1 mEq/L per 10 mmHg rise in PaCO2 above 40 acutely, and about 4 mEq/L per 10 mmHg chronically (3.5-4 range). A measured HCO3 below the expected value suggests an added metabolic acidosis; above it, an added metabolic alkalosis. The acute-versus-chronic choice is yours, not inferred. It frames the expected compensation; the management decision stays with the clinician.';

export function respAcidosisCompensation(input = {}) {
  const o = obj(input);
  const paco2 = pos(o.paco2);
  const hco3 = pos(o.bicarbonate);
  const chronic = o.chronic === true || o.chronic === 'true';
  if (paco2 === null || hco3 === null) {
    return { valid: false, message: 'Enter measured PaCO2 (mmHg), measured HCO3 (mEq/L), and choose acute or chronic.' };
  }
  const k = chronic ? 4 : 1;
  const expectedRaw = 24 + (k * (paco2 - 40)) / 10;
  // clamp to a physiologic ceiling (compensation rarely lifts HCO3 past ~45)
  const expected = r1(Math.min(45, Math.max(10, expectedRaw)));
  const measured = r1(hco3);
  const cmp = compare(measured, expected, 2, 'mEq/L', 'metabolic alkalosis', 'metabolic acidosis');
  const added = measured > expected + 2 || measured < expected - 2;
  return {
    valid: true, expected, measured, chronic,
    abnormal: added,
    band: `Expected HCO3 ${expected} mEq/L (${chronic ? 'chronic, +4 per 10 mmHg' : 'acute, +1 per 10 mmHg'}): ${cmp}.`,
    note: RESP_ACID_NOTE,
  };
}

// --- 2.4 resp-alkalosis-compensation ------------------------------------------
const RESP_ALK_NOTE = 'Expected HCO3 in respiratory alkalosis (Gennari FJ, Goldstein MB, Schwartz WB, J Clin Invest 1972): the kidney lowers bicarbonate by about 2 mEq/L per 10 mmHg fall in PaCO2 below 40 acutely, and about 4 mEq/L per 10 mmHg chronically (4-5 range), and not below a physiologic floor (about 18 acute, 12 chronic). A measured HCO3 below the expected value suggests an added metabolic acidosis; above it, an added metabolic alkalosis. The acute-versus-chronic choice is yours, not inferred. It frames the expected compensation; the management decision stays with the clinician.';

export function respAlkalosisCompensation(input = {}) {
  const o = obj(input);
  const paco2 = pos(o.paco2);
  const hco3 = pos(o.bicarbonate);
  const chronic = o.chronic === true || o.chronic === 'true';
  if (paco2 === null || hco3 === null) {
    return { valid: false, message: 'Enter measured PaCO2 (mmHg), measured HCO3 (mEq/L), and choose acute or chronic.' };
  }
  const k = chronic ? 4 : 2;
  const floor = chronic ? 12 : 18;
  const expectedRaw = 24 - (k * (40 - paco2)) / 10;
  const expected = r1(Math.max(floor, expectedRaw));
  const measured = r1(hco3);
  const cmp = compare(measured, expected, 2, 'mEq/L', 'metabolic alkalosis', 'metabolic acidosis');
  const added = measured > expected + 2 || measured < expected - 2;
  return {
    valid: true, expected, measured, chronic,
    abnormal: added,
    band: `Expected HCO3 ${expected} mEq/L (${chronic ? 'chronic, -4 per 10 mmHg, floor ~12' : 'acute, -2 per 10 mmHg, floor ~18'}): ${cmp}.`,
    note: RESP_ALK_NOTE,
  };
}

// --- 2.5 met-alkalosis-compensation -------------------------------------------
const MET_ALK_NOTE = 'Expected PaCO2 in metabolic alkalosis (Narins RG, Emmett M, Medicine 1980): respiratory compensation raises PaCO2 by about 0.7 mmHg per 1 mEq/L rise in HCO3 above 24, so expected PaCO2 = 0.7 x (HCO3 - 24) + 40 (+/- 5). A measured PaCO2 above the expected value suggests an added respiratory acidosis; below it, an added respiratory alkalosis. This is the metabolic-alkalosis complement of Winter’s formula (the metabolic-acidosis rule). It frames the expected compensation; the management decision stays with the clinician.';

export function metAlkalosisCompensation(input = {}) {
  const o = obj(input);
  const hco3 = pos(o.bicarbonate);
  const paco2 = pos(o.paco2);
  if (hco3 === null || paco2 === null) {
    return { valid: false, message: 'Enter measured HCO3 (mEq/L) and measured PaCO2 (mmHg).' };
  }
  const expectedRaw = 0.7 * (hco3 - 24) + 40;
  // compensation does not drive PaCO2 above ~60 in a pure metabolic alkalosis
  const expected = r1(Math.min(60, Math.max(40, expectedRaw)));
  const measured = r1(paco2);
  const cmp = compare(measured, expected, 5, 'mmHg', 'respiratory acidosis', 'respiratory alkalosis');
  const added = measured > expected + 5 || measured < expected - 5;
  return {
    valid: true, expected, measured,
    abnormal: added,
    band: `Expected PaCO2 ${expected} mmHg (0.7 x [HCO3 - 24] + 40): ${cmp}.`,
    note: MET_ALK_NOTE,
  };
}

// --- 2.6 urine-osmolal-gap ----------------------------------------------------
const UOG_NOTE = 'Urine osmolal gap (Halperin ML, Goldstein MB, et al, Clin Invest Med 1988): calculated urine osmolality = 2 x (urine Na + urine K) + urine urea nitrogen(mg/dL)/2.8 + urine glucose(mg/dL)/18; the gap = measured - calculated urine osmolality, and half the gap approximates urinary ammonium (NH4+). In a non-anion-gap metabolic acidosis, a large gap (intact NH4+ excretion) points to an extrarenal cause such as diarrhea, while a low gap points to impaired distal acidification (renal tubular acidosis). It frames the urinary ammonium estimate; the management decision stays with the clinician.';

export function urineOsmolalGap(input = {}) {
  const o = obj(input);
  const measured = pos(o.measuredOsm);
  const na = nonneg(o.urineNa);
  const kx = nonneg(o.urineK);
  const urea = nonneg(o.urineUrea);     // urine urea nitrogen, mg/dL
  const glucose = nonneg(o.urineGlucose); // mg/dL
  if (measured === null || na === null || kx === null || urea === null || glucose === null) {
    return { valid: false, message: 'Enter measured urine osmolality, urine Na, urine K, urine urea nitrogen (mg/dL), and urine glucose (mg/dL).' };
  }
  const calc = 2 * (na + kx) + urea / 2.8 + glucose / 18;
  const gap = measured - calc;
  const calcR = r1(calc);
  const gapR = r1(gap);
  const nh4 = r1(gap / 2);
  // a gap above ~100 mOsm/kg implies adequate urinary NH4+ (~> 80 mEq/L)
  const adequate = gapR >= 100;
  return {
    valid: true, calc: calcR, gap: gapR, nh4,
    abnormal: !adequate,
    band: `Urine osmolal gap ${gapR} mOsm/kg (calculated osm ${calcR}; ~NH4+ ${nh4} mEq/L): ${adequate ? 'a wide gap, consistent with intact urinary ammonium excretion (extrarenal cause, e.g. diarrhea)' : 'a narrow gap, consistent with impaired distal acidification (renal tubular acidosis)'}.`,
    note: UOG_NOTE,
  };
}
