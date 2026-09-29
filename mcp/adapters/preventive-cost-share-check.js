// spec-v1601: MCP adapter for preventive-cost-share-check. The dom keys mirror views/group-v1601.js.

import * as PC from '../../lib/preventive-cost-share-check.js';

const vals = (xs) => xs.map((x) => x.value);

export default [
  {
    id: 'preventive-cost-share-check',
    summary: 'Whether a private plan may charge cost sharing for a preventive service, citing the federal rule or FAQ that decides it.',
    compute: PC.preventiveCostShareCheck,
    fields: [
      { dom: 'pcs-plan', arg: 'plan', kind: 'enum', required: true, values: vals(PC.PLANS), label: 'Kind of plan' },
      { dom: 'pcs-service', arg: 'service', kind: 'enum', required: true, values: vals(PC.SERVICES), label: 'What was charged for' },
      { dom: 'pcs-network', arg: 'network', kind: 'enum', required: true, values: vals(PC.NETWORK), label: 'In network or not' },
      { dom: 'pcs-visit', arg: 'visitSeparate', kind: 'enum', required: false, values: vals(PC.YES_NO), label: 'Office visit billed separately' },
      { dom: 'pcs-purpose', arg: 'primaryPurpose', kind: 'enum', required: false, values: vals(PC.YES_NO), label: 'Visit mainly for the preventive service' },
      { dom: 'pcs-charged', arg: 'charged', kind: 'number', required: false, label: 'Amount charged', unit: 'USD' },
    ],
  },
];
