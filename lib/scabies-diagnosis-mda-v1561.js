// spec-v1561 tool 7: scabies: confirmed, clinical or suspected (2020 IACS criteria), and ivermectin by weight,
// with the mass drug administration (MDA) threshold (WHO 2025).
//
// Source: WHO. Control of scabies: a guide for national programme managers, 2025 (IRIS 10665/386253; CC
// BY-NC-SA 3.0 IGO, facts restated). Read October 6, 2026:
//   - Box 1 (p. 6), 2020 IACS criteria: A confirmed (A1 mites, eggs or feces on microscopy; A2 on a
//     high-powered imaging device; A3 a mite on dermoscopy); B clinical (B1 burrows; B2 typical lesions on
//     male genitals; B3 typical lesions in a typical distribution with both history features); C suspected
//     (C1 typical lesions in a typical distribution with one history feature; C2 atypical lesions or
//     distribution with both). History: H1 itch, H2 a contact with itch. B and C only if other diagnoses are
//     less likely. Primary care (p. 5): typical lesions in a typical distribution with itch or a positive
//     contact history, the contact counting as positive where prevalence is over 10%.
//   - MDA (pp. 2-3, 20-21): 10% or more, MDA until about 2%; 2-10% a local decision; below 2%, no MDA.
//   - Box 7 (p. 24): ivermectin 200 micrograms/kg, rounded up to 3 mg tablets, two doses 7-14 days apart,
//     directly observed; by weight or height, never by age. Not under 15 kg or 90 cm, in pregnancy, within a
//     week of giving birth, sick or infirm, prior hypersensitivity, or warfarin; then 5% permethrin.
//
// Stated rather than hidden: section 2.3.1.2 also lists "under 5 years", which Box 7 does not; the tile
// follows Box 7 and prints the other. The Solomon Islands height stick is a labelled country example only.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];
export const LESION_OPTIONS = [
  { value: 'typical', text: 'Typical lesions in a typical distribution' },
  { value: 'atypical', text: 'Atypical lesions or atypical distribution' },
  { value: 'none', text: 'No lesions of scabies' },
];

const NOTE = 'This follows WHO\'s 2025 guide to scabies control (2020 IACS criteria, Box 7 treatment).';
const y = (v) => v === 'yes';
const known = (v) => v === 'yes' || v === 'no';

export function scabiesDiagnosisMda(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let prev = null;
  if (String(o.prevalence ?? '').trim() !== '') {
    const fp = inputFault([['the community prevalence', o.prevalence, 0, 100, '%']]);
    if (fp) return { valid: false, message: fp };
    prev = Number(o.prevalence);
  }
  let kg = null;
  if (String(o.weight ?? '').trim() !== '') {
    const fw = inputFault([['the weight', o.weight, 1, 250, 'kg']]);
    if (fw) return { valid: false, message: fw };
    kg = Number(o.weight);
  }
  const lesions = LESION_OPTIONS.find((x) => x.value === o.lesions);
  const typical = lesions?.value === 'typical';
  const atypical = lesions?.value === 'atypical';
  const hist = [y(o.itch), y(o.contact)].filter(Boolean).length;
  const histOpen = [known(o.itch) ? null : 'itch', known(o.contact) ? null : 'a contact with itch'].filter(Boolean);

  let level = null;
  let why = '';
  if (y(o.micro)) { level = 'Confirmed scabies (level A)'; why = 'the mite, eggs or feces seen'; }
  else if (y(o.burrows)) { level = 'Clinical scabies (level B)'; why = 'burrows'; }
  else if (y(o.genital)) { level = 'Clinical scabies (level B)'; why = 'typical lesions on the male genitals'; }
  else if (typical && hist === 2) { level = 'Clinical scabies (level B)'; why = 'typical lesions in a typical distribution with itch and a contact'; }
  else if (typical && hist === 1) { level = 'Suspected scabies (level C)'; why = 'typical lesions in a typical distribution with one history feature'; }
  else if (atypical && hist === 2) { level = 'Suspected scabies (level C)'; why = 'atypical lesions or distribution with itch and a contact'; }

  const notes = [];
  if (level && !level.startsWith('Confirmed') && o.otherLess !== 'yes') notes.push('Clinical and suspected scabies need other diagnoses to be less likely than scabies: not entered as so.');
  const primary = typical && (y(o.itch) || y(o.contact) || (prev !== null && prev > 10));
  if (primary) notes.push(`Meets the WHO primary-care diagnosis: typical lesions in a typical distribution with ${y(o.itch) ? 'itch' : y(o.contact) ? 'a contact' : 'a contact counted as positive where prevalence is over 10%'}.`);
  if (!level && !primary) {
    const open = [lesions ? null : 'the lesions', ...histOpen, known(o.burrows) ? null : 'burrows'].filter(Boolean);
    if (open.length) return { valid: true, band: `Not decided: no criterion met so far, and ${open.join(', ')} not assessed.`, bandLabel: 'Not decided', abnormal: false, notes, note: NOTE };
    return { valid: true, band: 'Does not meet the scabies criteria on what was entered.', bandLabel: 'Criteria not met', abnormal: false, notes, note: NOTE };
  }

  // Ivermectin.
  const contra = [];
  if (kg !== null && kg < 15) contra.push('under 15 kg');
  if (y(o.pregnant)) contra.push('pregnancy');
  if (y(o.postpartum)) contra.push('within a week of giving birth');
  if (y(o.warfarin)) contra.push('warfarin');
  if (y(o.ill)) contra.push('severe illness');
  if (contra.length) notes.push(`No ivermectin (${contra.join(', ')}): use 5% permethrin cream, two applications 7-14 days apart.`);
  else if (kg !== null) {
    const tabs = Math.ceil((0.2 * kg) / 3 - 1e-9);
    notes.push(`Ivermectin ${tabs} x 3 mg tablet${tabs === 1 ? '' : 's'} (${tabs * 3} mg; 200 micrograms/kg = ${Math.round(0.2 * kg * 10) / 10} mg rounded up), directly observed, and the same again 7-14 days later.`);
    notes.push('Not under 90 cm tall, with prior ivermectin hypersensitivity, or with some other medicines. Section 2.3.1.2 also excludes children under 5 years.');
  } else {
    notes.push('Weight: not entered, so no ivermectin dose. It is 200 micrograms/kg rounded up to 3 mg tablets, by weight or height, never by age. A country example (Solomon Islands height stick): 90-112 cm 1 tablet, 113-138 cm 2, 139-156 cm 3, over 156 cm 4; set your own.');
  }

  // Program.
  if (prev !== null) notes.push(prev >= 10 ? `Community prevalence ${prev}%: mass drug administration (two doses) until prevalence falls to about 2%, aiming for high coverage.` : prev >= 2 ? `Community prevalence ${prev}%: mass treatment is a local decision between 2% and 10%.` : `Community prevalence ${prev}%: below 2%, treat cases and contacts; no mass treatment.`);

  const band = level ? `${level}: ${why}.` : 'Scabies by the WHO primary-care diagnosis.';
  return { valid: true, band, bandLabel: level ? level.replace(/ \(level [ABC]\)/, '') : 'Primary-care diagnosis', abnormal: true, notes, note: NOTE };
}
