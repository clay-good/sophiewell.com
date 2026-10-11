// spec-v1632 MCP adapter: bisphosphonate-renal-check in lib/bisphosphonate-renal-check-v1632.js. The
// dom keys mirror views/group-v1632.js and META['bisphosphonate-renal-check'].example. Clinical
// domain. Four label rows, read through the shared band engine in lib/label-dose.js.

import * as BP from '../../lib/bisphosphonate-renal-check-v1632.js';

export default [
  {
    id: 'bisphosphonate-renal-check',
    summary: 'The dose or cutoff the FDA label gives for a bisphosphonate by kidney function. Zoledronic acid 4 mg: the reduced dose by creatinine clearance for myeloma or bone metastases, and the hypercalcemia of malignancy row. Reclast, alendronate and risedronate: the creatinine clearance below which the label contraindicates or does not recommend the drug. It recommends nothing.',
    compute: BP.bisphosphonateRenalCheck,
    fields: [
      { dom: 'bpr-regimen', arg: 'regimen', kind: 'enum', required: true, values: BP.REGIMENS.map((r) => r.value), label: 'Drug and indication' },
      { dom: 'bpr-dialysis', arg: 'dialysis', kind: 'enum', required: true, values: BP.DIALYSIS.map((d) => d.value), label: 'Dialysis: none, hd or pd' },
      { dom: 'bpr-kidney', arg: 'kidney', kind: 'number', label: 'Creatinine clearance', unit: 'mL/min' },
    ],
  },
];
