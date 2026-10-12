// spec-v1636 MCP adapter: rsi-dose-sheet in lib/rsi-dose-sheet-v1636.js. The dom keys mirror
// views/group-v1636.js and META['rsi-dose-sheet'].example. Clinical domain. Four label rows.

import * as RS from '../../lib/rsi-dose-sheet-v1636.js';

export default [
  {
    id: 'rsi-dose-sheet',
    summary: 'Intubation drug doses from the FDA labels at one weight: etomidate, ketamine, succinylcholine and rocuronium, each as the label\'s range in mg and mL. Where a label gives no dose for the patient\'s age (etomidate under 10 years, ketamine under 16) the row says so. Only the rocuronium label has a rapid sequence section; no textbook figures are added.',
    compute: (args) => RS.rsiDoseSheet(args, new Date()),
    fields: [
      { dom: 'rds-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'rds-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'rds-patient', arg: 'patient', kind: 'enum', required: true, values: RS.PATIENTS.map((x) => x.value), label: 'Patient group' },
      { dom: 'rds-ketamine', arg: 'ketamineConcentration', kind: 'enum', required: true, values: RS.KETAMINE.map((x) => x.value), label: 'Ketamine concentration in hand' },
    ],
  },
];
