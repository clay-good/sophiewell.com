// spec-v1395: New York's required HIV and hepatitis C test offers.
//
// Sources (nysenate.gov text read 2026-09-18):
//   Public Health Law 2781-a: an HIV-related test is offered to "every individual age thirteen and
//   older (or younger than thirteen if there is evidence or indication of risk activity)" receiving
//   inpatient hospital or emergency department services, or primary care (hospital outpatient
//   departments, diagnostic and treatment centers, and physician, PA, NP, and midwife offices).
//   Public Health Law 2171: a hepatitis C screening test is offered to "every individual age eighteen
//   and older (or younger than eighteen if there is evidence or indication of risk activity)" in the
//   same kinds of settings. A reactive screen is followed by an HCV RNA test, and a person with
//   detectable RNA is offered follow-up care and treatment or referred to a provider who can give it.
//   Both sections excuse the offer when the person is being treated for a life-threatening
//   emergency, has already been offered or tested (unless otherwise indicated), or lacks capacity to
//   consent.
//
// There is no New York hepatitis B offer law in these sections; the tile says so rather than imply
// one.
//
// Pure: no DOM, no clock, no network.

import { scopeSentence } from './state-calendar.js';

export const NYOFFER_VERIFIED = '2026-09-18';
export const SETTINGS = [
  { value: 'inpatient', text: 'Hospital inpatient' },
  { value: 'ed', text: 'Emergency department' },
  { value: 'primary', text: 'Primary care (office, clinic, or hospital outpatient)' },
  { value: 'other', text: 'Another setting' },
];
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}

function offer(test, minAge, o, age) {
  const name = test === 'hiv' ? 'HIV test' : 'hepatitis C screening test';
  const risk = o.risk === 'yes';
  if (o.setting === 'other') return { required: false, text: `No ${name} offer is required in this setting under the section.` };
  if (age < minAge && !risk) return { required: false, text: `No ${name} offer is required under ${minAge} unless there is evidence or indication of risk activity.` };
  if (o.emergency === 'yes') return { required: false, text: 'Not required while the person is being treated for a life-threatening emergency.' };
  if (o.capacity === 'no') return { required: false, text: `Not required while the person lacks capacity to consent to a ${name}.` };
  const prior = test === 'hiv' ? o.priorHiv : o.priorHcv;
  if (prior === 'yes') return { required: false, text: `Not required again: already offered or tested, unless otherwise clinically indicated.` };
  return { required: true, text: `Offer ${test === 'hiv' ? 'an' : 'a'} ${name}${age < minAge ? ' (under ' + minAge + ' with evidence or indication of risk activity)' : ''}.` };
}

export function nyHivHcvTestOffer(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = Number(String(o.age ?? '').trim());
  if (isBlank(o.age) || !Number.isFinite(age) || age < 0 || age > 120) return { valid: false, message: 'Enter the age in years. The HIV offer starts at 13 and the hepatitis C offer at 18.' };
  if (isBlank(o.setting) || !SETTINGS.some((s) => s.value === o.setting)) return { valid: false, message: 'Choose the setting. The offers apply to inpatient, emergency department, and primary care.' };
  for (const [k, what] of [['emergency', 'whether this is treatment for a life-threatening emergency'], ['capacity', 'whether the person has capacity to consent'], ['priorHiv', 'whether an HIV test was already offered or done'], ['priorHcv', 'whether a hepatitis C screen was already offered or done']]) {
    if (isBlank(o[k]) || !['yes', 'no'].includes(o[k])) return { valid: false, message: `Answer ${what}. Each is an exception, and an unanswered one is not a yes.` };
  }
  const hiv = offer('hiv', 13, o, age);
  const hcv = offer('hcv', 18, o, age);
  const both = [hiv.required && 'HIV', hcv.required && 'hepatitis C'].filter(Boolean);
  return {
    valid: true,
    hivRequired: hiv.required,
    hcvRequired: hcv.required,
    abnormal: both.length > 0,
    bandLabel: both.length ? `Offer: ${both.join(' and ')}` : 'No offer required now',
    band: `HIV (Public Health Law 2781-a): ${hiv.text} Hepatitis C (Public Health Law 2171): ${hcv.text}`,
    reactiveNote: 'A reactive hepatitis C screen is followed by an HCV RNA test; a person with detectable RNA is offered follow-up care and treatment or referred to a provider who can give it.',
    hbvNote: 'New York has no hepatitis B test-offer law in these sections; CDC recommends screening every adult once (see the hepatitis B serology interpreter).',
    postureNote: scopeSentence(NYOFFER_VERIFIED),
  };
}
