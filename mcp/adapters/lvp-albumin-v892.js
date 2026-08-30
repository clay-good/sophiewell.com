// spec-v892 MCP adapter: post-paracentesis albumin in lib/lvp-albumin-v892.js. The dom keys
// mirror the browser renderer (views/group-v892.js) and META['lvp-albumin'].example.
//
// The dose is per liter across the WHOLE volume removed. Clinical domain.

import { lvpAlbumin } from '../../lib/lvp-albumin-v892.js';

export default [
  {
    id: 'lvp-albumin',
    summary: 'Computes the albumin replacement owed after a large-volume paracentesis. Above 5 liters removed, the guidelines give 6 to 8 g of albumin per liter removed; at or below 5 liters it is not routinely required. THE THRESHOLD IS THE VOLUME REMOVED, NOT THE PATIENT\'S ALBUMIN LEVEL, because post-paracentesis circulatory dysfunction follows the volume shift, so a normal serum albumin does not excuse replacement. THE DOSE IS PER LITER ACROSS THE WHOLE VOLUME, not per liter above the five-liter line, and that arithmetic is the one most often done wrong. Albumin for this indication is neither nutritional support nor a plasma expander of convenience. A tap is also a diagnostic opportunity: ascitic fluid should be sent for a cell count and culture whether or not the paracentesis is therapeutic.',
    compute: lvpAlbumin,
    fields: [
      { dom: 'lvp-litersremoved', arg: 'litersRemoved', kind: 'number', required: true, label: 'Ascitic fluid removed, liters', unit: 'L' },
      { dom: 'lvp-concentration', arg: 'concentration', kind: 'enum', required: false, label: 'Albumin concentration stocked, for the bottle count', values: ['25', '20', '5'] },
    ],
  },
];
