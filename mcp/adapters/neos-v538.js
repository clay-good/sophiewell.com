// spec-v538 MCP wave: adapter for the NEOS score in lib/neos-v538.js. The dom keys mirror the browser
// renderer (views/group-v538.js) and META['neos'].example: neos-<key> maps to the lib arg <key>.
//
// **THE COMPUTE RESULT RETURNS `probability: null` FOR A SCORE OF 2 OR 3, AND THAT IS THE DESIGN POINT.**
// The derivation paper published a probability of poor one-year status only for a score of 0 or 1 and for 4
// or 5; it pooled groups of twenty patients or fewer with adjacent scores to avoid unstable estimates, so no
// figure for 2 or 3 is printed anywhere in it or in the validation literature. Figures for those scores do
// circulate. An agent asked "what is the probability for NEOS 3?" will find one and repeat it, so this tool
// returns an explicit null plus a `probabilityPublished` boolean and a sentence explaining the omission -
// which is more useful, and more honest, than a number nobody published.
//
// THE ABNORMAL-MRI FIELD KEEPS THE SOURCE'S LOOSE DEFINITION and its label says so. The derivation
// classified an MRI as abnormal on the referring physician's opinion. An agent that substituted a specific
// radiologic criterion would be scoring a different variable from the one validated.
//
// THE SUMMARY STATES THAT THE SCORE IS NOT AVAILABLE AT PRESENTATION. Two of the five predictors require
// four weeks to have elapsed, so an agent asked to compute NEOS on a newly admitted patient should say the
// score cannot yet be computed rather than scoring those predictors as "no", which would silently return a
// falsely reassuring total.
//
// AND THE SAFETY FRAME, WHICH EVERY BAND CARRIES: a high score identifies a group with worse average
// outcomes, not a prediction for an individual, and is NOT a basis for withdrawing or limiting treatment.
// Anti-NMDAR encephalitis is a disease in which prolonged severe illness is compatible with good recovery
// over eighteen to twenty-four months, which makes premature pessimism the specific harm here.

import * as N from '../../lib/neos-v538.js';

export default [
  {
    id: 'neos',
    summary: 'The NEOS score (Balu and colleagues 2019) predicts poor functional status one year after anti-NMDA receptor encephalitis, defined as a modified Rankin Scale of 3 or more. Five predictors score one point each: admission to an intensive care unit, no treatment started within 4 weeks of symptom onset, no clinical improvement 4 weeks after starting treatment by tumor removal or immunotherapy, an abnormal MRI, and a CSF white cell count above 20 cells per microlitre. Total 0 to 5. IMPORTANT: the source published a probability of poor one-year status ONLY for a score of 0 or 1, at 3 percent, and for a score of 4 or 5, at 69 percent. It pooled groups of twenty patients or fewer with adjacent scores to avoid unstable estimates, so NO probability was printed for a score of 2 or 3, and this tool returns null for those scores rather than a figure. Numbers for scores of 2 and 3 do circulate but appear in no primary source; do not report one. The abnormal-MRI predictor was defined loosely in the derivation, on the referring physician\'s opinion of findings consistent with or suggestive of encephalitis, and that loose definition is what was validated, so do not substitute a specific radiologic criterion. Two of the five predictors concern treatment timing and both require four weeks to have elapsed, which means this score CANNOT BE COMPUTED AT PRESENTATION: for a newly admitted patient, say the score is not yet available rather than scoring those predictors as absent, which would return a falsely reassuring total. Anti-NMDA receptor encephalitis is a disease in which prolonged and severe illness is compatible with good recovery, and recovery often continues over eighteen to twenty-four months. A high score identifies a group with worse average one-year outcomes; it is NOT a prediction for the individual patient and it is NOT a basis for withdrawing or limiting treatment. It does not diagnose anti-NMDA receptor encephalitis, which requires the clinical syndrome together with antibody testing, and it does not select or sequence immunotherapy.',
    compute: N.neos,
    fields: N.NEOS_PREDICTORS.map((p) => ({
      dom: `neos-${p.key}`,
      arg: p.key,
      kind: 'enum',
      values: ['no', 'yes'],
      required: true,
      label: `${p.text}? ${p.detail}`,
    })),
  },
];
