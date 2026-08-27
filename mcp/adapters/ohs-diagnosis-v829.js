// spec-v829 MCP adapter: obesity hypoventilation syndrome in lib/ohs-diagnosis-v829.js.
// The dom keys mirror the browser renderer (views/group-v829.js) and
// META['ohs-diagnosis'].example. Clinical domain.

import { ohsDiagnosis } from '../../lib/ohs-diagnosis-v829.js';

export default [
  {
    id: 'ohs-diagnosis',
    summary: 'Applies the 2019 ATS definition of obesity hypoventilation syndrome: BMI 30 or more, sleep-disordered breathing, an awake resting PaCO2 of 45 mmHg or more at sea level, and exclusion of other causes. Also applies the guideline screening rule, where a serum bicarbonate under 27 mmol/L defers an arterial gas - but ONLY in low-to-moderate probability patients. Bicarbonate never makes or excludes the diagnosis.',
    compute: ohsDiagnosis,
    fields: [
      { dom: 'ohs-bmi', arg: 'bmi', kind: 'number', required: false, label: 'Body mass index, kg/m2' },
      { dom: 'ohs-sdb', arg: 'sleepDisorderedBreathing', kind: 'boolean', required: false, label: 'Sleep-disordered breathing' },
      { dom: 'ohs-paco2', arg: 'paco2', kind: 'number', required: false, label: 'Awake resting PaCO2, mmHg' },
      { dom: 'ohs-excluded', arg: 'otherCausesExcluded', kind: 'boolean', required: false, label: 'Other causes of hypoventilation excluded' },
      { dom: 'ohs-bicarb', arg: 'bicarbonate', kind: 'number', required: false, label: 'Serum bicarbonate, mmol/L' },
      { dom: 'ohs-highprob', arg: 'highProbability', kind: 'boolean', required: false, label: 'High pretest probability' },
    ],
  },
];
