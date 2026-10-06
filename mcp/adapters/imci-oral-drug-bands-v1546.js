// spec-v1546 MCP adapter: imci-oral-drug-bands in lib/imci-oral-drug-bands-v1546.js.
// The dom keys mirror views/group-v1546b.js and META['imci-oral-drug-bands'].example. Clinical domain.

import * as M from '../../lib/imci-oral-drug-bands-v1546.js';

export default [
  {
    id: 'imci-oral-drug-bands',
    summary: 'Gives IMCI home drug doses for a child 2-59 months by the chart bands. Amoxicillin, acetaminophen, iron, ciprofloxacin, zinc, albuterol and mebendazole, by weight first or age.',
    compute: M.imciOralDrugBands,
    fields: [
      { dom: 'iod-drug', arg: 'drug', kind: 'enum', required: true, label: 'Drug', values: M.DRUG_OPTIONS.map((d) => d.value) },
      { dom: 'iod-weight', arg: 'weight', kind: 'number', label: 'Weight in kg (preferred)', min: 1, max: 60 },
      { dom: 'iod-age', arg: 'age', kind: 'number', label: 'Age in months', min: 0, max: 120 },
      { dom: 'iod-zinc', arg: 'edition', kind: 'enum', label: 'Zinc: edition', values: M.ZINC_OPTIONS.map((d) => d.value) },
      { dom: 'iod-rutf', arg: 'rutf', kind: 'enum', label: 'Iron: child on RUTF', values: M.YES_NO.map((d) => d.value) },
    ],
  },
];
