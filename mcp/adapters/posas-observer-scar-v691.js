// spec-v691 MCP adapter: POSAS Observer Scale in lib/posas-observer-scar-v691.js.
// The dom keys mirror the browser renderer (views/group-v691.js) and
// META['posas-observer-scar'].example. Six 1-10 numbers plus an optional overall opinion;
// the sum 6-60 describes the scar. Clinical domain.

import { posasObserverScar } from '../../lib/posas-observer-scar-v691.js';

export default [
  {
    id: 'posas-observer-scar',
    summary: 'POSAS Observer Scale (Draaijers 2004): the observer rates six scar characteristics - vascularity, pigmentation, thickness, relief, pliability, surface area - each 1 (like normal skin) to 10 (worst scar imaginable). Total = sum of the six items, 6-60 (6 = normal skin, higher = worse). A separate overall opinion (1-10) is recorded but not part of the total. No fixed bands; tracks change over time.',
    compute: posasObserverScar,
    fields: [
      { dom: 'posas-vasc', arg: 'vascularity', kind: 'number', required: true, label: 'Vascularity (1-10)' },
      { dom: 'posas-pigment', arg: 'pigmentation', kind: 'number', required: true, label: 'Pigmentation (1-10)' },
      { dom: 'posas-thick', arg: 'thickness', kind: 'number', required: true, label: 'Thickness (1-10)' },
      { dom: 'posas-relief', arg: 'relief', kind: 'number', required: true, label: 'Relief / surface roughness (1-10)' },
      { dom: 'posas-pliab', arg: 'pliability', kind: 'number', required: true, label: 'Pliability (1-10)' },
      { dom: 'posas-area', arg: 'surfaceArea', kind: 'number', required: true, label: 'Surface area (1-10)' },
      { dom: 'posas-overall', arg: 'overallOpinion', kind: 'number', required: false, label: 'Overall opinion (1-10, optional; not in total)' },
    ],
  },
];
