// spec-v1396: MCP adapter. The dom keys mirror views/group-v1396.js and this tile's META example.
// Times are local wall-clock 'YYYY-MM-DDTHH:MM'; the tile never reads the clock.

import * as WPV from '../../lib/ca-wpv-report-clock-v1396.js';

const YN = ['yes', 'no'];

export default [
  {
    id: 'ca-wpv-report-clock',
    summary: 'Says whether a California hospital must report a workplace violence incident to Cal/OSHA (8 CCR 3342(g)), and by when. Physical force by a patient or companion, or any firearm or dangerous weapon, is reportable. The deadline is 24 hours for a qualifying injury, a weapon, or an urgent threat, and 72 hours otherwise. The incident type (1 to 4) comes from who committed it.',
    compute: WPV.caWpvReportClock,
    fields: [
      { dom: 'wpv-who', arg: 'perpetrator', kind: 'enum', required: true, label: 'Who committed the violence', values: WPV.PERPETRATORS.map((p) => p.value) },
      { dom: 'wpv-force', arg: 'force', kind: 'enum', required: true, label: 'Physical force against an employee', values: YN },
      { dom: 'wpv-weapon', arg: 'weapon', kind: 'enum', required: true, label: 'Firearm or other dangerous weapon', values: YN },
      { dom: 'wpv-severe', arg: 'severe', kind: 'enum', required: true, label: 'Death, admission over 24 h, lost member, or disfigurement', values: YN },
      { dom: 'wpv-urgent', arg: 'urgent', kind: 'enum', required: true, label: 'Realistic possibility of death or serious harm', values: YN },
      { dom: 'wpv-known', arg: 'knownAt', kind: 'string', required: true, label: 'Hospital knew (YYYY-MM-DDTHH:MM)' },
    ],
  },
];
