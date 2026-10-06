// spec-v1552 MCP adapter: vivax-radical-cure in lib/vivax-radical-cure-v1552.js.
// The dom keys mirror views/group-v1552.js and META['vivax-radical-cure'].example. Clinical domain.

import * as M from '../../lib/vivax-radical-cure-v1552.js';

export default [
  {
    id: 'vivax-radical-cure',
    summary: 'Gives the WHO 2026 regimen to prevent vivax relapse for a G6PD result. Primaquine 14-day, 7-day or weekly in mg base, tafenoquine only in South America at over 70%, and no regimen without a test.',
    compute: M.vivaxRadicalCure,
    fields: [
      { dom: 'vx-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight in kg', min: 2, max: 250 },
      { dom: 'vx-age', arg: 'age', kind: 'number', required: true, label: 'Age in years', min: 0, max: 120 },
      { dom: 'vx-sex', arg: 'sex', kind: 'enum', required: true, label: 'Sex', values: M.SEX_OPTIONS.map((d) => d.value) },
      { dom: 'vx-preg', arg: 'pregnant', kind: 'enum', label: 'Pregnant', values: M.YES_NO.map((d) => d.value) },
      { dom: 'vx-bf', arg: 'bfInfant', kind: 'enum', label: 'Breastfeeding an infant under 1 month', values: M.YES_NO.map((d) => d.value) },
      { dom: 'vx-test', arg: 'test', kind: 'enum', required: true, label: 'G6PD test', values: M.TEST_OPTIONS.map((d) => d.value) },
      { dom: 'vx-result', arg: 'result', kind: 'enum', label: 'G6PD result', values: M.RESULT_OPTIONS.map((d) => d.value) },
      { dom: 'vx-blood', arg: 'blood', kind: 'enum', required: true, label: 'Blood-stage treatment', values: M.BLOOD_OPTIONS.map((d) => d.value) },
      { dom: 'vx-sa', arg: 'southAmerica', kind: 'enum', required: true, label: 'In South America', values: M.YES_NO.map((d) => d.value) },
    ],
  },
];
