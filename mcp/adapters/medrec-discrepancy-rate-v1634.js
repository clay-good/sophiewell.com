// spec-v1634 MCP adapter: medrec-discrepancy-rate in lib/medrec-discrepancy-rate-v1634.js. The dom keys mirror
// views/group-v1634.js and META['medrec-discrepancy-rate'].example. Administrative domain.

import * as MR from '../../lib/medrec-discrepancy-rate-v1634.js';

export default [
  {
    id: 'medrec-discrepancy-rate',
    summary: 'The endorsed measure of reconciliation errors at admission and discharge (CBE 2456). Divides unintentional discrepancies by the gold standard medications plus unintentionally ordered extra ones.',
    compute: MR.medrecDiscrepancyRate,
    fields: [
      { dom: 'mrd-disc', arg: 'discrepancies', kind: 'number', required: true, label: 'Unintentional discrepancies, admission plus discharge orders' },
      { dom: 'mrd-gold', arg: 'goldMeds', kind: 'number', required: true, label: 'Medications on the gold standard lists' },
      { dom: 'mrd-extra', arg: 'extraMeds', kind: 'number', required: true, label: 'Unintentionally ordered additional medications' },
      { dom: 'mrd-patients', arg: 'patients', kind: 'number', required: false, label: 'Patients sampled' },
    ],
  },
];
