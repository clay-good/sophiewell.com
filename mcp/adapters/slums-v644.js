// spec-v644 MCP adapter: SLUMS examination in lib/slums-v644.js. The dom keys
// mirror the browser renderer (views/group-v644.js) and META['slums'].example.
// Education is REQUIRED (it selects the interpretation cut points, which are one
// band higher for less-than-high-school). Each item is the EARNED points (absent =
// 0), validated to its range. Clinical domain.

import { slums, SLUMS_ITEMS } from '../../lib/slums-v644.js';

const DOM = {
  day: 'slums-day', year: 'slums-year', state: 'slums-state', money: 'slums-money',
  animals: 'slums-animals', recall: 'slums-recall', digits: 'slums-digits',
  clock: 'slums-clock', figures: 'slums-figures', story: 'slums-story',
};

export default [
  {
    id: 'slums',
    summary: 'SLUMS (St. Louis University Mental Status) examination: ten scored items sum to 0-30; the interpretation bands are education-adjusted. With a high-school education or above, 27-30 normal, 21-26 mild neurocognitive disorder, ≤ 20 dementia; with less than high-school, 25-30 normal, 20-24 mild neurocognitive disorder, ≤ 19 dementia. A free MMSE alternative.',
    compute: slums,
    fields: [
      { dom: 'slums-edu', arg: 'education', kind: 'enum', values: ['hs', 'less-hs'], required: true, label: 'Education: hs = high-school or above, less-hs = less than high-school (sets the cut points)' },
      ...SLUMS_ITEMS.map((it) => ({
        dom: DOM[it.key], arg: it.key, kind: 'number', required: false,
        label: `Points earned — ${it.label} (0-${it.max})`,
      })),
    ],
  },
];
