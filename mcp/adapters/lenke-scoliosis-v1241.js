// spec-v1241: MCP adapter. The dom keys mirror views/group-v1241.js and this tile's META example.
// Every measurement is required and envelope-guarded: the type is derived from the relationships
// between them, so one missing or mistyped angle does not make the answer approximate, it makes it
// a different type.

import { lenkeScoliosis, LENKE_CSVL } from '../../lib/lenke-scoliosis-v1241.js';

export default [
  {
    id: 'lenke-scoliosis',
    summary: 'Lenke classification of adolescent idiopathic scoliosis derives the curve type 1 to 6 from which regional curves are structural. A minor curve is structural when it bends out to 25 degrees or more, or when its region is kyphotic by 20 degrees or more, and the major curve, the largest standing Cobb angle, is structural by definition. The answer carries a lumbar spine modifier A, B or C from where the center sacral vertical line falls at the lumbar apex, and a thoracic sagittal modifier from the T5 to T12 kyphosis. Type 3 against type 6 is the pair this is read wrongly on, since type 6 needs the thoracolumbar curve to exceed the main thoracic by at least 5 degrees rather than merely to be larger. A curve pattern whose largest curve is the proximal thoracic one has no Lenke type, and this says so rather than naming the nearest.',
    compute: lenkeScoliosis,
    fields: [
      { dom: 'lenke-ptCobb', arg: 'ptCobb', kind: 'number', required: true, label: 'Proximal thoracic Cobb angle, standing (degrees)' },
      { dom: 'lenke-mtCobb', arg: 'mtCobb', kind: 'number', required: true, label: 'Main thoracic Cobb angle, standing (degrees)' },
      { dom: 'lenke-tlCobb', arg: 'tlCobb', kind: 'number', required: true, label: 'Thoracolumbar/lumbar Cobb angle, standing (degrees)' },
      { dom: 'lenke-ptBend', arg: 'ptBend', kind: 'number', required: true, label: 'Proximal thoracic Cobb angle on side bending (degrees)' },
      { dom: 'lenke-mtBend', arg: 'mtBend', kind: 'number', required: true, label: 'Main thoracic Cobb angle on side bending (degrees)' },
      { dom: 'lenke-tlBend', arg: 'tlBend', kind: 'number', required: true, label: 'Thoracolumbar/lumbar Cobb angle on side bending (degrees)' },
      { dom: 'lenke-t2t5', arg: 't2t5', kind: 'number', required: true, label: 'T2 to T5 kyphosis (degrees)' },
      { dom: 'lenke-t10l2', arg: 't10l2', kind: 'number', required: true, label: 'T10 to L2 kyphosis (degrees)' },
      { dom: 'lenke-t5t12', arg: 't5t12', kind: 'number', required: true, label: 'T5 to T12 kyphosis (degrees)' },
      { dom: 'lenke-csvl', arg: 'csvl', kind: 'enum', required: true, label: 'Center sacral vertical line at the lumbar apex', values: LENKE_CSVL.map((c) => c.value) },
    ],
  },
];
