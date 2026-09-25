// spec-v1431: MCP adapter. The dom keys mirror views/group-v1431.js and this tile's META example.

import * as WS from '../../lib/watson-slac-v1431.js';

export default [
  {
    id: 'watson-slac',
    summary: 'Stages scapholunate advanced collapse (SLAC) wrist arthritis from 1 to 4 by which joints show arthritis on the radiograph. Radioscaphoid, then capitolunate, then radiolunate involvement sets the stage; a pattern off that sequence is reported, not forced.',
    compute: WS.watsonSlac,
    fields: [
      { dom: 'wslac-rs', arg: 'radioscaphoid', kind: 'enum', required: true, label: 'Radioscaphoid joint', values: WS.WSLAC_RADIOSCAPHOID.map((x) => x.value) },
      { dom: 'wslac-cl', arg: 'capitolunate', kind: 'enum', required: true, label: 'Capitolunate joint', values: WS.WSLAC_YESNO.map((x) => x.value) },
      { dom: 'wslac-rl', arg: 'radiolunate', kind: 'enum', required: true, label: 'Radiolunate joint', values: WS.WSLAC_YESNO.map((x) => x.value) },
    ],
  },
];
