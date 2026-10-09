// spec-v1564 §3 MCP adapter: aware-child-oral-dose in lib/aware-child-oral-dose-v1564.js.
// The dom keys mirror views/group-v1564.js and META['aware-child-oral-dose'].example. Clinical domain.

import * as AW from '../../lib/aware-child-oral-dose-v1564.js';

export default [
  {
    id: 'aware-child-oral-dose',
    summary: 'Gives a child\'s antibiotic dose by weight (WHO AWaRe book). The weight band for amoxicillin, amoxicillin+clavulanate, cefalexin, ciprofloxacin, cloxacillin, metronidazole, sulfamethoxazole+trimethoprim or trimethoprim, and the mg/kg dose, held to the daily maximum, for azithromycin, cefixime, clarithromycin, nitrofurantoin, penicillin V, oral vancomycin and doxycycline for cholera; and the IV and IM doses of the Access and Watch antibiotics, by age where newborns differ.',
    compute: AW.awareChildOralDose,
    fields: [
      { dom: 'awc-drug', arg: 'drug', kind: 'enum', required: true, label: 'Antibiotic', values: AW.ALL_DRUGS.map((d) => d.value) },
      { dom: 'awc-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight, kg', min: 0.5, max: 150 },
      { dom: 'awc-age', arg: 'ageDays', kind: 'number', label: 'Age in days (IV doses that differ in the first week or for newborns)', min: 0, max: 6600 },
    ],
  },
];
