// spec-v1510: MCP adapter for the annual therapy cost comparison. The dom keys mirror views/group-v1510.js.

import * as TC from '../../lib/therapy-cost-v1510.js';

const n = (dom, arg, label, required, unit) => ({ dom, arg, kind: 'number', required, label, ...(unit ? { unit } : {}) });

export default [
  {
    id: 'therapy-cost-compare',
    summary: 'Compares the yearly cost of up to three regimens. Cost per administration, year one with loading doses, and later years, with each price\'s source.',
    compute: TC.therapyCostCompare,
    fields: [1, 2, 3].flatMap((k) => [
      { dom: `tc-name${k}`, arg: `name${k}`, kind: 'string', required: k <= 2, label: `Regimen ${k} name` },
      n(`tc-price${k}`, `price${k}`, `Regimen ${k} price per unit`, k <= 2, 'USD'),
      n(`tc-units${k}`, `units${k}`, `Regimen ${k} units per administration`, k <= 2),
      n(`tc-y1${k}`, `year1${k}`, `Regimen ${k} administrations in year one`, k <= 2),
      n(`tc-later${k}`, `later${k}`, `Regimen ${k} administrations a year after year one`, k <= 2),
      { dom: `tc-src${k}`, arg: `source${k}`, kind: 'string', required: false, label: `Regimen ${k} price source` },
    ]),
  },
];
