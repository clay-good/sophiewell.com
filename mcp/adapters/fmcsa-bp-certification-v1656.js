// spec-v1656 MCP adapter: fmcsa-bp-certification in lib/fmcsa-bp-certification-v1656.js. The dom keys
// mirror views/group-v1656.js and META['fmcsa-bp-certification'].example.

import * as FBP from '../../lib/fmcsa-bp-certification-v1656.js';

export default [
  {
    id: 'fmcsa-bp-certification',
    summary: 'Commercial driver blood pressure stage and the certificate length in FMCSA\'s advisory criteria (49 CFR 391 Appendix A). Covers the first exam, annual recertification, and rechecks.',
    compute: FBP.fmcsaBpCertification,
    fields: [
      { dom: 'fbp-systolic', arg: 'systolic', kind: 'number', required: true, label: 'Systolic pressure (mmHg)' },
      { dom: 'fbp-diastolic', arg: 'diastolic', kind: 'number', required: true, label: 'Diastolic pressure (mmHg)' },
      { dom: 'fbp-context', arg: 'context', kind: 'enum', values: FBP.CONTEXTS.map((c) => c.value), required: true, label: 'Which examination' },
      { dom: 'fbp-tolerated', arg: 'treatmentTolerated', kind: 'enum', values: ['yes', 'no'], required: false, label: 'Treatment well tolerated (after Stage 2 or 3)' },
    ]
  },
];
