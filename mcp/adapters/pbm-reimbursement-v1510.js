// spec-v1510: MCP adapter for the PBM reimbursement check. The dom keys mirror views/group-v1510.js.

import * as PB from '../../lib/pbm-reimbursement-v1510.js';

export default [
  {
    id: 'pbm-reimbursement-check',
    summary: 'Whether a pharmacy claim was paid what the PBM contract says. The contract formula from its benchmark, against the amount paid and acquisition cost.',
    compute: PB.pbmReimbursementCheck,
    fields: [
      { dom: 'pb-bm', arg: 'benchmark', kind: 'enum', required: true, values: PB.BENCHMARKS.map((b) => b.value), label: 'Contract benchmark' },
      { dom: 'pb-price', arg: 'benchmarkPrice', kind: 'number', required: true, label: 'Benchmark price per unit', unit: 'USD' },
      { dom: 'pb-pct', arg: 'percent', kind: 'number', required: false, label: 'Contract percentage (negative for a discount)', unit: '%' },
      { dom: 'pb-fee', arg: 'fee', kind: 'number', required: false, label: 'Dispensing fee', unit: 'USD' },
      { dom: 'pb-qty', arg: 'quantity', kind: 'number', required: true, label: 'Quantity (units)' },
      { dom: 'pb-paid', arg: 'paid', kind: 'number', required: true, label: 'Amount paid (plan plus patient)', unit: 'USD' },
      { dom: 'pb-cost', arg: 'cost', kind: 'number', required: false, label: 'Acquisition cost per unit', unit: 'USD' },
    ],
  },
];
