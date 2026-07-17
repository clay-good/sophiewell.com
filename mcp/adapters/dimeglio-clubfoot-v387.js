// spec-v387 MCP wave: adapter for the Dimeglio clubfoot classification in lib/dimeglio-clubfoot-v387.js.
// The dom keys mirror the browser renderer (views/group-v387.js) and META['dimeglio-clubfoot'].example.
// The four reducibility parameters are 0-4 enums; the four bonus features are booleans. The example
// (4/3/3/3, no bonus -> 13, grade III) sets only the four reducibility params, so those four are
// required; all four bonus flags are optional and default false. Its expected numbers (13, 20) are echoed
// in the band, so it round-trips through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/dimeglio-clubfoot-v387.js';

export default [
  {
    id: 'dimeglio-clubfoot',
    summary: 'Dimeglio classification of a clubfoot (Dimeglio 1995) - four reducibility parameters (equinus, varus, derotation of the calcaneopedal block, forefoot adduction), each 0-4 by reducibility, plus four 1-point features (posterior crease, medial crease, cavus, muscle abnormality), for a total of 0-20. Grade: 0 normal; 1-5 grade I (benign); 6-10 II (moderate); 11-15 III (severe); 16-20 IV (very severe). Higher = more severe. The companion clubfoot-severity system to the Pirani score. Reports the score and grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.dimeglioClubfoot,
    fields: [
      { dom: 'dim-equinus', arg: 'equinus', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'Equinus (0-4)' },
      { dom: 'dim-varus', arg: 'varus', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'Varus (0-4)' },
      { dom: 'dim-derotation', arg: 'derotation', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'Derotation (0-4)' },
      { dom: 'dim-adduction', arg: 'adduction', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'Forefoot adduction (0-4)' },
      { dom: 'dim-pc', arg: 'posteriorCrease', kind: 'bool', required: false, label: 'Posterior crease' },
      { dom: 'dim-mc', arg: 'medialCrease', kind: 'bool', required: false, label: 'Medial crease' },
      { dom: 'dim-cavus', arg: 'cavus', kind: 'bool', required: false, label: 'Cavus' },
      { dom: 'dim-muscle', arg: 'muscleAbnormality', kind: 'bool', required: false, label: 'Muscle abnormality' },
    ],
  },
];
