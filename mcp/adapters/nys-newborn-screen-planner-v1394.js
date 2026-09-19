// spec-v1394: MCP adapter. The dom keys mirror views/group-v1394.js and this tile's META example.
// Times are local wall-clock 'YYYY-MM-DDTHH:MM'; the tile never reads the clock.

import * as NBS from '../../lib/nys-newborn-screen-planner-v1394.js';

export default [
  {
    id: 'nys-newborn-screen-planner',
    summary: 'Plans each New York newborn screening specimen and its window under the Wadsworth Center protocol. A well newborn is screened after 24 hours, with a repeat at 24 to 120 hours if discharged earlier. NICU infants are screened on admission, again at 48 to 72 hours if the first was early or the weight is under 2,000 g, and at 28 days or discharge if under 2,000 g. Transfusion or TPN before any screen adds specimens, including one 4 months after the final transfusion.',
    compute: NBS.nysNewbornScreenPlanner,
    fields: [
      { dom: 'nbs-birth', arg: 'birth', kind: 'string', required: true, label: 'Birth (YYYY-MM-DDTHH:MM)' },
      { dom: 'nbs-weight', arg: 'weightG', kind: 'number', required: true, label: 'Birth weight (g)' },
      { dom: 'nbs-nicu', arg: 'nicu', kind: 'enum', required: true, label: 'Admitted to the NICU', values: ['yes', 'no'] },
      { dom: 'nbs-first', arg: 'first', kind: 'string', label: 'First specimen drawn (YYYY-MM-DDTHH:MM)' },
      { dom: 'nbs-discharge', arg: 'discharge', kind: 'string', label: 'Discharged (YYYY-MM-DDTHH:MM)' },
      { dom: 'nbs-tx1', arg: 'transfusionFirst', kind: 'string', label: 'First transfusion (YYYY-MM-DDTHH:MM)' },
      { dom: 'nbs-tx2', arg: 'transfusionLast', kind: 'string', label: 'Final transfusion (YYYY-MM-DDTHH:MM)' },
      { dom: 'nbs-tpn', arg: 'tpnLast', kind: 'string', label: 'Last TPN (YYYY-MM-DDTHH:MM)' },
      { dom: 'nbs-readmit', arg: 'readmitted', kind: 'enum', label: 'Readmitted within the first 28 days', values: ['yes', 'no'] },
      { dom: 'nbs-negative', arg: 'priorNegative', kind: 'enum', label: 'Proof of a screen-negative result', values: ['yes', 'no'] },
    ],
  },
];
