// spec-v1632 MCP adapter: gi-drug-dose-check in lib/gi-drug-dose-check-v1632.js. The dom keys mirror
// views/group-v1632.js and META['gi-drug-dose-check'].example. Clinical domain. Two label rows:
// famotidine tablets and Reglan.

import * as GI from '../../lib/gi-drug-dose-check-v1632.js';

export default [
  {
    id: 'gi-drug-dose-check',
    summary: 'The adjustment the FDA label gives for famotidine or metoclopramide. Famotidine: the recommended maximum dosage by indication at a creatinine clearance of 30 to 60 mL/minute or below 30. Metoclopramide: the dose and maximum daily dose for reflux or diabetic gastroparesis, lowered for Child-Pugh B or C, a CYP2D6 poor metabolizer, a strong CYP2D6 inhibitor, the renal row, or end-stage renal disease. It recommends nothing.',
    compute: GI.giDrugDoseCheck,
    fields: [
      { dom: 'gid-regimen', arg: 'regimen', kind: 'enum', required: true, values: GI.REGIMENS.map((r) => r.value), label: 'Drug and indication' },
      { dom: 'gid-dialysis', arg: 'dialysis', kind: 'enum', required: true, values: GI.DIALYSIS.map((d) => d.value), label: 'Dialysis: none, hd or pd' },
      { dom: 'gid-kidney', arg: 'kidney', kind: 'number', label: 'Creatinine clearance', unit: 'mL/min' },
      { dom: 'gid-hepatic', arg: 'hepatic', kind: 'enum', values: GI.HEPATIC.map((h) => h.value), label: 'Metoclopramide: hepatic function' },
      { dom: 'gid-pm', arg: 'poorMetabolizer', kind: 'enum', values: GI.YES_NO.map((y) => y.value), label: 'Metoclopramide: CYP2D6 poor metabolizer' },
      { dom: 'gid-inh', arg: 'inhibitor', kind: 'enum', values: GI.YES_NO.map((y) => y.value), label: 'Metoclopramide: strong CYP2D6 inhibitor' },
    ],
  },
];
