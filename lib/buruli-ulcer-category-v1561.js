// spec-v1561 tool 5: Buruli ulcer (Mycobacterium ulcerans disease) category and the 8-week antibiotic
// doses (WHO).
//
// Sources, read October 6, 2026 (facts restated, nothing reproduced):
//   - BU12: WHO. Treatment of Mycobacterium ulcerans disease (Buruli ulcer): guidance for health workers,
//     2012 (IRIS 10665/77771; all rights reserved). pp. 7-8: two antibiotics always together for 8 weeks;
//     rifampicin 10 mg/kg daily with streptomycin 15 mg/kg IM daily (contraindicated in pregnancy), or
//     with clarithromycin 7.5 mg/kg twice daily (pregnancy; Australia and French Guiana). Table 3 (p. 9)
//     and pp. 45-46: category I a single lesion under 5 cm; II a single lesion 5-15 cm; III a single lesion
//     over 15 cm, multiple lesions, a critical site (eye, breast, genitalia; head and neck, particularly
//     the face) or osteomyelitis and joint involvement. Annex 1: rifampicin maximum 600 mg, streptomycin
//     1,000 mg a day.
//   - BUHIV20: WHO. Management of Buruli ulcer-HIV coinfection: technical update, 2020 (IRIS 10665/333594;
//     CC BY-NC-SA 3.0 IGO), section 3.1: rifampicin 10 mg/kg daily (maximum 600 mg) plus clarithromycin
//     7.5 mg/kg twice daily (maximum 1,000 mg a day), with caution alongside efavirenz; alternative
//     rifampicin plus moxifloxacin 400 mg daily.
//
// Stated rather than hidden: BU12's weight-band table is not used (its clarithromycin column is labelled
// both per dose and per day, and its bands skip 10-11 and 20-21 kg); doses are computed from the weight.
// A critical site or bone involvement left blank is not assessed, so the category is "at least".
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

const NOTE = 'This follows WHO\'s 2012 Buruli ulcer guidance and its 2020 HIV coinfection update. Always two antibiotics together, directly observed, for 8 weeks.';
const mg = (x) => `${Math.round(x)} mg`;

export function buruliUlcerCategory(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the number of lesions', o.lesions, 1, 50, 'lesions'], ['the largest lesion diameter', o.diameter, 0.1, 100, 'cm'], ['the weight', o.weight, 2, 250, 'kg']]);
  if (f) return { valid: false, message: f };
  const n = Number(o.lesions);
  const d = Number(o.diameter);
  const kg = Number(o.weight);

  const why = [];
  if (n > 1) why.push('multiple lesions');
  if (d > 15) why.push('a lesion over 15 cm');
  if (o.critical === 'yes') why.push('a critical site');
  if (o.bone === 'yes') why.push('bone or joint involvement');
  const open = [o.critical === 'yes' || o.critical === 'no' ? null : 'a critical site (eye, breast, genitals, head and neck)', o.bone === 'yes' || o.bone === 'no' ? null : 'bone or joint involvement'].filter(Boolean);

  let cat;
  let reason;
  if (why.length) { cat = 'III'; reason = why.join(', '); } else if (d >= 5) { cat = 'II'; reason = 'a single lesion 5 to 15 cm'; } else { cat = 'I'; reason = 'a single lesion under 5 cm'; }
  const atLeast = cat !== 'III' && open.length > 0;

  const rif = Math.min(600, 10 * kg);
  const clar = Math.min(500, 7.5 * kg);
  const notes = [
    `Rifampicin ${mg(rif)} once daily (10 mg/kg${10 * kg > 600 ? ', capped at 600 mg' : ''}) plus clarithromycin ${mg(clar)} twice daily (7.5 mg/kg${7.5 * kg > 500 ? ', capped at 1,000 mg a day' : ''}), both for 8 weeks.`,
    'Alternative for adults: rifampicin plus moxifloxacin 400 mg once daily.',
  ];
  if (o.pregnant === 'yes') notes.push('In pregnancy: rifampicin with clarithromycin; streptomycin is contraindicated.');
  else notes.push(`Older regimen: rifampicin with streptomycin ${mg(Math.min(1000, 15 * kg))} IM daily (15 mg/kg, maximum 1,000 mg) for 8 weeks; not in pregnancy.`);
  if (o.efavirenz === 'yes') notes.push('On efavirenz: it lowers clarithromycin levels and raises the risk of rash; use rifampicin with clarithromycin with caution, or the moxifloxacin alternative.');
  else if (o.efavirenz !== 'no') notes.push('Antiretrovirals: not entered. Efavirenz lowers clarithromycin levels; use caution or the moxifloxacin alternative.');
  if (cat === 'III') notes.push('Category III usually also needs surgery (debridement, grafting) after or alongside antibiotics; at a critical site, try to avoid surgery. Refer to a district or tertiary center.');
  else if (cat === 'II') notes.push('Some category II lesions heal with antibiotics alone; debride when needed, after antibiotics where possible.');
  else notes.push('Most category I lesions heal with antibiotics alone.');
  if (atLeast) notes.push(`Not assessed: ${open.join(' and ')}. Either would make this category III.`);
  notes.push('At or near a joint, keep the same range of movement as the unaffected side.');

  return {
    valid: true,
    band: `${atLeast ? 'At least category' : 'Category'} ${cat}: ${reason}.`,
    bandLabel: `${atLeast ? 'At least category' : 'Category'} ${cat}`,
    abnormal: cat === 'III',
    notes,
    note: NOTE,
  };
}
