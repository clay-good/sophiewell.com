// spec-v1631 MCP adapter: crrt-drug-clearance in lib/crrt-drug-clearance-v1631.js. The dom keys
// mirror views/group-v1631.js and META['crrt-drug-clearance'].example. Clinical domain. Li 2020 and
// Corona 2022; no coefficient table ships.

import * as CR from '../../lib/crrt-drug-clearance-v1631.js';

export default [
  {
    id: 'crrt-drug-clearance',
    summary: 'Drug clearance by continuous renal replacement therapy from the effluent flows and a sieving or saturation coefficient. Covers hemofiltration, hemodialysis and hemodiafiltration, with the correction for fluid given before the filter, and the CRRT share of total clearance. Coefficients are entered by the reader. It does not give a dose.',
    compute: CR.crrtDrugClearance,
    fields: [
      { dom: 'cr2-mode', arg: 'mode', kind: 'enum', required: true, values: CR.MODES.map((m) => m.value), label: 'Mode: hemofiltration, hemodialysis or hemodiafiltration' },
      { dom: 'cr2-unit', arg: 'flowUnit', kind: 'enum', required: true, values: CR.FLOW_UNITS.map((u) => u.value), label: 'Flow unit: mL/hour (mL-h), mL/min (mL-min) or L/hour (L-h)' },
      { dom: 'cr2-quf', arg: 'ultrafiltrateFlow', kind: 'number', required: false, label: 'Ultrafiltrate flow (filtration modes)' },
      { dom: 'cr2-sc', arg: 'sievingCoefficient', kind: 'number', required: false, label: 'Sieving coefficient (filtration modes)' },
      { dom: 'cr2-qd', arg: 'dialysateFlow', kind: 'number', required: false, label: 'Dialysate flow (dialysis modes)' },
      { dom: 'cr2-sa', arg: 'saturationCoefficient', kind: 'number', required: false, label: 'Saturation coefficient (dialysis modes)' },
      { dom: 'cr2-qp', arg: 'plasmaFlow', kind: 'number', required: false, label: 'Plasma flow (with fluid before the filter)' },
      { dom: 'cr2-pre', arg: 'preFilterFlow', kind: 'number', required: false, label: 'Pre-filter flow' },
      { dom: 'cr2-other', arg: 'otherClearance', kind: 'number', required: false, label: 'Patient\'s other clearance (optional)', unit: 'mL/min' },
    ],
  },
];
