// spec-v1554 MCP adapter: who-cotrimoxazole in lib/who-cotrimoxazole-v1554.js.
// The dom keys mirror views/group-v1554.js and META['who-cotrimoxazole'].example. Clinical domain.

import * as M from '../../lib/who-cotrimoxazole-v1554.js';

export default [
  {
    id: 'who-cotrimoxazole',
    summary: 'Gives WHO cotrimoxazole prophylaxis for HIV: who gets it and the once-daily dose by weight. Every child with HIV and every HIV-exposed infant from 4-6 weeks, adults by stage, CD4, TB or setting, dosed from the 2026 weight-band table.',
    compute: M.whoCotrimoxazole,
    fields: [
      { dom: 'ctx-group', arg: 'group', kind: 'enum', required: true, label: 'Who it is for', values: M.GROUP_OPTIONS.map((d) => d.value) },
      { dom: 'ctx-weight', arg: 'weight', kind: 'number', label: 'Weight in kg (infants and children)', min: 1, max: 150 },
      { dom: 'ctx-prev', arg: 'highPrevalence', kind: 'enum', label: 'High malaria or bacterial-infection setting (adults)', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ctx-tb', arg: 'tb', kind: 'enum', label: 'Active TB (adults)', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ctx-stage', arg: 'advanced', kind: 'enum', label: 'WHO stage 3 or 4 (adults)', values: M.YES_NO.map((d) => d.value) },
      { dom: 'ctx-cd4', arg: 'cd4', kind: 'number', label: 'CD4 count, cells/mm³ (adults)', min: 0, max: 3000 },
    ],
  },
];
