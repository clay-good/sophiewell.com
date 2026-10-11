// spec-v1632 MCP adapter: lmwh-fondaparinux-dose-check in lib/lmwh-fondaparinux-dose-check-v1632.js.
// The dom keys mirror views/group-v1632.js and META['lmwh-fondaparinux-dose-check'].example. Clinical
// domain. Two label rows: Fragmin and Arixtra.

import * as LF from '../../lib/lmwh-fondaparinux-dose-check-v1632.js';

export default [
  {
    id: 'lmwh-fondaparinux-dose-check',
    summary: 'The dose the FDA label gives for dalteparin or fondaparinux. Dalteparin: the weight-band table dose beside the per-kilogram figure for unstable angina and for VTE in cancer (with the platelet and creatinine clearance rules), and the fixed prophylaxis doses. Fondaparinux: the weight-band treatment dose, the prophylaxis dose, and the two contraindications by clearance and weight. It reports the label and recommends nothing.',
    compute: LF.lmwhFondaparinuxDoseCheck,
    fields: [
      { dom: 'lf-drug', arg: 'drug', kind: 'enum', required: true, values: LF.DRUGS.map((d) => d.value), label: 'Drug' },
      { dom: 'lf-ind', arg: 'indication', kind: 'enum', required: true, values: LF.INDICATIONS.map((i) => i.value), label: 'Indication' },
      { dom: 'lf-weight', arg: 'weight', kind: 'number', label: 'Weight (where the label doses by it)', unit: 'kg' },
      { dom: 'lf-crcl', arg: 'crcl', kind: 'number', label: 'Creatinine clearance (fondaparinux; cancer VTE)', unit: 'mL/min' },
      { dom: 'lf-month', arg: 'month', kind: 'enum', values: LF.MONTHS.map((m) => m.value), label: 'Dalteparin cancer VTE: month of treatment' },
      { dom: 'lf-plt', arg: 'platelets', kind: 'number', label: 'Dalteparin cancer VTE: platelets', unit: '× 1,000/mm³' },
    ],
  },
];
