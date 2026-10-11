// spec-v1633 MCP adapter: taper-calendar in lib/taper-calendar-v1633.js. The dom keys mirror
// views/group-v1633.js and META['taper-calendar'].example. Clinical domain. Arithmetic on the pace
// the caller enters, shown beside the published range for the class; it never chooses the pace.

import * as TC from '../../lib/taper-calendar-v1633.js';

export default [
  {
    id: 'taper-calendar',
    summary: 'A dated taper schedule from a starting dose, a reduction per step and an interval. Each step is a percent of the original dose, a percent of the remaining dose, or a fixed amount (the caller chooses), rounded down to the smallest dose that can be dispensed, with pauses that move later dates. It prints the published range for the class (CDC 2022 and FDA labeling for opioids, ASAM 2025 for benzodiazepines, the methadone label) and says when the pace entered is faster. It does not choose the pace.',
    compute: TC.taperCalendar,
    fields: [
      { dom: 'tpc-class', arg: 'drugClass', kind: 'enum', required: true, values: TC.CLASSES.map((d) => d.value), label: 'Drug class' },
      { dom: 'tpc-duration', arg: 'duration', kind: 'enum', values: TC.DURATIONS.map((d) => d.value), label: 'Opioids: taken for 1 year or more, or less' },
      { dom: 'tpc-start', arg: 'startDose', kind: 'number', required: true, label: 'Starting daily dose' },
      { dom: 'tpc-unit', arg: 'unit', kind: 'enum', required: true, values: TC.UNITS.map((d) => d.value), label: 'Dose unit' },
      { dom: 'tpc-mode', arg: 'mode', kind: 'enum', required: true, values: TC.MODES.map((d) => d.value), label: 'How each step is taken' },
      { dom: 'tpc-reduction', arg: 'reduction', kind: 'number', required: true, label: 'Reduction per step (percent, or the fixed amount)' },
      { dom: 'tpc-interval', arg: 'intervalDays', kind: 'number', required: true, label: 'Days between steps', unit: 'days' },
      { dom: 'tpc-date', arg: 'startDate', kind: 'string', required: true, label: 'Start date (YYYY-MM-DD)' },
      { dom: 'tpc-smallest', arg: 'smallestDose', kind: 'number', required: true, label: 'Smallest dose that can be dispensed (steps round down to multiples of it)' },
      { dom: 'tpc-stop', arg: 'stopTarget', kind: 'number', label: 'Stop target dose (optional)' },
      { dom: 'tpc-pauses', arg: 'pauses', kind: 'string', label: 'Pauses (optional), one per line: date the pause begins, then its length in days' },
      { dom: 'tpc-mme', arg: 'mmeFactor', kind: 'number', label: 'Opioids: morphine-equivalent factor, to show each step in MME (optional)' },
    ],
  },
];
