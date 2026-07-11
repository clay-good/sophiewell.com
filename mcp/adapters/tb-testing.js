// spec-v183 MCP wave 108: adapter for the TST (Mantoux) tuberculin-skin-test
// interpretation, now that its compute is a pure lib fn (lib/tb-testing.js). The
// group-j renderer previously computed the interpretation inline, so the
// pure-adapter sweep had deferred it. dom keys mirror views/group-j.js. The IGRA
// reference list is a static data-file lookup and stays in the view; this adapter
// exposes the per-patient TST interpretation only.

import * as F from '../../lib/tb-testing.js';

export default [
  {
    id: 'tb-testing',
    summary: 'TST (Mantoux) tuberculin skin test interpretation: an induration (mm) is POSITIVE when it meets or exceeds the risk-stratified cutoff (CDC/ATS) - >= 5 mm for high risk (HIV+, recent contact, immunosuppressed, fibrotic CXR), >= 10 mm for moderate risk, >= 15 mm for low / no specific risk. Reports the interpretation, not a treatment decision.',
    compute: F.tbTstInterpret,
    fields: [
      { dom: 'tb-mm', arg: 'indurationMm', kind: 'number', required: true, label: 'Induration', unit: 'mm' },
      { dom: 'tb-risk', arg: 'cutoffMm', kind: 'enum', required: true, values: ['5', '10', '15'], to: (v) => Number(v), label: 'Risk-category cutoff (5 high / 10 moderate / 15 low)' },
    ],
  },
];
