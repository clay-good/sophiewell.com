// spec-v1635 MCP adapter: dpyd-fluoropyrimidine-dose in lib/dpyd-fluoropyrimidine-dose-v1635.js. The dom
// keys mirror views/group-v1640.js and META['dpyd-fluoropyrimidine-dose'].example. The CPIC tables are
// read from disk; one label row (XELODA).

import * as DF from '../../lib/dpyd-fluoropyrimidine-dose-v1635.js';
import { cpicFromDisk } from '../cpic-disk.js';

export default [
  {
    id: 'dpyd-fluoropyrimidine-dose',
    summary: 'CPIC\'s fluorouracil or capecitabine recommendation for a DPYD activity score. The score is the sum of the two lowest variant values in CPIC\'s table, or the one the report prints; capecitabine adds the XELODA label\'s testing sentence.',
    compute: (a) => DF.dpydFluoropyrimidineDose(a, cpicFromDisk(), new Date()),
    fields: [
      { dom: 'dfd-drug', arg: 'drug', kind: 'enum', required: true, values: DF.DRUGS.map((d) => d.value), label: 'Drug' },
      { dom: 'dfd-variants', arg: 'variants', kind: 'string', required: false, label: 'DPYD variants as the report lists them, one per line ("Reference" for a copy with none found)' },
      { dom: 'dfd-score', arg: 'activityScore', kind: 'number', min: 0, max: 2, required: false, label: 'Or the DPYD activity score the report prints (0 to 2)' },
    ],
  },
];
