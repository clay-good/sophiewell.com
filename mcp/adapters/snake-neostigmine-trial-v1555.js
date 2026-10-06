// spec-v1555 MCP adapter: snake-neostigmine-trial in lib/snake-neostigmine-trial-v1555.js.
// The dom keys mirror views/group-v1555b.js and META['snake-neostigmine-trial'].example. Clinical domain.

import * as M from '../../lib/snake-neostigmine-trial-v1555.js';

export default [
  {
    id: 'snake-neostigmine-trial',
    summary: 'Gives the neostigmine trial doses for neurotoxic snakebite. Atropine then neostigmine, WHO (weight-based, IM) or India (1.5 mg IV); reads the response, lists the stop rules, and refuses after a suspected mamba bite.',
    compute: M.snakeNeostigmineTrial,
    fields: [
      { dom: 'nt-protocol', arg: 'protocol', kind: 'enum', required: true, label: 'Protocol', values: M.PROTOCOL_OPTIONS.map((d) => d.value) },
      { dom: 'nt-age', arg: 'ageGroup', kind: 'enum', required: true, label: 'Adult or child', values: M.AGE_OPTIONS.map((d) => d.value) },
      { dom: 'nt-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight in kg', min: 1, max: 250 },
      { dom: 'nt-mamba', arg: 'mamba', kind: 'enum', label: 'WHO: suspected mamba bite (Africa)', values: M.YES_NO.map((d) => d.value) },
      { dom: 'nt-response', arg: 'response', kind: 'enum', required: true, label: 'Response so far', values: M.RESPONSE_OPTIONS.map((d) => d.value) },
      { dom: 'nt-neo', arg: 'neoConc', kind: 'number', label: 'Neostigmine concentration, mg/mL (for doses in mL)', min: 0.01, max: 10 },
      { dom: 'nt-atr', arg: 'atrConc', kind: 'number', label: 'Atropine concentration, mg/mL (for doses in mL)', min: 0.01, max: 10 },
    ],
  },
];
