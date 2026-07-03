// spec-v212: hepatology fibrosis & portal-hypertension prognosis (Advanced
// Prognostic & Risk-Equation Instruments program, spec-v209 §1.1). Every id was
// verified absent by a direct scan of app.js first (spec-v85 §6.2). None
// duplicates a live tile; v212 runs no AI and makes no runtime network call.
// These stratify fibrosis / cirrhosis / portal-hypertension probability — they
// are NOT a biopsy, endoscopy, or treatment order (spec-v11 §5.3). Shipped one
// tile at a time per an active /goal.
//
//   kingScore  - King's Score (non-invasive marker of cirrhosis)
//
// The proposed `hepamet-fibrosis` tile is NOT built here: it is already live
// (shipped by spec-v201) — the spec-v85 §6.2 collision re-check found it, so v212
// does not duplicate it.
//
// COEFFICIENTS / CUT-POINTS RE-FETCHED, NEVER RECALLED (spec-v97), each
// cross-verified across >= 2 independent open sources at implementation.

import { num, r1 } from './num.js';

function pos(v, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0 || n > hi) return null;
  return n;
}

// --- 2.3 King's Score -------------------------------------------------------
// FORMULA / CUT-POINTS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified
// against the derivation paper (Cross TJS, Rizzi P, Berry PA, et al, Eur J
// Gastroenterol Hepatol 2009;21(7):730-738) and independent validation
// (PMC3741695): King's Score = (age × AST × INR) / platelets (×10⁹/L). A score
// ≥ 16.7 predicted cirrhosis (sensitivity 86%, specificity 80%, NPV 96%); a
// score ≥ 12.3 predicted significant fibrosis F3-6 (odds ratio 33.9). So < 12.3
// is a rule-out band, 12.3-16.7 an intermediate (significant-fibrosis-likely)
// band, and ≥ 16.7 the cirrhosis rule-in band.
const KING_NOTE = 'King’s Score (Cross TJS, Rizzi P, Berry PA, et al, Eur J Gastroenterol Hepatol 2009;21(7):730-738): a simple four-variable non-invasive marker of cirrhosis in chronic hepatitis C — King’s Score = (age × AST × INR) / platelets (×10⁹/L). A score ≥ 16.7 predicted cirrhosis (sensitivity 86%, specificity 80%, negative predictive value 96%); a score ≥ 12.3 predicted significant fibrosis (F3-6). Used alongside FIB-4 and APRI — a non-invasive fibrosis marker, not a biopsy order.';

export function kingScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = pos(o.age, 130);
  const ast = pos(o.ast, 20000);
  const inr = pos(o.inr, 20);
  const plt = pos(o.platelets, 2000);
  if (age === null || ast === null || inr === null || plt === null) {
    return { valid: false, message: 'Enter age (years), AST (IU/L), INR, and platelet count (×10⁹/L) — all greater than 0.' };
  }
  const score = r1(num('King', (age * ast * inr) / plt, { min: 0, max: 1e6 }));
  let tier; let abnormal = true;
  if (score >= 16.7) tier = 'cirrhosis likely (≥ 16.7): rule-in band — sensitivity 86%, specificity 80%';
  else if (score >= 12.3) tier = 'significant fibrosis (F3-6) likely, indeterminate for cirrhosis (12.3–16.7)';
  else { tier = 'cirrhosis and significant fibrosis unlikely (< 12.3): rule-out band'; abnormal = false; }
  return {
    valid: true,
    score,
    abnormal,
    bandLabel: `King's Score ${score}`,
    band: `King's Score ${score} — ${tier}.`,
    detail: `(${age} × ${ast} × ${inr}) / ${plt} = ${score}.`,
    note: KING_NOTE,
  };
}
