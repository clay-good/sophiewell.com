// spec-v1392: MCP adapter. The dom keys mirror views/group-v1392.js and this tile's META example.
// Dates are 'YYYY-MM-DD' and times 'YYYY-MM-DDTHH:MM'; the tile never reads the clock.

import * as NJD from '../../lib/nj-death-religious-exemption-v1392.js';

export default [
  {
    id: 'nj-death-religious-exemption',
    summary: 'Applies New Jersey\'s religious exemption to declaring death on neurological criteria (N.J.S.A. 26:6A-5). When the physician has reason to believe, from the records, the family, or anyone who knows the person\'s beliefs, that a neurological declaration would violate them, death is declared and timed on cardiorespiratory criteria only.',
    compute: NJD.njDeathReligiousExemption,
    fields: [
      { dom: 'njd-belief', arg: 'belief', kind: 'enum', required: true, label: 'Reason to believe it would violate their religious beliefs', values: NJD.BELIEF.map((b) => b.value) },
      { dom: 'njd-source', arg: 'source', kind: 'enum', label: 'Where that information came from', values: NJD.SOURCES.map((s) => s.value) },
    ],
  },
];
