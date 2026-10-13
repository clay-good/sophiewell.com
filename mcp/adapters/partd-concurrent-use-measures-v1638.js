// spec-v1638 MCP adapter: partd-concurrent-use-measures in
// lib/partd-concurrent-use-measures-v1638.js. The dom keys mirror views/group-v1638.js and
// META['partd-concurrent-use-measures'].example. Administrative domain. No clock.

import { partdConcurrentUseMeasures } from '../../lib/partd-concurrent-use-measures-v1638.js';

export default [
  {
    id: 'partd-concurrent-use-measures',
    summary: 'The Part D concurrent-use safety measures by CMS\'s published method: opioids with benzodiazepines (COB), two or more anticholinergics (Poly-ACH) and three or more CNS-active drugs (Poly-CNS) in older adults. From members and a fill list it gives each member\'s denominator status, overlap days and numerator status, and each rate. The reader assigns each fill\'s class.',
    compute: partdConcurrentUseMeasures,
    fields: [
      { dom: 'cum-year', arg: 'measurementYear', kind: 'number', required: true, label: 'Measurement year', min: 2020, max: 2100 },
      { dom: 'cum-members', arg: 'members', kind: 'string', required: true, label: 'Members, one per line: member, age, continuously enrolled (yes or no), exclusions separated by semicolons (optional)' },
      { dom: 'cum-fills', arg: 'fills', kind: 'string', required: true, label: 'Fills, one per line: member, fill date (YYYY-MM-DD), days supply, medication, class (opioid, benzodiazepine, anticholinergic or cns)' },
    ],
  },
];
