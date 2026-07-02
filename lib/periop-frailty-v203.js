// spec-v203: perioperative, fracture, cerebrovascular & frailty risk
// instruments (Deep Subspecialty Quantitation program, spec-v199 §1.1; this
// spec closes the program). Every id was verified absent by a direct scan of
// app.js first (spec-v85 §6.2). None duplicates a live tile; v203 runs no AI and
// makes no runtime network call. These estimate risk and screen — they are NOT a
// surgery, anticoagulation, imaging, bone-therapy, or disposition order
// (spec-v11 §5.3). Shipped one tile at a time per an active /goal.
//
//   dasi           - Duke Activity Status Index (functional capacity / peak VO2)
//   abcd3i         - ABCD3-I score (early stroke risk after TIA)
//   edmontonFrail  - Edmonton Frail Scale
//   sort           - Surgical Outcome Risk Tool (30-day mortality)
//   garvan         - Garvan fracture-risk calculator
//
// POINT WEIGHTS / COEFFICIENTS RE-FETCHED, NEVER RECALLED (spec-v97), each
// cross-verified across >= 2 independent open sources at implementation:
//   - DASI (Hlatky MA, Boineau RE, Higginbotham MB, et al, Am J Cardiol
//     1989;64(10):651-654): the 12 weighted yes/no activity items reproduced
//     identically across MDCalc and multiple clinical references — self-care
//     2.75, walk indoors 1.75, walk 1-2 blocks 2.75, climb stairs / walk uphill
//     5.50, run a short distance 8.00, light housework 2.70, moderate housework
//     3.50, heavy housework 8.00, yardwork 4.50, sexual relations 5.25, moderate
//     recreation 6.00, strenuous sports 7.50 (sum = 58.20, the published
//     maximum; MDCalc's stated "57.75" contradicts its own listed weights, which
//     sum to 58.20). Peak VO2 (mL/kg/min) = 0.43 x DASI + 9.6; METs = VO2 / 3.5.

import { num, r1, r2 } from './num.js';

function bool(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'yes'; }
function inRange(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}

// --- 2.5 Duke Activity Status Index -----------------------------------------
const DASI_ITEMS = [
  ['selfCare', 'Personal care', 2.75],
  ['walkIndoors', 'Walk indoors', 1.75],
  ['walkBlocks', 'Walk 1–2 blocks', 2.75],
  ['stairs', 'Climb stairs / walk uphill', 5.5],
  ['run', 'Run a short distance', 8],
  ['lightWork', 'Light housework', 2.7],
  ['moderateWork', 'Moderate housework', 3.5],
  ['heavyWork', 'Heavy housework', 8],
  ['yardWork', 'Yardwork', 4.5],
  ['sexual', 'Sexual relations', 5.25],
  ['moderateRec', 'Moderate recreation', 6],
  ['strenuous', 'Strenuous sports', 7.5],
];
const DASI_NOTE = 'Duke Activity Status Index (Hlatky MA, Boineau RE, Higginbotham MB, et al, Am J Cardiol 1989;64(10):651-654): a 12-item self-report functional-capacity questionnaire. The affirmative activities are summed by their published METs weights (maximum 58.2); peak VO₂ (mL/kg/min) = 0.43 × DASI + 9.6 and METs = VO₂ / 3.5. A functional-capacity estimate used in preoperative and cardiac assessment — < 4 METs marks poor capacity linked to higher perioperative risk. Decision support, not a surgical or cardiac order.';

export function dasi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let total = 0;
  const can = []; const cannot = [];
  for (const [key, label, wt] of DASI_ITEMS) {
    if (bool(o[key])) { total += wt; can.push(label); } else cannot.push(label);
  }
  const score = num('DASI', r2(total), { min: 0, max: 58.2 });
  const vo2 = r1(0.43 * score + 9.6);
  const mets = r1(vo2 / 3.5);
  const abnormal = mets < 4;
  return {
    valid: true,
    score,
    vo2,
    mets,
    abnormal,
    bandLabel: `DASI ${score}`,
    band: `DASI ${score} — peak VO₂ ${vo2} mL/kg/min (≈ ${mets} METs); ${abnormal ? 'below the 4-MET functional-capacity threshold' : 'at or above the 4-MET functional-capacity threshold'}.`,
    detail: can.length ? `Can: ${can.join(', ')}.${cannot.length ? ` Cannot: ${cannot.join(', ')}.` : ''}` : 'No activities affirmed — DASI 0.',
    note: DASI_NOTE,
  };
}

// --- 2.3 ABCD3-I score ------------------------------------------------------
// WEIGHTS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across the
// neurology.org stroke-unit study (WNL 2016) and AHA Stroke validation
// (STROKEAHA.113.000969): the ABCD² base (Johnston 2007) — Age ≥60 +1, BP
// ≥140/90 +1, Clinical (unilateral weakness +2, speech disturbance without
// weakness +1), Duration (≥60 min +2, 10-59 min +1), Diabetes +1 — plus the
// ABCD3-I additions: dual TIA (a second TIA within 7 days) +2, ipsilateral ≥50%
// carotid stenosis +2, and acute DWI hyperintensity +2. Total 0-13. Strata: low
// 0-3, medium 4-7, high 8-13 (early-stroke risk rises with the total).
const ABCD3I_NOTE = 'ABCD3-I score (Merwick Á, Albers GW, Amarenco P, et al, Lancet Neurol 2010;9(11):1060-1069): the imaging-augmented refinement of ABCD² for early stroke risk after TIA. The ABCD² items (age ≥ 60, BP ≥ 140/90, clinical features, duration, diabetes) plus dual TIA within 7 days (+2), ipsilateral ≥ 50% carotid stenosis (+2), and abnormal DWI (+2), total 0–13. Strata: low 0–3, medium 4–7, high 8–13. A triage aid, not an imaging or anticoagulation order.';

export function abcd3i(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = inRange(o.age, 0, 130);
  const sbp = inRange(o.sbp, 30, 300);
  const dbp = inRange(o.dbp, 10, 200);
  const dur = inRange(o.durationMinutes, 0, 1440);
  const clinical = ['weakness', 'speech', 'other'].includes(o.clinical) ? o.clinical : null;
  if (age === null || sbp === null || dbp === null || dur === null || clinical === null) {
    return { valid: false, message: 'Enter age, systolic and diastolic BP, and TIA duration (minutes); select the clinical feature; set diabetes and the ABCD3-I imaging items.' };
  }
  const a = age >= 60 ? 1 : 0;
  const b = (sbp >= 140 || dbp >= 90) ? 1 : 0;
  const c = clinical === 'weakness' ? 2 : clinical === 'speech' ? 1 : 0;
  const d1 = dur >= 60 ? 2 : dur >= 10 ? 1 : 0;
  const d2 = bool(o.diabetes) ? 1 : 0;
  const dual = bool(o.dualTia) ? 2 : 0;
  const carotid = bool(o.carotidStenosis) ? 2 : 0;
  const dwi = bool(o.dwiAbnormal) ? 2 : 0;
  const total = num('ABCD3-I', a + b + c + d1 + d2 + dual + carotid + dwi, { min: 0, max: 13 });
  let tier; let abnormal = true;
  if (total <= 3) { tier = 'low-risk (0–3)'; abnormal = false; }
  else if (total <= 7) tier = 'medium-risk (4–7)';
  else tier = 'high-risk (8–13)';
  const parts = [];
  if (a) parts.push('Age ≥60 (+1)');
  if (b) parts.push('BP ≥140/90 (+1)');
  if (c) parts.push(`Clinical (+${c})`);
  if (d1) parts.push(`Duration (+${d1})`);
  if (d2) parts.push('Diabetes (+1)');
  if (dual) parts.push('Dual TIA (+2)');
  if (carotid) parts.push('Carotid ≥50% (+2)');
  if (dwi) parts.push('Abnormal DWI (+2)');
  return {
    valid: true,
    score: total,
    abnormal,
    bandLabel: `ABCD3-I ${total}`,
    band: `ABCD3-I ${total}/13 — ${tier} for early stroke after TIA.`,
    detail: parts.length ? `Contributors: ${parts.join('; ')}.` : 'No items scored — ABCD3-I 0.',
    note: ABCD3I_NOTE,
  };
}
