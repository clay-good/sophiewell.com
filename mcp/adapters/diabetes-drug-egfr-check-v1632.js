// spec-v1632 MCP adapter: diabetes-drug-egfr-check in lib/diabetes-drug-egfr-check-v1632.js. The dom
// keys mirror views/group-v1632.js and META['diabetes-drug-egfr-check'].example. Clinical domain.
// Seven label rows, read through the shared band engine in lib/label-dose.js.

import * as DM from '../../lib/diabetes-drug-egfr-check-v1632.js';

export default [
  {
    id: 'diabetes-drug-egfr-check',
    summary: 'The kidney-function rule the FDA label gives for a diabetes drug. For metformin, empagliflozin, dapagliflozin, canagliflozin, sitagliptin, saxagliptin or alogliptin it reports the label row for the eGFR (creatinine clearance for alogliptin) or for dialysis, with starting and continuing kept apart where the label separates them. It recommends nothing.',
    compute: DM.diabetesDrugEgfrCheck,
    fields: [
      { dom: 'dme-regimen', arg: 'regimen', kind: 'enum', required: true, values: DM.REGIMENS.map((r) => r.value), label: 'Drug and use' },
      { dom: 'dme-dialysis', arg: 'dialysis', kind: 'enum', required: true, values: DM.DIALYSIS.map((d) => d.value), label: 'Dialysis: none, hd or pd' },
      { dom: 'dme-kidney', arg: 'kidney', kind: 'number', label: 'eGFR (creatinine clearance for alogliptin)', unit: 'mL/min/1.73 m²' },
    ],
  },
];
