// spec-v1434: MCP adapter. The dom keys mirror views/group-v1434.js and this tile's META example.

import * as C2 from '../../lib/c2hest-v1434.js';

const YN = C2.C2HEST_YES_NO.map((x) => x.value);

export default [
  {
    id: 'c2hest',
    summary: 'Scores the C2HEST risk of new atrial fibrillation (0 to 8) from six conditions, with its risk group and yearly rate. It is not scored with structural heart disease, which its derivation excluded as high risk on its own.',
    compute: C2.c2hest,
    fields: [
      { dom: 'c2h-shd', arg: 'shd', kind: 'enum', required: true, label: 'Structural heart disease', values: YN },
      { dom: 'c2h-cad', arg: 'cad', kind: 'enum', label: 'Coronary artery disease', values: YN },
      { dom: 'c2h-copd', arg: 'copd', kind: 'enum', label: 'COPD', values: YN },
      { dom: 'c2h-htn', arg: 'htn', kind: 'enum', label: 'Hypertension', values: YN },
      { dom: 'c2h-age', arg: 'age75', kind: 'enum', label: 'Age 75 or older', values: YN },
      { dom: 'c2h-hf', arg: 'systolicHf', kind: 'enum', label: 'Systolic heart failure', values: YN },
      { dom: 'c2h-thyroid', arg: 'hyperthyroid', kind: 'enum', label: 'Hyperthyroidism', values: YN },
    ],
  },
];
