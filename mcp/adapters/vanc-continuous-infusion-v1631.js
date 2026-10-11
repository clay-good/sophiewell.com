// spec-v1631 MCP adapter: vanc-continuous-infusion in lib/vanc-continuous-infusion-v1631.js. The dom
// keys mirror views/group-v1631.js and META['vanc-continuous-infusion'].example. Clinical domain.
// The 2020 consensus guideline's continuous-infusion figures; the label's concentration limit is a
// label row.

import * as VC from '../../lib/vanc-continuous-infusion-v1631.js';

export default [
  {
    id: 'vanc-continuous-infusion',
    summary: 'Vancomycin continuous infusion arithmetic: loading dose and daily dose on actual body weight, the pump rate in mg/h and mL/h, each set against the 2020 consensus guideline ranges (load 15 to 20 mg/kg, 30 to 40 up to 60 mg/kg/day), and the bag concentration against the FDA label. With a steady-state level: AUC24 = level × 24 against 400 to 600, and the rate for a target level by proportion.',
    compute: VC.vancContinuousInfusion,
    fields: [
      { dom: 'vci-weight', arg: 'weight', kind: 'number', required: true, label: 'Actual body weight', unit: 'kg' },
      { dom: 'vci-load', arg: 'loadPerKg', kind: 'number', required: true, label: 'Loading dose (guideline 15 to 20)', unit: 'mg/kg' },
      { dom: 'vci-daily', arg: 'dailyPerKg', kind: 'number', required: true, label: 'Daily dose (guideline 30 to 40, up to 60)', unit: 'mg/kg/day' },
      { dom: 'vci-conc', arg: 'concentration', kind: 'number', required: true, label: 'Bag concentration', unit: 'mg/mL' },
      { dom: 'vci-level', arg: 'level', kind: 'number', label: 'Steady-state level (optional)', unit: 'mg/L' },
      { dom: 'vci-rate', arg: 'currentRate', kind: 'number', label: 'Current rate (with a level)', unit: 'mg/h' },
      { dom: 'vci-target', arg: 'targetCss', kind: 'number', label: 'Target level (guideline 20 to 25)', unit: 'mg/L' },
    ],
  },
];
