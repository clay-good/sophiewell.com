// spec-v1503: MCP adapter for the Medicaid managed care appeal clock. The dom keys mirror views/group-v1503.js.

import * as MD from '../../lib/medicaid-appeal-clock-v1503.js';

const vals = (list) => list.map((x) => x.value);

export default [
  {
    id: 'medicaid-appeal-clock',
    summary: 'Medicaid managed care appeal deadlines. Covers the plan appeal, keeping benefits during it, the plan decision and the state fair hearing (42 CFR 438).',
    compute: MD.medicaidAppealClock,
    fields: [
      { dom: 'mdc-notice', arg: 'noticeDate', kind: 'string', required: true, label: 'Date on the adverse benefit determination notice (YYYY-MM-DD)' },
      { dom: 'mdc-effective', arg: 'effectiveDate', kind: 'string', required: false, label: 'Intended effective date of the action (YYYY-MM-DD)' },
      { dom: 'mdc-received', arg: 'appealReceived', kind: 'string', required: false, label: 'Plan received the appeal (YYYY-MM-DD, or YYYY-MM-DDTHH:MM if expedited)' },
      { dom: 'mdc-type', arg: 'appealType', kind: 'enum', required: false, values: vals(MD.APPEAL_TYPES), label: 'Standard or expedited appeal' },
      { dom: 'mdc-extended', arg: 'extended', kind: 'enum', required: false, values: vals(MD.YES_NO), label: 'Plan took the 14-day extension' },
      { dom: 'mdc-resolution', arg: 'resolutionDate', kind: 'string', required: false, label: 'Date of the plan notice of resolution (YYYY-MM-DD)' },
      { dom: 'mdc-window', arg: 'stateWindow', kind: 'number', required: false, label: 'State fair hearing window, 90 to 120', unit: 'days' },
    ],
  },
];
