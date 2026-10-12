// spec-v1636 MCP adapter: flumazenil-ladder in lib/flumazenil-ladder-v1636.js. The dom keys mirror
// views/group-v1636.js and META['flumazenil-ladder'].example. Clinical domain. One label row.

import * as FL from '../../lib/flumazenil-ladder-v1636.js';

export default [
  {
    id: 'flumazenil-ladder',
    summary: 'The next flumazenil dose in the label\'s series and what remains under its caps. Reversal of sedation or anesthesia: 0.2 mg steps to 1 mg (0.01 mg/kg steps to 0.05 mg/kg or 1 mg in a child over 1 year). Suspected overdose in adults: 0.2 mg, 0.3 mg, then 0.5 mg steps to 3 mg, rarely to 5 mg. Past the cap it says the label gives no further dose.',
    compute: (args) => FL.flumazenilLadder(args, new Date()),
    fields: [
      { dom: 'fzl-indication', arg: 'indication', kind: 'enum', required: true, values: FL.INDICATIONS.map((x) => x.value), label: 'Indication' },
      { dom: 'fzl-patient', arg: 'patient', kind: 'enum', required: true, values: FL.PATIENTS.map((x) => x.value), label: 'Patient' },
      { dom: 'fzl-given', arg: 'dosesGiven', kind: 'number', required: true, label: 'Doses given so far in this series (0 before the first)' },
      { dom: 'fzl-weight', arg: 'weight', kind: 'number', label: 'Weight (needed for a pediatric patient)', unit: 'kg' },
    ],
  },
];
