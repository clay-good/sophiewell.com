// spec-v663 MCP adapter: Lichtiger Index in lib/lichtiger-index-v663.js. The dom keys
// mirror the browser renderer (views/group-v663.js) and META['lichtiger-index'].example.
// Eight ordinal items summed 0-21; each a required enum. Cutoffs (<10 response, >=10
// active, <=3 remission) are advisory. Clinical domain.

import { lichtigerIndex } from '../../lib/lichtiger-index-v663.js';

export default [
  {
    id: 'lichtiger-index',
    summary: 'Lichtiger Index (Modified Truelove-Witts Severity Index, Lichtiger 1994) for ulcerative colitis activity: eight items summed 0-21 (stools, nocturnal diarrhea, blood, incontinence, pain, wellbeing, tenderness, antidiarrheal use). Advisory cutoffs: <10 response, >=10 active, <=3 remission.',
    compute: lichtigerIndex,
    fields: [
      { dom: 'lich-diarrhea', arg: 'diarrhea', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'Daily stools: 0 (0-2), 1 (3-4), 2 (5-6), 3 (7-9), 4 (>=10)' },
      { dom: 'lich-nocturnal', arg: 'nocturnal', kind: 'enum', values: ['0', '1'], required: true, label: 'Nocturnal diarrhea: 0 no, 1 yes' },
      { dom: 'lich-blood', arg: 'blood', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Visible blood in stool: 0 none, 1 <50%, 2 >=50%, 3 100%' },
      { dom: 'lich-incontinence', arg: 'incontinence', kind: 'enum', values: ['0', '1'], required: true, label: 'Fecal incontinence: 0 no, 1 yes' },
      { dom: 'lich-pain', arg: 'pain', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Abdominal pain: 0 none, 1 mild, 2 moderate, 3 severe' },
      { dom: 'lich-wellbeing', arg: 'wellbeing', kind: 'enum', values: ['0', '1', '2', '3', '4', '5'], required: true, label: 'General wellbeing: 0 perfect to 5 terrible' },
      { dom: 'lich-tenderness', arg: 'tenderness', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Abdominal tenderness: 0 none, 1 mild/localized, 2 mild-moderate/diffuse, 3 severe/rebound' },
      { dom: 'lich-antidiarrheal', arg: 'antidiarrheal', kind: 'enum', values: ['0', '1'], required: true, label: 'Need for antidiarrheal drugs: 0 no, 1 yes' },
    ],
  },
];
