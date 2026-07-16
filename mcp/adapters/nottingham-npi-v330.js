// spec-v330 MCP wave: adapter for the Nottingham Prognostic Index in
// lib/nottingham-npi-v330.js. The dom keys mirror the browser renderer (views/group-v330.js)
// and META['nottingham-prognostic-index'].example. `size` is a number (cm); `nodeStage` and
// `grade` are enums (1/2/3). The compute returns NPI = 0.2*size + node + grade and the
// prognostic group. The example sets size 2.5 + node 2 + grade 2 (NPI 4.5, moderate); its band
// carries the "4.5" example number, so it round-trips through the default makeToArgs with no
// custom toArgs.

import * as N from '../../lib/nottingham-npi-v330.js';

export default [
  {
    id: 'nottingham-prognostic-index',
    summary: 'Nottingham Prognostic Index (NPI) for early invasive breast cancer (Haybittle 1982 / Galea 1992). NPI = (0.2 x tumor size in cm) + lymph-node stage + histologic grade. Node stage 1 (0 nodes) / 2 (1-3 positive) / 3 (>= 4 positive); grade 1/2/3. Prognostic groups: excellent <= 2.4 (~93% 5-year survival), good > 2.4 to <= 3.4 (~85%), moderate > 3.4 to <= 5.4 (~70%), poor > 5.4 (~50%). Reports the cited prognostic score and group, not a diagnosis or a treatment order.',
    compute: N.nottinghamNpi,
    fields: [
      { dom: 'npi-size', arg: 'size', kind: 'number', label: 'Tumor size (cm)' },
      { dom: 'npi-node', arg: 'nodeStage', kind: 'enum', values: ['1', '2', '3'], label: 'Lymph-node stage (1=0 nodes, 2=1-3, 3=>=4)' },
      { dom: 'npi-grade', arg: 'grade', kind: 'enum', values: ['1', '2', '3'], label: 'Histologic grade (1-3)' },
    ],
  },
];
