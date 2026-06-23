// spec-v142 (first feature spec of Wave 8 of the spec-v100 MDCalc Parity
// Completion program): six classic surgical / anesthetic risk instruments that
// fill confirmed gaps beside the existing rcri / gupta-mica / ariscat / pospom /
// asa-ps / el-ganzouri perioperative cluster. None duplicates a live tile; v142
// parses no report and runs no AI.
//
//   possum              - POSSUM physiological + operative score -> morbidity & mortality
//   pPossum             - Portsmouth-recalibrated POSSUM mortality (cross-links possum)
//   sort                - Surgical Outcome Risk Tool, 30-day mortality logistic
//   goldmanCardiacRisk  - original 1977 Goldman cardiac risk index (Class I-IV)
//   wilsonAirway        - Wilson Risk Sum Score (difficult intubation)
//   surgicalRiskScale   - Sutton CEPOD + ASA + BUPA in-hospital-mortality score
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v142.js render the spec-v50 §3 clinical-
// posture note. Each tile reports the score / predicted risk and the source's
// framing; the operative proceed/cancel/optimize decision stays with the
// clinician and local protocol (spec-v11 §5.3).
//
// COEFFICIENTS RE-FETCHED, NEVER RECALLED (spec-v97 lesson), each cross-verified
// across >= 2 independent sources. NO-FABRICATION / SOURCE-GOVERNANCE:
//   - possum / pPossum (Copeland GP, Jones D, Walters M, Br J Surg 1991;78:355-360;
//     Prytherch DR, Whiteley MS, Higgins B, et al, Br J Surg 1998;85:1217-1220):
//     the IDENTICAL 18 variables (12 physiological, 6 operative) each band to the
//     published 1/2/4/8-point grade (a dash means no value maps to that level for
//     that variable: WCC and operative severity have no 8 for WCC, age/procedures/
//     urgency/ECG skip a level). The physiological score floors at 12 (12 x 1),
//     the operative score at 6 (6 x 1). POSSUM drives TWO logistic equations --
//     morbidity  ln[R/(1-R)] = -5.91 + 0.16*phys + 0.19*op  and mortality
//     ln[R/(1-R)] = -7.04 + 0.13*phys + 0.16*op. P-POSSUM recalibrates the
//     MORTALITY equation only -- ln[R/(1-R)] = -9.065 + 0.1692*phys + 0.1550*op
//     (it has NO separate morbidity equation; the unchanged POSSUM morbidity
//     equation stays in possum). POSSUM over-predicts mortality at the low-risk
//     end, which P-POSSUM corrects -- the pPossum tile reports both for that
//     divergence. Each probability is computed in odds space from a logit clamped
//     to [-40, 40] so exp() never overflows; a blank required variable surfaces a
//     valid:false fallback, never a probability from NaN. Class A.
//   - sort (Protopapa KL, Simpson JC, Smith NCE, Moonesinghe SR, Br J Surg
//     2014;101:1774-1783, Table 4 verbatim): logit = -7.366 + ASA term + urgency
//     term + 0.712 high-risk-specialty + 0.381 Xmajor/complex + 0.667 cancer +
//     age term; 30-day mortality = 1/(1+e^-logit). The ASA reference is I AND II
//     COMBINED -- there is NO ASA-II coefficient; only ASA III (1.411), IV
//     (2.388), V (4.081) add points. Urgency relative to elective: expedited
//     1.236, urgent 1.657, immediate 2.452. High-risk specialty is a single
//     binary (GI, thoracic, OR vascular), not per-specialty. Severity adds points
//     only for Xmajor/complex (minor/intermediate/major = 0). Age bands are
//     MUTUALLY EXCLUSIVE: 65-79 -> 0.777, >= 80 -> 1.591 (never summed). Class A.
//   - goldmanCardiacRisk (Goldman L, Caldera DL, Nussbaum SR, et al, N Engl J Med
//     1977;297:845-850): nine weighted factors -- S3 gallop/JVD 11, MI within
//     6 months 10, > 5 PVCs/min 7, non-sinus rhythm or PACs 7, age > 70 5,
//     emergency operation 4, intraperitoneal/intrathoracic/aortic operation 3,
//     important aortic stenosis 3, poor general medical status 3 -- summing 0-53.
//     Classes I (0-5), II (6-12), III (13-25), IV (>= 26). The per-class combined
//     major-cardiac-complication-or-death rates (~1% / ~7% / ~14% / ~78%) are the
//     cross-verified figures; the Class IV cardiac-death fraction (~56%) is
//     independently corroborated. Bounded weighted sum -- no logistic. Class A.
//   - wilsonAirway (Wilson ME, Spiegelhalter D, Robertson JA, Lesser P, Br J
//     Anaesth 1988;61:211-216): five anatomic factors -- body weight, head/neck
//     movement, jaw movement, receding mandible, buck teeth -- each 0/1/2, summing
//     0-10. The derivation found a score ABOVE 2 (i.e. >= 3) identified ~75% of
//     difficult laryngoscopies with a 12% false-positive rate; a score of 2 or
//     more is the common sensitive screen (the warn flip used here). Class A.
//   - surgicalRiskScale (Sutton R, Bann S, Brooks M, Sarin S, Br J Surg
//     2002;89:763-768): the sum of CEPOD operative urgency (elective 1, scheduled
//     2, urgent 3, emergency 4), ASA-PS grade (1-5), and BUPA operative-magnitude
//     grade (minor 1, intermediate 2, major 3, major-plus 4, complex-major 5),
//     giving a 3-14 total (the spec draft's "3-17" was corrected to the source
//     value). Higher scores carry a higher in-hospital mortality (Sutton's
//     univariate beta 0.84, P < 0.001); >= 8 is a common high-risk threshold. No
//     mortality probability is shipped -- the only published full equation carries
//     a single-source intercept, which the spec-v97 cross-verification discipline
//     declines to embed. Class A.

import { r1, r2 } from './num.js';

const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';
// Coerce a select value to one of an allowed integer set; blank/invalid -> null.
const pick = (v, allowed) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && allowed.includes(n) ? n : null;
};
// Logistic probability from a logit, clamped so exp() never overflows; computed
// in odds space (odds = e^logit, p = odds/(1+odds)) to avoid the 1-p
// cancellation that drives p === 1 exactly at large logits (the spec-v140 lesson).
const probFromLogit = (logit) => {
  const x = logit > 40 ? 40 : logit < -40 ? -40 : logit;
  const odds = Math.exp(x);
  return odds / (1 + odds);
};

// --- 2.1 / 2.2 POSSUM and P-POSSUM -------------------------------------------
// The 18 shared variables, each mapping its select value (an integer point
// grade) to an allowed set. A value outside the set (or blank) -> null -> the
// compute returns valid:false.
const POSSUM_PHYS = ['age', 'cardiac', 'respiratory', 'sbp', 'pulse', 'gcs', 'hb', 'wcc', 'urea', 'sodium', 'potassium', 'ecg'];
const POSSUM_OP = ['opSeverity', 'procedures', 'bloodLoss', 'soiling', 'malignancy', 'urgency'];
const POSSUM_ALLOWED = {
  age: [1, 2, 4], cardiac: [1, 2, 4, 8], respiratory: [1, 2, 4, 8], sbp: [1, 2, 4, 8],
  pulse: [1, 2, 4, 8], gcs: [1, 2, 4, 8], hb: [1, 2, 4, 8], wcc: [1, 2, 4],
  urea: [1, 2, 4, 8], sodium: [1, 2, 4, 8], potassium: [1, 2, 4, 8], ecg: [1, 4, 8],
  opSeverity: [1, 2, 4, 8], procedures: [1, 4, 8], bloodLoss: [1, 2, 4, 8],
  soiling: [1, 2, 4, 8], malignancy: [1, 2, 4, 8], urgency: [1, 4, 8],
};

// Sum the 12 physiological + 6 operative grades; null if any is blank/invalid.
function possumScores(o) {
  let phys = 0;
  for (const k of POSSUM_PHYS) { const p = pick(o[k], POSSUM_ALLOWED[k]); if (p === null) return null; phys += p; }
  let op = 0;
  for (const k of POSSUM_OP) { const p = pick(o[k], POSSUM_ALLOWED[k]); if (p === null) return null; op += p; }
  return { phys, op };
}

const POSSUM_NOTE = 'POSSUM — Physiological and Operative Severity Score for the enUmeration of Mortality and morbidity (Copeland GP, Jones D, Walters M, Br J Surg 1991). Twelve physiological variables (age, cardiac and respiratory status, systolic blood pressure, pulse, Glasgow Coma Score, haemoglobin, white-cell count, urea, sodium, potassium, ECG) and six operative variables (operative severity, number of procedures, blood loss, peritoneal soiling, malignancy, urgency) are each graded 1, 2, 4, or 8; the physiological score (12–88) and operative score (6–48) drive two logistic equations for predicted 30-day morbidity and mortality. It is the standard UK surgical-audit and benchmarking model. It reports the two scores and the predicted rates; the operative decision stays with the clinician.';
const PPOSSUM_NOTE = 'P-POSSUM — the Portsmouth recalibration of POSSUM (Prytherch DR, Whiteley MS, Higgins B, et al, Br J Surg 1998). It uses the identical 18 POSSUM variables but a recalibrated mortality equation, because the original POSSUM over-predicts mortality at the low-risk end. This tile reports the better-calibrated P-POSSUM mortality alongside the original POSSUM mortality for the same scores, so the low-risk divergence is visible. It reports the predicted mortality; the operative decision stays with the clinician.';

export function possum(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const s = possumScores(o);
  if (!s) return { valid: false, message: 'Select a grade for all 12 physiological and 6 operative variables.' };
  const morbidity = probFromLogit(-5.91 + 0.16 * s.phys + 0.19 * s.op) * 100;
  const mortality = probFromLogit(-7.04 + 0.13 * s.phys + 0.16 * s.op) * 100;
  return {
    valid: true,
    physScore: s.phys,
    opScore: s.op,
    morbidity: r1(morbidity),
    mortality: r1(mortality),
    abnormal: mortality >= 5,
    band: `POSSUM physiological score ${s.phys}, operative score ${s.op}: predicted 30-day morbidity ${r1(morbidity)}%, mortality ${r1(mortality)}%.`,
    note: POSSUM_NOTE,
  };
}

export function pPossum(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const s = possumScores(o);
  if (!s) return { valid: false, message: 'Select a grade for all 12 physiological and 6 operative variables.' };
  const pMort = probFromLogit(-9.065 + 0.1692 * s.phys + 0.1550 * s.op) * 100;
  const origMort = probFromLogit(-7.04 + 0.13 * s.phys + 0.16 * s.op) * 100;
  return {
    valid: true,
    physScore: s.phys,
    opScore: s.op,
    mortality: r1(pMort),
    possumMortality: r1(origMort),
    abnormal: pMort >= 5,
    band: `P-POSSUM physiological score ${s.phys}, operative score ${s.op}: recalibrated predicted mortality ${r1(pMort)}% (original POSSUM equation ${r1(origMort)}%).`,
    note: PPOSSUM_NOTE,
  };
}

// --- 2.3 SORT ----------------------------------------------------------------
const SORT_ASA = { 1: 0, 2: 0, 3: 1.411, 4: 2.388, 5: 4.081 }; // ASA I & II = reference
const SORT_URG = { elective: 0, expedited: 1.236, urgent: 1.657, immediate: 2.452 };
const SORT_AGE = { under65: 0, '65to79': 0.777, '80plus': 1.591 };
const SORT_NOTE = 'SORT — Surgical Outcome Risk Tool (Protopapa KL, Simpson JC, Smith NCE, Moonesinghe SR, Br J Surg 2014). A six-preoperative-variable logistic model estimates 30-day mortality from ASA-PS grade, the urgency of surgery, whether the surgical specialty is high-risk (gastrointestinal, thoracic, or vascular), high surgical severity, an active or recent cancer, and age. It is the modern bedside companion to P-POSSUM and needs no intraoperative data. It reports the predicted mortality; the operative decision stays with the clinician.';

export function sort(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const asa = pick(o.asa, [1, 2, 3, 4, 5]);
  if (asa === null) return { valid: false, message: 'Choose the ASA physical-status grade.' };
  if (!(o.urgency in SORT_URG)) return { valid: false, message: 'Choose the urgency of surgery.' };
  if (!(o.age in SORT_AGE)) return { valid: false, message: 'Choose the age band.' };
  const logit = -7.366
    + SORT_ASA[asa]
    + SORT_URG[o.urgency]
    + (onFlag(o.highRisk) ? 0.712 : 0)
    + (onFlag(o.severity) ? 0.381 : 0)
    + (onFlag(o.cancer) ? 0.667 : 0)
    + SORT_AGE[o.age];
  const mortality = probFromLogit(logit) * 100;
  return {
    valid: true,
    mortality: r2(mortality),
    abnormal: mortality >= 5,
    band: `SORT predicted 30-day mortality ${r2(mortality)}%.`,
    note: SORT_NOTE,
  };
}

// --- 2.4 Goldman cardiac risk index ------------------------------------------
const GOLDMAN = [
  ['s3jvd', 11, 'third heart sound or jugular venous distension'],
  ['mi6mo', 10, 'myocardial infarction within 6 months'],
  ['pvc', 7, '> 5 premature ventricular contractions per minute'],
  ['nonsinus', 7, 'rhythm other than sinus, or premature atrial contractions'],
  ['age70', 5, 'age over 70 years'],
  ['emergency', 4, 'emergency operation'],
  ['intraop', 3, 'intraperitoneal, intrathoracic, or aortic operation'],
  ['aorticstenosis', 3, 'important aortic stenosis'],
  ['poorstatus', 3, 'poor general medical status'],
];
const GOLDMAN_CLASS = [
  { max: 5, cls: 'I', rate: 'about 1% major cardiac complications or death' },
  { max: 12, cls: 'II', rate: 'about 7% major cardiac complications or death' },
  { max: 25, cls: 'III', rate: 'about 14% major cardiac complications or death' },
  { max: 53, cls: 'IV', rate: 'about 78% major cardiac complications or death (about 56% cardiac death)' },
];
const GOLDMAN_NOTE = 'Goldman Cardiac Risk Index (Goldman L, Caldera DL, Nussbaum SR, et al, N Engl J Med 1977) — the original multifactorial index of cardiac risk in noncardiac surgery and the ancestor of the Revised Cardiac Risk Index. Nine weighted clinical factors sum to 0–53 and map to Class I–IV with the source’s per-class cardiac-complication rate. It reports the points, class, and the cited rate; the perioperative-management decision stays with the clinician.';

export function goldmanCardiacRisk(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let total = 0;
  const counted = [];
  for (const [key, weight, label] of GOLDMAN) {
    if (onFlag(o[key])) { total += weight; counted.push(label); }
  }
  const c = GOLDMAN_CLASS.find((b) => total <= b.max);
  return {
    valid: true,
    score: total,
    class: c.cls,
    abnormal: total >= 13,
    counted,
    band: `Goldman ${total} points (0–53): Class ${c.cls} — ${c.rate}.`,
    note: GOLDMAN_NOTE,
  };
}

// --- 2.5 Wilson Risk Sum Score -----------------------------------------------
const WILSON = ['weight', 'headneck', 'jaw', 'mandible', 'teeth'];
const WILSON_NOTE = 'Wilson Risk Sum Score (Wilson ME, Spiegelhalter D, Robertson JA, Lesser P, Br J Anaesth 1988) — an anatomic difficult-intubation predictor distinct from the El-Ganzouri index. Five factors (body weight, head and neck movement, jaw movement, a receding mandible, and buck teeth) are each scored 0, 1, or 2 and summed to 0–10. In the derivation a score above 2 identified about 75% of difficult laryngoscopies (with a 12% false-positive rate); a score of 2 or more is the common sensitive screen. It reports the sum and that threshold; the airway plan stays with the anesthetist.';

export function wilsonAirway(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let sum = 0;
  for (const k of WILSON) {
    const n = pick(o[k], [0, 1, 2]);
    sum += n === null ? 0 : n;
  }
  const flag = sum >= 2;
  const phrase = sum > 2
    ? 'above the score-above-2 threshold that identified ~75% of difficult intubations in the derivation cohort'
    : sum === 2
      ? 'at the 2-point level — at or above the common sensitive screen (the derivation optimum was a score above 2)'
      : 'below the difficult-intubation threshold';
  return {
    valid: true,
    score: sum,
    abnormal: flag,
    band: `Wilson Risk Sum ${sum}/10: ${phrase}.`,
    note: WILSON_NOTE,
  };
}

// --- 2.6 Surgical Risk Scale -------------------------------------------------
const SRS_NOTE = 'Surgical Risk Scale (Sutton R, Bann S, Brooks M, Sarin S, Br J Surg 2002) — a three-line risk-adjusted-audit score: CEPOD operative urgency (elective 1 to emergency 4) plus ASA-PS grade (1–5) plus BUPA operative-magnitude grade (minor 1 to complex-major 5), summing to 3–14. Higher scores carry a higher in-hospital mortality; a score of 8 or more is a common high-risk threshold. It reports the summed score and that framing; the operative decision stays with the clinician.';

export function surgicalRiskScale(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const cepod = pick(o.cepod, [1, 2, 3, 4]);
  const asa = pick(o.asa, [1, 2, 3, 4, 5]);
  const bupa = pick(o.bupa, [1, 2, 3, 4, 5]);
  if (cepod === null || asa === null || bupa === null) {
    return { valid: false, message: 'Choose the CEPOD urgency, ASA grade, and BUPA operative-magnitude grade.' };
  }
  const score = cepod + asa + bupa;
  return {
    valid: true,
    score,
    cepod,
    asa,
    bupa,
    abnormal: score >= 8,
    band: `Surgical Risk Scale ${score} (CEPOD ${cepod} + ASA ${asa} + BUPA ${bupa}): higher scores carry a higher in-hospital mortality; a score of 8 or more is a common high-risk threshold.`,
    note: SRS_NOTE,
  };
}
