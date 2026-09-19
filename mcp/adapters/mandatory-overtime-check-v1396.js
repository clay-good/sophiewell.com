// spec-v1396: MCP adapter. The dom keys mirror views/group-v1396.js and this tile's META example.

import * as OT from '../../lib/mandatory-overtime-check-v1396.js';

export default [
  {
    id: 'mandatory-overtime-check',
    summary: 'Says whether a hospital may require a nurse to work overtime in New York, New Jersey, or Texas. New York (Labor Law 167) and Texas (HSC 258.004) allow it only for a health care disaster, a declared emergency, an unforeseen emergency that does not regularly occur, or an ongoing procedure. New Jersey allows it only as a last resort in an unforeseeable emergent circumstance. Chronic short staffing is never an exception.',
    compute: OT.mandatoryOvertimeCheck,
    fields: [
      { dom: 'ot-state', arg: 'state', kind: 'enum', required: true, label: 'State', values: OT.OT_STATES.map((s) => s.value) },
      { dom: 'ot-situation', arg: 'situation', kind: 'enum', required: true, label: 'Situation', values: OT.SITUATIONS.map((s) => s.value) },
      { dom: 'ot-voluntary', arg: 'voluntaryTried', kind: 'enum', label: 'Employer first tried to cover it voluntarily', values: ['yes', 'no'] },
    ],
  },
];
