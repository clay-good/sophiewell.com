// spec-v684 MCP adapter: fractional excretion of potassium (FEK) in
// lib/fractional-excretion-potassium-v684.js. The dom keys mirror the browser renderer
// (views/group-v684.js) and META['fractional-excretion-potassium'].example. Four
// concentrations; a formula returns FEK %. Clinical domain.

import { fractionalExcretionPotassium } from '../../lib/fractional-excretion-potassium-v684.js';

export default [
  {
    id: 'fractional-excretion-potassium',
    summary: 'Fractional excretion of potassium (FEK) = (urine K x plasma creatinine) / (plasma K x urine creatinine) x 100. Distinguishes renal from extrarenal potassium handling. Typical diet averages ~8% (4-16%). Hypokalemia: <10% extrarenal, >20% renal wasting. Hyperkalemia: low FEK with preserved renal function suggests impaired excretion. Units cancel.',
    compute: fractionalExcretionPotassium,
    fields: [
      { dom: 'fek-uk', arg: 'urineK', kind: 'number', unit: 'mEq/L', required: true, label: 'Urine potassium (mEq/L)' },
      { dom: 'fek-pk', arg: 'plasmaK', kind: 'number', unit: 'mEq/L', required: true, label: 'Plasma/serum potassium (mEq/L)' },
      { dom: 'fek-ucr', arg: 'urineCr', kind: 'number', unit: 'mg/dL', required: true, label: 'Urine creatinine (mg/dL)' },
      { dom: 'fek-pcr', arg: 'plasmaCr', kind: 'number', unit: 'mg/dL', required: true, label: 'Plasma/serum creatinine (mg/dL)' },
    ],
  },
];
