// spec-v1242: MCP adapter. The dom key mirrors views/group-v1242.js and this tile's META example.
// The tile asks for the FINDING and derives the type, because the classification is about the
// mechanism and the reader has the mechanism in front of them.

import { endoleakType, ENDOLEAK_FINDINGS } from '../../lib/endoleak-type-v1242.js';

export default [
  {
    id: 'endoleak-type',
    summary: 'Endoleak classification after endovascular aneurysm repair, derived from the finding rather than asked for. Type I is flow past an attachment site, Ia proximal and Ib distal, with Ic an iliac occluder; type II is retrograde branch flow, IIa from one vessel and IIb from two or more; type III is a graft failure, IIIa a separation of modular components and IIIb a tear in the fabric; type IV is graft porosity in the first weeks; and type V is sac growth with no leak demonstrated. The numbering is a list of mechanisms and not a ladder of severity, which is the reading it goes wrong on, since the low-pressure type II sits between two high-pressure types. So the pressure class is printed beside the numeral, and a type V is named as a diagnosis of exclusion where the exclusion is the hard part.',
    compute: endoleakType,
    fields: [
      { dom: 'el-finding', arg: 'finding', kind: 'enum', required: true, label: 'Finding on imaging', values: ENDOLEAK_FINDINGS.map((f) => f.value) },
    ],
  },
];
