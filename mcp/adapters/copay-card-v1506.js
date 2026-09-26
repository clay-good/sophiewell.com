// spec-v1506: MCP adapter for the copay card and accumulator tool. The dom keys mirror views/group-v1506.js.

import * as CC from '../../lib/copay-card-v1506.js';

export default [
  {
    id: 'copay-card-runout',
    summary: 'When a copay card runs out and the first bill arrives. Runs the year with the card counting toward the deductible, with an accumulator, or both.',
    compute: CC.copayCardRunout,
    fields: [
      { dom: 'ccr-plan', arg: 'planType', kind: 'enum', required: true, label: 'Plan type', values: CC.PLAN_TYPES.map((x) => x.value) },
      { dom: 'ccr-cost', arg: 'costPerFill', kind: 'number', required: true, label: 'Drug cost per fill (plan price)', unit: 'USD' },
      { dom: 'ccr-fills', arg: 'fills', kind: 'number', required: true, label: 'Fills a year' },
      { dom: 'ccr-card', arg: 'cardMax', kind: 'number', required: true, label: 'Copay card annual maximum', unit: 'USD' },
      { dom: 'ccr-perfill', arg: 'perFillMax', kind: 'number', required: false, label: 'Copay card per-fill maximum', unit: 'USD' },
      { dom: 'ccr-ded', arg: 'deductible', kind: 'number', required: true, label: 'Plan deductible', unit: 'USD' },
      { dom: 'ccr-coins', arg: 'coinsurance', kind: 'number', required: true, label: 'Plan coinsurance', unit: '%' },
      { dom: 'ccr-oop', arg: 'oopMax', kind: 'number', required: true, label: 'Plan out-of-pocket maximum', unit: 'USD' },
      { dom: 'ccr-counts', arg: 'counts', kind: 'enum', required: true, label: 'Does the plan count the card toward the deductible and out-of-pocket maximum?', values: CC.COUNTS.map((x) => x.value) },
    ],
  },
];
