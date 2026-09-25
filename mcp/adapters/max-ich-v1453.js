// spec-v1453: MCP adapter. The dom keys mirror views/group-v1453.js and this tile's META example.

import * as MI from '../../lib/max-ich-v1453.js';

export default [
  {
    id: 'max-ich',
    summary: 'Scores the max-ICH score (0 to 9) for spontaneous intracerebral hemorrhage from the NIHSS, age and CT findings. NIHSS and age bands give up to 3 points each; a lobar hematoma of 30 mL or more or a nonlobar one of 10 mL or more, intraventricular hemorrhage and oral anticoagulation give 1 each. The result carries the 5-year survival published for that score in maximally treated patients.',
    compute: MI.maxIch,
    fields: [
      { dom: 'mich-nihss', arg: 'nihss', kind: 'number', required: true, label: 'NIHSS score', unit: 'points' },
      { dom: 'mich-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'mich-location', arg: 'location', kind: 'enum', required: true, label: 'Hematoma location', values: MI.MICH_LOCATION.map((x) => x.value) },
      { dom: 'mich-volume', arg: 'volume', kind: 'number', required: true, label: 'Hematoma volume', unit: 'mL' },
      { dom: 'mich-ivh', arg: 'ivh', kind: 'enum', required: true, label: 'Intraventricular hemorrhage', values: MI.MICH_YESNO.map((x) => x.value) },
      { dom: 'mich-oac', arg: 'oac', kind: 'enum', required: true, label: 'Taking oral anticoagulation', values: MI.MICH_YESNO.map((x) => x.value) },
    ],
  },
];
