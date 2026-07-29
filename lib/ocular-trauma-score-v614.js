// spec-v614: the Ocular Trauma Score (Kuhn and colleagues 2002). A WHOLE-CONCEPT gap in an otherwise
// well-covered eye cluster: `shaffer-angle`, `van-herick`, `roper-hall-dua` and others ship, and there was
// no prognostic score for serious eye injury at all. Every slug spelling returned 0.
//
// **THE INITIAL VISUAL ACUITY IS THE ONLY TERM THAT ADDS. EVERYTHING ELSE SUBTRACTS.** The acuity sets a
// base of 60 to 100 and the five injury findings deduct 23, 17, 14, 11 and 10 - a total of 75 available
// against a base that never exceeds 100. The presenting vision is not one variable among six; it is the
// whole of the positive side of the ledger.
//
// **THE RAW SCORE CAN FALL BELOW THE PUBLISHED TABLE, AND THIS LIB REPORTS THAT RATHER THAN PATCHING IT.**
// Both sources print the lowest band as "0 to 44". But no light perception (60) with globe rupture,
// endophthalmitis, retinal detachment and an afferent pupillary defect is 60 - 23 - 17 - 11 - 10 = -1, and
// all five findings together give -15. Those are reachable, and the published table does not cover them, so
// the category is returned as null with `belowPublishedRange` set - the same handling given to the al Naqeeb
// unclassified region rather than silently clamping to category 1 (spec-v97).
//
// **THE OUTPUT IS A PROBABILITY DISTRIBUTION, NOT A PREDICTED ACUITY.** Each category carries five
// probabilities for where vision lands at six months. "OTS 3" on its own throws away the entire result, and
// the distributions are wide: category 3 is 44% at or above 20/40 and still 13% at hand movements or worse.
//
// **NEITHER EXTREME IS CERTAIN.** Category 1 - the worst - still carries 1% at or above 20/40, and category
// 5 - the best - still carries 1% at no light perception. A score is never a verdict about one eye.
//
// **THE CATEGORY BANDS NARROW AS THE PROGNOSIS IMPROVES**: they are 45, 21, 15, 11 and 9 raw points wide. A
// single point matters far more near the top of the scale than near the bottom.
//
// HIGH-STAKES: this estimates a GROUP-LEVEL distribution of visual outcome at six months after optimal
// management. It does NOT diagnose the injury, does NOT decide whether to operate, does NOT support a
// decision to enucleate or to withhold repair, and does NOT predict what will happen to one patient's eye
// (spec-v11 section 5.3).
//
// ALL RAW POINTS, DEDUCTIONS, BANDS AND PROBABILITIES RE-FETCHED AND DOUBLE-CONFIRMED, NEVER RECALLED
// (spec-v97). Both sources give identical acuity bases, identical deductions and the identical band edges,
// including the "0 to 44" floor:
//   - Kuhn F, Maisiak R, Mann L, Mester V, Morris R, Witherspoon CD. The Ocular Trauma Score (OTS).
//     Ophthalmol Clin North Am. 2002;15(2):163-165.

export const ACUITY_BASE = [
  { value: 'nlp', points: 60, text: 'No light perception' },
  { value: 'pl-hm', points: 70, text: 'Light perception or hand movements' },
  { value: '1-200', points: 80, text: '1/200 to 19/200' },
  { value: '20-200', points: 90, text: '20/200 to 20/50' },
  { value: '20-40', points: 100, text: '20/40 or better' },
];

export const DEDUCTIONS = [
  { key: 'rupture', points: -23, text: 'Globe rupture' },
  { key: 'endophthalmitis', points: -17, text: 'Endophthalmitis' },
  { key: 'perforating', points: -14, text: 'Perforating injury' },
  { key: 'retinalDetachment', points: -11, text: 'Retinal detachment' },
  { key: 'apd', points: -10, text: 'Relative afferent pupillary defect' },
];

export const OUTCOMES = ['No light perception', 'Light perception or hand movements', '1/200 to 19/200', '20/200 to 20/50', '20/40 or better'];

// Probability of each OUTCOMES band at six months, per category.
export const CATEGORIES = [
  { ots: 1, min: 0, max: 44, probabilities: [73, 17, 7, 2, 1] },
  { ots: 2, min: 45, max: 65, probabilities: [28, 26, 18, 13, 15] },
  { ots: 3, min: 66, max: 80, probabilities: [2, 11, 15, 28, 44] },
  { ots: 4, min: 81, max: 91, probabilities: [1, 2, 2, 21, 74] },
  { ots: 5, min: 92, max: 100, probabilities: [0, 1, 2, 5, 92] },
];

export const PUBLISHED_FLOOR = CATEGORIES[0].min;
export const TOTAL_DEDUCTIONS = DEDUCTIONS.reduce((a, d) => a + d.points, 0); // -75

export const LEDGER_NOTE = `THE INITIAL VISUAL ACUITY IS THE ONLY TERM THAT ADDS - everything else subtracts. The acuity sets a base of ${ACUITY_BASE[0].points} to ${ACUITY_BASE[ACUITY_BASE.length - 1].points} and the five injury findings deduct ${DEDUCTIONS.map((d) => Math.abs(d.points)).join(', ')} - ${Math.abs(TOTAL_DEDUCTIONS)} points available against a base that never exceeds ${ACUITY_BASE[ACUITY_BASE.length - 1].points}. The presenting vision is not one variable among six; it is the whole of the positive side of the ledger.`;
export const FLOOR_NOTE = `THE PUBLISHED TABLE STARTS AT ${PUBLISHED_FLOOR} AND THE RAW SCORE CAN GO BELOW IT. No light perception with globe rupture, endophthalmitis, retinal detachment and an afferent pupillary defect is -1, and all five findings together give ${ACUITY_BASE[0].points + TOTAL_DEDUCTIONS}. Those combinations are reachable and the published table does not cover them, so no category is returned for them rather than clamping to category 1.`;
export const DISTRIBUTION_NOTE = 'THE OUTPUT IS A PROBABILITY DISTRIBUTION, NOT A PREDICTED ACUITY. Each category carries five probabilities for where vision lands at six months, and quoting the category alone throws the result away.';
export const EXTREMES_NOTE = `NEITHER EXTREME IS CERTAIN: category 1, the worst, still carries ${CATEGORIES[0].probabilities[4]}% at 20/40 or better, and category 5, the best, still carries ${CATEGORIES[4].probabilities[1]}% at light perception or hand movements. A category is never a verdict about one eye.`;
export const WIDTH_NOTE = `THE CATEGORY BANDS NARROW AS THE PROGNOSIS IMPROVES - they are ${CATEGORIES.map((c) => c.max - c.min + 1).join(', ')} raw points wide - so a single point matters far more near the top of the scale than near the bottom.`;

const NOTE = `The Ocular Trauma Score (Kuhn and colleagues 2002) estimates the distribution of visual outcome six months after serious eye injury with optimal management. ${LEDGER_NOTE} ${FLOOR_NOTE} ${DISTRIBUTION_NOTE} ${EXTREMES_NOTE} ${WIDTH_NOTE} This estimates a group-level distribution. It does not diagnose the injury, does not decide whether to operate, does not support a decision to enucleate or to withhold repair, and does not predict what will happen to one patient's eye.`;

function readBool(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', 'true', '1'].includes(s)) return true;
  if (['no', 'n', 'false', '0'].includes(s)) return false;
  throw new Error(`${name} must be yes or no.`);
}

export function categoryForRaw(raw) {
  if (!Number.isFinite(raw)) return null;
  return CATEGORIES.find((c) => raw >= c.min && raw <= c.max) || null;
}

// input: acuity (an ACUITY_BASE value) plus a yes/no for each DEDUCTIONS key.
export function ocularTraumaScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const acuity = o.acuity ? ACUITY_BASE.find((a) => a.value === String(o.acuity).trim()) : null;
  const findings = {};
  try {
    for (const d of DEDUCTIONS) findings[d.key] = readBool(o[d.key], d.text);
  } catch (err) {
    return { valid: false, message: err.message };
  }
  if (!acuity || DEDUCTIONS.some((d) => findings[d.key] === null)) {
    return { valid: false, message: `Choose the initial visual acuity and answer all ${DEDUCTIONS.length} injury findings. ${LEDGER_NOTE}` };
  }

  const applied = DEDUCTIONS.filter((d) => findings[d.key]);
  const deducted = applied.reduce((a, d) => a + d.points, 0);
  const raw = acuity.points + deducted;
  const category = categoryForRaw(raw);
  const belowPublishedRange = raw < PUBLISHED_FLOOR;

  const parts = [];
  if (category) {
    parts.push(`Raw score ${raw}, Ocular Trauma Score category ${category.ots}. Six-month visual acuity in the derivation series: ${category.probabilities.map((p, i) => `${OUTCOMES[i]} ${p}%`).join('; ')}.`);
  } else {
    parts.push(`Raw score ${raw}. NO CATEGORY IS RETURNED: the published table runs from ${PUBLISHED_FLOOR} to ${CATEGORIES[CATEGORIES.length - 1].max} and this score falls outside it.`);
  }
  parts.push(`Base ${acuity.points} for ${acuity.text.toLowerCase()}${applied.length ? `, less ${applied.map((d) => `${Math.abs(d.points)} for ${d.text.toLowerCase()}`).join(', ')}` : ', with no deductions'}.`);
  parts.push(LEDGER_NOTE);
  if (belowPublishedRange) parts.push(FLOOR_NOTE);
  parts.push(DISTRIBUTION_NOTE);
  parts.push(EXTREMES_NOTE);
  parts.push(WIDTH_NOTE);
  parts.push('This estimates a group-level distribution at six months after optimal management. It does not diagnose the injury, does not decide whether to operate, does not support a decision to enucleate or to withhold repair, and does not predict what will happen to one patient eye.');

  return {
    valid: true,
    raw,
    basePoints: acuity.points,
    deducted,
    findingsPresent: applied.map((d) => d.key),
    ots: category ? category.ots : null,
    probabilities: category ? category.probabilities.slice() : null,
    outcomes: OUTCOMES.slice(),
    belowPublishedRange,
    band: category ? `OTS ${category.ots}` : 'Outside the published range',
    bandLabel: category ? `Raw ${raw} — Ocular Trauma Score ${category.ots}` : `Raw ${raw} — outside the published range`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
