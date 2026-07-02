// spec-v196: five deterministic chronic-liver-disease prognostic instruments
// (Advanced Specialist Quantitation program, spec-v193 §1.1). Every id was
// verified absent by a direct scan of app.js first (spec-v85 §6.2). None
// duplicates a live tile; v196 runs no AI and makes no runtime network call.
// These prognosticate — they are not treatment, listing, or allocation orders
// (spec-v11 §5.3).
//
//   abicScore    - ABIC score (alcoholic hepatitis)
//   globeScore   - GLOBE score (PBC transplant-free survival on UDCA)
//   ukPbcRisk    - UK-PBC risk score (5/10/15-year end-stage liver disease)
//   pageB        - PAGE-B score (HCC risk in treated chronic hepatitis B)
//   mayoPscRisk  - revised Mayo PSC natural-history model
//
// COEFFICIENTS / WEIGHTS / BANDS RE-FETCHED, NEVER RECALLED (spec-v97), each
// cross-verified across >= 2 independent open sources at implementation:
//   - abic = 0.1*age + 0.08*bilirubin + 0.3*creatinine + 0.8*INR (Dominguez M,
//     et al, Am J Gastroenterol 2008;103(11):2747-2756); <6.71 low (~100% 90-day
//     survival), 6.71-<9.0 intermediate (~70%), >=9.0 high (~25%).
//   - globe = 0.044378*age + 0.93982*ln(bili_xULN) + 0.335648*ln(ALP_xULN)
//     - 2.266708*albumin_xLLN - 0.002581*platelets_e9L + 1.216865 (Lammers WJ,
//     et al, Gastroenterology 2015;149(7):1804-1812.e4); >0.30 marks a
//     non-responder / worse transplant-free survival.
//   - ukPbc linear predictor + baseline survivor functions S0 (5y 0.982, 10y
//     0.941, 15y 0.893); risk(t)=1-S0(t)^exp(LP) (Carbone M, et al, Hepatology
//     2016;63(3):930-950).
//   - pageB age/sex/platelet point table (Papatheodoridis G, et al, J Hepatol
//     2016;64(4):800-806); <=9 low (5-yr HCC ~0%), 10-17 intermediate (~3%),
//     >=18 high (~17%).
//   - mayoPsc R = 0.03*age + 0.54*ln(bilirubin) + 0.54*ln(AST) + 1.24*variceal
//     - 0.84*albumin (Kim WR, et al, Mayo Clin Proc 2000;75(7):688-694).

import { num, r1, r2 } from './num.js';

function pos(v, max = Infinity) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0 || n > max) return null;
  return n;
}
function truthy(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'on' || v === 'yes'; }
function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }

// --- 2.1 ABIC ---------------------------------------------------------------
const ABIC_NOTE = 'ABIC score for alcoholic hepatitis (Dominguez M, et al, Am J Gastroenterol 2008;103(11):2747-2756). ABIC = (age × 0.1) + (bilirubin × 0.08) + (creatinine × 0.3) + (INR × 0.8). 90-day survival band: < 6.71 low risk (~100%), 6.71–< 9.0 intermediate (~70%), ≥ 9.0 high (~25%). A prognostic estimate, not a treatment order.';

export function abicScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = pos(o.age, 130);
  const bili = pos(o.bilirubin, 100);
  const creat = pos(o.creatinine, 40);
  const inr = pos(o.inr, 20);
  const missing = [];
  if (age === null) missing.push('age (years)');
  if (bili === null) missing.push('bilirubin (mg/dL)');
  if (creat === null) missing.push('creatinine (mg/dL)');
  if (inr === null) missing.push('INR');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const value = r2(num('ABIC', age * 0.1 + bili * 0.08 + creat * 0.3 + inr * 0.8, { min: 0, max: 10000 }));
  let label; let surv;
  if (value < 6.71) { label = 'low'; surv = '~100%'; }
  else if (value < 9.0) { label = 'intermediate'; surv = '~70%'; }
  else { label = 'high'; surv = '~25%'; }
  return {
    valid: true,
    value,
    abnormal: value >= 6.71,
    bandLabel: `ABIC ${value} — ${label}`,
    band: `ABIC ${value} — ${label} risk (90-day survival ${surv}).`,
    detail: `0.1 × age ${r1(age)} + 0.08 × bili ${r2(bili)} + 0.3 × creat ${r2(creat)} + 0.8 × INR ${r2(inr)}.`,
    note: ABIC_NOTE,
  };
}

// --- 2.2 GLOBE --------------------------------------------------------------
const GLOBE_NOTE = 'GLOBE score for PBC transplant-free survival on ursodeoxycholic acid (Lammers WJ, et al, Gastroenterology 2015;149(7):1804-1812.e4). Uses age (baseline) and — at 1 year of UDCA — bilirubin (× ULN), alkaline phosphatase (× ULN), albumin (× LLN), and platelet count (× 10⁹/L). A score > 0.30 marks a non-responder with worse transplant-free survival than a matched general population. A prognostic estimate, not a treatment order.';

export function globeScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = pos(o.age, 130);
  const bili = pos(o.bili, 100); // × ULN
  const alp = pos(o.alp, 100); // × ULN
  const alb = pos(o.albumin, 5); // × LLN
  const plt = pos(o.platelets, 2000); // × 10^9/L
  const missing = [];
  if (age === null) missing.push('age (years)');
  if (bili === null) missing.push('bilirubin (× ULN)');
  if (alp === null) missing.push('alkaline phosphatase (× ULN)');
  if (alb === null) missing.push('albumin (× LLN)');
  if (plt === null) missing.push('platelet count (× 10⁹/L)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const value = r2(num('GLOBE',
    0.044378 * age + 0.93982 * Math.log(bili) + 0.335648 * Math.log(alp)
    - 2.266708 * alb - 0.002581 * plt + 1.216865, { min: -1000, max: 1000 }));
  const abnormal = value > 0.30;
  return {
    valid: true,
    value,
    abnormal,
    bandLabel: `GLOBE ${value}`,
    band: abnormal
      ? `GLOBE ${value} — above 0.30: non-responder profile, worse transplant-free survival.`
      : `GLOBE ${value} — at or below 0.30: responder profile.`,
    detail: `0.044378 × age + 0.93982 × ln(bili) + 0.335648 × ln(ALP) − 2.266708 × albumin − 0.002581 × platelets + 1.216865. Higher = worse.`,
    note: GLOBE_NOTE,
  };
}

// --- 2.3 UK-PBC risk --------------------------------------------------------
const UKPBC_NOTE = 'UK-PBC risk score (Carbone M, et al, Hepatology 2016;63(3):930-950). From alkaline phosphatase, transaminase (ALT or AST), and bilirubin (each × ULN at 12 months of UDCA) plus baseline albumin and platelets (each × LLN), it predicts the 5-, 10-, and 15-year risk of end-stage liver disease (transplant or liver-related death) via 1 − S₀^exp(LP). A prognostic estimate, not a listing order.';
const UKPBC_S0 = { 5: 0.982, 10: 0.941, 15: 0.893 };

export function ukPbcRisk(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const alp = pos(o.alp, 100); // × ULN
  const trans = pos(o.transaminase, 100); // × ULN (ALT or AST)
  const bili = pos(o.bili, 100); // × ULN
  const alb = pos(o.albumin, 5); // × LLN
  const plt = pos(o.platelets, 20); // × LLN
  const missing = [];
  if (alp === null) missing.push('alkaline phosphatase (× ULN)');
  if (trans === null) missing.push('transaminase ALT/AST (× ULN)');
  if (bili === null) missing.push('bilirubin (× ULN)');
  if (alb === null) missing.push('albumin (× LLN)');
  if (plt === null) missing.push('platelets (× LLN)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const lp = 0.0287854 * (alp - 1.722136304)
    - 0.0422873 * (Math.pow(trans / 10, -1) - 8.675729006)
    + 1.4199 * (Math.log(bili / 10) + 2.709607778)
    - 1.960303 * (alb - 1.17673001)
    - 0.4161954 * (plt - 1.873564875);
  const expLp = Math.exp(lp);
  const risk = (yr) => r1(num(`risk${yr}`, clamp01(1 - Math.pow(UKPBC_S0[yr], expLp)) * 100, { min: 0, max: 100 }));
  const r5 = risk(5); const r10 = risk(10); const r15 = risk(15);
  return {
    valid: true,
    r5, r10, r15,
    abnormal: r15 >= 10,
    bandLabel: `UK-PBC 15-yr ${r15}%`,
    band: `UK-PBC risk of end-stage liver disease — ${r5}% at 5 yr, ${r10}% at 10 yr, ${r15}% at 15 yr.`,
    detail: `Complements the GLOBE score by adding transaminases and reporting fixed-horizon survival. Endpoint: transplant or liver-related death.`,
    note: UKPBC_NOTE,
  };
}

// --- 2.4 PAGE-B -------------------------------------------------------------
const PAGEB_NOTE = 'PAGE-B score for HCC risk in Caucasians with chronic hepatitis B on antiviral therapy (Papatheodoridis G, et al, J Hepatol 2016;64(4):800-806). Age, sex, and platelet count map to categorical points; total ≤ 9 low, 10–17 intermediate, ≥ 18 high, tracking the 5-year risk of hepatocellular carcinoma. An incidence-risk score, distinct from the BCLC stage; a prognostic estimate, not a surveillance order.';

function pageBAge(a) { if (a < 30) return 0; if (a < 40) return 2; if (a < 50) return 4; if (a < 60) return 6; if (a < 70) return 8; return 10; }
function pageBPlt(p) { if (p >= 200) return 0; if (p >= 100) return 6; return 9; }

export function pageB(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = pos(o.age, 130);
  const plt = pos(o.platelets, 2000); // × 10^9/L
  const sex = o.sex === 'female' || o.sex === 'male' ? o.sex : '';
  const missing = [];
  if (age === null) missing.push('age (years)');
  if (plt === null) missing.push('platelet count (× 10⁹/L)');
  if (!sex) missing.push('sex');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const parts = [
    ['age', pageBAge(age)],
    ['male sex', sex === 'male' ? 6 : 0],
    ['platelets', pageBPlt(plt)],
  ];
  const score = parts.reduce((s, p) => s + p[1], 0);
  let label; let rate;
  if (score <= 9) { label = 'low'; rate = '~0%'; }
  else if (score <= 17) { label = 'intermediate'; rate = '~3%'; }
  else { label = 'high'; rate = '~17%'; }
  return {
    valid: true,
    score,
    abnormal: score >= 10,
    bandLabel: `PAGE-B ${score} — ${label}`,
    band: `PAGE-B ${score} — ${label} risk (5-year HCC incidence ${rate}).`,
    detail: `Age +${pageBAge(age)}, ${sex === 'male' ? 'male +6' : 'female +0'}, platelets +${pageBPlt(plt)}. An HCC-incidence risk score, not a stage.`,
    note: PAGEB_NOTE,
  };
}

// --- 2.5 Mayo PSC -----------------------------------------------------------
const MAYOPSC_NOTE = 'Revised Mayo PSC natural-history model (Kim WR, et al, Mayo Clin Proc 2000;75(7):688-694). R = 0.03 × age + 0.54 × ln(bilirubin) + 0.54 × ln(AST) + 1.24 × (variceal bleeding) − 0.84 × albumin. A higher R marks worse survival in primary sclerosing cholangitis. A prognostic estimate, not a listing order.';

export function mayoPscRisk(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = pos(o.age, 130);
  const bili = pos(o.bilirubin, 100); // mg/dL
  const alb = pos(o.albumin, 10); // g/dL
  const ast = pos(o.ast, 20000); // U/L
  const missing = [];
  if (age === null) missing.push('age (years)');
  if (bili === null) missing.push('bilirubin (mg/dL)');
  if (alb === null) missing.push('albumin (g/dL)');
  if (ast === null) missing.push('AST (U/L)');
  if (missing.length) return { valid: false, message: `Enter the ${missing.join(', ')}.` };
  const bleed = truthy(o.variceal);
  const value = r2(num('MayoPSC',
    0.03 * age + 0.54 * Math.log(bili) + 0.54 * Math.log(ast) + 1.24 * (bleed ? 1 : 0) - 0.84 * alb,
    { min: -1000, max: 1000 }));
  let label;
  if (value < 0) label = 'low';
  else if (value < 2) label = 'intermediate';
  else label = 'high';
  return {
    valid: true,
    value,
    abnormal: value >= 2,
    bandLabel: `Mayo PSC ${value} — ${label}`,
    band: `Mayo PSC risk score ${value} — ${label} risk band.`,
    detail: `0.03 × age + 0.54 × ln(bili ${r2(bili)}) + 0.54 × ln(AST ${r1(ast)}) + 1.24 × ${bleed ? 1 : 0} (variceal bleed) − 0.84 × albumin ${r2(alb)}. Higher = worse.`,
    note: MAYOPSC_NOTE,
  };
}
