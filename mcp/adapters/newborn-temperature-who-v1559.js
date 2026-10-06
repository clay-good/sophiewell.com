// spec-v1559 MCP adapter: newborn-temperature-who in lib/newborn-temperature-who-v1559.js.
// The dom keys mirror views/group-v1559.js and META['newborn-temperature-who'].example. Clinical domain.

import * as M from '../../lib/newborn-temperature-who-v1559.js';

export default [
  {
    id: 'newborn-temperature-who',
    summary: 'Grades a newborn temperature by WHO 1997. Normal, cold stress, moderate or severe hypothermia, or hyperthermia, with the rewarming WHO describes for each.',
    compute: M.newbornTemperatureWho,
    fields: [
      { dom: 'nt2-temp', arg: 'temp', kind: 'number', required: true, label: 'Temperature', min: 25, max: 110 },
      { dom: 'nt2-unit', arg: 'unit', kind: 'enum', label: 'Unit', values: M.UNIT_OPTIONS.map((d) => d.value) },
      { dom: 'nt2-site', arg: 'site', kind: 'enum', label: 'Site', values: M.SITE_OPTIONS.map((d) => d.value) },
    ],
  },
];
