// spec-v1512: MCP adapter for dose rounding to whole vials. The dom keys mirror views/group-v1512.js.

import * as VR from '../../lib/vial-rounding-v1512.js';

const n = (dom, arg, label, required = false, unit) => ({ dom, arg, kind: 'number', required, label, ...(unit ? { unit } : {}) });

export default [
  {
    id: 'vial-rounding',
    summary: 'Rounds an ordered dose to whole vials within a policy threshold. Shows the vials, the change from the order, and what the unrounded dose would discard.',
    compute: VR.vialRounding,
    fields: [
      { dom: 'vr-basis', arg: 'basis', kind: 'enum', required: true, values: VR.BASES.map((b) => b.value), label: 'Dose ordered in' },
      // spec-v1793: the library refuses a dose or a vial size outside 0.001 to 1,000,000 mg, and a
      // rounding threshold outside 0 to 25 percent. Nothing said so.
      { ...n('vr-dose', 'dose', 'Ordered dose', true), min: 0.001, max: 1e6 },
      // spec-v1786: the library's 0.3-350 kg range is hoisted above the basis split now, so it holds on
      // every basis and the declaration is true.
      { ...n('vr-weight', 'weight', 'Weight (for mg/kg)', false, 'kg'), min: 0.3, max: 350 },
      n('vr-bsa', 'bsa', 'Body surface area (for mg/m²)', false, 'm²'),
      { ...n('vr-v1', 'vial1', 'Vial size 1', true, 'mg'), min: 0.001, max: 1e6 },
      n('vr-c1', 'cost1', 'Vial 1 cost', false, 'USD'),
      { ...n('vr-v2', 'vial2', 'Vial size 2', false, 'mg'), min: 0.001, max: 1e6 },
      n('vr-c2', 'cost2', 'Vial 2 cost', false, 'USD'),
      { ...n('vr-v3', 'vial3', 'Vial size 3', false, 'mg'), min: 0.001, max: 1e6 },
      n('vr-c3', 'cost3', 'Vial 3 cost', false, 'USD'),
      { ...n('vr-th', 'threshold', 'Rounding threshold (blank for 10%)', false, '%'), min: 0, max: 25 },
    ],
  },
];
