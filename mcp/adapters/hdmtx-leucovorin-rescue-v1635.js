// spec-v1635 MCP adapter: hdmtx-leucovorin-rescue in lib/hdmtx-leucovorin-rescue-v1635.js. The dom keys
// mirror views/group-v1635.js and META['hdmtx-leucovorin-rescue'].example. Clinical domain. Three
// label rows: Leucovorin Calcium for Injection, Methotrexate Injection, VORAXAZE.

import * as HL from '../../lib/hdmtx-leucovorin-rescue-v1635.js';

export default [
  {
    id: 'hdmtx-leucovorin-rescue',
    summary: 'Leucovorin rescue after high-dose methotrexate, matched to the leucovorin label\'s table. A level at 24, 48, 72 or 96 hours is matched to the normal, delayed late or delayed early row and its dose. A level at another hour, or in one of the table\'s gaps, is reported with its neighbors and is not classified. The table is for methotrexate 12 to 15 g/m² over 4 hours; protocol nomograms are not in it.',
    compute: (args) => HL.hdmtxLeucovorinRescue(args, new Date()),
    fields: [
      { dom: 'hlr-hours', arg: 'hours', kind: 'number', required: true, label: 'Hours since the methotrexate infusion started', unit: 'hours' },
      { dom: 'hlr-level', arg: 'level', kind: 'number', required: true, label: 'Serum methotrexate level' },
      { dom: 'hlr-unit', arg: 'levelUnit', kind: 'enum', required: true, values: HL.LEVEL_UNITS.map((x) => x.value), label: 'Level unit' },
      { dom: 'hlr-base-cr', arg: 'baselineCreatinine', kind: 'number', label: 'Baseline serum creatinine (optional; same unit as the current value)' },
      { dom: 'hlr-cur-cr', arg: 'currentCreatinine', kind: 'number', label: 'Current serum creatinine (optional)' },
      { dom: 'hlr-level72', arg: 'level72', kind: 'number', label: 'The 72-hour level, for a 96-hour level (optional)', unit: 'µmol/L' },
    ],
  },
];
