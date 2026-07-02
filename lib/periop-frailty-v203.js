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
