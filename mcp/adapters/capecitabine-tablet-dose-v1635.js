// spec-v1635 MCP adapter: capecitabine-tablet-dose in lib/capecitabine-tablet-dose-v1635.js. The dom
// keys mirror views/group-v1635.js and META['capecitabine-tablet-dose'].example. Clinical domain. One
// label row: Xeloda.

import * as CP from '../../lib/capecitabine-tablet-dose-v1635.js';

export default [
  {
    id: 'capecitabine-tablet-dose',
    summary: 'Capecitabine dose in whole tablets, by the Xeloda label\'s rounding rule. It multiplies the dose level by body surface area and the percent chosen, takes 25% off for a creatinine clearance of 30 to 50 mL/min, rounds to the nearest 150 mg, and gives the 500 mg and 150 mg tablets per dose and per cycle. A dose exactly halfway is shown both ways. It does not choose the dose level.',
    compute: (args) => CP.capecitabineTabletDose(args, new Date()),
    fields: [
      { dom: 'cap-level', arg: 'level', kind: 'enum', required: true, values: CP.LEVELS.map((l) => l.value), label: 'Dose level per dose, mg/m² twice daily' },
      { dom: 'cap-typed', arg: 'typedLevel', kind: 'number', label: 'Another dose level', unit: 'mg/m²' },
      { dom: 'cap-bsa', arg: 'bsa', kind: 'number', required: true, label: 'Body surface area', unit: 'm²' },
      { dom: 'cap-crcl', arg: 'crcl', kind: 'number', required: true, label: 'Creatinine clearance (Cockcroft-Gault)', unit: 'mL/min' },
      { dom: 'cap-percent', arg: 'percent', kind: 'enum', required: true, values: CP.PERCENTS.map((p) => p.value), label: 'Percent of the dose for this cycle' },
      { dom: 'cap-days', arg: 'daysOn', kind: 'number', label: 'Days of treatment in the cycle (optional)', unit: 'days' },
    ],
  },
];
