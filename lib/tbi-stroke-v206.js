// spec-v206: traumatic brain injury & stroke prognosis instruments (Frontline &
// Bedside Decision Instruments program, spec-v204 §1.1). Every id was verified
// absent by a direct scan of app.js first (spec-v85 §6.2). None duplicates a
// live tile; v206 runs no AI and makes no runtime network call. These prognosticate
// and stratify — they are NOT a neurosurgical, thrombolysis, anticoagulation, or
// withdrawal-of-care order (spec-v11 §5.3). Shipped one tile at a time per an
// active /goal.
//
//   essenStroke  - Essen Stroke Risk Score (recurrent vascular events)
//   rotterdamCt  - Rotterdam CT score (traumatic brain injury)
//   marshallCt   - Marshall CT classification (traumatic brain injury)
//   funcScore    - FUNC score (functional outcome after ICH)
//   iscore       - iScore (ischemic-stroke mortality)
//
// POINT WEIGHTS / THRESHOLDS RE-FETCHED, NEVER RECALLED (spec-v97), each
// cross-verified across >= 2 independent open sources at implementation:
//   - Essen Stroke Risk Score (Weimar C, Diener HC, Alberts MJ, et al, Stroke
//     2009;40(2):350-354): eight items — age (< 65 → 0, 65-75 → 1, > 75 → 2),
//     arterial hypertension, diabetes mellitus, prior myocardial infarction,
//     other cardiovascular disease (except MI and atrial fibrillation),
//     peripheral arterial disease, current/ever smoking, and an additional prior
//     TIA / ischemic stroke beyond the qualifying event, each +1. Total 0-9. Low
//     risk < 3, high risk ≥ 3 (annual recurrent-stroke risk > 4% at ≥ 3).

import { num } from './num.js';

function numIn(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}
function bool(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'yes'; }

// --- 2.5 Essen Stroke Risk Score --------------------------------------------
const ESSEN_ITEMS = [
  ['hypertension', 'Hypertension'],
  ['diabetes', 'Diabetes mellitus'],
  ['priorMi', 'Prior myocardial infarction'],
  ['otherCvd', 'Other CVD (except MI / AF)'],
  ['pad', 'Peripheral arterial disease'],
  ['smoker', 'Current / ever smoker'],
  ['priorStroke', 'Additional prior TIA / ischemic stroke'],
];
const ESSEN_NOTE = 'Essen Stroke Risk Score (Weimar C, Diener HC, Alberts MJ, et al, Stroke 2009;40(2):350-354): a simple bedside score for the risk of recurrent vascular events after ischemic stroke / TIA. Age (< 65 → 0, 65-75 → 1, > 75 → 2) plus one point each for hypertension, diabetes, prior MI, other CVD (except MI/AF), peripheral arterial disease, current/ever smoking, and an additional prior TIA/ischemic stroke; total 0-9. Low risk < 3, high risk ≥ 3 (annual recurrent-stroke risk > 4% at ≥ 3). A stratifier for secondary-prevention intensity, not a treatment order.';

export function essenStroke(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = numIn(o.age, 0, 120);
  if (age === null) {
    return { valid: false, message: 'Enter age (years) and set the vascular risk factors.' };
  }
  const agePts = age > 75 ? 2 : age >= 65 ? 1 : 0;
  const active = [];
  if (agePts) active.push(`Age ${age > 75 ? '> 75' : '65–75'} (+${agePts})`);
  let total = agePts;
  for (const [key, label] of ESSEN_ITEMS) {
    if (bool(o[key])) { total += 1; active.push(`${label} (+1)`); }
  }
  total = num('Essen', total, { min: 0, max: 9 });
  const abnormal = total >= 3;
  return {
    valid: true,
    score: total,
    abnormal,
    bandLabel: `Essen ${total}`,
    band: `Essen ${total}/9 — ${abnormal ? 'high risk of recurrent stroke (≥ 3; annual recurrence > 4%)' : 'low risk of recurrent stroke (< 3)'}.`,
    detail: active.length ? `Contributors: ${active.join('; ')}.` : 'No risk factors scored — Essen 0.',
    note: ESSEN_NOTE,
  };
}
