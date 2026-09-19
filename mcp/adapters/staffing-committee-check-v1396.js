// spec-v1396: MCP adapter. The dom keys mirror views/group-v1396.js and this tile's META example.

import * as SC from '../../lib/staffing-committee-check-v1396.js';

export default [
  {
    id: 'staffing-committee-check',
    summary: 'Checks a New York or Texas hospital nurse staffing committee\'s makeup and schedule against the statute. New York (PHL 2805-t) needs at least half frontline RNs, LPNs, and ancillary staff chosen by peers or their bargaining agreement, and an annual plan by July 1. Texas (HSC 257.004) needs at least 60% direct-care RNs chosen by peers, the CNO voting, quarterly meetings, and semiannual evaluation and reporting.',
    compute: SC.staffingCommitteeCheck,
    fields: [
      { dom: 'sc-state', arg: 'state', kind: 'enum', required: true, label: 'State', values: SC.SC_STATES.map((s) => s.value) },
      { dom: 'sc-members', arg: 'members', kind: 'number', required: true, label: 'Committee members' },
      { dom: 'sc-frontline', arg: 'frontline', kind: 'number', required: true, label: 'Frontline members (NY) or direct-care RNs (TX)' },
      { dom: 'sc-peer', arg: 'peerSelected', kind: 'enum', label: 'Chosen by peers or bargaining agreement', values: ['yes', 'no'] },
      { dom: 'sc-july', arg: 'planByJuly', kind: 'enum', label: 'NY: plan produced by July 1', values: ['yes', 'no'] },
      { dom: 'sc-cno', arg: 'cnoVoting', kind: 'enum', label: 'TX: CNO is a voting member', values: ['yes', 'no'] },
      { dom: 'sc-quarterly', arg: 'quarterly', kind: 'enum', label: 'TX: met every quarter', values: ['yes', 'no'] },
      { dom: 'sc-semiannual', arg: 'semiannual', kind: 'enum', label: 'TX: semiannual evaluation and report', values: ['yes', 'no'] },
    ],
  },
];
