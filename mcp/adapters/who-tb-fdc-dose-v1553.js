// spec-v1553 MCP adapter: WHO first-line TB tablets by weight in lib/who-tb-fdc-dose-v1553.js.
// The dom keys mirror views/group-v1553.js and META['who-tb-fdc-dose'].example. Clinical domain.

import * as T from '../../lib/who-tb-fdc-dose-v1553.js';

export default [
  {
    id: 'who-tb-fdc-dose',
    summary: 'Gives first-line TB tablets by weight from WHO tables. Child dispersible HRZ, E and HR under 25 kg, adult FDCs from 25 kg with loose-tablet equivalents, or the 4-month HPMZ regimen for those 12 or older and 40 kg or more.',
    compute: T.whoTbFdcDose,
    fields: [
      { dom: 'tb-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight in kg', min: 1, max: 250 },
      { dom: 'tb-phase', arg: 'phase', kind: 'enum', required: true, label: 'Phase', values: T.PHASE_OPTIONS.map((d) => d.value) },
      { dom: 'tb-regimen', arg: 'regimen', kind: 'enum', label: 'Regimen (standard if blank)', values: T.REGIMEN_OPTIONS.map((d) => d.value) },
      { dom: 'tb-age', arg: 'age', kind: 'number', label: 'Age in years (for HPMZ)', min: 0, max: 120 },
    ],
  },
];
