// spec-v1550 MCP adapter: the WHO 2024 hemoglobin cutoffs in lib/who-anemia-hb-v1550.js. The dom keys mirror
// views/group-v1550.js and META['who-anemia-hb'].example. Clinical domain.

import * as A from '../../lib/who-anemia-hb-v1550.js';

export default [
  {
    id: 'who-anemia-hb',
    summary: 'Says whether a hemoglobin is anemic by the WHO 2024 cutoffs, and how severe. It subtracts the elevation and smoking adjustments WHO tabulates, and covers ten groups by age, sex and trimester from 6 months to 65 years. It defines anemia; it does not find the cause.',
    compute: A.whoAnemiaHb,
    fields: [
      { dom: 'ahb-hb', arg: 'hb', kind: 'number', required: true, label: 'Hemoglobin, in the unit given', min: 2, max: 250 },
      { dom: 'ahb-unit', arg: 'unit', kind: 'enum', required: true, label: 'Unit (gdl = g/dL, gl = g/L)', values: A.UNITS.map((u) => u.value) },
      { dom: 'ahb-group', arg: 'group', kind: 'enum', required: true, label: 'Group by age, sex and pregnancy', values: A.GROUPS.map((g) => g.value) },
      { dom: 'ahb-elev', arg: 'elevation', kind: 'number', required: false, label: 'Elevation where the person lives, meters (blank: not adjusted)', min: 0, max: 4999 },
      { dom: 'ahb-smoke', arg: 'smoking', kind: 'enum', required: false, label: 'Smoking (blank: not adjusted)', values: A.SMOKING.map((s) => s.value) },
    ],
  },
];
