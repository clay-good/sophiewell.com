// spec-v1630 MCP adapter: iv-label-rate-check in lib/iv-label-rate-check-v1630.js. The dom keys
// mirror views/group-v1630.js and META['iv-label-rate-check'].example. Clinical domain. Six drugs
// with a numeric rate or concentration limit on the label, held as label rows.

import * as RC from '../../lib/iv-label-rate-check-v1630.js';

export default [
  {
    id: 'iv-label-rate-check',
    summary: 'Sets an IV order\'s delivery rate and concentration beside the limits on the drug\'s FDA label. Covers phenytoin, fosphenytoin, vancomycin, potassium chloride, magnesium sulfate and calcium gluconate, and gives the shortest infusion time that meets the rate limit. The dose is in the drug\'s own unit (mg, mg PE or mEq). Reports only; it does not say what rate to run.',
    compute: RC.ivLabelRateCheck,
    fields: [
      { dom: 'rc3-drug', arg: 'drug', kind: 'enum', required: true, values: RC.DRUG_OPTIONS.map((d) => d.value), label: 'Drug' },
      { dom: 'rc3-pop', arg: 'population', kind: 'enum', required: true, values: RC.POPULATIONS.map((p) => p.value), label: 'Adult or pediatric' },
      { dom: 'rc3-dose', arg: 'dose', kind: 'number', required: true, label: 'Dose, in the drug\'s unit (mg, mg PE or mEq)' },
      { dom: 'rc3-vol', arg: 'finalVolume', kind: 'number', required: true, label: 'Final volume', unit: 'mL' },
      { dom: 'rc3-min', arg: 'minutes', kind: 'number', required: true, label: 'Infusion time', unit: 'minutes' },
      { dom: 'rc3-set', arg: 'setting', kind: 'enum', required: false, values: RC.SETTINGS.map((s) => s.value), label: 'Setting (potassium: routine or urgent; calcium: bolus or continuous)' },
      { dom: 'rc3-weight', arg: 'weight', kind: 'number', required: false, label: 'Weight (pediatric phenytoin or fosphenytoin)' },
      { dom: 'rc3-wunit', arg: 'weightUnit', kind: 'enum', required: false, values: RC.WEIGHT_UNITS.map((u) => u.value), label: 'Weight unit' },
    ],
  },
];
