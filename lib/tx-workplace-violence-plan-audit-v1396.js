// spec-v1396: Texas workplace violence prevention plan audit, Health & Safety Code 331.002-331.004
// (SB 240, 2023).
//
// Source: official mirror tcss.legis.texas.gov, HSC ch. 331, read 2026-09-19.
//   331.002(b) The committee includes at least a direct-care RN; a direct-care physician (not required
//     where 331.001(3)(A) applies and no such physician is on staff); and an employee who provides
//     security, if any and if practicable.
//   331.004(b) The plan must (1) be based on the practice setting; (2) define workplace violence to
//     include an act or threat of physical force likely to cause physical injury or psychological
//     trauma, and any incident with a firearm or dangerous weapon; (3) require at least annual
//     prevention training for direct-care staff; (4) prescribe a system for responding to and
//     investigating incidents; (5) address physical security and safety; (6) solicit information from
//     providers and employees in developing it; (7) allow reporting through the existing occurrence
//     reporting system; (8) require adjusting assignments, to the extent practicable, so a provider is
//     not assigned a patient who intentionally abused or threatened them.
//   331.004(d) The committee reviews the plan and reports to the governing body at least annually;
//     (e) a copy is available to staff on request.
//
// Pure: no DOM, no clock, no network.

import { scopeSentence } from './state-calendar.js';

export const TXWV_VERIFIED = '2026-09-19';
export const STATUS = [
  { value: 'yes', text: 'Present' },
  { value: 'no', text: 'Missing' },
];
export const ITEMS = [
  ['rn', '331.002(b)(1)', 'a direct-care registered nurse on the committee'],
  ['physician', '331.002(b)(2)', 'a direct-care physician on the committee (unless the facility has none on staff)'],
  ['security', '331.002(b)(3)', 'a security employee on the committee, if any and if practicable'],
  ['setting', '331.004(b)(1)', 'the plan is based on the practice setting'],
  ['definition', '331.004(b)(2)', 'a definition covering threats and acts of physical force and any firearm or dangerous weapon'],
  ['training', '331.004(b)(3)', 'at least annual prevention training for direct-care staff'],
  ['response', '331.004(b)(4)', 'a system for responding to and investigating incidents'],
  ['security-plan', '331.004(b)(5)', 'physical security and safety addressed'],
  ['input', '331.004(b)(6)', 'staff input solicited in developing the plan'],
  ['reporting', '331.004(b)(7)', 'reporting through the existing occurrence reporting system'],
  ['reassign', '331.004(b)(8)', 'reassignment away from a patient who abused or threatened the provider'],
  ['review', '331.004(d)', 'annual committee review with a report to the governing body'],
  ['copy', '331.004(e)', 'a copy available to staff on request'],
];

export function txWorkplaceViolencePlanAudit(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const rows = ITEMS.map(([k, ref, label]) => ({ ref, label, v: o[k] === 'yes' || o[k] === 'no' ? o[k] : null }));
  const missing = rows.filter((r) => r.v === 'no').map((r) => `${r.ref} ${r.label}`);
  const open = rows.filter((r) => r.v === null).map((r) => `${r.ref} ${r.label}`);
  const lines = rows.map((r) => `${r.ref} ${r.label}: ${r.v === 'yes' ? 'present' : r.v === 'no' ? 'missing' : 'not checked'}`);
  let bandLabel;
  let band;
  if (missing.length) {
    bandLabel = `Missing: ${missing.length}`;
    band = `The plan or committee is missing: ${missing.join('; ')}.${open.length ? ` Not yet checked: ${open.length} item${open.length === 1 ? '' : 's'}.` : ''}`;
  } else if (open.length) {
    bandLabel = `Incomplete: ${open.length} of ${ITEMS.length} items not checked`;
    band = `Not decided. Still to check: ${open.join('; ')}.`;
  } else {
    bandLabel = 'Complete';
    band = `All ${ITEMS.length} committee and plan requirements of HSC 331.002 and 331.004 are present.`;
  }
  return {
    valid: true,
    complete: !missing.length && !open.length,
    abnormal: missing.length > 0,
    bandLabel,
    band,
    lines,
    postureNote: scopeSentence(TXWV_VERIFIED),
  };
}
