// spec-v1636 MCP adapter: ddd-rate in lib/ddd-rate-v1636.js. The dom keys mirror
// views/group-v1636.js and META['ddd-rate'].example. Administrative domain (drug utilization).

import * as DD from '../../lib/ddd-rate-v1636.js';

export default [
  {
    id: 'ddd-rate',
    summary: 'Defined daily doses from grams used, with the rates per 100 bed-days and per 1,000 patient-days. Per 100 bed-days is the WHO presentation for hospitals. The DDD of the agent is entered by the reader from the WHO ATC/DDD index; no DDD values are supplied. A DDD is a unit of measurement, not a recommended dose.',
    compute: (args) => DD.dddRate(args),
    fields: [
      { dom: 'ddr-grams', arg: 'gramsUsed', kind: 'number', required: true, label: 'Grams used in the period', unit: 'g' },
      { dom: 'ddr-ddd', arg: 'ddd', kind: 'number', required: true, label: 'DDD of the agent, from the WHO index', unit: 'g' },
      { dom: 'ddr-bed-days', arg: 'bedDays', kind: 'number', required: true, label: 'Bed-days (or patient-days) in the period' },
      { dom: 'ddr-year', arg: 'indexYear', kind: 'number', label: 'Year of the index the DDD came from (optional)' },
    ],
  },
];
