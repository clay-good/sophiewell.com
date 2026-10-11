// spec-v1633 MCP adapter: iv-iron-course in lib/iv-iron-course-v1633.js. The dom keys mirror
// views/group-v1633.js and META['iv-iron-course'].example. Clinical domain. Five label rows:
// Injectafer, Venofer, Feraheme, Monoferric and INFeD.

import * as IC from '../../lib/iv-iron-course-v1633.js';

export default [
  {
    id: 'iv-iron-course',
    summary: 'The IV iron course a product\'s label gives: each dose in mg and mL, the spacing, and the course total. Injectafer (iron deficiency anemia, the adult single-dose alternative, or heart failure by weight and hemoglobin), Venofer (hemodialysis, non-dialysis, peritoneal dialysis, pediatric maintenance), Feraheme, Monoferric, and INFeD by the label\'s own formula or for blood loss. With a start date it gives the dates or date windows. It does not choose between products.',
    compute: IC.ivIronCourse,
    fields: [
      { dom: 'iic-regimen', arg: 'regimen', kind: 'enum', required: true, values: IC.REGIMENS.map((d) => d.value), label: 'Product and indication' },
      { dom: 'iic-weight', arg: 'weightKg', kind: 'number', label: 'Weight (Injectafer, Monoferric, pediatric Venofer, INFeD)', unit: 'kg' },
      { dom: 'iic-hb', arg: 'hb', kind: 'number', label: 'Hemoglobin (Injectafer in heart failure; INFeD: observed)', unit: 'g/dL' },
      { dom: 'iic-desired', arg: 'desiredHb', kind: 'number', label: 'INFeD: desired hemoglobin (label normal: 14.8 above 15 kg, 12 at 15 kg or less)', unit: 'g/dL' },
      { dom: 'iic-sex', arg: 'sex', kind: 'enum', values: IC.SEXES.map((d) => d.value), label: 'INFeD above 15 kg: sex' },
      { dom: 'iic-height', arg: 'heightCm', kind: 'number', label: 'INFeD above 15 kg: height', unit: 'cm' },
      { dom: 'iic-loss', arg: 'bloodLossMl', kind: 'number', label: 'INFeD for blood loss: blood loss', unit: 'mL' },
      { dom: 'iic-hct', arg: 'hematocrit', kind: 'number', label: 'INFeD for blood loss: hematocrit', unit: '%' },
      { dom: 'iic-start', arg: 'startDate', kind: 'string', label: 'Date of the first dose (YYYY-MM-DD, optional)' },
    ],
  },
];
