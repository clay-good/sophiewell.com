// spec-v1433: MCP adapter. The dom keys mirror views/group-v1433.js and this tile's META example.

import * as DRS from '../../lib/disability-rating-scale-v1433.js';

const vals = (list) => list.map((x) => x.value);

export default [
  {
    id: 'disability-rating-scale',
    summary: 'Totals the Disability Rating Scale (0 to 29) after a moderate or severe traumatic brain injury, from coma to community. It gives the descriptive category, says the categories were never derived statistically, and asks for every item rather than reading a blank as 0.',
    compute: DRS.disabilityRatingScale,
    fields: [
      { dom: 'drs-eye', arg: 'eye', kind: 'enum', required: true, label: 'Eye opening', values: vals(DRS.DRS_EYE) },
      { dom: 'drs-communication', arg: 'communication', kind: 'enum', required: true, label: 'Best communication ability', values: vals(DRS.DRS_COMMUNICATION) },
      { dom: 'drs-motor', arg: 'motor', kind: 'enum', required: true, label: 'Best motor response', values: vals(DRS.DRS_MOTOR) },
      { dom: 'drs-feeding', arg: 'feeding', kind: 'enum', required: true, label: 'Cognitive ability for feeding', values: vals(DRS.DRS_FEEDING) },
      { dom: 'drs-toileting', arg: 'toileting', kind: 'enum', required: true, label: 'Cognitive ability for toileting', values: vals(DRS.DRS_TOILETING) },
      { dom: 'drs-grooming', arg: 'grooming', kind: 'enum', required: true, label: 'Cognitive ability for grooming', values: vals(DRS.DRS_GROOMING) },
      { dom: 'drs-functioning', arg: 'functioning', kind: 'enum', required: true, label: 'Level of functioning', values: vals(DRS.DRS_FUNCTIONING) },
      { dom: 'drs-employability', arg: 'employability', kind: 'enum', required: true, label: 'Employability', values: vals(DRS.DRS_EMPLOYABILITY) },
    ],
  },
];
