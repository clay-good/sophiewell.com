// spec-v908 MCP adapter: the Hy's Law check in lib/hys-law-v908.js. The dom keys mirror the
// browser renderer (views/group-v908.js) and META['hys-law'].example.
//
// The labs alone return a POTENTIAL case; only the recorded exclusion of other causes turns it
// into a case. Clinical domain.

import { hysLaw } from '../../lib/hys-law-v908.js';

export default [
  {
    id: 'hys-law',
    summary: `Checks a liver-injury lab set against Hy's Law. The rule asks for an aminotransferase, ALT or AST, at or above 3x its upper limit of normal, a total bilirubin above 2x its upper limit, an alkaline phosphatase below 2x its upper limit, and no other reason for the combination. THE LABS ALONE MAKE A POTENTIAL CASE, NOT A CASE: the fourth criterion is a judgment rather than a measurement, and viral hepatitis A, B, C and E, other pre-existing or acute liver disease, and any other drug capable of the same injury have to be ruled out before a potential case becomes a Hy's Law case. A RAISED ALKALINE PHOSPHATASE TAKES THE PICTURE OUT of the rule, which was written for hepatocellular injury; a cholestatic picture carrying the same bilirubin is a different thing. And IT IS A SIGNAL ABOUT A DRUG, NOT A PROGNOSIS FOR A PATIENT -- the observation behind it is that a drug producing such cases in trials goes on to cause severe injury at a rate in the wider population.`,
    compute: hysLaw,
    fields: [
      { dom: 'hl-alt', arg: 'alt', kind: 'number', required: false, label: 'ALT', unit: 'U/L' },
      { dom: 'hl-altuln', arg: 'altUln', kind: 'number', required: false, label: 'ALT upper limit of normal', unit: 'U/L' },
      { dom: 'hl-ast', arg: 'ast', kind: 'number', required: false, label: 'AST, if higher than the ALT', unit: 'U/L' },
      { dom: 'hl-astuln', arg: 'astUln', kind: 'number', required: false, label: 'AST upper limit of normal', unit: 'U/L' },
      { dom: 'hl-bilirubin', arg: 'bilirubin', kind: 'number', required: true, label: 'Total bilirubin', unit: 'mg/dL' },
      { dom: 'hl-bilirubinuln', arg: 'bilirubinUln', kind: 'number', required: true, label: 'Total bilirubin upper limit of normal', unit: 'mg/dL' },
      { dom: 'hl-alp', arg: 'alp', kind: 'number', required: true, label: 'Alkaline phosphatase', unit: 'U/L' },
      { dom: 'hl-alpuln', arg: 'alpUln', kind: 'number', required: true, label: 'Alkaline phosphatase upper limit of normal', unit: 'U/L' },
      { dom: 'hl-othercausesexcluded', arg: 'otherCausesExcluded', kind: 'boolean', required: false, label: 'Other causes ruled out: viral hepatitis A, B, C and E, other liver disease, and any other drug capable of the same injury' },
    ],
  },
];
