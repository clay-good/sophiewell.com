// spec-v1631 MCP adapter: vanc-hd-dose in lib/vanc-hd-dose-v1631.js. The dom keys mirror
// views/group-v1631.js and META['vanc-hd-dose'].example. Clinical domain. The 2020 vancomycin
// consensus guideline's hemodialysis tabulation.

import * as VH from '../../lib/vanc-hd-dose-v1631.js';

export default [
  {
    id: 'vanc-hd-dose',
    summary: 'Starting vancomycin doses for a patient on intermittent hemodialysis. Loading and maintenance doses from the 2020 ASHP/IDSA/PIDS/SIDP consensus guideline: mg/kg by whether the dose is given after dialysis or during it and by dialyzer permeability, on actual body weight, with the 25% larger dose before the 3-day gap, a predialysis level set against 15 to 20 mg/L, and the hybrid dialysis and CRRT starting doses.',
    compute: VH.vancHdDose,
    fields: [
      { dom: 'vhd-weight', arg: 'weight', kind: 'number', required: true, label: 'Actual body weight', unit: 'kg' },
      { dom: 'vhd-timing', arg: 'timing', kind: 'enum', required: true, values: VH.TIMINGS.map((t) => t.value), label: 'Dose given after dialysis or during it' },
      { dom: 'vhd-perm', arg: 'permeability', kind: 'enum', required: true, values: VH.PERMEABILITIES.map((p) => p.value), label: 'Dialyzer permeability' },
      { dom: 'vhd-level', arg: 'preLevel', kind: 'number', label: 'Predialysis level (optional)', unit: 'mg/L' },
    ],
  },
];
