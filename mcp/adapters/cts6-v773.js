// spec-v773 MCP adapter: CTS-6 in lib/cts6-v773.js.
// The dom keys mirror the browser renderer (views/group-v773.js) and META['cts6'].example.
// Six weighted booleans; a sum 0-26 maps to a likelihood band. Clinical domain.

import { cts6 } from '../../lib/cts6-v773.js';

export default [
  {
    id: 'cts6',
    summary: 'CTS-6 (Graham 2006): six-item clinical diagnostic score for carpal tunnel syndrome. Weights: median-territory numbness 3.5, nocturnal numbness 4, thenar atrophy/weakness 5, positive Phalen 5, loss of 2-point discrimination 4.5, positive Tinel 4; maximum 26. Above 12 is approx 80% probability of CTS, above 5 approx 25%.',
    compute: cts6,
    fields: [
      { dom: 'cts6-median', arg: 'medianNumbness', kind: 'boolean', required: false, label: 'Numbness mainly or only in the median nerve territory (3.5)' },
      { dom: 'cts6-night', arg: 'nocturnalNumbness', kind: 'boolean', required: false, label: 'Numbness at night (4)' },
      { dom: 'cts6-thenar', arg: 'thenarAtrophy', kind: 'boolean', required: false, label: 'Thenar atrophy or weakness (5)' },
      { dom: 'cts6-phalen', arg: 'phalen', kind: 'boolean', required: false, label: 'Positive Phalen test (5)' },
      { dom: 'cts6-twopoint', arg: 'twoPointLoss', kind: 'boolean', required: false, label: 'Loss of 2-point discrimination in the median territory (4.5)' },
      { dom: 'cts6-tinel', arg: 'tinel', kind: 'boolean', required: false, label: 'Positive Tinel sign (4)' },
    ],
  },
];
