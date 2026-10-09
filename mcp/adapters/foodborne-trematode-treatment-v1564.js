// spec-v1564 §3 MCP adapter: the WHO foodborne trematode dose in lib/foodborne-trematode-treatment-v1564.js.
// The dom keys mirror views/group-v1564.js and META['foodborne-trematode-treatment'].example. Clinical domain.

import * as T from '../../lib/foodborne-trematode-treatment-v1564.js';

export default [
  {
    id: 'foodborne-trematode-treatment',
    summary: 'Gives the WHO dose for a liver or lung fluke by weight. Praziquantel for clonorchiasis and opisthorchiasis, triclabendazole for fascioliasis and paragonimiasis, for one person or for preventive chemotherapy, with who is left out of mass treatment.',
    compute: T.foodborneTrematodeTreatment,
    fields: [
      { dom: 'fbt-infection', arg: 'infection', kind: 'enum', required: true, label: 'Infection', values: T.INFECTIONS.map((d) => d.value) },
      { dom: 'fbt-use', arg: 'use', kind: 'enum', required: true, label: 'Use', values: T.USES.map((d) => d.value) },
      { dom: 'fbt-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight, kg', min: 3, max: 200 },
      { dom: 'fbt-age', arg: 'age', kind: 'number', required: true, label: 'Age in years', min: 0, max: 120 },
      { dom: 'fbt-preg', arg: 'pregnancy', kind: 'enum', label: 'Pregnant or breastfeeding', values: T.PREGNANCY.map((d) => d.value) },
    ],
  },
];
