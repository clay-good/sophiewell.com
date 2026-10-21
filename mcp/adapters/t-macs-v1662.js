// spec-v1662 MCP adapter: t-macs in lib/t-macs-v1662.js. The dom keys mirror views/group-v1662.js and
// META['t-macs'].example.

import * as TM from '../../lib/t-macs-v1662.js';

export default [
  {
    id: 't-macs',
    summary: 'T-MACS probability of acute coronary syndrome from six clinical items and the arrival hs-troponin T. Reports the very low, low, moderate or high group the decision aid uses.',
    compute: TM.tMacs,
    fields: [
      { dom: 'tm-ecg', arg: 'ecg', kind: 'enum', values: ['yes', 'no'], required: true, label: 'ECG ischaemia' },
      { dom: 'tm-angina', arg: 'angina', kind: 'enum', values: ['yes', 'no'], required: true, label: 'Worsening or crescendo angina' },
      { dom: 'tm-arm', arg: 'rightArm', kind: 'enum', values: ['yes', 'no'], required: true, label: 'Pain radiating to the right arm or shoulder' },
      { dom: 'tm-vomit', arg: 'vomiting', kind: 'enum', values: ['yes', 'no'], required: true, label: 'Pain associated with vomiting' },
      { dom: 'tm-sweat', arg: 'sweating', kind: 'enum', values: ['yes', 'no'], required: true, label: 'Sweating observed' },
      { dom: 'tm-hypo', arg: 'hypotension', kind: 'enum', values: ['yes', 'no'], required: true, label: 'Hypotension (systolic below 100 mm Hg)' },
      { dom: 'tm-tnt', arg: 'troponinT', kind: 'number', required: true, label: 'High-sensitivity troponin T on arrival (ng/L)' },
    ]
  },
];
