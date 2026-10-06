// spec-v1562 MCP adapter: WHO mass drug administration doses in lib/pc-dose-pole-v1562.js.
// The dom keys mirror views/group-v1562.js and META['pc-dose-pole'].example. Clinical domain.

import * as D from '../../lib/pc-dose-pole-v1562.js';

export default [
  {
    id: 'pc-dose-pole',
    summary: 'Gives the mass drug administration dose from WHO tables. Praziquantel and ivermectin by height (the dose poles), albendazole, mebendazole and DEC by age, with each drug\'s exclusions.',
    compute: D.pcDosePole,
    fields: [
      { dom: 'pc-drug', arg: 'drug', kind: 'enum', required: true, label: 'Drug', values: D.DRUG_OPTIONS.map((d) => d.value) },
      { dom: 'pc-height', arg: 'height', kind: 'number', label: 'Height in cm (praziquantel, ivermectin)', min: 40, max: 230 },
      { dom: 'pc-age', arg: 'age', kind: 'number', label: 'Age in years (albendazole, mebendazole, DEC)', min: 0, max: 120 },
    ],
  },
];
