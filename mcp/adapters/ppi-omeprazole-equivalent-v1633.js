// spec-v1633 MCP adapter: ppi-omeprazole-equivalent in lib/ppi-omeprazole-equivalent-v1633.js. The
// dom keys mirror views/group-v1633.js and META['ppi-omeprazole-equivalent'].example. Clinical
// domain. One paper (Kirchheiner 2009), read from its abstract.

import * as PP from '../../lib/ppi-omeprazole-equivalent-v1633.js';

export default [
  {
    id: 'ppi-omeprazole-equivalent',
    summary: 'A proton-pump inhibitor dose in omeprazole equivalents, by Kirchheiner 2009. It multiplies the daily dose by the paper\'s relative potency (pantoprazole 0.23, lansoprazole 0.90, omeprazole 1.00, esomeprazole 1.60, rabeprazole 1.82, from 24-hour gastric pH) and, if a target drug is named, gives that drug\'s matching dose. The paper gives no clinical bands and says its estimates need caution.',
    compute: PP.ppiOmeprazoleEquivalent,
    fields: [
      { dom: 'poe-ppi', arg: 'ppi', kind: 'enum', required: true, values: PP.PPIS.map((d) => d.value), label: 'Proton-pump inhibitor' },
      { dom: 'poe-dose', arg: 'dailyDose', kind: 'number', required: true, label: 'Daily dose', unit: 'mg' },
      { dom: 'poe-target', arg: 'target', kind: 'enum', values: PP.PPIS.map((d) => d.value), label: 'Target drug (optional)' },
    ],
  },
];
