// spec-v717 MCP adapter: Pederson Difficulty Index in lib/pederson-difficulty-v717.js.
// The dom keys mirror the browser renderer (views/group-v717.js) and
// META['pederson-difficulty'].example. Three enums (angulation, depth, ramus); the sum 3-10
// maps to a difficulty band. Clinical domain.

import { pedersonDifficulty } from '../../lib/pederson-difficulty-v717.js';

export default [
  {
    id: 'pederson-difficulty',
    summary: 'Pederson Difficulty Index (Pederson 1988): predicts difficulty of impacted mandibular third-molar (wisdom tooth) removal. Angulation (mesioangular 1, horizontal 2, vertical 3, distoangular 4) + depth (A 1, B 2, C 3) + ramus/space (I 1, II 2, III 3), summed 3-10. Bands: 3-4 slightly difficult, 5-6 moderately difficult, 7-10 very difficult.',
    compute: pedersonDifficulty,
    fields: [
      { dom: 'ped-angulation', arg: 'angulation', kind: 'enum', values: ['1', '2', '3', '4'], required: true, label: 'Angulation (points)' },
      { dom: 'ped-depth', arg: 'depth', kind: 'enum', values: ['1', '2', '3'], required: true, label: 'Depth (points)' },
      { dom: 'ped-ramus', arg: 'ramus', kind: 'enum', values: ['1', '2', '3'], required: true, label: 'Ramus relationship / space (points)' },
    ],
  },
];
