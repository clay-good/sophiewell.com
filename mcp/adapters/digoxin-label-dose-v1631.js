// spec-v1631 MCP adapter: digoxin-label-dose in lib/digoxin-label-dose-v1631.js. The dom keys mirror
// views/group-v1631.js and META['digoxin-label-dose'].example. Clinical domain. The digoxin tablets
// label's loading range, formula and maintenance table, as a label row. It does not interpret levels.

import * as DG from '../../lib/digoxin-label-dose-v1631.js';

export default [
  {
    id: 'digoxin-label-dose',
    summary: 'Digoxin loading schedule and maintenance dose by the method on the FDA tablets label. The loading dose is chosen by the reader, in mcg/kg of lean weight. Gives the half-then-quarters schedule, the maintenance dose by the label\'s formula and by its table, and the days to steady state. It does not interpret digoxin levels.',
    compute: DG.digoxinLabelDose,
    fields: [
      { dom: 'dg-age', arg: 'ageGroup', kind: 'enum', required: true, values: DG.AGE_GROUPS.map((a) => a.value), label: 'Age group: adult or child over 10 years (over-10), or 5 to 10 years (5-10)' },
      { dom: 'dg-weight', arg: 'leanWeight', kind: 'number', required: true, label: 'Lean body weight' },
      { dom: 'dg-wunit', arg: 'weightUnit', kind: 'enum', required: true, values: DG.WEIGHT_UNITS.map((u) => u.value), label: 'Weight unit' },
      { dom: 'dg-load', arg: 'loadMcgPerKg', kind: 'number', required: true, label: 'Loading dose chosen', unit: 'mcg/kg' },
      { dom: 'dg-crcl', arg: 'creatinineClearance', kind: 'number', required: false, label: 'Corrected creatinine clearance (for maintenance, over 10 years)', unit: 'mL/min' },
      { dom: 'dg-scr', arg: 'serumCreatinine', kind: 'number', required: false, label: 'Or, for an adult: serum creatinine (the label estimates the clearance)', unit: 'mg/dL' },
      { dom: 'dg-years', arg: 'patientAge', kind: 'number', required: false, label: 'Age, with a serum creatinine', unit: 'years' },
      { dom: 'dg-sex', arg: 'sex', kind: 'enum', required: false, values: DG.SEXES.map((x) => x.value), label: 'Sex, with a serum creatinine' },
      { dom: 'dg-tab', arg: 'tabletDose', kind: 'number', required: false, label: 'Tablet dose to convert to intravenous', unit: 'mcg' },
    ],
  },
];
