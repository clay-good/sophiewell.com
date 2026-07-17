// spec-v386 MCP wave: adapter for the Pirani clubfoot severity score in lib/pirani-clubfoot-v386.js. The
// dom keys mirror the browser renderer (views/group-v386.js) and META['pirani-clubfoot'].example. Each of
// the six signs is an enum (0 / 0.5 / 1). The compute sums them into the midfoot + hindfoot contracture
// scores and a 0-6 total. The example (1/1/0.5/1/1/1 -> 5.5) has all six fields, so all six adapter
// fields are required; its expected numbers (5.5, 6, 2.5, 3) are echoed in the band, so it round-trips
// through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/pirani-clubfoot-v386.js';

export default [
  {
    id: 'pirani-clubfoot',
    summary: 'Pirani score for the severity of a congenital clubfoot (Dyer 2006) - six clinical signs, each 0 (normal) / 0.5 (moderate) / 1 (severe), split into a Midfoot Contracture Score (curved lateral border, medial crease, position of the lateral head of the talus; 0-3) and a Hindfoot Contracture Score (posterior crease, empty heel, rigid equinus; 0-3), for a total of 0-6. Higher = more severe deformity. Widely used to grade and track a clubfoot during Ponseti casting. Reports the score, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.piraniClubfoot,
    fields: [
      { dom: 'pir-clb', arg: 'clb', kind: 'enum', values: ['0', '0.5', '1'], required: true, label: 'Curvature of the lateral border' },
      { dom: 'pir-mc', arg: 'mc', kind: 'enum', values: ['0', '0.5', '1'], required: true, label: 'Medial crease' },
      { dom: 'pir-lht', arg: 'lht', kind: 'enum', values: ['0', '0.5', '1'], required: true, label: 'Lateral head of the talus' },
      { dom: 'pir-pc', arg: 'pc', kind: 'enum', values: ['0', '0.5', '1'], required: true, label: 'Posterior crease' },
      { dom: 'pir-eh', arg: 'eh', kind: 'enum', values: ['0', '0.5', '1'], required: true, label: 'Emptiness of the heel' },
      { dom: 'pir-re', arg: 're', kind: 'enum', values: ['0', '0.5', '1'], required: true, label: 'Rigidity of the equinus' },
    ],
  },
];
