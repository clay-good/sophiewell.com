// spec-v682 MCP adapter: Wang Bronchiolitis Respiratory Score in
// lib/wang-bronchiolitis-v682.js. The dom keys mirror the browser renderer
// (views/group-v682.js) and META['wang-bronchiolitis'].example. One respiratory-rate
// number plus three enums; the sum 0-12 grades infant bronchiolitis. Clinical domain.

import { wangBronchiolitis } from '../../lib/wang-bronchiolitis-v682.js';

export default [
  {
    id: 'wang-bronchiolitis',
    summary: 'Wang Bronchiolitis Respiratory Score (Wang 1992): infant bronchiolitis severity. Four signs each 0-3, total 0-12: respiratory rate (<30=0, 30-45=1, 46-60=2, >60=3), wheezing (0-3), retraction (0-3), general condition (0 normal or 3 distressed only). Higher = more severe; published severity cut-points disagree, so bands are advisory only.',
    compute: wangBronchiolitis,
    fields: [
      { dom: 'wang-rr', arg: 'respiratoryRate', kind: 'number', unit: 'breaths/min', required: true, label: 'Respiratory rate (breaths/min)' },
      { dom: 'wang-wheeze', arg: 'wheezing', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Wheezing grade (0-3)' },
      { dom: 'wang-retract', arg: 'retraction', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Retraction grade (0-3)' },
      { dom: 'wang-cond', arg: 'generalCondition', kind: 'enum', values: ['0', '3'], required: true, label: 'General condition (0 normal or 3 distressed)' },
    ],
  },
];
