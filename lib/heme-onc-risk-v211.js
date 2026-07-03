// spec-v211: hematology-oncology risk-stratification instruments (Advanced
// Prognostic & Risk-Equation Instruments program, spec-v209 §1.1). Every id was
// verified absent by a direct scan of app.js first (spec-v85 §6.2). None
// duplicates a live tile; v211 runs no AI and makes no runtime network call.
// These stratify risk — they are NOT a chemotherapy, transplant, or
// thromboprophylaxis order (spec-v11 §5.3). Shipped one tile at a time per an
// active /goal.
//
//   eutos       - EUTOS score (CML: CCyR / PFS on imatinib)
//   improvedd   - IMPROVEDD VTE risk score (medical inpatients)
//   compassCat  - COMPASS-CAT (ambulatory cancer-associated VTE)
//   eln2022Aml  - ELN 2022 AML genetic risk classification
//
// The proposed `hct-ci` tile is NOT built here: it is already live (shipped by
// spec-v199, lib/hemonc-v94.js area) — the spec-v85 §6.2 collision re-check found
// it, so v211 does not duplicate it.
//
// POINT WEIGHTS / THRESHOLDS RE-FETCHED, NEVER RECALLED (spec-v97), each
// cross-verified across >= 2 independent open sources at implementation:
//   - EUTOS score (Hasford J, Baccarani M, Hoffmann V, et al, Blood 2011;118(3):
//     686-692): EUTOS = 7 × basophils (% of peripheral blood at baseline) + 4 ×
//     spleen size (cm below the costal margin, palpable). A score > 87 is high
//     risk, ≤ 87 low risk, for 18-month complete cytogenetic response and
//     progression-free survival on front-line imatinib. Formula reproduced
//     identically across Medscape and the ELN leukemia-net calculator.

import { num } from './num.js';

function nonNeg(v, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > hi) return null;
  return n;
}
function bool(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'yes'; }

// --- 2.1 EUTOS score --------------------------------------------------------
const EUTOS_NOTE = 'EUTOS score (Hasford J, Baccarani M, Hoffmann V, et al, Blood 2011;118(3):686-692): a simple two-variable prognostic score for chronic myeloid leukemia on front-line imatinib — EUTOS = 7 × basophils (% of peripheral blood at baseline) + 4 × spleen size (cm below the costal margin). A score > 87 is high risk, ≤ 87 low risk, for the 18-month complete cytogenetic response and progression-free survival. Simpler than and prognostically comparable to Sokal / Euro. A risk stratifier, not a treatment order.';

export function eutos(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const baso = nonNeg(o.basophils, 100);
  const spleen = nonNeg(o.spleenCm, 40);
  if (baso === null || spleen === null) {
    return { valid: false, message: 'Enter basophils (% of peripheral blood) and palpable spleen size (cm below the costal margin, 0 if not palpable).' };
  }
  const score = num('EUTOS', 7 * baso + 4 * spleen, { min: 0, max: 860 });
  const abnormal = score > 87;
  return {
    valid: true,
    score,
    abnormal,
    bandLabel: `EUTOS ${score}`,
    band: abnormal
      ? `EUTOS ${score} — high risk (> 87): lower 18-month complete-cytogenetic-response and progression-free-survival rates.`
      : `EUTOS ${score} — low risk (≤ 87): higher likelihood of 18-month complete cytogenetic response.`,
    detail: `7 × ${baso}% basophils + 4 × ${spleen} cm spleen = ${score}.`,
    note: EUTOS_NOTE,
  };
}

// --- 2.4 IMPROVEDD VTE risk score -------------------------------------------
// WEIGHTS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across the
// IMPROVEDD paper (Gibson CM, Spyropoulos AC, Cohen AT, et al, TH Open
// 2017;1(1):e56-e65) reproductions and the IMPROVE derivation: the seven IMPROVE
// items — previous VTE +3, known thrombophilia +2, current lower-limb paralysis
// +2, active cancer +2, immobilization ≥ 7 days +1, ICU/CCU stay +1, age > 60 +1
// — plus D-dimer ≥ 2× the upper limit of normal +2. Total 0-14. Risk: low 0-1,
// moderate 2-3, high ≥ 4; a total ≥ 2 is the threshold above which extended
// thromboprophylaxis is discussed.
const IMPROVEDD_ITEMS = [
  ['previousVte', 'Previous VTE', 3],
  ['thrombophilia', 'Known thrombophilia', 2],
  ['paralysis', 'Current lower-limb paralysis', 2],
  ['cancer', 'Active cancer', 2],
  ['immobilization', 'Immobilization ≥ 7 days', 1],
  ['icu', 'ICU / CCU stay', 1],
  ['ageOver60', 'Age > 60', 1],
  ['dDimer', 'D-dimer ≥ 2× ULN', 2],
];
const IMPROVEDD_NOTE = 'IMPROVEDD VTE risk score (Gibson CM, Spyropoulos AC, Cohen AT, et al, TH Open 2017;1(1):e56-e65): the D-dimer-augmented inpatient medical-VTE stratifier — the seven IMPROVE items (previous VTE +3, known thrombophilia +2, lower-limb paralysis +2, active cancer +2, immobilization ≥ 7 days +1, ICU/CCU +1, age > 60 +1) plus D-dimer ≥ 2× ULN +2; total 0-14. Risk: low 0-1, moderate 2-3, high ≥ 4; a total ≥ 2 is the threshold above which extended thromboprophylaxis is discussed. A risk stratifier, not a prophylaxis order.';

export function improvedd(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let total = 0;
  const active = [];
  for (const [key, label, pts] of IMPROVEDD_ITEMS) {
    if (bool(o[key])) { total += pts; active.push(`${label} (+${pts})`); }
  }
  total = num('IMPROVEDD', total, { min: 0, max: 14 });
  let tier; let abnormal = true;
  if (total <= 1) { tier = 'low VTE risk (0–1)'; abnormal = false; }
  else if (total <= 3) tier = 'moderate VTE risk (2–3)';
  else tier = 'high VTE risk (≥ 4)';
  return {
    valid: true,
    score: total,
    abnormal,
    bandLabel: `IMPROVEDD ${total}`,
    band: `IMPROVEDD ${total} — ${tier}${total >= 2 ? '; at or above the ≥ 2 threshold for discussing extended thromboprophylaxis' : ''}.`,
    detail: active.length ? `Contributors: ${active.join('; ')}.` : 'No risk factors — IMPROVEDD 0.',
    note: IMPROVEDD_NOTE,
  };
}

// --- 2.3 COMPASS-CAT --------------------------------------------------------
// WEIGHTS / CUT-POINT RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified
// across the derivation paper (Gerotziafas GT, Taher A, Abdel-Razeq H, et al,
// Oncologist 2017;22(10):1222-1231) reproductions and the external-validation
// literature: anti-hormonal or anthracycline therapy +6, time since cancer
// diagnosis ≤ 6 months +4, central venous catheter +3, advanced-stage cancer +2,
// cardiovascular risk factors +5, recent hospitalization for acute medical
// illness +5, personal history of VTE +1, platelet count ≥ 350 ×10⁹/L +2. Total
// 0-28. Dichotomized at the derivation cut-point: 0-6 low/intermediate risk, ≥ 7
// high 6-month VTE risk (≈ 2.3% vs ≈ 6.3-13.3%).
const COMPASS_ITEMS = [
  ['antiHormonalAnthracycline', 'Anti-hormonal or anthracycline therapy', 6],
  ['diagWithin6mo', 'Cancer diagnosis ≤ 6 months ago', 4],
  ['cvc', 'Central venous catheter', 3],
  ['advancedStage', 'Advanced-stage cancer', 2],
  ['cvRiskFactors', 'Cardiovascular risk factors', 5],
  ['recentHospitalization', 'Recent hospitalization for acute medical illness', 5],
  ['priorVte', 'Personal history of VTE', 1],
  ['platelets350', 'Platelet count ≥ 350 ×10⁹/L', 2],
];
const COMPASS_NOTE = 'COMPASS-CAT (Gerotziafas GT, Taher A, Abdel-Razeq H, et al, Oncologist 2017;22(10):1222-1231): a VTE risk-assessment model for ambulatory patients with breast, colorectal, lung, or ovarian cancer on active treatment — anti-hormonal/anthracycline therapy +6, diagnosis ≤ 6 months +4, central venous catheter +3, advanced stage +2, cardiovascular risk factors +5, recent hospitalization +5, prior VTE +1, platelets ≥ 350 +2; total 0-28. Dichotomized 0-6 low/intermediate vs ≥ 7 high 6-month VTE risk. A complement to Khorana — a risk stratifier, not a thromboprophylaxis order.';

export function compassCat(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let total = 0;
  const active = [];
  for (const [key, label, pts] of COMPASS_ITEMS) {
    if (bool(o[key])) { total += pts; active.push(`${label} (+${pts})`); }
  }
  total = num('COMPASS-CAT', total, { min: 0, max: 28 });
  const abnormal = total >= 7;
  return {
    valid: true,
    score: total,
    abnormal,
    bandLabel: `COMPASS-CAT ${total}`,
    band: abnormal
      ? `COMPASS-CAT ${total} — high 6-month VTE risk (≥ 7).`
      : `COMPASS-CAT ${total} — low/intermediate 6-month VTE risk (0–6).`,
    detail: active.length ? `Contributors: ${active.join('; ')}.` : 'No risk factors — COMPASS-CAT 0.',
    note: COMPASS_NOTE,
  };
}

// --- 2.2 ELN 2022 AML genetic risk classification ---------------------------
// CATEGORY MEMBERSHIP / PRECEDENCE RE-FETCHED, NEVER RECALLED (spec-v97),
// cross-verified against the ELN 2022 recommendations (Döhner H, Wei AH,
// Appelbaum FR, et al, Blood 2022;140(12):1345-1377): a structured genetic risk
// classification (NOT an arithmetic score) — favorable / intermediate / adverse.
//   Favorable: CBF-AML [t(8;21)/RUNX1::RUNX1T1 or inv(16)/t(16;16)/CBFB::MYH11],
//     bZIP in-frame CEBPA, mutated NPM1 WITHOUT FLT3-ITD.
//   Adverse (overrides): complex/monosomal karyotype, −5/del(5q), −7,
//     −17/abn(17p), t(6;9)/DEK::NUP214, t(v;11q23.3)/KMT2A-rearranged,
//     t(9;22)/BCR::ABL1, inv(3)/t(3;3)/MECOM(EVI1), mutated TP53, and mutated
//     ASXL1/BCOR/EZH2/RUNX1/SF3B1/SRSF2/STAG2/U2AF1/ZRSR2.
//   Intermediate: mutated NPM1 WITH FLT3-ITD; wild-type NPM1 with FLT3-ITD
//     (without adverse); and anything not classed favorable or adverse.
// PRECEDENCE (2022 update): an adverse lesion overrides an otherwise-favorable
// NPM1 (and the 2017 FLT3-ITD allelic-ratio distinction was removed — any
// FLT3-ITD moves NPM1-mutated AML out of favorable into intermediate).
const ELN_NOTE = 'ELN 2022 AML risk classification (Döhner H, Wei AH, Appelbaum FR, et al, Blood 2022;140(12):1345-1377): the standard genetic risk framework — favorable / intermediate / adverse — from diagnostic cytogenetics and molecular findings. Favorable: CBF-AML [t(8;21) or inv(16)], bZIP in-frame CEBPA, or mutated NPM1 without FLT3-ITD. Adverse (overrides): complex/monosomal karyotype, −5/−7/−17/abn(17p), TP53, high-risk molecular lesions, or adverse fusions. Intermediate: NPM1-mutated with FLT3-ITD, or anything not favorable/adverse. Informs post-remission strategy including transplant candidacy — a classification, not a transplant or therapy order.';

export function eln2022Aml(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const cbf = bool(o.cbf);
  const cebpa = bool(o.cebpa);
  const npm1 = bool(o.npm1);
  const flt3itd = bool(o.flt3itd);
  const adverse = bool(o.adverse);
  let category; let driver; let abnormal = false;
  if (adverse) {
    category = 'Adverse'; abnormal = true;
    driver = 'an adverse cytogenetic/molecular lesion (overrides an otherwise-favorable NPM1)';
  } else if (cbf || cebpa || (npm1 && !flt3itd)) {
    category = 'Favorable';
    driver = cbf ? 'core-binding-factor AML [t(8;21) or inv(16)]' : cebpa ? 'bZIP in-frame CEBPA' : 'mutated NPM1 without FLT3-ITD';
  } else if (npm1 && flt3itd) {
    category = 'Intermediate';
    driver = 'mutated NPM1 with FLT3-ITD';
  } else {
    category = 'Intermediate';
    driver = flt3itd ? 'FLT3-ITD without a favorable or adverse lesion' : 'no favorable or adverse lesion identified';
  }
  return {
    valid: true,
    category,
    abnormal,
    bandLabel: `ELN 2022: ${category}`,
    band: `ELN 2022 AML risk: ${category} — driven by ${driver}.`,
    detail: `Favorable inputs: CBF ${cbf ? 'yes' : 'no'}, CEBPA ${cebpa ? 'yes' : 'no'}, NPM1 ${npm1 ? 'yes' : 'no'}. FLT3-ITD ${flt3itd ? 'yes' : 'no'}. Any adverse lesion: ${adverse ? 'yes' : 'no'}.`,
    note: ELN_NOTE,
  };
}
