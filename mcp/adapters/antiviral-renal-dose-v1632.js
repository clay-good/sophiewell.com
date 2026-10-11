// spec-v1632 MCP adapter: antiviral-renal-dose in lib/antiviral-renal-dose-v1632.js. The dom keys
// mirror views/group-v1632.js and META['antiviral-renal-dose'].example. Clinical domain. Eight label
// rows, read through the shared band engine in lib/label-dose.js.

import * as AV from '../../lib/antiviral-renal-dose-v1632.js';

export default [
  {
    id: 'antiviral-renal-dose',
    summary: 'The row of the FDA label renal table for an antiviral. For acyclovir IV, valacyclovir, famciclovir, ganciclovir, valganciclovir, oseltamivir, nirmatrelvir with ritonavir, or remdesivir it reports the row for the indication and the creatinine clearance or eGFR entered, or the label line for hemodialysis or peritoneal dialysis. A value on a shared edge or between two printed bands shows both rows. It recommends nothing.',
    compute: AV.antiviralRenalDose,
    fields: [
      { dom: 'avr-regimen', arg: 'regimen', kind: 'enum', required: true, values: AV.REGIMENS.map((r) => r.value), label: 'Drug and indication' },
      { dom: 'avr-dialysis', arg: 'dialysis', kind: 'enum', required: true, values: AV.DIALYSIS.map((d) => d.value), label: 'Dialysis: none, hd or pd' },
      { dom: 'avr-kidney', arg: 'kidney', kind: 'number', label: 'Creatinine clearance (eGFR for Paxlovid)', unit: 'mL/min' },
    ],
  },
];
