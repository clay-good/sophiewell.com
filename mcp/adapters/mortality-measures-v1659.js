// spec-v1659 MCP adapter: mortality-measures in lib/mortality-measures-v1659.js. The dom keys mirror views/group-v1659.js and
// META['mortality-measures'].example.

import * as MM from '../../lib/mortality-measures-v1659.js';

export default [
  {
    id: 'mortality-measures',
    summary: 'Crude, cause-specific, infant, neonatal, maternal and other mortality measures, with CDC\'s numerators and denominators. Also case fatality, proportionate mortality and the death-to-case ratio.',
    compute: MM.mortalityMeasures,
    fields: [
      { dom: 'mm-measure', arg: 'measure', kind: 'enum', values: MM.MEASURES.map((m) => m[0]), required: true, label: 'Measure' },
      { dom: 'mm-numerator', arg: 'numerator', kind: 'number', required: true, label: 'Numerator (deaths)' },
      { dom: 'mm-denominator', arg: 'denominator', kind: 'number', required: true, label: 'Denominator' },
      { dom: 'mm-multiplier', arg: 'multiplier', kind: 'enum', values: ['100', '1000', '10000', '100000'], required: false, label: 'Multiplier (the measure\'s usual one if blank)' },
    ]
  },
];
