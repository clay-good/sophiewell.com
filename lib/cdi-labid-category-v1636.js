// spec-v1636 tool 16: C. difficile LabID event: onset category, incident or recurrent, and rate.
//
// Source: CDC NHSN, Multidrug-Resistant Organism and Clostridioides difficile Infection (MDRO/CDI)
// Module protocol, January 2026 (cdc.gov/nhsn/pdfs/pscmanual/12pscmdro_cdadcurrent.pdf), re-read
// October 12, 2026:
//   Duplicate: a toxin-positive result "from the same patient and location, following a previous
//    C. difficile toxin-positive laboratory result within 14 days"; "The date of specimen collection
//    of a previously submitted C. difficile LabID Event is considered Day 1." Its example: after a
//    positive on January 16, one on January 31 is "more than 14 days" later and is entered.
//   Community-Onset (CO): collected in an outpatient location with no discharge from an inpatient
//    location of the same facility "less than or equal to 28 days prior", or in an inpatient
//    location "on HD 1 [day of admission], HD 2 or HD 3".
//   Community-Onset Healthcare Facility-Associated (CO-HCFA): a CO event in a patient "discharged
//    from the facility less than or equal to 28 days prior to current date of stool specimen
//    collection", the discharge being from an inpatient location of the same facility.
//   Healthcare Facility-Onset (HO): "collected from an inpatient location on or after HD 4 where
//    HD 1 is day of admission."
//   Incident: "more than 56 days after the most recent CDI LabID Event (or with no previous ...)";
//   Recurrent: "more than 14 days and less than or equal to 56 days after"; unassigned at "less
//    than or equal to 14 days". "the date of first specimen collection is considered day 1."
//   Rate: events / patient days x 10,000.
//
// Because the earlier specimen's date is day 1, a specimen N calendar days later is on day N + 1:
// subtracting dates and comparing the difference with 14 and 56 is off by one at every boundary.
// The protocol states no day-1 convention for the 28-day discharge window; the plain date
// difference is used there, and the result says so.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';
import { parseIsoStrict } from './deadline.js';

export const LOCATIONS = [
  { value: 'inpatient-location', text: 'Inpatient location' },
  { value: 'ambulatory-location', text: 'Outpatient location (including emergency department and observation)' },
];
export const PRIORS = [
  { value: 'no-earlier-positive', text: 'No previous positive for this patient' },
  { value: 'earlier-positive-here', text: 'A previous positive, same patient and same location' },
  { value: 'earlier-positive-elsewhere', text: 'A previous positive, same patient, another location' },
];
export const DISCHARGES = [
  { value: 'no-earlier-discharge', text: 'No inpatient discharge from this facility before the specimen' },
  { value: 'earlier-discharge', text: 'An earlier inpatient discharge from this facility' },
];
const NOTE = 'The NHSN protocol\'s categories for the dates entered. NHSN assigns these itself from the event form; this shows the day counts behind them. Surveillance categories are not clinical diagnoses.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const date = (s) => { try { return parseIsoStrict(String(s ?? '').trim()); } catch { return null; } };
const days = (a, b) => Math.round((a - b) / 86400000);
const pick = (list, v) => list.find((x) => x.value === String(v ?? '').trim());

export function cdiLabidCategory(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const spec = date(o.specimenDate);
  if (!spec) return { valid: false, message: 'Enter the specimen collection date (YYYY-MM-DD).' };
  const loc = pick(LOCATIONS, o.location);
  if (!loc) return { valid: false, message: 'Choose where the specimen was collected: an inpatient or an outpatient location.' };
  const inpatient = loc.value === 'inpatient-location';
  let adm = null;
  if (inpatient) {
    adm = date(o.admissionDate);
    if (!adm) return { valid: false, message: 'Enter the admission date (YYYY-MM-DD): hospital day 1 is the day of admission.' };
    if (adm > spec) return { valid: false, message: 'The admission date is after the specimen date. Check the two dates.' };
  }
  const dis = pick(DISCHARGES, o.priorDischarge);
  if (!dis) return { valid: false, message: 'Choose whether the patient had an earlier inpatient discharge from this facility: the community-onset categories turn on it.' };
  let discharge = null;
  if (dis.value === 'earlier-discharge') {
    discharge = date(o.dischargeDate);
    if (!discharge) return { valid: false, message: 'Enter the date of that inpatient discharge (YYYY-MM-DD).' };
    if (discharge > spec || (adm && discharge > adm)) return { valid: false, message: 'The earlier discharge must be on or before the specimen date, and before this admission.' };
  }
  const prior = pick(PRIORS, o.priorPositive);
  if (!prior) return { valid: false, message: 'Choose whether the patient has a previous C. difficile positive: the duplicate, incident and recurrent rules turn on it.' };
  let last = null;
  if (prior.value !== 'no-earlier-positive') {
    last = date(o.priorPositiveDate);
    if (!last) return { valid: false, message: 'Enter the collection date of the most recent previous positive (YYYY-MM-DD).' };
    if (last >= spec) return { valid: false, message: 'The previous positive must be before this specimen.' };
  }
  let rate = null;
  if (!blank(o.events) || !blank(o.patientDays)) {
    const f = inputFault([['the number of events', o.events, 0, 100000, ''], ['the patient days', o.patientDays, null, 10000000, '']]);
    if (f) return { valid: false, message: f };
    rate = Number(o.events) / Number(o.patientDays) * 10000;
  }

  const notes = [];
  // Day number from the previous positive: its own date is day 1.
  const dayN = last === null ? null : days(spec, last) + 1;
  if (dayN !== null) notes.push(`The previous positive's collection date is day 1, so this specimen, ${days(spec, last)} calendar day${days(spec, last) === 1 ? '' : 's'} later, is on day ${dayN}.`);
  if (prior.value === 'earlier-positive-here' && dayN <= 14) {
    return { valid: true, flag: 'duplicate', abnormal: true, dayFromPrior: dayN, onset: null, assay: null, band: `Duplicate, not a LabID event: day ${dayN} after the previous positive for the same patient and location, which is day 14 or earlier.`, bandLabel: 'Duplicate',
      notes: [...notes, 'The protocol wants 14 days with no positive for the patient and location before another event is entered; the earliest is day 15.', 'The 14-day rule is specific to the location and resets when the patient transfers to a new inpatient location.'], note: NOTE };
  }
  // Onset.
  const sinceDischarge = discharge === null ? null : days(spec, discharge);
  const recent = sinceDischarge !== null && sinceDischarge <= 28;
  let onset; let hd = null;
  if (inpatient) {
    hd = days(spec, adm) + 1;
    notes.push(`Hospital day ${hd}: the admission date is hospital day 1.`);
    onset = hd >= 4 ? 'HO' : recent ? 'CO-HCFA' : 'CO';
  } else onset = recent ? 'CO-HCFA' : 'CO';
  if (sinceDischarge !== null) notes.push(`The earlier inpatient discharge was ${sinceDischarge} day${sinceDischarge === 1 ? '' : 's'} before the specimen (${recent ? '28 days or fewer' : 'more than 28 days'}). The protocol states no day-1 convention for this window, so the plain date difference is used.`);
  const ONSET = { HO: 'Healthcare facility-onset (HO)', CO: 'Community-onset (CO)', 'CO-HCFA': 'Community-onset healthcare facility-associated (CO-HCFA)' };
  const why = onset === 'HO' ? `collected in an inpatient location on hospital day ${hd}, which is day 4 or later`
    : onset === 'CO-HCFA' ? `${inpatient ? `collected on hospital day ${hd} (day 1, 2 or 3)` : 'collected in an outpatient location'}, with an inpatient discharge from the same facility ${sinceDischarge} day${sinceDischarge === 1 ? '' : 's'} earlier`
      : `${inpatient ? `collected on hospital day ${hd} (day 1, 2 or 3)` : 'collected in an outpatient location'}, with no inpatient discharge from the facility in the 28 days before`;
  // Incident, recurrent or unassigned.
  const assay = dayN === null ? 'incident' : dayN <= 14 ? 'unassigned' : dayN <= 56 ? 'recurrent' : 'incident';
  const assayWhy = dayN === null ? 'no previous event' : dayN <= 14 ? `day ${dayN}, 14 days or fewer after the most recent event` : dayN <= 56 ? `day ${dayN}, more than 14 and 56 or fewer days after the most recent event` : `day ${dayN}, more than 56 days after the most recent event`;
  if (prior.value === 'earlier-positive-elsewhere' && dayN <= 14) notes.push('The previous positive was in another location, so the same-location duplicate rule does not apply; the incident or recurrent field is left unassigned at 14 days or fewer.');
  if (rate !== null) notes.push(`Rate: ${Number(o.events)} event${Number(o.events) === 1 ? '' : 's'} ÷ ${Number(o.patientDays).toLocaleString('en-US')} patient days × 10,000 = ${(Math.round(rate * 100) / 100).toLocaleString('en-US')} per 10,000 patient days.`);
  notes.push('A standardized infection ratio is observed events divided by the predicted number from the facility\'s NHSN report; this tool does not predict.');
  return {
    valid: true, flag: onset === 'HO' ? 'healthcare-facility-onset' : onset === 'CO' ? 'community-onset' : 'community-onset-facility-associated', abnormal: false,
    onset, assay, hospitalDay: hd, dayFromPrior: dayN, ratePer10000: rate === null ? null : Number(rate.toFixed(2)),
    band: `${ONSET[onset]}: ${why}. ${assay === 'unassigned' ? 'Incident or recurrent: unassigned' : `${assay[0].toUpperCase()}${assay.slice(1)}`} (${assayWhy}).`,
    bandLabel: `${onset}, ${assay}`, notes, note: NOTE,
  };
}
