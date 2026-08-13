// spec-v718 MCP adapter: Ellis dental-fracture classification in
// lib/ellis-tooth-fracture-v718.js. The dom keys mirror the browser renderer
// (views/group-v718.js) and META['ellis-tooth-fracture'].example. One enum (deepest layer);
// decision logic returns the Ellis class and urgency. Clinical domain.

import { ellisToothFracture } from '../../lib/ellis-tooth-fracture-v718.js';

export default [
  {
    id: 'ellis-tooth-fracture',
    summary: 'Ellis classification of anterior crown tooth fracture (Ellis & Davey 1970): grades a traumatic crown fracture by the deepest dental tissue involved. Class I = enamel only (rough edge, non-tender); Class II = enamel + dentin (yellow dentin, sensitive); Class III = enamel + dentin + pulp exposed (pink/bleeding center, dental emergency). Three-class ED form only.',
    compute: ellisToothFracture,
    fields: [
      { dom: 'ellis-layer', arg: 'deepestLayer', kind: 'enum', values: ['enamel', 'dentin', 'pulp'], required: true, label: 'Deepest tissue layer involved' },
    ],
  },
];
