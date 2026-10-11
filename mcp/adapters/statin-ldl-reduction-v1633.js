// spec-v1633 MCP adapter: statin-ldl-reduction in lib/statin-ldl-reduction-v1633.js. The dom keys
// mirror views/group-v1633.js and META['statin-ldl-reduction'].example. Clinical domain. One label
// row: Crestor, Clinical Studies, Table 11.

import * as SL from '../../lib/statin-ldl-reduction-v1633.js';

export default [
  {
    id: 'statin-ldl-reduction',
    summary: 'The mean LDL-C change for a statin dose in the comparative trial table on the Crestor label. For rosuvastatin, atorvastatin, simvastatin or pravastatin at a dose the trial used, it reports the 6-week group mean, applies it to a baseline LDL-C if one is given, and lists the nearest trial mean for the other three statins. It gives no intensity category and does not predict an individual response.',
    compute: SL.statinLdlReduction,
    fields: [
      { dom: 'slr-statin', arg: 'statin', kind: 'enum', required: true, values: SL.STATINS.map((d) => d.value), label: 'Statin' },
      { dom: 'slr-dose', arg: 'dose', kind: 'number', required: true, label: 'Daily dose', unit: 'mg' },
      { dom: 'slr-ldl', arg: 'baselineLdl', kind: 'number', label: 'Baseline LDL-C (optional)', unit: 'mg/dL' },
    ],
  },
];
