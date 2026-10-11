// spec-v1634 MCP adapter: relative-infant-dose in lib/relative-infant-dose-v1634.js. The dom keys
// mirror views/group-v1634.js and META['relative-infant-dose'].example. Clinical domain. Either the
// milk concentration, or the milk-plasma ratio with the plasma concentration, never both.

import * as RD from '../../lib/relative-infant-dose-v1634.js';

export default [
  {
    id: 'relative-infant-dose',
    summary: 'Relative infant dose and estimated infant dosage through breast milk. From a measured milk concentration, or a milk-plasma ratio with the maternal plasma concentration, it applies the FDA draft guidance formulas at milk intakes of 150 and 200 mL/kg a day and divides by the weight-adjusted maternal dosage. The guidance gives no cutoff, and none is applied.',
    compute: RD.relativeInfantDose,
    fields: [
      { dom: 'rid-milk', arg: 'milkConcentration', kind: 'number', label: 'Average milk concentration (or use the ratio and plasma concentration)' },
      { dom: 'rid-mp', arg: 'mpRatio', kind: 'number', label: 'Milk-plasma ratio' },
      { dom: 'rid-plasma', arg: 'plasmaConcentration', kind: 'number', label: 'Average maternal plasma concentration' },
      { dom: 'rid-unit', arg: 'unit', kind: 'enum', required: true, values: RD.UNITS.map((u) => u.value), label: 'Concentration unit' },
      { dom: 'rid-dose', arg: 'maternalDose', kind: 'number', required: true, label: 'Maternal dose', unit: 'mg/day' },
      { dom: 'rid-weight', arg: 'maternalWeight', kind: 'number', required: true, label: 'Maternal weight', unit: 'kg' },
      { dom: 'rid-approved', arg: 'approvedInfantDose', kind: 'number', label: 'Approved infant dose (optional)', unit: 'mg/kg/day' },
    ],
  },
];
