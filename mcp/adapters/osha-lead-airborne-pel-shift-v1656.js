// spec-v1656 MCP adapter: osha-lead-airborne-pel-shift in lib/osha-lead-airborne-pel-shift-v1656.js. The
// dom keys mirror views/group-v1656.js and META['osha-lead-airborne-pel-shift'].example.

import * as OLP from '../../lib/osha-lead-airborne-pel-shift-v1656.js';

export default [
  {
    id: 'osha-lead-airborne-pel-shift',
    summary: 'OSHA airborne lead limit for a work day over 8 hours: 400 divided by the hours worked, in µg/m³ (29 CFR 1910.1025(c)(2)). Compares a measured TWA with it and with the 30 µg/m³ action level.',
    compute: OLP.oshaLeadAirbornePelShift,
    fields: [
      { dom: 'olp-hours', arg: 'hours', kind: 'number', required: true, label: 'Hours worked in the day' },
      { dom: 'olp-measured', arg: 'measuredTwa', kind: 'number', required: false, label: 'Measured airborne lead, TWA for the day (µg/m³)' },
    ]
  },
];
