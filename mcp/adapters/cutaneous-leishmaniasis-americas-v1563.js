// spec-v1563 MCP adapter: cutaneous-leishmaniasis-americas in lib/cutaneous-leishmaniasis-americas-v1563.js.
// The dom keys mirror views/group-v1563.js and META['cutaneous-leishmaniasis-americas'].example. Clinical domain.

import * as M from '../../lib/cutaneous-leishmaniasis-americas-v1563.js';

export default [
  {
    id: 'cutaneous-leishmaniasis-americas',
    summary: 'Decides local or systemic treatment for cutaneous leishmaniasis (PAHO 2022). Lists the options with doses, including pregnancy, breastfeeding and abnormal-ECG choices, for adults.',
    compute: M.cutaneousLeishmaniasisAmericas,
    fields: [
      { dom: 'cla-n', arg: 'lesions', kind: 'number', required: true, label: 'Number of lesions', min: 1, max: 100 },
      { dom: 'cla-d', arg: 'diameter', kind: 'number', required: true, label: 'Largest lesion diameter in cm', min: 0.1, max: 50 },
      { dom: 'cla-a', arg: 'area', kind: 'number', label: 'Largest lesion area in mm² (optional)', min: 1, max: 100000 },
      { dom: 'cla-site', arg: 'site', kind: 'enum', required: true, label: 'A lesion on the head or near a joint', values: M.YES_NO.map((d) => d.value) },
      { dom: 'cla-imm', arg: 'immuno', kind: 'enum', required: true, label: 'Immunosuppressed', values: M.YES_NO.map((d) => d.value) },
      { dom: 'cla-fu', arg: 'followUp', kind: 'enum', required: true, label: 'Follow-up possible', values: M.YES_NO.map((d) => d.value) },
      { dom: 'cla-fail', arg: 'failed', kind: 'enum', label: 'Local treatment failed or relapsed', values: M.YES_NO.map((d) => d.value) },
      { dom: 'cla-preg', arg: 'pregnant', kind: 'enum', label: 'Pregnant', values: M.YES_NO.map((d) => d.value) },
      { dom: 'cla-bf', arg: 'breastfeeding', kind: 'enum', label: 'Breastfeeding', values: M.YES_NO.map((d) => d.value) },
      { dom: 'cla-ecg', arg: 'ecg', kind: 'enum', label: 'Abnormal ECG', values: M.YES_NO.map((d) => d.value) },
      { dom: 'cla-w', arg: 'weight', kind: 'number', label: 'Weight in kg (for systemic doses)', min: 20, max: 250 },
    ],
  },
];
