// spec-v1400: MCP adapter. The dom keys mirror views/group-v1400.js and this tile's META example.

import * as HB from '../../lib/hbv-serology-v1400.js';

export default [
  {
    id: 'hbv-serology',
    summary: "Hepatitis B serology interpreter from CDC's table: HBsAg, total anti-HBc, IgM anti-HBc, and anti-HBs, each positive, negative, or not done. It reads susceptible, immune from vaccination, immune from natural infection, acute infection, or chronic infection, and for an ISOLATED anti-HBc it prints all four possibilities (resolved infection with waned anti-HBs, false-positive anti-HBc, low-level chronic infection, resolving acute infection) rather than calling it immunity. A marker not done is not treated as negative: the result names what the panel cannot distinguish without it. CDC 2023 recommends the triple panel (HBsAg, anti-HBs, total anti-HBc) at least once for every adult 18 or older.",
    compute: HB.hbvSerology,
    fields: [
      { dom: 'hbv-hbsag', arg: 'hbsag', kind: 'enum', required: true, label: 'HBsAg', values: HB.MARKER.map((a) => a.value) },
      { dom: 'hbv-antihbc', arg: 'antiHbc', kind: 'enum', required: true, label: 'Total anti-HBc', values: HB.MARKER.map((a) => a.value) },
      { dom: 'hbv-igm', arg: 'igmAntiHbc', kind: 'enum', required: true, label: 'IgM anti-HBc', values: HB.MARKER.map((a) => a.value) },
      { dom: 'hbv-antihbs', arg: 'antiHbs', kind: 'enum', required: true, label: 'Anti-HBs', values: HB.MARKER.map((a) => a.value) },
    ],
  },
];
