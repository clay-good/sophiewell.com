// spec-v1635 MCP adapter: occupational-dose-limit-check in
// lib/occupational-dose-limit-check-v1635.js. The dom keys mirror views/group-v1635.js and
// META['occupational-dose-limit-check'].example. Operational domain. At least one dose is needed.

import * as OD from '../../lib/occupational-dose-limit-check-v1635.js';

export default [
  {
    id: 'occupational-dose-limit-check',
    summary: 'Year-to-date occupational radiation dose as a percent of the NRC annual limits. It compares each dose entered with 5 rem total effective dose equivalent, 50 rem to an organ, 15 rem to the lens, 50 rem to the skin or an extremity, and 0.5 rem to the embryo or fetus over a declared pregnancy (10 CFR 20.1201, 20.1208), and projects the year end at the same monthly rate. License action levels are not included.',
    compute: OD.occupationalDoseLimitCheck,
    fields: [
      { dom: 'odl-unit', arg: 'unit', kind: 'enum', required: true, values: OD.UNITS.map((u) => u.value), label: 'Unit of the doses' },
      ...OD.LIMITS.map((l) => ({ dom: `odl-${l.dom}`, arg: l.arg, kind: 'number', label: l.text })),
      { dom: 'odl-months', arg: 'monthsElapsed', kind: 'number', label: 'Months of the monitoring year elapsed (optional, for the projection)' },
    ],
  },
];
