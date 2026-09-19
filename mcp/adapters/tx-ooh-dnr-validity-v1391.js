// spec-v1391: MCP adapter. The dom keys mirror views/group-v1391.js and this tile's META example.
// A blank answer is "not answered", never "no".

import * as OOH from '../../lib/tx-ooh-dnr-validity-v1391.js';

export default [
  {
    id: 'tx-ooh-dnr-validity',
    summary: 'Checks whether a Texas out-of-hospital DNR order was validly executed and is still in force, naming the element that fails. It covers the person signing with two witnesses (one qualified) or a notary, and the physician\'s signature. It also covers a proxy, agent, guardian, or qualified relative signing, and a parent for a minor with a terminal or irreversible diagnosis. The person may revoke it at any time regardless of competency, and a competent person\'s present wish supersedes it.',
    compute: OOH.txOohDnrValidity,
    fields: [
      { dom: 'ooh-executor', arg: 'executor', kind: 'enum', required: true, label: 'Who executed it', values: OOH.EXECUTORS.map((e) => e.value) },
      { dom: 'ooh-witnessing', arg: 'witnessing', kind: 'enum', required: true, label: 'Witnessing', values: OOH.WITNESSING.map((w) => w.value) },
      { dom: 'ooh-physician', arg: 'physicianSigned', kind: 'enum', required: true, label: 'The attending physician signed it', values: ['yes', 'no'] },
      { dom: 'ooh-revoked', arg: 'revoked', kind: 'enum', required: true, label: 'Revoked, or a contrary wish expressed now', values: ['yes', 'no'] },
      { dom: 'ooh-terminal', arg: 'terminalDx', kind: 'enum', label: 'Minor: terminal or irreversible diagnosis', values: ['yes', 'no'] },
      { dom: 'ooh-concurred', arg: 'concurred', kind: 'enum', label: 'No relative: a second physician concurred', values: ['yes', 'no'] },
    ],
  },
];
