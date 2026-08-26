// spec-v804 MCP adapter: Rome proposal ECOPD severity in lib/rome-ecopd-v804.js.
// The dom keys mirror the browser renderer (views/group-v804.js) and
// META['rome-ecopd'].example. Three of five variables above cutoff is moderate; the blood
// gas is a separate gate for severe. Clinical domain.

import { romeEcopd } from '../../lib/rome-ecopd-v804.js';

export default [
  {
    id: 'rome-ecopd',
    summary: 'Grades a COPD exacerbation at the point of care (Rome proposal, Celli 2021). Five variables have cutoffs - dyspnea VAS 5, respiratory rate 24, heart rate 95, oxygen saturation under 92% or a fall over 3%, CRP 10 mg/L - and at least THREE must be above cutoff for moderate; fewer is mild. Severe is a SEPARATE gate on the arterial blood gas needing BOTH hypercapnia over 45 mmHg AND pH under 7.35; hypercapnia alone is not severe.',
    compute: romeEcopd,
    fields: [
      { dom: 'rome-vas', arg: 'dyspneaVas', kind: 'number', required: false, label: 'Dyspnea VAS (0-10)' },
      { dom: 'rome-rr', arg: 'respiratoryRate', kind: 'number', required: false, label: 'Respiratory rate', unit: '/min' },
      { dom: 'rome-hr', arg: 'heartRate', kind: 'number', required: false, label: 'Heart rate', unit: '/min' },
      { dom: 'rome-spo2', arg: 'spo2', kind: 'number', required: false, label: 'Oxygen saturation', unit: '%' },
      { dom: 'rome-drop', arg: 'spo2DropFromBaseline', kind: 'number', required: false, label: 'Fall in saturation', unit: 'points' },
      { dom: 'rome-crp', arg: 'crp', kind: 'number', required: false, label: 'C-reactive protein', unit: 'mg/L' },
      { dom: 'rome-paco2', arg: 'paco2', kind: 'number', required: false, label: 'PaCO2', unit: 'mmHg' },
      { dom: 'rome-ph', arg: 'ph', kind: 'number', required: false, label: 'Arterial pH' },
    ],
  },
];
