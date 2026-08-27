// spec-v819 MCP adapter: ICHD-3 paroxysmal hemicrania and hemicrania continua in
// lib/indomethacin-headache-ichd3-v819.js. The dom keys mirror the browser renderer
// (views/group-v819.js) and META['indomethacin-headache-ichd3'].example. Clinical domain.

import { indomethacinHeadacheIchd3 } from '../../lib/indomethacin-headache-ichd3-v819.js';

export default [
  {
    id: 'indomethacin-headache-ichd3',
    summary: 'Applies the ICHD-3 criteria for the two indomethacin-responsive headaches. Paroxysmal hemicrania (3.2) and hemicrania continua (3.4) are assessed together. An ABSOLUTE response to therapeutic indomethacin is a diagnostic criterion in both, not a consequence, so neither can be diagnosed before an adequate trial. Paroxysmal hemicrania is the diagnosis most often mistaken for cluster headache: 2-30 minute attacks more than 5 a day, against 15-180 minutes up to 8 a day.',
    compute: indomethacinHeadacheIchd3,
    fields: [
      { dom: 'ind-response', arg: 'indomethacinResponse', kind: 'boolean', required: false, label: 'Absolute response to indomethacin' },
      { dom: 'ind-attacks', arg: 'attackCount', kind: 'number', required: false, label: 'Number of attacks' },
      { dom: 'ind-minutes', arg: 'attackMinutes', kind: 'number', required: false, label: 'Attack duration, minutes' },
      { dom: 'ind-perday', arg: 'attacksPerDay', kind: 'number', required: false, label: 'Attacks per day' },
      { dom: 'ind-continuous', arg: 'unilateralContinuous', kind: 'boolean', required: false, label: 'Continuous one-sided headache' },
      { dom: 'ind-months', arg: 'monthsContinuous', kind: 'number', required: false, label: 'Months present' },
      { dom: 'ind-exacerbations', arg: 'moderateExacerbations', kind: 'boolean', required: false, label: 'Exacerbations of moderate or greater intensity' },
      { dom: 'ind-conjunctival', arg: 'conjunctivalInjection', kind: 'boolean', required: false, label: 'Conjunctival injection or tearing' },
      { dom: 'ind-nasal', arg: 'nasalCongestion', kind: 'boolean', required: false, label: 'Nasal congestion or rhinorrhea' },
      { dom: 'ind-eyelid', arg: 'eyelidEdema', kind: 'boolean', required: false, label: 'Eyelid edema' },
      { dom: 'ind-sweating', arg: 'sweating', kind: 'boolean', required: false, label: 'Forehead and facial sweating' },
      { dom: 'ind-miosis', arg: 'miosisPtosis', kind: 'boolean', required: false, label: 'Miosis or ptosis' },
      { dom: 'ind-restless', arg: 'restlessness', kind: 'boolean', required: false, label: 'Restlessness or agitation' },
      { dom: 'ind-movement', arg: 'aggravatedByMovement', kind: 'boolean', required: false, label: 'Pain worse with movement (3.4 only)' },
      { dom: 'ind-noother', arg: 'noBetterExplanation', kind: 'boolean', required: false, label: 'No better ICHD-3 explanation' },
    ],
  },
];
