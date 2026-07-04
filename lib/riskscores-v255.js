// spec-v255: risk & severity scores — the Venous Clinical Severity Score (VCSS),
// the PEN-FAST penicillin-allergy decision rule, the Harris Hip Score, and the
// Koivuranta PONV score. Each id was verified absent by a fixed-string scan of the
// extracted app.js id/name lists AND the MCP adapter set first (spec-v85 §6.2).
// v255 runs no AI and makes no runtime network call.
//
// These score / grade risk — they are NOT a diagnosis and NOT a treatment order
// (spec-v11 §5.3).
//
//   vcss             - Venous Clinical Severity Score (0-30)
//   pen-fast         - PEN-FAST penicillin-allergy rule (0-5)
//   harris-hip-score - Harris Hip Score (0-100)
//   koivuranta-ponv  - Koivuranta PONV score (0-5)
//
// POINT SYSTEMS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see per-function headers).

import { num } from './num.js';

function lvl(v, hi) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > hi) return 0;
  return Math.round(n);
}
function bool(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'on'; }

// --- Venous Clinical Severity Score (VCSS) -----------------------------------
// Vasquez MA, et al (American Venous Forum). J Vasc Surg. 2010: 10 attributes
// (pain, varicose veins, venous edema, skin pigmentation, inflammation, induration,
// number of active ulcers, ulcer duration, ulcer size, use of compression therapy),
// each 0-3. Total 0-30; higher = more severe chronic venous disease. Cross-verified:
// J Vasc Surg 2010; American Venous Forum.
const VCSS_ITEMS = ['pain', 'varicose', 'edema', 'pigmentation', 'inflammation', 'induration', 'ulcerNumber', 'ulcerDuration', 'ulcerSize', 'compression'];
const VCSS_NOTE = 'Venous Clinical Severity Score (Vasquez MA, et al. J Vasc Surg. 2010): 10 attributes (pain, varicose veins, venous edema, skin pigmentation, inflammation, induration, number of active ulcers, ulcer duration, ulcer size, use of compression therapy), each 0-3. Total 0-30; higher = more severe chronic venous disease. Complements the CEAP classification. A severity score, not a diagnosis or treatment order.';
export function vcss(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0;
  for (const k of VCSS_ITEMS) s += lvl(o[k], 3);
  const score = Math.round(num('VCSS', s, { min: 0, max: 30 }));
  return { valid: true, score, abnormal: false, bandLabel: `VCSS ${score}`, band: `Venous Clinical Severity Score ${score} of 30 — higher = more severe venous disease.`, detail: '10 attributes each 0-3.', note: VCSS_NOTE };
}

// --- PEN-FAST penicillin-allergy rule ----------------------------------------
// Trubiano JA, et al. JAMA Intern Med. 2020: recent reaction within Five years
// (+2), Anaphylaxis/angioedema OR Severe cutaneous adverse reaction (+2), Treatment
// required for the reaction (+1). Total 0-5; < 3 low risk (NPV > 95%) -> direct
// oral challenge; >= 3 refer for allergist evaluation. Cross-verified: MDCalc;
// Ann Allergy Asthma Immunol 2020.
const PENFAST_NOTE = 'PEN-FAST penicillin-allergy rule (Trubiano JA, et al. JAMA Intern Med. 2020): reaction within Five years (+2), Anaphylaxis/angioedema OR Severe cutaneous adverse reaction (+2), Treatment required for the reaction (+1). Total 0-5; < 3 low risk (NPV > 95%) supports a direct oral challenge, >= 3 warrants allergist evaluation. A decision rule, not a diagnosis or treatment order.';
export function penFast(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0;
  if (bool(o.recent)) s += 2;
  if (bool(o.anaphylaxis)) s += 2;
  if (bool(o.treatment)) s += 1;
  const score = Math.round(num('PEN-FAST', s, { min: 0, max: 5 }));
  const abnormal = score >= 3;
  return { valid: true, score, abnormal, bandLabel: `PEN-FAST ${score}`, band: `PEN-FAST score ${score} of 5 — ${abnormal ? 'not low risk (>= 3), refer for allergist evaluation' : 'low risk (< 3), consider direct oral challenge'}.`, detail: 'Five years, Anaphylaxis/SCAR, Treatment required.', note: PENFAST_NOTE };
}

// --- Harris Hip Score --------------------------------------------------------
// Harris WH. J Bone Joint Surg Am. 1969: pain (0-44), function (gait + activities,
// 0-47), absence of deformity (0 or 4), range of motion (0-5). Total 0-100; < 70
// poor, 70-79 fair, 80-89 good, 90-100 excellent. Cross-verified: physio-pedia;
// APTA.
const HHS_NOTE = 'Harris Hip Score (Harris WH. J Bone Joint Surg Am. 1969): pain (0-44), function/gait + activities (0-47), absence of deformity (0 or 4), range of motion (0-5). Total 0-100; < 70 poor, 70-79 fair, 80-89 good, 90-100 excellent (a post-arthroplasty outcome measure). A functional score, not a diagnosis or treatment order.';
export function harrisHipScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const s = lvl(o.pain, 44) + lvl(o.function, 47) + lvl(o.deformity, 4) + lvl(o.rom, 5);
  const score = Math.round(num('Harris', s, { min: 0, max: 100 }));
  let tier; let abnormal = true;
  if (score >= 90) { tier = 'excellent (90-100)'; abnormal = false; }
  else if (score >= 80) { tier = 'good (80-89)'; abnormal = false; }
  else if (score >= 70) tier = 'fair (70-79)';
  else tier = 'poor (< 70)';
  return { valid: true, score, abnormal, bandLabel: `HHS ${score}`, band: `Harris Hip Score ${score} of 100 — ${tier}.`, detail: 'Pain + function + deformity + ROM.', note: HHS_NOTE };
}

// --- Koivuranta PONV score ---------------------------------------------------
// Koivuranta M, et al. Anaesthesia. 1997: female sex, prior PONV, history of motion
// sickness, non-smoker, and surgery > 60 min, each 1 point. Total 0-5; predicted
// PONV risk ~ 17 / 18 / 42 / 54 / 74 / 87% for 0-5 factors. Cross-verified: PubMed
// 10757586; BJA. (Distinct from the Apfel adult score already in the catalog.)
const KOIVURANTA_NOTE = 'Koivuranta PONV score (Koivuranta M, et al. Anaesthesia. 1997): female sex, prior PONV, history of motion sickness, non-smoker, and surgery > 60 min, each 1 point. Total 0-5; predicted postoperative nausea/vomiting risk ~ 17 / 18 / 42 / 54 / 74 / 87% for 0-5 factors. A risk score, not a diagnosis or treatment order.';
export function koivurantaPonv(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0;
  if (bool(o.female)) s += 1;
  if (bool(o.priorPonv)) s += 1;
  if (bool(o.motionSickness)) s += 1;
  if (bool(o.nonSmoker)) s += 1;
  if (bool(o.longSurgery)) s += 1;
  const score = Math.round(num('Koivuranta', s, { min: 0, max: 5 }));
  const risk = [17, 18, 42, 54, 74, 87][score];
  const abnormal = score >= 3;
  return { valid: true, score, abnormal, bandLabel: `Koivuranta ${score}`, band: `Koivuranta score ${score} of 5 — ~${risk}% PONV risk.`, detail: 'Female, prior PONV, motion sickness, non-smoker, surgery > 60 min.', note: KOIVURANTA_NOTE };
}
