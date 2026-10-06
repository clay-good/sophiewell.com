// spec-v1556 MCP adapter: op-atropine-titration in lib/op-atropine-titration-v1556.js.
// The dom keys mirror views/group-v1556.js and META['op-atropine-titration'].example. Clinical domain.

import * as M from '../../lib/op-atropine-titration-v1556.js';

export default [
  {
    id: 'op-atropine-titration',
    summary: 'Gives the next atropine bolus in organophosphate poisoning. The Eddleston doubling protocol, the targets (pulse and systolic over 80, clear chest), and the 10-20% hourly infusion once stable.',
    compute: M.opAtropineTitration,
    fields: [
      { dom: 'opa-adult', arg: 'adult', kind: 'enum', required: true, label: 'Adult', values: M.YES_NO.map((d) => d.value) },
      { dom: 'opa-last', arg: 'last', kind: 'number', required: true, label: 'Last atropine bolus, mg', min: 0.5, max: 100 },
      { dom: 'opa-total', arg: 'total', kind: 'number', required: true, label: 'Total atropine given so far, mg', min: 0.5, max: 2000 },
      { dom: 'opa-hr', arg: 'hr', kind: 'number', required: true, label: 'Heart rate now, beats/min', min: 20, max: 250 },
      { dom: 'opa-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic blood pressure now, mm Hg', min: 30, max: 250 },
      { dom: 'opa-chest', arg: 'chest', kind: 'enum', required: true, label: 'Chest', values: M.CHEST_OPTIONS.map((d) => d.value) },
      { dom: 'opa-improving', arg: 'improving', kind: 'enum', label: 'Begun to improve since the last bolus', values: M.YES_NO.map((d) => d.value) },
      { dom: 'opa-pupils', arg: 'pupils', kind: 'enum', label: 'Pupils', values: M.PUPIL_OPTIONS.map((d) => d.value) },
    ],
  },
];
