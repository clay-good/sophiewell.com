// spec-v1632 MCP adapter: gout-drug-renal-dose in lib/gout-drug-renal-dose-v1632.js. The dom keys
// mirror views/group-v1632.js and META['gout-drug-renal-dose'].example. Clinical domain. Two label
// rows, read through the shared band engine in lib/label-dose.js.

import * as GT from '../../lib/gout-drug-renal-dose-v1632.js';

export default [
  {
    id: 'gout-drug-renal-dose',
    summary: 'The row the FDA label gives for allopurinol or colchicine by kidney function. Allopurinol (by eGFR): the initial dosage in gout and the dosage for hyperuricemia with cancer therapy. Colchicine (by creatinine clearance): prophylaxis, treatment of a flare and familial Mediterranean fever, with the label lines for dialysis. It recommends nothing.',
    compute: GT.goutDrugRenalDose,
    fields: [
      { dom: 'gdr-regimen', arg: 'regimen', kind: 'enum', required: true, values: GT.REGIMENS.map((r) => r.value), label: 'Drug and indication' },
      { dom: 'gdr-dialysis', arg: 'dialysis', kind: 'enum', required: true, values: GT.DIALYSIS.map((d) => d.value), label: 'Dialysis: none, hd or pd' },
      { dom: 'gdr-kidney', arg: 'kidney', kind: 'number', label: 'eGFR (allopurinol) or creatinine clearance', unit: 'mL/min' },
    ],
  },
];
