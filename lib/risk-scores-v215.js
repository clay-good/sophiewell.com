// spec-v215: lipid, device, and oncology risk scores — familial-hypercholesterolemia
// classifiers, a cardiac-device infection score, two immune-prognostic indices,
// and two cancer-associated-VTE scores. Every id was verified absent by a direct
// scan of app.js first (spec-v85 §6.2). None duplicates a live tile; v215 runs no
// AI and makes no runtime network call. These classify / stratify — they are NOT a
// statin, device, chemotherapy, or thromboprophylaxis order (spec-v11 §5.3).
//
//   dlcnFh        - Dutch Lipid Clinic Network score (familial hypercholesterolemia)
//   simonBroomeFh - Simon Broome criteria (familial hypercholesterolemia)
//   padit         - PADIT score (CIED infection risk)
//   grimScore     - GRIm-Score (Gustave Roussy immune score)
//   lipi          - Lung Immune Prognostic Index
//   onkotev       - ONKOTEV score (cancer-associated VTE)
//   protecht      - PROTECHT score (cancer-associated VTE)
//
// POINT SYSTEMS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see per-function headers).

import { num, r2 } from './num.js';

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
  if (!Number.isFinite(n) || n < 0 || n > hi) return null;
  return n;
}

// --- Dutch Lipid Clinic Network score ----------------------------------------
// Nordestgaard BG, et al, Eur Heart J 2013;34(45):3478-3490 (reproduces the DLCN
// table) + independent validation: sum the single highest applicable item per
// category — family history (0/1/2), clinical history (0/1/2), physical exam
// (tendon xanthoma 6 / corneal arcus < 45 y 4), LDL-C band (>=8.5=8, 6.5-8.4=5,
// 5.0-6.4=3, 4.0-4.9=1 mmol/L), causative DNA mutation 8. Bands: > 8 definite,
// 6-8 probable, 3-5 possible, 0-2 unlikely FH.
const DLCN_NOTE = 'Dutch Lipid Clinic Network score (Nordestgaard BG, et al, Eur Heart J 2013;34(45):3478-3490): sums the single highest item per category — family history (0/1/2), personal clinical history (0/1/2), physical exam (tendon xanthoma 6, corneal arcus before 45 y 4), untreated LDL-C band (>=8.5=8, 6.5-8.4=5, 5.0-6.4=3, 4.0-4.9=1 mmol/L), and causative DNA mutation (8). > 8 definite, 6-8 probable, 3-5 possible, 0-2 unlikely familial hypercholesterolemia. A classification, not a statin order.';
export function dlcnFh(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const ldl = pos(o.ldl, 50);
  if (ldl === null) {
    return { valid: false, message: 'Enter untreated LDL-C (mmol/L) and select the family-history, clinical-history, and physical-exam categories.' };
  }
  const fam = sel(o.familyHistory, 2);
  const clin = sel(o.clinicalHistory, 2);
  const exam = sel(o.physicalExam, 6);
  const ldlPts = ldl >= 8.5 ? 8 : ldl >= 6.5 ? 5 : ldl >= 5.0 ? 3 : ldl >= 4.0 ? 1 : 0;
  const dna = bool(o.dnaMutation) ? 8 : 0;
  const score = Math.round(num('DLCN', fam + clin + exam + ldlPts + dna, { min: 0, max: 30 }));
  let tier; let abnormal = true;
  if (score > 8) tier = 'definite familial hypercholesterolemia (> 8)';
  else if (score >= 6) tier = 'probable familial hypercholesterolemia (6-8)';
  else if (score >= 3) tier = 'possible familial hypercholesterolemia (3-5)';
  else { tier = 'familial hypercholesterolemia unlikely (0-2)'; abnormal = false; }
  return {
    valid: true, score, abnormal,
    bandLabel: `DLCN ${score}`,
    band: `Dutch Lipid Clinic Network score ${score} — ${tier}.`,
    detail: `family ${fam} + clinical ${clin} + exam ${exam} + LDL ${ldlPts} + DNA ${dna} = ${score}.`,
    note: DLCN_NOTE,
  };
}

// --- Simon Broome criteria ---------------------------------------------------
// Scientific Steering Committee, Simon Broome Register Group, BMJ
// 1991;303(6807):893-896 + independent guideline adoption: a cholesterol
// criterion (adult TC > 7.5 or LDL > 4.9; child < 16 y TC > 6.7 or LDL > 4.0
// mmol/L) plus either tendon xanthoma / DNA mutation (definite) or a family
// history of premature MI / raised cholesterol (possible).
const SB_NOTE = 'Simon Broome criteria (Scientific Steering Committee, Simon Broome Register Group, BMJ 1991;303(6807):893-896): a cholesterol criterion (adult TC > 7.5 or LDL-C > 4.9; child < 16 y TC > 6.7 or LDL-C > 4.0 mmol/L) plus tendon xanthoma or a causative DNA mutation = definite FH; plus a family history of premature MI or raised cholesterol = possible FH. A classification, not a statin order.';
export function simonBroomeFh(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const tc = pos(o.totalChol, 50);
  const ldl = pos(o.ldl, 50);
  if (tc === null && ldl === null) {
    return { valid: false, message: 'Enter total cholesterol and/or LDL-C (mmol/L) and mark whether the patient is a child (< 16 y) and the clinical / family features.' };
  }
  const child = bool(o.child);
  const cholMet = child
    ? (tc !== null && tc > 6.7) || (ldl !== null && ldl > 4.0)
    : (tc !== null && tc > 7.5) || (ldl !== null && ldl > 4.9);
  const definite = cholMet && (bool(o.tendonXanthoma) || bool(o.dnaMutation));
  const possible = cholMet && (bool(o.famMi) || bool(o.famChol));
  let tier; let abnormal = true;
  if (definite) tier = 'definite familial hypercholesterolemia';
  else if (possible) tier = 'possible familial hypercholesterolemia';
  else if (cholMet) tier = 'cholesterol criterion met, but no clinical / family criterion — FH not classified';
  else { tier = 'cholesterol criterion not met — FH not classified'; abnormal = false; }
  return {
    valid: true, definite, possible, cholMet, abnormal,
    bandLabel: definite ? 'Definite FH' : possible ? 'Possible FH' : 'FH not classified',
    band: `Simon Broome: ${tier}.`,
    detail: `cholesterol criterion ${cholMet ? 'met' : 'not met'} (${child ? 'child' : 'adult'} thresholds).`,
    note: SB_NOTE,
  };
}

// --- PADIT score -------------------------------------------------------------
// Birnie DH, et al, J Am Coll Cardiol 2019;74(23):2845-2854 + Krahn AD, et al,
// Europace 2021;23(9):1446-1455: Prior procedures (1 = 1, >= 2 = 4); Age (>= 70
// = 0, 60-69 = 1, < 60 = 2); Depressed renal function eGFR < 30 = 1;
// Immunocompromised = 3; procedure Type (ICD 2, CRT 4, revision/upgrade 5).
// Bands: low 0-4, intermediate 5-6, high >= 7.
const PADIT_NOTE = 'PADIT score (Birnie DH, et al, J Am Coll Cardiol 2019;74(23):2845-2854): Prior procedures (1 = 1, >= 2 = 4); Age (>= 70 = 0, 60-69 = 1, < 60 = 2); Depressed renal function eGFR < 30 = 1; Immunocompromised = 3; procedure Type (ICD 2, CRT 4, revision/upgrade 5) (0-15). Low 0-4, intermediate 5-6, high >= 7 for cardiac-implantable-electronic-device infection. A risk score, not an antibiotic or device order.';
export function padit(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = pos(o.age, 130);
  if (age === null) {
    return { valid: false, message: 'Enter age (years) and select prior-procedure count and procedure type, and mark eGFR < 30 / immunocompromised.' };
  }
  const prior = sel(o.priorProcedures, 4); // 0, 1, or 4 (>= 2)
  const agePts = age >= 70 ? 0 : age >= 60 ? 1 : 2;
  const renal = bool(o.egfrLow) ? 1 : 0;
  const immuno = bool(o.immunocompromised) ? 3 : 0;
  const type = sel(o.procedureType, 5); // 0, 2 ICD, 4 CRT, 5 revision
  const score = Math.round(num('PADIT', prior + agePts + renal + immuno + type, { min: 0, max: 15 }));
  let tier; let abnormal = true;
  if (score >= 7) tier = 'high infection risk (>= 7)';
  else if (score >= 5) tier = 'intermediate infection risk (5-6)';
  else { tier = 'low infection risk (0-4)'; abnormal = false; }
  return {
    valid: true, score, abnormal,
    bandLabel: `PADIT ${score}`,
    band: `PADIT score ${score} — ${tier}.`,
    detail: `prior ${prior} + age ${agePts} + renal ${renal} + immuno ${immuno} + type ${type} = ${score}.`,
    note: PADIT_NOTE,
  };
}

// --- GRIm-Score --------------------------------------------------------------
// Bigot F, et al, Eur J Cancer 2017;84:212-218 + Minami S, et al (PMID 31068989):
// one point each for LDH > ULN, albumin < 3.5 g/dL, neutrophil-to-lymphocyte
// ratio > 6. Low 0-1, high 2-3 (worse survival on immunotherapy).
const GRIM_NOTE = 'GRIm-Score (Bigot F, et al, Eur J Cancer 2017;84:212-218): one point each for LDH > upper limit of normal, serum albumin < 3.5 g/dL, and neutrophil-to-lymphocyte ratio > 6 (0-3). Low 0-1, high 2-3 predicts worse overall survival on immune-checkpoint therapy. A prognostic score, not a treatment order.';
export function grimScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const alb = pos(o.albumin, 10);
  const nlr = pos(o.nlr, 1000);
  if (alb === null || nlr === null) {
    return { valid: false, message: 'Enter serum albumin (g/dL) and neutrophil-to-lymphocyte ratio, and mark whether LDH exceeds the upper limit of normal.' };
  }
  let s = 0; const p = [];
  if (bool(o.ldhHigh)) { s += 1; p.push('LDH > ULN'); }
  if (alb < 3.5) { s += 1; p.push('albumin < 3.5'); }
  if (nlr > 6) { s += 1; p.push('NLR > 6'); }
  const score = Math.round(num('GRIm', s, { min: 0, max: 3 }));
  const abnormal = score >= 2;
  return {
    valid: true, score, abnormal,
    bandLabel: `GRIm ${score}`,
    band: `GRIm-Score ${score} — ${abnormal ? 'high risk (2-3): worse survival on immunotherapy' : 'low risk (0-1)'}.`,
    detail: p.length ? `Positive: ${p.join('; ')}.` : 'No factors.',
    note: GRIM_NOTE,
  };
}

// --- Lung Immune Prognostic Index --------------------------------------------
// Mezquita L, et al, JAMA Oncol 2018;4(3):351-357 + Kazandjian D, et al, JAMA
// Oncol 2019: derived neutrophil-to-lymphocyte ratio dNLR = ANC / (WBC - ANC);
// one point each for dNLR > 3 and LDH > ULN. Good 0, intermediate 1, poor 2.
const LIPI_NOTE = 'Lung Immune Prognostic Index (Mezquita L, et al, JAMA Oncol 2018;4(3):351-357): derived neutrophil-to-lymphocyte ratio dNLR = ANC / (WBC - ANC); one point each for dNLR > 3 and LDH > ULN. Good 0, intermediate 1, poor 2 for survival on immune-checkpoint therapy. A prognostic index, not a treatment order.';
export function lipi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const anc = pos(o.anc, 1000);
  const wbc = pos(o.wbc, 1000);
  if (anc === null || wbc === null || wbc <= anc) {
    return { valid: false, message: 'Enter absolute neutrophil count and total WBC (same units, WBC greater than ANC), and mark whether LDH exceeds the upper limit of normal.' };
  }
  const dnlr = r2(num('dNLR', anc / (wbc - anc), { min: 0, max: 1e6 }));
  let s = 0; const p = [];
  if (dnlr > 3) { s += 1; p.push(`dNLR ${dnlr} > 3`); }
  if (bool(o.ldhHigh)) { s += 1; p.push('LDH > ULN'); }
  const score = Math.round(num('LIPI', s, { min: 0, max: 2 }));
  const tier = score === 2 ? 'poor' : score === 1 ? 'intermediate' : 'good';
  return {
    valid: true, score, dnlr, abnormal: score >= 1,
    bandLabel: `LIPI ${tier}`,
    band: `Lung Immune Prognostic Index ${score} — ${tier} prognostic group.`,
    detail: `dNLR ${dnlr}${p.length ? '; ' + p.join('; ') : ''}.`,
    note: LIPI_NOTE,
  };
}

// --- ONKOTEV score -----------------------------------------------------------
// Cella CA, et al, Oncologist 2017;22(5):601-608 + Cella CA, et al, Oncologist
// 2023 (PMID 36795409): one point each for Khorana score > 2, metastatic disease,
// macroscopic vascular / lymphatic compression, and previous VTE. Low 0,
// intermediate 1, high >= 2 (6-month VTE incidence).
const ONKOTEV_NOTE = 'ONKOTEV score (Cella CA, et al, Oncologist 2017;22(5):601-608): one point each for Khorana score > 2, metastatic disease, macroscopic vascular or lymphatic compression, and previous VTE. Low 0, intermediate 1, high >= 2 for 6-month venous-thromboembolism risk in ambulatory cancer patients. A risk score, not a thromboprophylaxis order.';
export function onkotev(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0; const p = [];
  if (bool(o.khoranaHigh)) { s += 1; p.push('Khorana > 2'); }
  if (bool(o.metastatic)) { s += 1; p.push('metastatic disease'); }
  if (bool(o.compression)) { s += 1; p.push('vascular/lymphatic compression'); }
  if (bool(o.previousVte)) { s += 1; p.push('previous VTE'); }
  const score = Math.round(num('ONKOTEV', s, { min: 0, max: 4 }));
  const tier = score >= 2 ? 'high' : score === 1 ? 'intermediate' : 'low';
  return {
    valid: true, score, abnormal: score >= 2,
    bandLabel: `ONKOTEV ${score}`,
    band: `ONKOTEV score ${score} — ${tier} 6-month VTE risk.`,
    detail: p.length ? `Positive: ${p.join('; ')}.` : 'No factors.',
    note: ONKOTEV_NOTE,
  };
}

// --- PROTECHT score ----------------------------------------------------------
// Verso M, et al, Intern Emerg Med 2012;7(4):291-292 + Moik F, et al, Cancers
// 2020 (PMC7564761): the Khorana base (cancer site very-high 2 / high 1;
// platelets >= 350 = 1; Hb < 10 or ESA = 1; WBC > 11 = 1; BMI >= 35 = 1) plus
// platinum-based chemo 1 and gemcitabine-based chemo 1. High risk >= 3.
const PROTECHT_NOTE = 'PROTECHT score (Verso M, et al, Intern Emerg Med 2012;7(4):291-292): the Khorana base (cancer site very-high 2 / high 1; platelets >= 350 = 1; Hb < 10 g/dL or ESA use = 1; WBC > 11 = 1; BMI >= 35 = 1) plus platinum-based chemotherapy 1 and gemcitabine-based chemotherapy 1 (0-8). High risk >= 3 for cancer-associated VTE. A risk score, not a thromboprophylaxis order.';
export function protecht(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0; const p = [];
  const site = sel(o.cancerSite, 2); // 0 none, 1 high, 2 very high
  s += site; if (site) p.push(`cancer site (+${site})`);
  if (bool(o.plateletsHigh)) { s += 1; p.push('platelets >= 350'); }
  if (bool(o.hbLowEsa)) { s += 1; p.push('Hb < 10 or ESA'); }
  if (bool(o.wbcHigh)) { s += 1; p.push('WBC > 11'); }
  if (bool(o.bmiHigh)) { s += 1; p.push('BMI >= 35'); }
  if (bool(o.platinum)) { s += 1; p.push('platinum chemo'); }
  if (bool(o.gemcitabine)) { s += 1; p.push('gemcitabine chemo'); }
  const score = Math.round(num('PROTECHT', s, { min: 0, max: 8 }));
  const abnormal = score >= 3;
  return {
    valid: true, score, abnormal,
    bandLabel: `PROTECHT ${score}`,
    band: `PROTECHT score ${score} — ${abnormal ? 'high VTE risk (>= 3)' : 'low-intermediate VTE risk (0-2)'}.`,
    detail: p.length ? `Positive: ${p.join('; ')}.` : 'No factors.',
    note: PROTECHT_NOTE,
  };
}
