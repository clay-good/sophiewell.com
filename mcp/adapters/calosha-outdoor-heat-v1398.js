// spec-v1398: MCP adapter. The dom keys mirror views/group-v1398.js and this tile's META example.

import * as OH from '../../lib/calosha-outdoor-heat-v1398.js';

export default [
  {
    id: 'calosha-outdoor-heat',
    summary: 'Lists what California\'s outdoor heat standard (8 CCR 3395) requires at a given temperature and industry. Water always applies, and shade above 80F. High-heat procedures start at 95F in agriculture, construction, landscaping, oil and gas, and heavy-materials transport, and agriculture adds a 10-minute cool-down every 2 hours. A heat wave (at least 80F and 10F above the prior five-day average) and a worker\'s first 14 days both require close observation.',
    compute: OH.caloshaOutdoorHeat,
    fields: [
      { dom: 'oh-temp', arg: 'tempF', kind: 'number', required: true, label: 'Temperature or predicted high (F)' },
      { dom: 'oh-industry', arg: 'industry', kind: 'enum', required: true, label: 'Industry', values: OH.INDUSTRIES.map((i) => i.value) },
      { dom: 'oh-prior', arg: 'priorHighs', kind: 'string', label: 'Highs of the preceding five days (F, comma-separated)' },
    ],
  },
];
