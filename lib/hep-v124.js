// spec-v124 (Wave 5 opener of the spec-v100 MDCalc Parity Completion program):
// six deterministic hepatology function-and-fibrosis instruments that a
// hepatologist reads alongside the existing meld-childpugh and fib4 tiles. None
// duplicates a live tile; each takes lab values as input -- v124 parses no report.
//
//   albiGrade       - Albumin-Bilirubin grade (objective liver function, grade 1-3)
//   meldXi          - MELD excluding INR (anticoagulated / uninterpretable-INR case)
//   fornsIndex      - Forns index for HCV fibrosis (age/GGT/platelets/cholesterol)
//   bardScore       - BARD score for NAFLD advanced fibrosis (0-4)
//   fattyLiverIndex - Fatty Liver Index (steatosis probability 0-100)
//   lokIndex        - Lok index for cirrhosis probability
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v124.js render the spec-v50 §3 clinical-
// posture note. Each tile reports the score / grade / probability and the
// source's framing; the diagnosis and management decision stay with the clinician
// (spec-v11 §5.3).
//
// COEFFICIENTS RE-FETCHED, NEVER RECALLED (spec-v97 lesson), each cross-verified
// across >= 2 independent sources. NO-FABRICATION / SOURCE-GOVERNANCE:
//   - albiGrade (Johnson 2015, J Clin Oncol): ALBI = log10(bilirubin umol/L) x 0.66
//     + albumin g/L x -0.085 (the -0.085 primary-paper value, not the -0.0852 some
//     implementations carry); grade 1 <= -2.60, 2 (-2.60, -1.39], 3 > -1.39. The
//     compute takes albumin in g/dL and bilirubin in mg/dL (US entry) and converts
//     internally (g/dL x 10 -> g/L; mg/dL x 17.1 -> umol/L).
//   - meldXi (Heuman 2007, Liver Transpl): 5.11 x ln(bilirubin) + 11.76 x
//     ln(creatinine) + 9.44, both labs in mg/dL. Each lab is FLOORED at 1.0 before
//     the log -- this floor is the standard-MELD convention (so the score cannot go
//     negative), NOT an explicit clause in the bare Heuman 2007 equation; no
//     rescaling and no creatinine cap are applied (source-faithful to the equation).
//   - fornsIndex (Forns 2002, Hepatology): 7.811 - 3.131 x ln(platelets 10^9/L) +
//     0.781 x ln(GGT U/L) + 3.467 x ln(age) - 0.014 x cholesterol. SPEC CORRECTION
//     (v97 re-fetch caught it): the cholesterol term is mg/dL, NOT the mmol/L the
//     spec draft's input label said -- the -0.014 coefficient is calibrated to
//     mg/dL magnitudes (feeding mmol/L would make the term ~38x too small). The
//     tile takes cholesterol in mg/dL. Rule-out < 4.2, rule-in > 6.9.
//   - bardScore (Harrison 2008, Gut): BMI >= 28 (+1), AST/ALT ratio >= 0.8 (+2),
//     diabetes (+1); total 0-4. 2-4 leaves advanced fibrosis in play (OR ~17); 0-1
//     rules it out (NPV ~96%).
//   - fattyLiverIndex (Bedogni 2006, BMC Gastroenterol): y = 0.953 x ln(TG mg/dL) +
//     0.139 x BMI + 0.718 x ln(GGT U/L) + 0.053 x waist cm - 15.745; FLI =
//     100/(1+e^-y). < 30 rules steatosis out, >= 60 rules it in.
//   - lokIndex (Lok 2005, Hepatology; HALT-C): x = -5.56 - 0.0089 x platelets
//     (10^9/L) + 1.26 x (AST/ALT) + 5.27 x INR; probability = 1/(1+e^-x). < 0.2
//     rules cirrhosis out, > 0.5 rules it in.

import { r2 } from './num.js';

const pos = (v) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};
const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';
// Overflow-safe logistic: never returns Infinity for extreme inputs.
const sigmoid = (x) => {
  if (!Number.isFinite(x)) return x > 0 ? 1 : 0;
  if (x >= 0) { const z = Math.exp(-x); return 1 / (1 + z); }
  const z = Math.exp(x); return z / (1 + z);
};
const INCOMPLETE = 'Enter all required positive lab values.';

// --- 2.1 albi-grade -----------------------------------------------------------
const ALBI_NOTE = 'Albumin-Bilirubin (ALBI) grade (Johnson PJ, Berhane S, Kagebayashi C, et al, J Clin Oncol 2015): an objective liver-function grade using only serum albumin and total bilirubin -- no subjective ascites or encephalopathy terms -- now standard in hepatocellular-carcinoma staging beside Child-Pugh. ALBI = log10(bilirubin in micromol/L) x 0.66 + albumin in g/L x -0.085. Grade 1 (score at or below -2.60) is the best liver function, grade 2 (above -2.60 to -1.39) intermediate, and grade 3 (above -1.39) the worst. It grades liver function; the staging and treatment decision stay with the clinician.';

export function albiGrade(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const albuminDl = pos(o.albumin);   // g/dL
  const biliMg = pos(o.bilirubin);    // mg/dL
  if (albuminDl === null || biliMg === null) return { valid: false, message: INCOMPLETE };
  const albuminGL = albuminDl * 10;
  const biliUmol = biliMg * 17.1;
  const score = Math.log10(biliUmol) * 0.66 + albuminGL * -0.085;
  let grade; let detail;
  if (score <= -2.60) { grade = 1; detail = 'the best preserved liver function'; }
  else if (score <= -1.39) { grade = 2; detail = 'intermediate liver function'; }
  else { grade = 3; detail = 'the poorest liver function'; }
  return {
    valid: true, score: r2(score), grade,
    abnormal: grade >= 2,
    band: `ALBI score ${r2(score)} -> grade ${grade}: ${detail}.`,
    note: ALBI_NOTE,
  };
}

// --- 2.2 meld-xi --------------------------------------------------------------
const MELDXI_NOTE = 'MELD-XI -- MELD excluding INR (Heuman DM, Mihas AA, Habib A, et al, Liver Transpl 2007): the INR-independent MELD used when anticoagulation makes the INR uninterpretable (mechanical valve, LVAD). MELD-XI = 5.11 x ln(total bilirubin) + 11.76 x ln(creatinine) + 9.44, both in mg/dL, with each lab floored at 1.0 before the log (the standard-MELD convention, so the score cannot go negative). It is read beside the standard MELD; the listing and management decision stay with the clinician.';

export function meldXi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const bili = pos(o.bilirubin);
  const creat = pos(o.creatinine);
  if (bili === null || creat === null) return { valid: false, message: INCOMPLETE };
  const b = Math.max(bili, 1.0);
  const c = Math.max(creat, 1.0);
  const raw = 5.11 * Math.log(b) + 11.76 * Math.log(c) + 9.44;
  const score = Math.round(raw);
  return {
    valid: true, score,
    abnormal: score >= 17,
    band: `MELD-XI ${score} (bilirubin and creatinine floored at 1.0 mg/dL before the log).`,
    note: MELDXI_NOTE,
  };
}

// --- 2.3 forns-index ----------------------------------------------------------
const FORNS_NOTE = 'Forns index for HCV fibrosis (Forns X, Ampurdanes S, Llovet JM, et al, Hepatology 2002): a four-variable serum model identifying chronic-hepatitis-C patients without significant fibrosis. Forns = 7.811 - 3.131 x ln(platelets in 10^9/L) + 0.781 x ln(GGT in U/L) + 3.467 x ln(age) - 0.014 x total cholesterol in mg/dL. A value below 4.2 rules out significant fibrosis (negative predictive value about 96%); above 6.9 rules it in; values between are indeterminate. It frames fibrosis probability; biopsy and management stay with the clinician.';

export function fornsIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = pos(o.age);
  const ggt = pos(o.ggt);
  const plt = pos(o.platelets);
  const chol = pos(o.cholesterol); // mg/dL
  if (age === null || ggt === null || plt === null || chol === null) return { valid: false, message: INCOMPLETE };
  const score = 7.811 - 3.131 * Math.log(plt) + 0.781 * Math.log(ggt) + 3.467 * Math.log(age) - 0.014 * chol;
  let band; let high;
  if (score < 4.2) { band = 'below 4.2 -- significant fibrosis is ruled out (negative predictive value about 96%)'; high = false; }
  else if (score > 6.9) { band = 'above 6.9 -- significant fibrosis is likely'; high = true; }
  else { band = 'between 4.2 and 6.9 -- indeterminate; further assessment is needed'; high = false; }
  return {
    valid: true, score: r2(score),
    abnormal: high,
    band: `Forns index ${r2(score)}: ${band}.`,
    note: FORNS_NOTE,
  };
}

// --- 2.4 bard-score -----------------------------------------------------------
const BARD_NOTE = 'BARD score for NAFLD advanced fibrosis (Harrison SA, Oliver D, Arnold HL, et al, Gut 2008): three weighted items -- BMI 28 or higher (+1), an AST/ALT ratio of 0.8 or higher (+2), and diabetes (+1) -- for a total of 0-4. A score of 2 to 4 leaves advanced fibrosis in play (odds ratio about 17), while 0 to 1 robustly rules it out (negative predictive value about 96%). It is a rule-out tool; biopsy and management stay with the clinician.';

export function bardScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const bmi = pos(o.bmi);
  const ast = pos(o.ast);
  const alt = pos(o.alt);
  const counted = [];
  let total = 0;
  if (bmi !== null && bmi >= 28) { total += 1; counted.push('BMI >= 28 (+1)'); }
  let ratio = null;
  if (ast !== null && alt !== null) {
    ratio = ast / alt;
    if (ratio >= 0.8) { total += 2; counted.push('AST/ALT ratio >= 0.8 (+2)'); }
  }
  if (onFlag(o.diabetes)) { total += 1; counted.push('diabetes (+1)'); }
  total = total < 0 ? 0 : total > 4 ? 4 : total;
  const high = total >= 2;
  return {
    valid: true, total, ratio: ratio === null ? null : r2(ratio),
    abnormal: high,
    band: `BARD ${total}/4: ${high ? '2 to 4 -- advanced fibrosis is not ruled out (odds ratio about 17)' : '0 to 1 -- advanced fibrosis is robustly ruled out'}.`,
    counted: counted.length ? counted.join(', ') : 'no BARD points (total 0)',
    note: BARD_NOTE,
  };
}

// --- 2.5 fatty-liver-index ----------------------------------------------------
const FLI_NOTE = 'Fatty Liver Index (Bedogni G, Bellentani S, Miglioli L, et al, BMC Gastroenterol 2006): a logistic predictor of hepatic steatosis from triglycerides, BMI, GGT, and waist circumference. y = 0.953 x ln(triglycerides in mg/dL) + 0.139 x BMI + 0.718 x ln(GGT in U/L) + 0.053 x waist circumference in cm - 15.745, and FLI = 100 x e^y / (1 + e^y), range 0-100. An FLI below 30 rules steatosis out; 60 or above rules it in; 30 to 60 is indeterminate. It frames steatosis probability; imaging and management stay with the clinician.';

export function fattyLiverIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const tg = pos(o.tg);
  const bmi = pos(o.bmi);
  const ggt = pos(o.ggt);
  const waist = pos(o.waist);
  if (tg === null || bmi === null || ggt === null || waist === null) return { valid: false, message: INCOMPLETE };
  const y = 0.953 * Math.log(tg) + 0.139 * bmi + 0.718 * Math.log(ggt) + 0.053 * waist - 15.745;
  const fli = sigmoid(y) * 100;
  let band; let high;
  if (fli < 30) { band = 'below 30 -- hepatic steatosis is ruled out'; high = false; }
  else if (fli >= 60) { band = '60 or above -- hepatic steatosis is ruled in'; high = true; }
  else { band = 'between 30 and 60 -- indeterminate'; high = false; }
  return {
    valid: true, fli: r2(fli),
    abnormal: high,
    band: `Fatty Liver Index ${r2(fli)}: ${band}.`,
    note: FLI_NOTE,
  };
}

// --- 2.6 lok-index ------------------------------------------------------------
const LOK_NOTE = 'Lok index for cirrhosis (Lok AS, Ghany MG, Goodman ZD, et al, Hepatology 2005; HALT-C cohort): a logistic model predicting cirrhosis from platelets, the AST/ALT ratio, and INR. x = -5.56 - 0.0089 x platelets (in 10^9/L) + 1.26 x (AST/ALT) + 5.27 x INR, and the probability = e^x / (1 + e^x). A probability below 0.2 rules cirrhosis out; above 0.5 rules it in; between is indeterminate. It frames cirrhosis probability; biopsy and management stay with the clinician.';

export function lokIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const plt = pos(o.platelets);
  const ast = pos(o.ast);
  const alt = pos(o.alt);
  const inr = pos(o.inr);
  if (plt === null || ast === null || alt === null || inr === null) return { valid: false, message: INCOMPLETE };
  const ratio = ast / alt;
  const x = -5.56 - 0.0089 * plt + 1.26 * ratio + 5.27 * inr;
  const prob = sigmoid(x);
  let band; let high;
  if (prob < 0.2) { band = 'below 0.2 -- cirrhosis is ruled out'; high = false; }
  else if (prob > 0.5) { band = 'above 0.5 -- cirrhosis is likely'; high = true; }
  else { band = 'between 0.2 and 0.5 -- indeterminate'; high = false; }
  return {
    valid: true, probability: r2(prob),
    abnormal: high,
    band: `Lok index ${r2(prob)}: ${band}.`,
    note: LOK_NOTE,
  };
}
