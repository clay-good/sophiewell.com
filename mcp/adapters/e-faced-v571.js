// spec-v571 MCP wave: adapter for the E-FACED score in lib/e-faced-v571.js. The dom keys mirror the browser
// renderer (views/group-v571.js) and META['e-faced'].example.
//
// **THE PAPER'S OWN ABSTRACT CONTRADICTS ITS OWN RESULTS SECTION ON THE ADDED ITEM.** The abstract says the
// best cut point was at least TWO EXACERBATIONS in the previous year; the results section says at least ONE
// HOSPITALIZATION and builds the model and its table around that. Those are DIFFERENT QUESTIONS - a count
// of any-severity exacerbations against a single severe one. The body describes the actual model
// construction, so it governs, and the summary states the discrepancy because an agent that has read only
// the abstract will otherwise believe this tool has the wrong item.
//
// **THE BANDS DO NOT CARRY OVER FROM FACED, AND A WIDELY COPIED SOURCE GETS THIS WRONG.** FACED is 0-7 with
// bands 0-2 / 3-4 / 5-7. E-FACED is 0-9 with bands 0-3 / 4-6 / 7-9. At least one widely reproduced
// secondary source lists the E-FACED COMPONENTS under the FACED BANDS, which calls a score of 5 "severe"
// when E-FACED calls it moderate. That live error is much of the reason this tile exists.
//
// **THE SUCCESSOR ANSWERS A DIFFERENT QUESTION.** FACED predicts MORTALITY; E-FACED predicts EXACERBATIONS,
// with essentially unchanged mortality performance. Choosing between them is choosing the outcome, not
// picking the newer one.
//
// **THE WEIGHTING IS UNEVEN: SIX ITEMS BUT NINE POINTS.** Exacerbation, FEV1 and age carry 2 each;
// Pseudomonas, extension and dyspnea carry 1 each.

import * as E from '../../lib/e-faced-v571.js';

export default [
  {
    id: 'e-faced',
    summary: `The E-FACED score (Martinez-Garcia and colleagues 2017) for the risk of FUTURE EXACERBATIONS in bronchiectasis. It is the exacerbation-augmented SUCCESSOR to FACED by the same authors. SIX ITEMS, ${E.E_FACED_MAX} POINTS: at least one SEVERE exacerbation in the previous year 2 points; FEV1 under 50 percent predicted 2; age 70 or over 2; chronic Pseudomonas aeruginosa colonization 1; radiological extension involving more than 2 lobes 1; dyspnea at mMRC grade 3 or 4 1. BANDS: 0 to 3 mild, 4 to 6 moderate, 7 to ${E.E_FACED_MAX} severe. **THE SUCCESSOR ANSWERS A DIFFERENT QUESTION FROM ITS PREDECESSOR**: FACED was built to predict MORTALITY and E-FACED to predict EXACERBATIONS, and the mortality performance is essentially unchanged between them, so choosing between the two is choosing which outcome is being asked about rather than simply taking the newer score. **THE PAPER'S OWN ABSTRACT CONTRADICTS ITS OWN RESULTS SECTION ON THE ADDED ITEM**: the abstract says the best cut point was at least TWO EXACERBATIONS in the previous year, while the results section says at least ONE HOSPITALIZATION and builds the model and its table around that. Those are different questions - a count of any-severity exacerbations against a single severe one. The body describes the actual model construction, so it governs here, and the paper's own methods define a severe exacerbation as one the physician considered to require hospitalization. An agent that has read only the abstract will believe this tool has the wrong item; it does not. **THE BANDS DO NOT CARRY OVER FROM FACED**: FACED runs 0 to ${E.FACED_MAX} with bands 0-2 mild, 3-4 moderate and 5-7 severe, while E-FACED runs 0 to ${E.E_FACED_MAX} with bands 0-3, 4-6 and 7-9. At least one widely reproduced secondary source lists the E-FACED COMPONENTS under the FACED BANDS, which would call a score of 5 severe when E-FACED calls it moderate - a live error in circulation, and much of the reason this tile exists. **THE WEIGHTING IS UNEVEN, SIX ITEMS BUT NINE POINTS**: the exacerbation item, FEV1 and age carry 2 points each while Pseudomonas colonization, radiological extension and dyspnea carry 1 each, so the items must not be treated as equal. This predicts exacerbation risk at a GROUP level. It does NOT diagnose bronchiectasis, which is a radiological diagnosis, and does NOT identify its cause - which matters, because cystic fibrosis, immunodeficiency, allergic bronchopulmonary aspergillosis and nontuberculous mycobacterial disease all require specific treatment this score knows nothing about. It does not select antibiotics, airway clearance or long-term suppressive therapy, and a high score is not by itself an indication for any of them.`,
    compute: E.eFaced,
    fields: E.E_FACED_ITEMS.map((item) => ({
      dom: `efaced-${item.key}`, arg: item.key, kind: 'enum', values: ['no', 'yes'], required: true,
      label: `${item.letter}: ${item.text}. ${item.points} point${item.points === 1 ? '' : 's'}.${item.detail ? ` ${item.detail}` : ''}`,
    })),
  },
];
