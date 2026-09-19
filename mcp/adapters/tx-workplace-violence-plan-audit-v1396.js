// spec-v1396: MCP adapter. The dom keys mirror views/group-v1396.js and this tile's META example.

import * as TXWV from '../../lib/tx-workplace-violence-plan-audit-v1396.js';

export default [
  {
    id: 'tx-workplace-violence-plan-audit',
    summary: 'Audits a Texas facility\'s workplace violence committee and plan against HSC 331.002 and 331.004 (SB 240, 2023). It covers the committee members, the eight required plan elements, the annual review, and a copy for staff on request. A blank item is never counted as present.',
    compute: TXWV.txWorkplaceViolencePlanAudit,
    fields: [
      { dom: 'txwv-rn', arg: 'rn', kind: 'enum', label: '331.002(b)(1) a direct-care registered nurse on the committee', values: TXWV.STATUS.map((s) => s.value) },
      { dom: 'txwv-physician', arg: 'physician', kind: 'enum', label: '331.002(b)(2) a direct-care physician on the committee', values: TXWV.STATUS.map((s) => s.value) },
      { dom: 'txwv-security', arg: 'security', kind: 'enum', label: '331.002(b)(3) a security employee on the committee', values: TXWV.STATUS.map((s) => s.value) },
      { dom: 'txwv-setting', arg: 'setting', kind: 'enum', label: '331.004(b)(1) the plan is based on the practice setting', values: TXWV.STATUS.map((s) => s.value) },
      { dom: 'txwv-definition', arg: 'definition', kind: 'enum', label: '331.004(b)(2) a definition covering threats and acts of physical', values: TXWV.STATUS.map((s) => s.value) },
      { dom: 'txwv-training', arg: 'training', kind: 'enum', label: '331.004(b)(3) at least annual prevention training for direct-care', values: TXWV.STATUS.map((s) => s.value) },
      { dom: 'txwv-response', arg: 'response', kind: 'enum', label: '331.004(b)(4) a system for responding to and investigating incidents', values: TXWV.STATUS.map((s) => s.value) },
      { dom: 'txwv-security-plan', arg: 'security-plan', kind: 'enum', label: '331.004(b)(5) physical security and safety addressed', values: TXWV.STATUS.map((s) => s.value) },
      { dom: 'txwv-input', arg: 'input', kind: 'enum', label: '331.004(b)(6) staff input solicited in developing the plan', values: TXWV.STATUS.map((s) => s.value) },
      { dom: 'txwv-reporting', arg: 'reporting', kind: 'enum', label: '331.004(b)(7) reporting through the existing occurrence reporting', values: TXWV.STATUS.map((s) => s.value) },
      { dom: 'txwv-reassign', arg: 'reassign', kind: 'enum', label: '331.004(b)(8) reassignment away from a patient who abused or', values: TXWV.STATUS.map((s) => s.value) },
      { dom: 'txwv-review', arg: 'review', kind: 'enum', label: '331.004(d) annual committee review with a report to the governing body', values: TXWV.STATUS.map((s) => s.value) },
      { dom: 'txwv-copy', arg: 'copy', kind: 'enum', label: '331.004(e) a copy available to staff on request', values: TXWV.STATUS.map((s) => s.value) },
    ],
  },
];
