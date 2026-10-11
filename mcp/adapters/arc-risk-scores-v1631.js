// spec-v1631 MCP adapter: arc-risk-scores in lib/arc-risk-scores-v1631.js. The dom keys mirror
// views/group-v1631.js and META['arc-risk-scores'].example. Clinical domain. Udy 2013 and Barletta
// 2017; the ARC total has no published cutoff and is shown without a band.

import * as AR from '../../lib/arc-risk-scores-v1631.js';

export default [
  {
    id: 'arc-risk-scores',
    summary: 'Two screening scores for augmented renal clearance in critical illness. The ARC score (Udy 2013) adds points for age, trauma and a low modified SOFA; it has no published cutoff. The ARCTIC score (Barletta 2017) applies to trauma patients with a creatinine of 1.3 mg/dL or less, with 6 or higher as its cutoff. Neither measures clearance.',
    compute: AR.arcRiskScores,
    fields: [
      { dom: 'ar-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'ar-sex', arg: 'sex', kind: 'enum', required: true, values: AR.SEXES.map((s) => s.value), label: 'Sex' },
      { dom: 'ar-scr', arg: 'creatinine', kind: 'number', required: true, label: 'Serum creatinine', unit: 'mg/dL' },
      { dom: 'ar-trauma', arg: 'trauma', kind: 'enum', required: true, values: AR.YES_NO.map((y) => y.value), label: 'Admission after trauma (yes or no)' },
      { dom: 'ar-sofa', arg: 'modifiedSofa', kind: 'number', required: true, label: 'Modified SOFA score (SOFA without the neurological part)' },
    ],
  },
];
