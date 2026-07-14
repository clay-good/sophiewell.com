// spec-v305 MCP wave: adapter for the ASTCT cytokine release syndrome (CRS)
// grading in lib/crs-v305.js. The dom keys mirror the browser renderer
// (views/group-v305.js) and META['crs-grade'].example. `fever` is a boolean and
// `hypotension` / `hypoxia` are enums; all are optional (a findings classifier has
// no mandatory single input - none set is grade 0). The compute returns the ASTCT
// grade (the more severe of the two axes). The `band` carries the "grade 3 of 4"
// example, so it round-trips through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/crs-v305.js';

export default [
  {
    id: 'crs-grade',
    summary: 'ASTCT consensus cytokine release syndrome (CRS) grading (Lee 2019) after immune-effector-cell / CAR-T therapy: given the fever, hypotension level (none / no-vasopressor / one-vasopressor / multiple-vasopressors), and hypoxia level (none / low-flow / high-flow-or-mask / positive-pressure), reports the CRS grade (1-4) as the more severe of the hypotension and hypoxia axes, flagging grades >=3 as severe. Reports the ASTCT grade, not a treatment order.',
    compute: C.crsGrade,
    fields: [
      { dom: 'crs-fever', arg: 'fever', kind: 'bool', required: false, label: 'Fever >=38C, not otherwise explained' },
      { dom: 'crs-hypotension', arg: 'hypotension', kind: 'enum', required: false, values: ['none', 'novaso', 'onevaso', 'multivaso'], label: 'Hypotension level' },
      { dom: 'crs-hypoxia', arg: 'hypoxia', kind: 'enum', required: false, values: ['none', 'lowflow', 'highflow', 'pospressure'], label: 'Hypoxia level' },
    ],
  },
];
