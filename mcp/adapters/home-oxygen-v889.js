// spec-v889 MCP adapter: the home oxygen qualifying criteria in lib/home-oxygen-v889.js. The dom
// keys mirror the browser renderer (views/group-v889.js) and META['home-oxygen'].example.
//
// The measurement conditions are inputs, not assumptions. Clinical domain.

import { homeOxygen } from '../../lib/home-oxygen-v889.js';

export default [
  {
    id: 'home-oxygen',
    summary: 'Applies the qualifying criteria for long-term home oxygen therapy to a resting room-air measurement. An arterial oxygen tension at or below 55 mmHg, or a saturation at or below 88 percent, qualifies outright. A tension of 56 to 59 mmHg, or a saturation of 89 percent, qualifies only alongside dependent edema suggesting congestive heart failure, pulmonary hypertension or cor pulmonale, or a hematocrit above 56 percent. Anything above that does not qualify. THE MEASUREMENT MUST BE ON ROOM AIR AND WHILE THE PATIENT IS STABLE: a value taken during an exacerbation or on supplemental oxygen does not establish a chronic need. A SATURATION OF 89 PERCENT QUALIFIES ONLY WITH A SUPPORTING FINDING. Coverage criteria and clinical evidence are not the same question, and these are resting criteria rather than exertional or nocturnal ones.',
    compute: homeOxygen,
    fields: [
      { dom: 'ho-pao2', arg: 'pao2', kind: 'number', required: false, label: 'Arterial oxygen tension, mmHg', unit: 'mmHg' },
      { dom: 'ho-spo2', arg: 'spo2', kind: 'number', required: false, label: 'Oxygen saturation, percent', unit: '%' },
      { dom: 'ho-roomair', arg: 'roomAir', kind: 'boolean', required: false, label: 'The measurement was taken on room air' },
      { dom: 'ho-clinicallystable', arg: 'clinicallyStable', kind: 'boolean', required: false, label: 'The measurement was taken while the patient is clinically stable' },
      { dom: 'ho-dependentedema', arg: 'dependentEdema', kind: 'boolean', required: false, label: 'Dependent edema suggesting congestive heart failure (a supporting finding)' },
      { dom: 'ho-pulmonaryhypertension', arg: 'pulmonaryHypertension', kind: 'boolean', required: false, label: 'Pulmonary hypertension or cor pulmonale (a supporting finding)' },
      { dom: 'ho-polycythemia', arg: 'polycythemia', kind: 'boolean', required: false, label: 'Hematocrit above 56 percent (a supporting finding)' },
    ],
  },
];
