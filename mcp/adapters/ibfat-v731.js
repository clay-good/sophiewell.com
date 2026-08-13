// spec-v731 MCP adapter: Infant Breastfeeding Assessment Tool in lib/ibfat-v731.js.
// The dom keys mirror the browser renderer (views/group-v731.js) and META['ibfat'].example.
// Four 0-3 enums; the sum 0-12 maps to a feeding-effectiveness band. Clinical domain.

import { ibfat } from '../../lib/ibfat-v731.js';

export default [
  {
    id: 'ibfat',
    summary: "Infant Breastfeeding Assessment Tool (IBFAT; Matthews 1988): 4-item observational measure of an infant's breastfeeding at a feed. Readiness to feed, rooting, fixing (latch), and sucking, each 0-3 (best = 3), summed to 0-12. Higher = more effective feeding; a total of 10-12 indicates effective feeding behavior.",
    compute: ibfat,
    fields: [
      { dom: 'ibfat-ready', arg: 'readiness', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Readiness to feed (0-3)' },
      { dom: 'ibfat-root', arg: 'rooting', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Rooting (0-3)' },
      { dom: 'ibfat-fix', arg: 'fixing', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Fixing / latching on (0-3)' },
      { dom: 'ibfat-suck', arg: 'sucking', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Sucking pattern (0-3)' },
    ],
  },
];
