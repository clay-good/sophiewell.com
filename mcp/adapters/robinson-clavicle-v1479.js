// spec-v1479: MCP adapter. The dom keys mirror views/group-v1479.js and this tile's META example.

import * as RB from '../../lib/robinson-clavicle-v1479.js';

export default [
  {
    id: 'robinson-clavicle',
    summary: 'Robinson (Edinburgh) classification of adult clavicle fractures by site, displacement, joint extension and comminution: twelve subtypes from 1A1 to 3B2.',
    compute: RB.robinsonClavicle,
    fields: [
      { dom: 'rob-region', arg: 'region', kind: 'enum', required: true, values: ['1', '2', '3'], label: 'Site: 1 medial fifth, 2 diaphysis, 3 lateral fifth' },
      { dom: 'rob-disp', arg: 'displacement', kind: 'enum', required: true, values: ['A', 'B'], label: 'A undisplaced or aligned, B displaced' },
      { dom: 'rob-artic', arg: 'articular', kind: 'enum', required: false, values: ['1', '2'], label: 'Medial or lateral fifth: 1 extra-articular, 2 intra-articular' },
      { dom: 'rob-shaft-a', arg: 'shaftAligned', kind: 'enum', required: false, values: ['1', '2'], label: 'Aligned shaft: 1 undisplaced, 2 angulated' },
      { dom: 'rob-shaft-b', arg: 'shaftDisplaced', kind: 'enum', required: false, values: ['1', '2'], label: 'Displaced shaft: 1 simple or wedge comminuted, 2 segmental' },
    ],
  },
];
