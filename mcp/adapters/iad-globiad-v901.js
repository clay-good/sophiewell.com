// spec-v901 MCP adapter: the GLOBIAD categorization in lib/iad-globiad-v901.js. The dom keys
// mirror the browser renderer (views/group-v901.js) and META['iad-globiad'].example.
//
// The two pattern fields do NOT change the category; they let the tile push back when the
// findings look like pressure damage instead. Clinical domain.

import { iadGlobiad } from '../../lib/iad-globiad-v901.js';

export default [
  {
    id: 'iad-globiad',
    summary: 'Categorizes incontinence-associated dermatitis with the Ghent Global IAD Categorisation Tool. Category 1 is persistent redness with no skin loss and category 2 is skin loss, each split into A for no clinical signs of infection and B for signs present. IT IS NOT A PRESSURE INJURY, and moisture damage written up as a stage 2 is the commonest miscoding in skin assessment: this is top-down damage over skin that has been wet, while a pressure injury is bottom-up over a bony prominence, and the distinction changes the prevention plan and the incident report. THE PATTERN TELLS THEM APART, so damage over a bony prominence with distinct edges reads as pressure and the tile says so. THE TWO CAN COEXIST. The category does not choose a product, and the infection subcategory is a prompt to look rather than a diagnosis.',
    compute: iadGlobiad,
    fields: [
      { dom: 'iad-skinloss', arg: 'skinLoss', kind: 'boolean', required: false, label: 'Skin loss is present (category 2 rather than 1)' },
      { dom: 'iad-infectionsigns', arg: 'infectionSigns', kind: 'boolean', required: false, label: 'Clinical signs of infection are present (the B subcategory)' },
      { dom: 'iad-overbonyprominence', arg: 'overBonyProminence', kind: 'boolean', required: false, label: 'The damage is over a bony prominence (does not change the category; points toward pressure damage)' },
      { dom: 'iad-distinctedges', arg: 'distinctEdges', kind: 'boolean', required: false, label: 'The edges are distinct (does not change the category; points toward pressure damage)' },
    ],
  },
];
