// spec-v1638 MCP adapter: psychotropic-prn-clock in lib/psychotropic-prn-clock-v1638.js. The dom
// keys mirror views/group-v1638.js and META['psychotropic-prn-clock'].example. Administrative
// domain: a nursing-facility rule. The clock is read for the days remaining.

import * as PC from '../../lib/psychotropic-prn-clock-v1638.js';

export default [
  {
    id: 'psychotropic-prn-clock',
    summary: 'The 14-day limit on a PRN psychotropic order in a nursing facility (42 CFR 483.45(e)). Gives the last day, counting the start date as day 1. Another psychotropic may run longer only with a documented rationale and duration; an antipsychotic cannot be extended, and a new order needs the prescriber to examine the resident first.',
    compute: (args) => PC.psychotropicPrnClock(args, new Date()),
    fields: [
      { dom: 'ppc-kind', arg: 'kind', kind: 'enum', required: true, values: PC.KINDS.map((k) => k.value), label: 'The PRN order is for' },
      { dom: 'ppc-started', arg: 'started', kind: 'string', required: true, label: 'Date the PRN order started (YYYY-MM-DD)' },
      { dom: 'ppc-extension', arg: 'extension', kind: 'enum', values: PC.RATIONALE.map((k) => k.value), label: 'Not an antipsychotic, whether an extension is documented' },
      { dom: 'ppc-duration', arg: 'durationDays', kind: 'number', label: 'The documented duration of the order', unit: 'days' },
      { dom: 'ppc-evaluated', arg: 'evaluated', kind: 'string', label: 'Antipsychotic, date the prescriber examined the resident (YYYY-MM-DD)' },
    ],
  },
];
