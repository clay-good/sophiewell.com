// spec-v205: pulmonology, COPD & sleep severity instruments (Frontline &
// Bedside Decision Instruments program, spec-v204 §1.1). Every id was verified
// absent by a direct scan of app.js first (spec-v85 §6.2). None duplicates a
// live tile; v205 runs no AI and makes no runtime network call. These stratify
// and screen — they are NOT a pleurodesis, inhaler, oxygen, or polysomnography
// order (spec-v11 §5.3). Shipped one tile at a time per an active /goal.
//
//   cat          - COPD Assessment Test (0-40 health-status impact)
//   lent         - LENT prognostic score (malignant pleural effusion)
//   adoIndex     - ADO index (COPD 3-year mortality)
//   doseIndex    - DOSE index (COPD severity)
//   sacsOsa      - Sleep Apnea Clinical Score (Flemons)
//
// POINT WEIGHTS / THRESHOLDS RE-FETCHED, NEVER RECALLED (spec-v97), each
// cross-verified across >= 2 independent open sources at implementation:
//   - CAT (Jones PW, et al, Eur Respir J 2009;34(3):648-654): eight patient-
//     completed semantic-differential items — cough, phlegm, chest tightness,
//     breathlessness on hills/stairs, activity limitation at home, confidence
//     leaving home, sleep, and energy — each scored 0-5; total 0-40. Impact
//     bands (Jones / GOLD, corroborated across Healthline, GPnotebook, and the
//     PMC primary-care evaluation): low < 10, medium 10-20, high 21-30, very
//     high > 30. GOLD uses >= 10 as the "more symptoms" threshold; the MCID is
//     ~2 points.

import { num } from './num.js';

function intIn(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}

// --- 2.4 COPD Assessment Test -----------------------------------------------
const CAT_ITEMS = [
  ['cough', 'Cough'],
  ['phlegm', 'Phlegm'],
  ['chest', 'Chest tightness'],
  ['breathless', 'Breathlessness on hills/stairs'],
  ['activity', 'Activity limitation at home'],
  ['confidence', 'Confidence leaving home'],
  ['sleep', 'Sleep'],
  ['energy', 'Energy'],
];
const CAT_NOTE = 'COPD Assessment Test (Jones PW, et al, Eur Respir J 2009;34(3):648-654): eight patient-completed items — cough, phlegm, chest tightness, breathlessness on hills/stairs, activity limitation at home, confidence leaving home, sleep, and energy — each 0-5; total 0-40. Impact bands: low < 10, medium 10-20, high 21-30, very high > 30. GOLD uses ≥ 10 as the "more symptoms" threshold (drives ABE group assignment); the minimal clinically important difference is ~2 points. A patient-reported health-status instrument, not a treatment order.';

export function cat(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const vals = {};
  for (const [key] of CAT_ITEMS) {
    const v = intIn(o[key], 0, 5);
    if (v === null) {
      return { valid: false, message: 'Score all eight CAT items 0–5 (cough, phlegm, chest tightness, breathlessness, activity limitation, confidence leaving home, sleep, energy).' };
    }
    vals[key] = v;
  }
  let total = 0;
  for (const [key] of CAT_ITEMS) total += vals[key];
  total = num('CAT', total, { min: 0, max: 40 });
  let tier; const abnormal = total >= 10;
  if (total < 10) tier = 'low impact (< 10)';
  else if (total <= 20) tier = 'medium impact (10–20)';
  else if (total <= 30) tier = 'high impact (21–30)';
  else tier = 'very high impact (> 30)';
  const top = CAT_ITEMS.map(([k, label]) => [label, vals[k]]).filter((p) => p[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 3).map((p) => `${p[0]} (${p[1]})`);
  return {
    valid: true,
    score: total,
    abnormal,
    bandLabel: `CAT ${total}`,
    band: `CAT ${total}/40 — ${tier}${total >= 10 ? '; at or above the GOLD ≥ 10 "more symptoms" threshold' : ''}.`,
    detail: top.length ? `Highest-scoring items: ${top.join('; ')}.` : 'All items scored 0 — no symptom burden.',
    note: CAT_NOTE,
  };
}
