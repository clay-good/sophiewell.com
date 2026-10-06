// spec-v1558 MCP adapter: WHO 2025 postpartum hemorrhage criteria and tranexamic acid in lib/pph-who-2025-v1558.js.
// The dom keys mirror views/group-v1558.js and META['pph-who-2025'].example. Clinical domain.

import * as P from '../../lib/pph-who-2025-v1558.js';

export default [
  {
    id: 'pph-who-2025',
    summary: 'Checks a bleed after birth against WHO 2025 postpartum hemorrhage criteria. Measured loss of 300 mL with an abnormal sign, or 500 mL, within 24 hours starts the bundle; it also says whether tranexamic acid is still within 3 hours or a second dose is due.',
    compute: P.pphWho2025,
    fields: [
      { dom: 'pph-loss', arg: 'loss', kind: 'number', required: true, label: 'Measured blood loss in mL', min: 0, max: 5000 },
      { dom: 'pph-hours', arg: 'hours', kind: 'number', required: true, label: 'Hours since birth', min: 0, max: 72 },
      { dom: 'pph-pulse', arg: 'pulse', kind: 'number', label: 'Pulse per minute', min: 20, max: 250 },
      { dom: 'pph-sbp', arg: 'sbp', kind: 'number', label: 'Systolic pressure, mmHg', min: 30, max: 260 },
      { dom: 'pph-dbp', arg: 'dbp', kind: 'number', label: 'Diastolic pressure, mmHg', min: 10, max: 200 },
      { dom: 'pph-txa', arg: 'txa', kind: 'enum', label: 'Tranexamic acid already given', values: P.YES_NO.map((d) => d.value) },
      { dom: 'pph-txamin', arg: 'txaMinutes', kind: 'number', label: 'Minutes since the first tranexamic acid dose', min: 0, max: 4320 },
      { dom: 'pph-bleeding', arg: 'bleeding', kind: 'enum', label: 'Bleeding now', values: P.BLEEDING_OPTIONS.map((d) => d.value) },
    ],
  },
];
