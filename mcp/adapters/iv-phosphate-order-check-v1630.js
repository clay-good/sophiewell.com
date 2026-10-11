// spec-v1630 MCP adapter: iv-phosphate-order-check in lib/iv-phosphate-order-check-v1630.js. The dom
// keys mirror views/group-v1630.js and META['iv-phosphate-order-check'].example. Clinical domain.
// The potassium phosphates label's dose, concentration and rate rows are label rows.

import * as IP from '../../lib/iv-phosphate-order-check-v1630.js';

export default [
  {
    id: 'iv-phosphate-order-check',
    summary: 'Sets an IV phosphate order beside the product\'s FDA label. Gives the concentrate volume at 3 mmol/mL, the potassium or sodium it carries, the concentration and the hourly rate. For potassium phosphates it compares the dose, the 45 mmol single-dose maximum, and the concentration and rate maximums by age and line. The sodium phosphates label prints no limits. Reports only.',
    compute: IP.ivPhosphateOrderCheck,
    fields: [
      { dom: 'ip-salt', arg: 'salt', kind: 'enum', required: true, values: IP.SALT_OPTIONS.map((s) => s.value), label: 'Salt: potassium or sodium phosphates' },
      { dom: 'ip-age', arg: 'ageBand', kind: 'enum', required: true, values: IP.AGE_BANDS.map((a) => a.value), label: 'Age band (under-12-months, 1-to-11-years or 12-plus)' },
      { dom: 'ip-weight', arg: 'weight', kind: 'number', required: true, label: 'Actual body weight' },
      { dom: 'ip-wunit', arg: 'weightUnit', kind: 'enum', required: true, values: IP.WEIGHT_UNITS.map((u) => u.value), label: 'Weight unit' },
      { dom: 'ip-dose', arg: 'dose', kind: 'number', required: true, label: 'Phosphorus ordered' },
      { dom: 'ip-dunit', arg: 'doseUnit', kind: 'enum', required: true, values: IP.DOSE_UNITS.map((u) => u.value), label: 'Dose unit: mmol or mmol/kg (mmol-kg)' },
      { dom: 'ip-vol', arg: 'finalVolume', kind: 'number', required: true, label: 'Final volume', unit: 'mL' },
      { dom: 'ip-hours', arg: 'hours', kind: 'number', required: true, label: 'Infusion time', unit: 'hours' },
      { dom: 'ip-line', arg: 'line', kind: 'enum', required: true, values: IP.LINES.map((l) => l.value), label: 'Line: peripheral or central venous catheter' },
      { dom: 'ip-phos', arg: 'serumPhosphorus', kind: 'number', required: false, label: 'Serum phosphorus (optional)', unit: 'mg/dL' },
      { dom: 'ip-k', arg: 'serumPotassium', kind: 'number', required: false, label: 'Serum potassium (optional)', unit: 'mEq/L' },
    ],
  },
];
