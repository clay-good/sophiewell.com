// spec-v1636 MCP adapter: antibiogram-builder in lib/antibiogram-builder-v1636.js. The dom keys
// mirror views/group-v1636.js and META['antibiogram-builder'].example. Administrative domain:
// counts over the caller's own isolate list. No clock.

import { antibiogramBuilder } from '../../lib/antibiogram-builder-v1636.js';

export default [
  {
    id: 'antibiogram-builder',
    summary: 'Builds a cumulative antibiogram from an isolate list by the AHRQ specification. It keeps final, diagnostic results and the first isolate of each species per patient, then gives percent susceptible for each organism and agent with the number tested and a Wilson 95% interval. Intermediate is not counted as susceptible. Organisms under 30 isolates are marked. Returns the table as CSV too.',
    compute: antibiogramBuilder,
    fields: [
      { dom: 'abg-isolates', arg: 'isolates', kind: 'string', required: true, label: 'Isolate list with a header row: patient, organism, date, optional status and purpose, then one column per agent holding S, I or R' },
      { dom: 'abg-from', arg: 'from', kind: 'string', label: 'First day of the period (YYYY-MM-DD)' },
      { dom: 'abg-to', arg: 'to', kind: 'string', label: 'Last day of the period (YYYY-MM-DD)' },
    ],
  },
];
