// spec-v297 MCP wave: adapter for the Seddon-Sunderland nerve-injury
// classification in lib/nerve-injury-v297.js. The single dom key mirrors the
// browser renderer (views/group-v297.js) and META['seddon-sunderland'].example.
// `grade` is a required enum over the 5 Sunderland grades; the compute returns
// the disrupted structures, Seddon equivalent, recovery, and surgical-repair
// flag. The `band` carries the "Sunderland grade IV" example, so it round-trips
// through the default makeToArgs with no custom toArgs.

import * as N from '../../lib/nerve-injury-v297.js';

export default [
  {
    id: 'seddon-sunderland',
    summary: 'Seddon-Sunderland peripheral nerve-injury classification: given the Sunderland grade (I-V), reports which structures are disrupted, the Seddon equivalent (neurapraxia / axonotmesis / neurotmesis), the expected recovery, and whether surgical repair is typically required (grades IV-V). Reports the classification descriptor, not a diagnosis or a surgical decision.',
    compute: N.nerveInjuryGrade,
    fields: [
      { dom: 'ni-grade', arg: 'grade', kind: 'enum', required: true, values: ['I', 'II', 'III', 'IV', 'V'], label: 'Sunderland grade' },
    ],
  },
];
