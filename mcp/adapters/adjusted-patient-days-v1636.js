// spec-v1636 MCP adapter: adjusted-patient-days in lib/adjusted-patient-days-v1636.js. The dom keys
// mirror views/group-v1636.js and META['adjusted-patient-days'].example. Administrative domain.

import * as AP from '../../lib/adjusted-patient-days-v1636.js';

export default [
  {
    id: 'adjusted-patient-days',
    summary: 'Adjusted patient days by the federal worksheet: inpatient days plus outpatient revenue divided by the revenue per inpatient day. With pharmacy worked hours or drug expense it adds hours and cost per adjusted day. It uses gross patient revenues and shows the outpatient share that drove the adjustment.',
    compute: (args) => AP.adjustedPatientDays(args),
    fields: [
      { dom: 'apd-days', arg: 'inpatientDays', kind: 'number', required: true, label: 'Inpatient days' },
      { dom: 'apd-inpatient', arg: 'inpatientRevenue', kind: 'number', required: true, label: 'Gross inpatient revenue', unit: 'USD' },
      { dom: 'apd-outpatient', arg: 'outpatientRevenue', kind: 'number', required: true, label: 'Gross outpatient revenue', unit: 'USD' },
      { dom: 'apd-hours', arg: 'workedHours', kind: 'number', label: 'Pharmacy worked hours (optional)' },
      { dom: 'apd-drugs', arg: 'drugExpense', kind: 'number', label: 'Drug expense (optional)', unit: 'USD' },
    ],
  },
];
