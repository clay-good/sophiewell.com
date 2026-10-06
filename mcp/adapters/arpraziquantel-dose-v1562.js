// spec-v1562 MCP adapter: arpraziquantel-dose in lib/arpraziquantel-dose-v1562.js.
// The dom keys mirror views/group-v1562.js and META['arpraziquantel-dose'].example. Clinical domain.

import * as M from '../../lib/arpraziquantel-dose-v1562.js';

export default [
  {
    id: 'arpraziquantel-dose',
    summary: 'Gives arpraziquantel tablets for preschool schistosomiasis (EMA). The 150 mg dispersible weight bands: 50 mg/kg (S. mansoni) or 60 mg/kg (S. haematobium or mixed), from 3 months and 5 kg.',
    compute: M.arpraziquantelDose,
    fields: [
      { dom: 'apz-sp', arg: 'species', kind: 'enum', required: true, label: 'Species', values: M.SPECIES_OPTIONS.map((d) => d.value) },
      { dom: 'apz-w', arg: 'weight', kind: 'number', required: true, label: 'Weight in kg', min: 1, max: 60 },
      { dom: 'apz-age', arg: 'age', kind: 'number', required: true, label: 'Age in years (3 months = 0.25)', min: 0, max: 20 },
      { dom: 'apz-cys', arg: 'cysticercosis', kind: 'enum', label: 'Known or suspected cysticercosis', values: M.YES_NO.map((d) => d.value) },
      { dom: 'apz-acute', arg: 'acute', kind: 'enum', label: 'Known or suspected acute schistosomiasis', values: M.YES_NO.map((d) => d.value) },
      { dom: 'apz-ind', arg: 'inducer', kind: 'enum', label: 'On a strong CYP inducer (rifampicin, carbamazepine, phenytoin)', values: M.YES_NO.map((d) => d.value) },
    ],
  },
];
