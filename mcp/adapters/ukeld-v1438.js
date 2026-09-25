// spec-v1438: MCP adapter. The dom keys mirror views/group-v1438.js and this tile's META example.
// Creatinine and bilirubin are canonical mg/dL; the library converts to umol/L for the formula.

import * as UK from '../../lib/ukeld-v1438.js';

export default [
  {
    id: 'ukeld',
    summary: 'Computes UKELD, the United Kingdom model for end-stage liver disease, from INR, creatinine, bilirubin and sodium. It compares the score with 49, the UK threshold for listing for elective liver transplantation, and says the score is not interchangeable with MELD.',
    compute: UK.ukeld,
    fields: [
      { dom: 'uk-inr', arg: 'inr', kind: 'number', required: true, label: 'INR' },
      { dom: 'uk-creat', arg: 'creatinineMgDl', kind: 'number', required: true, label: 'Serum creatinine', unit: 'mg/dL' },
      { dom: 'uk-bili', arg: 'bilirubinMgDl', kind: 'number', required: true, label: 'Total bilirubin', unit: 'mg/dL' },
      { dom: 'uk-na', arg: 'sodium', kind: 'number', required: true, label: 'Serum sodium', unit: 'mmol/L' },
    ],
  },
];
