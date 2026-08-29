// spec-v850: the RoPE score (Risk of Paradoxical Embolism).
//
// Source:
//   Kent DM, Ruthazer R, Weimar C, et al. An index to identify stroke-related vs incidental
//   patent foramen ovale in cryptogenic stroke. Neurology. 2013;81(7):619-625.
//
//   No history of hypertension            1
//   No history of diabetes                1
//   No history of stroke or TIA           1
//   Nonsmoker                             1
//   Cortical infarct on imaging           1
//   Age 18-29 / 30-39 / 40-49 / 50-59 / 60-69 / 70+   5 / 4 / 3 / 2 / 1 / 0
//   Total 0 to 10.
//
// A HIGH SCORE IS NOT HIGH RISK, AND THAT IS THE POINT OF THIS TILE. The score estimates the
// PFO-ATTRIBUTABLE FRACTION - the share of strokes at that score in which the hole is doing the
// work rather than sitting there incidentally. It rises from 0 percent at 0-3 to 88 percent at
// 9-10. Two-year recurrence runs the OTHER WAY: 20 percent at 0-3 and 2 percent at 9-10. The
// patient whose stroke is most clearly caused by the PFO is the patient least likely to have
// another one, because there is no vascular disease driving them.
//
// AGE IS MOST OF THE SCORE. Age alone contributes up to 5 of the 10 points, and the four
// history items are all absence of vascular disease, which is itself age-correlated.
//
// IT DOES NOT DETECT A PFO, GRADE A SHUNT, OR SELECT CLOSURE. It applies only to a patient in
// whom a cryptogenic stroke has been diagnosed and a PFO already found.
//
// Pure: no DOM, no clock, no network.

export const ROPE_NOTE = 'The RoPE score (Kent DM, Ruthazer R, Weimar C, et al, Neurology 2013;81(7):619-625) is for a patient who has already had a cryptogenic stroke and in whom a patent foramen ovale has already been found. It gives one point each for no history of hypertension, no history of diabetes, no history of stroke or transient ischemic attack, being a nonsmoker and a cortical infarct on imaging, and then adds 5 points for age 18 to 29, 4 for 30 to 39, 3 for 40 to 49, 2 for 50 to 59, 1 for 60 to 69 and none from 70. The total runs from 0 to 10. The number it estimates is the attributable fraction, the share of strokes at that score in which the hole is doing the work rather than sitting there incidentally, and that fraction rises from 0 percent at a score of 0 to 3 up to 88 percent at 9 to 10. It is not a risk score, and reading it as one inverts it. Two-year recurrence of stroke or transient ischemic attack runs the other way, from 20 percent at a score of 0 to 3 down to 2 percent at 9 to 10, because the patient whose stroke is most clearly caused by the hole is the patient with the least vascular disease driving another one. Age supplies up to 5 of the 10 points and the history items are all the absence of vascular disease, so a young patient scores high largely because young patients rarely have another cause. It does not detect a hole, grade a shunt or select closure. It reports a published index and the published figures that go with it.';

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

function agePoints(age) {
  if (age >= 70) return 0;
  if (age >= 60) return 1;
  if (age >= 50) return 2;
  if (age >= 40) return 3;
  if (age >= 30) return 4;
  return 5;
}

// Published Table: score -> PFO-attributable fraction and 2-year stroke/TIA recurrence.
// The attributable fraction is NOT monotonic - 5 sits below 4 - and it is reported as published.
const BANDS = [
  { max: 3, label: '0 to 3', attributable: 0, recurrence: 20 },
  { max: 4, label: '4', attributable: 38, recurrence: 12 },
  { max: 5, label: '5', attributable: 34, recurrence: 7 },
  { max: 6, label: '6', attributable: 62, recurrence: 8 },
  { max: 7, label: '7', attributable: 72, recurrence: 6 },
  { max: 8, label: '8', attributable: 84, recurrence: 6 },
  { max: 10, label: '9 to 10', attributable: 88, recurrence: 2 },
];

export function ropeScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const age = num(o.age);
  if (age === null) {
    return { valid: false, message: 'Enter the age. The score is not defined without it, and age supplies up to 5 of its 10 points.' };
  }
  if (age < 18 || age > 120) {
    return { valid: false, message: 'The index was derived in adults. Enter an age from 18 to 120 years.' };
  }

  const noHypertension = truthy(o.noHypertension);
  const noDiabetes = truthy(o.noDiabetes);
  const noPriorStroke = truthy(o.noPriorStroke);
  const nonsmoker = truthy(o.nonsmoker);
  const corticalInfarct = truthy(o.corticalInfarct);

  const ageScore = agePoints(age);
  const historyScore = (noHypertension ? 1 : 0) + (noDiabetes ? 1 : 0) + (noPriorStroke ? 1 : 0)
    + (nonsmoker ? 1 : 0) + (corticalInfarct ? 1 : 0);
  const score = ageScore + historyScore;

  const band = BANDS.find((b) => score <= b.max);

  const items = [];
  if (noHypertension) items.push('no history of hypertension');
  if (noDiabetes) items.push('no history of diabetes');
  if (noPriorStroke) items.push('no history of stroke or transient ischemic attack');
  if (nonsmoker) items.push('nonsmoker');
  if (corticalInfarct) items.push('cortical infarct on imaging');

  // The error this tile exists to prevent: the score is not a risk score, and it runs the
  // opposite way from one.
  const directionNote = `This is not a risk score. A score of ${score} estimates that about ${band.attributable} percent of strokes at this score are caused by the hole rather than coincident with it. Two-year recurrence of stroke or transient ischemic attack runs the OTHER WAY: about ${band.recurrence} percent here, against 20 percent at the bottom of the scale and 2 percent at the top. A high score means the hole is more likely to be the cause AND that another stroke is less likely, because there is less vascular disease driving one.`;

  const nonMonotonicNote = score === 5
    ? 'The published attributable fraction at 5 is 34 percent, below the 38 percent reported at 4. That is what the source table says and it is reported unsmoothed; the confidence intervals at those two scores overlap.'
    : null;

  const ageNote = ageScore * 2 >= score && score > 0
    ? `Age supplies ${ageScore} of the ${score} points. The four history items are all the absence of vascular disease, which is itself age-correlated, so a young patient scores high largely because young patients rarely have another cause for the stroke - not because the hole is any bigger.`
    : null;

  const scopeNote = 'The index applies only where a cryptogenic stroke has already been diagnosed and a patent foramen ovale has already been found. It does not detect a hole, grade a shunt or select closure.';

  return {
    valid: true,
    score,
    ageScore,
    historyScore,
    bandLabel: band.label,
    attributableFraction: band.attributable,
    recurrenceTwoYear: band.recurrence,
    items,
    directionNote,
    nonMonotonicNote,
    ageNote,
    scopeNote,
    band: `RoPE score ${score} of 10 — attributable fraction about ${band.attributable} percent, two-year recurrence about ${band.recurrence} percent.`,
    detail: 'One point each for no hypertension, no diabetes, no prior stroke or transient ischemic attack, nonsmoker and a cortical infarct on imaging, plus 5 points for age 18 to 29, 4 for 30 to 39, 3 for 40 to 49, 2 for 50 to 59, 1 for 60 to 69 and none from 70. The attributable fraction rises with the score and the recurrence rate falls.',
    note: ROPE_NOTE,
  };
}
