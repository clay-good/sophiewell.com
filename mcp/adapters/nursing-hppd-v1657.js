// spec-v1657 MCP adapter: nursing-hppd in lib/nursing-hppd-v1657.js. The dom keys mirror views/group-v1657.js and
// META['nursing-hppd'].example.

import * as HPPD from '../../lib/nursing-hppd-v1657.js';

export default [
  {
    id: 'nursing-hppd',
    summary: 'Nursing hours per patient day, in total and by RN, LPN and aide, with skill mix and the hours over or under a target. It names which hours and which patient days it divided.',
    compute: HPPD.nursingHppd,
    fields: [
      { dom: 'hppd-days', arg: 'patientDays', kind: 'number', required: true, label: 'Patient days in the period' },
      { dom: 'hppd-rn', arg: 'rnHours', kind: 'number', required: false, label: 'RN hours' },
      { dom: 'hppd-lpn', arg: 'lpnHours', kind: 'number', required: false, label: 'LPN/LVN hours' },
      { dom: 'hppd-aide', arg: 'aideHours', kind: 'number', required: false, label: 'Nurse aide hours' },
      { dom: 'hppd-hours-basis', arg: 'hoursBasis', kind: 'enum', values: ['worked', 'paid'], required: false, label: 'Hours counted' },
      { dom: 'hppd-days-basis', arg: 'daysBasis', kind: 'enum', values: ['midnight', 'adjusted'], required: false, label: 'Patient days counted' },
      { dom: 'hppd-target', arg: 'targetHppd', kind: 'number', required: false, label: 'Target HPPD the unit uses' },
    ]
  },
];
