// spec-v1428: MCP adapter. The dom keys mirror views/group-v1428.js and this tile's META example.

import * as ND from '../../lib/neer-distal-clavicle-v1428.js';

export default [
  {
    id: 'neer-distal-clavicle',
    summary: 'Derives the modified Neer type (I, IIA, IIB, III, IV or V) of a distal-third clavicle fracture from the radiograph. The fracture\'s position against the conoid and trapezoid ligaments and any extension into the acromioclavicular joint set the type; comminuted and pediatric physeal patterns are types V and IV.',
    compute: ND.neerDistalClavicle,
    fields: [
      { dom: 'dcl-pattern', arg: 'pattern', kind: 'enum', required: true, label: 'Fracture pattern', values: ND.NDC_PATTERN.map((x) => x.value) },
      { dom: 'dcl-location', arg: 'location', kind: 'enum', label: 'Location against the coracoclavicular ligaments', values: ND.NDC_LOCATION.map((x) => x.value) },
      { dom: 'dcl-ac', arg: 'ac', kind: 'enum', label: 'Acromioclavicular joint', values: ND.NDC_AC.map((x) => x.value) },
      { dom: 'dcl-skeleton', arg: 'skeleton', kind: 'enum', label: 'Skeletal maturity', values: ND.NDC_SKELETON.map((x) => x.value) },
    ],
  },
];
