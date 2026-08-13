// spec-v728 MCP adapter: HHIE-S in lib/hhie-s-v728.js.
// The dom keys mirror the browser renderer (views/group-v728.js) and META['hhie-s'].example.
// Ten No/Sometimes/Yes enums (0/2/4); the sum 0-40 maps to a hearing-handicap band. Clinical
// domain.

import { hhieS } from '../../lib/hhie-s-v728.js';

const ITEM_LABELS = [
  'Embarrassed meeting new people', 'Frustrated talking with family', 'Difficulty when someone whispers',
  'Feel handicapped by hearing', 'Difficulty visiting friends/relatives', 'Attend religious services less',
  'Arguments with family', 'Difficulty with TV/radio', 'Hearing limits social life', 'Difficulty in a restaurant',
];

export default [
  {
    id: 'hhie-s',
    summary: 'Hearing Handicap Inventory for the Elderly - Screening (HHIE-S; Ventry & Weinstein 1983): 10-item self-report screen. Each item No (0), Sometimes (2), or Yes (4); total 0-40. Bands: 0-8 no handicap (~13% impairment), 10-24 mild-to-moderate (~50%), 26-40 significant (~84%). A score > 8 is a positive screen prompting audiologic referral.',
    compute: hhieS,
    fields: ITEM_LABELS.map((label, i) => ({
      dom: `hhie-q${i + 1}`, arg: `q${i + 1}`, kind: 'enum', values: ['0', '2', '4'], required: true, label: `${label} (0/2/4)`,
    })),
  },
];
