// spec-v1637 tool 8: may this controlled-substance prescription be transferred to another pharmacy?
//
// Source: 21 CFR 1306.08(e)-(i), 1306.25 and 1306.12(a), read on eCFR as current October 8, 2026
// (re-read October 12, 2026).
//   1306.08(e)  "The transfer for initial dispensing of an electronic prescription for a controlled
//     substance in Schedule II-V is permissible between retail pharmacies, upon request from the
//     patient, on a one-time basis only. If the transferred prescription is for ... Schedule III,
//     IV, or V and includes authorized refills, the refills are transferred with the initial
//     prescription".
//   1306.08(f)  in its electronic form, never converted (for example to a facsimile); contents not
//     altered; "communicated directly between two licensed pharmacists"; what each pharmacist
//     records. (g) "permissible only if allowable under existing State or other applicable law."
//     (h) records kept two years from the date of the transfer by both pharmacies.
//   1306.25(a)  Schedule III, IV or V, "for the purpose of refill dispensing ... on a one-time
//     basis only. However, pharmacies electronically sharing a real-time, online database may
//     transfer up to the maximum refills permitted by law and the prescriber's authorization."
//     (b) the records; (c) "two years from the date of last refill"; (e) only if state law allows.
//   1306.12(a)  "The refilling of a prescription for a controlled substance listed in Schedule II
//     is prohibited."
// An unfilled paper or oral prescription: neither section provides for its transfer. DEA's
// preamble at 88 FR 48365 (July 27, 2023; re-read October 12, 2026): "DEA regulations address the
// transfer of controlled substance prescriptions (schedules III-V) between pharmacies for refill
// dispensing, but not for initial dispensing", and "If a paper prescription is presented at a
// pharmacy that is unable to fill it, the paper prescription could be returned to the patient,
// and the patient could then take the prescription to another pharmacy." It says nothing there
// about an unfilled oral prescription, and neither does the tool.
//
// Pure: no DOM, no clock, no network.

const opt = (value, text) => ({ value, text });
export const SCHEDULES = [opt('schedule-2', 'Schedule II'), opt('schedule-3-to-5', 'Schedule III, IV or V')];
export const FILLED = [opt('unfilled-prescription', 'Never filled'), opt('filled-at-least-once', 'Filled at least once')];
export const FORMS = [opt('electronic-prescription', 'Electronic prescription'), opt('paper-or-oral-prescription', 'Paper, or oral reduced to writing')];
export const BEFORE = [opt('not-transferred-before', 'Not transferred before'), opt('transferred-before', 'Already transferred once')];
export const DATABASE = [opt('shared-realtime-database', 'The two pharmacies share a real-time, online database'), opt('no-shared-database', 'They do not')];
export const STATE = [opt('state-law-allows', 'State law allows the transfer'), opt('state-law-does-not-allow', 'State law does not allow it'), opt('state-law-not-checked', 'Not checked')];

const FIRST_FILL_RECORDS = [
  'Transferring pharmacist adds to the electronic record: that the prescription was transferred; the name, address and DEA registration number of the receiving pharmacy and the name of the receiving pharmacist; the date of the transfer and the transferring pharmacist\'s name (1306.08(f)(4)).',
  'Receiving pharmacist adds the word "transfer" to the record; the name, address and DEA registration number of the pharmacy it came from and the name of the pharmacist who transferred it; the date of the transfer and the receiving pharmacist\'s name (1306.08(f)(5)).',
  'Both pharmacies keep the electronic records of the transfer for two years from the date of the transfer (1306.08(h)).',
];
const REFILL_RECORDS = [
  'Transferring pharmacist writes "VOID" on the face of the invalidated prescription (or marks the electronic record as transferred), and records the receiving pharmacy\'s name, address and DEA registration number, the receiving pharmacist\'s name, the date, and the transferring pharmacist\'s name (1306.25(b)(2)).',
  'Receiving pharmacist writes "transfer" on the face of the transferred prescription and records: the date of issuance, the original number of refills, the date of original dispensing, the refills remaining with the dates and locations of previous refills, the transferring pharmacy\'s name, address, DEA number and prescription number, the transferring pharmacist\'s name, and the same for the pharmacy that originally filled it (1306.25(b)(3); for electronic prescriptions, (b)(4) and (5)).',
  'The original and the transferred prescription are kept for two years from the date of the last refill (1306.25(c)).',
];

export function csRxTransferCheck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const need = (list, v, msg) => list.find((x) => x.value === String(v ?? '').trim()) || { fault: msg };
  const schedule = need(SCHEDULES, o.schedule, 'Choose the schedule.');
  if (schedule.fault) return { valid: false, message: schedule.fault };
  const filled = need(FILLED, o.filled, 'Choose whether the prescription has been filled at least once: the rule for a first fill differs from the rule for refills.');
  if (filled.fault) return { valid: false, message: filled.fault };
  const done = (flag, band, bandLabel, notes, abnormal) => ({ valid: true, flag, band, bandLabel, abnormal, notes, note: notes.join(' ') });
  if (filled.value === 'filled-at-least-once' && schedule.value === 'schedule-2') {
    return done('nothing-to-transfer', 'Nothing to transfer: a Schedule II prescription has no refills.', 'Nothing to transfer', ['The refilling of a Schedule II prescription is prohibited (21 CFR 1306.12(a)), so a filled one has nothing left to transfer. A partly filled Schedule II prescription is a different question, under 1306.13, which this does not answer.'], true);
  }
  const form = need(FORMS, o.form, 'Choose electronic, or paper or oral.');
  if (form.fault) return { valid: false, message: form.fault };
  const first = filled.value === 'unfilled-prescription';
  if (first && form.value === 'paper-or-oral-prescription') {
    return done('no-federal-provision', 'No DEA regulation provides for transferring an unfilled paper or oral prescription.', 'No federal provision', [
      '21 CFR 1306.08(e) allows the transfer for initial dispensing of an electronic prescription only, and 1306.25 covers refill dispensing only. Neither provides for moving an unfilled paper or oral prescription between pharmacies.',
      'The regulations are silent rather than prohibiting in words. DEA\'s preamble to the 2023 rule says its regulations address transfer "for refill dispensing, but not for initial dispensing", and that a paper prescription a pharmacy cannot fill "could be returned to the patient, and the patient could then take the prescription to another pharmacy" (88 FR 48365). State law may say more.',
    ], true);
  }
  const before = need(BEFORE, o.transferredBefore, 'Choose whether the prescription has been transferred before: both rules allow a transfer once.');
  if (before.fault) return { valid: false, message: before.fault };
  const state = need(STATE, o.stateLaw, 'Choose whether state law allows the transfer: both federal rules apply only if it does.');
  if (state.fault) return { valid: false, message: state.fault };
  let database = null;
  if (!first) {
    database = need(DATABASE, o.sharedDatabase, 'Choose whether the two pharmacies share a real-time, online database: the one-time limit does not apply to those that do.');
    if (database.fault) return { valid: false, message: database.fault };
  }
  const notes = [];
  let allowed = true;
  if (first) {
    notes.push('First fill, electronic prescription, Schedule II to V: the transfer is permissible between retail pharmacies, at the patient\'s request, on a one-time basis only (21 CFR 1306.08(e)).');
    if (before.value === 'transferred-before') { allowed = false; notes.push('It has already been transferred once, and the rule allows one transfer.'); }
    notes.push('It must move in its electronic form (never converted, for example to a fax), with its contents unaltered, and be communicated directly between two licensed pharmacists (1306.08(f)(1)-(3)).');
    if (schedule.value === 'schedule-3-to-5') notes.push('Authorized refills on a Schedule III, IV or V prescription transfer with it (1306.08(e)).');
  } else {
    notes.push('Refill dispensing, Schedule III, IV or V: the transfer of original prescription information is permissible between pharmacies on a one-time basis only; pharmacies electronically sharing a real-time, online database may transfer up to the maximum refills permitted by law and the prescriber\'s authorization (21 CFR 1306.25(a)).');
    if (before.value === 'transferred-before' && database.value === 'no-shared-database') { allowed = false; notes.push('It has already been transferred once, and the two pharmacies do not share a real-time, online database.'); }
    notes.push('The transfer is communicated directly between two licensed pharmacists (1306.25(b)(1)).');
  }
  const para = first ? '1306.08(g)' : '1306.25(e)';
  if (state.value === 'state-law-does-not-allow') { allowed = false; notes.push(`State law does not allow it, and the federal rule is permissible only if allowable under state law (${para}).`); }
  else if (state.value === 'state-law-not-checked') notes.push(`State law was not checked. The federal rule is permissible only if allowable under existing state or other applicable law (${para}).`);
  if (allowed) notes.push('What each pharmacist records:', ...(first ? FIRST_FILL_RECORDS : REFILL_RECORDS));
  const pending = allowed && state.value === 'state-law-not-checked';
  return done(
    !allowed ? 'transfer-not-permitted' : pending ? 'permitted-if-state-law-allows' : 'transfer-permitted',
    !allowed ? 'The transfer is not permitted on these facts.' : pending ? 'The federal rule permits the transfer if state law allows it.' : 'The transfer is permitted, once.',
    !allowed ? 'Not permitted' : pending ? 'Depends on state law' : 'Permitted', notes, !allowed,
  );
}
