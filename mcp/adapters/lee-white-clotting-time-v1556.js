// spec-v1556 MCP adapter: lee-white-clotting-time in lib/lee-white-clotting-time-v1556.js.
// The dom keys mirror views/group-v1556.js and META['lee-white-clotting-time'].example. Clinical domain.

import * as M from '../../lib/lee-white-clotting-time-v1556.js';

export default [
  {
    id: 'lee-white-clotting-time',
    summary: 'Reads a Lee-White clotting time after a snakebite (Brazil). Normal up to 9 minutes, prolonged 10-30, incoagulable over 30; it is not the 20WBCT.',
    compute: M.leeWhiteClottingTime,
    fields: [
      { dom: 'lw-min', arg: 'minutes', kind: 'number', required: true, label: 'Clotting time, whole minutes', min: 0, max: 120 },
      { dom: 'lw-proto', arg: 'protocol', kind: 'enum', label: 'Done by the method (two glass tubes, 1 mL each, 37 C bath, read each minute from 5)', values: M.YES_NO.map((d) => d.value) },
    ],
  },
];
