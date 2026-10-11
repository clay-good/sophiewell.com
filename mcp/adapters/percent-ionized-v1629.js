// spec-v1629 MCP adapter: percent-ionized in lib/percent-ionized-v1629.js. The dom keys mirror
// views/group-v1629.js and META['percent-ionized'].example. Physical chemistry; administrative domain.

import * as PI from '../../lib/percent-ionized-v1629.js';

export default [
  {
    id: 'percent-ionized',
    summary: 'Percent of a weak acid or weak base that is ionized at a pH, from its pKa. The acid-or-base choice is required, because the same pH and pKa give opposite answers.',
    compute: PI.percentIonized,
    fields: [
      { dom: 'pi-type', arg: 'type', kind: 'enum', required: true, values: PI.DRUG_TYPES.map((t) => t.value), label: 'The drug is a weak acid or a weak base' },
      { dom: 'pi-pka', arg: 'pKa', kind: 'number', required: true, label: 'pKa (for a weak base, of its conjugate acid)' },
      { dom: 'pi-ph', arg: 'pH', kind: 'number', required: true, label: 'pH' },
    ],
  },
];
