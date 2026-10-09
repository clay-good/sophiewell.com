// spec-v1564 §3 MCP adapter: aware-child-oral-dose in lib/aware-child-oral-dose-v1564.js.
// The dom keys mirror views/group-v1564.js and META['aware-child-oral-dose'].example. Clinical domain.

import * as AW from '../../lib/aware-child-oral-dose-v1564.js';

export default [
  {
    id: 'aware-child-oral-dose',
    summary: 'Gives a child\'s oral antibiotic dose by weight band (WHO AWaRe book). Amoxicillin, amoxicillin+clavulanate, cefalexin, ciprofloxacin, cloxacillin, metronidazole, sulfamethoxazole+trimethoprim or trimethoprim, from 3 kg, with the mg/kg basis and the AWaRe group.',
    compute: AW.awareChildOralDose,
    fields: [
      { dom: 'awc-drug', arg: 'drug', kind: 'enum', required: true, label: 'Antibiotic', values: AW.DRUGS.map((d) => d.value) },
      { dom: 'awc-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight, kg', min: 0.5, max: 150 },
    ],
  },
];
