// spec-v1632 MCP adapter: cardiac-renal-dose-check in lib/cardiac-renal-dose-check-v1632.js. The dom
// keys mirror views/group-v1632.js and META['cardiac-renal-dose-check'].example. Clinical domain.
// Five label rows, read through the shared band engine in lib/label-dose.js.

import * as CR from '../../lib/cardiac-renal-dose-check-v1632.js';

export default [
  {
    id: 'cardiac-renal-dose-check',
    summary: 'The renal row the FDA label gives for five cardiac drugs. For sotalol (dosing interval), atenolol (maximum dose), lisinopril (initial dose by indication), sacubitril-valsartan (by eGFR, with the hepatic rule) or rosuvastatin it reports the label row for the creatinine clearance or eGFR entered, or for dialysis. It recommends nothing.',
    compute: CR.cardiacRenalDoseCheck,
    fields: [
      { dom: 'crd-regimen', arg: 'regimen', kind: 'enum', required: true, values: CR.REGIMENS.map((r) => r.value), label: 'Drug and indication' },
      { dom: 'crd-dialysis', arg: 'dialysis', kind: 'enum', required: true, values: CR.DIALYSIS.map((d) => d.value), label: 'Dialysis: none, hd or pd' },
      { dom: 'crd-kidney', arg: 'kidney', kind: 'number', label: 'Creatinine clearance (eGFR for Entresto)', unit: 'mL/min' },
    ],
  },
];
