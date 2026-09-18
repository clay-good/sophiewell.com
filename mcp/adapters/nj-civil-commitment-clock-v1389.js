// spec-v1389: MCP adapter. The dom keys mirror views/group-v1389.js and this tile's META example.

import * as NJ from '../../lib/nj-civil-commitment-clock-v1389.js';

export default [
  {
    id: 'nj-civil-commitment-clock',
    summary: 'New Jersey civil commitment deadlines, where the 72 hours start at the screening certificate and not at arrival. A person referred by a screening service may not be held more than 72 hours from completion of the screening certificate without a temporary commitment order (N.J.S.A. 30:4-27.10). Two certificates are needed, at least one by a psychiatrist, and no certifier may be a relative by blood or marriage; each check is answered yes, no, or not assessed. The final hearing is within 20 days of initial commitment (30:4-27.12). A voluntary patient who asks to leave is discharged within 48 hours or at the end of the next working day, whichever is longer (30:4-27.20). The 30:4-27.9a continued hold is not offered.',
    compute: NJ.njCivilCommitmentClock,
    fields: [
      { dom: 'njc-mode', arg: 'mode', kind: 'enum', required: true, label: 'Route', values: NJ.NJ_MODES.map((m) => m.value) },
      { dom: 'njc-start', arg: 'start', kind: 'string', label: 'Screening certificate completed, or discharge requested (YYYY-MM-DDTHH:MM)' },
      { dom: 'njc-committed', arg: 'committed', kind: 'string', label: 'Initial commitment date (YYYY-MM-DD)' },
      { dom: 'njc-psych', arg: 'psychiatrist', kind: 'enum', label: 'At least one certificate by a psychiatrist', values: NJ.MET_OR_NOT.map((m) => m.value) },
      { dom: 'njc-relative', arg: 'relative', kind: 'enum', label: 'Any certifier a relative by blood or marriage', values: NJ.MET_OR_NOT.map((m) => m.value) },
    ],
  },
];
