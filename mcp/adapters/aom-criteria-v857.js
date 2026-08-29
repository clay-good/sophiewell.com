// spec-v857 MCP adapter: the AAP acute otitis media criteria in lib/aom-criteria-v857.js. The
// dom keys mirror the browser renderer (views/group-v857.js) and META['aom-criteria'].example.
//
// effusion gates the whole diagnosis: without it, no combination of the other arguments returns
// a diagnosis. Clinical domain.

import { aomCriteria } from '../../lib/aom-criteria-v857.js';

export default [
  {
    id: 'aom-criteria',
    summary: 'Applies the AAP criteria for acute otitis media and reports which management route the guideline leaves open. The diagnosis needs objective evidence of fluid behind the eardrum plus one of moderate to severe bulging, new drainage from the ear not from an outer-ear infection, or mild bulging with ear pain starting within 48 hours or intense redness. REDNESS ALONE MEETS NONE OF THEM and the diagnosis is not made without evidence of fluid. Severe is moderate or severe pain, pain for 48 hours or more, or a temperature of 102.2 degrees Fahrenheit or higher. Antibiotics are recommended for severe disease at any age and between 6 and 23 months when both ears are affected; otherwise observation with close follow-up is an option. It does not prescribe or select an antibiotic.',
    compute: aomCriteria,
    fields: [
      { dom: 'aom-age', arg: 'ageMonths', kind: 'number', required: false, label: 'Age of the child', unit: 'months' },
      { dom: 'aom-bilat', arg: 'bilateral', kind: 'boolean', required: false, label: 'Both ears affected, which changes the answer only between 6 and 23 months' },
      { dom: 'aom-effusion', arg: 'effusion', kind: 'boolean', required: false, label: 'Objective evidence of fluid behind the eardrum, without which no criterion is met' },
      { dom: 'aom-bulge', arg: 'bulging', kind: 'enum', values: ['none', 'mild', 'moderate-severe'], required: false, label: 'Bulging of the eardrum' },
      { dom: 'aom-otorrhea', arg: 'otorrhea', kind: 'boolean', required: false, label: 'New drainage from the ear, not from an outer-ear infection' },
      { dom: 'aom-recent', arg: 'recentPain', kind: 'boolean', required: false, label: 'Ear pain that started within the last 48 hours' },
      { dom: 'aom-erythema', arg: 'intenseErythema', kind: 'boolean', required: false, label: 'Intense redness of the eardrum, which is never diagnostic on its own' },
      { dom: 'aom-pain', arg: 'moderateOrSeverePain', kind: 'boolean', required: false, label: 'Moderate or severe ear pain' },
      { dom: 'aom-pain48', arg: 'painFortyEightHours', kind: 'boolean', required: false, label: 'Ear pain lasting 48 hours or more' },
      { dom: 'aom-temp', arg: 'temperatureF', kind: 'number', required: false, label: 'Highest temperature, severe at 102.2 or above', unit: 'degrees Fahrenheit' },
    ],
  },
];
