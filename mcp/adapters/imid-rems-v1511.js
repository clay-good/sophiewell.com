// spec-v1511: MCP adapter for the lenalidomide REMS fill window. The dom keys mirror views/group-v1511.js.

import * as IR from '../../lib/imid-rems-v1511.js';

const vals = (xs) => xs.map((x) => x.value);

export default [
  {
    id: 'imid-rems-fill-window',
    summary: 'Whether lenalidomide may be dispensed under its REMS, and until when. The 7-day or 30-day authorization, the 7-days-left rule and the next pregnancy test.',
    compute: IR.imidRemsFillWindow,
    fields: [
      { dom: 'len-cat', arg: 'category', kind: 'enum', required: true, values: vals(IR.CATEGORIES), label: 'Patient risk category' },
      { dom: 'len-anchor', arg: 'anchorDate', kind: 'string', required: true, label: 'Last pregnancy test date, or the authorization issue date for other patients (YYYY-MM-DD)' },
      { dom: 'len-sub', arg: 'subsequent', kind: 'enum', required: false, values: vals(IR.YES_NO), label: 'A subsequent prescription' },
      { dom: 'len-left', arg: 'daysLeft', kind: 'number', required: false, label: 'Days of therapy remaining on the current prescription' },
      { dom: 'len-start', arg: 'therapyStart', kind: 'string', required: false, label: 'Therapy start date (YYYY-MM-DD)' },
      { dom: 'len-cycles', arg: 'cycles', kind: 'enum', required: false, values: vals(IR.CYCLES), label: 'Menstrual cycles' },
      { dom: 'len-check', arg: 'checkDate', kind: 'string', required: false, label: 'Date to check (YYYY-MM-DD; blank for today)' },
    ],
  },
];
