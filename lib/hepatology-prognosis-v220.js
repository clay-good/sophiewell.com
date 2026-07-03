// spec-v220: hepatology prognosis & fibrosis instruments — a post-TIPS survival
// index, an ALBI-platelet varices score, D'Amico cirrhosis staging, the aMAP HCC
// risk score, the NACSELD-ACLF organ-failure count, and the FibroQ fibrosis
// index. Every id was verified absent by a direct scan of app.js first (spec-v85
// §6.2). None duplicates a live tile; v220 runs no AI and makes no runtime
// network call. These stage / stratify — they are NOT a TIPS, endoscopy,
// transplant, or treatment order (spec-v11 §5.3).
//
//   fips        - Freiburg Index of Post-TIPS Survival (FIPS)
//   albiPlt     - ALBI-PLT score (varices risk)
//   damicoStage - D'Amico clinical stages of cirrhosis
//   amap        - aMAP HCC risk score
//   nacseldAclf - NACSELD acute-on-chronic liver failure organ-failure count
//   fibroq      - FibroQ fibrosis index
//
// FORMULAS / COEFFICIENTS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified
// across >= 2 independent open sources at implementation (see per-function
// headers).

import { num, r1, r2 } from './num.js';

function bool(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'on'; }
function pos(v, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0 || n > hi) return null;
  return n;
}

// --- FIPS --------------------------------------------------------------------
// Bettinger D, et al, J Hepatol 2021;74(6):1362-1372 + Ripoll C, et al
// (PMC9117561): FIPS = 1.43 x log10(bilirubin) - 1.71 x (1/creatinine) + 0.02 x
// age - 0.02 x albumin + 0.8074, with bilirubin and creatinine in mg/dL, age in
// years, albumin in g/dL. FIPS >= 0.92 = high risk after TIPS.
const FIPS_NOTE = 'Freiburg Index of Post-TIPS Survival (Bettinger D, et al, J Hepatol 2021;74(6):1362-1372): FIPS = 1.43 x log10(bilirubin) - 1.71 x (1/creatinine) + 0.02 x age - 0.02 x albumin + 0.8074, with bilirubin and creatinine in mg/dL, albumin in g/dL. FIPS >= 0.92 flags high mortality risk after a transjugular intrahepatic portosystemic shunt. A prognostic index, not a TIPS order.';
export function fips(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const bili = pos(o.bilirubin, 100);
  const cr = pos(o.creatinine, 50);
  const age = pos(o.age, 130);
  const alb = pos(o.albumin, 10);
  if (bili === null || cr === null || age === null || alb === null) {
    return { valid: false, message: 'Enter total bilirubin (mg/dL), creatinine (mg/dL), age (years), and albumin (g/dL) — all greater than 0.' };
  }
  const value = r2(num('FIPS', 1.43 * Math.log10(bili) - 1.71 * (1 / cr) + 0.02 * age - 0.02 * alb + 0.8074, { min: -50, max: 50 }));
  const abnormal = value >= 0.92;
  return { valid: true, value, abnormal, bandLabel: `FIPS ${value}`, band: `FIPS ${value} — ${abnormal ? 'high risk (>= 0.92): higher post-TIPS mortality' : 'low risk (< 0.92)'}.`, detail: `bilirubin ${r1(bili)}, creatinine ${r1(cr)}, age ${Math.round(age)}, albumin ${r1(alb)}.`, note: FIPS_NOTE };
}

// --- ALBI-PLT ----------------------------------------------------------------
// Chen RC, et al, Gastrointest Endosc 2018;88(2):230-239: ALBI = log10(bilirubin
// [micromol/L]) x 0.66 + albumin[g/L] x -0.085; ALBI grade points (grade 1
// <= -2.60 = 1, grade 2 = 2, grade 3 > -1.39 = 3) + platelet points (> 150 = 1,
// <= 150 = 2). Total 2-5; a score of 2 marks very low high-risk-varices risk.
const ALBIPLT_NOTE = 'ALBI-PLT score (Chen RC, et al, Gastrointest Endosc 2018;88(2):230-239): ALBI = log10(bilirubin[micromol/L]) x 0.66 + albumin[g/L] x -0.085; ALBI grade points (grade 1 <= -2.60 = 1, grade 2 = 2, grade 3 > -1.39 = 3) + platelet points (> 150 = 1, <= 150 = 2), total 2-5. A score of 2 marks a very low risk of high-risk esophageal varices (endoscopic screening may be deferred); > 2 is elevated. A risk score, not an endoscopy order.';
export function albiPlt(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const bili = pos(o.bilirubin, 100000); // micromol/L
  const alb = pos(o.albumin, 100); // g/L
  const plt = pos(o.platelets, 5000);
  if (bili === null || alb === null || plt === null) {
    return { valid: false, message: 'Enter bilirubin (micromol/L), albumin (g/L), and platelet count (x10^9/L) — all greater than 0.' };
  }
  const albi = Math.log10(bili) * 0.66 + alb * -0.085;
  const gradePts = albi > -1.39 ? 3 : albi <= -2.60 ? 1 : 2;
  const pltPts = plt > 150 ? 1 : 2;
  const score = Math.round(num('ALBI-PLT', gradePts + pltPts, { min: 2, max: 5 }));
  const abnormal = score > 2;
  return { valid: true, score, albi: r2(albi), abnormal, bandLabel: `ALBI-PLT ${score}`, band: `ALBI-PLT score ${score} — ${abnormal ? 'elevated high-risk-varices risk (> 2)' : 'very low high-risk-varices risk (2): screening may be deferred'}.`, detail: `ALBI ${r2(albi)} (grade points ${gradePts}) + platelet points ${pltPts} = ${score}.`, note: ALBIPLT_NOTE };
}

// --- D'Amico cirrhosis staging -----------------------------------------------
// D'Amico G, Garcia-Tsao G, Pagliaro L, J Hepatol 2006;44(1):217-231 + D'Amico
// G, et al, Aliment Pharmacol Ther 2014: Stage 1 no varices/no ascites (~1%
// 1-year mortality); Stage 2 varices without ascites/bleeding (~3.4%); Stage 3
// ascites (~20%); Stage 4 variceal bleeding (~57%).
const DAMICO_NOTE = "D'Amico clinical stages of cirrhosis (D'Amico G, Garcia-Tsao G, Pagliaro L, J Hepatol 2006;44(1):217-231): Stage 1 = no varices, no ascites (~1% 1-year mortality); Stage 2 = varices without ascites or bleeding (~3.4%); Stage 3 = ascites, compensated or not (~20%); Stage 4 = variceal bleeding (~57%). Stages 1-2 are compensated, 3-4 decompensated. A natural-history staging, not a treatment order.";
export function damicoStage(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const bleeding = bool(o.bleeding);
  const ascites = bool(o.ascites);
  const varices = bool(o.varices);
  let stage; let mortality; let abnormal = true;
  if (bleeding) { stage = 4; mortality = '~57%'; }
  else if (ascites) { stage = 3; mortality = '~20%'; }
  else if (varices) { stage = 2; mortality = '~3.4%'; }
  else { stage = 1; mortality = '~1%'; abnormal = false; }
  const comp = stage <= 2 ? 'compensated' : 'decompensated';
  return { valid: true, stage, abnormal, bandLabel: `D'Amico stage ${stage}`, band: `D'Amico stage ${stage} (${comp}) — 1-year mortality ${mortality}.`, detail: `varices ${varices ? 'yes' : 'no'}, ascites ${ascites ? 'yes' : 'no'}, bleeding ${bleeding ? 'yes' : 'no'}.`, note: DAMICO_NOTE };
}

// --- aMAP score --------------------------------------------------------------
// Fan R, et al, J Hepatol 2020;73(6):1368-1378 + Fahed R, et al, Br J Cancer
// 2022: aMAP = ({0.06 x age + 0.89 x sex + 0.48 x [log10(bilirubin[micromol/L]) x
// 0.66 + albumin[g/L] x -0.085] - 0.01 x platelets} + 7.4) / 14.77 x 100, with
// male sex = 1, female = 0. < 50 low, 50-60 medium, > 60 high HCC risk.
const AMAP_NOTE = 'aMAP score (Fan R, et al, J Hepatol 2020;73(6):1368-1378): aMAP = ({0.06 x age + 0.89 x sex + 0.48 x ALBI - 0.01 x platelets} + 7.4) / 14.77 x 100, where ALBI = log10(bilirubin[micromol/L]) x 0.66 + albumin[g/L] x -0.085 and sex is male 1 / female 0. < 50 low, 50-60 medium, > 60 high risk of hepatocellular carcinoma. A risk score, not a surveillance order.';
export function amap(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = pos(o.age, 130);
  const bili = pos(o.bilirubin, 100000);
  const alb = pos(o.albumin, 100);
  const plt = pos(o.platelets, 5000);
  if (age === null || bili === null || alb === null || plt === null) {
    return { valid: false, message: 'Enter age (years), bilirubin (micromol/L), albumin (g/L), and platelet count (x10^9/L), and mark male sex.' };
  }
  const sex = bool(o.male) ? 1 : 0;
  const albi = Math.log10(bili) * 0.66 + alb * -0.085;
  const value = r1(num('aMAP', ((0.06 * age + 0.89 * sex + 0.48 * albi - 0.01 * plt) + 7.4) / 14.77 * 100, { min: 0, max: 100 }));
  let tier; let abnormal = true;
  if (value > 60) tier = 'high HCC risk (> 60)';
  else if (value >= 50) tier = 'medium HCC risk (50-60)';
  else { tier = 'low HCC risk (< 50)'; abnormal = false; }
  return { valid: true, value, abnormal, bandLabel: `aMAP ${value}`, band: `aMAP score ${value} — ${tier}.`, detail: `age ${Math.round(age)}, sex ${sex}, ALBI ${r2(albi)}, platelets ${r1(plt)}.`, note: AMAP_NOTE };
}

// --- NACSELD-ACLF ------------------------------------------------------------
// O'Leary JG, et al, Hepatology 2018;67(6):2367-2374 + Bajaj JS, et al,
// Hepatology 2014;60(1):250-256: count of extrahepatic organ failures (0-4) -
// circulatory shock, grade III/IV hepatic encephalopathy, renal replacement
// therapy, mechanical ventilation. >= 2 = ACLF (30-day survival ~59% vs ~93% at
// 0 and ~19% at 4).
const NACSELD_NOTE = "NACSELD acute-on-chronic liver failure (O'Leary JG, et al, Hepatology 2018;67(6):2367-2374): count of extrahepatic organ failures - circulatory (shock/vasopressors), brain (grade III/IV hepatic encephalopathy), renal (dialysis), and respiratory (mechanical ventilation) (0-4). >= 2 defines ACLF: 30-day survival falls from ~93% at 0 failures to ~59% at >= 2 and ~19% at 4. A prognostic count, not a treatment order.";
export function nacseldAclf(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let n = 0; const p = [];
  if (bool(o.circulatory)) { n += 1; p.push('circulatory (shock)'); }
  if (bool(o.brain)) { n += 1; p.push('brain (grade III/IV HE)'); }
  if (bool(o.renal)) { n += 1; p.push('renal (dialysis)'); }
  if (bool(o.respiratory)) { n += 1; p.push('respiratory (ventilation)'); }
  const count = Math.round(num('NACSELD', n, { min: 0, max: 4 }));
  const aclf = count >= 2;
  const survival = count === 0 ? '~93%' : count >= 4 ? '~19%' : aclf ? '~59%' : 'reduced';
  return { valid: true, count, aclf, abnormal: aclf, bandLabel: `${count} organ failure(s)`, band: `NACSELD-ACLF: ${count} organ failure(s) — ${aclf ? `ACLF (>= 2), 30-day survival ${survival}` : `not ACLF, 30-day survival ${survival}`}.`, detail: p.length ? `Failures: ${p.join('; ')}.` : 'No organ failures.', note: NACSELD_NOTE };
}

// --- FibroQ ------------------------------------------------------------------
// Hsieh YY, et al, Chang Gung Med J 2009;32(6):614-622 + World J Gastroenterol
// 2012 (PMC3286137): FibroQ = 10 x (age x AST x INR) / (ALT x platelets). FibroQ
// > 1.6 predicts significant fibrosis (>= F2).
const FIBROQ_NOTE = 'FibroQ (Hsieh YY, et al, Chang Gung Med J 2009;32(6):614-622): FibroQ = 10 x (age x AST x INR) / (ALT x platelets [x10^9/L]). A value > 1.6 predicts significant liver fibrosis (>= F2) in chronic viral hepatitis. A non-invasive marker, not a biopsy order.';
export function fibroq(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = pos(o.age, 130);
  const ast = pos(o.ast, 100000);
  const inr = pos(o.inr, 20);
  const alt = pos(o.alt, 100000);
  const plt = pos(o.platelets, 5000);
  if (age === null || ast === null || inr === null || alt === null || plt === null) {
    return { valid: false, message: 'Enter age (years), AST, INR, ALT, and platelet count (x10^9/L) — all greater than 0.' };
  }
  const value = r2(num('FibroQ', (10 * (age * ast * inr)) / (alt * plt), { min: 0, max: 1e6 }));
  const abnormal = value > 1.6;
  return { valid: true, value, abnormal, bandLabel: `FibroQ ${value}`, band: `FibroQ ${value} — ${abnormal ? 'significant fibrosis likely (> 1.6)' : 'significant fibrosis unlikely (<= 1.6)'}.`, detail: `10 x (${Math.round(age)} x ${r1(ast)} x ${r2(inr)}) / (${r1(alt)} x ${r1(plt)}) = ${value}.`, note: FIBROQ_NOTE };
}
