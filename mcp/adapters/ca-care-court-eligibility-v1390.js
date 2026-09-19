// spec-v1390: MCP adapter. The dom keys mirror views/group-v1390.js and this tile's META example.
// A blank criterion is "not assessed", never a pass.

import * as CARE from '../../lib/ca-care-court-eligibility-v1390.js';

const C = ['met', 'not-met'];

export default [
  {
    id: 'ca-care-court-eligibility',
    summary: 'Checks the six WIC 5972 criteria for California CARE Court and names any that fail. An adult with a serious mental disorder in the schizophrenia spectrum, or, since SB 27 (January 1, 2026), bipolar I disorder with psychotic features. The person is not stabilized in voluntary treatment, is deteriorating or needs support to prevent relapse, and CARE is the least restrictive alternative and likely to help. Psychosis from current intoxication, a medical or neurologic cause, and a substance use disorder alone do not qualify.',
    compute: CARE.caCareCourtEligibility,
    fields: [
      { dom: 'care-age', arg: 'age', kind: 'number', required: true, label: 'Age (years)' },
      { dom: 'care-dx', arg: 'diagnosis', kind: 'enum', required: true, label: 'Diagnosis', values: CARE.DIAGNOSES.map((d) => d.value) },
      { dom: 'care-serious', arg: 'serious', kind: 'enum', label: '(b) Serious mental disorder (5600.3)', values: C },
      { dom: 'care-stabilized', arg: 'notStabilized', kind: 'enum', label: '(c) Not stabilized in ongoing voluntary treatment', values: C },
      { dom: 'care-d1', arg: 'd1', kind: 'enum', label: '(d)(1) Unlikely to survive safely unsupervised, and deteriorating', values: C },
      { dom: 'care-d2', arg: 'd2', kind: 'enum', label: '(d)(2) Needs support to prevent relapse or deterioration', values: C },
      { dom: 'care-least', arg: 'leastRestrictive', kind: 'enum', label: '(e) CARE is the least restrictive alternative', values: C },
      { dom: 'care-benefit', arg: 'likelyBenefit', kind: 'enum', label: '(f) Likely to benefit from CARE', values: C },
    ],
  },
];
