// spec-v1563 MCP adapter: chagas-stage-treatment in lib/chagas-stage-treatment-v1563.js.
// The dom keys mirror views/group-v1563.js and META['chagas-stage-treatment'].example. Clinical domain.

import * as M from '../../lib/chagas-stage-treatment-v1563.js';

export default [
  {
    id: 'chagas-stage-treatment',
    summary: 'Stages Chagas disease and says whether to treat (SBC 2023, PAHO 2019). Stage A to D, the decision by phase, age and stage, and benznidazole or nifurtimox doses by weight.',
    compute: M.chagasStageTreatment,
    fields: [
      { dom: 'ch-phase', arg: 'phase', kind: 'enum', required: true, label: 'Phase', values: M.PHASE_OPTIONS.map((d) => d.value) },
      { dom: 'ch-age', arg: 'age', kind: 'number', required: true, label: 'Age in years', min: 0, max: 110 },
      { dom: 'ch-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight in kg', min: 1, max: 200 },
      { dom: 'ch-ecg', arg: 'ecg', kind: 'enum', label: 'Chronic: ECG', values: M.ECG_OPTIONS.map((d) => d.value) },
      { dom: 'ch-lvef', arg: 'lvef', kind: 'number', label: 'Chronic: LVEF % (optional)', min: 5, max: 85 },
      { dom: 'ch-hf', arg: 'hf', kind: 'enum', label: 'Chronic: heart failure', values: M.HF_OPTIONS.map((d) => d.value) },
      { dom: 'ch-dig', arg: 'digestive', kind: 'enum', label: 'Chronic: digestive form', values: M.DIG_OPTIONS.map((d) => d.value) },
      { dom: 'ch-preg', arg: 'pregnant', kind: 'enum', label: 'Pregnant', values: M.YES_NO.map((d) => d.value) },
    ],
  },
];
