// spec-v1503: MCP adapter for the Medicare QIO fast-appeal clock. The dom keys mirror views/group-v1503.js.

import * as QI from '../../lib/qio-discharge-appeal-v1503.js';

const vals = (list) => list.map((x) => x.value);

export default [
  {
    id: 'qio-discharge-appeal-clock',
    summary: 'Medicare fast appeal to the QIO for a hospital discharge or ending services. Gives the request deadline, the QIO decision time and the liability protection (42 CFR 405.1200-405.1206).',
    compute: QI.qioDischargeAppealClock,
    fields: [
      { dom: 'qio-setting', arg: 'setting', kind: 'enum', required: true, values: vals(QI.SETTINGS), label: 'Hospital discharge or other services ending' },
      { dom: 'qio-key', arg: 'keyDate', kind: 'string', required: true, label: 'Planned discharge date, or date the notice was received (YYYY-MM-DD)' },
      { dom: 'qio-requested', arg: 'requested', kind: 'string', required: false, label: 'QIO received the request (YYYY-MM-DDTHH:MM)' },
      { dom: 'qio-end', arg: 'servicesEnd', kind: 'string', required: false, label: 'Date services are to end (YYYY-MM-DD)' },
    ],
  },
];
