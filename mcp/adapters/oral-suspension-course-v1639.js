// spec-v1639 MCP adapter: oral-suspension-course in lib/oral-suspension-course-v1639.js. The dom keys
// mirror views/group-v1639.js and META['oral-suspension-course'].example. No clock.

import * as OS from '../../lib/oral-suspension-course-v1639.js';

export default [
  {
    id: 'oral-suspension-course',
    summary: 'Volume and bottles of an oral suspension for a course, with the discard date. The date is the date mixed plus the label\'s discard-after days. Says when the course outlasts the first bottle. The discard figure and bottle size are the reader\'s entries from the product label.',
    compute: OS.oralSuspensionCourse,
    fields: [
      { dom: 'osc-doseml', arg: 'doseMl', kind: 'number', label: 'Dose', unit: 'mL' },
      { dom: 'osc-dosemg', arg: 'doseMg', kind: 'number', label: 'Or the dose in mg', unit: 'mg' },
      { dom: 'osc-strength', arg: 'mgPer5Ml', kind: 'number', label: 'With the label strength, mg in each 5 mL', unit: 'mg' },
      { dom: 'osc-dpd', arg: 'dosesPerDay', kind: 'number', required: true, label: 'Doses per day' },
      { dom: 'osc-days', arg: 'days', kind: 'number', required: true, label: 'Days of therapy', unit: 'days' },
      { dom: 'osc-bottle', arg: 'bottleMl', kind: 'number', label: 'Bottle size after mixing (optional)', unit: 'mL' },
      { dom: 'osc-mixed', arg: 'mixedOn', kind: 'string', label: 'Date the bottle was mixed (YYYY-MM-DD, optional)' },
      { dom: 'osc-discard', arg: 'discardAfterDays', kind: 'number', label: 'The label\'s discard-after figure', unit: 'days' },
    ],
  },
];
