// spec-v1635 MCP adapter: rad-package-label-category in lib/rad-package-label-category-v1635.js. The
// dom keys mirror views/group-v1635.js and META['rad-package-label-category'].example. Operational.

import * as RP from '../../lib/rad-package-label-category-v1635.js';

export default [
  {
    id: 'rad-package-label-category',
    summary: 'The DOT label category and transport index for a radioactive package. From the maximum dose rates at the surface and at 1 meter it gives the transport index (rounded up to the next tenth) and the higher of the two label categories in 49 CFR 172.403: WHITE-I, YELLOW-II or YELLOW-III, with the exclusive-use row. It does not classify the contents or the packaging.',
    compute: RP.radPackageLabelCategory,
    fields: [
      { dom: 'rpl-unit', arg: 'unit', kind: 'enum', required: true, values: RP.UNITS.map((u) => u.value), label: 'Unit of the dose rates' },
      { dom: 'rpl-surface', arg: 'surface', kind: 'number', required: true, label: 'Maximum dose rate at the package surface' },
      { dom: 'rpl-one-meter', arg: 'oneMeter', kind: 'number', required: true, label: 'Maximum dose rate at 1 meter' },
      { dom: 'rpl-hrcq', arg: 'highwayRouteControlled', kind: 'enum', required: true, values: ['yes', 'no'], label: 'Holds a highway route controlled quantity' },
    ],
  },
];
