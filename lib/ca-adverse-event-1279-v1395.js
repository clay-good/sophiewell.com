// spec-v1395: is this a California reportable adverse event, and by when?
//
// Source: Cal. Health & Safety Code 1279.1 (leginfo text read 2026-09-18; Stats. 2007, ch. 130).
//   (a) A licensed general acute care, acute psychiatric, or special hospital reports an adverse
//       event to the department "no later than five days after the adverse event has been
//       detected", or, for "an ongoing urgent or emergent threat to the welfare, health, or safety of
//       patients, personnel, or visitors, not later than 24 hours after" detection.
//   (b) The 27 enumerated events below, and (b)(7): "An adverse event or series of adverse events that
//       cause the death or serious disability of a patient, personnel, or visitor."
//   (c) The patient or the responsible party is informed of the event by the time the report is made.
//   (d) "Serious disability": an impairment that substantially limits a major life activity, or loss
//       of bodily function, lasting more than seven days or still present at discharge, or the loss
//       of a body part.
//
// A fall is listed ((b)(5)(D)) only when it causes DEATH; a fall causing serious disability is
// reportable through the (b)(7) catch-all. Neonatal hyperbilirubinemia means a bilirubin over 30
// mg/dL, with death or serious disability.
//
// Pure: no DOM, no clock, no network. Times are local wall-clock 'YYYY-MM-DDTHH:MM'.

import { parseDateTime, addHours, formatDeadline, scopeSentence } from './state-calendar.js';

export const AE_VERIFIED = '2026-09-18';
export const AE_EVENTS = [
  { value: 's-wrong-site', text: 'Surgery on the wrong body part', ref: '(b)(1)(A)' },
  { value: 's-wrong-patient', text: 'Surgery on the wrong patient', ref: '(b)(1)(B)' },
  { value: 's-wrong-procedure', text: 'Wrong surgical procedure', ref: '(b)(1)(C)' },
  { value: 's-retained-object', text: 'Foreign object retained after surgery or a procedure', ref: '(b)(1)(D)' },
  { value: 's-anesthesia-death', text: 'Death within 24 h of anesthesia in a normal, healthy patient', ref: '(b)(1)(E)' },
  { value: 'p-contaminated', text: 'Death or serious disability from a contaminated drug, device, or biologic', ref: '(b)(2)(A)' },
  { value: 'p-device', text: 'Death or serious disability from a device used or functioning other than as intended', ref: '(b)(2)(B)' },
  { value: 'p-air-embolism', text: 'Death or serious disability from intravascular air embolism', ref: '(b)(2)(C)' },
  { value: 'x-wrong-person', text: 'Infant discharged to the wrong person', ref: '(b)(3)(A)' },
  { value: 'x-disappearance', text: 'Death or serious disability after a disappearance of more than 4 hours', ref: '(b)(3)(B)' },
  { value: 'x-suicide', text: 'Suicide, or attempted suicide with serious disability, after admission', ref: '(b)(3)(C)' },
  { value: 'c-medication', text: 'Death or serious disability from a medication error', ref: '(b)(4)(A)' },
  { value: 'c-abo', text: 'Death or serious disability from an ABO-incompatible hemolytic reaction', ref: '(b)(4)(B)' },
  { value: 'c-maternal', text: 'Maternal death or serious disability in a low-risk pregnancy (to 42 days)', ref: '(b)(4)(C)' },
  { value: 'c-hypoglycemia', text: 'Death or serious disability from hypoglycemia beginning in the facility', ref: '(b)(4)(D)' },
  { value: 'c-bilirubin', text: 'Death or serious disability from neonatal hyperbilirubinemia over 30 mg/dL', ref: '(b)(4)(E)' },
  { value: 'c-pressure-injury', text: 'Stage 3 or 4 pressure ulcer acquired after admission', ref: '(b)(4)(F)' },
  { value: 'c-spinal-manipulation', text: 'Death or serious disability from spinal manipulative therapy', ref: '(b)(4)(G)' },
  { value: 'e-shock', text: 'Death or serious disability from an electric shock', ref: '(b)(5)(A)' },
  { value: 'e-wrong-gas', text: 'A gas line delivering the wrong gas or a toxic contaminant', ref: '(b)(5)(B)' },
  { value: 'e-burn', text: 'Death or serious disability from a burn', ref: '(b)(5)(C)' },
  { value: 'e-fall-death', text: 'Death associated with a fall', ref: '(b)(5)(D)' },
  { value: 'e-restraint', text: 'Death or serious disability from restraints or bedrails', ref: '(b)(5)(E)' },
  { value: 'k-impersonation', text: 'Care by someone impersonating a licensed provider', ref: '(b)(6)(A)' },
  { value: 'k-abduction', text: 'Abduction of a patient', ref: '(b)(6)(B)' },
  { value: 'k-sexual-assault', text: 'Sexual assault on a patient in or on the grounds of the facility', ref: '(b)(6)(C)' },
  { value: 'k-assault', text: 'Death or significant injury from a physical assault in or on the grounds', ref: '(b)(6)(D)' },
  { value: 'catch-all', text: 'Any other event causing death or serious disability (including a fall)', ref: '(b)(7)' },
  { value: 'none', text: 'None of these', ref: null },
];
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}

export function caAdverseEvent1279(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const ev = AE_EVENTS.find((e) => e.value === o.event);
  if (isBlank(o.event) || !ev) return { valid: false, message: 'Choose the event. The 28 reportable events are listed; choose "None of these" if none fits.' };
  if (ev.value === 'none') {
    return {
      valid: true, reportable: false, abnormal: false, bandLabel: 'Not a 1279.1 event',
      band: 'Not an adverse event under Health & Safety Code 1279.1. Unusual occurrences and reportable diseases have their own rules (22 CCR 70737), which this section does not change.',
      postureNote: scopeSentence(AE_VERIFIED),
    };
  }
  if (isBlank(o.urgent) || !['yes', 'no'].includes(o.urgent)) return { valid: false, message: 'Answer whether the event is an ongoing urgent or emergent threat. It changes the deadline from five days to 24 hours.' };
  if (isBlank(o.detected)) return { valid: false, message: 'Enter when the event was detected. The deadline runs from detection, and without it none is printed.' };
  const d = parseDateTime(o.detected);
  if (d === null) return { valid: false, message: 'Enter the detection time as a date and time.' };

  const hours = o.urgent === 'yes' ? 24 : 5 * 24;
  const due = addHours(d, hours);
  const within = o.urgent === 'yes' ? '24 hours (an ongoing urgent or emergent threat)' : 'five days';
  const fallNote = ev.value === 'catch-all'
    ? 'The (b)(7) catch-all covers any event causing death or serious disability; a fall causing serious disability (not death) is reported through it.'
    : (ev.value === 'e-fall-death' ? 'A fall is listed only when it causes death; a fall causing serious disability goes through the (b)(7) catch-all.' : null);
  return {
    valid: true,
    reportable: true,
    ref: ev.ref,
    dueAt: due.end,
    abnormal: true,
    bandLabel: `Report to CDPH by ${due.end.replace('T', ' ')}`,
    band: `Reportable under 1279.1${ev.ref}: ${ev.text}. Report to the California Department of Public Health within ${within}: by ${formatDeadline(d, due.endWall, 'detection')}.`,
    informNote: 'Inform the patient, or the party responsible for the patient, of the event by the time the report is made (1279.1(c)).',
    disabilityNote: '"Serious disability": an impairment that substantially limits a major life activity, or loss of bodily function, lasting more than seven days or still present at discharge, or the loss of a body part.',
    fallNote,
    caveats: due.caveats,
    postureNote: scopeSentence(AE_VERIFIED),
  };
}
