// spec-v1446: MCP adapter. The dom keys mirror views/group-v1446.js and this tile's META example.
// Glucose is canonical mg/dL; the page's mmol/L option converts before the library sees it.

import * as HY from '../../lib/hypoglycemia-level-v1446.js';

export default [
  {
    id: 'hypoglycemia-level',
    summary: 'Classifies hypoglycemia by the ADA levels, from level 1 below 70 mg/dL to level 3 needing help to treat. It gives the first step: 15 to 20 g of glucose and a recheck at 15 minutes, or glucagon when the person cannot take it by mouth.',
    compute: HY.hypoglycemiaLevel,
    fields: [
      { dom: 'hy-assist', arg: 'needsAssistance', kind: 'enum', required: true, label: 'Altered mental or physical status, needing help to treat', values: HY.HYPO_YES_NO.map((x) => x.value) },
      { dom: 'hy-glucose', arg: 'glucoseMgDl', kind: 'number', label: 'Glucose', unit: 'mg/dL' },
    ],
  },
];
