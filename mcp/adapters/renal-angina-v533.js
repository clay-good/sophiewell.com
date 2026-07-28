// spec-v533 MCP wave: adapter for the Renal Angina Index in lib/renal-angina-v533.js. The dom keys mirror
// the browser renderer (views/group-v533.js) and META['renal-angina'].example: rai-risk and rai-injury map
// to the lib args `risk` and `injury`.
//
// THE INJURY ENUM PUBLISHES '1','2','4','8' - THE TIERS DOUBLE, AND THERE IS NO 3, 5, 6, OR 7. An agent that
// assumed a 1-4 ordinal would send a 3 and get a validation error rather than a silently halved score. The
// error message says the tiers double, because "3 is not a valid injury stratum" would otherwise read like a
// bug in the tool.
//
// THE SUMMARY SAYS "PRODUCT, NOT SUM" EXPLICITLY, and gives the arithmetic. An agent that adds a risk of 5
// and an injury of 8 gets 13, which is below the threshold of 8 in appearance but is actually a number the
// index cannot produce at all - the true answer is 40, the maximum. Addition does not merely mis-scale here,
// it inverts the conclusion on the sickest patients.
//
// THE REACHABLE SET IS RETURNED AND NAMED. Only twelve totals exist (1, 2, 3, 4, 5, 6, 8, 10, 12, 20, 24,
// 40), so an agent reporting "RAI 12 out of 40" would badly understate it: 12 is the fourth-highest value the
// index can produce. The result exposes `reachable` so a caller can position the total honestly.
//
// The very-high risk tier's label spells out that it requires ventilation AND vasoactive support rather than
// either, because several secondary sources render it as "or", and that reading promotes every ventilated
// child to a 5.
//
// The summary frames the index as a RULE-OUT, which is what its published performance supports: a high
// negative predictive value and a modest positive one. An agent that reports a positive RAI as "this child
// will develop AKI" has overstated the only claim the index makes.

import * as R from '../../lib/renal-angina-v533.js';

export default [
  {
    id: 'renal-angina',
    summary: `The Renal Angina Index (Basu and colleagues 2014) predicts severe acute kidney injury on day 3 in a critically ill child, scored at about 12 hours after intensive care admission, before the creatinine has moved. IT IS A PRODUCT, NOT A SUM: the risk stratum is MULTIPLIED by the injury stratum. Risk is 1 for admission to the intensive care unit, 3 for a history of solid-organ or stem-cell transplant, or 5 for invasive mechanical ventilation AND vasoactive or inotropic support within the first 12 hours - both, not either, though not necessarily at the same moment. Injury is 1, 2, 4, or 8, taken from whichever is worse of the fall in estimated creatinine clearance or the percentage of fluid overload: 1 for no eCrCl decrease or under 5 percent fluid overload, 2 for a 0 to under 25 percent decrease or 5 to under 10 percent overload, 4 for 25 to under 50 percent or 10 to under 15 percent, and 8 for 50 percent or more or 15 percent or more. A total of 8 or more fulfills renal angina. Only twelve totals are reachable - ${R.RAI_REACHABLE.join(', ')} - so this is not a continuous scale out of 40, and a total of 12 is the fourth-highest value the index can produce rather than a low number. Adding the strata instead of multiplying would cap the index at 13 and would invert the conclusion on the sickest patients. The index was designed as a RULE-OUT: its published performance is a high negative predictive value with a modest positive predictive value, so a negative result is the informative one and a positive result identifies a group worth watching rather than a child who will certainly develop injury. It does not diagnose acute kidney injury and does not stage it, which is what RIFLE, AKIN and KDIGO do, and it is not an indication to start or withhold fluids, diuretics, nephrotoxin avoidance, or renal replacement therapy. It was derived and validated in critically ill CHILDREN; a separate adult adaptation exists with different tiers and a different cut point, and applying this pediatric index to an adult is not the same instrument.`,
    compute: R.renalAngina,
    fields: [
      {
        dom: 'rai-risk', arg: 'risk', kind: 'enum',
        values: R.RAI_RISK.map((t) => t.value), required: true,
        label: `Risk stratum [${R.RAI_RISK.map((t) => t.text).join('; ')}]`,
      },
      {
        dom: 'rai-injury', arg: 'injury', kind: 'enum',
        values: R.RAI_INJURY.map((t) => t.value), required: true,
        label: `Injury stratum, from whichever route is worse. NOTE the tiers DOUBLE - the only valid values are 1, 2, 4 and 8, and there is no 3, 5, 6 or 7 [${R.RAI_INJURY.map((t) => t.text).join('; ')}]`,
      },
    ],
  },
];
