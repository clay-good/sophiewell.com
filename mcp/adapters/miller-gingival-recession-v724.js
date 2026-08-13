// spec-v724 MCP adapter: Miller gingival-recession classification in
// lib/miller-gingival-recession-v724.js. The dom keys mirror the browser renderer
// (views/group-v724.js) and META['miller-gingival-recession'].example. An interdental-loss
// enum + (for no loss) a recession-extent enum; decision logic returns the Miller class.
// Clinical domain.

import { millerGingivalRecession } from '../../lib/miller-gingival-recession-v724.js';

export default [
  {
    id: 'miller-gingival-recession',
    summary: 'Miller classification of gingival recession (Miller 1985): predicts achievable root coverage. Class I = recession not to the mucogingival junction (MGJ), no interdental loss; Class II = to/beyond the MGJ, no interdental loss (both 100% coverage); Class III = interdental loss coronal to the recession apex (partial coverage); Class IV = interdental bone loss apical to the recession (no coverage).',
    compute: millerGingivalRecession,
    fields: [
      { dom: 'miller-loss', arg: 'interdentalLoss', kind: 'enum', values: ['none', 'coronal', 'apical'], required: true, label: 'Interdental bone / soft-tissue loss' },
      { dom: 'miller-extent', arg: 'recessionExtent', kind: 'enum', values: ['not-to-mgj', 'to-or-beyond-mgj'], required: false, label: 'Recession extent (only when there is no interdental loss)' },
    ],
  },
];
