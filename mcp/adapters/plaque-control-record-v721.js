// spec-v721 MCP adapter: Plaque Control Record in lib/plaque-control-record-v721.js.
// The dom keys mirror the browser renderer (views/group-v721.js) and
// META['plaque-control-record'].example. Two counts (teeth present, plaque-positive
// surfaces); a percentage maps to an oral-hygiene band. Clinical domain.

import { plaqueControlRecord } from '../../lib/plaque-control-record-v721.js';

export default [
  {
    id: 'plaque-control-record',
    summary: "Plaque Control Record (O'Leary 1972): percent of tooth surfaces with plaque at the gingival margin = (plaque-positive surfaces / total surfaces) x 100, where total = 4 surfaces x teeth present. A record <= 10% is good plaque control; higher indicates a need to improve oral hygiene (some references use a 20% target). Tracks oral-hygiene performance.",
    compute: plaqueControlRecord,
    fields: [
      { dom: 'pcr-teeth', arg: 'teethPresent', kind: 'number', required: true, label: 'Number of teeth present (1-32)' },
      { dom: 'pcr-surfaces', arg: 'plaqueSurfaces', kind: 'number', required: true, label: 'Plaque-positive surfaces (4 checked per tooth)' },
    ],
  },
];
