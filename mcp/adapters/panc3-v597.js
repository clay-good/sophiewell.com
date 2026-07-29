// spec-v597 MCP wave: adapter for the PANC 3 score in lib/panc3-v597.js. The dom keys mirror the browser
// renderer (views/group-v597.js) and META['panc3'].example.
//
// **THE RULE IS ALL THREE, NOT A MAJORITY.** Two of three does NOT predict severe pancreatitis. The score
// runs 0 to 3 and ONLY A 3 IS POSITIVE, which makes this a conjunction wearing a score's clothing. A "2 or
// more" threshold over-calls severity.
//
// **IT IS A RULE-IN TEST AND ITS SENSITIVITY IS THE POINT OF FAILURE.** Reported specificity 96 to 100
// percent against reported sensitivity 50 to 75 percent. A POSITIVE result is strong evidence; **A NEGATIVE
// RESULT MISSES BETWEEN A QUARTER AND A HALF OF SEVERE CASES** and is NOT a reason to send a patient home or
// stand down monitoring. Every negative result carries that warning - report it.
//
// **WIDELY REPRODUCED SECONDARY SOURCES PRINT TWO OF THE THREE UNITS WRONG**: hematocrit as "mg/dL" when it
// is a PERCENTAGE with no mass concentration, and body mass index as "mg/kg squared" instead of kg/m
// squared. The values 44 and 30 are right; those units are not.
//
// **IT IS AN ADMISSION SCORE**, which is its entire reason for existing: `ranson-bisap` and `glasgow-imrie`
// in this catalog need 48 HOURS. The outcome predicted is organ failure PERSISTING BEYOND 48 HOURS graded by
// the modified Marshall score (`modified-marshall`, also in this catalog), so PANC 3 is an admission-time
// prediction of a 48-hour outcome.
//
// **AMYLASE AND LIPASE ARE NOT INPUTS.** Hemoconcentration, obesity and a pleural effusion are three
// unrelated mechanisms; the enzymes that DIAGNOSE pancreatitis play no part in predicting its severity.

import * as P from '../../lib/panc3-v597.js';

export default [
  {
    id: 'panc3',
    summary: `The PANC 3 SCORE (Brown and colleagues 2007) predicts SEVERE acute pancreatitis from three items available AT ADMISSION: ${P.CRITERIA.map((c) => c.text).join('; ')}. **THE RULE IS ALL ${P.CRITERIA_REQUIRED}, NOT A MAJORITY** - the score runs 0 to ${P.CRITERIA_TOTAL} and ONLY A ${P.CRITERIA_REQUIRED} IS POSITIVE, so two of three does NOT predict severe disease and a "2 or more" threshold over-calls severity. This is a conjunction wearing a score's clothing. **IT IS A RULE-IN TEST AND ITS SENSITIVITY IS THE POINT OF FAILURE**: reported specificity ${P.SPECIFICITY_RANGE} against reported sensitivity ${P.SENSITIVITY_RANGE}. A POSITIVE result is strong evidence; **A NEGATIVE RESULT MISSES BETWEEN A QUARTER AND A HALF OF SEVERE CASES**, so using it to send a patient home or stand down monitoring INVERTS what the score is good for, and every negative result carries that warning. **WIDELY REPRODUCED SECONDARY SOURCES PRINT TWO OF THE THREE UNITS WRONG**: hematocrit as "mg/dL" when it is a PERCENTAGE with no mass concentration, and body mass index as "mg/kg squared" instead of kg/m squared. The values ${P.HEMATOCRIT_THRESHOLD} and ${P.BMI_THRESHOLD} are right; those units are not. **IT IS AN ADMISSION SCORE**, which is its entire reason for existing, because \`ranson-bisap\` and \`glasgow-imrie\` in this catalog need 48 HOURS. The outcome predicted is ORGAN FAILURE PERSISTING BEYOND 48 HOURS graded by the modified Marshall score, so this is an admission-time prediction of a 48-hour outcome. **AMYLASE AND LIPASE ARE NOT INPUTS**: hemoconcentration, obesity and a pleural effusion are three unrelated mechanisms, and the enzymes that DIAGNOSE pancreatitis play no part in predicting its severity. This predicts severity in a patient who ALREADY HAS a diagnosis of acute pancreatitis. It does NOT diagnose pancreatitis, does NOT identify the CAUSE - which matters, because gallstone pancreatitis may need intervention this score knows nothing about - does NOT set fluid rates, does NOT indicate antibiotics (not indicated for sterile necrosis), and does NOT indicate imaging. **A NEGATIVE RESULT IS NOT A REASON TO WITHHOLD MONITORING** in a patient who looks unwell.`,
    compute: P.panc3,
    fields: [
      { dom: 'panc3-hct', arg: 'hematocrit', kind: 'number', unit: '%', required: true, label: `Hematocrit as a PERCENTAGE. Positive above ${P.HEMATOCRIT_THRESHOLD}. Reproductions print this unit as "mg/dL", which is wrong - hematocrit has no mass concentration.` },
      { dom: 'panc3-bmi', arg: 'bmi', kind: 'number', unit: 'kg/m^2', required: true, label: `Body mass index in kg/m squared. Positive above ${P.BMI_THRESHOLD}. Reproductions print this unit as "mg/kg squared", which is wrong.` },
      { dom: 'panc3-effusion', arg: 'pleuralEffusion', kind: 'enum', values: ['no', 'yes'], required: true, label: 'Pleural effusion on the chest radiograph.' },
    ],
  },
];
