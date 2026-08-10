// spec-v707 MCP adapter: Amsler-Krumeich keratoconus staging in
// lib/amsler-krumeich-v707.js. The dom keys mirror the browser renderer
// (views/group-v707.js) and META['amsler-krumeich'].example. Two required numbers, an
// optional refraction, and a scar boolean; decision logic returns the stage. Clinical domain.

import { amslerKrumeich } from '../../lib/amsler-krumeich-v707.js';

export default [
  {
    id: 'amsler-krumeich',
    summary: 'Amsler-Krumeich keratoconus classification (Krumeich 1998): stage 1-4 by the most advanced finding. Mean K (<48=1, 48-53=2, 54-55=3, >55=4 D); thinnest thickness (>500=1, 400-500=2, 200-400=3, <200=4 um); myopia+astigmatism (<5=1, 5-<8=2, 8-10=3, >10=4 D, optional); central scarring = stage 4. Overall stage = the maximum single-parameter stage.',
    compute: amslerKrumeich,
    fields: [
      { dom: 'ak-k', arg: 'meanK', kind: 'number', unit: 'D', required: true, label: 'Mean central keratometry (diopters)' },
      { dom: 'ak-thick', arg: 'thinnestThickness', kind: 'number', unit: 'um', required: true, label: 'Thinnest corneal thickness (microns)' },
      { dom: 'ak-refraction', arg: 'refraction', kind: 'number', unit: 'D', required: false, label: 'Myopia + astigmatism (diopters, optional)' },
      { dom: 'ak-scar', arg: 'centralScar', kind: 'boolean', required: false, label: 'Central corneal scarring present (stage 4)' },
    ],
  },
];
