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

import { num, r1, r2 } from './num.js';

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
