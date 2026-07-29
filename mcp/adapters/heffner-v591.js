// spec-v591 MCP wave: adapter for the Heffner criteria in lib/heffner-v591.js. The dom keys mirror the
// browser renderer (views/group-v591.js) and META['heffner'].example.
//
// **"NO SERUM SAMPLE NEEDED" IS NOT QUITE TRUE, AND THE EXCEPTION IS THE LDH TEST.** Cholesterol and protein
// use the pleural fluid alone. The LDH test compares pleural fluid LDH against 0.45 times THE LABORATORY'S
// UPPER LIMIT OF NORMAL FOR SERUM LDH - a reference value, not the patient's blood, so no extra sample is
// drawn, but NOT A FIXED NUMBER, because the upper limit of normal differs between laboratories and assays.
// The local value is a REQUIRED input and none is defaulted. Do not hard-code an LDH cutoff.
//
// **THE THRESHOLDS ARE DELIBERATELY NOT THE ROUND NUMBERS THEY RESEMBLE**: protein is 2.9 g/dL, NOT 3.0, and
// the LDH multiplier is 0.45, NOT the two-thirds that Light's criteria use. Each was re-derived for use
// without a serum comparison, so "protein over 3" and "LDH over two-thirds" are DIFFERENT TESTS.
//
// **THERE ARE TWO PUBLISHED RULES AND THE NUMBER OF TESTS IS A CHOICE.** The protein test can be dropped
// without loss of accuracy, giving a TWO-TEST rule (LDH or cholesterol) alongside the THREE-TEST rule. Both
// are returned; `rulesDisagree` is true exactly when protein is the only positive test. Which rule a source
// means by "Heffner's criteria" is often left unstated, so report both.
//
// **ANY ONE TEST IS ENOUGH; THEY DO NOT VOTE.** One positive classifies the effusion as an exudate, and two
// negatives do not outweigh it. There is no count and no majority.
//
// **THE TRADE IS SPECIFICITY, AND IT IS A LARGE ONE**: about 98.4 percent sensitivity and about 85 percent
// specificity, against far higher specificity for Light's criteria, which already misclassify 15 to 20
// percent of transudates as exudates. A positive result here is WEAKER evidence of an exudate than a
// positive Light's result.

import * as H from '../../lib/heffner-v591.js';

export default [
  {
    id: 'heffner',
    summary: `The HEFFNER CRITERIA, also called the ABBREVIATED LIGHT'S CRITERIA, classify a pleural effusion as exudative WITHOUT A PAIRED SERUM SAMPLE. **ANY ONE of three tests classifies the effusion as an EXUDATE**: ${H.TESTS.map((t) => t.text).join('; ')}. **THE TESTS DO NOT VOTE** - one positive is enough, and two negatives do not outweigh it. **"NO SERUM SAMPLE NEEDED" IS NOT QUITE TRUE, AND THE EXCEPTION IS THE LDH TEST**: cholesterol and protein use the pleural fluid alone, but the LDH test compares pleural fluid LDH against ${H.LDH_MULTIPLIER} times THE LABORATORY'S UPPER LIMIT OF NORMAL FOR SERUM LDH. That is a reference value rather than the patient's blood, so no extra sample is drawn - but it is NOT A FIXED NUMBER, because the upper limit of normal differs between laboratories and assays. The local value is a REQUIRED input, none is defaulted, and an LDH cutoff must never be hard-coded. **THE THRESHOLDS ARE DELIBERATELY NOT THE ROUND NUMBERS THEY RESEMBLE**: protein is ${H.PROTEIN_THRESHOLD} g/dL and NOT 3.0, and the LDH multiplier is ${H.LDH_MULTIPLIER} and NOT the two-thirds Light's criteria use. Each was re-derived for use without a serum comparison, so "protein over 3" and "LDH over two-thirds" are DIFFERENT TESTS, not roundings of these. **THERE ARE TWO PUBLISHED RULES AND THE NUMBER OF TESTS IS A CHOICE**: the protein test can be dropped without loss of accuracy, giving a TWO-TEST rule of LDH or cholesterol alongside the THREE-TEST rule. Both are returned, and \`rulesDisagree\` is true exactly when protein is the only positive test; which rule a source means by "Heffner's criteria" is often left unstated, so report both. **THE TRADE IS SPECIFICITY, AND IT IS A LARGE ONE**: the three-test rule runs about ${H.THREE_TEST_SENSITIVITY} percent sensitive and about ${H.THREE_TEST_SPECIFICITY} percent specific, while Light's criteria are far more specific and already misclassify 15 to 20 percent of transudates as exudates. This rule buys freedom from a serum draw by calling MORE transudates exudative, so **A POSITIVE RESULT HERE IS WEAKER EVIDENCE OF AN EXUDATE THAN A POSITIVE LIGHT'S RESULT**. A failure mode shared with Light's: DIURETIC TREATMENT concentrates a transudate and pushes protein and LDH upward, so a patient diuresed for heart failure can be misclassified as exudative by either rule. This CLASSIFIES an effusion and does NOT give the CAUSE of either category - an exudate can be infection, malignancy, pulmonary embolism or many other things, and the classification is the BEGINNING of the workup, not the end. It does NOT indicate or contraindicate drainage, does NOT diagnose empyema or malignancy, and a transudative result does NOT exclude a coexisting exudative process.`,
    compute: H.heffner,
    fields: [
      { dom: 'heff-ldh', arg: 'pleuralLdh', kind: 'number', unit: 'U/L', required: true, label: 'Pleural fluid LDH.' },
      { dom: 'heff-uln', arg: 'serumLdhUln', kind: 'number', unit: 'U/L', required: true, label: `THE LABORATORY'S upper limit of normal for SERUM LDH - a reference value, not the patient's blood. REQUIRED AND NOT DEFAULTED: the cutoff is ${H.LDH_MULTIPLIER} times this, and it differs between laboratories and assays.` },
      { dom: 'heff-chol', arg: 'pleuralCholesterol', kind: 'number', unit: 'mg/dL', required: true, label: `Pleural fluid cholesterol. Exudate above ${H.CHOLESTEROL_THRESHOLD} mg/dL.` },
      { dom: 'heff-protein', arg: 'pleuralProtein', kind: 'number', unit: 'g/dL', required: true, label: `Pleural fluid protein. Exudate above ${H.PROTEIN_THRESHOLD} g/dL - NOT 3.0. This is the test the two-test rule drops.` },
    ],
  },
];
