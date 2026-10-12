// spec-v1637 tool 9: which form of a Schedule II prescription a pharmacist may dispense from.
//
// Source: 21 CFR 1306.11 and 1306.08(b), read on eCFR as current October 8, 2026 (re-read
// October 12, 2026).
//   1306.11(a)  "only pursuant to a written prescription signed by the practitioner, except as
//     provided in paragraph (d)". A paper prescription "may be transmitted ... via facsimile
//     equipment, provided that the original manually signed prescription is presented to the
//     pharmacist for review prior to the actual dispensing ..., except as noted in paragraph (e),
//     (f), or (g)".
//   1306.08(b)  a pharmacy may fill an electronically transmitted prescription if it complies with
//     this part and with part 1311.
//   1306.11(d)  an emergency situation: oral authorization, provided that (1) the quantity "is
//     limited to the amount adequate to treat the patient during the emergency period"; (2) it is
//     "immediately reduced to writing by the pharmacist"; (3) a reasonable effort to confirm a
//     prescriber not known to the pharmacist; (4) "Within 7 days after authorizing an emergency
//     oral prescription, the prescribing individual practitioner shall cause a written
//     prescription ... to be delivered", marked "Authorization for Emergency Dispensing" with the
//     date of the oral order, postmarked within the 7 days if mailed; the pharmacist notifies DEA
//     if it does not arrive; (5) central fill pharmacies are not authorized under this paragraph.
//   1306.11(e)  a Schedule II NARCOTIC "to be compounded for the direct administration to a patient
//     by parenteral, intravenous, intramuscular, subcutaneous or intraspinal infusion": the
//     facsimile serves as the original.
//   1306.11(f)  a Schedule II SUBSTANCE (not only a narcotic) "for a resident of a Long Term Care
//     Facility": the facsimile serves as the original.
//   1306.11(g)  a Schedule II NARCOTIC for a patient in a hospice program certified or paid for by
//     Medicare or licensed by the state, where the practitioner "will note on the prescription that
//     the patient is a hospice patient": the facsimile serves as the original.
// Paragraphs (e) and (g) say narcotic; (f) does not. The build keeps that difference.
//
// Pure: no DOM, no clock, no network.

import { parseIsoStrict, addCalendarDaysUtc, fmtUtc } from './deadline.js';

const opt = (value, text) => ({ value, text });
export const ARRIVED = [
  opt('signed-paper-prescription', 'Signed paper prescription, in hand'),
  opt('electronic-prescription', 'Electronic prescription'),
  opt('faxed-prescription', 'Fax of a signed paper prescription'),
  opt('oral-authorization', 'Oral authorization by phone'),
];
export const FAX_CASES = [
  opt('narcotic-compounded-infusion', 'A narcotic to be compounded for direct parenteral, intravenous, intramuscular, subcutaneous or intraspinal infusion'),
  opt('ltc-facility-resident', 'For a resident of a long-term care facility'),
  opt('hospice-patient-narcotic', 'A narcotic for a patient in a Medicare-certified or state-licensed hospice program'),
  opt('none-of-these-cases', 'None of these'),
];
export const HOSPICE_NOTED = [opt('hospice-noted-on-prescription', 'The prescription notes that the patient is a hospice patient'), opt('hospice-not-noted', 'It does not')];
export const EMERGENCY = [opt('emergency-situation', 'An emergency situation'), opt('not-an-emergency', 'Not an emergency')];
export const PHARMACY = [opt('dispensing-pharmacy', 'A pharmacy dispensing to the patient'), opt('centralized-fill-pharmacy', 'A central fill pharmacy')];
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const say = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });

export function c2RxFormCheck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const need = (list, v, msg) => list.find((x) => x.value === String(v ?? '').trim()) || { fault: msg };
  const how = need(ARRIVED, o.arrived, 'Choose how the Schedule II prescription arrived.');
  if (how.fault) return { valid: false, message: how.fault };
  const done = (flag, band, bandLabel, notes, abnormal, extra = {}) => ({ valid: true, flag, band, bandLabel, abnormal, ...extra, notes, note: notes.join(' ') });
  const state = 'State law can be stricter, and this covers only the form of the prescription, not its other requirements under 21 CFR 1306.05.';
  if (how.value === 'signed-paper-prescription') {
    return done('dispense-yes', 'Yes: a written prescription signed by the practitioner.', 'May be dispensed from', ['A pharmacist may dispense a Schedule II drug pursuant to a written prescription signed by the practitioner (21 CFR 1306.11(a)).', state], false);
  }
  if (how.value === 'electronic-prescription') {
    return done('dispense-yes-with-conditions', 'Yes, if the electronic prescription and the pharmacy meet 21 CFR part 1311.', 'May be dispensed from, with conditions', ['A pharmacy may fill an electronically transmitted prescription for a controlled substance if it complies with the other requirements of part 1306 and with part 1311 (21 CFR 1306.08(b)). A prescription whose required content was altered in transmission is invalid (1306.08(d)).', state], false);
  }
  if (how.value === 'faxed-prescription') {
    const which = need(FAX_CASES, o.faxCase, 'Choose whether one of the three fax exceptions applies: without one, a fax is for review only.');
    if (which.fault) return { valid: false, message: which.fault };
    if (which.value === 'none-of-these-cases') {
      return done('dispense-no', 'Not from the fax alone: the original signed prescription must be presented before dispensing.', 'Fax is for review only', ['A paper Schedule II prescription may be sent by fax, provided the original manually signed prescription is presented to the pharmacist for review before the actual dispensing (21 CFR 1306.11(a)). The fax lets the pharmacy prepare; it is not what is dispensed from.', 'The three exceptions, where the fax serves as the original: a narcotic compounded for direct infusion (1306.11(e)), a long-term care facility resident (1306.11(f)), and a narcotic for a hospice patient (1306.11(g)).', state], true);
    }
    if (which.value === 'narcotic-compounded-infusion') {
      return done('dispense-yes', 'Yes: the fax serves as the original written prescription.', 'May be dispensed from', ['A prescription for a Schedule II narcotic to be compounded for direct administration to a patient by parenteral, intravenous, intramuscular, subcutaneous or intraspinal infusion may be sent by fax, and the fax serves as the original (21 CFR 1306.11(e)). The paragraph says narcotic: a Schedule II drug that is not a narcotic is outside it.', state], false);
    }
    if (which.value === 'ltc-facility-resident') {
      return done('dispense-yes', 'Yes: the fax serves as the original written prescription.', 'May be dispensed from', ['A prescription for a Schedule II substance for a resident of a long-term care facility may be sent by fax, and the fax serves as the original (21 CFR 1306.11(f)). This paragraph covers any Schedule II substance, not only narcotics.', state], false);
    }
    const noted = need(HOSPICE_NOTED, o.hospiceNoted, 'Choose whether the prescription notes that the patient is a hospice patient: paragraph (g) requires the note.');
    if (noted.fault) return { valid: false, message: noted.fault };
    if (noted.value === 'hospice-not-noted') {
      return done('dispense-no', 'Not yet: the prescription does not note that the patient is a hospice patient.', 'Missing the hospice note', ['For a Schedule II narcotic for a patient in a Medicare-certified or Medicare-paid hospice program, or one licensed by the state, the fax serves as the original, and the practitioner or the practitioner\'s agent will note on the prescription that the patient is a hospice patient (21 CFR 1306.11(g)). Without the note the paragraph\'s condition is not met.', state], true);
    }
    return done('dispense-yes', 'Yes: the fax serves as the original written prescription.', 'May be dispensed from', ['A prescription for a Schedule II narcotic for a patient in a hospice program certified or paid for by Medicare, or licensed by the state, may be sent by fax with the hospice status noted on it, and the fax serves as the original (21 CFR 1306.11(g)). The paragraph says narcotic.', state], false);
  }
  // Oral authorization.
  const emergency = need(EMERGENCY, o.emergency, 'Choose whether this is an emergency situation: an oral Schedule II order is allowed in an emergency only.');
  if (emergency.fault) return { valid: false, message: emergency.fault };
  if (emergency.value === 'not-an-emergency') {
    return done('dispense-no', 'No: an oral Schedule II authorization is allowed in an emergency situation only.', 'Not from an oral order', ['Outside an emergency situation as defined in 21 CFR 290.10, a Schedule II drug is dispensed only on a written prescription signed by the practitioner or a compliant electronic one (21 CFR 1306.11(a), (d)).', state], true);
  }
  const pharmacy = need(PHARMACY, o.pharmacy, 'Choose the kind of pharmacy: a central fill pharmacy may not act on an oral emergency authorization.');
  if (pharmacy.fault) return { valid: false, message: pharmacy.fault };
  if (pharmacy.value === 'centralized-fill-pharmacy') {
    return done('dispense-no', 'No: a central fill pharmacy may not prepare a Schedule II prescription on an oral authorization.', 'Not at a central fill pharmacy', ['Central fill pharmacies are not authorized to prepare a Schedule II prescription on an oral authorization from a retail pharmacist or a practitioner (21 CFR 1306.11(d)(5)).', state], true);
  }
  let due = null;
  if (!blank(o.authorizedOn)) {
    try { due = addCalendarDaysUtc(parseIsoStrict(String(o.authorizedOn).trim()), 7); } catch { return { valid: false, message: 'Enter the date of the oral authorization as a real date, or leave it blank.' }; }
  }
  const notes = [
    'In an emergency situation a pharmacist may dispense a Schedule II drug on the oral authorization of the prescribing practitioner, provided that (21 CFR 1306.11(d)):',
    '(1) The quantity is limited to the amount adequate to treat the patient during the emergency period.',
    '(2) The pharmacist immediately reduces the prescription to writing, with everything 1306.05 requires except the signature.',
    '(3) If the prescriber is not known to the pharmacist, the pharmacist makes a reasonable effort to confirm the authorization came from a registered practitioner, which may include a callback.',
    `(4) Within 7 days after authorizing it, the prescriber delivers a written prescription for the emergency quantity, marked "Authorization for Emergency Dispensing" with the date of the oral order${due ? `: by ${say(due)}` : ''}. If mailed, it must be postmarked within the 7 days. The pharmacist notifies the nearest DEA office if it does not arrive.`,
    state,
  ];
  if (!due) notes.splice(5, 0, 'The date of the oral authorization was not entered, so the 7-day date is not shown.');
  return done('dispense-yes-with-conditions', 'Yes, for the emergency quantity only, with a written prescription due within 7 days.', 'Emergency only, with conditions', notes, false, due ? { writtenPrescriptionDue: fmtUtc(due) } : {});
}
