// spec-v306 MCP wave: adapter for the ASTCT ICANS neurotoxicity grading in
// lib/icans-v306.js. The dom keys mirror the browser renderer (views/group-v306.js)
// and META['icans-grade'].example. `ice` is a number and `loc` / `seizure` / `icp`
// are enums and `motor` is a boolean; all are optional (a findings classifier has
// no mandatory single input - nothing set is grade 0). The compute returns the
// ASTCT grade (the most severe of the five domains). The `band` carries the
// "grade 3 of 4" example, so it round-trips through the default makeToArgs with no
// custom toArgs.

import * as I from '../../lib/icans-v306.js';

export default [
  {
    id: 'icans-grade',
    summary: 'ASTCT consensus ICANS neurotoxicity grading (Lee 2019) after immune-effector-cell / CAR-T therapy: given the ICE score (0-10, entered as a sub-score), level of consciousness (spontaneous / voice / tactile / unarousable), seizure (none / resolving / prolonged-or-repetitive), raised ICP (none / focal-edema / diffuse), and a deep-focal-motor-weakness flag, reports the ICANS grade (1-4) as the most severe of the five domains, flagging grades >=3 as severe. Reports the ASTCT grade, not a treatment order.',
    compute: I.icansGrade,
    fields: [
      { dom: 'icans-ice', arg: 'ice', kind: 'number', required: false, label: 'ICE score (0-10)' },
      { dom: 'icans-loc', arg: 'loc', kind: 'enum', required: false, values: ['spontaneous', 'voice', 'tactile', 'unarousable'], label: 'Level of consciousness' },
      { dom: 'icans-seizure', arg: 'seizure', kind: 'enum', required: false, values: ['none', 'g3', 'g4'], label: 'Seizure' },
      { dom: 'icans-icp', arg: 'icp', kind: 'enum', required: false, values: ['none', 'focal', 'diffuse'], label: 'Raised ICP / cerebral edema' },
      { dom: 'icans-motor', arg: 'motor', kind: 'bool', required: false, label: 'Deep focal motor weakness' },
    ],
  },
];
