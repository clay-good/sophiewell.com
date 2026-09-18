// spec-v1393: must the prescriber check the state prescription monitoring program first?
//
// Sources (text read 2026-09-18):
//   NY  Public Health Law 3343-a(2) (I-STOP): consult the registry before prescribing or dispensing
//       Schedule II, III, or IV. Exceptions include administering; prescribing for use on an
//       institutional dispenser's premises; a general-hospital ED prescription of no more than a
//       five-day supply; hospice; registry access not reasonably possible, no designee available,
//       and no more than five days; and registry failure.
//   NJ  N.J.A.C. 13:45A-35.9: look up the first time a Schedule II or any opioid is prescribed for
//       acute or chronic pain; the first time a Schedule III or IV benzodiazepine is prescribed;
//       quarterly while a current patient continues on a Schedule II or opioid for pain; and any
//       time a Schedule II is prescribed for pain in a general-hospital ED. Exceptions include
//       administering, hospice, no timely access / clinical urgency / system outage with no more
//       than five days, and surgery or trauma within 24 hours with no more than five days.
//   CA  Health & Safety Code 11165.4 (CURES): consult before the first Schedule II, III, or IV
//       prescription and at least every six months while it is renewed, reviewing a report from no
//       earlier than 24 hours (or the previous business day) before. Exemptions: administered in or
//       for use on the premises of a listed facility; ED supply no more than a nonrefillable seven
//       days; buprenorphine in the ED; a procedure with no more than seven nonrefillable days;
//       terminal illness; no timely access (documented) with seven nonrefillable days; outages.
//   TX  Health & Safety Code 481.0764(a): access the PMP before prescribing opioids,
//       benzodiazepines, barbiturates, or carisoprodol -- by CLASS, any schedule. 481.0765: not
//       required for cancer, sickle cell disease, or hospice care clearly noted in the prescription
//       record, or after a good-faith attempt defeated by circumstances outside the prescriber's
//       control.
//
// THE TRAP: a class can matter as much as a schedule. Carisoprodol (Schedule IV) is required in
// Texas by class and in New York by schedule; in New Jersey it is not on the look-up list at all.
//
// Pure: no DOM, no clock, no network.

import { stateOptions, parseDate, scopeSentence } from './state-calendar.js';

export const PMP_VERIFIED = '2026-09-18';
export const PMP_STATES = stateOptions(['NY', 'NJ', 'CA', 'TX']);
export const DRUG_CLASSES = [
  { value: 'opioid', text: 'Opioid' },
  { value: 'benzodiazepine', text: 'Benzodiazepine' },
  { value: 'barbiturate', text: 'Barbiturate' },
  { value: 'carisoprodol', text: 'Carisoprodol' },
  { value: 'stimulant', text: 'Stimulant' },
  { value: 'other', text: 'Other controlled substance' },
];
export const SCHEDULES = [
  { value: 'II', text: 'Schedule II' },
  { value: 'III', text: 'Schedule III' },
  { value: 'IV', text: 'Schedule IV' },
  { value: 'V', text: 'Schedule V' },
];
export const SETTINGS = [
  { value: 'outpatient', text: 'Outpatient or discharge prescription' },
  { value: 'ed', text: 'Emergency department (general hospital)' },
  { value: 'procedure', text: 'After surgery, trauma, or a procedure' },
  { value: 'administered', text: 'Administered, or for use on facility premises' },
  { value: 'hospice', text: 'Hospice care' },
  { value: 'terminal', text: 'Terminal illness' },
  { value: 'cancer-sickle', text: 'Cancer or sickle cell disease' },
  { value: 'no-access', text: 'Registry cannot be reached in time (no designee)' },
  { value: 'outage', text: 'Registry down (technical failure)' },
];
export const FIRST_OR_CONTINUING = [
  { value: 'first', text: 'First prescription to this patient' },
  { value: 'continuing', text: 'Continuing or renewing' },
];
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}
function addMonths(t, n) {
  const d = new Date(t);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + n;
  const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return Date.UTC(y, m, Math.min(d.getUTCDate(), last));
}
function iso(t) { return new Date(t).toISOString().slice(0, 10); }

function exempt(name, record) { return { verdict: 'exempt', exemption: name, record }; }
function required(why, extra = {}) { return { verdict: 'required', why, ...extra }; }
function notRequired(why) { return { verdict: 'not-required', why }; }

function ny(o) {
  if (!['II', 'III', 'IV'].includes(o.schedule)) return notRequired('I-STOP applies to Schedule II, III, and IV; this is Schedule V.');
  const s = o.setting;
  if (s === 'administered') return exempt('administering, or prescribing for use on the premises of an institutional dispenser', 'Note that the drug was administered or dispensed for use on the premises.');
  if (s === 'hospice') return exempt('a patient under hospice care', 'Note the hospice care.');
  if (s === 'ed' && o.days <= 5) return exempt('a general-hospital emergency department prescription of no more than a five-day supply', 'Note the emergency department setting and the days supplied.');
  if (s === 'no-access' && o.days <= 5) return exempt('the registry could not reasonably be reached in time, no authorized designee was available, and no more than five days are prescribed', 'Note why the registry could not be consulted.');
  if (s === 'outage') return exempt('the registry is not operational or cannot be accessed because of a technological or electrical failure', 'Note the failure.');
  const over5 = (s === 'ed' || s === 'no-access') ? ` The exemption for this setting stops at a five-day supply, and ${o.days} days are prescribed.` : '';
  return required(`I-STOP requires a registry check before prescribing any Schedule ${o.schedule} controlled substance.${over5}`);
}

function nj(o) {
  const s = o.setting;
  const opioidOrII = o.schedule === 'II' || o.drugClass === 'opioid';
  const benzoIIIIV = o.drugClass === 'benzodiazepine' && (o.schedule === 'III' || o.schedule === 'IV');
  const forPain = o.forPain === 'yes';
  let trigger = null;
  if (s === 'ed' && o.schedule === 'II' && forPain) trigger = 'every Schedule II prescription for pain in a general-hospital emergency department';
  else if (o.first === 'first' && opioidOrII && forPain) trigger = 'the first Schedule II or opioid prescription for acute or chronic pain';
  else if (o.first === 'first' && benzoIIIIV) trigger = 'the first Schedule III or IV benzodiazepine prescription';
  else if (o.first === 'continuing' && opioidOrII && forPain) trigger = 'a patient who continues on a Schedule II or opioid for pain, every three months';
  if (!trigger) {
    if ((opioidOrII) && o.forPain !== 'yes' && o.forPain !== 'no') return { verdict: 'unanswered', why: 'Answer whether the prescription is for acute or chronic pain; New Jersey\'s Schedule II and opioid look-ups turn on it.' };
    return notRequired('New Jersey\'s mandatory look-ups cover Schedule II and opioid prescriptions for pain, the first Schedule III or IV benzodiazepine, and quarterly re-checks for continuing pain prescriptions. This prescription is none of those.');
  }
  if (s === 'administered') return exempt('administering directly to the patient', 'Note that the drug was administered.');
  if (s === 'hospice') return exempt('a patient under the care of a hospice', 'Note the hospice care.');
  if ((s === 'no-access' || s === 'outage') && o.days <= 5) return exempt(s === 'outage' ? 'the PMP is not operational, with no more than a five-day supply' : 'no timely access to the PMP, with no more than a five-day supply', 'Note why the PMP could not be accessed.');
  if (s === 'procedure' && o.days <= 5 && o.within24 === 'yes') return exempt('a prescription within 24 hours of surgery or trauma for no more than a five-day supply', 'Note the surgery or trauma and the days supplied.');
  let why = `New Jersey requires a look-up for ${trigger}.`;
  if (s === 'procedure' && o.days <= 5 && o.within24 !== 'yes') why += ' The surgery-or-trauma exception needs the prescription within 24 hours of it.';
  return required(why, { recheckMonths: 3 });
}

function ca(o) {
  if (!['II', 'III', 'IV'].includes(o.schedule)) return notRequired('CURES consultation applies to Schedule II, III, and IV; this is Schedule V.');
  const s = o.setting;
  const nonrefill7 = o.days <= 7 && o.refills !== 'yes';
  if (s === 'administered') return exempt('administered in, or for use on the premises of, a clinic, health facility, or other listed medical facility', 'Note the facility and that the drug was used there.');
  if (s === 'ed' && o.buprenorphine === 'yes') return exempt('buprenorphine prescribed or furnished in a general acute care hospital emergency department', 'Note the emergency department setting.');
  if (s === 'ed' && nonrefill7) return exempt('an emergency department supply of no more than seven days, nonrefillable', 'Note the emergency department setting and the days supplied.');
  if (s === 'procedure' && nonrefill7) return exempt('part of treatment for a surgical, radiotherapeutic, therapeutic, or diagnostic procedure, no more than seven days, nonrefillable', 'Note the procedure and the days supplied.');
  if (s === 'terminal' || s === 'hospice') return exempt('a terminally ill patient, as defined in Health & Safety Code 11159.2', 'Note the terminal illness.');
  if (s === 'no-access' && nonrefill7) return exempt('CURES could not reasonably be reached in time, no other authorized user was available, and no more than seven nonrefillable days', 'Document in the record the reason CURES was not consulted (required).');
  if (s === 'outage') return exempt('CURES is not operational or cannot be accessed because of a temporary technological or electrical failure', 'Note the failure, and seek to correct it without undue delay.');
  let why = o.first === 'first'
    ? `California requires a CURES check before the first Schedule ${o.schedule} prescription to this patient, reviewing a report from no earlier than 24 hours, or the previous business day, before prescribing.`
    : `California requires a CURES check at least every six months while a Schedule ${o.schedule} prescription is renewed, reviewing a report from no earlier than 24 hours, or the previous business day, before prescribing.`;
  if ((s === 'ed' || s === 'procedure' || s === 'no-access') && !nonrefill7) why += ' The exemption for this setting needs no more than a seven-day supply with no refills.';
  return required(why, { recheckMonths: 6 });
}

function tx(o) {
  const cls = ['opioid', 'benzodiazepine', 'barbiturate', 'carisoprodol'];
  if (!cls.includes(o.drugClass)) return notRequired('Texas requires a PMP check before prescribing opioids, benzodiazepines, barbiturates, or carisoprodol. Checking before other controlled substances is allowed, not required.');
  const s = o.setting;
  if (s === 'cancer-sickle') return exempt('a diagnosis of cancer or sickle cell disease', 'Clearly note the diagnosis in the prescription record (required for the exception).');
  if (s === 'hospice') return exempt('a patient receiving hospice care', 'Clearly note the hospice care in the prescription record (required for the exception).');
  if (s === 'outage' || s === 'no-access') return exempt('a good-faith attempt to check was defeated by circumstances outside the prescriber\'s control', 'Note the attempt and why it failed.');
  return required(`Texas requires a PMP check before prescribing ${o.drugClass === 'carisoprodol' ? 'carisoprodol' : `a ${o.drugClass}`}, whatever its schedule.`);
}

const RULES = { NY: ny, NJ: nj, CA: ca, TX: tx };
const SOURCE = {
  NY: 'N.Y. Public Health Law 3343-a(2) (I-STOP)',
  NJ: 'N.J.A.C. 13:45A-35.9',
  CA: 'Cal. Health & Safety Code 11165.4 (CURES)',
  TX: 'Tex. Health & Safety Code 481.0764-481.0765',
};

export function pmpCheckRequired(input = {}) {
  const o = input && typeof input === 'object' ? { ...input } : {};
  if (isBlank(o.state) || !RULES[o.state]) return { valid: false, message: 'Choose the state. Each has its own monitoring-program rule, and there is no default.' };
  if (isBlank(o.drugClass) || !DRUG_CLASSES.some((c) => c.value === o.drugClass)) return { valid: false, message: 'Choose the drug class. Texas decides by class, not schedule.' };
  if (isBlank(o.schedule) || !SCHEDULES.some((c) => c.value === o.schedule)) return { valid: false, message: 'Choose the schedule.' };
  if (isBlank(o.setting) || !SETTINGS.some((c) => c.value === o.setting)) return { valid: false, message: 'Choose the setting. The exemptions turn on it.' };
  if (isBlank(o.first) || !FIRST_OR_CONTINUING.some((c) => c.value === o.first)) return { valid: false, message: 'Say whether this is the first prescription to the patient or a continuing one.' };
  const days = Number(String(o.days ?? '').trim());
  if (isBlank(o.days) || !Number.isFinite(days) || days <= 0 || days > 365) return { valid: false, message: 'Enter the days supplied, from 1 to 365. The short-supply exemptions turn on it.' };
  o.days = days;

  const r = RULES[o.state](o);
  if (r.verdict === 'unanswered') return { valid: false, message: r.why };

  let nextCheck = null;
  if (r.verdict === 'required' && r.recheckMonths && o.first === 'continuing' && !isBlank(o.lastCheck)) {
    const last = parseDate(o.lastCheck);
    if (last === null) return { valid: false, message: 'Enter the date of the last check as a date, or leave it blank.' };
    nextCheck = iso(addMonths(last, r.recheckMonths));
  }

  const label = r.verdict === 'required' ? 'Check required' : (r.verdict === 'exempt' ? 'Exempt' : 'Not required');
  const band = r.verdict === 'exempt'
    ? `Exempt under ${SOURCE[o.state]}: ${r.exemption}.`
    : `${label}. ${r.why}`;
  return {
    valid: true,
    state: o.state,
    verdict: r.verdict,
    abnormal: r.verdict === 'required',
    bandLabel: label,
    band,
    exemption: r.exemption || null,
    record: r.record || null,
    nextCheck,
    nextCheckNote: nextCheck ? `The next check is due by ${nextCheck} (every ${r.recheckMonths} months while it continues).` : null,
    postureNote: scopeSentence(PMP_VERIFIED),
    note: `${SOURCE[o.state]}. Whether a prescription is exempt turns on the facts in the record, which the exemption note names.`,
  };
}

