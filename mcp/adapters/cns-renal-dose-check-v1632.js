// spec-v1632 MCP adapter: cns-renal-dose-check in lib/cns-renal-dose-check-v1632.js. The dom keys
// mirror views/group-v1632.js and META['cns-renal-dose-check'].example. Clinical domain. Eight label
// rows, read through the shared band engine in lib/label-dose.js.

import * as CN from '../../lib/cns-renal-dose-check-v1632.js';

export default [
  {
    id: 'cns-renal-dose-check',
    summary: 'The renal limit the FDA label gives for eight CNS drugs. For levetiracetam, lacosamide, topiramate, memantine extended-release, tramadol, duloxetine, desvenlafaxine or varenicline it reports the label row for the creatinine clearance (GFR for duloxetine) or for dialysis; for levetiracetam it first adjusts the clearance for body surface area, as that label requires. It recommends nothing.',
    compute: CN.cnsRenalDoseCheck,
    fields: [
      { dom: 'cns-regimen', arg: 'regimen', kind: 'enum', required: true, values: CN.REGIMENS.map((r) => r.value), label: 'Drug' },
      { dom: 'cns-dialysis', arg: 'dialysis', kind: 'enum', required: true, values: CN.DIALYSIS.map((d) => d.value), label: 'Dialysis: none, hd or pd' },
      { dom: 'cns-kidney', arg: 'kidney', kind: 'number', label: 'Creatinine clearance (GFR for duloxetine)', unit: 'mL/min' },
      { dom: 'cns-bsa', arg: 'bsa', kind: 'number', label: 'Levetiracetam: body surface area', unit: 'm²' },
    ],
  },
];
