// spec-v587 MCP wave: adapter for the quick Pitt (qPitt) bacteremia score in lib/qpitt-v587.js. The dom keys
// mirror the browser renderer (views/group-v587.js) and META['qpitt'].example.
//
// **FEVER SCORES NOTHING. ONLY HYPOTHERMIA DOES.** The temperature item is a single binary - under 36
// degrees C scores 1, EVERYTHING ELSE SCORES 0 - so a patient at 40.5 degrees C scores exactly the same as
// one at 37.0. The predecessor Pitt Bacteremia Score awarded points for fever as well; the successor dropped
// that half of the item. Any consumer that scores "abnormal temperature" is wrong for every febrile patient,
// and wrong in the direction of OVER-scoring.
//
// **THE SUCCESSOR IS BINARY WHERE THE PREDECESSOR WAS WEIGHTED, OVER THE SAME FIVE DOMAINS.** `pitt-
// bacteremia` in this catalog runs 0 to 14 with cardiac arrest worth 4 and graded mental-status and
// temperature bands. qPitt runs 0 to 5, one point each, no gradations, so CARDIAC ARREST IS WORTH EXACTLY AS
// MUCH AS A RESPIRATORY RATE OF 25. A score cannot be carried between the two.
//
// **THE HIGH-RISK THRESHOLD IS ONLY 2 OF 5**, across which derivation mortality moved from 8.7 to 57.5
// percent. Misremembering it as a higher number is the main danger.
//
// **THE PUBLISHED MORTALITY LADDER STOPS SHORT**: 3, 9, 22, 45 and 70 percent for 0, 1, 2, 3 and "4 OR
// MORE". A score of 5 has NO figure of its own; both 4 and 5 return 70 percent and `mortalityFigureLumped`
// is true. The lumping is the source's, not an approximation made here.
//
// **ONE OPERATOR DIVERGES BETWEEN REPRODUCTIONS**: the hypotension item is printed as "under 90" in some and
// "90 or below" in others, differing only at exactly 90. The derivation reads below 90 mmHg or vasopressor
// use, which is applied.

import * as Q from '../../lib/qpitt-v587.js';

export default [
  {
    id: 'qpitt',
    summary: `The quick Pitt (qPitt) bacteremia score (Battle and colleagues 2019) predicts mortality in a patient who already has a bloodstream infection. Five BINARY items, one point each, 0 to ${Q.QPITT_MAX}: ${Q.ITEMS.map((i) => i.text).join('; ')}. HIGH RISK IS ${Q.HIGH_RISK_THRESHOLD} OR MORE - only ${Q.HIGH_RISK_THRESHOLD} of ${Q.QPITT_MAX} - across which derivation mortality moved from ${Q.DERIVATION_BELOW_THRESHOLD} percent to ${Q.DERIVATION_AT_OR_ABOVE_THRESHOLD} percent. **FEVER SCORES NOTHING. ONLY HYPOTHERMIA DOES.** The temperature item is a single binary at under ${Q.TEMP_THRESHOLD_C} degrees C, so a patient at 40.5 degrees C scores EXACTLY THE SAME as one at 37.0. The predecessor awarded points for fever; the successor dropped that half of the item, and scoring "abnormal temperature" over-scores every febrile patient. **THE SUCCESSOR IS BINARY WHERE THE PREDECESSOR WAS WEIGHTED, OVER THE SAME FIVE DOMAINS**: \`pitt-bacteremia\` in this catalog runs 0 to ${Q.PREDECESSOR_MAX} with cardiac arrest worth 4 and graded bands, while here CARDIAC ARREST IS WORTH EXACTLY AS MUCH AS A RESPIRATORY RATE OF ${Q.RR_THRESHOLD}. A SCORE CANNOT BE CARRIED BETWEEN THE TWO. PREDICTED 28-DAY MORTALITY: ${[0, 1, 2, 3].map((s) => `${s} = ${Q.MORTALITY_BY_SCORE[s]} percent`).join('; ')}; 4 or more = ${Q.MORTALITY_BY_SCORE[4]} percent. **THE LADDER STOPS SHORT** - a score of 5 has NO figure of its own because the source's top row is "4 or more", so 4 and 5 both return ${Q.MORTALITY_BY_SCORE[5]} percent and \`mortalityFigureLumped\` is true; the lumping is the source's, not an approximation made here. ONE OPERATOR DIVERGES BETWEEN REPRODUCTIONS: the hypotension item appears as "under ${Q.SBP_THRESHOLD}" in some and "${Q.SBP_THRESHOLD} or below" in others, differing only at exactly ${Q.SBP_THRESHOLD}; the derivation reads below ${Q.SBP_THRESHOLD} mmHg or vasopressor use, which is applied. This is a MORTALITY PROGNOSTIC for an established bloodstream infection. It does NOT diagnose bacteremia, does NOT identify the organism or the source, and does NOT select an antibiotic. **A LOW SCORE IS NOT A REASON TO WITHHOLD OR NARROW EMPIRIC THERAPY**, since the score knows nothing about resistance, source control or the site of infection. It is NOT a sepsis screening tool for undifferentiated patients.`,
    compute: Q.qPitt,
    fields: Q.ITEMS.map((i) => ({
      dom: { hypothermia: 'qpitt-temp', hypotension: 'qpitt-sbp', respiratory: 'qpitt-rr', alteredMentalStatus: 'qpitt-mental', cardiacArrest: 'qpitt-arrest' }[i.key],
      arg: i.key, kind: 'enum', values: ['no', 'yes'], required: true,
      label: `${i.text}. ${i.detail}`,
    })),
  },
];
