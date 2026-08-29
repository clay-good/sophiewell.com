// spec-v864 MCP adapter: methemoglobin level interpretation in lib/methemoglobin-v864.js. The
// dom keys mirror the browser renderer (views/group-v864.js) and META.methemoglobin.example.
//
// The pulse oximeter reading and the arterial oxygen tension never change the band. They select
// the warnings about what those two tests do not measure. Clinical domain.

import { methemoglobin } from '../../lib/methemoglobin-v864.js';

export default [
  {
    id: 'methemoglobin',
    summary: 'Reads a co-oximetry methemoglobin level against published bands. Under 3 percent is within the range seen normally; 3 to 15 often produces little more than discoloration; 15 to 20 produces cyanosis with chocolate-brown blood; 20 to 50 produces headache, fatigue, dizziness and breathlessness; 50 to 70 produces seizures, arrhythmia, coma and acidosis; and over 70 is often fatal. Methylene blue is given for symptoms, or at 30 percent and above without them. A PULSE OXIMETER DOES NOT MEASURE THIS — its reading drifts toward about 85 percent and stops there however high the level climbs, and it does not correct on oxygen. THE ARTERIAL OXYGEN TENSION IS NORMAL, because it measures oxygen dissolved in plasma rather than what the hemoglobin can carry. METHYLENE BLUE DOES NOT WORK IN G6PD DEFICIENCY and can cause hemolysis, and it is a monoamine oxidase inhibitor that has precipitated serotonin toxicity. It does not prescribe methylene blue or set a dose.',
    compute: methemoglobin,
    fields: [
      { dom: 'mh-level', arg: 'level', kind: 'number', required: true, label: 'Methemoglobin measured by co-oximetry', unit: 'percent' },
      { dom: 'mh-symptoms', arg: 'symptoms', kind: 'boolean', required: false, label: 'Symptoms attributable to the methemoglobinemia' },
      { dom: 'mh-g6pd', arg: 'g6pd', kind: 'boolean', required: false, label: 'Known G6PD deficiency' },
      { dom: 'mh-serotonergic', arg: 'serotonergic', kind: 'boolean', required: false, label: 'Taking a serotonergic drug' },
      { dom: 'mh-spo2', arg: 'spo2', kind: 'number', required: false, label: 'Pulse oximeter reading, which does not measure methemoglobin', unit: 'percent' },
      { dom: 'mh-pao2', arg: 'pao2', kind: 'number', required: false, label: 'Arterial oxygen tension, which is normal in methemoglobinemia', unit: 'mmHg' },
    ],
  },
];
