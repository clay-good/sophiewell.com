// spec-v1634 MCP adapter: anticholinergic-list-score in lib/anticholinergic-list-score-v1634.js. The
// dom keys mirror views/group-v1634.js and META['anticholinergic-list-score'].example. Clinical domain.

import * as AL from '../../lib/anticholinergic-list-score-v1634.js';

export default [
  {
    id: 'anticholinergic-list-score',
    summary: 'Anticholinergic burden summed from an open drug list, by drug name. It looks each drug up on the German ACB list (Kiesel 2018) or the CRIDECO list (Ramos 2022), adds the scores of 1 to 3, and names every drug that is not on the list instead of counting it as zero. It compares the total with the paper\'s threshold of 3. Neither list was built for drugs sold in the United States.',
    compute: AL.anticholinergicListScore,
    fields: [
      { dom: 'als-scale', arg: 'scale', kind: 'enum', required: true, values: AL.SCALES.map((s) => s.value), label: 'Scale' },
      { dom: 'als-drugs', arg: 'drugs', kind: 'string', required: true, label: 'Drugs by generic name, one per line or separated by commas' },
    ],
  },
];
