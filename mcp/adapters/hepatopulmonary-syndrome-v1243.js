// spec-v1243: MCP adapter. The dom keys mirror views/group-v1243.js and this tile's META example.
// Both yes/no criteria are required because a blank is not a negative finding, and the age is
// required because it decides which gradient threshold applies.

import { hepatopulmonarySyndrome } from '../../lib/hepatopulmonary-syndrome-v1243.js';

export default [
  {
    id: 'hepatopulmonary-syndrome',
    summary: 'Hepatopulmonary syndrome criteria and severity grade, from the ERS task force definition. Three things have to be true at once: liver disease or portal hypertension, an intrapulmonary vascular dilatation, and a gas exchange defect, meaning a room-air alveolar-arterial oxygen gradient of at least 15 mmHg, or at least 20 mmHg over the age of 64. The age cut is the part most often dropped, and it matters in one direction only: applying 15 mmHg to an older patient calls an ordinary gradient a defect. The severity grade is a different measurement from the diagnosis, running off the arterial oxygen rather than the gradient, so a patient can meet the criteria with a PaO2 above 80 mmHg, which is the mild grade and not a normal result.',
    compute: hepatopulmonarySyndrome,
    fields: [
      { dom: 'hps-liverDisease', arg: 'liverDisease', kind: 'boolean', required: true, label: 'Liver disease or portal hypertension' },
      { dom: 'hps-ipvd', arg: 'ipvd', kind: 'boolean', required: true, label: 'Intrapulmonary vascular dilatation shown' },
      { dom: 'hps-age', arg: 'age', kind: 'number', required: true, label: 'Age (years)' },
      { dom: 'hps-pao2', arg: 'pao2', kind: 'number', required: true, label: 'Room-air arterial oxygen, PaO2 (mmHg)' },
      { dom: 'hps-aaGradient', arg: 'aaGradient', kind: 'number', required: true, label: 'Room-air alveolar-arterial oxygen gradient (mmHg)' },
    ],
  },
];
