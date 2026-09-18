// spec-v1389: MCP adapter. The dom keys mirror views/group-v1389.js and this tile's META example.

import * as C5 from '../../lib/ca-5150-hold-timeline-v1389.js';

export default [
  {
    id: 'ca-5150-hold-timeline',
    summary: "California 5150 hold timeline, where a 5250 certification starts a new 14-day clock with its own review hearing. Under Welfare and Institutions Code 5150 the hold lasts up to 72 hours from the time the person is first detained. A 5250 certification allows up to 14 days of intensive treatment, with a certification review hearing within 4 days of certification (5256); a person still held under 5150 without certification gets a hearing within 7 days of initial detention (5256(b)). After the 14 days, up to 14 more for an imminent threat of suicide (5260), or up to 30 more for grave disability where the county has adopted it (5270.15).",
    compute: C5.ca5150HoldTimeline,
    fields: [
      { dom: 'c5-detained', arg: 'detained', kind: 'string', required: true, label: 'First detained (YYYY-MM-DDTHH:MM)' },
      { dom: 'c5-criterion', arg: 'criterion', kind: 'enum', required: true, label: 'Criterion', values: C5.CRITERIA.map((c) => c.value) },
      { dom: 'c5-certified', arg: 'certified', kind: 'string', label: 'Certified under 5250 (YYYY-MM-DDTHH:MM)' },
      { dom: 'c5-suicide', arg: 'suicideThreat', kind: 'enum', label: 'Threatened or attempted suicide (5260)', values: C5.YES_NO_UNKNOWN.map((c) => c.value) },
      { dom: 'c5-county30', arg: 'county30', kind: 'enum', label: 'County adopted the 30-day certification (5270.15)', values: C5.YES_NO_UNKNOWN.map((c) => c.value) },
    ],
  },
];
