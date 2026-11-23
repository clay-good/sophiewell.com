// spec-v1772 MCP adapter: herd-immunity-threshold in lib/herd-immunity-v1772.js. The dom keys mirror
// views/group-v1772.js and the META example; efficacy and coverage are percentages, as on the page.

import * as H from '../../lib/herd-immunity-v1772.js';

export default [
  {
    id: 'herd-immunity-threshold',
    summary: 'The share of a population that must be immune before an infection stops spreading, 1 - 1/R0. With a vaccine\'s efficacy it also gives the coverage a program must reach, and says when an efficacy is too low for any coverage to reach the threshold.',
    compute: H.herdImmunityThreshold,
    fields: [
      { dom: 'hit-r0', arg: 'r0', kind: 'number', required: true, min: 0, max: H.R0_MAX, label: 'Basic reproduction number (R0): the further cases one case causes where no one is immune' },
      { dom: 'hit-eff', arg: 'efficacy', kind: 'number', min: 0, max: 100, label: 'Vaccine efficacy (optional; blank is a perfect vaccine)', unit: '%' },
      { dom: 'hit-cov', arg: 'coverage', kind: 'number', min: 0, max: 100, label: 'Coverage reached, to compare with what is needed (optional)', unit: '%' },
    ],
  },
];
