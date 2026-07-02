// spec-v201: five deterministic hepatology and upper-GI-bleeding prognostic
// instruments (Deep Subspecialty Quantitation program, spec-v199 §1.1). Every
// id was verified absent by a direct scan of app.js first (spec-v85 §6.2). None
// duplicates a live tile; v201 runs no AI and makes no runtime network call.
// These triage and stratify — they are NOT a transfusion, endoscopy, biopsy,
// transplant, or disposition order (spec-v11 §5.3).
//
//   glasgowBlatchford - Glasgow-Blatchford Score (upper GI bleed, 0-23)
//   clifcAd           - CLIF-C Acute Decompensation score (pre-ACLF cirrhosis)
//   hepamet           - Hepamet Fibrosis Score (NAFLD, 0-1)
//   clip              - CLIP score (HCC prognosis, 0-6)
//   agile3plus        - Agile 3+ (FibroScan-anchored advanced-fibrosis probability)
//
// COEFFICIENTS / POINT WEIGHTS / RISK BANDS RE-FETCHED, NEVER RECALLED
// (spec-v97), each cross-verified across >= 2 independent open sources at
// implementation:
//   - Glasgow-Blatchford grid (Blatchford O, Murray WR, Blatchford M, Lancet
//     2000;356(9238):1318-1321): the admission-risk grid transcribed band-for-
//     band from GPnotebook (gpnotebook.com GBS) and RCEMLearning, which agree on
//     every threshold once the RCEMLearning typos (urea >25 as "5" and max "29")
//     are corrected against the published 0-23 range: the eight weighted items
//     sum to a maximum of 6+6+3+1+1+2+2+2 = 23. Urea (mmol/L): >=6.5 <8.0 -> 2,
//     >=8.0 <10.0 -> 3, >=10.0 <25.0 -> 4, >=25.0 -> 6. Hemoglobin men (g/dL):
//     >=12.0 <13.0 -> 1, >=10.0 <12.0 -> 3, <10.0 -> 6. Women (g/dL): >=10.0
//     <12.0 -> 1, <10.0 -> 6. Systolic BP (mmHg): 100-109 -> 1, 90-99 -> 2, <90
//     -> 3. Pulse >=100 -> 1, melena -> 1, syncope -> 2, hepatic disease -> 2,
//     cardiac failure -> 2. A US-standard BUN (mg/dL) input is converted to urea
//     mmol/L by urea = BUN / 2.8 (the MDCalc-consistent factor). A GBS of 0 (or
//     <=1 by the BSG low-risk extension) flags a candidate for outpatient
//     management; >=6 carries a >50% chance of needing intervention (Stanley
//     2009, corroborated by GPnotebook).

import { num, r1, r2, r3 } from './num.js';

// Overflow-safe positive-domain guard for the logistic-model labs: returns null
// for a non-positive, blank, or non-finite value so ln() never sees <= 0.
function positive(v, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0 || n > hi) return null;
  return n;
}

function inRange(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}
function bool(v) { return v === true || v === '1' || v === 'true' || v === 'yes'; }

// --- 2.1 Glasgow-Blatchford Score -------------------------------------------
const GBS_NOTE = 'Glasgow-Blatchford Score (Blatchford O, Murray WR, Blatchford M, Lancet 2000;356(9238):1318-1321): a pre-endoscopy upper-GI-bleed risk score from data available at first contact — blood urea, hemoglobin (sex-specific), systolic BP, pulse ≥ 100, melena, syncope, hepatic disease, and cardiac failure, summed to a maximum of 23. A score of 0 (or ≤ 1 by the British Society of Gastroenterology low-risk extension) identifies patients who may be considered for outpatient management; a score ≥ 6 carries a > 50% chance of needing transfusion or endoscopic intervention. A triage aid, not a transfusion or endoscopy order.';

function gbsUrea(mmol) { return mmol < 6.5 ? 0 : mmol < 8.0 ? 2 : mmol < 10.0 ? 3 : mmol < 25.0 ? 4 : 6; }
function gbsHbMale(hb) { return hb >= 13.0 ? 0 : hb >= 12.0 ? 1 : hb >= 10.0 ? 3 : 6; }
function gbsHbFemale(hb) { return hb >= 12.0 ? 0 : hb >= 10.0 ? 1 : 6; }
function gbsSbp(sbp) { return sbp >= 110 ? 0 : sbp >= 100 ? 1 : sbp >= 90 ? 2 : 3; }

export function glasgowBlatchford(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  // Urea: accept mmol/L directly, or a US-standard BUN (mg/dL) converted by
  // urea mmol/L = BUN mg/dL / 2.8.
  const unit = o.ureaUnit === 'mgdl' ? 'mgdl' : 'mmol';
  const ureaRaw = unit === 'mgdl' ? inRange(o.urea, 0, 560) : inRange(o.urea, 0, 200);
  const hb = inRange(o.hb, 1, 25);
  const sbp = inRange(o.sbp, 20, 300);
  const sex = o.sex === 'female' ? 'female' : o.sex === 'male' ? 'male' : null;
  if (ureaRaw === null || hb === null || sbp === null || sex === null) {
    return { valid: false, message: 'Enter blood urea (mmol/L) or BUN (mg/dL), hemoglobin (g/dL), systolic BP (mmHg), and select sex; then set the clinical flags.' };
  }
  const ureaMmol = unit === 'mgdl' ? ureaRaw / 2.8 : ureaRaw;
  const parts = [
    ['Urea', gbsUrea(ureaMmol)],
    ['Hemoglobin', sex === 'male' ? gbsHbMale(hb) : gbsHbFemale(hb)],
    ['Systolic BP', gbsSbp(sbp)],
    ['Pulse ≥ 100', bool(o.pulseHigh) ? 1 : 0],
    ['Melena', bool(o.melena) ? 1 : 0],
    ['Syncope', bool(o.syncope) ? 2 : 0],
    ['Hepatic disease', bool(o.hepatic) ? 2 : 0],
    ['Cardiac failure', bool(o.cardiac) ? 2 : 0],
  ];
  let score = 0;
  for (const [, pts] of parts) score += pts;
  score = num('GBS', score, { min: 0, max: 23 });
  let band; let abnormal = true;
  if (score === 0) { band = `Glasgow-Blatchford ${score} — lowest-risk; may be considered for outpatient management.`; abnormal = false; }
  else if (score <= 1) { band = `Glasgow-Blatchford ${score} — low risk (≤ 1); a candidate for outpatient management by the BSG extension.`; abnormal = false; }
  else if (score < 6) band = `Glasgow-Blatchford ${score} — intermediate risk; inpatient assessment warranted.`;
  else band = `Glasgow-Blatchford ${score} — high risk (≥ 6, > 50% chance of needing transfusion or endoscopic intervention).`;
  const active = parts.filter((p) => p[1] > 0).map((p) => `${p[0]} (+${p[1]})`);
  const ureaShown = unit === 'mgdl' ? `BUN ${ureaRaw} mg/dL → urea ${r2(ureaMmol)} mmol/L` : `urea ${ureaRaw} mmol/L`;
  return {
    valid: true,
    score,
    abnormal,
    bandLabel: `GBS ${score}`,
    band,
    detail: active.length ? `Contributors: ${active.join('; ')} (${ureaShown}).` : `All markers in their low-risk bands — GBS 0 (${ureaShown}).`,
    note: GBS_NOTE,
  };
}

// --- 2.2 CLIF-C Acute Decompensation score ----------------------------------
// COEFFICIENTS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across two
// authoritative EF-CLIF sources that agree verbatim (efclif.com/score-
// calculators/clif-c-ad and clifresearch.com CLIF-C_AD_Score):
//   CLIF-C ADs = 10 × [0.03·age + 0.66·ln(creatinine mg/dL) + 1.71·ln(INR)
//                      + 0.88·ln(WBC ×10⁹/L) − 0.05·sodium + 8]
// SPEC-DRAFT CORRECTION (spec-v97): the spec-v201 §2.2 draft listed only FOUR
// predictors (age, WBC, sodium, creatinine) and omitted INR. Both EF-CLIF
// sources carry FIVE predictors — INR (1.71·ln(INR)) is a required term. This
// tile ships the verbatim five-variable formula (the v199 ELTS / v200 APPS
// precedent: the source governs, not the draft).
// Stratification (Springer Dig Dis Sci 2020, s10620-020-06791-5; corroborated
// by the systematic review PMC9813844): < 50 low, 50–59 intermediate, ≥ 60 high
// (survival ~93% / 80% / 50%, rising complication rate). A model estimate, not a
// transplant or disposition order.
const CLIFC_AD_NOTE = 'CLIF-C AD score (Jalan R, Pavesi M, Saliba F, et al, J Hepatol 2015;62(4):831-840): a mortality model for the hospitalised decompensated cirrhotic WITHOUT acute-on-chronic liver failure. CLIF-C ADs = 10 × [0.03·age + 0.66·ln(creatinine mg/dL) + 1.71·ln(INR) + 0.88·ln(WBC ×10⁹/L) − 0.05·sodium + 8]. Bands: < 50 low, 50–59 intermediate, ≥ 60 high risk (≈ 93% / 80% / 50% survival). The companion to CLIF-C ACLF for the pre-ACLF patient — a prognostic estimate, not a transplant or disposition order.';

export function clifcAd(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = inRange(o.age, 0, 120);
  const creat = positive(o.creatinine, 40);
  const inr = positive(o.inr, 30);
  const wbc = positive(o.wbc, 500);
  const na = inRange(o.sodium, 100, 180);
  if (age === null || creat === null || inr === null || wbc === null || na === null) {
    return { valid: false, message: 'Enter age (years), creatinine (mg/dL), INR, WBC (×10⁹/L), and sodium (mmol/L) — all positive.' };
  }
  const raw = 10 * (0.03 * age + 0.66 * Math.log(creat) + 1.71 * Math.log(inr) + 0.88 * Math.log(wbc) - 0.05 * na + 8);
  const score = r1(num('CLIF-C AD', raw, { min: 0, max: 200 }));
  let tier; let abnormal = true;
  if (score < 50) { tier = 'low-risk band (< 50)'; abnormal = false; }
  else if (score < 60) tier = 'intermediate-risk band (50–59)';
  else tier = 'high-risk band (≥ 60, ≈ 50% survival)';
  return {
    valid: true,
    score,
    abnormal,
    bandLabel: `CLIF-C AD ${score}`,
    band: `CLIF-C AD ${score} — ${tier}.`,
    detail: `10 × [0.03·${age} + 0.66·ln(${creat}) + 1.71·ln(${inr}) + 0.88·ln(${wbc}) − 0.05·${na} + 8].`,
    note: CLIFC_AD_NOTE,
  };
}

// --- 2.3 Hepamet Fibrosis Score (NAFLD) -------------------------------------
// COEFFICIENTS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified verbatim
// across two independent reproductions of the original model (Ampuero J, Pais
// R, Aller R, et al, Clin Gastroenterol Hepatol 2020;18(1):216-225.e5): the
// multi-ethnic Asian validation (Ann Hepatol 2022, S1665268122002307) and a
// second reproduction, which agree on every coefficient. The published
// categorical logistic:
//   HFS = 1 / (1 + e^E), where
//   E = 5.390 − 0.986·[age 45-64] − 1.719·[age ≥65] + 0.875·[male]
//       − 0.896·[AST 35-69] − 2.126·[AST ≥70]
//       − 0.027·[albumin 4-4.49] − 0.897·[albumin <4]
//       − 0.899·[HOMA 2-3.99, no DM] − 1.497·[HOMA ≥4, no DM] − 2.184·[DM]
//       − 0.882·[platelets 155-219] − 2.233·[platelets <155]
// The DM term is mutually exclusive with the HOMA terms — a diabetic takes
// −2.184 and no HOMA term, so HOMA-IR is only required when DM is absent.
// Cut-points (Ampuero 2020, both sources): < 0.12 rules out advanced fibrosis,
// ≥ 0.47 rules it in, 0.12–0.47 indeterminate. A non-invasive score built to
// shrink the FIB-4 / NFS gray zone — a stratifier, not a biopsy order.
const HEPAMET_NOTE = 'Hepamet Fibrosis Score (Ampuero J, Pais R, Aller R, et al, Clin Gastroenterol Hepatol 2020;18(1):216-225.e5): a non-invasive advanced-fibrosis score for NAFLD from age, sex, AST, albumin, HOMA-IR, diabetes, and platelets, built to shrink the FIB-4 / NFS indeterminate zone. HFS = 1 / (1 + e^E) with the published categorical logistic. Cut-points: < 0.12 rules OUT advanced fibrosis, ≥ 0.47 rules it IN, 0.12–0.47 indeterminate. A stratifier, not a biopsy order.';

function hepAst(v) { return v < 35 ? 0 : v < 70 ? -0.896 : -2.126; }
function hepAge(v) { return v < 45 ? 0 : v < 65 ? -0.986 : -1.719; }
function hepAlb(v) { return v >= 4.5 ? 0 : v >= 4 ? -0.027 : -0.897; }
function hepPlt(v) { return v >= 220 ? 0 : v >= 155 ? -0.882 : -2.233; }
function hepHoma(v) { return v < 2 ? 0 : v < 4 ? -0.899 : -1.497; }

export function hepamet(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = inRange(o.age, 0, 120);
  const sex = o.sex === 'female' ? 'female' : o.sex === 'male' ? 'male' : null;
  const ast = inRange(o.ast, 0, 20000);
  const alb = inRange(o.albumin, 0.5, 7);
  const plt = inRange(o.platelets, 0, 3000);
  const dm = bool(o.diabetes);
  if (age === null || sex === null || ast === null || alb === null || plt === null) {
    return { valid: false, message: 'Enter age (years), sex, AST (IU/L), albumin (g/dL), and platelets (×10⁹/L); set diabetes; enter HOMA-IR unless diabetic.' };
  }
  // HOMA-IR is only used when the patient is NOT diabetic (the DM term replaces
  // the HOMA terms). Require it only in that case.
  let homaTerm = 0;
  if (dm) {
    homaTerm = -2.184;
  } else {
    const homa = inRange(o.homa, 0, 200);
    if (homa === null) {
      return { valid: false, message: 'Non-diabetic: enter HOMA-IR (fasting glucose × insulin / 405, or mmol version / 22.5).' };
    }
    homaTerm = hepHoma(homa);
  }
  const E = 5.390 + hepAge(age) + (sex === 'male' ? 0.875 : 0) + hepAst(ast) + hepAlb(alb) + homaTerm + hepPlt(plt);
  const score = r3(1 / (1 + Math.exp(Math.max(-40, Math.min(40, E)))));
  const scoreChecked = num('Hepamet', score, { min: 0, max: 1 });
  let tier; let abnormal = true;
  if (scoreChecked < 0.12) { tier = 'advanced fibrosis ruled OUT (< 0.12)'; abnormal = false; }
  else if (scoreChecked < 0.47) tier = 'indeterminate (0.12–0.47) — consider elastography or biopsy';
  else tier = 'advanced fibrosis ruled IN (≥ 0.47)';
  return {
    valid: true,
    score: scoreChecked,
    abnormal,
    bandLabel: `Hepamet ${scoreChecked}`,
    band: `Hepamet ${scoreChecked} — ${tier}.`,
    detail: `Logistic exponent E = ${r2(E)}; ${dm ? 'diabetic (−2.184, HOMA term omitted)' : 'non-diabetic (HOMA band applied)'}.`,
    note: HEPAMET_NOTE,
  };
}

// --- 2.4 CLIP score (Cancer of the Liver Italian Program) --------------------
// ITEM WEIGHTS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across two
// independent open reproductions that agree on every weight (the CLIP staging
// overview PMC5453774 and an academia.edu reproduction of the CLIP 1998 paper):
//   Child-Pugh A/B/C -> 0/1/2; tumor morphology uninodular & ≤50% -> 0,
//   multinodular & ≤50% -> 1, massive or >50% -> 2; AFP <400 -> 0, ≥400 -> 1;
//   portal-vein thrombosis no -> 0, yes -> 1. Total 0-6.
// Median survival by score (CLIP prospective validation, CLIP Investigators,
// Hepatology 2000; PubMed 10733537): 0 -> 36 mo, 1 -> 22, 2 -> 9, 3 -> 7,
// 4-6 -> 3. A prognostic score that integrates liver function with tumor burden
// and AFP, complementary to BCLC — a stratifier, not a treatment order.
const CLIP_NOTE = 'CLIP score (The Cancer of the Liver Italian Program Investigators, Hepatology 1998;28(3):751-755): an HCC prognostic score summing four items 0–6 — Child-Pugh stage (A/B/C → 0/1/2), tumor morphology (uninodular ≤ 50% / multinodular ≤ 50% / massive or > 50% → 0/1/2), AFP (< 400 / ≥ 400 ng/mL → 0/1), and portal-vein thrombosis (no/yes → 0/1). Median survival by score in the prospective validation (Hepatology 2000): 0 ≈ 36 mo, 1 ≈ 22, 2 ≈ 9, 3 ≈ 7, 4–6 ≈ 3. Integrates liver function with tumor burden and AFP, complementary to BCLC — a stratifier, not a treatment order.';

function clipMorph(v) { return v === 'massive' ? 2 : v === 'multi' ? 1 : v === 'uni' ? 0 : null; }
function clipChild(v) { return v === 'C' ? 2 : v === 'B' ? 1 : v === 'A' ? 0 : null; }
function clipSurvival(score) { return score === 0 ? 36 : score === 1 ? 22 : score === 2 ? 9 : score === 3 ? 7 : 3; }

export function clip(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const child = clipChild(o.childPugh);
  const morph = clipMorph(o.morphology);
  const afp = inRange(o.afp, 0, 5000000);
  if (child === null || morph === null || afp === null) {
    return { valid: false, message: 'Select Child-Pugh stage (A/B/C) and tumor morphology, enter AFP (ng/mL), and set portal-vein thrombosis.' };
  }
  const afpPts = afp >= 400 ? 1 : 0;
  const pvtPts = bool(o.pvt) ? 1 : 0;
  const score = num('CLIP', child + morph + afpPts + pvtPts, { min: 0, max: 6 });
  const months = clipSurvival(score);
  const abnormal = score >= 2;
  const items = [
    `Child-Pugh ${o.childPugh} (+${child})`,
    `morphology (+${morph})`,
    `AFP ${afp} ng/mL (+${afpPts})`,
    `portal-vein thrombosis ${pvtPts ? 'yes (+1)' : 'no (0)'}`,
  ];
  return {
    valid: true,
    score,
    abnormal,
    bandLabel: `CLIP ${score}`,
    band: `CLIP ${score} — median survival ≈ ${months} months in the prospective validation cohort.`,
    detail: `Items: ${items.join('; ')}.`,
    note: CLIP_NOTE,
  };
}

// --- 2.5 Agile 3+ (FibroScan-anchored advanced fibrosis) --------------------
// COEFFICIENTS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across
// three sources that agree on every coefficient (Sanyal AJ, Foucquier J,
// Younossi ZM, et al, J Hepatol 2023;78(2):247-259 = PMC10170177; PMC12935180;
// and a third reproduction). Agile 3+ = 1 / (1 + e^−logit), a probability of
// advanced (≥ F3) fibrosis, where
//   logit = −3.92368 + 2.29714·ln(LSM kPa) − 0.00902·platelets(×10⁹/L)
//           − 0.98633·(ALT/AST ratio) + 1.08636·diabetes − 0.38581·sex(male=1)
//           + 0.03018·age
// AAR⁻¹ DISAMBIGUATION (spec-v97): the original paper writes the ALT/AST term as
// "AAR⁻¹" where AAR = AST/ALT ratio, so the input value is its reciprocal,
// ALT/AST (PMC10170177 states this explicitly). Sex is coded male = 1, female =
// 0; platelets are ×10⁹/L (G/L). Dual cut-points (Sanyal 2023, original paper):
// < 0.451 rules OUT advanced fibrosis (≥ 85% sensitivity), ≥ 0.679 rules it IN
// (≥ 90% specificity), 0.451–0.679 indeterminate. Takes the LSM the operator
// reads from the device — no vendor elastography processing is reproduced. A
// stratifier, not a biopsy order.
const AGILE_NOTE = 'Agile 3+ (Sanyal AJ, Foucquier J, Younossi ZM, et al, J Hepatol 2023;78(2):247-259): a FibroScan-anchored probability of advanced (≥ F3) fibrosis in NAFLD from liver stiffness (LSM), AST, ALT, platelets, diabetes, sex, and age. Agile 3+ = 1 / (1 + e^−logit) with the published coefficients. Cut-points: < 0.451 rules OUT advanced fibrosis, ≥ 0.679 rules it IN, 0.451–0.679 indeterminate. Outperforms LSM alone; takes the LSM value the operator reads from the device. A stratifier, not a biopsy order.';

export function agile3plus(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const lsm = positive(o.lsm, 100);
  const ast = positive(o.ast, 20000);
  const alt = positive(o.alt, 20000);
  const plt = positive(o.platelets, 3000);
  const age = inRange(o.age, 0, 120);
  const sex = o.sex === 'female' ? 'female' : o.sex === 'male' ? 'male' : null;
  if (lsm === null || ast === null || alt === null || plt === null || age === null || sex === null) {
    return { valid: false, message: 'Enter LSM (kPa), AST, ALT, platelets (×10⁹/L), age, and sex — all positive; set diabetes.' };
  }
  const altAstRatio = alt / ast;
  const logit = -3.92368
    + 2.29714 * Math.log(lsm)
    - 0.00902 * plt
    - 0.98633 * altAstRatio
    + 1.08636 * (bool(o.diabetes) ? 1 : 0)
    - 0.38581 * (sex === 'male' ? 1 : 0)
    + 0.03018 * age;
  const clamped = Math.max(-40, Math.min(40, logit));
  const score = r3(1 / (1 + Math.exp(-clamped)));
  const scoreChecked = num('Agile 3+', score, { min: 0, max: 1 });
  let tier; let abnormal = true;
  if (scoreChecked < 0.451) { tier = 'advanced fibrosis ruled OUT (< 0.451)'; abnormal = false; }
  else if (scoreChecked < 0.679) tier = 'indeterminate (0.451–0.679) — consider biopsy or further testing';
  else tier = 'advanced fibrosis ruled IN (≥ 0.679)';
  return {
    valid: true,
    score: scoreChecked,
    abnormal,
    bandLabel: `Agile 3+ ${scoreChecked}`,
    band: `Agile 3+ ${scoreChecked} — ${tier}.`,
    detail: `LSM ${lsm} kPa, ALT/AST ${r2(altAstRatio)}, platelets ${plt}; logit ${r2(logit)}.`,
    note: AGILE_NOTE,
  };
}
