// spec-v1632 MCP adapter: nrti-renal-dose in lib/nrti-renal-dose-v1632.js. The dom keys mirror
// views/group-v1632.js and META['nrti-renal-dose'].example. Clinical domain. Four label rows, read
// through the shared band engine in lib/label-dose.js.

import * as NR from '../../lib/nrti-renal-dose-v1632.js';

export default [
  {
    id: 'nrti-renal-dose',
    summary: 'The row of the FDA label renal table for tenofovir DF, emtricitabine/tenofovir DF (treatment or PrEP), entecavir (usual or lamivudine-refractory) or lamivudine. It reports the row for the creatinine clearance entered, or the label line for hemodialysis or peritoneal dialysis, with the weight the label says to calculate the clearance on. It recommends nothing.',
    compute: NR.nrtiRenalDose,
    fields: [
      { dom: 'nrt-regimen', arg: 'regimen', kind: 'enum', required: true, values: NR.REGIMENS.map((r) => r.value), label: 'Drug and use' },
      { dom: 'nrt-dialysis', arg: 'dialysis', kind: 'enum', required: true, values: NR.DIALYSIS.map((d) => d.value), label: 'Dialysis: none, hd or pd' },
      { dom: 'nrt-kidney', arg: 'kidney', kind: 'number', label: 'Creatinine clearance', unit: 'mL/min' },
    ],
  },
];
