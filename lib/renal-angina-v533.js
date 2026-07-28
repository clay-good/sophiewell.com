// spec-v533: the Renal Angina Index (RAI) for predicting severe acute kidney injury in critically ill
// children. Zero-hit before this tile: "renal angina" and "basu" across corpus.json, app.js, and lib/meta.js.
// The `angina` hits all belong to ccs-angina, which is cardiac.
//
// A DIFFERENT AXIS FROM THE EXISTING rifle-aki, akin-aki, AND KDIGO STAGING TILES. Those CLASSIFY an acute
// kidney injury that has already happened, from a creatinine or urine output that has already moved. The RAI
// is a PREDICTION made on day 0, at 12 hours after ICU admission, about whether severe AKI will be present on
// day 3 -- before the creatinine has moved. Staging an injury and predicting one are different questions, and
// the whole design of the RAI is to be usable while the staging tools still read normal.
//
// THE SCORE IS A PRODUCT, NOT A SUM, AND THAT IS THE WHOLE IDEA. It multiplies a RISK stratum by an INJURY
// stratum, which is the arithmetic expression of the borrowed cardiology metaphor: chest pain matters more in
// someone with coronary risk factors, and a small creatinine change matters more in a transplanted, ventilated
// child. An implementation that added the two would produce a maximum of 13 instead of 40 and would collapse
// exactly the interaction the index exists to capture.
//
//   RISK stratum      ICU admission                                                        1
//                     history of solid-organ or stem-cell transplant                       3
//                     invasive mechanical ventilation AND vasoactive or inotropic support   5
//   INJURY stratum    (use the WORSE of the two routes; only ONE injury score is assigned)
//                     eCrCl decrease from baseline | percent fluid overload  | points
//                       none                       | below 5                | 1
//                       0 to under 25              | 5 to under 10          | 2
//                       25 to under 50             | 10 to under 15         | 4
//                       50 or more                 | 15 or more             | 8
//   RAI = risk x injury.  RAI of 8 or more fulfills renal angina.
//
// THE VERY-HIGH RISK STRATUM IS "AND", NOT "OR". It requires BOTH mechanical ventilation AND vasoactive
// support within the first 12 hours -- though not necessarily at the same moment. Several secondary sources
// render it as "or", which would promote every ventilated child to a 5 and roughly triple the number of
// positive scores. This tile uses AND and says so.
//
// ONLY TWELVE TOTALS ARE REACHABLE: 1, 2, 3, 4, 5, 6, 8, 10, 12, 20, 24, and 40. Products of {1,3,5} and
// {1,2,4,8} leave gaps -- there is no RAI of 7, 9, 11, 15, 16, or 32. The tile reports the reachable set
// rather than implying a continuous 1-to-40 scale, because a reader who sees "out of 40" will otherwise read
// a 12 as low-ish when it is in fact the fourth-highest value the index can produce.
//
// BECAUSE OF THAT GRID, THE THRESHOLD BEHAVES ARITHMETICALLY: at risk 1 only an injury of 8 reaches 8; at
// risk 3 an injury of 4 suffices; at risk 5 an injury of 2 does. The tile states which injury level the
// patient's own risk stratum would need, which is more actionable than a bare pass/fail.
//
// HIGH-STAKES: the index was designed as a RULE-OUT. Its published performance is a high negative predictive
// value with a modest positive predictive value, so a negative result is the informative one and a positive
// result identifies a group worth watching rather than a child who will certainly develop AKI. It does not
// diagnose AKI, does not stage it -- RIFLE, AKIN, and KDIGO do that -- and is not an indication to start or
// withhold fluids, diuretics, nephrotoxin avoidance, or renal replacement therapy (spec-v11 section 5.3).
// It was derived and validated in CRITICALLY ILL CHILDREN; a separate adult adaptation exists with different
// tiers and a different cut point, and applying this pediatric index to an adult is not the same instrument.
// The clinical decision stays with the clinician.
//
// STRATA, POINTS, COMBINATION RULE, AND THRESHOLD RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from
// sources agreeing on every value:
//   - Basu RK, Zappitelli M, Brunner L, et al. Derivation and validation of the renal angina index to improve
//     the prediction of acute kidney injury in critically ill children. Kidney Int. 2014;85(3):659-667.
//   - Companion and validation papers from the same group and others, reproducing the same three risk tiers,
//     the same four injury tiers on both routes, the multiplication rule, and the threshold of 8.

export const RAI_RISK = [
  { value: '1', points: 1, text: '1 - admitted to the intensive care unit (and not meeting a higher tier)' },
  { value: '3', points: 3, text: '3 - history of solid-organ or stem-cell transplant' },
  { value: '5', points: 5, text: '5 - invasive mechanical ventilation AND vasoactive or inotropic support within the first 12 hours (both, though not necessarily at the same moment)' },
];

export const RAI_INJURY = [
  { value: '1', points: 1, text: '1 - no decrease in estimated creatinine clearance, or fluid overload below 5 percent' },
  { value: '2', points: 2, text: '2 - eCrCl decrease of 0 to under 25 percent, or fluid overload of 5 to under 10 percent' },
  { value: '4', points: 4, text: '4 - eCrCl decrease of 25 to under 50 percent, or fluid overload of 10 to under 15 percent' },
  { value: '8', points: 8, text: '8 - eCrCl decrease of 50 percent or more, or fluid overload of 15 percent or more' },
];

const POSITIVE_AT = 8;

// Every product of a risk point and an injury point, in order. Twelve values, not forty.
export const RAI_REACHABLE = [...new Set(
  RAI_RISK.flatMap((r) => RAI_INJURY.map((i) => r.points * i.points)),
)].sort((a, b) => a - b);

const NOTE = 'The Renal Angina Index (Basu and colleagues 2014) predicts severe acute kidney injury on day 3 in a critically ill child, scored at about 12 hours after intensive care admission. It is a PRODUCT, not a sum: a risk stratum of 1 for ICU admission, 3 for a solid-organ or stem-cell transplant, or 5 for invasive mechanical ventilation AND vasoactive support within the first 12 hours, multiplied by an injury stratum of 1, 2, 4, or 8 taken from whichever is worse of the fall in estimated creatinine clearance or the percentage of fluid overload. Adding the two instead of multiplying would cap the index at 13 rather than 40 and would collapse the interaction the index exists to capture. The very-high risk stratum requires both ventilation and vasoactive support, not either, though not necessarily at the same moment; sources that render it as either would promote every ventilated child to a 5. Only twelve totals are reachable, namely 1, 2, 3, 4, 5, 6, 8, 10, 12, 20, 24, and 40, so there is no score of 7, 9, 11, 15, 16, or 32 and a 12 is the fourth-highest value the index can produce rather than a low number out of 40. A total of 8 or more fulfills renal angina. The index was designed as a rule-out: its published performance is a high negative predictive value with a modest positive predictive value, so a negative result is the informative one and a positive result identifies a group worth watching rather than a child who will certainly develop injury. It does not diagnose acute kidney injury and does not stage it, which is what RIFLE, AKIN, and KDIGO do, and it is not an indication to start or withhold fluids, diuretics, nephrotoxin avoidance, or renal replacement therapy. It was derived and validated in critically ill children; a separate adult adaptation exists with different tiers and a different cut point, and applying this pediatric index to an adult is not the same instrument.';

function readTier(list, raw) {
  if (raw === '' || raw === null || raw === undefined) return null;
  const key = String(raw).trim();
  const hit = list.find((t) => t.value === key);
  return hit || undefined;
}

// input: risk -- '1' | '3' | '5'; injury -- '1' | '2' | '4' | '8'.
export function renalAngina(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const risk = readTier(RAI_RISK, o.risk);
  const injury = readTier(RAI_INJURY, o.injury);

  if (risk === null || injury === null) {
    return { valid: false, message: 'Choose both a risk stratum (1, 3, or 5) and an injury stratum (1, 2, 4, or 8).' };
  }
  if (risk === undefined) {
    return { valid: false, message: 'The risk stratum must be 1 (ICU admission), 3 (transplant), or 5 (ventilation AND vasoactive support).' };
  }
  if (injury === undefined) {
    return { valid: false, message: 'The injury stratum must be 1, 2, 4, or 8. There is no 3, 5, 6, or 7: the tiers double.' };
  }

  const total = risk.points * injury.points;
  const positive = total >= POSITIVE_AT;

  // Which injury level this patient's own risk stratum would need to reach the threshold.
  const needed = RAI_INJURY.find((i) => risk.points * i.points >= POSITIVE_AT);
  const neededText = needed
    ? `At a risk stratum of ${risk.points}, an injury stratum of ${needed.points} or more reaches the threshold.`
    : `At a risk stratum of ${risk.points}, no injury stratum reaches the threshold.`;

  return {
    valid: true,
    total,
    riskPoints: risk.points,
    injuryPoints: injury.points,
    positive,
    reachable: RAI_REACHABLE.slice(),
    bandLabel: `RAI ${total}${positive ? ', renal angina fulfilled' : ', renal angina not fulfilled'}`,
    band: `Risk ${risk.points} multiplied by injury ${injury.points} gives ${total}. ${positive ? 'This is 8 or more, so renal angina is fulfilled.' : 'This is below 8, so renal angina is not fulfilled.'} ${neededText} Only twelve totals are reachable (${RAI_REACHABLE.join(', ')}), so this is not a continuous scale out of 40. The index is a rule-out: a negative result is the informative one.`,
    note: NOTE,
  };
}
