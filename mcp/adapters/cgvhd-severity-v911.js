// spec-v911 MCP adapter: the NIH 2014 chronic graft-versus-host disease global severity in
// lib/cgvhd-severity-v911.js. The dom keys mirror the browser renderer (views/group-v911.js) and
// META['cgvhd-severity'].example.
//
// An organ left out is 'na', never 0. Clinical domain.

import { cgvhdSeverity } from '../../lib/cgvhd-severity-v911.js';

export default [
  {
    id: 'cgvhd-severity',
    summary: 'Reads the NIH 2014 consensus global severity of chronic graft-versus-host disease. Eight organs are each scored 0 to 3 -- skin, mouth, eyes, gastrointestinal tract, liver, lungs, joints and fascia, and the genital tract -- and the global severity follows: severe is any organ at 3 or a lung score of 2 or 3; moderate is any organ at 2, or three or more organs at 1, or a lung score of 1; mild is one or two organs at 1 with the lung at 0. THE LUNG SCORES ON ITS OWN, and that override is the part most often missed: a lung score of 1 makes the disease at least moderate and a score of 2 or 3 makes it severe, whatever every other organ shows. NOT ASSESSED IS NOT ZERO -- pass na for an organ that was never looked at, and the result reports how many were left out rather than reading a blank as uninvolved. THE DIAGNOSIS IS ASSUMED ALREADY MADE; this is not a diagnostic test. Acute graft-versus-host disease is a different system entirely.',
    compute: cgvhdSeverity,
    fields: [
      { dom: 'cg-skin', arg: 'skin', kind: 'enum', required: false, label: 'Skin score', values: ['na', '0', '1', '2', '3'] },
      { dom: 'cg-mouth', arg: 'mouth', kind: 'enum', required: false, label: 'Mouth score', values: ['na', '0', '1', '2', '3'] },
      { dom: 'cg-eyes', arg: 'eyes', kind: 'enum', required: false, label: 'Eye score', values: ['na', '0', '1', '2', '3'] },
      { dom: 'cg-gi', arg: 'gi', kind: 'enum', required: false, label: 'Gastrointestinal tract score', values: ['na', '0', '1', '2', '3'] },
      { dom: 'cg-liver', arg: 'liver', kind: 'enum', required: false, label: 'Liver score', values: ['na', '0', '1', '2', '3'] },
      { dom: 'cg-lungs', arg: 'lungs', kind: 'enum', required: false, label: 'Lung score (this organ can set the grade on its own)', values: ['na', '0', '1', '2', '3'] },
      { dom: 'cg-joints', arg: 'joints', kind: 'enum', required: false, label: 'Joints and fascia score', values: ['na', '0', '1', '2', '3'] },
      { dom: 'cg-genital', arg: 'genital', kind: 'enum', required: false, label: 'Genital tract score', values: ['na', '0', '1', '2', '3'] },
    ],
  },
];
