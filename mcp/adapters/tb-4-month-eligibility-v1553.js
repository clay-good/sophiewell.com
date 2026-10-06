// spec-v1553 MCP adapter: tb-4-month-eligibility in lib/tb-4-month-eligibility-v1553.js.
// The dom keys mirror views/group-v1553.js and META['tb-4-month-eligibility'].example. Clinical domain.

import * as M from '../../lib/tb-4-month-eligibility-v1553.js';

export default [
  {
    id: 'tb-4-month-eligibility',
    summary: 'Says whether a child can take the WHO 4-month TB regimen. For non-severe drug-susceptible TB from 3 months to 16 years, by Box 5.3 for each setting, with the exclusions and when to add ethambutol.',
    compute: M.tb4MonthEligibility,
    fields: [
      { dom: 't4-age', arg: 'age', kind: 'number', required: true, label: 'Age in years (for infants, 3 months = 0.25)', min: 0, max: 25 },
      { dom: 't4-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight in kg', min: 0.5, max: 150 },
      { dom: 't4-setting', arg: 'setting', kind: 'enum', required: true, label: 'What is available', values: M.SETTING_OPTIONS.map((d) => d.value) },
      { dom: 't4-cxr', arg: 'cxr', kind: 'enum', label: 'Chest X-ray pattern', values: M.CXR_OPTIONS.map((d) => d.value) },
      { dom: 't4-bact', arg: 'bact', kind: 'enum', label: 'Xpert or smear result', values: M.BACT_OPTIONS.map((d) => d.value) },
      { dom: 't4-periph', arg: 'periph', kind: 'enum', required: true, label: 'Isolated peripheral lymph node TB', values: M.YES_NO.map((d) => d.value) },
      { dom: 't4-signs', arg: 'signs', kind: 'enum', required: true, label: 'Any danger or high-priority sign, asymmetric persistent wheeze, other extrapulmonary TB, SAM, respiratory distress, fever over 39 °C, severe pallor, restlessness, irritability or lethargy', values: M.YES_NO.map((d) => d.value) },
      { dom: 't4-pneumonia', arg: 'pneumonia', kind: 'enum', required: true, label: 'Severe acute pneumonia', values: M.YES_NO.map((d) => d.value) },
      { dom: 't4-prior', arg: 'prior', kind: 'enum', required: true, label: 'TB treated in the past 2 years', values: M.YES_NO.map((d) => d.value) },
      { dom: 't4-dr', arg: 'dr', kind: 'enum', required: true, label: 'Drug-resistant TB suspected or known', values: M.YES_NO.map((d) => d.value) },
      { dom: 't4-hiv', arg: 'hiv', kind: 'enum', required: true, label: 'Living with HIV', values: M.YES_NO.map((d) => d.value) },
      { dom: 't4-highprev', arg: 'highprev', kind: 'enum', label: 'High HIV or isoniazid-resistance setting', values: M.YES_NO.map((d) => d.value) },
    ],
  },
];
