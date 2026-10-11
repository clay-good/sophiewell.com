// spec-v1630 MCP adapter: cleanroom-class-check in lib/cleanroom-class-check-v1630.js. The dom keys
// mirror views/group-v1630.js and META['cleanroom-class-check'].example. FDA's 2004 aseptic
// processing guidance, Table 1; administrative domain. USP <797> levels are not shipped.

import * as CR from '../../lib/cleanroom-class-check-v1630.js';

export default [
  {
    id: 'cleanroom-class-check',
    summary: 'Cleanest ISO class a 0.5 µm particle count meets in FDA\'s aseptic processing table (ISO 5 to 8). Also reads an active air sample or a settling plate against the recommended action level for the intended class. FDA\'s cGMP table for manufacturers and outsourcing facilities; USP <797> levels are not included. Gives no verdict on a room or a batch.',
    compute: CR.cleanroomClassCheck,
    fields: [
      { dom: 'cr-unit', arg: 'countUnit', kind: 'enum', required: true, values: CR.COUNT_UNITS.map((u) => u.value), label: 'Particle count unit: per cubic meter (m3) or per cubic foot (ft3)' },
      { dom: 'cr-count', arg: 'count', kind: 'number', required: true, label: 'Particle count at 0.5 µm and larger' },
      { dom: 'cr-class', arg: 'intendedClass', kind: 'enum', required: false, values: CR.INTENDED.map((c) => c.value), label: 'Intended ISO class of the area: 5, 6, 7 or 8 (needed for a microbial sample)' },
      { dom: 'cr-air', arg: 'activeAir', kind: 'number', required: false, label: 'Active air sample (optional)', unit: 'cfu/m³' },
      { dom: 'cr-plate', arg: 'settlingPlate', kind: 'number', required: false, label: '90 mm settling plate, cfu per 4 hours (optional)' },
    ],
  },
];
