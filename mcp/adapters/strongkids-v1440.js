// spec-v1440: MCP adapter. The dom keys mirror views/group-v1440.js and this tile's META example.

import * as SK from '../../lib/strongkids-v1440.js';

const YN = SK.STRONGKIDS_YES_NO.map((x) => x.value);

export default [
  {
    id: 'strongkids',
    summary: 'Screens a hospitalized child for nutritional risk with STRONGkids, four questions scored 0 to 5 with a low, moderate or high band. It is a screen to repeat weekly, not a malnutrition diagnosis.',
    compute: SK.strongkids,
    fields: [
      { dom: 'sk-clinical', arg: 'clinical', kind: 'enum', required: true, label: 'Poor nutritional status on clinical assessment', values: YN },
      { dom: 'sk-disease', arg: 'disease', kind: 'enum', required: true, label: 'High risk disease or expected major surgery', values: YN },
      { dom: 'sk-intake', arg: 'intake', kind: 'enum', required: true, label: 'Reduced intake or losses', values: YN },
      { dom: 'sk-weight', arg: 'weight', kind: 'enum', required: true, label: 'Weight loss or poor weight gain', values: YN },
    ],
  },
];
