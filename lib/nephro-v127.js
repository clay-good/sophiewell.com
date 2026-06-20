// spec-v127 (Wave 5 of the spec-v100 MDCalc Parity Completion program): four
// deterministic nephrology-prognosis and AKI-staging instruments that fill gaps
// beside egfr-suite, ckd-staging, ktv-urr, and the existing kdigo-aki. None
// duplicates a live tile; each takes lab values or the bedside read as input.
//
//   kfre         - Kidney Failure Risk Equation (Tangri 4-/8-variable, 2- & 5-yr risk)
//   rifleAki     - RIFLE criteria for AKI (Risk / Injury / Failure)
//   akinAki      - AKIN criteria for AKI (stage 1-3)
//   ufrDialysis  - Ultrafiltration rate (mL/kg/hr) with the > 13 CV-risk threshold
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v127.js render the spec-v50 §3 clinical-
// posture note. Each tile reports the probability / class / rate and the source's
// framing; the management decision stays with the clinician (spec-v11 §5.3).
//
// COEFFICIENTS / CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97 lesson), each
// cross-verified across >= 2 independent sources. NO-FABRICATION / SOURCE-GOVERNANCE:
//   - kfre (Tangri 2011, JAMA): risk = 1 - S0^exp(sum of beta x (x - mean)), each
//     variable centered by its published mean. 4-variable (North American): age
//     beta -0.2201 (age/10, mean 7.036), male +0.2467 (mean 0.5642), eGFR -0.5567
//     (eGFR/5, mean 7.222), ln(ACR) +0.4510 (mean 5.137); S0 2-yr 0.9750, 5-yr
//     0.9240. 8-variable re-estimates those four and adds albumin -0.3441 (mean
//     3.997), phosphate +0.2604 (3.916), bicarbonate -0.07354 (25.57), calcium
//     -0.2228 (9.355); S0 2-yr 0.9780, 5-yr 0.9301. CRITICAL: ACR is in mg/mmol --
//     a US spot UACR in mg/g is divided by 8.84 before ln. Overflow-safe: an
//     extreme linear predictor returns a probability bounded to 0-1, never NaN.
//   - rifleAki (Bellomo 2004, Crit Care; ADQI): the worst of the creatinine/GFR
//     criterion (x1.5/x2/x3 or GFR drop > 25/50/75%, or creatinine >= 4 mg/dL with
//     an acute rise > 0.5) and the urine-output criterion (< 0.5 mL/kg/hr x 6h
//     Risk, x 12h Injury; < 0.3 x 24h or anuria x 12h Failure). The Failure
//     acute-rise limb is STRICT > 0.5 (RIFLE), distinct from AKIN's >= 0.5.
//   - akinAki (Mehta 2007, Crit Care; AKIN): 48-hour window; stage 1 (rise >= 0.3
//     mg/dL or x1.5-2), stage 2 (x2-3), stage 3 (x3, or creatinine >= 4.0 with an
//     acute rise >= 0.5, or RRT initiation). RRT forces stage 3; the stage is the
//     worse of the creatinine and urine-output criteria.
//   - ufrDialysis (Flythe 2011, Kidney Int): UF rate = volume / (post-dialysis
//     weight x hours), in mL/kg/hr; > 13 mL/kg/hr is the Flythe 2011 tertile cutoff
//     associated with higher cardiovascular morbidity/mortality.

import { r1, r2 } from './num.js';

const pos = (v) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};
const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';
const clampInt = (v, lo, hi) => {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return lo;
  const r = Math.round(n);
  return r < lo ? lo : r > hi ? hi : r;
};
const obj = (input) => (input && typeof input === 'object' ? input : {});
const pct = (p) => `${r1(p * 100)}%`;

// --- 2.1 kfre -----------------------------------------------------------------
const KFRE_NOTE = 'Kidney Failure Risk Equation (Tangri N, Stevens LA, Griffith J, et al, JAMA 2011): the 2- and 5-year probability of treated kidney failure in CKD G3-G5. Risk = 1 - S0^exp(sum of the centered terms). The 4-variable model uses age, sex, eGFR, and the urine albumin-to-creatinine ratio; the 8-variable model adds calcium, phosphate, bicarbonate, and albumin. The North American baseline survivals are used (2-yr 0.9750 / 5-yr 0.9240 for the 4-variable model). The albumin-to-creatinine ratio is entered in mg/g and converted internally to mg/mmol (divide by 8.84). It frames progression risk; the management decision stays with the clinician.';

export function kfre(input = {}) {
  const o = obj(input);
  const eight = o.mode === '8' || o.mode === 8;
  const age = pos(o.age);
  const egfr = pos(o.egfr);
  const acrMgG = pos(o.acr); // mg/g
  if (age === null || egfr === null || acrMgG === null) return { valid: false, message: 'Enter age, eGFR, and urine ACR (all positive).' };
  const male = onFlag(o.male) ? 1 : 0;
  const acrMmol = acrMgG / 8.84;
  const lnAcr = Math.log(acrMmol);

  let lp; let s2; let s5;
  if (eight) {
    const albumin = pos(o.albumin);
    const phosphate = pos(o.phosphate);
    const bicarbonate = pos(o.bicarbonate);
    const calcium = pos(o.calcium);
    if (albumin === null || phosphate === null || bicarbonate === null || calcium === null) {
      return { valid: false, message: 'The 8-variable model also needs albumin, phosphate, bicarbonate, and calcium.' };
    }
    lp = -0.1992 * (age / 10 - 7.036) + 0.1602 * (male - 0.5642) - 0.4919 * (egfr / 5 - 7.222) + 0.3364 * (lnAcr - 5.137)
      - 0.3441 * (albumin - 3.997) + 0.2604 * (phosphate - 3.916) - 0.07354 * (bicarbonate - 25.57) - 0.2228 * (calcium - 9.355);
    s2 = 0.9780; s5 = 0.9301;
  } else {
    lp = -0.2201 * (age / 10 - 7.036) + 0.2467 * (male - 0.5642) - 0.5567 * (egfr / 5 - 7.222) + 0.4510 * (lnAcr - 5.137);
    s2 = 0.9750; s5 = 0.9240;
  }
  const ex = Math.exp(lp); // overflow-safe: pow(S0, Infinity) -> 0 -> risk 1
  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
  const risk2 = clamp01(1 - Math.pow(s2, ex));
  const risk5 = clamp01(1 - Math.pow(s5, ex));
  return {
    valid: true, risk2, risk5, mode: eight ? 8 : 4,
    abnormal: risk5 >= 0.10,
    band: `KFRE (${eight ? '8' : '4'}-variable): ${pct(risk2)} 2-year and ${pct(risk5)} 5-year probability of treated kidney failure.`,
    note: KFRE_NOTE,
  };
}

// --- 2.2 rifle-aki ------------------------------------------------------------
const RIFLE_NOTE = 'RIFLE criteria for acute kidney injury (Bellomo R, Ronco C, Kellum JA, et al; ADQI, Crit Care 2004): the class is the worst of the creatinine/GFR criterion and the urine-output criterion. Risk = creatinine x1.5 or GFR fall over 25% (urine output below 0.5 mL/kg/hr for 6 hours); Injury = x2 or over 50% (below 0.5 for 12 hours); Failure = x3 or over 75%, or creatinine at or above 4 mg/dL with an acute rise over 0.5 mg/dL (urine output below 0.3 for 24 hours or anuria for 12 hours). It classifies AKI severity; the management decision stays with the clinician.';
const RIFLE_NAMES = ['no RIFLE criteria met', 'Risk', 'Injury', 'Failure'];

function rifleCrClass(baseline, current) {
  if (baseline === null || current === null) return 0;
  const ratio = current / baseline;
  if (ratio >= 3 || (current >= 4 && current - baseline > 0.5)) return 3;
  if (ratio >= 2) return 2;
  if (ratio >= 1.5) return 1;
  return 0;
}

export function rifleAki(input = {}) {
  const o = obj(input);
  const baseline = pos(o.baselineCr);
  const current = pos(o.currentCr);
  const crClass = rifleCrClass(baseline, current);
  const uoClass = clampInt(o.uoClass, 0, 3); // 0 none, 1 Risk, 2 Injury, 3 Failure
  if (baseline === null && uoClass === 0) return { valid: false, message: 'Enter baseline and current creatinine, and/or the urine-output category.' };
  const cls = Math.max(crClass, uoClass);
  const governing = crClass >= uoClass ? (crClass > 0 ? 'creatinine/GFR' : 'neither') : 'urine output';
  return {
    valid: true, class: cls, className: RIFLE_NAMES[cls],
    abnormal: cls >= 1,
    band: cls === 0 ? 'RIFLE: no criteria met.' : `RIFLE class ${RIFLE_NAMES[cls]} (governed by ${governing}).`,
    note: RIFLE_NOTE,
  };
}

// --- 2.3 akin-aki -------------------------------------------------------------
const AKIN_NOTE = 'AKIN criteria for acute kidney injury (Mehta RL, Kellum JA, Shah SV, et al; Acute Kidney Injury Network, Crit Care 2007): within a 48-hour window, the stage is the worse of the creatinine and urine-output criteria. Stage 1 = a rise of at least 0.3 mg/dL or x1.5-2 baseline (urine output below 0.5 mL/kg/hr for over 6 hours); stage 2 = x2-3 baseline (below 0.5 for over 12 hours); stage 3 = x3 baseline, or creatinine at or above 4.0 mg/dL with an acute rise at or above 0.5 mg/dL, or initiation of renal replacement therapy (urine output below 0.3 for 24 hours or anuria for 12 hours). RRT initiation forces stage 3. It stages AKI; the management decision stays with the clinician.';

function akinCrStage(baseline, current, rrt) {
  if (rrt) return 3;
  if (baseline === null || current === null) return 0;
  const ratio = current / baseline;
  const rise = current - baseline;
  if (ratio >= 3 || (current >= 4 && rise >= 0.5)) return 3;
  if (ratio >= 2) return 2;
  if (ratio >= 1.5 || rise >= 0.3) return 1;
  return 0;
}

export function akinAki(input = {}) {
  const o = obj(input);
  const baseline = pos(o.baselineCr);
  const current = pos(o.currentCr);
  const rrt = onFlag(o.rrt);
  const crStage = akinCrStage(baseline, current, rrt);
  const uoStage = clampInt(o.uoClass, 0, 3);
  if (baseline === null && uoStage === 0 && !rrt) return { valid: false, message: 'Enter baseline and current creatinine, mark RRT, and/or the urine-output category.' };
  const stage = Math.max(crStage, uoStage);
  let governing;
  if (rrt && crStage >= uoStage) governing = 'renal replacement therapy';
  else governing = crStage >= uoStage ? (crStage > 0 ? 'creatinine' : 'neither') : 'urine output';
  return {
    valid: true, stage,
    abnormal: stage >= 1,
    band: stage === 0 ? 'AKIN: no AKI criteria met.' : `AKIN stage ${stage} (governed by ${governing}).`,
    note: AKIN_NOTE,
  };
}

// --- 2.4 ufr-dialysis ---------------------------------------------------------
const UFR_NOTE = 'Ultrafiltration rate (Flythe JE, Kimmel SE, Brunelli SM, Kidney Int 2011): the fluid-removal rate per kilogram per hour during hemodialysis = ultrafiltration volume / (post-dialysis weight x session hours). A rate above 13 mL/kg/hr was the Flythe 2011 tertile cutoff associated with higher cardiovascular morbidity and mortality. It frames the removal rate; the prescription decision stays with the clinician.';

export function ufrDialysis(input = {}) {
  const o = obj(input);
  const volumeL = pos(o.volume); // liters
  const hours = pos(o.hours);
  const weight = pos(o.weight);
  if (volumeL === null || hours === null || weight === null) return { valid: false, message: 'Enter ultrafiltration volume (L), session hours, and post-dialysis weight (kg).' };
  const ufr = (volumeL * 1000) / (weight * hours);
  const high = ufr > 13;
  return {
    valid: true, ufr: r2(ufr),
    abnormal: high,
    band: `Ultrafiltration rate ${r2(ufr)} mL/kg/hr: ${high ? 'above the 13 mL/kg/hr cardiovascular-risk threshold' : 'at or below the 13 mL/kg/hr threshold'}.`,
    note: UFR_NOTE,
  };
}
