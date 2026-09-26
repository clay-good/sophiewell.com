// spec-v1516: MCP adapter for the denial next-step tool. The dom keys mirror views/group-v1516.js.

import * as DN from '../../lib/denial-next-step-v1516.js';

const vals = (xs) => xs.map((x) => x.value);

export default [
  {
    id: 'denial-next-step',
    summary: 'What to do next about a claim denial, and by when. Maps the reason code to a next step and counts the payer\'s appeal or rebill deadline.',
    compute: DN.denialNextStep,
    fields: [
      { dom: 'dn-group', arg: 'group', kind: 'enum', required: true, values: vals(DN.GROUPS), label: 'Group code' },
      { dom: 'dn-carc', arg: 'carc', kind: 'number', required: true, label: 'Claim adjustment reason code (the number)' },
      { dom: 'dn-payer', arg: 'payer', kind: 'enum', required: true, values: vals(DN.PAYERS), label: 'Payer type' },
      { dom: 'dn-remit', arg: 'remitDate', kind: 'string', required: true, label: 'Remittance date (YYYY-MM-DD)' },
      { dom: 'dn-dos', arg: 'serviceDate', kind: 'string', required: false, label: 'Date of service (YYYY-MM-DD)' },
      { dom: 'dn-window', arg: 'windowDays', kind: 'number', required: false, label: 'Appeal window for Medicaid or other payers', unit: 'days' },
    ],
  },
];
