// spec-v1604: MCP adapter for dpc-hsa-check. The dom keys mirror views/group-v1604.js.

import * as DP from '../../lib/dpc-hsa-check.js';

const vals = (xs) => xs.map((x) => x.value);
const yn = (dom, arg, label) => ({ dom, arg, kind: 'enum', required: false, values: vals(DP.YES_NO), label });

export default [
  {
    id: 'dpc-hsa-check',
    summary: 'Whether a direct primary care arrangement keeps HSA eligibility under IRC 223(c)(1)(E): the monthly fee limit and the excluded services.',
    compute: DP.dpcHsaCheck,
    fields: [
      { dom: 'dpc-year', arg: 'year', kind: 'number', required: true, label: 'Year', unit: 'year' },
      { dom: 'dpc-covers', arg: 'covers', kind: 'enum', required: true, values: vals(DP.COVERS), label: 'People covered' },
      { dom: 'dpc-period', arg: 'period', kind: 'enum', required: true, values: vals(DP.PERIODS), label: 'Billing period in months' },
      { dom: 'dpc-fee', arg: 'fee', kind: 'number', required: true, label: 'Fee per billing period, all arrangements', unit: 'USD' },
      yn('dpc-prac', 'practitioners', 'Care only by primary care practitioners'),
      yn('dpc-fixed', 'fixedFee', 'The fee is the only charge'),
      yn('dpc-anes', 'anesthesia', 'Includes procedures needing general anesthesia'),
      yn('dpc-drugs', 'drugs', 'Includes prescription drugs other than vaccines'),
      yn('dpc-labs', 'labs', 'Includes labs beyond office primary care'),
      { dom: 'dpc-payer', arg: 'payer', kind: 'enum', required: false, values: vals(DP.PAYERS), label: 'Who pays the fee' },
      { dom: 'dpc-limit', arg: 'limit', kind: 'number', required: false, label: 'Monthly limit for an unlisted year', unit: 'USD' },
    ],
  },
];
