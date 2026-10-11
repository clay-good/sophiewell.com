// spec-v1632 MCP adapter: gabapentinoid-renal-dose in lib/gabapentinoid-renal-dose-v1632.js. The dom
// keys mirror views/group-v1632.js and META['gabapentinoid-renal-dose'].example. Clinical domain.
// Two label rows: Neurontin and Lyrica.

import * as GB from '../../lib/gabapentinoid-renal-dose-v1632.js';

export default [
  {
    id: 'gabapentinoid-renal-dose',
    summary: 'The row of the FDA label renal table for gabapentin or pregabalin. Gabapentin: the daily dose range and regimen for the creatinine clearance, and below 15 mL/min the proportional figure the label describes. Pregabalin: the dose the label maps to a chosen normal daily dose in each clearance band. Both add the post-hemodialysis supplement. It recommends nothing.',
    compute: GB.gabapentinoidRenalDose,
    fields: [
      { dom: 'gbr-drug', arg: 'drug', kind: 'enum', required: true, values: GB.DRUGS.map((d) => d.value), label: 'Drug' },
      { dom: 'gbr-crcl', arg: 'crcl', kind: 'number', required: true, label: 'Creatinine clearance', unit: 'mL/min' },
      { dom: 'gbr-hd', arg: 'hemodialysis', kind: 'enum', required: true, values: GB.YES_NO.map((y) => y.value), label: 'On hemodialysis' },
      { dom: 'gbr-normal', arg: 'normalDose', kind: 'enum', values: GB.NORMAL_DOSES.map((n) => n.value), label: 'Pregabalin: normal daily dose, mg/day' },
    ],
  },
];
