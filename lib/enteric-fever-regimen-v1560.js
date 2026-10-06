// spec-v1560 tool 4: the empiric antibiotic for enteric (typhoid) fever by severity and local fluoroquinolone
// resistance (WHO AWaRe 2022).
//
// Source: WHO. The WHO AWaRe (Access, Watch, Reserve) antibiotic book, 2022 (IRIS 10665/365237; CC BY-NC-SA 3.0
// IGO, facts restated, nothing reproduced), chapter 15 and Table 15.2, read October 6, 2026: mild means not
// critically ill with no sign of intestinal perforation; severe means critically ill with confirmed or suspected
// intestinal perforation, peritonitis, sepsis or septic shock. Low risk of fluoroquinolone resistance:
// ciprofloxacin 500 mg every 12 hours by mouth (adults); children 15 mg/kg a dose every 12 hours, banded 3 to under
// 6 kg 50 mg, 6 to under 10 kg 100 mg, 10 to under 15 kg 150 mg, 15 to under 20 kg 200 mg, 20 to under 30 kg 300 mg,
// 30 kg or more the adult dose. High risk: mild, azithromycin 1 g on day 1 then 500 mg once a day (adults), 20 mg/kg
// once a day (children); severe, ceftriaxone 2 g IV once a day (adults), 80 mg/kg once a day (children). Duration 7
// days for mild, 10 days for severe if improving and fever-free for 48 hours. No resistance prevalence defines low
// versus high risk. Widal serology is not reliable. Extensively drug-resistant typhoid has been reported (Pakistan
// since 2016).
//
// Stated rather than hidden: the chapter prints no maximum for the child azithromycin and ceftriaxone doses; the
// answer shows the mg/kg figure beside the adult dose.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const SEVERITY_OPTIONS = [
  { value: 'mild', text: 'Not critically ill, no sign of perforation' },
  { value: 'severe', text: 'Critically ill: perforation, peritonitis, sepsis or shock' },
];
export const RESISTANCE_OPTIONS = [{ value: 'low', text: 'Low risk of fluoroquinolone resistance' }, { value: 'high', text: 'High risk of fluoroquinolone resistance' }];
export const AGE_OPTIONS = [{ value: 'adult', text: 'Adult' }, { value: 'child', text: 'Child' }];

const CIPRO = [[3, 50], [6, 100], [10, 150], [15, 200], [20, 300]];
const NOTE = 'This follows the WHO AWaRe antibiotic book (2022), chapter 15. Your national protocol may differ; follow it.';

export function entericFeverRegimen(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const sev = SEVERITY_OPTIONS.find((x) => x.value === o.severity);
  if (!sev) return { valid: false, message: 'Choose the severity: not critically ill, or critically ill with perforation, peritonitis, sepsis or shock.' };
  const res = RESISTANCE_OPTIONS.find((x) => x.value === o.resistance);
  if (!res) return { valid: false, message: 'Choose the local risk of fluoroquinolone resistance (a local fact): low or high.' };
  const age = AGE_OPTIONS.find((x) => x.value === o.ageGroup);
  if (!age) return { valid: false, message: 'Choose adult or child.' };
  let w = null;
  if (age.value === 'child') {
    const f = inputFault([['the weight', o.weight, 3, 120, 'kg']]);
    if (f) return { valid: false, message: `${f} WHO's child doses are by weight.` };
    w = Number(o.weight);
  }
  const days = sev.value === 'mild' ? '7 days' : '10 days, provided the patient is improving and has been fever-free for 48 hours';
  const notes = [`Total duration: ${days}.`, 'Widal serology is not a reliable way to diagnose enteric fever. No resistance prevalence formally defines low versus high risk.', 'Extensively drug-resistant typhoid (reported in Pakistan since 2016) needs drugs outside this chapter.'];
  let band;
  if (res.value === 'low') {
    if (age.value === 'adult' || w >= 30) band = `Ciprofloxacin 500 mg by mouth every 12 hours${age.value === 'child' ? ' (30 kg or more: the adult dose)' : ''}.`;
    else {
      const mg = [...CIPRO].reverse().find(([lo]) => w >= lo)[1];
      band = `Ciprofloxacin ${mg} mg by mouth every 12 hours (15 mg/kg a dose, WHO's band for ${w} kg).`;
    }
    notes.push('Fluoroquinolones can cause mental disturbance, severe blood sugar changes, tendon rupture and nerve damage.');
  } else if (sev.value === 'mild') {
    band = age.value === 'adult' ? 'Azithromycin 1 g by mouth on day 1, then 500 mg once a day.' : `Azithromycin ${Math.round(w * 20).toLocaleString('en-US')} mg by mouth once a day (20 mg/kg; the adult dose is 1 g on day 1, then 500 mg).`;
    notes.push('Azithromycin can prolong the QT interval: take care with a long QT or arrhythmia.');
  } else {
    band = age.value === 'adult' ? 'Ceftriaxone 2 g IV once a day.' : `Ceftriaxone ${Math.round(w * 80).toLocaleString('en-US')} mg IV once a day (80 mg/kg; the adult dose is 2 g).`;
  }
  return { valid: true, band, bandLabel: `${res.value === 'low' ? 'Ciprofloxacin' : sev.value === 'mild' ? 'Azithromycin' : 'Ceftriaxone'}, ${sev.value === 'mild' ? '7' : '10'} days`, abnormal: sev.value === 'severe', notes, note: NOTE };
}
