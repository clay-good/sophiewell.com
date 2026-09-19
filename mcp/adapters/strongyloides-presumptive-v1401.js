// spec-v1401: MCP adapter. The dom keys mirror views/group-v1401.js and this tile's META example.

import * as SG from '../../lib/strongyloides-presumptive-v1401.js';

export default [
  {
    id: 'strongyloides-presumptive',
    summary: 'Decides between presumptive ivermectin and Strongyloides testing for a newly arrived refugee (CDC, January 2025). Most get ivermectin 200 ug/kg once if not treated overseas. Loa loa-endemic origin needs a 10 am to 2 pm blood smear before any ivermectin, and pregnancy or weight under 15 kg means serology instead. Planned corticosteroids raise the risk of fatal hyperinfection.',
    compute: SG.strongyloidesPresumptive,
    fields: [
      { dom: 'sg-region', arg: 'region', kind: 'enum', required: true, label: 'Where the person lived', values: SG.REGIONS.map((r) => r.value) },
      { dom: 'sg-overseas', arg: 'overseas', kind: 'enum', required: true, label: 'Overseas ivermectin documented', values: ['yes', 'no'] },
      { dom: 'sg-pregnant', arg: 'pregnant', kind: 'enum', required: true, label: 'Pregnant or breastfeeding an infant under 1 week', values: ['yes', 'no'] },
      { dom: 'sg-steroids', arg: 'steroids', kind: 'enum', required: true, label: 'Corticosteroids or immunosuppression planned', values: ['yes', 'no'] },
      { dom: 'sg-weight', arg: 'weightKg', kind: 'number', required: true, label: 'Weight (kg)' },
    ],
  },
];
