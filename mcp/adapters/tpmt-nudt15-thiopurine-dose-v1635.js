// spec-v1635 MCP adapter: tpmt-nudt15-thiopurine-dose in lib/tpmt-nudt15-thiopurine-dose-v1635.js. The dom
// keys mirror views/group-v1640.js and META['tpmt-nudt15-thiopurine-dose'].example. CPIC tables from disk.

import * as TN from '../../lib/tpmt-nudt15-thiopurine-dose-v1635.js';
import { cpicFromDisk } from '../cpic-disk.js';

export default [
  {
    id: 'tpmt-nudt15-thiopurine-dose',
    summary: 'CPIC\'s starting-dose recommendation for mercaptopurine, azathioprine or thioguanine, from the TPMT and NUDT15 phenotypes. Quoted whole with its classification; "No result" is a choice, not a blank.',
    compute: (a) => TN.tpmtNudt15ThiopurineDose(a, cpicFromDisk(), new Date()),
    fields: [
      { dom: 'ttd-drug', arg: 'drug', kind: 'enum', required: true, values: TN.DRUGS.map((d) => d.value), label: 'Drug' },
      { dom: 'ttd-tpmt', arg: 'tpmt', kind: 'enum', required: true, values: TN.PHENOTYPES.map((p) => p.value), label: 'TPMT phenotype on the report' },
      { dom: 'ttd-nudt15', arg: 'nudt15', kind: 'enum', required: true, values: TN.PHENOTYPES.map((p) => p.value), label: 'NUDT15 phenotype on the report' },
    ],
  },
];
