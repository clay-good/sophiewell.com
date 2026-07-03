// spec-v219: metabolic & hepatic indices — two diabetes-risk screeners, three
// anthropometric adiposity indices, and two liver ratios. Every id was verified
// absent by a direct scan of app.js first (spec-v85 §6.2). None duplicates a live
// tile; v219 runs no AI and makes no runtime network call. These screen / estimate
// — they are NOT a diagnostic, screening-test, or biopsy order (spec-v11 §5.3).
//
//   adaDiabetesRisk - ADA / Bang self-assessment diabetes-risk score
//   cambridgeDiabetes - Cambridge Diabetes Risk Score (probability)
//   lap             - Lipid Accumulation Product
//   vai             - Visceral Adiposity Index
//   conicity        - Conicity Index
//   astAltRatio     - AST/ALT (De Ritis) ratio
//   ggtPlatelet     - GGT-to-platelet ratio (GPR)
//
// FORMULAS / COEFFICIENTS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified
// across >= 2 independent open sources at implementation (see per-function
// headers).

import { num, r1, r2 } from './num.js';

function bool(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'on'; }
function sel(v, hi) {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > hi) return 0;
  return Math.round(n);
}
function pos(v, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0 || n > hi) return null;
  return n;
}

// --- ADA / Bang diabetes-risk score ------------------------------------------
// Bang H, et al, Ann Intern Med 2009;151(11):775-783 + the ADA prediabetes risk
// test: Age (40-49 +1, 50-59 +2, >= 60 +3); male +1; prior gestational diabetes
// +1; first-degree relative with diabetes +1; hypertension +1; physically
// inactive +1; BMI (25-30 +1, 30-40 +2, >= 40 +3) (0-13). High risk >= 5.
const ADA_NOTE = 'ADA / Bang diabetes-risk score (Bang H, et al, Ann Intern Med 2009;151(11):775-783): Age (40-49 +1, 50-59 +2, >= 60 +3); male +1; prior gestational diabetes +1; first-degree relative with diabetes +1; hypertension +1; physically inactive +1; BMI (25-30 +1, 30-40 +2, >= 40 +3) (0-13). A total >= 5 flags high risk who should be screened for diabetes/prediabetes. A screening score, not a diagnostic test.';
export function adaDiabetesRisk(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = pos(o.age, 130);
  const bmi = pos(o.bmi, 200);
  if (age === null || bmi === null) {
    return { valid: false, message: 'Enter age (years) and BMI, and mark male sex / prior gestational diabetes / family history / hypertension / physical inactivity.' };
  }
  let s = 0; const p = [];
  const agePts = age >= 60 ? 3 : age >= 50 ? 2 : age >= 40 ? 1 : 0; s += agePts; if (agePts) p.push(`age ${Math.round(age)} (+${agePts})`);
  if (bool(o.male)) { s += 1; p.push('male'); }
  if (bool(o.gdm)) { s += 1; p.push('prior gestational diabetes'); }
  if (bool(o.relative)) { s += 1; p.push('first-degree relative'); }
  if (bool(o.hypertension)) { s += 1; p.push('hypertension'); }
  if (bool(o.inactive)) { s += 1; p.push('physically inactive'); }
  const bmiPts = bmi >= 40 ? 3 : bmi >= 30 ? 2 : bmi >= 25 ? 1 : 0; s += bmiPts; if (bmiPts) p.push(`BMI ${r1(bmi)} (+${bmiPts})`);
  const score = Math.round(num('ADA', s, { min: 0, max: 13 }));
  const abnormal = score >= 5;
  return { valid: true, score, abnormal, bandLabel: `ADA risk ${score}`, band: `ADA diabetes-risk score ${score} — ${abnormal ? 'high risk (>= 5): screen for diabetes/prediabetes' : 'lower risk (< 5)'}.`, detail: p.length ? `Positive: ${p.join('; ')}.` : 'No factors.', note: ADA_NOTE };
}

// --- Cambridge Diabetes Risk Score -------------------------------------------
// Griffin SJ, et al, Diabetes Metab Res Rev 2000;16(3):164-171: logistic
// probability = 1 / (1 + e^-x), x = -6.322 - 0.879*(female) + 1.222*(antihyper)
// + 2.191*(steroids) + 0.063*age + BMI-band + family-history-band + smoking-band.
const CAMB_NOTE = 'Cambridge Diabetes Risk Score (Griffin SJ, et al, Diabetes Metab Res Rev 2000;16(3):164-171): a logistic model of the probability of undiagnosed type 2 diabetes from age, sex, BMI band, family history, smoking, and antihypertensive / steroid use. A screening probability, not a diagnostic test.';
export function cambridgeDiabetes(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = pos(o.age, 130);
  const bmi = pos(o.bmi, 200);
  if (age === null || bmi === null) {
    return { valid: false, message: 'Enter age (years) and BMI, select family history and smoking status, and mark female sex / antihypertensive / steroid use.' };
  }
  const bmiTerm = bmi >= 30 ? 2.518 : bmi >= 27.5 ? 1.97 : bmi >= 25 ? 0.699 : 0;
  const fhx = sel(o.familyHistory, 2); // 0 none, 1 parent or sibling, 2 both
  const fhxTerm = fhx === 2 ? 0.753 : fhx === 1 ? 0.728 : 0;
  const smoke = sel(o.smoking, 2); // 0 non, 1 ex, 2 current
  const smokeTerm = smoke === 2 ? 0.855 : smoke === 1 ? -0.218 : 0;
  const x = -6.322 + (bool(o.female) ? -0.879 : 0) + (bool(o.antihypertensive) ? 1.222 : 0)
    + (bool(o.steroids) ? 2.191 : 0) + 0.063 * age + bmiTerm + fhxTerm + smokeTerm;
  const prob = r2(num('Cambridge', (1 / (1 + Math.exp(-x))) * 100, { min: 0, max: 100 }));
  const abnormal = prob >= 15;
  return { valid: true, probability: prob, abnormal, bandLabel: `Cambridge ${prob}%`, band: `Cambridge Diabetes Risk Score ${prob}% probability of undiagnosed type 2 diabetes.`, detail: `logistic model, x = ${r2(x)}.`, note: CAMB_NOTE };
}

// --- Lipid Accumulation Product ----------------------------------------------
// Kahn HS, BMC Cardiovasc Disord 2005;5:26: Men LAP = (waist[cm] - 65) x
// triglycerides[mmol/L]; Women LAP = (waist[cm] - 58) x triglycerides[mmol/L].
const LAP_NOTE = 'Lipid Accumulation Product (Kahn HS, BMC Cardiovasc Disord 2005;5:26): Men LAP = (waist circumference[cm] - 65) x triglycerides[mmol/L]; Women LAP = (waist - 58) x triglycerides. A central-lipid-overaccumulation index associated with cardiometabolic risk. An index, not a diagnostic test.';
export function lap(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const wc = pos(o.waist, 300);
  const tg = pos(o.triglycerides, 100);
  if (wc === null || tg === null) {
    return { valid: false, message: 'Enter waist circumference (cm) and triglycerides (mmol/L), and mark female sex.' };
  }
  const base = bool(o.female) ? 58 : 65;
  const lapVal = r1(num('LAP', Math.max(0, wc - base) * tg, { min: 0, max: 1e6 }));
  return { valid: true, value: lapVal, abnormal: lapVal > 0, bandLabel: `LAP ${lapVal}`, band: `Lipid Accumulation Product ${lapVal} — higher values indicate greater central lipid accumulation.`, detail: `(waist ${r1(wc)} - ${base}) x TG ${r2(tg)} = ${lapVal}.`, note: LAP_NOTE };
}

// --- Visceral Adiposity Index ------------------------------------------------
// Amato MC, et al, Diabetes Care 2010;33(4):920-922 (TG and HDL in mmol/L, WC in
// cm, BMI): Men VAI = [WC / (39.68 + 1.88*BMI)] * (TG/1.03) * (1.31/HDL); Women
// VAI = [WC / (36.58 + 1.89*BMI)] * (TG/0.81) * (1.52/HDL). ~ 1 in healthy
// non-obese adults.
const VAI_NOTE = 'Visceral Adiposity Index (Amato MC, et al, Diabetes Care 2010;33(4):920-922): Men VAI = [WC / (39.68 + 1.88*BMI)] * (TG/1.03) * (1.31/HDL); Women VAI = [WC / (36.58 + 1.89*BMI)] * (TG/0.81) * (1.52/HDL), with TG and HDL in mmol/L. A sex-specific surrogate for visceral-fat dysfunction; ~ 1 in healthy non-obese adults. An index, not a diagnostic test.';
export function vai(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const wc = pos(o.waist, 300);
  const bmi = pos(o.bmi, 200);
  const tg = pos(o.triglycerides, 100);
  const hdl = pos(o.hdl, 50);
  if (wc === null || bmi === null || tg === null || hdl === null) {
    return { valid: false, message: 'Enter waist (cm), BMI, triglycerides and HDL (mmol/L), and mark female sex.' };
  }
  const female = bool(o.female);
  const value = female
    ? (wc / (36.58 + 1.89 * bmi)) * (tg / 0.81) * (1.52 / hdl)
    : (wc / (39.68 + 1.88 * bmi)) * (tg / 1.03) * (1.31 / hdl);
  const v = r2(num('VAI', value, { min: 0, max: 1e6 }));
  return { valid: true, value: v, abnormal: v > 1, bandLabel: `VAI ${v}`, band: `Visceral Adiposity Index ${v} — ~ 1 is typical in healthy non-obese adults; higher suggests visceral-fat dysfunction.`, detail: `${female ? 'female' : 'male'} formula, WC ${r1(wc)}, BMI ${r1(bmi)}, TG ${r2(tg)}, HDL ${r2(hdl)}.`, note: VAI_NOTE };
}

// --- Conicity Index ----------------------------------------------------------
// Valdez R, J Clin Epidemiol 1991;44(9):955-956: CI = waist[m] / (0.109 x
// sqrt(weight[kg] / height[m])).
const CONICITY_NOTE = 'Conicity Index (Valdez R, J Clin Epidemiol 1991;44(9):955-956): CI = waist circumference[m] / (0.109 x sqrt(weight[kg] / height[m])). Models the body as a double cone; higher values indicate more central adiposity. An index, not a diagnostic test.';
export function conicity(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const wcCm = pos(o.waist, 300);
  const weight = pos(o.weight, 700);
  const htCm = pos(o.height, 300);
  if (wcCm === null || weight === null || htCm === null) {
    return { valid: false, message: 'Enter waist circumference (cm), weight (kg), and height (cm).' };
  }
  const value = r2(num('Conicity', (wcCm / 100) / (0.109 * Math.sqrt(weight / (htCm / 100))), { min: 0, max: 100 }));
  return { valid: true, value, abnormal: value >= 1.25, bandLabel: `Conicity ${value}`, band: `Conicity Index ${value} — higher values indicate greater central adiposity.`, detail: `waist ${r1(wcCm)} cm, weight ${r1(weight)} kg, height ${r1(htCm)} cm.`, note: CONICITY_NOTE };
}

// --- AST/ALT (De Ritis) ratio ------------------------------------------------
// De Ritis F, et al, Clin Chim Acta 1957;2(1):70-74 + Williams AL, Hoofnagle JH,
// Gastroenterology 1988;95(3):734-739: AAR = AST / ALT. < 1 typical of
// NAFLD/viral/acute injury; 1-2 suggests advanced fibrosis/cirrhosis; > 2 is
// classic for alcoholic liver disease.
const AAR_NOTE = 'AST/ALT (De Ritis) ratio (De Ritis F, et al, Clin Chim Acta 1957;2(1):70-74): AAR = AST / ALT. < 1 is typical of NAFLD, viral, or acute injury; 1-2 suggests advanced fibrosis/cirrhosis; > 2 is classic for alcoholic liver disease. Interpret only when at least one enzyme is elevated. A ratio, not a diagnosis.';
export function astAltRatio(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const ast = pos(o.ast, 100000);
  const alt = pos(o.alt, 100000);
  if (ast === null || alt === null) {
    return { valid: false, message: 'Enter AST and ALT (IU/L), both greater than 0.' };
  }
  const ratio = r2(num('AAR', ast / alt, { min: 0, max: 1e6 }));
  let tier; let abnormal = true;
  if (ratio > 2) tier = '> 2: classic for alcoholic liver disease';
  else if (ratio >= 1) tier = '1-2: suggests advanced fibrosis/cirrhosis';
  else { tier = '< 1: typical of NAFLD, viral, or acute injury'; abnormal = false; }
  return { valid: true, ratio, abnormal, bandLabel: `AST/ALT ${ratio}`, band: `AST/ALT ratio ${ratio} — ${tier}.`, detail: `AST ${r1(ast)} / ALT ${r1(alt)} = ${ratio}.`, note: AAR_NOTE };
}

// --- GGT-to-platelet ratio (GPR) ---------------------------------------------
// Lemoine M, et al, Gut 2016;65(8):1369-1376 + Li Q, et al (PMC5438679): GPR =
// [(GGT / upper-limit-of-normal) / platelet count[10^9/L]] x 100. An optimal
// cutoff of 0.32 predicts significant / severe fibrosis.
const GPR_NOTE = 'GGT-to-platelet ratio (Lemoine M, et al, Gut 2016;65(8):1369-1376): GPR = [(GGT / upper-limit-of-normal) / platelet count (x10^9/L)] x 100. An optimal cutoff of 0.32 predicts significant liver fibrosis; higher cutoffs (~0.62-0.74) flag severe fibrosis / cirrhosis in some cohorts. A non-invasive marker, not a biopsy order.';
export function ggtPlatelet(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const ggt = pos(o.ggt, 100000);
  const uln = pos(o.ggtUln, 10000);
  const plt = pos(o.platelets, 5000);
  if (ggt === null || uln === null || plt === null) {
    return { valid: false, message: 'Enter GGT (IU/L), the upper limit of normal for GGT, and platelet count (x10^9/L) — all greater than 0.' };
  }
  const gpr = r2(num('GPR', ((ggt / uln) / plt) * 100, { min: 0, max: 1e6 }));
  const abnormal = gpr >= 0.32;
  return { valid: true, gpr, abnormal, bandLabel: `GPR ${gpr}`, band: `GGT-to-platelet ratio ${gpr} — ${abnormal ? 'at or above the 0.32 cutoff for significant fibrosis' : 'below the 0.32 significant-fibrosis cutoff'}.`, detail: `(GGT ${r1(ggt)} / ULN ${r1(uln)}) / platelets ${r1(plt)} x 100 = ${gpr}.`, note: GPR_NOTE };
}
