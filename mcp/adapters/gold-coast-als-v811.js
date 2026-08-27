// spec-v811 MCP adapter: Gold Coast ALS criteria in lib/gold-coast-als-v811.js.
// The dom keys mirror the browser renderer (views/group-v811.js) and
// META['gold-coast-als'].example. Per-region booleans, not counts, because the first limb of
// the distribution requirement needs UMN and LMN in the SAME region. Clinical domain.

import { goldCoastAls } from '../../lib/gold-coast-als-v811.js';

export default [
  {
    id: 'gold-coast-als',
    summary: 'Applies the 2020 Gold Coast criteria for diagnosing ALS. All three are required: documented progressive motor impairment; either UMN and LMN dysfunction together in the SAME body region or LMN dysfunction in two regions; and investigations excluding other diseases. Gold Coast abolished the definite/probable/possible categories used by revised El Escorial and Awaji. UMN and LMN signs in DIFFERENT regions satisfy neither limb.',
    compute: goldCoastAls,
    fields: [
      { dom: 'gca-progressive', arg: 'progressiveMotorImpairment', kind: 'boolean', required: false, label: 'Progressive motor impairment' },
      { dom: 'gca-excluded', arg: 'otherDiseasesExcluded', kind: 'boolean', required: false, label: 'Other diseases excluded' },
      { dom: 'gca-bulbar-umn', arg: 'bulbarUmn', kind: 'boolean', required: false, label: 'Bulbar UMN dysfunction' },
      { dom: 'gca-bulbar-lmn', arg: 'bulbarLmn', kind: 'boolean', required: false, label: 'Bulbar LMN dysfunction' },
      { dom: 'gca-cervical-umn', arg: 'cervicalUmn', kind: 'boolean', required: false, label: 'Cervical UMN dysfunction' },
      { dom: 'gca-cervical-lmn', arg: 'cervicalLmn', kind: 'boolean', required: false, label: 'Cervical LMN dysfunction' },
      { dom: 'gca-thoracic-umn', arg: 'thoracicUmn', kind: 'boolean', required: false, label: 'Thoracic UMN dysfunction' },
      { dom: 'gca-thoracic-lmn', arg: 'thoracicLmn', kind: 'boolean', required: false, label: 'Thoracic LMN dysfunction' },
      { dom: 'gca-lumbosacral-umn', arg: 'lumbosacralUmn', kind: 'boolean', required: false, label: 'Lumbosacral UMN dysfunction' },
      { dom: 'gca-lumbosacral-lmn', arg: 'lumbosacralLmn', kind: 'boolean', required: false, label: 'Lumbosacral LMN dysfunction' },
    ],
  },
];
