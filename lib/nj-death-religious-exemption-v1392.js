// spec-v1392: New Jersey declaration of death -- the religious exemption, N.J.S.A. 26:6A-5.
//
// Source: N.J.S.A. 26:6A-5 (FindLaw text, "current as of January 1, 2024", read 2026-09-18): death
// "shall not be declared upon the basis of neurological criteria" when the physician authorized to
// declare death "has reason to believe, on the basis of information in the individual's available
// medical records, or information provided by a member of the individual's family or any other
// person knowledgeable about the individual's personal religious beliefs that such a declaration
// would violate the personal religious beliefs of the individual. In these cases, death shall be
// declared, and the time of death fixed, solely upon the basis of cardio-respiratory criteria".
//
// Pure: no DOM, no clock, no network.

import { scopeSentence } from './state-calendar.js';

export const NJD_VERIFIED = '2026-09-18';
export const BELIEF = [
  { value: 'yes', text: 'Yes: there is reason to believe it would violate their beliefs' },
  { value: 'no', text: 'No such information' },
];
export const SOURCES = [
  { value: 'records', text: 'The available medical records' },
  { value: 'family', text: 'A family member' },
  { value: 'other', text: 'Another person who knows their religious beliefs' },
];

export function njDeathReligiousExemption(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (o.belief !== 'yes' && o.belief !== 'no') {
    return { valid: false, message: 'Answer whether the physician has reason to believe a neurological declaration would violate the person\'s religious beliefs. Check the records and ask the family first.' };
  }
  const base = { valid: true, postureNote: scopeSentence(NJD_VERIFIED) };
  if (o.belief === 'no') {
    return {
      ...base, exempt: false, abnormal: false,
      bandLabel: 'Neurological criteria may be used',
      band: 'With no information that it would violate the person\'s religious beliefs, death may be declared on neurological criteria under the Act\'s other sections, which are not checked here.',
      askNote: 'The exemption turns on the medical records, the family, or anyone who knows the person\'s beliefs, so check those before declaring.',
    };
  }
  const src = SOURCES.find((s) => s.value === o.source);
  return {
    ...base, exempt: true, abnormal: true,
    bandLabel: 'Cardiorespiratory criteria only',
    band: `Death may not be declared on neurological criteria. Declare death, and fix its time, solely on cardiorespiratory criteria (N.J.S.A. 26:6A-5).${src ? ` Basis: ${src.text.toLowerCase()}.` : ''}`,
    askNote: 'Record the source of the information in the chart.',
  };
}
