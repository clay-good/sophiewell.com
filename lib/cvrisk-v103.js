// spec-v103 (Wave 1 of the spec-v100 MDCalc Parity Completion program): six
// deterministic cardiovascular-risk and atherogenic-lipid engines that fill
// confirmed gaps beside the existing ascvd (Pooled Cohort) and prevent tiles.
// None duplicates a live tile; each complements, never replaces, ascvd/prevent.
//
//   score2          - SCORE2 (ESC 2021, age 40-69) -> region-calibrated 10-yr CVD risk %
//   score2Op        - SCORE2-OP (ESC 2021, age >= 70) -> region-calibrated 10-yr CVD risk %
//   mesaChd         - MESA 10-year CHD risk with/without coronary-artery calcium
//   framinghamCvd   - Framingham general CVD risk (D'Agostino 2008) + vascular age
//   reynoldsRisk    - Reynolds Risk Score (hsCRP + family history)
//   nonHdlRemnant   - non-HDL & remnant cholesterol (arithmetic identity)
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v28.js wire these to the home grid.
//
// COEFFICIENTS RE-FETCHED, NEVER RECALLED (spec-v97 lesson; spec-v103 §4): the
// SCORE2 / SCORE2-OP sex-specific betas, baseline survivals, and the four-region
// scale1/scale2 recalibration pairs are transcribed from the published EHJ 2021
// supplementary material (cross-checked against the CRAN RiskScorescvd source and
// the two ESC worked examples, which this set reproduces exactly: a 50yo smoker,
// SBP 140, TC 5.5, HDL 1.3 mmol/L gives low-region 5.9% / very-high 14.0% for men
// and 4.2% / 13.7% for women). The MESA betas + baseline survivals (0.99963 no-CAC,
// 0.99833 with-CAC) and the ln(CAC+1) coefficient 0.2743 are from McClelland 2015
// (cross-checked against the CVrisk R package). The Framingham 2008 betas, baseline
// survivals, and centering constants and the Reynolds women's/men's coefficients are
// from the primary papers (cross-checked against open implementations).
//
// Robustness (spec-v103 §3): every logistic/Cox exponent is clamped to an
// overflow-safe range so an extreme fuzzed predictor returns a probability in
// [0, 1] rather than Infinity; every ln() of a continuous predictor guards a
// positive domain and returns a surfaced valid:false on a non-positive or blank
// input; the SCORE2 region selector keys the compiled coefficient block and
// returns a surfaced fallback on an unrecognized region rather than reading
// undefined coefficients. None authors a statin-start or lipid-target order in
// Sophie's voice (spec-v11 §5.3).

import { r1, r2 } from './num.js';

const fin = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const pos = (v) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : null);
const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// Survival/exponent helper shared by the Cox/logistic engines: clamp the linear
// predictor before exp() so an extreme fuzzed input can never overflow to
// Infinity, then clamp the resulting probability to (0, 1).
function survRisk(s0, lp) {
  const e = Math.exp(clamp(lp, -50, 50));
  const risk = 1 - Math.pow(s0, e);
  return clamp(risk, 0, 1);
}

// ---- SCORE2 / SCORE2-OP shared region recalibration (cloglog link) -----------
// calibrated = 1 - exp(-exp(scale1 + scale2 * ln(-ln(1 - uncalibrated)))).
// Guard the double-log by clamping the uncalibrated risk away from {0, 1}.
function recalibrate(uncal, scale1, scale2) {
  const u = clamp(uncal, 1e-12, 1 - 1e-12);
  const inner = scale1 + scale2 * Math.log(-Math.log(1 - u));
  const cal = 1 - Math.exp(-Math.exp(clamp(inner, -50, 50)));
  return clamp(cal, 0, 1);
}

// ESC age-banded risk category (2021 guideline). < 50: low < 2.5, high >= 7.5;
// 50-69: low < 5, high >= 10; >= 70: low < 7.5, high >= 15 (% 10-yr CVD).
function escCategory(age, riskPct) {
  const lowHi = age < 50 ? [2.5, 7.5] : age < 70 ? [5, 10] : [7.5, 15];
  if (riskPct < lowHi[0]) return 'low-to-moderate';
  if (riskPct < lowHi[1]) return 'high';
  return 'very-high';
}

const SCORE2_REGIONS = ['low', 'moderate', 'high', 'very-high'];
const REGION_LABEL = { low: 'low', moderate: 'moderate', high: 'high', 'very-high': 'very high' };

// --- 2.1 score2 - SCORE2 (ESC 2021, age 40-69) --------------------------------
// Cholesterol in mmol/L (European model convention). diabetes is 0 for the
// non-diabetic SCORE2 target population (a separate SCORE2-Diabetes model exists).
const SCORE2_BETA = {
  male: { age: 0.3742, smoke: 0.6012, sbp: 0.2777, chol: 0.1458, hdl: -0.2698, ageSmoke: -0.0755, ageSbp: -0.0255, ageChol: -0.0281, ageHdl: 0.0426, s0: 0.9605 },
  female: { age: 0.4648, smoke: 0.7744, sbp: 0.3131, chol: 0.1002, hdl: -0.2606, ageSmoke: -0.1088, ageSbp: -0.0277, ageChol: -0.0226, ageHdl: 0.0613, s0: 0.9776 },
};
// scale1/scale2 by region and sex (age < 70).
const SCORE2_SCALE = {
  male: { low: [-0.5699, 0.7476], moderate: [-0.1565, 0.8009], high: [0.3207, 0.9360], 'very-high': [0.5836, 0.8294] },
  female: { low: [-0.7380, 0.7019], moderate: [-0.3143, 0.7701], high: [0.5710, 0.9369], 'very-high': [0.9412, 0.8329] },
};
const SCORE2_NOTE = 'SCORE2 (SCORE2 working group & ESC Cardiovascular Risk Collaboration, Eur Heart J 2021; ages 40-69, apparently healthy, no prior CVD or diabetes): 10-year risk of fatal AND non-fatal cardiovascular disease, calibrated to one of four European risk regions. Cholesterol is entered in mmol/L (divide mg/dL by 38.67). The region-calibrated transform (1 - S0^exp of the sex-specific linear predictor, then the published cloglog recalibration) is reported with the ESC age-banded category. SCORE2 is EUROPEAN-region calibrated -- it complements, does not replace, the US Pooled-Cohort (ascvd) / PREVENT engines. A risk estimate, not a statin-start order.';

export function score2({ age, male, smoker, sbp, totalChol, hdl, region } = {}) {
  const a = fin(age), s = fin(sbp), tc = fin(totalChol), h = fin(hdl);
  const reg = String(region);
  const sex = onFlag(male) ? 'male' : 'female';
  if (a == null || s == null || tc == null || h == null) {
    return { valid: false, band: '(enter age, systolic BP, total & HDL cholesterol in mmol/L, and region)', note: SCORE2_NOTE };
  }
  if (!SCORE2_REGIONS.includes(reg)) {
    return { valid: false, band: '(select a risk region: low / moderate / high / very-high)', note: SCORE2_NOTE };
  }
  const b = SCORE2_BETA[sex];
  const cage = (clamp(a, 40, 69) - 60) / 5;
  const csbp = (clamp(s, 60, 250) - 120) / 20;
  const cchol = clamp(tc, 1, 20) - 6;
  const chdl = (clamp(h, 0.2, 5) - 1.3) / 0.5;
  const sm = onFlag(smoker) ? 1 : 0;
  const lp = b.age * cage + b.smoke * sm + b.sbp * csbp + b.chol * cchol + b.hdl * chdl
    + b.ageSmoke * cage * sm + b.ageSbp * cage * csbp + b.ageChol * cage * cchol + b.ageHdl * cage * chdl;
  const uncal = survRisk(b.s0, lp);
  const [s1, s2] = SCORE2_SCALE[sex][reg];
  const riskPct = r1(recalibrate(uncal, s1, s2) * 100);
  const cat = escCategory(a, riskPct);
  return {
    valid: true,
    risk: riskPct,
    category: cat,
    region: reg,
    sex,
    band: `SCORE2 (${REGION_LABEL[reg]}-risk region): 10-year CVD risk ${riskPct}% -- ${cat} category.`,
    note: SCORE2_NOTE,
  };
}

// --- 2.2 score2-op - SCORE2-OP (ESC 2021, age >= 70) --------------------------
const SCORE2OP_BETA = {
  male: { age: 0.0634, dm: 0.4245, smoke: 0.3524, sbp: 0.0094, chol: 0.0850, hdl: -0.3564, ageDm: -0.0174, ageSmoke: -0.0247, ageSbp: -0.0005, ageChol: 0.0073, ageHdl: 0.0091, s0: 0.7576, meanLp: 0.0929 },
  female: { age: 0.0789, dm: 0.6010, smoke: 0.4921, sbp: 0.0102, chol: 0.0605, hdl: -0.3040, ageDm: -0.0107, ageSmoke: -0.0255, ageSbp: -0.0004, ageChol: -0.0009, ageHdl: 0.0154, s0: 0.8082, meanLp: 0.229 },
};
const SCORE2OP_SCALE = {
  male: { low: [-0.34, 1.19], moderate: [0.01, 1.25], high: [0.08, 1.15], 'very-high': [0.05, 0.70] },
  female: { low: [-0.52, 1.01], moderate: [-0.10, 1.10], high: [0.38, 1.09], 'very-high': [0.38, 0.69] },
};
const SCORE2OP_NOTE = 'SCORE2-OP (SCORE2-OP working group & ESC Cardiovascular Risk Collaboration, Eur Heart J 2021; ages >= 70): the older-persons companion to SCORE2 for 10-year fatal AND non-fatal cardiovascular risk, region-calibrated to the same four European regions. Adds diabetes as a predictor. Cholesterol in mmol/L (divide mg/dL by 38.67). Centered at age 73, SBP 150, TC 6, HDL 1.4; uncalibrated risk 1 - S0^exp(LP - mean), then the published cloglog recalibration. Cross-links score2. A risk estimate, not a therapy order.';

export function score2Op({ age, male, smoker, sbp, totalChol, hdl, diabetes, region } = {}) {
  const a = fin(age), s = fin(sbp), tc = fin(totalChol), h = fin(hdl);
  const reg = String(region);
  const sex = onFlag(male) ? 'male' : 'female';
  if (a == null || s == null || tc == null || h == null) {
    return { valid: false, band: '(enter age >= 70, systolic BP, total & HDL cholesterol in mmol/L, and region)', note: SCORE2OP_NOTE };
  }
  if (!SCORE2_REGIONS.includes(reg)) {
    return { valid: false, band: '(select a risk region: low / moderate / high / very-high)', note: SCORE2OP_NOTE };
  }
  const b = SCORE2OP_BETA[sex];
  const cage = clamp(a, 70, 100) - 73;
  const csbp = clamp(s, 60, 250) - 150;
  const cchol = clamp(tc, 1, 20) - 6;
  const chdl = clamp(h, 0.2, 5) - 1.4;
  const sm = onFlag(smoker) ? 1 : 0;
  const dm = onFlag(diabetes) ? 1 : 0;
  const lp = b.age * cage + b.dm * dm + b.smoke * sm + b.sbp * csbp + b.chol * cchol + b.hdl * chdl
    + b.ageDm * cage * dm + b.ageSmoke * cage * sm + b.ageSbp * cage * csbp + b.ageChol * cage * cchol + b.ageHdl * cage * chdl;
  const uncal = survRisk(b.s0, lp - b.meanLp);
  const [s1, s2] = SCORE2OP_SCALE[sex][reg];
  const riskPct = r1(recalibrate(uncal, s1, s2) * 100);
  const cat = escCategory(a, riskPct);
  return {
    valid: true,
    risk: riskPct,
    category: cat,
    region: reg,
    sex,
    band: `SCORE2-OP (${REGION_LABEL[reg]}-risk region): 10-year CVD risk ${riskPct}% -- ${cat} category.`,
    note: SCORE2OP_NOTE,
  };
}

// --- 2.3 mesa-chd - MESA 10-Year CHD Risk (with/without coronary calcium) -----
// Penalized Cox; raw (uncentered) inputs in mg/dL. White is the reference race.
// Risk = 1 - S0^exp(sum(beta*x)); with-CAC adds 0.2743*ln(CAC+1).
const MESA_NOCAC = { age: 0.0455, male: 0.7496, chinese: -0.5055, black: -0.2111, hispanic: -0.1900, diabetes: 0.5168, smoker: 0.4732, chol: 0.0053, hdl: -0.0140, lipidMed: 0.2473, sbp: 0.0085, bpMed: 0.3381, familyHx: 0.4522, s0: 0.99963 };
const MESA_CAC = { age: 0.0172, male: 0.4079, chinese: -0.3475, black: 0.0353, hispanic: -0.0222, diabetes: 0.3892, smoker: 0.3717, chol: 0.0043, hdl: -0.0114, lipidMed: 0.1206, sbp: 0.0066, bpMed: 0.2278, familyHx: 0.3239, cac: 0.2743, s0: 0.99833 };
const MESA_RACES = ['white', 'chinese', 'black', 'hispanic'];
const MESA_NOTE = 'MESA 10-year CHD risk (McClelland RL et al, J Am Coll Cardiol 2015; Multi-Ethnic Study of Atherosclerosis): coronary-heart-disease (MI, resuscitated cardiac arrest, CHD death, or revascularization with angina) risk from traditional factors AND, when entered, the Agatston coronary-artery-calcium score. Cholesterol in mg/dL; race is white (reference) / Chinese-American / African-American / Hispanic. The CAC term enters as 0.2743 x ln(CAC + 1). Reported with and without CAC so the calcium refinement is visible. A risk estimate, not a statin or CT-angiography order.';

export function mesaChd({ age, male, race, diabetes, smoker, totalChol, hdl, lipidMed, sbp, bpMed, familyHx, cac } = {}) {
  const a = fin(age), tc = fin(totalChol), h = fin(hdl), s = fin(sbp);
  const c = fin(cac);
  const rc = String(race);
  if (a == null || tc == null || h == null || s == null) {
    return { valid: false, band: '(enter age, total & HDL cholesterol in mg/dL, and systolic BP)', note: MESA_NOTE };
  }
  const raceKey = MESA_RACES.includes(rc) ? rc : 'white';
  const flags = {
    male: onFlag(male) ? 1 : 0, diabetes: onFlag(diabetes) ? 1 : 0, smoker: onFlag(smoker) ? 1 : 0,
    lipidMed: onFlag(lipidMed) ? 1 : 0, bpMed: onFlag(bpMed) ? 1 : 0, familyHx: onFlag(familyHx) ? 1 : 0,
  };
  const aC = clamp(a, 18, 120), tcC = clamp(tc, 50, 600), hC = clamp(h, 5, 200), sC = clamp(s, 60, 300);
  const raceTerm = (k) => (raceKey === 'chinese' ? k.chinese : raceKey === 'black' ? k.black : raceKey === 'hispanic' ? k.hispanic : 0);
  const linNoCac = (k) => k.age * aC + k.male * flags.male + raceTerm(k) + k.diabetes * flags.diabetes
    + k.smoker * flags.smoker + k.chol * tcC + k.hdl * hC + k.lipidMed * flags.lipidMed
    + k.sbp * sC + k.bpMed * flags.bpMed + k.familyHx * flags.familyHx;
  const riskNoCac = r2(survRisk(MESA_NOCAC.s0, linNoCac(MESA_NOCAC)) * 100);
  let riskWithCac = null;
  if (c != null) {
    const cacC = clamp(c, 0, 10000);
    const lin = linNoCac(MESA_CAC) + MESA_CAC.cac * Math.log(cacC + 1);
    riskWithCac = r2(survRisk(MESA_CAC.s0, lin) * 100);
  }
  const band = riskWithCac != null
    ? `MESA 10-year CHD risk: ${riskWithCac}% with CAC ${Math.round(clamp(c, 0, 10000))}, ${riskNoCac}% without CAC.`
    : `MESA 10-year CHD risk: ${riskNoCac}% (without CAC; enter an Agatston score to refine).`;
  return { valid: true, riskNoCac, riskWithCac, race: raceKey, band, note: MESA_NOTE };
}

// --- 2.4 framingham-cvd - Framingham General CVD Risk (D'Agostino 2008) -------
// Sex-specific Cox on ln-transformed predictors (mg/dL chol, mmHg SBP). Vascular
// age = the age at which the reference profile (TC 180, HDL 45, SBP 125 untreated,
// non-smoker, non-diabetic) yields the same 10-year risk.
const FRAM = {
  male: { lnAge: 3.06117, lnChol: 1.12370, lnHdl: -0.93263, lnSbpUntreated: 1.93303, lnSbpTreated: 1.99881, smoker: 0.65451, diabetes: 0.57367, center: 23.9802, s0: 0.88936 },
  female: { lnAge: 2.32888, lnChol: 1.20904, lnHdl: -0.70833, lnSbpUntreated: 2.76157, lnSbpTreated: 2.82263, smoker: 0.52873, diabetes: 0.69154, center: 26.1931, s0: 0.95012 },
};
const FRAM_NOTE = 'Framingham general cardiovascular risk (D\'Agostino RB Sr et al, Circulation 2008; primary-care general-CVD profile): 10-year risk of coronary disease, stroke, peripheral artery disease, or heart failure from the sex-specific Cox model. Cholesterol in mg/dL, SBP in mmHg; the treated-BP coefficient is used when on antihypertensives. Validated for ages 30-74. "Vascular age" is the age at which an otherwise-normal-risk person (TC 180, HDL 45, SBP 125 untreated, non-smoker, non-diabetic) carries the same 10-year risk. A risk estimate, not a therapy order.';

function framLp(b, lnAge, lnChol, lnHdl, sbp, treated, sm, dm) {
  const bSbp = treated ? b.lnSbpTreated : b.lnSbpUntreated;
  return b.lnAge * lnAge + b.lnChol * lnChol + b.lnHdl * lnHdl + bSbp * Math.log(sbp) + b.smoker * sm + b.diabetes * dm;
}

export function framinghamCvd({ age, male, totalChol, hdl, sbp, bpTreated, smoker, diabetes } = {}) {
  const a = pos(age), tc = pos(totalChol), h = pos(hdl), s = pos(sbp);
  const sex = onFlag(male) ? 'male' : 'female';
  if (a == null || tc == null || h == null || s == null) {
    return { valid: false, band: '(enter age, total & HDL cholesterol in mg/dL, and systolic BP)', note: FRAM_NOTE };
  }
  const b = FRAM[sex];
  const treated = onFlag(bpTreated);
  const sm = onFlag(smoker) ? 1 : 0;
  const dm = onFlag(diabetes) ? 1 : 0;
  const lp = framLp(b, Math.log(clamp(a, 20, 100)), Math.log(clamp(tc, 50, 600)), Math.log(clamp(h, 5, 200)), clamp(s, 60, 300), treated, sm, dm);
  const risk = survRisk(b.s0, lp - b.center);
  const riskPct = r1(risk * 100);
  // Vascular age: solve risk = 1 - S0^exp(lnAge*ln(A) + refConst - center) for A.
  const refConst = b.lnChol * Math.log(180) + b.lnHdl * Math.log(45) + b.lnSbpUntreated * Math.log(125);
  let vascAge = null;
  const u = clamp(risk, 1e-9, 1 - 1e-9);
  const target = Math.log(1 - u) / Math.log(b.s0); // = exp(lp_ref - center) > 0
  if (target > 0) {
    const lnA = (Math.log(target) - refConst + b.center) / b.lnAge;
    vascAge = r1(clamp(Math.exp(lnA), 20, 120));
  }
  return {
    valid: true,
    risk: riskPct,
    vascularAge: vascAge,
    sex,
    band: `Framingham 10-year general-CVD risk ${riskPct}%${vascAge != null ? ` (vascular age ${vascAge}).` : '.'}`,
    note: FRAM_NOTE,
  };
}

// --- 2.5 reynolds-risk - Reynolds Risk Score (Ridker 2007/2008) ---------------
// Women: linear age, HbA1c term if diabetic. Men: ln(age), no HbA1c (the men's
// derivation cohort excluded diabetics). Cholesterol mg/dL, hsCRP mg/L.
const REYNOLDS_NOTE = 'Reynolds Risk Score (Ridker PM et al, JAMA 2007 [women] / Circulation 2008 [men]): 10-year risk of MI, stroke, coronary revascularization, or cardiovascular death, adding high-sensitivity CRP and parental history of premature MI to the traditional factors. Cholesterol in mg/dL, hsCRP in mg/L. The women\'s model includes an HbA1c term for diabetics; the men\'s model was derived in non-diabetics (no HbA1c term, flag a diabetic man). A risk estimate, not a therapy order.';

export function reynoldsRisk({ age, male, sbp, smoker, totalChol, hdl, hsCrp, familyHx, diabetic, hba1c } = {}) {
  const a = pos(age), s = pos(sbp), tc = pos(totalChol), h = pos(hdl), crp = pos(hsCrp);
  if (a == null || s == null || tc == null || h == null || crp == null) {
    return { valid: false, band: '(enter age, systolic BP, total & HDL cholesterol in mg/dL, and hsCRP in mg/L)', note: REYNOLDS_NOTE };
  }
  const aC = clamp(a, 20, 100), sC = clamp(s, 60, 300), tcC = clamp(tc, 50, 600), hC = clamp(h, 5, 200), crpC = clamp(crp, 0.01, 100);
  const sm = onFlag(smoker) ? 1 : 0;
  const fh = onFlag(familyHx) ? 1 : 0;
  let lp, s0, center;
  let diabeticManNote = null;
  if (onFlag(male)) {
    s0 = 0.8990; center = 33.097;
    lp = 4.385 * Math.log(aC) + 2.607 * Math.log(sC) + 0.963 * Math.log(tcC) - 0.772 * Math.log(hC) + 0.102 * Math.log(crpC) + 0.405 * sm + 0.541 * fh;
    if (onFlag(diabetic)) diabeticManNote = 'The men\'s Reynolds model was derived in non-diabetics; for a diabetic man it is outside its derivation population.';
  } else {
    s0 = 0.98634; center = 22.325;
    const dm = onFlag(diabetic);
    const a1c = dm ? clamp(fin(hba1c) != null ? fin(hba1c) : 0, 0, 25) : 0;
    lp = 0.0799 * aC + 3.137 * Math.log(sC) + 0.180 * Math.log(crpC) + 1.382 * Math.log(tcC) - 1.172 * Math.log(hC) + (dm ? 0.134 * a1c : 0) + 0.818 * sm + 0.438 * fh;
  }
  const risk = clamp(1 - Math.pow(s0, Math.exp(clamp(lp - center, -50, 50))), 0, 1);
  const riskPct = r1(risk * 100);
  return {
    valid: true,
    risk: riskPct,
    sex: onFlag(male) ? 'male' : 'female',
    band: `Reynolds 10-year cardiovascular risk ${riskPct}%.`,
    diabeticManNote,
    note: REYNOLDS_NOTE,
  };
}

// --- 2.6 non-hdl-remnant - Non-HDL & Remnant Cholesterol ----------------------
// non-HDL = TC - HDL; remnant = TC - HDL - LDL. Unit preserved (mg/dL or mmol/L).
const NONHDL_NOTE = 'Non-HDL and remnant cholesterol (Varbo A et al, J Am Coll Cardiol 2013): non-HDL = total cholesterol - HDL (all atherogenic, apoB-containing lipoproteins); remnant = total cholesterol - HDL - LDL (the cholesterol carried by triglyceride-rich remnant particles). The unit you enter (mg/dL or mmol/L) is preserved. Guideline non-HDL targets run ~30 mg/dL above the matching LDL goal (e.g. non-HDL < 130 mg/dL for an LDL < 100 goal). An arithmetic identity, not a risk model or therapy order.';

export function nonHdlRemnant({ totalChol, hdl, ldl, unit } = {}) {
  const tc = fin(totalChol), h = fin(hdl), l = fin(ldl);
  const u = unit === 'mmol' ? 'mmol/L' : 'mg/dL';
  const target = u === 'mmol/L' ? 3.4 : 130;
  if (tc == null || h == null) {
    return { valid: false, band: '(enter total and HDL cholesterol)', note: NONHDL_NOTE };
  }
  const nonHdl = r2(tc - h);
  let remnant = null;
  let implausible = false;
  if (l != null) {
    remnant = r2(tc - h - l);
    if (remnant < 0) implausible = true;
  }
  const targetTxt = nonHdl < target ? `below the ${target} ${u} guideline target` : `at or above the ${target} ${u} guideline target`;
  let band;
  if (remnant == null) {
    band = `Non-HDL cholesterol ${nonHdl} ${u} (${targetTxt}). Enter LDL to compute remnant cholesterol.`;
  } else if (implausible) {
    band = `Non-HDL cholesterol ${nonHdl} ${u}. Remnant is negative (LDL + HDL exceeds total) -- recheck the entered values.`;
  } else {
    band = `Non-HDL ${nonHdl} ${u} (${targetTxt}); remnant cholesterol ${remnant} ${u}.`;
  }
  return { valid: true, nonHdl, remnant, unit: u, target, implausible, band, note: NONHDL_NOTE };
}
