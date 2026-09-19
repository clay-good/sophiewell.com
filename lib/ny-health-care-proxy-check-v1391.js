// spec-v1391: New York health care proxy execution check, Public Health Law 2981.
//
// Source: PHL 2981 (nysenate.gov text read 2026-09-18).
//   (2)(a) A competent adult may appoint a health care agent by a proxy "signed and dated by the adult
//     in the presence of two adult witnesses who shall also sign the proxy." The person appointed
//     as agent "shall not act as witness".
//   (2)(b) For a resident of a mental hygiene facility operated or licensed by OMH: at least one
//     witness is not affiliated with the facility, and if the facility is also a hospital (MHL
//     1.03(10)), at least one witness is a qualified psychiatrist or psychiatric nurse practitioner.
//   (2)(c) For a resident of a facility operated or licensed by OPWDD: at least one witness is not
//     affiliated with the facility, and at least one is a physician, NP, PA, or clinical
//     psychologist meeting the OPWDD employment or approval criteria.
//   (3)(a) An operator, administrator, or employee of a hospital may not be appointed agent by a
//     person who is a patient or resident of, or has applied for admission to, that hospital --
//     (b) unless related by blood, marriage, or adoption; a physician or NP may be (except one
//     affiliated with a mental hygiene facility or psychiatric unit where the principal is treated,
//     unless related). (c) A practitioner appointed agent may not also act as attending practitioner
//     once the proxy's authority begins, unless the practitioner declines the appointment.
//     (d) Someone other than a spouse, child, parent, sibling, or grandparent may not be appointed
//     if already agent for ten principals.
//   2980: "hospital" here means a general hospital, a residential health care facility, a mental
//     hygiene facility, and a hospice.
//
// Pure: no DOM, no clock, no network.

import { scopeSentence } from './state-calendar.js';

export const HCP_VERIFIED = '2026-09-18';
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];
export const AGENT_ROLES = [
  { value: 'none', text: 'Not affiliated with the facility' },
  { value: 'staff', text: 'Operator, administrator, or employee (not a physician or NP)' },
  { value: 'clinician', text: 'A physician or nurse practitioner of the facility' },
];
export const FACILITIES = [
  { value: 'none', text: 'Not a resident or patient of a facility' },
  { value: 'hospital', text: 'Patient or resident of (or applying to) a hospital, nursing home, or hospice' },
  { value: 'omh', text: 'Resident of an OMH-licensed mental hygiene facility' },
  { value: 'omh-hospital', text: 'Resident of an OMH facility that is also a hospital' },
  { value: 'opwdd', text: 'Resident of an OPWDD-licensed facility' },
];

const st = (v) => (v === 'yes' || v === 'no' ? v : null);

export function nyHealthCareProxyCheck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const fac = FACILITIES.find((f) => f.value === o.facility);
  if (!fac) return { valid: false, message: 'Choose the facility setting. OMH and OPWDD residents need a particular witness.' };
  const asks = [
    ['signedDated', 'whether the principal signed and dated the proxy'],
    ['twoWitnesses', 'whether two adult witnesses signed it'],
    ['agentWitnessed', 'whether the agent signed as one of the witnesses'],
  ];
  if (fac.value === 'omh' || fac.value === 'omh-hospital' || fac.value === 'opwdd') asks.push(['unaffiliated', 'whether at least one witness is unaffiliated with the facility']);
  if (fac.value === 'omh-hospital') asks.push(['psychWitness', 'whether a witness is a qualified psychiatrist or psychiatric nurse practitioner']);
  if (fac.value === 'opwdd') asks.push(['opwddClinician', 'whether a witness is a physician, NP, PA, or clinical psychologist meeting the OPWDD criteria']);
  for (const [k, what] of asks) {
    if (!st(o[k])) return { valid: false, message: `Answer ${what}. An unanswered item is not a pass.` };
  }
  const mhf = fac.value === 'omh' || fac.value === 'omh-hospital' || fac.value === 'opwdd';
  const role = fac.value === 'none' ? 'none' : (AGENT_ROLES.some((r) => r.value === o.agentRole) ? o.agentRole : null);
  if (!role) return { valid: false, message: "Choose the agent's relationship to the facility. Its staff may not serve unless related to the principal." };
  const restricted = role === 'staff' || (role === 'clinician' && mhf);
  if (restricted && !st(o.related)) return { valid: false, message: 'Answer whether the agent is related to the principal by blood, marriage, or adoption. A related employee may serve.' };

  const defects = [];
  if (o.signedDated === 'no') defects.push('the principal did not sign and date it (2981(2)(a))');
  if (o.twoWitnesses === 'no') defects.push('it lacks two adult witnesses who also signed (2981(2)(a))');
  if (o.agentWitnessed === 'yes') defects.push('the agent signed as a witness, and the agent may not act as witness (2981(2)(a))');
  if (restricted && o.related === 'no') {
    defects.push(role === 'staff'
      ? 'the agent is an operator, administrator, or employee of the facility and not related to the principal (2981(3)(a))'
      : 'the agent is a physician or NP affiliated with the mental hygiene facility treating the principal and not related to the principal (2981(3)(b))');
  }
  if (o.unaffiliated === 'no') defects.push(`no witness is unaffiliated with the facility (2981(2)(${fac.value === 'opwdd' ? 'c' : 'b'}))`);
  if (o.psychWitness === 'no') defects.push('no witness is a qualified psychiatrist or psychiatric nurse practitioner (2981(2)(b))');
  if (o.opwddClinician === 'no') defects.push('no witness is a clinician meeting the OPWDD criteria (2981(2)(c))');

  return {
    valid: true,
    defects,
    abnormal: defects.length > 0,
    bandLabel: defects.length ? `Defect${defects.length > 1 ? 's' : ''} found: ${defects.length}` : 'No execution defect found',
    band: defects.length
      ? `Defect: ${defects.join('; ')}.`
      : 'No execution defect among the PHL 2981 items checked.',
    clinicianNote: role === 'clinician' ? 'A physician or NP appointed agent may not act as the attending practitioner once the proxy is in force, unless they decline the appointment (2981(3)(c)).' : null,
    limitsNote: 'Not checked: a non-relative already agent for ten principals may not be appointed (2981(3)(d)).',
    postureNote: scopeSentence(HCP_VERIFIED),
  };
}
