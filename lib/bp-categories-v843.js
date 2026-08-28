// spec-v843: the ACC/AHA blood pressure categories for adults.
//
// Source:
//   Jones DW, Ferdinand KC, Taler SJ, et al. 2025 AHA/ACC Guideline for the Prevention,
//   Detection, Evaluation and Management of High Blood Pressure in Adults.
//   Circulation. 2025;152:e114-e218.
//
//   Normal                  systolic under 120  AND  diastolic under 80
//   Elevated                systolic 120 to 129 AND  diastolic under 80
//   Stage 1 hypertension    systolic 130 to 139  OR  diastolic 80 to 89
//   Stage 2 hypertension    systolic 140 or more OR  diastolic 90 or more
//
// The 2025 guideline kept the categories and the 130/80 diagnostic threshold that the 2017
// guideline introduced; what changed around them was management, not the table.
//
// WHEN THE TWO NUMBERS FALL IN DIFFERENT CATEGORIES, THE HIGHER ONE APPLIES. That single
// sentence is the whole reason this tile computes rather than prints a table: 135/95 is stage
// 2, not stage 1, and reading down the systolic column alone gets it wrong.
//
// THERE IS NO DIASTOLIC ROUTE TO "ELEVATED". Elevated requires a diastolic under 80, so
// 125/85 is stage 1 hypertension. Elevated is the one category defined by AND rather than OR,
// and it is the one most often reached for when a reading looks "not quite normal".
//
// SEVERE HYPERTENSION, above 180/120, is reported alongside the category rather than as one.
// The 2025 guideline uses that term in place of "hypertensive urgency" for a reading that
// high without acute target-organ damage.
//
// A CATEGORY IS NOT ONE READING. The guideline categorizes on the average of at least two
// careful readings taken on at least two occasions.
//
// Pure: no DOM, no clock, no network.

export const BP_CATEGORIES_NOTE = 'The blood pressure categories of the 2025 AHA/ACC guideline (Jones DW, Ferdinand KC, Taler SJ, et al, Circulation 2025;152:e114-e218) are normal, elevated, stage 1 hypertension and stage 2 hypertension. Normal is a systolic under 120 with a diastolic under 80. Elevated is a systolic of 120 to 129 with a diastolic under 80. Stage 1 is a systolic of 130 to 139 or a diastolic of 80 to 89. Stage 2 is a systolic of 140 or more or a diastolic of 90 or more. The 2025 guideline kept this table and the 130 over 80 diagnostic threshold that the 2017 guideline introduced; what changed around them was management. Two points matter. When the systolic and the diastolic fall in different categories, the higher of the two applies, so a reading of 135 over 95 is stage 2 rather than stage 1 and reading the systolic column alone gets it wrong. And elevated is the only category defined by both numbers together rather than either one, so there is no diastolic route into it and a reading of 125 over 85 is stage 1. A reading above 180 over 120 is reported here as severe hypertension alongside the category rather than as a category of its own. A category is not a single reading: the guideline categorizes on the average of at least two careful readings taken on at least two occasions. It applies a published classification to readings already taken and it does not select or adjust therapy.';

const NAMES = ['Normal', 'Elevated', 'Stage 1 hypertension', 'Stage 2 hypertension'];

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// Rank 1 (elevated) is reachable from the systolic only. That asymmetry is the definition,
// not an omission.
function systolicRank(s) {
  if (s >= 140) return 3;
  if (s >= 130) return 2;
  if (s >= 120) return 1;
  return 0;
}
function diastolicRank(d) {
  if (d >= 90) return 3;
  if (d >= 80) return 2;
  return 0;
}

export function bpCategories(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const systolic = num(o.systolic);
  const diastolic = num(o.diastolic);

  if (systolic === null || diastolic === null) {
    return { valid: false, message: 'Enter both the systolic and the diastolic pressure in mmHg.' };
  }
  if (systolic < 50 || systolic > 300) {
    return { valid: false, message: 'Systolic pressure is outside a plausible range of 50 to 300 mmHg.' };
  }
  if (diastolic < 20 || diastolic > 200) {
    return { valid: false, message: 'Diastolic pressure is outside a plausible range of 20 to 200 mmHg.' };
  }
  if (diastolic >= systolic) {
    return { valid: false, message: 'The diastolic pressure is not below the systolic pressure. Check the two entries have not been swapped.' };
  }

  const sysRank = systolicRank(systolic);
  const diaRank = diastolicRank(diastolic);
  const rank = Math.max(sysRank, diaRank);
  const category = NAMES[rank];

  const setBy = sysRank > diaRank ? 'systolic' : (diaRank > sysRank ? 'diastolic' : 'both');

  // The rule that makes this compute rather than print.
  const higherCategoryNote = sysRank !== diaRank
    ? `The systolic and the diastolic fall in different categories, so the higher one applies. The ${setBy} pressure of ${setBy === 'systolic' ? systolic : diastolic} mmHg sets this reading at ${category.toLowerCase()}.`
    : null;

  // Elevated is the only AND category, so a raised diastolic cannot land there.
  const noElevatedByDiastoleNote = systolic >= 120 && systolic <= 129 && diastolic >= 80
    ? 'Elevated requires a diastolic below 80 as well as a systolic of 120 to 129, so a raised diastolic cannot reach it. This reading is hypertension, not elevated blood pressure.'
    : null;

  const severe = systolic > 180 || diastolic > 120;
  const severeNote = severe
    ? 'This reading is above 180 over 120 mmHg. The 2025 guideline calls that severe hypertension, the term it uses in place of hypertensive urgency for a reading this high without acute target-organ damage, and it warrants prompt reassessment rather than a routine recheck.'
    : null;

  return {
    valid: true,
    systolic,
    diastolic,
    rank,
    category,
    setBy,
    severe,
    higherCategoryNote,
    noElevatedByDiastoleNote,
    severeNote,
    averagingNote: 'A category is not a single reading. The guideline categorizes on the average of at least two careful readings taken on at least two occasions.',
    abnormal: rank >= 2,
    bandLabel: category,
    band: `${systolic}/${diastolic} mmHg — ${category}.`,
    detail: 'Normal is under 120 and under 80. Elevated is 120 to 129 AND under 80. Stage 1 is 130 to 139 OR 80 to 89. Stage 2 is 140 or more OR 90 or more. Where the two numbers disagree, the higher category applies.',
    note: BP_CATEGORIES_NOTE,
  };
}
