// spec-v713 MCP adapter: Edmonton Obesity Staging System in lib/eoss-v713.js.
// The dom keys mirror the browser renderer (views/group-v713.js) and META['eoss'].example.
// Three domain enums (each 0-4); the overall stage is the most severe domain. Clinical domain.

import { eoss } from '../../lib/eoss-v713.js';

export default [
  {
    id: 'eoss',
    summary: 'Edmonton Obesity Staging System (EOSS; Sharma & Kushner 2009): stages obesity 0-4 by health impact, not BMI. Rate three domains 0-4 (medical/comorbidity, functional/physical, mental/psychological); the overall stage is the most severe. 0 none, 1 subclinical/mild, 2 established comorbidity, 3 end-organ damage/significant limitation, 4 severe/end-stage. Higher = greater mortality risk and stronger treatment indication.',
    compute: eoss,
    fields: [
      { dom: 'eoss-medical', arg: 'medical', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'Medical domain (0-4)' },
      { dom: 'eoss-functional', arg: 'functional', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'Functional domain (0-4)' },
      { dom: 'eoss-mental', arg: 'mental', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'Mental domain (0-4)' },
    ],
  },
];
