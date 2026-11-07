// spec-v1699 MCP adapter: two-compartment-params in lib/two-compartment-params-v1699.js. The dom keys mirror
// views/group-v1699.js and META['two-compartment-params'].example.

import * as TCP from '../../lib/two-compartment-params-v1699.js';

export default [
  {
    id: 'two-compartment-params',
    summary: 'Two-compartment micro-constants, volumes, clearance and half-lives from an IV bolus and a fitted biexponential curve. Enter A, alpha, B and beta.',
    compute: TCP.twoCompartmentParams,
    fields: [
      { dom: 'tcp-dose', arg: 'dose', kind: 'number', required: true, label: 'IV bolus dose (mg)' },
      { dom: 'tcp-a', arg: 'a', kind: 'number', required: true, label: 'A, fast-phase intercept (mg/L)' },
      { dom: 'tcp-alpha', arg: 'alpha', kind: 'number', required: true, label: 'Alpha, fast-phase rate (per h)' },
      { dom: 'tcp-b', arg: 'b', kind: 'number', required: true, label: 'B, slow-phase intercept (mg/L)' },
      { dom: 'tcp-beta', arg: 'beta', kind: 'number', required: true, label: 'Beta, slow-phase rate (per h)' },
    ]
  },
];
