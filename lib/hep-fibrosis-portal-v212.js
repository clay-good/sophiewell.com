// spec-v212: hepatology fibrosis & portal-hypertension prognosis (Advanced
// Prognostic & Risk-Equation Instruments program, spec-v209 §1.1). Every id was
// verified absent by a direct scan of app.js first (spec-v85 §6.2). None
// duplicates a live tile; v212 runs no AI and makes no runtime network call.
// These stratify fibrosis / cirrhosis / portal-hypertension probability — they
// are NOT a biopsy, endoscopy, or treatment order (spec-v11 §5.3). Shipped one
// tile at a time per an active /goal.
//
//   kingScore  - King's Score (non-invasive marker of cirrhosis)
//   bavenoVii  - Baveno VII rule-out / rule-in of CSPH and high-risk varices
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

// --- 2.1 Baveno VII rule-out / rule-in --------------------------------------
// THRESHOLDS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across the
// Baveno VII consensus (de Franchis R, Bosch J, Garcia-Tsao G, et al, J Hepatol
// 2022;76(4):959-974) reproductions and the individual-patient-data validation
// literature, plus the Baveno VI / Expanded Baveno VI derivation (Augustin S,
// et al, Hepatology 2017;66(6):1980-1988) for the varices rule-out:
//   Clinically significant portal hypertension (CSPH):
//     rule-OUT  - LSM ≤ 15 kPa AND platelets ≥ 150 ×10⁹/L
//     rule-IN   - LSM ≥ 25 kPa (NOT reliable in obese MASLD — etiology caveat)
//     gray zone - everything between (15 < LSM < 25, or LSM ≤ 15 with plt < 150)
//   Favorable Baveno VI (high-risk-varices rule-out, defer screening endoscopy):
//     LSM < 20 kPa AND platelets > 150 ×10⁹/L  → varices needing treatment
//     unlikely; screening endoscopy may be deferred.
const BAVENO_NOTE = 'Baveno VII (de Franchis R, Bosch J, Garcia-Tsao G, et al, J Hepatol 2022;76(4):959-974): the consensus non-invasive rules for portal hypertension in compensated advanced chronic liver disease. Clinically significant portal hypertension (CSPH): LSM ≤ 15 kPa with platelets ≥ 150 ×10⁹/L rules it out; LSM ≥ 25 kPa rules it in (not reliable in obese MASLD); 15–25 kPa is the gray zone. Favorable Baveno VI (LSM < 20 kPa and platelets > 150 ×10⁹/L) makes high-risk varices unlikely, so screening endoscopy may be deferred. A risk-stratification rule, not an endoscopy or beta-blocker order.';

export function bavenoVii(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const lsm = pos(o.lsm, 100);
  const plt = pos(o.platelets, 2000);
  if (lsm === null || plt === null) {
    return { valid: false, message: 'Enter liver-stiffness measurement (kPa, by transient elastography) and platelet count (×10⁹/L) — both greater than 0.' };
  }
  const lsmR = r1(num('LSM', lsm, { min: 0, max: 100 }));
  let csph; let abnormal = false;
  if (lsmR >= 25) { csph = 'CSPH ruled IN (LSM ≥ 25 kPa) — not reliable in obese MASLD'; abnormal = true; }
  else if (lsmR <= 15 && plt >= 150) csph = 'CSPH ruled OUT (LSM ≤ 15 kPa and platelets ≥ 150)';
  else csph = 'gray zone (15–25 kPa, or LSM ≤ 15 with platelets < 150) — indeterminate, consider spleen stiffness or HVPG';
  const favorable = lsmR < 20 && plt > 150;
  const varices = favorable
    ? 'favorable Baveno VI met (LSM < 20 kPa and platelets > 150): high-risk varices unlikely — screening endoscopy may be deferred'
    : 'favorable Baveno VI not met: screening endoscopy for varices is indicated';
  return {
    valid: true,
    csph,
    varices,
    favorable,
    abnormal,
    bandLabel: abnormal ? 'CSPH ruled in' : favorable ? 'CSPH ruled out; endoscopy deferrable' : 'Baveno VII gray zone',
    band: `Baveno VII: ${csph}.`,
    detail: `LSM ${lsmR} kPa, platelets ${plt} ×10⁹/L. Varices: ${varices}.`,
    note: BAVENO_NOTE,
  };
}
