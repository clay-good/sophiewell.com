// spec-v210: ischemic-stroke & intracerebral-hemorrhage prognosis instruments
// (Advanced Prognostic & Risk-Equation Instruments program, spec-v209 §1.1).
// Every id was verified absent by a direct scan of app.js first (spec-v85 §6.2).
// None duplicates a live tile; v210 runs no AI and makes no runtime network call.
// These prognosticate — they are NOT a thrombolysis, thrombectomy, or
// withdrawal-of-care order (spec-v11 §5.3), and must not justify early care
// limitation. Shipped one tile at a time per an active /goal.
//
//   spanScore  - SPAN-100 index (age + NIHSS stroke prognostication)
//   astral     - ASTRAL score (3-month unfavorable-outcome probability)
//   planScore  - PLAN score (death / severe disability after ischemic stroke)
//
// The proposed `func-score` tile is NOT built here: it is already live (shipped
// by spec-v206, lib/tbi-stroke-v206.js) — the spec-v85 §6.2 collision re-check
// found it, so v210 does not duplicate it. The proposed `iscore` tile remains
// deferred (its score→mortality mapping is available only through the sorcan.ca
// web tool, not as an open formula — the spec-v97 deferral taken at spec-v206).
//
// WEIGHTS / THRESHOLDS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified
// across >= 2 independent open sources at implementation:
//   - SPAN-100 index (Saposnik G, Guzik AK, Reeves M, Ovbiagele B, Johnston SC,
//     Neurology 2013;80(1):21-28): SPAN-100 = age (years) + NIHSS, dichotomized
//     at 100 — SPAN-100 positive when ≥ 100. Positive patients have substantially
//     higher mortality/disability and lower rates of favorable 3-month outcome
//     (favorable composite ~5.6% vs ~55.4% in the NINDS-tPA derivation).

import { num } from './num.js';

function inRange(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}

// --- 2.3 SPAN-100 index -----------------------------------------------------
const SPAN_NOTE = 'SPAN-100 index (Saposnik G, Guzik AK, Reeves M, Ovbiagele B, Johnston SC, Neurology 2013;80(1):21-28): the simplest validated age-plus-severity stroke-prognostic index — SPAN-100 = age (years) + NIHSS, dichotomized at 100. SPAN-100 positive (≥ 100) patients have substantially higher mortality and disability and much lower rates of favorable 3-month outcome (≈ 5.6% vs ≈ 55.4% in the NINDS-tPA derivation). A prognostic index for counseling — not a treatment-eligibility rule, and it must not justify early care limitation.';

export function spanScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = inRange(o.age, 0, 120);
  const nihss = inRange(o.nihss, 0, 42);
  if (age === null || nihss === null) {
    return { valid: false, message: 'Enter age (years) and NIHSS (0–42).' };
  }
  const index = num('SPAN-100', age + nihss, { min: 0, max: 162 });
  const positive = index >= 100;
  return {
    valid: true,
    score: index,
    positive,
    abnormal: positive,
    bandLabel: `SPAN-100 ${index}`,
    band: positive
      ? `SPAN-100 index ${index} — SPAN-100 positive (≥ 100): substantially worse prognosis (much lower favorable-outcome rate).`
      : `SPAN-100 index ${index} — SPAN-100 negative (< 100): more favorable prognosis.`,
    detail: `Age ${age} + NIHSS ${nihss} = ${index}.`,
    note: SPAN_NOTE,
  };
}
