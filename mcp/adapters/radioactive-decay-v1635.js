// spec-v1635 MCP adapter: radioactive-decay in lib/radioactive-decay-v1635.js. The dom keys mirror
// views/group-v1635.js and META['radioactive-decay'].example. Operational domain. Eleven label rows
// hold the half-lives; the clock is injected for them.

import * as RD from '../../lib/radioactive-decay-v1635.js';

export default [
  {
    id: 'radioactive-decay',
    summary: 'Radioactive decay: the activity at another time, or the time to reach an activity. It decays or precalibrates an activity by the half-life printed on the product\'s FDA label (or one typed in), shows the result in curie and becquerel units with the decay factor, and says whether the half-life is within the 120-day decay-in-storage limit of 10 CFR 35.92. Physical decay only.',
    compute: (args) => RD.radioactiveDecay(args, new Date()),
    fields: [
      { dom: 'rdk-nuclide', arg: 'nuclide', kind: 'enum', required: true, values: RD.NUCLIDES.map((n) => n.value), label: 'Radionuclide' },
      { dom: 'rdk-half-life', arg: 'halfLife', kind: 'number', label: 'Half-life, for another radionuclide' },
      { dom: 'rdk-half-life-unit', arg: 'halfLifeUnit', kind: 'enum', values: RD.HALF_LIFE_UNITS.map((u) => u.value), label: 'Half-life unit' },
      { dom: 'rdk-activity', arg: 'activity', kind: 'number', required: true, label: 'Activity at calibration' },
      { dom: 'rdk-unit', arg: 'unit', kind: 'enum', required: true, values: RD.ACTIVITY_UNITS.map((u) => u.value), label: 'Activity unit' },
      { dom: 'rdk-calibration', arg: 'calibration', kind: 'string', label: 'Calibration date and time (YYYY-MM-DDTHH:MM)' },
      { dom: 'rdk-target', arg: 'target', kind: 'string', label: 'Target date and time (YYYY-MM-DDTHH:MM)' },
      { dom: 'rdk-target-activity', arg: 'targetActivity', kind: 'number', label: 'Or a target activity, to get the time it is reached' },
    ],
  },
];
