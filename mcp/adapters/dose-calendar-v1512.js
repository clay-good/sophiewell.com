// spec-v1512: MCP adapter for the loading and maintenance dose calendar. The dom keys mirror views/group-v1512.js.

import * as DC from '../../lib/dose-calendar-v1512.js';

export default [
  {
    id: 'dose-calendar',
    summary: 'A dated loading and maintenance dose calendar. Flags weekends and federal holidays and re-anchors after a dose given late. With a cycle length it lays out treatment cycles instead (for example days 1, 8 and 15 of 28), says which cycle and day a date is, and moves later cycles after a delayed start.',
    compute: DC.doseCalendar,
    fields: [
      { dom: 'dc-start', arg: 'startDate', kind: 'string', required: true, label: 'First dose (YYYY-MM-DD)' },
      { dom: 'dc-w2', arg: 'loadWeek2', kind: 'number', required: false, label: 'Loading dose 2 at week' },
      { dom: 'dc-w3', arg: 'loadWeek3', kind: 'number', required: false, label: 'Loading dose 3 at week' },
      { dom: 'dc-every', arg: 'everyWeeks', kind: 'number', required: false, label: 'Then every N weeks (required unless a cycle length is entered)' },
      { dom: 'dc-count', arg: 'maintenanceDoses', kind: 'number', required: false, label: 'Maintenance doses to show (blank for 6)' },
      { dom: 'dc-win', arg: 'windowDays', kind: 'number', required: false, label: 'Allowed window, plus or minus days' },
      { dom: 'dc-actual', arg: 'actualDate', kind: 'string', required: false, label: 'A dose actually given on (YYYY-MM-DD)' },
      { dom: 'dc-actual-n', arg: 'actualDose', kind: 'number', required: false, label: 'Which dose number that was' },
      { dom: 'dc-cycle-len', arg: 'cycleLength', kind: 'number', required: false, label: 'Cycle calendar: cycle length (entering it selects the cycle calendar)', unit: 'days' },
      { dom: 'dc-cycle-days', arg: 'treatmentDays', kind: 'string', required: false, label: 'Cycle calendar: treatment days within a cycle, comma-separated (e.g. 1, 8, 15)' },
      { dom: 'dc-cycles', arg: 'cycles', kind: 'number', required: false, label: 'Cycle calendar: number of cycles' },
      { dom: 'dc-check', arg: 'checkDate', kind: 'string', required: false, label: 'Cycle calendar: a date to look up (YYYY-MM-DD)' },
      { dom: 'dc-delayed', arg: 'delayedCycle', kind: 'number', required: false, label: 'Cycle calendar: number of the cycle that started on the actual date above' },
    ],
  },
];
