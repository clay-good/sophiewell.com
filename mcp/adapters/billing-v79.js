// spec-v629 wave 4: adapters for the lib/billing-v79.js claim-edit engines
// (non-clinical / administrative). These are verdict engines, not money math:
// the caller supplies the published edit indicator / value and gets the ruling.
// No CMS tables ship, so nothing time-varying is embedded; global-period is
// deterministic given the two explicit dates (it reads no clock).
// modifier-x-selector is deferred: its inputs are HTML-checkbox 'on' values,
// which the shared bool validator does not yet accept.

import * as C from '../../lib/billing-v79.js';

export default [
  {
    id: 'ncci-ptp',
    summary: 'NCCI Procedure-to-Procedure edit check: whether a code pair can be reported together, and by the modifier indicator whether an NCCI-associated modifier may bypass the edit.',
    compute: C.ncciPtp,
    fields: [
      { dom: 'ncci-a', arg: 'codeA', kind: 'string', required: true, label: 'Code A (HCPCS/CPT)' },
      { dom: 'ncci-b', arg: 'codeB', kind: 'string', required: true, label: 'Code B (HCPCS/CPT)' },
      { dom: 'ncci-col', arg: 'column1', kind: 'string', label: 'Which code is column 1 (a, b, or unknown)' },
      { dom: 'ncci-ind', arg: 'modifierIndicator', kind: 'number', required: true, label: 'PTP modifier indicator (0 never bypass, 1 may bypass, 9 not applicable)' },
      { dom: 'ncci-mod', arg: 'proposedModifier', kind: 'string', label: 'Proposed modifier, e.g. 59 or XS' },
    ],
  },
  {
    id: 'mue-check',
    summary: 'Medically Unlikely Edit check: units billed vs the MUE value under the MAI (1 line-edit, 2 date-of-service absolute, 3 per-visit), giving payable units and whether the excess is rescuable.',
    compute: C.mueCheck,
    fields: [
      { dom: 'mue-units', arg: 'unitsBilled', kind: 'number', required: true, label: 'Units billed' },
      { dom: 'mue-value', arg: 'mueValue', kind: 'number', required: true, label: 'MUE value (the ceiling)' },
      { dom: 'mue-mai', arg: 'mai', kind: 'number', required: true, label: 'MUE Adjudication Indicator (1, 2, or 3)' },
      { dom: 'mue-split', arg: 'splitAcrossLines', kind: 'bool', label: 'Units split across multiple lines' },
    ],
  },
  {
    id: 'global-period',
    summary: 'Surgical global-period check: whether a subsequent-service date falls inside the global window and, by the nature of the service, whether it is separately billable and with which modifier.',
    compute: C.globalPeriod,
    fields: [
      { dom: 'gp-surg', arg: 'surgeryDate', kind: 'string', required: true, label: 'Surgery date (YYYY-MM-DD)' },
      { dom: 'gp-glob', arg: 'globalDays', kind: 'string', required: true, label: 'Global period (000, 010, 090, or XXX/YYY/ZZZ)' },
      { dom: 'gp-sub', arg: 'subsequentDate', kind: 'string', required: true, label: 'Subsequent service date (YYYY-MM-DD)' },
      { dom: 'gp-nat', arg: 'nature', kind: 'string', label: 'Nature of the subsequent service, e.g. unrelated-em, related, staged' },
    ],
  },
  {
    id: 'modifier-order',
    summary: 'Orders CPT/HCPCS modifiers on the claim line: pricing (payment-affecting) modifiers first, then informational/statistical, flagging conflicts and unrecognized modifiers.',
    compute: C.modifierOrder,
    fields: [
      { dom: 'mo-1', arg: 'm1', kind: 'string', required: true, label: 'Modifier 1' },
      { dom: 'mo-2', arg: 'm2', kind: 'string', label: 'Modifier 2' },
      { dom: 'mo-3', arg: 'm3', kind: 'string', label: 'Modifier 3' },
      { dom: 'mo-4', arg: 'm4', kind: 'string', label: 'Modifier 4' },
    ],
    // The lib takes a modifiers array; collect the non-empty slots in order.
    toArgs: (i) => ({
      modifiers: ['mo-1', 'mo-2', 'mo-3', 'mo-4']
        .map((k) => i[k])
        .filter((v) => v !== undefined && v !== null && String(v).trim() !== '')
        .map((v) => String(v).trim()),
    }),
  },
];
