// spec-v1562 MCP adapter: schisto-community-treatment in lib/schisto-community-treatment-v1562.js.
// The dom keys mirror views/group-v1562.js and META['schisto-community-treatment'].example. Clinical domain.

import * as M from '../../lib/schisto-community-treatment-v1562.js';

export default [
  {
    id: 'schisto-community-treatment',
    summary: 'A community program decision on schistosomiasis mass treatment by WHO 2022: yearly praziquantel from 10% prevalence (30% by POC-CCA), twice yearly after a poor response, and options under 10%.',
    compute: M.schistoCommunityTreatment,
    fields: [
      { dom: 'sct-prev', arg: 'prevalence', kind: 'number', required: true, label: 'Community prevalence, %', min: 0, max: 100 },
      { dom: 'sct-method', arg: 'method', kind: 'enum', required: true, label: 'Measured by', values: M.METHOD_OPTIONS.map((d) => d.value) },
      { dom: 'sct-prior', arg: 'priorProgram', kind: 'enum', label: 'Regular preventive chemotherapy already given', values: M.YES_NO.map((d) => d.value) },
      { dom: 'sct-base', arg: 'baseline', kind: 'number', label: 'Baseline prevalence before mass treatment, % (optional)', min: 0.1, max: 100 },
      { dom: 'sct-rounds', arg: 'rounds', kind: 'enum', label: 'Two yearly rounds given at 75% coverage or more', values: M.YES_NO.map((d) => d.value) },
    ],
  },
];
