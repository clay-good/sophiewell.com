// spec-v1560 tool 5: scrub typhus (rickettsial disease) in India: the ICMR case definition and the
// doxycycline or azithromycin regimen.
//
// Source: DHR-ICMR. Guidelines for diagnosis and management of rickettsial diseases in India, 2015 (no
// licence stated; facts restated). Read October 6, 2026, sections 3.1 and 3.3 (pp. 15-17):
//   - Suspected: acute undifferentiated fever of 5 days or more, with or without an eschar; with an eschar,
//     fever under 5 days counts as scrub typhus. Probable: suspected plus Weil-Felix 1:80 or more (OX2, OX19,
//     OXK) and IgM ELISA optical density above 0.5. Confirmed: PCR positive (eschar or whole blood) or rising
//     titers on paired sera by IFA or IPA.
//   - Treat when rickettsial disease is suspected, without waiting for the laboratory. At primary level, for
//     fever of 5 days or more with malaria, dengue and typhoid ruled out: over 45 kg doxycycline 200 mg/day
//     in two doses for 7 days, or azithromycin 500 mg "in a single oral dose for 5 days"; under 45 kg
//     doxycycline 4.5 mg/kg/day in two doses, or azithromycin 10 mg/kg for 5 days; pregnancy azithromycin
//     500 mg for 5 days (doxycycline contraindicated). Complicated: IV doxycycline 100 mg twice daily then
//     oral to 7-15 days, IV azithromycin 500 mg daily for 1-2 days then oral to 5 days, or IV chloramphenicol
//     50-100 mg/kg/day in 4 doses then oral to 7-15 days; refer ARDS, kidney failure, meningoencephalitis or
//     multi-organ dysfunction, starting doxycycline first.
//
// Stated rather than hidden: "500 mg in a single oral dose for 5 days" is read as once daily for 5 days; the
// child doxycycline duration is not stated and none is printed; exactly 45 kg, which ICMR leaves between its
// bands, takes the child per-kg dose.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];
export const TEST_OPTIONS = [
  { value: 'pos', text: 'Positive' },
  { value: 'neg', text: 'Negative' },
  { value: 'notdone', text: 'Not done' },
];

const NOTE = 'This follows the DHR-ICMR 2015 guidelines for rickettsial diseases in India. Start treatment on suspicion, without waiting for the laboratory.';
const mg = (x) => `${Math.round(x)} mg`;

export function scrubTyphusIcmr(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the days of fever', o.feverDays, 0, 60, 'days'], ['the weight', o.weight, 2, 250, 'kg']]);
  if (f) return { valid: false, message: f };
  const days = Number(o.feverDays);
  const kg = Number(o.weight);
  const t = (k) => (TEST_OPTIONS.some((x) => x.value === o[k]) ? o[k] : 'notdone');
  const notes = [];
  const out = (band, label, abnormal) => ({ valid: true, band, bandLabel: label, abnormal, notes, note: NOTE });

  const eschar = o.eschar === 'yes' ? 'yes' : o.eschar === 'no' ? 'no' : null;
  const suspected = days >= 5 || eschar === 'yes';
  if (!suspected) {
    if (eschar === null) return out(`Not a suspected case yet: fever of ${days} day${days === 1 ? '' : 's'}, and the eschar was not assessed. Look for one (a painless black-centered ulcer, often in the groin, armpit or under the waistband): with an eschar, fever under 5 days counts.`, 'Not decided', true);
    return out(`Not a suspected case: fever under 5 days and no eschar. Reassess if the fever reaches 5 days.`, 'Not suspected', false);
  }

  let cls = 'Suspected';
  if (t('confirm') === 'pos') cls = 'Confirmed';
  else if (t('wf') === 'pos' && t('igm') === 'pos') cls = 'Probable';
  const why = { Suspected: days >= 5 ? `fever of ${days} days` : 'fever under 5 days with an eschar', Probable: 'suspected, with Weil-Felix 1:80 or more and IgM ELISA OD above 0.5', Confirmed: 'PCR positive or rising paired titers' }[cls];
  if (cls === 'Suspected' && (t('wf') === 'pos') !== (t('igm') === 'pos')) notes.push('Probable needs both a Weil-Felix of 1:80 or more and an IgM ELISA OD above 0.5.');

  const pregnant = o.pregnant === 'yes';
  const adult = kg > 45;
  let rx;
  if (o.complicated === 'yes') {
    rx = `Complicated: IV doxycycline 100 mg twice daily then oral to complete 7-15 days, or IV azithromycin 500 mg once daily for 1-2 days then oral to complete 5 days${pregnant ? ' (azithromycin in pregnancy)' : ''}, or IV chloramphenicol 50-100 mg/kg/day (${mg(50 * kg)}-${mg(100 * kg)} a day) in 4 doses then oral to complete 7-15 days. Refer ARDS, kidney failure, meningoencephalitis or multi-organ dysfunction, starting doxycycline first.`;
  } else if (pregnant) {
    rx = 'Pregnancy: azithromycin 500 mg once daily for 5 days (doxycycline is contraindicated).';
  } else if (adult) {
    rx = 'Doxycycline 100 mg twice daily for 7 days (with plenty of fluid, sitting or standing), or azithromycin 500 mg once daily for 5 days.';
  } else {
    rx = `Doxycycline 4.5 mg/kg/day in two doses = ${Math.round(2.25 * kg * 10) / 10} mg twice daily (ICMR states no duration for children), or azithromycin 10 mg/kg = ${mg(10 * kg)} once daily for 5 days.`;
  }
  if (o.complicated !== 'yes' && o.complicated !== 'no') notes.push('Complicated disease: not entered. ARDS, kidney failure, meningoencephalitis or multi-organ dysfunction would need IV treatment and referral.');
  if (o.pregnant !== 'yes' && o.pregnant !== 'no' && adult) notes.push('Pregnancy: not entered. In pregnancy azithromycin is used, never doxycycline.');
  if (o.ruledOut !== 'yes') notes.push(`ICMR's primary-level rule treats fever of 5 days or more once malaria, dengue and typhoid are ruled out${o.ruledOut === 'no' ? ': they have not been' : ' (not entered)'}. Keep pneumonia and leptospirosis in mind too.`);
  notes.push('The azithromycin "single oral dose for 5 days" is read as once daily for 5 days.');
  return out(`${cls} scrub typhus (${why}); treat now, without waiting for the laboratory. ${rx}`, cls, true);
}
