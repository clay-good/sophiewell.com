// spec-v1556 MCP adapter: scorpion-grade-india in lib/scorpion-grade-india-v1556.js.
// The dom keys mirror views/group-v1556.js and META['scorpion-grade-india'].example. Clinical domain.

import * as M from '../../lib/scorpion-grade-india-v1556.js';

export default [
  {
    id: 'scorpion-grade-india',
    summary: 'Grades an Indian red scorpion (Mesobuthus tamulus) sting from 1 to 4. Local pain, autonomic storm, pulmonary edema with cold extremities, or warm shock (Bawaskar 2011); grade only, no doses.',
    compute: M.scorpionGradeIndia,
    fields: [
      { dom: 'sg-local', arg: 'local', kind: 'enum', label: 'Severe local pain, mild local swelling and sweating', values: M.YES_NO.map((d) => d.value) },
      { dom: 'sg-auto', arg: 'autonomic', kind: 'enum', label: 'Autonomic storm (vomiting, generalized sweating, drooling, slow or fast pulse, high or low BP, priapism)', values: M.YES_NO.map((d) => d.value) },
      { dom: 'sg-pulm', arg: 'pulmonary', kind: 'enum', label: 'Pulmonary edema (breathing over 24, crackles) with cold extremities', values: M.YES_NO.map((d) => d.value) },
      { dom: 'sg-warm', arg: 'warmShock', kind: 'enum', label: 'Fast heart rate and low blood pressure with warm extremities', values: M.YES_NO.map((d) => d.value) },
    ],
  },
];
