// spec-v1393: may a Texas physician delegate this controlled-substance prescription to an APRN or PA?
//
// Source: Tex. Occupations Code 157.0511 (texas.public.law text read 2026-09-18; last amended by
// Acts 2013, S.B. 406).
//
//   (b)   Schedule III, IV, or V may be delegated only if the prescription, INCLUDING REFILLS, is
//         for no more than 90 days; a refill is authorized after consultation with the delegating
//         physician, noted in the chart; and a prescription for a child under two is made after
//         consultation, noted in the chart.
//   (b-1) Schedule II may be delegated ONLY (1) in a hospital facility-based practice under 157.054,
//         under policies approved by the medical staff, for a patient admitted for an intended stay
//         of 24 hours or more or receiving services in the emergency department; or (2) under the
//         plan of care of a patient who has certified a terminal illness, elected hospice, and is
//         receiving hospice treatment from a qualified provider.
//   (b-2) The delegating physician registers the APRN or PA with the Texas Medical Board.
//
// THE TRAP: Schedule II delegation is limited by SETTING. An APRN in a clinic cannot be delegated a
// Schedule II prescription at all, however short.
//
// Pure: no DOM, no clock, no network.

import { scopeSentence } from './state-calendar.js';

export const TX_DELEG_VERIFIED = '2026-09-18';
export const TX_DELEG_NOTE = 'Tex. Occupations Code 157.0511. Schedule III to V: delegable for up to 90 days including refills; a refill, and any prescription for a child under 2, needs a consultation with the delegating physician noted in the chart. Schedule II: delegable only in a hospital facility-based practice under medical-staff policy, for an inpatient with an intended stay of 24 hours or more or an emergency department patient, or under a hospice plan of care. The physician registers the delegate with the Texas Medical Board.';

export const SCHEDULES = [
  { value: 'II', text: 'Schedule II' },
  { value: 'III', text: 'Schedule III' },
  { value: 'IV', text: 'Schedule IV' },
  { value: 'V', text: 'Schedule V' },
];
export const SETTINGS = [
  { value: 'clinic', text: 'Clinic, office, or other outpatient practice' },
  { value: 'hospital-inpatient', text: 'Hospital, admitted for an intended stay of 24 hours or more' },
  { value: 'hospital-ed', text: 'Hospital emergency department' },
  { value: 'hospital-short', text: 'Hospital, stay under 24 hours (not the emergency department)' },
  { value: 'hospice', text: 'Hospice plan of care (terminal illness certified, hospice elected)' },
];
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];
export const YES_NO_UNKNOWN = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
  { value: 'not-assessed', text: 'Not assessed' },
];

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}

export function txAprnPaControlledDelegation(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (isBlank(o.schedule) || !SCHEDULES.some((s) => s.value === o.schedule)) return { valid: false, message: 'Choose the schedule. Schedule II follows a different rule from III to V.' };
  if (isBlank(o.setting) || !SETTINGS.some((s) => s.value === o.setting)) return { valid: false, message: 'Choose the setting. Schedule II delegation depends on it.' };
  const days = Number(String(o.days ?? '').trim());
  if (isBlank(o.days) || !Number.isFinite(days) || days <= 0 || days > 365) return { valid: false, message: 'Enter the days the prescription covers, including refills, from 1 to 365.' };
  if (isBlank(o.refill) || !['yes', 'no'].includes(o.refill)) return { valid: false, message: 'Say whether this is a refill.' };
  if (isBlank(o.under2) || !['yes', 'no'].includes(o.under2)) return { valid: false, message: 'Say whether the patient is younger than 2.' };

  const problems = [];
  const chart = [];
  const unassessed = [];

  if (o.schedule === 'II') {
    const s = o.setting;
    if (s === 'hospital-inpatient' || s === 'hospital-ed') {
      if (o.hospitalPolicy === 'no') problems.push('Schedule II delegation in a hospital requires policies approved by the medical staff, and there are none.');
      else if (o.hospitalPolicy !== 'yes') unassessed.push('whether the hospital\'s medical staff has approved policies for Schedule II delegation, which 157.0511(b-1)(1) requires');
    } else if (s === 'hospice') {
      chart.push('Keep the written certification of terminal illness and the hospice election in the record.');
    } else {
      problems.push(s === 'hospital-short'
        ? 'Schedule II may be delegated in a hospital only for a patient admitted for an intended stay of 24 hours or more, or in the emergency department.'
        : 'Schedule II may not be delegated in a clinic or office: only in a hospital facility-based practice (inpatient 24 hours or more, or the emergency department) or under a hospice plan of care.');
    }
  } else {
    if (days > 90) problems.push(`${days} days is over the 90 days, including refills, that a delegated Schedule ${o.schedule} prescription may cover.`);
    if (o.refill === 'yes') {
      if (o.refillConsulted === 'no') problems.push('A refill of a delegated prescription is authorized only after consultation with the delegating physician.');
      else if (o.refillConsulted === 'yes') chart.push('Note the refill consultation with the delegating physician in the chart.');
      else unassessed.push('whether the delegating physician was consulted on the refill, which 157.0511(b)(3) requires');
    }
    if (o.under2 === 'yes') {
      if (o.under2Consulted === 'no') problems.push('A prescription for a child younger than 2 is made only after consultation with the delegating physician.');
      else if (o.under2Consulted === 'yes') chart.push('Note the consultation for a child younger than 2 in the chart.');
      else unassessed.push('whether the delegating physician was consulted for a child younger than 2, which 157.0511(b)(4) requires');
    }
  }

  let verdict;
  let band;
  if (problems.length) {
    verdict = 'no';
    band = `Not delegable as entered. ${problems.join(' ')}`;
  } else if (unassessed.length) {
    verdict = 'unassessed';
    band = `Not yet answerable: ${unassessed.join('; ')}.`;
  } else {
    verdict = 'yes';
    band = `Delegable under 157.0511${o.schedule === 'II' ? '(b-1)' : '(b)'}.${chart.length ? ' ' + chart.join(' ') : ''}`;
  }
  return {
    valid: true,
    verdict,
    abnormal: verdict !== 'yes',
    bandLabel: verdict === 'yes' ? 'Delegable' : (verdict === 'no' ? 'Not delegable' : 'Not assessed'),
    band,
    problems,
    chart,
    registrationNote: 'The delegating physician registers the APRN or PA with the Texas Medical Board (157.0511(b-2)).',
    postureNote: scopeSentence(TX_DELEG_VERIFIED),
    note: TX_DELEG_NOTE,
  };
}
