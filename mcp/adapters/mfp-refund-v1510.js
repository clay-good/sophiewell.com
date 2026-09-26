// spec-v1510: MCP adapter for the negotiated-price refund check. The dom keys mirror views/group-v1510.js.

import * as MR from '../../lib/mfp-refund-v1510.js';

export default [
  {
    id: 'mfp-refund-check',
    summary: 'The refund a pharmacy should get for a Medicare negotiated-price drug, and by when. WAC minus MFP times quantity, with the refund timeline.',
    compute: MR.mfpRefundCheck,
    fields: [
      { dom: 'mr-drug', arg: 'drug', kind: 'enum', required: true, values: MR.DRUGS.map((d) => d.value), label: 'Drug selected for negotiation' },
      { dom: 'mr-dos', arg: 'serviceDate', kind: 'string', required: true, label: 'Date of service (YYYY-MM-DD)' },
      { dom: 'mr-qty', arg: 'quantity', kind: 'number', required: true, label: 'Quantity dispensed (units)' },
      { dom: 'mr-wac', arg: 'wac', kind: 'number', required: true, label: 'WAC per unit on the date of service', unit: 'USD' },
      { dom: 'mr-mfp', arg: 'mfpUnit', kind: 'number', required: true, label: 'MFP per unit (the CMS file\'s NDC-9 unit price)', unit: 'USD' },
      { dom: 'mr-paid', arg: 'paid', kind: 'number', required: false, label: 'Amount paid by the plan and patient', unit: 'USD' },
      { dom: 'mr-cost', arg: 'cost', kind: 'number', required: false, label: 'Acquisition cost per unit', unit: 'USD' },
      { dom: 'mr-recv', arg: 'received', kind: 'enum', required: false, values: MR.YES_NO.map((x) => x.value), label: 'Refund already received' },
      { dom: 'mr-check', arg: 'checkDate', kind: 'string', required: false, label: 'Date to check (YYYY-MM-DD; blank for today)' },
    ],
  },
];
