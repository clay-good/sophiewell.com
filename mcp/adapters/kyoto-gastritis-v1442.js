// spec-v1442: MCP adapter. The dom keys mirror views/group-v1442.js and this tile's META example.

import * as KY from '../../lib/kyoto-gastritis-v1442.js';

const v = (list) => list.map((x) => x.value);

export default [
  {
    id: 'kyoto-gastritis',
    summary: 'Scores the Kyoto classification of gastritis, 0 to 8 from five endoscopic findings, against the gastric cancer risk level of 4. It notes that eradication can raise the score through map-like redness.',
    compute: KY.kyotoGastritis,
    fields: [
      { dom: 'kyo-atrophy', arg: 'atrophy', kind: 'enum', required: true, label: 'Atrophy (Kimura-Takemoto extent)', values: v(KY.KYOTO_ATROPHY) },
      { dom: 'kyo-im', arg: 'im', kind: 'enum', required: true, label: 'Intestinal metaplasia', values: v(KY.KYOTO_IM) },
      { dom: 'kyo-folds', arg: 'folds', kind: 'enum', required: true, label: 'Enlarged folds', values: v(KY.KYOTO_YES_NO) },
      { dom: 'kyo-nodularity', arg: 'nodularity', kind: 'enum', required: true, label: 'Nodularity', values: v(KY.KYOTO_YES_NO) },
      { dom: 'kyo-redness', arg: 'redness', kind: 'enum', required: true, label: 'Diffuse redness', values: v(KY.KYOTO_REDNESS) },
    ],
  },
];
