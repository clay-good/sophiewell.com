// spec-v895 MCP adapter: the gadolinium NSF grouping in lib/gadolinium-nsf-v895.js. The dom keys
// mirror the browser renderer (views/group-v895.js) and META['gadolinium-nsf'].example.
//
// The AGENT GROUP is the input that decides this, not the filtration rate. Clinical domain.

import { gadoliniumNsf } from '../../lib/gadolinium-nsf-v895.js';

export default [
  {
    id: 'gadolinium-nsf',
    summary: 'Reads nephrogenic systemic fibrosis risk from the gadolinium agent group and the kidney state. Group I agents are associated with the greatest number of cases; group II agents have few or no unconfounded cases and a risk the manual describes as possibly not distinguishable from zero, even below an eGFR of 30 or on dialysis; group III agents have limited data. THE AGENT GROUP MATTERS MORE THAN THE FILTRATION RATE: the blanket rule that gadolinium is contraindicated below an eGFR of 30 came from group I experience and has not applied to group II agents for years. DIALYSIS AFTER THE SCAN IS NOT A PREVENTIVE MEASURE. Acute kidney injury is its own category, not stable disease at the same number. Retention, pregnancy and prior reactions are separate questions.',
    compute: gadoliniumNsf,
    fields: [
      { dom: 'gad-agentgroup', arg: 'agentGroup', kind: 'enum', required: false, label: 'Agent group', values: ['group-2', 'group-1', 'group-3', 'unknown'] },
      { dom: 'gad-renalstate', arg: 'renalState', kind: 'enum', required: false, label: 'Kidney function', values: ['normal', 'ckd-low', 'dialysis', 'aki'] },
    ],
  },
];
