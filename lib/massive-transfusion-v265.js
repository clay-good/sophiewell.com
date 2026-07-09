// spec-v265: massive-transfusion prediction at the trauma bay. Second feature spec of the
// Advanced Sub-specialty Prognostic Instruments program. Each id was verified absent by a
// fixed-string scan of the extracted app.js id/name lists first (spec-v85 §6.2). v265 runs
// no AI and makes no runtime network call.
//
// These compute a trigger category — none is a transfusion, protocol-activation, or
// blood-product order (spec-v11 §5.3). The decision to activate the MTP stays with the
// trauma team.
//
//   abc-transfusion-score  - Assessment of Blood Consumption (ABC) score (0-4, >= 2 predicts MT)
//
// SHIPPED THIS SLICE: abc-transfusion-score only.
//
// PARKED (spec-v265 §7 / spec-v97 / spec-v259 precedent): the McLaughlin score and the
// Prince of Wales Hospital (PWH) score. Their exact values cannot be reproduced from >= 2
// open, fetchable sources in-session: the McLaughlin logistic intercept sign is dropped in
// the reachable secondary renders (printed as +1.576, which yields an implausible ~83%
// baseline; the true value is almost certainly -1.576) and its count-to-probability table
// lives only in the paywalled primary (McLaughlin 2008 J Trauma); the PWH per-variable
// point weights live only in the paywalled primary (Rainer 2011 Resuscitation) — open
// validations confirm the seven variables and the >= 2.5 cutoff but decline the weights.
// Re-open when the McLaughlin count-to-probability table and the PWH weight table are
// reproducible from >= 2 open, fetchable sources, or are supplied directly.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified at implementation:
//   ABC - Nunez TC et al., J Trauma 2009;66(2):346-352 (PMID 19204506); four non-weighted
//         binary items, >= 2 predicts massive transfusion (~75% sensitivity / ~86%
//         specificity in the derivation cohort).

const ABC_NOTE = 'Assessment of Blood Consumption (ABC) score (Nunez 2009): the fastest bedside massive-transfusion-protocol trigger, computable before any laboratory value returns. Four non-weighted binary items, +1 each: penetrating mechanism of injury, systolic BP <= 90 mmHg on ED arrival, heart rate >= 120 bpm on ED arrival, and a positive FAST (Focused Assessment with Sonography for Trauma). Total 0-4. >= 2 predicts massive transfusion (~75% sensitivity / ~86% specificity in the derivation cohort). A trigger category, not a transfusion order.';
export function abcTransfusion(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let total = 0;
  const fired = [];
  const boxes = [
    [o.penetrating, 'penetrating mechanism (+1)', 1],
    [o.sbp90, 'systolic BP <= 90 mmHg (+1)', 1],
    [o.hr120, 'heart rate >= 120 bpm (+1)', 1],
    [o.positiveFast, 'positive FAST (+1)', 1],
  ];
  for (const [on, label, pts] of boxes) { if (on === true) { total += pts; fired.push(label); } }
  const predicts = total >= 2;
  return { valid: true, score: total, abnormal: predicts, bandLabel: `ABC ${total}`,
    band: `ABC ${total} of 4 — ${predicts ? 'predicts massive transfusion (>= 2)' : 'does not predict massive transfusion (< 2)'}.`,
    detail: `Positive: ${fired.length ? fired.join(', ') : 'no items positive'}.`, note: ABC_NOTE };
}
