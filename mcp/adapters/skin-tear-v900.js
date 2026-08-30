// spec-v900 MCP adapter: the ISTAP skin tear classification in lib/skin-tear-v900.js. The dom
// keys mirror the browser renderer (views/group-v900.js) and META['skin-tear'].example.
//
// The type can be derived from the flap or given directly; when both are supplied and they
// disagree, the tile says so. Clinical domain.

import { skinTear } from '../../lib/skin-tear-v900.js';

export default [
  {
    id: 'skin-tear',
    summary: 'Classifies a skin tear by what has happened to the flap, after the International Skin Tear Advisory Panel. Type 1 is no skin loss, with the flap able to be repositioned to cover the wound bed; type 2 is partial flap loss, where the flap cannot cover the whole bed; type 3 is total flap loss, with the bed entirely exposed. A SKIN TEAR IS NOT STAGED LIKE A PRESSURE INJURY: it is an acute traumatic wound, and calling it a stage 2 borrows a vocabulary built for a different mechanism, so the two systems are not interchangeable. THE TYPE DESCRIBES THE FLAP, NOT THE DEPTH OR THE CAUSE. It does not choose a dressing, and a skin tear is preventable harm in most settings, so the classification starts the question of why it happened rather than ending it.',
    compute: skinTear,
    fields: [
      { dom: 'st-flappresent', arg: 'flapPresent', kind: 'boolean', required: false, label: 'A flap is present' },
      { dom: 'st-flapcoverswholebed', arg: 'flapCoversWholeBed', kind: 'boolean', required: false, label: 'The flap can be repositioned to cover the whole wound bed' },
      { dom: 'st-type', arg: 'type', kind: 'enum', required: false, label: 'Type, if it is already assigned (leave empty to derive it from the flap)', values: ['type-1', 'type-2', 'type-3'] },
    ],
  },
];
