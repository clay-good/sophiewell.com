// spec-v1558 MCP adapter: magnesium sulfate IM regimen and next-dose check in lib/mgso4-im-regimen-v1558.js.
// The dom keys mirror views/group-v1558.js and META['mgso4-im-regimen'].example. Clinical domain.

import * as G from '../../lib/mgso4-im-regimen-v1558.js';

export default [
  {
    id: 'mgso4-im-regimen',
    summary: 'Gives the WHO magnesium sulfate loading and IM maintenance for severe pre-eclampsia or eclampsia. It also checks the next dose against breathing, knee reflex and urine, under MCPC or PCPNC limits, which differ.',
    compute: G.mgso4ImRegimen,
    fields: [
      { dom: 'mg-source', arg: 'source', kind: 'enum', required: true, label: 'Source manual', values: G.SOURCE_OPTIONS.map((d) => d.value) },
      { dom: 'mg-regimen', arg: 'regimen', kind: 'enum', required: true, label: 'Regimen', values: G.REGIMEN_OPTIONS.map((d) => d.value) },
      { dom: 'mg-rr', arg: 'rr', kind: 'number', label: 'Breathing rate per minute (next-dose check)', min: 0, max: 80 },
      { dom: 'mg-reflex', arg: 'reflex', kind: 'enum', label: 'Knee reflex (next-dose check)', values: G.REFLEX_OPTIONS.map((d) => d.value) },
      { dom: 'mg-urine', arg: 'urine', kind: 'number', label: 'Urine in the last 4 hours, mL (next-dose check)', min: 0, max: 5000 },
    ],
  },
];
