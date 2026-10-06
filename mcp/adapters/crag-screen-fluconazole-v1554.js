// spec-v1554 MCP adapter: crag-screen-fluconazole in lib/crag-screen-fluconazole-v1554.js.
// The dom keys mirror views/group-v1554.js and META['crag-screen-fluconazole'].example. Clinical domain.

import * as M from '../../lib/crag-screen-fluconazole-v1554.js';

export default [
  {
    id: 'crag-screen-fluconazole',
    summary: 'Says whether to screen for cryptococcal antigen before ART and what to give: screening below CD4 100 (consider below 200), never under 10, and pre-emptive fluconazole doses for adults or per kg for adolescents.',
    compute: M.cragScreenFluconazole,
    fields: [
      { dom: 'cg-age', arg: 'age', kind: 'number', required: true, label: 'Age in years', min: 0, max: 120 },
      { dom: 'cg-cd4', arg: 'cd4', kind: 'number', required: true, label: 'CD4 count, cells/mm³', min: 0, max: 5000 },
      { dom: 'cg-crag', arg: 'crag', kind: 'enum', label: 'Cryptococcal antigen result', values: M.CRAG_OPTIONS.map((d) => d.value) },
      { dom: 'cg-men', arg: 'meningitis', kind: 'enum', label: 'Signs or symptoms of meningitis', values: M.YES_NO.map((d) => d.value) },
      { dom: 'cg-weight', arg: 'weight', kind: 'number', label: 'Weight in kg (adolescents 10-19)', min: 3, max: 150 },
    ],
  },
];
