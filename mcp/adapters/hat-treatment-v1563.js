// spec-v1563 MCP adapter: hat-treatment in lib/hat-treatment-v1563.js.
// The dom keys mirror views/group-v1563.js and META['hat-treatment'].example. Clinical domain.

import * as M from '../../lib/hat-treatment-v1563.js';

export default [
  {
    id: 'hat-treatment',
    summary: 'Stages sleeping sickness and gives the first-choice drug (WHO 2024). Gambiense or rhodesiense HAT: fexinidazole with or without a lumbar puncture, NECT, pentamidine, suramin or melarsoprol, with doses.',
    compute: M.hatTreatment,
    fields: [
      { dom: 'hat-form', arg: 'form', kind: 'enum', required: true, label: 'Form', values: M.FORM_OPTIONS.map((d) => d.value) },
      { dom: 'hat-age', arg: 'age', kind: 'number', required: true, label: 'Age in years', min: 0, max: 120 },
      { dom: 'hat-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight in kg', min: 1, max: 250 },
      { dom: 'hat-severe', arg: 'severe', kind: 'enum', label: 'Any sign suggesting severe disease (confusion, abnormal behavior, excessive talking, anxiety, poor coordination, tremor, weakness, speech or gait problems, abnormal movements, seizures)', values: M.YES_NO.map((d) => d.value) },
      { dom: 'hat-follow', arg: 'followUp', kind: 'enum', label: 'Reliable follow-up to detect relapse', values: M.YES_NO.map((d) => d.value) },
      { dom: 'hat-lp', arg: 'lp', kind: 'enum', label: 'Lumbar puncture', values: M.LP_OPTIONS.map((d) => d.value) },
      { dom: 'hat-wbc', arg: 'csfWbc', kind: 'number', label: 'CSF white cells per microL', min: 0, max: 10000 },
      { dom: 'hat-tryp', arg: 'trypCsf', kind: 'enum', label: 'Trypanosomes in the CSF', values: M.YES_NO.map((d) => d.value) },
      { dom: 'hat-preg', arg: 'pregnant', kind: 'enum', label: 'Pregnancy', values: M.PREG_OPTIONS.map((d) => d.value) },
      { dom: 'hat-swallow', arg: 'swallow', kind: 'enum', label: 'Able to swallow and keep tablets down (rhodesiense)', values: M.YES_NO.map((d) => d.value) },
    ],
  },
];
