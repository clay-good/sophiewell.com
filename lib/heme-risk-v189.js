// spec-v189: four deterministic prognostic / suitability instruments (third and
// closing feature spec of the Subspecialty Oncology & Hematology Staging
// program, extending into anticoagulation and comorbidity burden). Every id was
// verified absent by a direct scan of app.js first (spec-v85 §6.2). None
// duplicates a live tile; v189 runs no AI and makes no runtime network call.
// These stratify risk and predict suitability — they are not treatment,
// thromboprophylaxis, or anticoagulation orders (spec-v11 §5.3).
//
//   msmart       - mSMART myeloma cytogenetic risk stratification
//   impedeVte    - IMPEDE VTE score (myeloma thromboprophylaxis risk)
//   sameTt2r2    - SAMe-TT2R2 (VKA anticoagulation-control prediction)
//   elixhauser   - Elixhauser comorbidity index (van Walraven 2009 weighting)
//
// NOTE: the fifth proposed tile (BVAS v3, spec-v189 §2.3) is DEFERRED. A faithful
// BVAS requires item-level new/worse-vs-persistent scoring of ~56 weighted items
// across 9 organ systems; any organ-system approximation would misreport the
// total and fail the spec-v97 fidelity bar. Recorded in docs/scope-post-parity.md.
//
// WEIGHTS / CUT-POINTS RE-FETCHED, NEVER RECALLED (spec-v97), each cross-verified
// across >= 2 independent sources at implementation:
//   - msmart (Mikhael JR, et al, Mayo Clin Proc 2013;88(4):360-376; mSMART 3.0):
//     high-risk if any of t(4;14), t(14;16), t(14;20), del(17p)/p53, gain(1q)/
//     del(1p), high plasma-cell S-phase, R-ISS III / high LDH is present; two such
//     features = "double hit", three or more = "triple hit". Standard risk if none.
//   - impedeVte (Sanfilippo KM, et al, Am J Hematol 2019;94(11):1176-1184):
//     IMiD +4, BMI >= 25 +1, pelvic/hip/femur fracture +4, ESA +1, dexamethasone
//     high-dose +4 / low-dose +2, doxorubicin +3, Asian ethnicity -3, VTE history
//     +5, tunneled line/CVC +2, thromboprophylaxis therapeutic anticoag -4 /
//     aspirin -3. Bands: <= 3 low, 4-7 intermediate, >= 8 high.
//   - sameTt2r2 (Apostolakis S, et al, Chest 2013;144(5):1555-1563): Sex female
//     +1, Age < 60 +1, Medical history (>= 2 comorbidities) +1, Treatment
//     (interacting drugs) +1, Tobacco (within 2 y) +2, Race (non-white) +2. Score
//     0-1 predicts good INR control on a VKA; >= 2 predicts poorer control.
//   - elixhauser (van Walraven C, et al, Med Care 2009;47(6):626-633): the
//     original van Walraven weighting of the 30-condition Elixhauser set (range
//     -7 to +12; 9 conditions weight 0). Cross-verified against the R `comorbidity`
//     package "vw" weights and the umanitoba MCHP concept documentation.

import { r1 } from './num.js';

function pos(v, max = Infinity) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0 || n > max) return null;
  return n;
}
function truthy(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'on' || v === 'yes'; }
function cap(s) { return s.replace(/^./, (m) => m.toUpperCase()); }

// --- 2.1 mSMART -------------------------------------------------------------
const MSMART_NOTE = 'mSMART myeloma risk stratification (Mikhael JR, et al, Mayo Clin Proc 2013;88(4):360-376; Mayo Stratification, updated 3.0). High-risk if any high-risk feature is present: t(4;14), t(14;16), t(14;20), del(17p)/p53, gain(1q)/del(1p), high plasma-cell S-phase, or R-ISS III / high LDH. Two high-risk genetic abnormalities are termed "double hit", three or more "triple hit". Standard risk when none is present. A risk stratification, not a treatment order.';
const MSMART_ITEMS = [
  { key: 't414', label: 't(4;14)' },
  { key: 't1416', label: 't(14;16)' },
  { key: 't1420', label: 't(14;20)' },
  { key: 'del17p', label: 'del(17p) / p53' },
  { key: 'gain1q', label: 'gain(1q) / del(1p)' },
  { key: 'sphase', label: 'high plasma-cell S-phase' },
  { key: 'rissIII', label: 'R-ISS III / high LDH' },
];

export function msmart(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const present = MSMART_ITEMS.filter((it) => truthy(o[it.key])).map((it) => it.label);
  const n = present.length;
  const highRisk = n >= 1;
  const hit = n >= 3 ? ' (triple hit)' : n === 2 ? ' (double hit)' : '';
  const group = highRisk ? 'high risk' : 'standard risk';
  return {
    valid: true,
    highRisk,
    features: n,
    abnormal: highRisk,
    bandLabel: cap(group),
    band: `mSMART ${group}${hit} — ${n} high-risk feature${n === 1 ? '' : 's'}.`,
    detail: present.length ? `Present: ${present.join(', ')}.` : 'No high-risk features entered; standard risk.',
    note: MSMART_NOTE,
  };
}

// --- 2.2 IMPEDE VTE ---------------------------------------------------------
const IMPEDE_NOTE = 'IMPEDE VTE score for venous thromboembolism risk in multiple myeloma (Sanfilippo KM, et al, Am J Hematol 2019;94(11):1176-1184). Weights: immunomodulatory agent +4, BMI >= 25 +1, pelvic/hip/femur fracture +4, erythropoietin-stimulating agent +1, dexamethasone high-dose +4 or low-dose +2, doxorubicin +3, Asian ethnicity -3, prior VTE +5, tunneled line/central catheter +2, existing thromboprophylaxis therapeutic anticoagulation -4 or aspirin -3. Bands: <= 3 low, 4-7 intermediate, >= 8 high. Risk stratification for a thromboprophylaxis discussion, not an order.';
const IMPEDE_BINARY = [
  { key: 'imid', pts: 4, label: 'immunomodulatory agent (+4)' },
  { key: 'bmi25', pts: 1, label: 'BMI ≥ 25 (+1)' },
  { key: 'fracture', pts: 4, label: 'pelvic/hip/femur fracture (+4)' },
  { key: 'esa', pts: 1, label: 'erythropoietin-stimulating agent (+1)' },
  { key: 'doxorubicin', pts: 3, label: 'doxorubicin (+3)' },
  { key: 'asian', pts: -3, label: 'Asian ethnicity (−3)' },
  { key: 'vteHistory', pts: 5, label: 'prior VTE (+5)' },
  { key: 'tunneledLine', pts: 2, label: 'tunneled line / CVC (+2)' },
];
const DEX_PTS = { none: 0, low: 2, high: 4 };
const DEX_LABEL = { low: 'low-dose dexamethasone (+2)', high: 'high-dose dexamethasone (+4)' };
const PROPH_PTS = { none: 0, aspirin: -3, therapeutic: -4 };
const PROPH_LABEL = { aspirin: 'aspirin prophylaxis (−3)', therapeutic: 'therapeutic anticoagulation (−4)' };

export function impedeVte(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const parts = [];
  let score = 0;
  for (const it of IMPEDE_BINARY) {
    if (truthy(o[it.key])) { score += it.pts; parts.push(it.label); }
  }
  const dex = Object.prototype.hasOwnProperty.call(DEX_PTS, String(o.dexamethasone)) ? String(o.dexamethasone) : 'none';
  if (dex !== 'none') { score += DEX_PTS[dex]; parts.push(DEX_LABEL[dex]); }
  const proph = Object.prototype.hasOwnProperty.call(PROPH_PTS, String(o.thromboprophylaxis)) ? String(o.thromboprophylaxis) : 'none';
  if (proph !== 'none') { score += PROPH_PTS[proph]; parts.push(PROPH_LABEL[proph]); }
  const risk = score <= 3 ? 'low' : score <= 7 ? 'intermediate' : 'high';
  return {
    valid: true,
    score,
    risk,
    abnormal: score >= 4,
    bandLabel: `IMPEDE ${cap(risk)} risk`,
    band: `IMPEDE VTE ${score} — ${risk} VTE risk.`,
    detail: parts.length ? `Contributors: ${parts.join(', ')}.` : 'No listed factors present.',
    note: IMPEDE_NOTE,
  };
}

// --- 2.3 SAMe-TT2R2 ---------------------------------------------------------
const SAME_NOTE = 'SAMe-TT2R2 score predicting quality of INR control on a vitamin-K antagonist (Apostolakis S, et al, Chest 2013;144(5):1555-1563). Sex (female) +1, Age < 60 +1, Medical history (≥ 2 of hypertension, diabetes, coronary/MI, peripheral arterial disease, heart failure, prior stroke, pulmonary, hepatic or renal disease) +1, Treatment with interacting drugs (e.g. amiodarone) +1, Tobacco use within 2 years +2, Race (non-white) +2. Score 0–1 predicts good anticoagulation control on a VKA; ≥ 2 predicts poorer control (favoring a DOAC or closer monitoring). A VKA-suitability aid, not an order.';
const SAME_ITEMS = [
  { key: 'female', pts: 1, label: 'female sex (+1)' },
  { key: 'ageUnder60', pts: 1, label: 'age < 60 (+1)' },
  { key: 'medicalHistory', pts: 1, label: '≥ 2 comorbidities (+1)' },
  { key: 'interactingDrugs', pts: 1, label: 'interacting drugs (+1)' },
  { key: 'tobacco', pts: 2, label: 'tobacco within 2 y (+2)' },
  { key: 'nonWhite', pts: 2, label: 'non-white race (+2)' },
];

export function sameTt2r2(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let score = 0; const parts = [];
  for (const it of SAME_ITEMS) if (truthy(o[it.key])) { score += it.pts; parts.push(it.label); }
  const good = score <= 1;
  const call = good ? 'good VKA control likely' : 'poorer VKA control predicted';
  return {
    valid: true,
    score,
    good,
    abnormal: !good,
    bandLabel: good ? 'Good control likely' : 'Poorer control',
    band: `SAMe-TT2R2 ${score} — ${call}.`,
    detail: `${parts.length ? `Contributors: ${parts.join(', ')}. ` : 'No factors present. '}Score 0–1 favors a VKA; ≥ 2 favors a DOAC or closer INR monitoring.`,
    note: SAME_NOTE,
  };
}

// --- 2.4 Elixhauser (van Walraven weighting) --------------------------------
const ELIX_NOTE = 'Elixhauser comorbidity index with the van Walraven weighting (Elixhauser A, et al, Med Care 1998;36(1):8-27; weights: van Walraven C, et al, Med Care 2009;47(6):626-633). Each present comorbidity contributes its signed van Walraven weight (range −7 to +12; nine conditions weight 0); a higher total predicts higher in-hospital mortality. A complement to the live Charlson index. A comorbidity summary, not a treatment order.';
// Original van Walraven 2009 weights (Med Care 2009;47(6):626-633).
const ELIX_ITEMS = [
  { key: 'chf', w: 7, label: 'congestive heart failure' },
  { key: 'arrhythmia', w: 5, label: 'cardiac arrhythmias' },
  { key: 'valvular', w: -1, label: 'valvular disease' },
  { key: 'pulmCirc', w: 4, label: 'pulmonary circulation disorders' },
  { key: 'pvd', w: 2, label: 'peripheral vascular disorders' },
  { key: 'hypertension', w: 0, label: 'hypertension' },
  { key: 'paralysis', w: 7, label: 'paralysis' },
  { key: 'neuro', w: 6, label: 'other neurological disorders' },
  { key: 'chronicPulm', w: 3, label: 'chronic pulmonary disease' },
  { key: 'diabetes', w: 0, label: 'diabetes (± complications)' },
  { key: 'hypothyroid', w: 0, label: 'hypothyroidism' },
  { key: 'renal', w: 5, label: 'renal failure' },
  { key: 'liver', w: 11, label: 'liver disease' },
  { key: 'pud', w: 0, label: 'peptic ulcer disease' },
  { key: 'hiv', w: 0, label: 'AIDS / HIV' },
  { key: 'lymphoma', w: 9, label: 'lymphoma' },
  { key: 'metastatic', w: 12, label: 'metastatic cancer' },
  { key: 'solidTumor', w: 4, label: 'solid tumor without metastasis' },
  { key: 'rheum', w: 0, label: 'rheumatoid arthritis / collagen vascular' },
  { key: 'coagulopathy', w: 3, label: 'coagulopathy' },
  { key: 'obesity', w: -4, label: 'obesity' },
  { key: 'weightLoss', w: 6, label: 'weight loss' },
  { key: 'fluidLyte', w: 5, label: 'fluid and electrolyte disorders' },
  { key: 'bloodLossAnemia', w: -2, label: 'blood-loss anemia' },
  { key: 'deficiencyAnemia', w: -2, label: 'deficiency anemia' },
  { key: 'alcohol', w: 0, label: 'alcohol abuse' },
  { key: 'drugAbuse', w: -7, label: 'drug abuse' },
  { key: 'psychoses', w: 0, label: 'psychoses' },
  { key: 'depression', w: -3, label: 'depression' },
];

export function elixhauser(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let score = 0; let count = 0;
  const present = [];
  for (const it of ELIX_ITEMS) {
    if (truthy(o[it.key])) { score += it.w; count += 1; if (it.w !== 0) present.push(`${it.label} (${it.w > 0 ? '+' : ''}${it.w})`); }
  }
  const direction = score > 0 ? 'higher predicted mortality' : score < 0 ? 'lower predicted mortality than baseline' : 'no net weighted burden';
  return {
    valid: true,
    score,
    count,
    abnormal: score > 0,
    bandLabel: `van Walraven ${score}`,
    band: `Elixhauser / van Walraven score ${score} across ${count} condition${count === 1 ? '' : 's'} — ${direction}.`,
    detail: present.length ? `Weighted contributors: ${present.join(', ')}.` : `${count} condition${count === 1 ? '' : 's'} selected; none carries a non-zero van Walraven weight.`,
    note: ELIX_NOTE,
  };
}
