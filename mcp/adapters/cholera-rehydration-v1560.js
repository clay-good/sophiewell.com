// spec-v1560 MCP adapter: GTFCC cholera dehydration, fluids and antibiotic in lib/cholera-rehydration-v1560.js.
// The dom keys mirror views/group-v1560.js and META['cholera-rehydration'].example. Clinical domain.

import * as C from '../../lib/cholera-rehydration-v1560.js';

const sign = (dom, arg, label) => ({ dom, arg, kind: 'enum', label, values: C.SIGNS[arg].options.map((d) => d.value) });
const yn = (dom, arg, label) => ({ dom, arg, kind: 'enum', label, values: C.YES_NO.map((d) => d.value) });

export default [
  {
    id: 'cholera-rehydration',
    summary: 'Classifies dehydration in suspected cholera and gives the GTFCC plan and fluid volumes. Plan C IV, Plan B ORS 75 mL/kg or Plan A per stool, with the pregnancy and severe malnutrition protocols, the antibiotic when indicated, and zinc. A blank sign is not assessed.',
    compute: C.choleraRehydration,
    fields: [
      { dom: 'chol-pop', arg: 'population', kind: 'enum', required: true, label: 'Patient group', values: C.POPULATION_OPTIONS.map((d) => d.value) },
      { dom: 'chol-age', arg: 'age', kind: 'number', required: true, label: 'Age in years', min: 0, max: 120 },
      { dom: 'chol-weight', arg: 'weight', kind: 'number', label: 'Weight in kg (needed for Plans B and C)', min: 0.5, max: 250 },
      sign('chol-mental', 'mental', 'Mental state'),
      sign('chol-pulse', 'pulse', 'Pulse'),
      sign('chol-breathing', 'breathing', 'Breathing'),
      sign('chol-eyes', 'eyes', 'Eyes'),
      sign('chol-drinking', 'drinking', 'Drinking'),
      sign('chol-pinch', 'pinch', 'Skin pinch'),
      { dom: 'chol-sbp', arg: 'sbp', kind: 'number', label: 'Systolic BP, mmHg (pregnancy, 2nd or 3rd trimester)', min: 30, max: 250 },
      sign('chol-fetal', 'fetal', 'Fetal heart rate (pregnancy)'),
      yn('chol-purging', 'purging', 'High purging, 1 stool an hour or more'),
      yn('chol-failed', 'failed', 'First 4 hours of rehydration failed'),
      yn('chol-hiv', 'hiv', 'HIV'),
    ],
  },
];
