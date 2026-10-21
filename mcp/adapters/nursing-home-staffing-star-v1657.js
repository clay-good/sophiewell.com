// spec-v1657 MCP adapter: nursing-home-staffing-star in lib/nursing-home-staffing-star-v1657.js. The dom keys mirror views/group-v1657.js and
// META['nursing-home-staffing-star'].example.

import * as STAR from '../../lib/nursing-home-staffing-star-v1657.js';

export default [
  {
    id: 'nursing-home-staffing-star',
    summary: 'Nursing home staffing star from CMS\'s cut points: points for six staffing and turnover measures, rescaled when one is missing. Uses Table A2 and Table 3 of the Five-Star guide, September 2026.',
    compute: STAR.nursingHomeStaffingStar,
    fields: [
      { dom: 'nss-rn', arg: 'rnHours', kind: 'number', required: true, label: 'Adjusted RN hours per resident day' },
      { dom: 'nss-total', arg: 'totalHours', kind: 'number', required: true, label: 'Adjusted total nurse hours per resident day' },
      { dom: 'nss-weekend', arg: 'weekendHours', kind: 'number', required: true, label: 'Adjusted weekend total nurse hours per resident day' },
      { dom: 'nss-rn-to', arg: 'rnTurnover', kind: 'number', required: false, label: 'RN turnover (%)' },
      { dom: 'nss-rn-to-status', arg: 'rnTurnoverStatus', kind: 'enum', values: STAR.STATUS.map((x) => x.value), required: false, label: 'If RN turnover is missing, why' },
      { dom: 'nss-total-to', arg: 'totalTurnover', kind: 'number', required: false, label: 'Total nurse turnover (%)' },
      { dom: 'nss-total-to-status', arg: 'totalTurnoverStatus', kind: 'enum', values: STAR.STATUS.map((x) => x.value), required: false, label: 'If total nurse turnover is missing, why' },
      { dom: 'nss-admin', arg: 'adminDepartures', kind: 'number', required: false, label: 'Administrator departures in the period' },
      { dom: 'nss-admin-status', arg: 'adminStatus', kind: 'enum', values: STAR.STATUS.map((x) => x.value), required: false, label: 'If administrator departures are missing, why' },
      { dom: 'nss-exception', arg: 'exception', kind: 'enum', values: STAR.EXCEPTIONS.map((x) => x.value), required: false, label: 'Scoring exception' },
    ]
  },
];
