// spec-v674 MCP adapter: Onychomycosis Severity Index (OSI) in
// lib/osi-onychomycosis-v674.js. The dom keys mirror the browser renderer
// (views/group-v674.js) and META['osi-onychomycosis'].example. Two enums (area 0-5,
// proximity 1-5) plus one bonus flag; area x proximity + 10 -> total 0-35. Clinical domain.

import { osiOnychomycosis } from '../../lib/osi-onychomycosis-v674.js';

export default [
  {
    id: 'osi-onychomycosis',
    summary: 'Onychomycosis Severity Index (Carney 2011): grades a single fungal nail as area of involvement (0 none, 1 = 1-10%, 2 = 11-25%, 3 = 26-50%, 4 = 51-75%, 5 = >75%) MULTIPLIED by proximity to the matrix (1 distal quarter to 5 matrix), plus 10 points if a dermatophytoma or > 2 mm subungual hyperkeratosis is present. Total 0-35: 0 none, 1-5 mild, 6-15 moderate, 16-35 severe. Area 0 gives total 0.',
    compute: osiOnychomycosis,
    fields: [
      { dom: 'osi-area', arg: 'area', kind: 'enum', values: ['0', '1', '2', '3', '4', '5'], required: true, label: 'Area of involvement (0 none, 1 = 1-10%, 2 = 11-25%, 3 = 26-50%, 4 = 51-75%, 5 = >75%)' },
      { dom: 'osi-prox', arg: 'proximity', kind: 'enum', values: ['1', '2', '3', '4', '5'], required: true, label: 'Proximity to matrix (1 distal quarter, 2 second, 3 third, 4 proximal quarter, 5 matrix)' },
      { dom: 'osi-bonus', arg: 'bonus', kind: 'bool', label: 'Dermatophytoma (streak/patch) or > 2 mm subungual hyperkeratosis (+10)' },
    ],
  },
];
