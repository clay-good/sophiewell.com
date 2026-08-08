// spec-v666 MCP adapter: VHWG ventral hernia grade in lib/vhwg-hernia-v666.js. The dom
// keys mirror the browser renderer (views/group-v666.js) and META['vhwg-hernia'].example.
// A decision-logic classifier: most severe of three boolean feature groups sets the grade
// (infected -> 4, contaminated -> 3, comorbid -> 2, else 1). Clinical domain.

import { vhwgHernia } from '../../lib/vhwg-hernia-v666.js';

export default [
  {
    id: 'vhwg-hernia',
    summary: 'Ventral Hernia Working Group (VHWG) grade for surgical-site-occurrence risk in ventral hernia repair (Breuing 2010). Most severe feature present sets the grade: 4 infected (infected mesh/septic dehiscence), 3 potentially contaminated (prior wound infection, stoma, GI-tract violation), 2 comorbid (smoking, obesity, diabetes, immunosuppression, COPD), 1 low risk.',
    compute: vhwgHernia,
    fields: [
      { dom: 'vhwg-infected', arg: 'infected', kind: 'bool', required: false, label: 'Infected mesh or septic dehiscence (Grade 4)' },
      { dom: 'vhwg-contaminated', arg: 'contaminated', kind: 'bool', required: false, label: 'Previous wound infection, a stoma, or GI-tract violation (Grade 3)' },
      { dom: 'vhwg-comorbid', arg: 'comorbid', kind: 'bool', required: false, label: 'Smoking, obesity, diabetes, immunosuppression, or COPD (Grade 2)' },
    ],
  },
];
