// spec-v1638 tool 8: does a member meet the Part D drug management program (overutilization
// monitoring) criteria?
//
// Sources, re-read October 12, 2026:
//   CMS, "Part D Drug Management Programs" guidance, Rev. 7, December 16, 2025, sections 4.1 and
//     4.2. Minimum criteria (1 OR 2): "1) ... Use of opioids with average daily MME > 90 mg for any
//     duration during the most recent 6 months AND either: 3+ opioid prescribers AND 3+ opioid
//     dispensing pharmacies; OR 5+ opioid prescribers (regardless of the number of opioid
//     dispensing pharmacies)"; "2) ... A medical claim with a primary diagnosis of opioid-related
//     overdose within the most recent 12 months; AND A Part D opioid prescription (not including
//     MAT) within the most recent 6 months." Supplemental: "Use of opioids (regardless of average
//     daily MME) during the most recent 6 months; AND 7+ opioid prescribers OR 7+ opioid
//     dispensing pharmacies". "Prescribers associated with the same single Tax Identification
//     Numbers (TIN) are counted as a single prescriber. Pharmacies with multiple locations that
//     share real-time data are counted as one pharmacy." Buprenorphine products are left out of
//     the MME and counted toward prescribers and pharmacies.
//   42 CFR 423.100 (eCFR as current October 8, 2026), exempted beneficiary: hospice, palliative or
//     end-of-life care; a resident of a long-term care facility, of a facility described in
//     section 1905(d) of the Act, or of another facility whose frequently abused drugs come
//     through a contract with a single pharmacy; cancer-related pain; sickle cell disease.
// Criterion 1 is "> 90": exactly 90 does not meet it. (The point-of-sale care coordination edit
// is a different test, at 90 or more.) CMS reissues the guidance each winter.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const opt = (value, text) => ({ value, text });
export const YES_NO = [opt('yes', 'Yes'), opt('no', 'No')];
export const EXEMPT = [
  opt('no-exemption', 'None of these'),
  opt('hospice-or-eol-status', 'Hospice, palliative or end-of-life care'),
  opt('facility-resident', 'Resident of a long-term care facility, a section 1905(d) facility, or a facility served by a single contracted pharmacy'),
  opt('cancer-related-pain', 'Being treated for cancer-related pain'),
  opt('scd-diagnosis', 'Sickle cell disease'),
];
const yn = (v) => (String(v ?? '').trim() === 'yes' ? true : String(v ?? '').trim() === 'no' ? false : null);
const whole = (label, v) => inputFault([[label, v, 0, 500, '']]) || (Number.isInteger(Number(v)) ? null : `Enter ${label} as a whole number.`);

export function partdDmpCriteriaCheck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const ex = EXEMPT.find((e) => e.value === String(o.exemption ?? '').trim());
  if (!ex) return { valid: false, message: 'Choose whether an exemption applies: an exempted beneficiary cannot be a potential at-risk beneficiary.' };
  if (ex.value !== 'no-exemption') {
    const notes = [`Exempted beneficiary (42 CFR 423.100): ${ex.text.charAt(0).toLowerCase()}${ex.text.slice(1)}. An exempted beneficiary is not placed in a drug management program, whatever the counts.`];
    return { valid: true, flag: 'exempted-beneficiary', exempt: true, meets: [], abnormal: false, band: 'Exempted: the drug management program criteria do not apply.', bandLabel: 'Exempted beneficiary', notes, note: notes.join(' ') };
  }
  const f = inputFault([['the highest average daily MME in the most recent 6 months, with buprenorphine left out (0 if no opioid)', o.averageDailyMme, 0, 100000, 'MME']]);
  if (f) return { valid: false, message: f };
  for (const [label, v] of [['the number of opioid prescribers in the most recent 6 months', o.prescribers], ['the number of opioid dispensing pharmacies in the most recent 6 months', o.pharmacies]]) { const g = whole(label, v); if (g) return { valid: false, message: g }; }
  const opioid = yn(o.opioidFill); const overdose = yn(o.overdoseClaim);
  if (opioid === null) return { valid: false, message: 'Choose yes or no: was there a Part D opioid fill, other than medication for opioid use disorder, in the most recent 6 months?' };
  if (overdose === null) return { valid: false, message: 'Choose yes or no: is there a medical claim with a primary diagnosis of opioid-related overdose in the most recent 12 months?' };
  const mme = Number(o.averageDailyMme); const rx = Number(o.prescribers); const ph = Number(o.pharmacies);
  const counts = (rx >= 3 && ph >= 3) || rx >= 5;
  const c1 = mme > 90 && counts;
  const c2 = overdose && opioid;
  const sup = (mme > 0 || opioid) && (rx >= 7 || ph >= 7);
  const notes = [
    `Minimum criterion 1: average daily MME ${mme} against "> 90" (${mme > 90 ? 'met' : mme === 90 ? 'not met: exactly 90 is not greater than 90' : 'not met'}); ${rx} opioid prescriber${rx === 1 ? '' : 's'} and ${ph} opioid dispensing pharmac${ph === 1 ? 'y' : 'ies'} against "3 or more and 3 or more, or 5 or more prescribers" (${counts ? 'met' : 'not met'}): ${c1 ? 'met' : 'not met'}.`,
    `Minimum criterion 2: an opioid-related overdose claim in the most recent 12 months (${overdose ? 'yes' : 'no'}) and a Part D opioid fill other than medication for opioid use disorder in the most recent 6 months (${opioid ? 'yes' : 'no'}): ${c2 ? 'met' : 'not met'}.`,
    `Supplemental criteria, at the sponsor's option: any opioid use in the most recent 6 months and 7 or more opioid prescribers or 7 or more opioid dispensing pharmacies: ${sup ? 'met' : 'not met'}.`,
  ];
  const meets = [c1 && 'minimum criterion 1', c2 && 'minimum criterion 2', sup && 'the supplemental criteria'].filter(Boolean);
  if (!meets.length) notes.push('A member who meets none of the criteria cannot be identified as a potential at-risk beneficiary on them.');
  else if (c1 || c2) notes.push('A sponsor must review every member who meets the minimum criteria and engage in case management with the prescribers, unless it finds the member exempt or that the criteria are not met on plan information.');
  else notes.push('The supplemental criteria are for the sponsor to apply at a level it can manage; they are not a required review.');
  notes.push('Counting: prescribers sharing one tax identification number count once; pharmacy locations sharing real-time data count once. Buprenorphine products are left out of the MME but count toward the prescriber and pharmacy counts. The MME is as entered; this does not compute it.');
  notes.push('Meeting the criteria identifies a potential at-risk beneficiary for case management. It is not a finding of misuse and not a prescribing limit. CMS guidance, Rev. 7 (December 16, 2025); it is reissued each winter.');
  return { valid: true, exempt: false, criterion1: c1, criterion2: c2, supplemental: sup, meets, flag: c1 || c2 ? 'meets-minimum-criteria' : sup ? 'meets-supplemental-criteria' : 'meets-none', abnormal: false, band: meets.length ? `Meets ${meets.join(' and ')}.` : 'Meets none of the drug management program criteria.', bandLabel: c1 || c2 ? 'Minimum criteria met' : sup ? 'Supplemental criteria only' : 'No criteria met', notes, note: notes.join(' ') };
}
