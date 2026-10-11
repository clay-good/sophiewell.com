// spec-v1629 MCP adapter: hlb-blend in lib/hlb-blend-v1629.js. The dom keys mirror
// views/group-v1629.js and META['hlb-blend'].example. Griffin 1949 and 1954; administrative domain.
// HLB values are reader input; no table ships.

import * as HB from '../../lib/hlb-blend-v1629.js';

export default [
  {
    id: 'hlb-blend',
    summary: 'Proportions of two emulsifiers for a required HLB, or the HLB of a mixture or of an oil phase (Griffin). Also estimates an HLB from saponification and acid numbers or from oxyethylene content. HLB values are entered by the reader; a required HLB outside the pair is refused.',
    compute: HB.hlbBlend,
    fields: [
      { dom: 'hb-mode', arg: 'mode', kind: 'enum', required: true, values: HB.MODES.map((m) => m.value), label: 'What to work out: blend two emulsifiers (blend), HLB of a mixture (mixture), required HLB of an oil phase (oil), estimate from saponification and acid numbers (sap), or from oxyethylene content (eo)' },
      { dom: 'hb-req', arg: 'required', kind: 'number', required: false, label: 'Blend: required HLB' },
      { dom: 'hb-a', arg: 'hlbA', kind: 'number', required: false, label: 'Blend: HLB of emulsifier A, from its data sheet' },
      { dom: 'hb-b', arg: 'hlbB', kind: 'number', required: false, label: 'Blend: HLB of emulsifier B, from its data sheet' },
      { dom: 'hb-total', arg: 'totalWeight', kind: 'number', required: false, label: 'Blend: total emulsifier weight (optional)', unit: 'g' },
      { dom: 'hb-emuls', arg: 'emulsifiers', kind: 'string', required: false, label: 'Mixture: emulsifiers, one per line: weight, then its HLB' },
      { dom: 'hb-oils', arg: 'oils', kind: 'string', required: false, label: 'Oil phase: oils, one per line: weight, then its required HLB' },
      { dom: 'hb-sap', arg: 'sapNumber', kind: 'number', required: false, label: 'Estimate: saponification number of the ester' },
      { dom: 'hb-acid', arg: 'acidNumber', kind: 'number', required: false, label: 'Estimate: acid number of the fatty acid' },
      { dom: 'hb-eo', arg: 'oxyethylenePercent', kind: 'number', required: false, label: 'Estimate: weight percent of oxyethylene' },
      { dom: 'hb-polyol', arg: 'polyolPercent', kind: 'number', required: false, label: 'Estimate: weight percent of polyhydric alcohol (optional)' },
    ],
  },
];
