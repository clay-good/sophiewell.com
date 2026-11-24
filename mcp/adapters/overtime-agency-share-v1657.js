// spec-v1657 MCP adapter: overtime-agency-share in lib/overtime-agency-share-v1657.js. The dom keys mirror views/group-v1657.js and
// META['overtime-agency-share'].example.

import * as OT from '../../lib/overtime-agency-share-v1657.js';

export default [
  {
    id: 'overtime-agency-share',
    summary: 'Overtime share of employee hours and agency share of all worked hours. With hourly rates, also the premium paid over regular pay.',
    compute: OT.overtimeAgencyShare,
    fields: [
      { dom: 'oas-regular', arg: 'regular', kind: 'number', required: true, label: 'Regular hours', bound: 'hcg', boundScale: 10 },
      { dom: 'oas-overtime', arg: 'overtime', kind: 'number', required: true, label: 'Overtime hours', bound: 'hcg', boundScale: 10 },
      { dom: 'oas-agency', arg: 'agency', kind: 'number', required: true, label: 'Agency hours', bound: 'hcg', boundScale: 10 },
      { dom: 'oas-regular-rate', arg: 'regularRate', kind: 'number', required: false, label: 'Regular hourly rate ($)', max: 10000 },
      { dom: 'oas-overtime-rate', arg: 'overtimeRate', kind: 'number', required: false, label: 'Overtime hourly rate ($)', max: 10000 },
      { dom: 'oas-agency-rate', arg: 'agencyRate', kind: 'number', required: false, label: 'Agency hourly rate ($)', max: 10000 },
    ]
  },
];
