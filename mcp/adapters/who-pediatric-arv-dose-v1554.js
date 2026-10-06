// spec-v1554 MCP adapter: who-pediatric-arv-dose in lib/who-pediatric-arv-dose-v1554.js.
// The dom keys mirror views/group-v1554.js and META['who-pediatric-arv-dose'].example. Clinical domain.

import * as M from '../../lib/who-pediatric-arv-dose-v1554.js';

export default [
  {
    id: 'who-pediatric-arv-dose',
    summary: 'Gives pediatric ARV doses by weight band (WHO May 2026). pALD, ABC/3TC, DTG dispersible or film-coated, and TLD once daily, with the rifampicin adjustment; highest volatility.',
    compute: M.whoPediatricArvDose,
    fields: [
      { dom: 'pad-drug', arg: 'drug', kind: 'enum', required: true, label: 'Formulation', values: M.DRUG_OPTIONS.map((d) => d.value) },
      { dom: 'pad-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight in kg', min: 1, max: 35 },
      { dom: 'pad-age', arg: 'age', kind: 'number', required: true, label: 'Age in weeks', min: 0, max: 1000 },
      { dom: 'pad-rif', arg: 'rif', kind: 'enum', required: true, label: 'On rifampicin', values: M.YES_NO.map((d) => d.value) },
    ],
  },
];
