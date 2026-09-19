// spec-v1390: MCP adapter. The dom keys mirror views/group-v1390.js and this tile's META example.
// Dates are 'YYYY-MM-DD'; the tile never reads the clock. A blank criterion is "not assessed".

import * as AOT from '../../lib/ny-aot-kendras-law-v1390.js';

const C = ['met', 'not-met'];

export default [
  {
    id: 'ny-aot-kendras-law',
    summary: "Checks the seven MHL 9.60(c) criteria for a New York assisted outpatient treatment order against the petition date. The history prong needs two hospitalizations where non-compliance was a significant factor within 36 months, serious violence within 48 months, or an AOT order that expired within 6 months with deterioration since. A current confinement, or one that ended within 6 months, is not counted, so the window reaches back by its length. Any criterion left blank is not assessed, and the answer is then undecided. The initial order runs for no more than one year.",
    compute: AOT.nyAotKendrasLaw,
    fields: [
      { dom: 'aot-asof', arg: 'asOf', kind: 'string', required: true, label: 'Petition date (YYYY-MM-DD)' },
      { dom: 'aot-age', arg: 'age', kind: 'number', required: true, label: 'Age (years)' },
      { dom: 'aot-mi', arg: 'mentalIllness', kind: 'enum', label: '(2) Suffering from a mental illness', values: C },
      { dom: 'aot-survive', arg: 'unlikelySurvive', kind: 'enum', label: '(3) Unlikely to survive safely without supervision', values: C },
      { dom: 'aot-voluntary', arg: 'unlikelyVoluntary', kind: 'enum', label: '(5) Unlikely to take part in treatment voluntarily', values: C },
      { dom: 'aot-prevent', arg: 'needToPrevent', kind: 'enum', label: '(6) Needs AOT to prevent relapse likely to cause serious harm', values: C },
      { dom: 'aot-benefit', arg: 'likelyBenefit', kind: 'enum', label: '(7) Likely to benefit from AOT', values: C },
      { dom: 'aot-episodes', arg: 'episodes', kind: 'string', label: 'Hospitalization dates, comma-separated (YYYY-MM-DD)' },
      { dom: 'aot-violence', arg: 'violence', kind: 'string', label: 'Most recent serious violence (YYYY-MM-DD)' },
      { dom: 'aot-expired', arg: 'aotExpired', kind: 'string', label: 'Earlier AOT order expired (YYYY-MM-DD)' },
      { dom: 'aot-since', arg: 'aotSince', kind: 'enum', label: 'Deterioration since that order expired', values: C },
      { dom: 'aot-cstart', arg: 'confineStart', kind: 'string', label: 'Current or recent confinement began (YYYY-MM-DD)' },
      { dom: 'aot-cend', arg: 'confineEnd', kind: 'string', label: 'Confinement ended; blank if still confined (YYYY-MM-DD)' },
      { dom: 'aot-reviewed', arg: 'historyReviewed', kind: 'enum', label: 'Records reviewed for all three history prongs', values: ['yes', 'no'] },
    ],
  },
];
