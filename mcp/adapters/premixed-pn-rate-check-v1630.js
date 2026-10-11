// spec-v1630 MCP adapter: premixed-pn-rate-check in lib/premixed-pn-rate-check-v1630.js. The dom
// keys mirror views/group-v1630.js and META['premixed-pn-rate-check'].example. Clinical domain.
// Adult maximums from each label's Table 2, as label rows.

import * as PR from '../../lib/premixed-pn-rate-check-v1630.js';

export default [
  {
    id: 'premixed-pn-rate-check',
    summary: 'Sets the rate of a premixed parenteral nutrition bag, in mL/kg/hour, beside the adult maximum on its FDA label. Covers each Clinimix and Clinimix E formulation and Kabiven, with the amino acid and dextrose g/kg/hour that rate delivers and whether the label limits it to a central vein. Adult maximums only. Reports; it does not say what rate to run.',
    compute: PR.premixedPnRateCheck,
    fields: [
      { dom: 'pr-form', arg: 'formulation', kind: 'enum', required: true, values: PR.FORMULATION_OPTIONS.map((f) => f.value), label: 'Formulation (amino acid percent / dextrose percent)' },
      { dom: 'pr-weight', arg: 'weight', kind: 'number', required: true, label: 'Patient weight (adult)' },
      { dom: 'pr-wunit', arg: 'weightUnit', kind: 'enum', required: true, values: PR.WEIGHT_UNITS.map((u) => u.value), label: 'Weight unit' },
      { dom: 'pr-rate', arg: 'rate', kind: 'number', required: false, label: 'Rate (or enter volume and hours)', unit: 'mL/hour' },
      { dom: 'pr-vol', arg: 'volume', kind: 'number', required: false, label: 'Volume per day', unit: 'mL' },
      { dom: 'pr-hours', arg: 'hours', kind: 'number', required: false, label: 'Hours it runs over', unit: 'hours' },
    ],
  },
];
