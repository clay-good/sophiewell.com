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
      n('vr-dose', 'dose', 'Ordered dose', true),
      n('vr-weight', 'weight', 'Weight (for mg/kg)', false, 'kg'),
      n('vr-bsa', 'bsa', 'Body surface area (for mg/m²)', false, 'm²'),
      n('vr-v1', 'vial1', 'Vial size 1', true, 'mg'),
      n('vr-c1', 'cost1', 'Vial 1 cost', false, 'USD'),
      n('vr-v2', 'vial2', 'Vial size 2', false, 'mg'),
      n('vr-c2', 'cost2', 'Vial 2 cost', false, 'USD'),
      n('vr-v3', 'vial3', 'Vial size 3', false, 'mg'),
      n('vr-c3', 'cost3', 'Vial 3 cost', false, 'USD'),
      n('vr-th', 'threshold', 'Rounding threshold (blank for 10%)', false, '%'),
    ],
  },
];
