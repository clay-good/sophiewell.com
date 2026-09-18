// spec-v1393: MCP adapter. The dom keys mirror views/group-v1393.js and this tile's META example.

import * as DEL from '../../lib/tx-aprn-pa-controlled-delegation-v1393.js';

export default [
  {
    id: 'tx-aprn-pa-controlled-delegation',
    summary: "Whether a Texas physician may delegate this controlled-substance prescription to an APRN or physician assistant. Under Occupations Code section 157.0511, Schedules III to V may be delegated for up to 90 days including refills, with a consultation noted in the chart for a refill or for a child younger than 2. Schedule II may be delegated only in a hospital facility-based practice under medical-staff policy, for a patient admitted for an intended stay of 24 hours or more or in the emergency department, or under a hospice plan of care; in a clinic it cannot be delegated at all. Conditions not yet answered print as not assessed.",
    compute: DEL.txAprnPaControlledDelegation,
    fields: [
      { dom: 'del-schedule', arg: 'schedule', kind: 'enum', required: true, label: 'Schedule', values: DEL.SCHEDULES.map((s) => s.value) },
      { dom: 'del-setting', arg: 'setting', kind: 'enum', required: true, label: 'Setting', values: DEL.SETTINGS.map((s) => s.value) },
      { dom: 'del-days', arg: 'days', kind: 'number', required: true, label: 'Days covered, including refills' },
      { dom: 'del-refill', arg: 'refill', kind: 'enum', required: true, label: 'Is this a refill', values: ['yes', 'no'] },
      { dom: 'del-refill-c', arg: 'refillConsulted', kind: 'enum', label: 'Delegating physician consulted on the refill', values: DEL.YES_NO_UNKNOWN.map((s) => s.value) },
      { dom: 'del-under2', arg: 'under2', kind: 'enum', required: true, label: 'Patient younger than 2', values: ['yes', 'no'] },
      { dom: 'del-under2-c', arg: 'under2Consulted', kind: 'enum', label: 'Delegating physician consulted (child under 2)', values: DEL.YES_NO_UNKNOWN.map((s) => s.value) },
      { dom: 'del-policy', arg: 'hospitalPolicy', kind: 'enum', label: 'Medical-staff policy for Schedule II delegation (hospital)', values: DEL.YES_NO_UNKNOWN.map((s) => s.value) },
    ],
  },
];
