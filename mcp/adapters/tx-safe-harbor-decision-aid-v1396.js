// spec-v1396: MCP adapter. The dom keys mirror views/group-v1396.js and this tile's META example.

import * as SH from '../../lib/tx-safe-harbor-decision-aid-v1396.js';

export default [
  {
    id: 'tx-safe-harbor-decision-aid',
    summary: 'Explains how a Texas nurse requests Safe Harbor peer review under Occupations Code 303.005, and what it protects. Use the Board form, or tell the supervisor orally when patient care prevents it; the supervisor records seven items and both sign. A good-faith request cannot be punished, and a physician order\'s medical reasonableness goes to the medical staff.',
    compute: SH.txSafeHarborDecisionAid,
    fields: [
      { dom: 'sh-write', arg: 'canWrite', kind: 'enum', required: true, label: 'Can complete the written form now', values: ['yes', 'no'] },
      { dom: 'sh-plan', arg: 'plan', kind: 'enum', required: true, label: 'Plan while the review is pending', values: SH.PLAN.map((p) => p.value) },
      { dom: 'sh-order', arg: 'physicianOrder', kind: 'enum', label: 'About a physician order\'s reasonableness', values: ['yes', 'no'] },
    ],
  },
];
