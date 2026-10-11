// spec-v1629 MCP adapter: tablet-powder-source in lib/tablet-powder-source-v1629.js. The dom keys mirror
// views/group-v1629.js and META['tablet-powder-source'].example. Arithmetic identity; administrative domain.

import * as TP from '../../lib/tablet-powder-source-v1629.js';

export default [
  {
    id: 'tablet-powder-source',
    summary: 'Crushed commercial tablets as a drug source: the tablets to crush and the weight of powder that carries the drug needed. The tablet count rounds up; the powder weight does not.',
    compute: TP.tabletPowderSource,
    fields: [
      { dom: 'tp-needed', arg: 'needed', kind: 'number', required: true, label: 'Drug needed', unit: 'mg' },
      { dom: 'tp-strength', arg: 'strength', kind: 'number', required: true, label: 'Labeled strength per tablet', unit: 'mg' },
      { dom: 'tp-count', arg: 'count', kind: 'number', required: true, label: 'Number of whole tablets weighed' },
      { dom: 'tp-total', arg: 'totalWeight', kind: 'number', required: true, label: 'Total weight of those tablets', unit: 'mg' },
      { dom: 'tp-extra', arg: 'extra', kind: 'number', required: false, label: 'Extra tablets to crush (optional)' },
    ],
  },
];
