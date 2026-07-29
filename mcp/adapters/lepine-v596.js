// spec-v596 MCP wave: adapter for the Lepine criteria in lib/lepine-v596.js. The dom keys mirror the browser
// renderer (views/group-v596.js) and META['lepine'].example.
//
// **THE TWO RULES USE THE SAME TWO TESTS WITH THRESHOLDS THAT MOVE IN OPPOSITE DIRECTIONS.** Lepine's LDH
// bar is HIGHER than Heffner's (0.6 against 0.45 times the serum upper limit, so HARDER to trigger) while
// its cholesterol bar is LOWER (40 against 45 mg/dL, so EASIER to trigger). **NEITHER RULE DOMINATES THE
// OTHER**: each calls some effusions exudative that the other calls transudative, in BOTH directions. Both
// are returned from the same inputs and `disagreementAxis` names which measurement caused any disagreement.
//
// **THE TRADE IS SPECIFICITY, AND IT IS LARGE**: Lepine 0.91 sensitive and 0.73 specific against Heffner's
// 0.93 and 0.58 - about 15 points of specificity for about 2 of sensitivity. Calling Lepine the alternative
// comparable to Light's criteria is a statement about SPECIFICITY, not overall superiority.
//
// **IT IS AN OR RULE AND THE TESTS DO NOT VOTE.** One positive test classifies the effusion as an exudate; a
// negative second test does not outweigh it. Reading either rule as requiring BOTH tests would call almost
// every exudate a transudate.
//
// **IT IS NOT ACTUALLY SERUM-FREE, AND THE EXCEPTION IS THE LDH TEST**: it compares pleural fluid LDH
// against a MULTIPLE OF THE LABORATORY'S UPPER LIMIT OF NORMAL FOR SERUM LDH. No patient blood is drawn, but
// that upper limit is NOT a fixed number - it differs between laboratories and assays - so the local value
// is REQUIRED and an LDH cutoff must never be hard-coded.

import * as L from '../../lib/lepine-v596.js';

export default [
  {
    id: 'lepine',
    summary: `The LEPINE CRITERIA classify a pleural effusion as exudative WITHOUT A PAIRED SERUM SAMPLE. **IT IS AN OR RULE**: EITHER pleural fluid LDH above ${L.LDH_MULTIPLIER} times the laboratory upper limit of normal for SERUM LDH, OR pleural fluid cholesterol above ${L.CHOLESTEROL_THRESHOLD} mg/dL (${L.CHOLESTEROL_THRESHOLD_MMOL} mmol/L), classifies the effusion as an EXUDATE. **THE TESTS DO NOT VOTE** - one positive is enough and a negative second test does not outweigh it; reading this as requiring BOTH tests would call almost every exudate a transudate. **IT USES THE SAME TWO MEASUREMENTS AS THE HEFFNER TWO-TEST RULE** (\`heffner\` in this catalog) **WITH THRESHOLDS THAT MOVE IN OPPOSITE DIRECTIONS**: Lepine's LDH bar is HIGHER (${L.LDH_MULTIPLIER} against ${L.HEFFNER_LDH_MULTIPLIER}, so HARDER to trigger) while its cholesterol bar is LOWER (${L.CHOLESTEROL_THRESHOLD} against ${L.HEFFNER_CHOLESTEROL_THRESHOLD} mg/dL, so EASIER to trigger). **NEITHER RULE DOMINATES THE OTHER** - each calls some effusions exudative that the other calls transudative, in BOTH directions. Both verdicts are returned from the same inputs and \`disagreementAxis\` names which measurement caused any disagreement. **THE TRADE IS SPECIFICITY, AND IT IS LARGE**: Lepine ran ${L.LEPINE_SENSITIVITY} sensitive and ${L.LEPINE_SPECIFICITY} specific against Heffner's ${L.HEFFNER_SENSITIVITY} and ${L.HEFFNER_SPECIFICITY} in a head-to-head comparison, about 15 points of specificity for about 2 of sensitivity, so describing Lepine as the alternative comparable to Light's criteria is a statement about SPECIFICITY rather than overall superiority. **IT IS NOT ACTUALLY SERUM-FREE, AND THE EXCEPTION IS THE LDH TEST**: cholesterol uses the pleural fluid alone, but the LDH test needs THE LABORATORY'S upper limit of normal for SERUM LDH - a reference value, not the patient's blood, so no extra sample is drawn, but NOT a fixed number, because it differs between laboratories and assays. The local value is REQUIRED, none is defaulted, and an LDH cutoff must NEVER be hard-coded. DIURETIC treatment concentrates a transudate and can push any of these rules toward a false exudate. This CLASSIFIES an effusion and does NOT give the CAUSE - an exudate can be infection, malignancy, pulmonary embolism or many other things, and the classification is the BEGINNING of the workup, not the end. It does NOT indicate or contraindicate drainage, does NOT diagnose empyema or malignancy, and a transudative result does NOT exclude a coexisting exudative process.`,
    compute: L.lepine,
    fields: [
      { dom: 'lep-ldh', arg: 'pleuralLdh', kind: 'number', unit: 'U/L', required: true, label: 'Pleural fluid LDH.' },
      { dom: 'lep-uln', arg: 'serumLdhUln', kind: 'number', unit: 'U/L', required: true, label: `THE LABORATORY'S upper limit of normal for SERUM LDH - a reference value, not the patient's blood. REQUIRED AND NOT DEFAULTED: Lepine's cutoff is ${L.LDH_MULTIPLIER} times this and Heffner's is ${L.HEFFNER_LDH_MULTIPLIER} times it, and both differ between laboratories.` },
      { dom: 'lep-chol', arg: 'pleuralCholesterol', kind: 'number', unit: 'mg/dL', required: true, label: `Pleural fluid cholesterol. Exudate above ${L.CHOLESTEROL_THRESHOLD} mg/dL - LOWER than Heffner's ${L.HEFFNER_CHOLESTEROL_THRESHOLD}, so easier to trigger on this axis.` },
    ],
  },
];
