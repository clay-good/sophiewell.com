// spec-v1550 MCP adapter: iron-supplement-who in lib/iron-supplement-who-v1550.js.
// The dom keys mirror views/group-v1550b.js and META['iron-supplement-who'].example. Clinical domain.

import * as M from '../../lib/iron-supplement-who-v1550.js';

export default [
  {
    id: 'iron-supplement-who',
    summary: 'Gives WHO preventive iron doses by group. Children and women where anemia is 40% or more, pregnancy iron-folic acid, preterm 2-4 mg/kg, and no iron on RUTF.',
    compute: M.ironSupplementWho,
    fields: [
      { dom: 'fe-group', arg: 'group', kind: 'enum', required: true, label: 'Group', values: M.GROUP_OPTIONS.map((d) => d.value) },
      { dom: 'fe-prev', arg: 'prevalence', kind: 'enum', label: 'Anemia prevalence in this group locally', values: M.PREV_OPTIONS.map((d) => d.value) },
      { dom: 'fe-rutf', arg: 'rutf', kind: 'enum', label: 'Child on RUTF for severe acute malnutrition', values: M.YES_NO.map((d) => d.value) },
      { dom: 'fe-hb', arg: 'hb', kind: 'number', label: 'Pregnancy: hemoglobin, g/L (optional)', min: 30, max: 200 },
      { dom: 'fe-tri', arg: 'trimester', kind: 'enum', label: 'Pregnancy: trimester', values: M.TRIM_OPTIONS.map((d) => d.value) },
      { dom: 'fe-daily', arg: 'dailyOk', kind: 'enum', label: 'Pregnancy: daily iron tolerated', values: M.YES_NO.map((d) => d.value) },
      { dom: 'fe-weight', arg: 'weight', kind: 'number', label: 'Preterm or low-birth-weight infant: weight in kg', min: 0.3, max: 6 },
    ],
  },
];
