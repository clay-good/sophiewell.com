// spec-v1638 MCP adapter: gdr-attempt-check in lib/gdr-attempt-check-v1638.js. The dom keys mirror
// views/group-v1638.js and META['gdr-attempt-check'].example. Administrative domain: a
// nursing-facility survey example. No clock.

import * as GD from '../../lib/gdr-attempt-check-v1638.js';

export default [
  {
    id: 'gdr-attempt-check',
    summary: 'First-year attempts at a gradual dose reduction (GDR) of a psychotropic in a nursing facility. CMS gives an example of compliance: attempts in two separate quarters, at least one month apart, unless clinically contraindicated. Places each attempt in its quarter and gives the window for a second attempt. It does not assess a contraindication.',
    compute: GD.gdrAttemptCheck,
    fields: [
      { dom: 'gdr-started', arg: 'started', kind: 'string', required: true, label: 'Date admitted on the psychotropic, or the date it was started (YYYY-MM-DD)' },
      { dom: 'gdr-attempts', arg: 'attempts', kind: 'string', label: 'Dates of the GDR attempts, separated by commas (YYYY-MM-DD)' },
      { dom: 'gdr-contra', arg: 'contraindication', kind: 'enum', required: true, values: GD.CONTRAINDICATION.map((k) => k.value), label: 'Clinical contraindication' },
    ],
  },
];
