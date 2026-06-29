// spec-v92 (Wave 2 of the spec-v85 Advanced Clinical Calculators program):
// five deterministic nephrology computations that close the catalog's chronic /
// procedural renal gap (it shipped egfr-suite, egfr, fena-feurea, kdigo-aki,
// ttkg and cockcroft-gault -- filtration, injury, and dosing -- but nothing for
// CKD G x A staging, spot proteinuria ratios, dialysis adequacy, contrast-
// nephropathy risk, or cystatin-based eGFR).
//
//   ckdStaging      - KDIGO CKD G-stage x A-stage risk heat-map cell
//   uacrUpcr        - spot urine albumin/protein-to-creatinine ratios + A-stage
//   ktvUrr          - hemodialysis adequacy: URR + Daugirdas single-pool Kt/V
//   mehranCin       - Mehran contrast-induced-nephropathy risk score + bands
//   ckdEpiCystatin  - 2021 race-free CKD-EPI cystatin-C / combined / creatinine eGFR
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v18.js wire these to the home grid.
// Every function takes a single destructured object so the spec-v59 fuzz harness
// can drive each field through its adversarial matrix; every division, logarithm,
// and power term is domain-guarded so no non-finite value reaches a returned
// string (spec-v59). r1/r2 come from lib/num.js (spec-v53 §4.1). None authors a
// management order in Sophie's voice (spec-v11 §5.3) -- each surfaces the
// computation and the cited source's own cell / band / target / estimate.

import { r1, r2 } from './num.js';

// Finite-or-null: any non-finite input (NaN/Infinity/''/undefined/null) is
// treated as "not provided" rather than throwing, so optional fields are safe.
const fin = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
// Strictly-positive finite or null (a value we can divide by / take a log of).
const pos = (v) => { const f = fin(v); return f != null && f > 0 ? f : null; };

// --- 2.1 ckdStaging - KDIGO CKD G x A risk classification --------------------
// G-stage off eGFR (G1 >= 90, G2 60-89, G3a 45-59, G3b 30-44, G4 15-29, G5 < 15)
// and A-stage off UACR mg/g (A1 < 30, A2 30-300, A3 > 300), or the A-category
// entered directly. The KDIGO prognosis is the heat-map cell where the two axes
// meet (low / moderately increased / high / very high). Band-mapping logic only;
// a non-finite eGFR or a missing albuminuria input returns a surfaced fallback.
const KDIGO_RISK = {
  low: 'low risk (green): if no other markers of kidney disease, no CKD',
  moderate: 'moderately increased risk (yellow)',
  high: 'high risk (orange)',
  vhigh: 'very high risk (red)',
};
// rows G1,G2,G3a,G3b,G4,G5 x cols A1,A2,A3 (KDIGO 2012/2024 heat-map).
const KDIGO_MATRIX = {
  G1: { A1: 'low', A2: 'moderate', A3: 'high' },
  G2: { A1: 'low', A2: 'moderate', A3: 'high' },
  G3a: { A1: 'moderate', A2: 'high', A3: 'vhigh' },
  G3b: { A1: 'high', A2: 'vhigh', A3: 'vhigh' },
  G4: { A1: 'vhigh', A2: 'vhigh', A3: 'vhigh' },
  G5: { A1: 'vhigh', A2: 'vhigh', A3: 'vhigh' },
};
const G_LABEL = {
  G1: 'G1 (eGFR >= 90, normal or high)',
  G2: 'G2 (eGFR 60-89, mildly decreased)',
  G3a: 'G3a (eGFR 45-59, mildly-moderately decreased)',
  G3b: 'G3b (eGFR 30-44, moderately-severely decreased)',
  G4: 'G4 (eGFR 15-29, severely decreased)',
  G5: 'G5 (eGFR < 15, kidney failure)',
};
const A_LABEL = {
  A1: 'A1 (UACR < 30 mg/g, normal to mildly increased)',
  A2: 'A2 (UACR 30-300 mg/g, moderately increased)',
  A3: 'A3 (UACR > 300 mg/g, severely increased)',
};
function gStageOf(e) {
  if (e >= 90) return 'G1';
  if (e >= 60) return 'G2';
  if (e >= 45) return 'G3a';
  if (e >= 30) return 'G3b';
  if (e >= 15) return 'G4';
  return 'G5';
}
function aStageOf(u) {
  if (u < 30) return 'A1';
  if (u <= 300) return 'A2';
  return 'A3';
}
export function ckdStaging({ egfr, uacr, aCategory } = {}) {
  const e = fin(egfr);
  if (e == null || e < 0) {
    return {
      valid: false,
      band: 'Enter the eGFR (mL/min/1.73m²) and either the UACR (mg/g) or the albuminuria category.',
      note: 'KDIGO stages CKD on two axes: GFR category (G1-G5) and albuminuria category (A1-A3). The prognosis is the heat-map cell where they meet.',
    };
  }
  // A-stage: direct category wins; else from a numeric UACR.
  let aStage = null;
  const u = fin(uacr);
  if (aCategory === 'A1' || aCategory === 'A2' || aCategory === 'A3') aStage = aCategory;
  else if (u != null && u >= 0) aStage = aStageOf(u);
  if (aStage == null) {
    return {
      valid: false,
      band: 'Enter the UACR (mg/g) or select the albuminuria category (A1 < 30, A2 30-300, A3 > 300).',
      note: 'The KDIGO risk cell needs both axes: the GFR category from eGFR and the albuminuria category from the UACR (or selected directly).',
    };
  }
  const gStage = gStageOf(e);
  const riskKey = KDIGO_MATRIX[gStage][aStage];
  return {
    valid: true,
    egfr: r1(e),
    uacr: u != null ? r1(u) : null,
    gStage,
    aStage,
    gLabel: G_LABEL[gStage],
    aLabel: A_LABEL[aStage],
    riskKey,
    risk: KDIGO_RISK[riskKey],
    band: `KDIGO ${gStage}/${aStage}: ${KDIGO_RISK[riskKey]}.`,
    note: `KDIGO heat-map cell ${gStage} x ${aStage}. G-stage by eGFR: G1 >= 90, G2 60-89, G3a 45-59, G3b 30-44, G4 15-29, G5 < 15. A-stage by UACR: A1 < 30, A2 30-300, A3 > 300 mg/g. The risk color (green/yellow/orange/red) is the KDIGO prognosis for progression and cardiovascular risk, not an individual outcome; confirm an abnormal eGFR/UACR on repeat over >= 3 months for CKD.`,
  };
}

// --- 2.2 uacrUpcr - spot urine albumin/protein-to-creatinine ratios ----------
// UACR (mg/g) = urine albumin (mg/dL) / urine creatinine (mg/dL) x 1000 (because
// ~1 g creatinine is excreted per day, the ratio also estimates 24-h excretion
// in mg). UPCR is the protein analogue. The albumin unit toggle (mg/dL <-> mg/L)
// converts before the ratio. Urine creatinine of 0 or blank is a surfaced
// fallback, never a NaN/Infinity ratio. The A-stage uses the same cutoffs as
// ckdStaging so the two agree.
export function uacrUpcr({ albumin, albuminUnit = 'mg/dL', protein, urineCr } = {}) {
  const cr = pos(urineCr);
  if (cr == null) {
    return {
      valid: false,
      band: 'Enter the urine creatinine (mg/dL, must be > 0) and a urine albumin or protein value.',
      note: 'The spot ratio divides by urine creatinine; a urine creatinine of 0 or blank has no defined ratio.',
    };
  }
  // Albumin: convert mg/L -> mg/dL (1 mg/dL = 10 mg/L) before the ratio.
  let alb = fin(albumin);
  if (alb != null && albuminUnit === 'mg/L') alb = alb / 10;
  if (alb != null && alb < 0) alb = null;
  const pr = fin(protein);
  const prV = (pr != null && pr >= 0) ? pr : null;
  if (alb == null && prV == null) {
    return {
      valid: false,
      band: 'Enter a urine albumin (mg/dL or mg/L) or a urine protein (mg/dL) value.',
      note: 'Provide at least one of urine albumin (for the UACR + A-stage) or urine protein (for the UPCR).',
    };
  }
  const result = { valid: true };
  const parts = [];
  if (alb != null) {
    const uacr = (alb / cr) * 1000;
    const aStage = aStageOf(uacr);
    result.uacr = r1(uacr);
    result.albuminExcretion = r1(uacr); // mg/day estimate (~1 g Cr/day)
    result.aStage = aStage;
    result.aLabel = A_LABEL[aStage];
    parts.push(`UACR ${r1(uacr)} mg/g (${aStage}); estimated albumin excretion ~${r1(uacr)} mg/day`);
  }
  if (prV != null) {
    const upcr = (prV / cr) * 1000;
    result.upcr = r1(upcr);
    result.proteinExcretion = r1(upcr); // mg/day estimate
    parts.push(`UPCR ${r1(upcr)} mg/g; estimated protein excretion ~${r1(upcr)} mg/day`);
  }
  result.band = `${parts.join('. ')}.`;
  result.note = 'Spot ratio (mg/g) = analyte (mg/dL) / urine creatinine (mg/dL) x 1000. Because ~1 g of creatinine is excreted daily, the ratio also estimates 24-hour excretion in mg. The A-stage (A1 < 30, A2 30-300, A3 > 300 mg/g) uses the KDIGO albuminuria cutoffs and matches the CKD-staging tile. A first-morning specimen is preferred; confirm an abnormal ratio on repeat.';
  return result;
}

// --- 2.3 ktvUrr - hemodialysis adequacy (URR + Daugirdas spKt/V) -------------
// URR = (1 - post/pre) x 100% (needs pre-BUN > 0). Single-pool Kt/V by the
// Daugirdas second-generation equation: Kt/V = -ln(R - 0.008.t) + (4 - 3.5.R).UF/W,
// R = post-BUN/pre-BUN. The ln domain (R - 0.008.t > 0) and W > 0 are guarded;
// URR is computed independently so a blank UF/time/weight still yields URR alone.
// KDOQI minimum targets: URR >= 65%, spKt/V >= 1.2.
export function ktvUrr({ preBun, postBun, ufVolume, dialysisTime, postWeight } = {}) {
  const pre = pos(preBun);
  const post = fin(postBun);
  if (pre == null || post == null || post < 0) {
    return {
      valid: false,
      band: 'Enter the pre-dialysis BUN (mg/dL, must be > 0) and post-dialysis BUN (mg/dL).',
      note: 'The urea reduction ratio and Kt/V both need pre- and post-dialysis BUN; pre-dialysis BUN must be > 0.',
    };
  }
  const R = post / pre;
  const urr = (1 - R) * 100;
  const result = {
    valid: true,
    urr: r1(urr),
    R: r2(R),
    urrMet: urr >= 65,
  };
  const parts = [`URR ${r1(urr)}% (KDOQI target >= 65%: ${urr >= 65 ? 'met' : 'below target'})`];

  // Kt/V needs UF volume, session time, and post-dialysis weight; all optional.
  const uf = fin(ufVolume);
  const t = pos(dialysisTime);
  const w = pos(postWeight);
  if (uf != null && uf >= 0 && t != null && w != null) {
    const lnArg = R - 0.008 * t;
    if (lnArg > 0) {
      const ktv = -Math.log(lnArg) + (4 - 3.5 * R) * (uf / w);
      result.ktv = r2(ktv);
      result.ktvMet = ktv >= 1.2;
      parts.push(`single-pool Kt/V ${r2(ktv)} (KDOQI target >= 1.2: ${ktv >= 1.2 ? 'met' : 'below target'})`);
    } else {
      result.ktvDomain = false;
      parts.push('single-pool Kt/V not defined (R - 0.008·t <= 0; check the post/pre BUN and session time)');
    }
  } else {
    parts.push('enter UF volume (L), session time (h) and post-dialysis weight (kg) for the single-pool Kt/V');
  }
  result.band = `${parts.join('; ')}.`;
  result.note = 'URR = (1 - post-BUN/pre-BUN) x 100%. Daugirdas second-generation single-pool Kt/V = -ln(R - 0.008·t) + (4 - 3.5·R)·UF/W, with R = post/pre BUN, t in hours, UF the ultrafiltration volume (L) and W the post-dialysis weight (kg). KDOQI minimum adequacy: URR >= 65%, spKt/V >= 1.2 (thrice-weekly); the target stays a unit/clinician decision and individual prescriptions vary.';
  return result;
}

// --- 2.4 mehranCin - Mehran contrast-induced nephropathy risk score ----------
// Integer point sum: hypotension 5, IABP 5, CHF 5, age > 75 = 4, anemia 3,
// diabetes 3, contrast volume 1 per 100 mL, eGFR (40-60 = 2, 20-40 = 4, < 20 = 6).
// Bands: <= 5 low, 6-10 moderate, 11-15 high, >= 16 very high. A blank optional
// factor contributes 0 (partial-input fallback).
const MEHRAN_RISK = {
  low: 'low risk: ~7.5% contrast-induced nephropathy, ~0.04% dialysis (Mehran 2004)',
  moderate: 'moderate risk: ~14.0% contrast-induced nephropathy, ~0.12% dialysis (Mehran 2004)',
  high: 'high risk: ~26.1% contrast-induced nephropathy, ~1.09% dialysis (Mehran 2004)',
  vhigh: 'very high risk: ~57.3% contrast-induced nephropathy, ~12.6% dialysis (Mehran 2004)',
};
const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1;
function egfrPoints(e) {
  if (e == null) return 0;
  if (e < 20) return 6;
  if (e < 40) return 4;
  if (e < 60) return 2;
  return 0;
}
export function mehranCin({
  hypotension, iabp, chf, ageOver75, anemia, diabetes, contrastVolume, egfr,
} = {}) {
  const hypoPts = onFlag(hypotension) ? 5 : 0;
  const iabpPts = onFlag(iabp) ? 5 : 0;
  const chfPts = onFlag(chf) ? 5 : 0;
  const agePts = onFlag(ageOver75) ? 4 : 0;
  const anemiaPts = onFlag(anemia) ? 3 : 0;
  const dmPts = onFlag(diabetes) ? 3 : 0;
  const vol = fin(contrastVolume);
  const volPts = (vol != null && vol > 0) ? vol / 100 : 0;
  const e = fin(egfr);
  const egfrPts = egfrPoints(e != null && e >= 0 ? e : null);

  const total = hypoPts + iabpPts + chfPts + agePts + anemiaPts + dmPts + volPts + egfrPts;
  let bandKey;
  if (total <= 5) bandKey = 'low';
  else if (total <= 10) bandKey = 'moderate';
  else if (total <= 15) bandKey = 'high';
  else bandKey = 'vhigh';

  return {
    valid: true,
    total: r1(total),
    points: {
      hypotension: hypoPts, iabp: iabpPts, chf: chfPts, ageOver75: agePts,
      anemia: anemiaPts, diabetes: dmPts, contrast: r1(volPts), egfr: egfrPts,
    },
    riskKey: bandKey,
    risk: MEHRAN_RISK[bandKey],
    band: `Mehran score ${r1(total)}: ${MEHRAN_RISK[bandKey]}.`,
    note: 'Mehran points: hypotension 5, intra-aortic balloon pump 5, congestive heart failure 5, age > 75 = 4, anemia 3, diabetes 3, contrast volume 1 per 100 mL, eGFR (40-60 = 2, 20-40 = 4, < 20 = 6). Risk bands: <= 5 low, 6-10 moderate, 11-15 high, >= 16 very high. The percentages are the Mehran 2004 PCI-cohort estimates, not an individual prediction; hydration and contrast minimisation remain the clinician decision.',
  };
}

// --- 2.5 ckdEpiCystatin - 2021 race-free CKD-EPI eGFR (cys / combined / cr) ---
// Inker 2021 NEJM equations. eGFRcys (cystatin-only) and eGFRcr-cys (combined)
// are reported beside the creatinine-only eGFRcr for comparison. Each estimate
// is computed independently, so a missing creatinine still yields eGFRcys. All
// power terms use positive, in-domain bases (cystatin C / creatinine > 0).
function egfrCys(scys, age, female) {
  const ratio = scys / 0.8;
  const v = 133
    * Math.pow(Math.min(ratio, 1), -0.499)
    * Math.pow(Math.max(ratio, 1), -1.328)
    * Math.pow(0.996, age)
    * (female ? 0.932 : 1);
  return v;
}
function egfrCr(scr, age, female) {
  const kappa = female ? 0.7 : 0.9;
  const alpha = female ? -0.241 : -0.302;
  const ratio = scr / kappa;
  const v = 142
    * Math.pow(Math.min(ratio, 1), alpha)
    * Math.pow(Math.max(ratio, 1), -1.200)
    * Math.pow(0.9938, age)
    * (female ? 1.012 : 1);
  return v;
}
function egfrCrCys(scr, scys, age, female) {
  const kappa = female ? 0.7 : 0.9;
  const alpha = female ? -0.219 : -0.144;
  const rCr = scr / kappa;
  const rCys = scys / 0.8;
  const v = 135
    * Math.pow(Math.min(rCr, 1), alpha)
    * Math.pow(Math.max(rCr, 1), -0.544)
    * Math.pow(Math.min(rCys, 1), -0.323)
    * Math.pow(Math.max(rCys, 1), -0.778)
    * Math.pow(0.9961, age)
    * (female ? 0.963 : 1);
  return v;
}
export function ckdEpiCystatin({ cystatinC, creatinine, age, sex = 'male' } = {}) {
  const a = fin(age);
  const scys = pos(cystatinC);
  const scr = pos(creatinine);
  const female = sex === 'female' || sex === 'f';
  if (a == null || a < 0 || scys == null) {
    return {
      valid: false,
      band: 'Enter age (years), sex, and serum cystatin C (mg/L, must be > 0); add serum creatinine for the combined estimate.',
      note: 'The 2021 race-free CKD-EPI cystatin-C equation needs age, sex and a positive serum cystatin C; the combined equation also needs serum creatinine.',
    };
  }
  const cys = egfrCys(scys, a, female);
  const result = {
    valid: true,
    sex: female ? 'female' : 'male',
    egfrCys: r1(cys),
  };
  const parts = [`eGFRcys ${r1(cys)} mL/min/1.73m²`];
  if (scr != null) {
    const comb = egfrCrCys(scr, scys, a, female);
    const cr = egfrCr(scr, a, female);
    result.egfrCrCys = r1(comb);
    result.egfrCr = r1(cr);
    parts.push(`eGFRcr-cys ${r1(comb)} (combined)`, `eGFRcr ${r1(cr)} (creatinine-only)`);
  } else {
    parts.push('enter serum creatinine for the combined and creatinine-only estimates');
  }
  result.band = `${parts.join('; ')}.`;
  result.note = '2021 CKD-EPI equations without a race coefficient (Inker 2021). eGFRcys uses cystatin C alone; eGFRcr-cys combines creatinine and cystatin C and is the recommended confirmatory estimate when a creatinine-only value is near a decision threshold. All three are in mL/min/1.73m²; eGFR is an estimate and is less reliable near-normal and at extremes of muscle mass.';
  return result;
}
