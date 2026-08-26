// spec-v802 MCP adapter: Gardner-Robertson hearing class in lib/gardner-robertson-v802.js.
// The dom keys mirror the browser renderer (views/group-v802.js) and
// META['gardner-robertson'].example. The POORER of the two measures governs. Clinical domain.

import { gardnerRobertson } from '../../lib/gardner-robertson-v802.js';

export default [
  {
    id: 'gardner-robertson',
    summary: 'Grades hearing in five classes from an audiogram (Gardner-Robertson 1988). Class I is 0-30 dB pure tone average with 70-100% discrimination, II is 31-50 dB with 50-69%, III is 51-90 dB with 5-49%, IV is 91 dB or more with 1-4%, V is not testable or 0%. When the two measures fall in different classes the POORER governs, which is why serviceable hearing needs 50 dB or better AND 50% or better. Classes I and II are serviceable.',
    compute: gardnerRobertson,
    fields: [
      { dom: 'gr-pta', arg: 'pta', kind: 'number', required: false, label: 'Pure tone average', unit: 'dB' },
      { dom: 'gr-sds', arg: 'sds', kind: 'number', required: false, label: 'Speech discrimination', unit: '%' },
      { dom: 'gr-nt', arg: 'notTestable', kind: 'boolean', required: false, label: 'Hearing not testable' },
    ],
  },
];
