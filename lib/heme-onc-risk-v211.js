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
