// spec-v1559 MCP adapter: td-pregnancy-schedule in lib/td-pregnancy-schedule-v1559.js.
// The dom keys mirror views/group-v1559.js and META['td-pregnancy-schedule'].example. Clinical domain.

import * as M from '../../lib/td-pregnancy-schedule-v1559.js';

export default [
  {
    id: 'td-pregnancy-schedule',
    summary: 'Gives the WHO tetanus-diphtheria doses in pregnancy by documented history. Two doses with none or 3 childhood doses, one booster after 4, the second dose by 38 weeks, and none when already fully protected.',
    compute: M.tdPregnancySchedule,
    fields: [
      { dom: 'tdp-history', arg: 'history', kind: 'enum', required: true, label: 'Documented tetanus vaccination', values: M.HISTORY_OPTIONS.map((d) => d.value) },
      { dom: 'tdp-adult', arg: 'adultDoses', kind: 'number', label: 'Adolescent or adult Td doses (if that history)', min: 1, max: 5 },
      { dom: 'tdp-weeks', arg: 'weeks', kind: 'number', required: true, label: 'Gestational age in weeks', min: 4, max: 44 },
    ],
  },
];
