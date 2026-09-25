// spec-v1435: MCP adapter. The dom keys mirror views/group-v1435.js and this tile's META example.

import * as HA from '../../lib/hatch-af-v1435.js';

const YN = HA.HATCH_YES_NO.map((x) => x.value);

export default [
  {
    id: 'hatch-af',
    summary: 'Scores HATCH (0 to 7), the risk that paroxysmal atrial fibrillation progresses to a sustained form within a year. It reports only the two rates its derivation paper gives (about 6% at 0, nearly 50% above 5).',
    compute: HA.hatchAf,
    fields: [
      { dom: 'hat-htn', arg: 'htn', kind: 'enum', required: true, label: 'Hypertension', values: YN },
      { dom: 'hat-age', arg: 'age75', kind: 'enum', required: true, label: 'Age 75 or older', values: YN },
      { dom: 'hat-tia', arg: 'tiaStroke', kind: 'enum', required: true, label: 'Prior TIA or stroke', values: YN },
      { dom: 'hat-copd', arg: 'copd', kind: 'enum', required: true, label: 'COPD', values: YN },
      { dom: 'hat-hf', arg: 'hf', kind: 'enum', required: true, label: 'Heart failure', values: YN },
    ],
  },
];
