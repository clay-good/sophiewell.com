// spec-v1636 MCP adapter: fomepizole-schedule in lib/fomepizole-schedule-v1636.js. The dom keys mirror
// views/group-v1636.js and META['fomepizole-schedule'].example. Clinical domain. One label row.

import * as FO from '../../lib/fomepizole-schedule-v1636.js';

export default [
  {
    id: 'fomepizole-schedule',
    summary: 'The next fomepizole dose and its time, as the label states them. Loading dose 15 mg/kg, then 10 mg/kg every 12 hours for 4 doses, then 15 mg/kg every 12 hours; every 4 hours during hemodialysis, with the label\'s rules at the start and end of dialysis (no dose, half a dose, or the next scheduled dose, by the time since the last dose).',
    compute: (args) => FO.fomepizoleSchedule(args, new Date()),
    fields: [
      { dom: 'fms-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'fms-given', arg: 'dosesGiven', kind: 'number', required: true, label: 'Doses given so far, counting the loading dose (0 if none)' },
      { dom: 'fms-dialysis', arg: 'dialysis', kind: 'enum', required: true, values: FO.DIALYSIS.map((x) => x.value), label: 'Hemodialysis' },
      { dom: 'fms-last', arg: 'lastDoseTime', kind: 'string', label: 'Time of the last dose (YYYY-MM-DDTHH:MM; needed once a dose is given)' },
      { dom: 'fms-dial', arg: 'dialysisTime', kind: 'string', label: 'Time hemodialysis started or ended (YYYY-MM-DDTHH:MM)' },
    ],
  },
];
