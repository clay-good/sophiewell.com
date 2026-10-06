// spec-v1563 tool 3: cutaneous leishmaniasis in the Americas: local or systemic treatment, and which (PAHO
// 2022), for an adult.
//
// Source: PAHO. Guideline for the treatment of leishmaniasis in the Americas, 2nd ed., 2022 (iris.paho.org
// 10665.2/56120; CC BY-NC-SA 3.0 IGO, facts restated). Read October 6, 2026, Tables 2-4 (pp. 57-62):
//   - Local treatment when 1 to 3 lesions up to 900 mm2 (largest diameter 3 cm), anywhere except the head and
//     near joints, without immunosuppression, and with follow-up possible: intralesional pentavalent antimony
//     (3-5 infiltrations of 1-5 mL per lesion every 3-7 days, at most 15 mL a day in all), thermotherapy (50 C
//     for 30 seconds, center and edge, one session), or 15% paromomycin cream once a day for 20 days.
//   - Systemic: miltefosine 2.5 mg/kg/day (maximum 150 mg/day) for 28 days in divided doses after meals;
//     pentamidine isethionate 4-7 mg/kg per application, 3 applications 72 hours apart; pentavalent antimony
//     20 mg Sb/kg/day IV or IM once daily for 20 days, "maximum 1,215 mg Sb/kg/day or 3 ampoules".
//   - Special cases: pregnancy, thermotherapy or liposomal amphotericin B (2-3 mg/kg/day to 20-40 mg/kg
//     cumulative, on alternate days, up to twice a week); breastfeeding, thermotherapy, intralesional antimony
//     or liposomal amphotericin B; abnormal ECG, thermotherapy, miltefosine or liposomal amphotericin B.
//
// Stated rather than hidden: the antimony cap is printed "per kg" but 1,215 mg is 3 ampoules of 405 mg, a
// daily total; the tile caps at 1,215 mg Sb a day and says so. The 900 mm2 area and the 3 cm diameter are
// applied as two tests (a round lesion 3 cm across is about 707 mm2). Tables 2-4 are for adults; children's
// treatment is not covered here. Species-specific choices print as a note.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

const NOTE = 'This follows PAHO\'s 2022 guideline for leishmaniasis in the Americas (Tables 2-4, adults). Species and local evidence shape the choice.';
const k = (v) => v === 'yes' || v === 'no';

export function cutaneousLeishmaniasisAmericas(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the number of lesions', o.lesions, 1, 100, 'lesions'], ['the largest lesion diameter', o.diameter, 0.1, 50, 'cm']]);
  if (f) return { valid: false, message: f };
  const n = Number(o.lesions);
  const d = Number(o.diameter);
  let area = null;
  if (String(o.area ?? '').trim() !== '') { const fa = inputFault([['the largest lesion area', o.area, 1, 100000, 'mm2']]); if (fa) return { valid: false, message: fa }; area = Number(o.area); }
  for (const [key, q] of [['site', 'whether a lesion is on the head or near a joint'], ['immuno', 'whether the patient is immunosuppressed'], ['followUp', 'whether follow-up is possible']]) {
    if (!k(o[key])) return { valid: false, message: `Choose ${q}: local treatment depends on it.` };
  }
  let kg = null;
  if (String(o.weight ?? '').trim() !== '') { const fw = inputFault([['the weight', o.weight, 20, 250, 'kg']]); if (fw) return { valid: false, message: fw }; kg = Number(o.weight); }

  const notes = [];
  const why = [];
  if (n > 3) why.push('more than 3 lesions');
  if (d > 3) why.push('a lesion over 3 cm');
  if (area !== null && area > 900) why.push('a lesion over 900 mm²');
  if (o.site === 'yes') why.push('a lesion on the head or near a joint');
  if (o.immuno === 'yes') why.push('immunosuppression');
  if (o.followUp === 'no') why.push('no follow-up possible');
  if (o.failed === 'yes') why.push('local treatment failed or relapsed');
  if (kg === null) notes.push('Weight: not entered, so the systemic doses are per kg only.');
  if (area === null) notes.push('Lesion area: not entered, so only the 3 cm diameter was checked (local treatment also needs 900 mm² or less).');
  const local = why.length === 0;
  const out = (band, label) => ({ valid: true, band, bandLabel: label, abnormal: true, notes, note: NOTE });

  const preg = o.pregnant === 'yes';
  const bf = o.breastfeeding === 'yes';
  const ecg = o.ecg === 'yes';
  const lamb = 'liposomal amphotericin B 2-3 mg/kg a day to 20-40 mg/kg in total, on alternate days up to twice a week';
  const milt = kg !== null ? `miltefosine ${Math.round(Math.min(150, 2.5 * kg))} mg a day (2.5 mg/kg, maximum 150 mg) in divided doses after meals for 28 days` : 'miltefosine 2.5 mg/kg a day (maximum 150 mg) in divided doses after meals for 28 days';
  const sb = kg !== null ? `pentavalent antimony ${Math.round(Math.min(1215, 20 * kg)).toLocaleString('en-US')} mg Sb a day (20 mg/kg${20 * kg > 1215 ? ', capped at 1,215 mg = 3 ampoules' : ''}) IV or IM for 20 days` : 'pentavalent antimony 20 mg Sb/kg a day IV or IM for 20 days (at most 1,215 mg Sb a day, 3 ampoules)';
  const pent = kg !== null ? `pentamidine isethionate ${Math.round(4 * kg)}-${Math.round(7 * kg)} mg (4-7 mg/kg) IM, 3 applications 72 hours apart` : 'pentamidine isethionate 4-7 mg/kg IM, 3 applications 72 hours apart';

  if (preg) return out(`Pregnancy: ${local ? 'thermotherapy (local, 50 °C for 30 seconds), or ' : ''}${lamb}.${local ? '' : ` Local treatment does not fit (${why.join(', ')}).`}`, local ? 'Thermotherapy or LAmB' : 'Liposomal amphotericin B');
  if (bf) return out(`Breastfeeding: ${local ? 'thermotherapy or intralesional antimony (local), or ' : ''}${lamb}.${local ? '' : ` Local treatment does not fit (${why.join(', ')}).`}`, local ? 'Local or LAmB' : 'Liposomal amphotericin B');
  if (ecg) return out(`Abnormal ECG: ${local ? 'thermotherapy (local), or ' : ''}${milt}, or ${lamb}. No systemic antimony.`, local ? 'Thermotherapy, miltefosine or LAmB' : 'Miltefosine or LAmB');

  notes.push('Species matters: for example, miltefosine is not listed for L. amazonensis, and L. braziliensis responses vary by region.');
  if (local) {
    notes.push('Intralesional antimony: 3-5 infiltrations of 1-5 mL per lesion every 3-7 days, enough to swell the lesion, at most 15 mL a day in all.');
    return out('Local treatment fits (1-3 lesions, each 3 cm or less, not on the head or near a joint, not immunosuppressed, follow-up possible): intralesional pentavalent antimony, thermotherapy (50 °C for 30 seconds), or 15% paromomycin cream once a day for 20 days.', 'Local treatment');
  }
  if (kg !== null && 20 * kg > 1215) notes.push('PAHO prints the antimony cap as "1,215 mg Sb/kg/day or 3 ampoules"; 1,215 mg is 3 ampoules of 405 mg, a daily total, so it is applied per day.');
  return out(`Systemic treatment (${why.join(', ')}): ${milt}; or ${pent}; or ${sb}.`, 'Systemic treatment');
}
