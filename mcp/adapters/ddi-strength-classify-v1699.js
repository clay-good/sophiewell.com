// spec-v1699 MCP adapter: ddi-strength-classify in lib/ddi-strength-classify-v1699.js. The dom keys mirror
// views/group-v1699.js and META['ddi-strength-classify'].example.

import * as DSC from '../../lib/ddi-strength-classify-v1699.js';

export default [
  {
    id: 'ddi-strength-classify',
    summary: 'FDA strength class of an observed exposure ratio from an interaction study: strong, moderate or weak inhibitor or inducer, or a sensitive substrate with a strong inhibitor.',
    compute: DSC.ddiStrengthClassify,
    fields: [
      { dom: 'dsc-role', arg: 'role', kind: 'enum', values: ['precipitant', 'substrate'], required: true, label: 'Which drug is classified' },
      { dom: 'dsc-ratio', arg: 'ratio', kind: 'number', required: false, label: 'AUC ratio (with / without)' },
      { dom: 'dsc-with', arg: 'aucWith', kind: 'number', required: false, label: 'AUC with the other drug' },
      { dom: 'dsc-without', arg: 'aucWithout', kind: 'number', required: false, label: 'AUC without it' },
      { dom: 'dsc-strong', arg: 'strongInhibitor', kind: 'boolean', required: false, label: 'Substrate study used a strong inhibitor' },
    ]
  },
];
