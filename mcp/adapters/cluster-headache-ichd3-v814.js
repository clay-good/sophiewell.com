// spec-v814 MCP adapter: ICHD-3 cluster headache criteria in
// lib/cluster-headache-ichd3-v814.js. The dom keys mirror the browser renderer
// (views/group-v814.js) and META['cluster-headache-ichd3'].example. Clinical domain.

import { clusterHeadacheIchd3 } from '../../lib/cluster-headache-ichd3-v814.js';

export default [
  {
    id: 'cluster-headache-ichd3',
    summary: 'Applies the ICHD-3 criteria for cluster headache. All five needed: at least 5 attacks; severe one-sided orbital, supraorbital or temporal pain lasting 15-180 minutes untreated; either one ipsilateral cranial autonomic sign OR restlessness; a frequency between one every other day and 8 per day; and no better ICHD-3 explanation. Restlessness ALONE satisfies criterion C, and the frequency requirement is a window with a floor, so too few attacks fails it too.',
    compute: clusterHeadacheIchd3,
    fields: [
      { dom: 'chi-attacks', arg: 'attackCount', kind: 'number', required: false, label: 'Number of attacks' },
      { dom: 'chi-pain', arg: 'severeUnilateralPain', kind: 'boolean', required: false, label: 'Severe one-sided orbital pain' },
      { dom: 'chi-duration', arg: 'attackDuration', kind: 'number', required: false, label: 'Attack duration untreated, minutes' },
      { dom: 'chi-frequency', arg: 'attacksPerDay', kind: 'number', required: false, label: 'Attacks per day' },
      { dom: 'chi-conjunctival', arg: 'conjunctivalInjection', kind: 'boolean', required: false, label: 'Conjunctival injection or tearing' },
      { dom: 'chi-nasal', arg: 'nasalCongestion', kind: 'boolean', required: false, label: 'Nasal congestion or rhinorrhea' },
      { dom: 'chi-eyelid', arg: 'eyelidEdema', kind: 'boolean', required: false, label: 'Eyelid edema' },
      { dom: 'chi-sweating', arg: 'sweating', kind: 'boolean', required: false, label: 'Forehead and facial sweating' },
      { dom: 'chi-miosis', arg: 'miosisPtosis', kind: 'boolean', required: false, label: 'Miosis or ptosis' },
      { dom: 'chi-restless', arg: 'restlessness', kind: 'boolean', required: false, label: 'Restlessness or agitation' },
      { dom: 'chi-noother', arg: 'noBetterExplanation', kind: 'boolean', required: false, label: 'No better ICHD-3 explanation' },
      { dom: 'chi-pattern', arg: 'remissionPattern', kind: 'enum', required: false, label: 'Bout pattern', values: ['episodic', 'chronic'] },
    ],
  },
];
