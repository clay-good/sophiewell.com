// spec-v1633 MCP adapter: label-titration-calendar in lib/label-titration-calendar-v1633.js. The dom
// keys mirror views/group-v1633.js and META['label-titration-calendar'].example. Clinical domain.
// Five label rows (Topamax, Chantix, Otezla, memantine tablets, Entresto) and the reader's own steps.

import * as LC from '../../lib/label-titration-calendar-v1633.js';

export default [
  {
    id: 'label-titration-calendar',
    summary: 'A step-up titration laid out as dates. Label schedules: topiramate for epilepsy monotherapy or migraine prevention, varenicline, apremilast, memantine tablets, and sacubitril/valsartan with the 36-hour ACE-inhibitor washout as a clock time. Or the caller\'s own steps (dose, times a day, days), with the doses and total per step. Where a label leaves a step\'s length open the caller enters it. GLP-1 escalation is a different tool.',
    compute: LC.labelTitrationCalendar,
    fields: [
      { dom: 'lcal-preset', arg: 'preset', kind: 'enum', required: true, values: LC.PRESETS.map((d) => d.value), label: 'Label schedule, or custom' },
      { dom: 'lcal-date', arg: 'startDate', kind: 'string', required: true, label: 'Start date (YYYY-MM-DD)' },
      { dom: 'lcal-weeks', arg: 'weeksPerStep', kind: 'number', label: 'Memantine: weeks at each step (label minimum 1)' },
      { dom: 'lcal-double', arg: 'weeksToDouble', kind: 'number', label: 'Sacubitril/valsartan: weeks before the dose is doubled (2 to 4)' },
      { dom: 'lcal-ace', arg: 'lastAceDose', kind: 'string', label: 'Sacubitril/valsartan: last ACE-inhibitor dose (YYYY-MM-DDTHH:MM, optional)' },
      { dom: 'lcal-strengths', arg: 'strengths', kind: 'string', label: 'Own steps: tablet strengths stocked in mg (optional, for tablet counts)' },
      { dom: 'lcal-weight', arg: 'weightKg', kind: 'number', label: 'Pediatric schedules (apremilast, sacubitril/valsartan): weight', unit: 'kg' },
      { dom: 'lcal-steps', arg: 'steps', kind: 'string', label: 'Custom: one step per line as dose in mg, times a day, days' },
    ],
  },
];
