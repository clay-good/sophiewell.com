// spec-v1563 tool 2: kala-azar (visceral leishmaniasis, VL) and post-kala-azar dermal leishmaniasis (PKDL)
// treatment by region (WHO 2026).
//
// Source: WHO guidelines on leishmaniases: treatment of visceral leishmaniasis and PKDL in eastern Africa and
// South-East Asia, July 27, 2026 (IRIS 10665/386756; CC BY-NC-SA 3.0 IGO, facts restated). Read October 6,
// 2026: recommendations 1-4 with remarks (pp. xii-xvi) and Annex 2 (p. 79):
//   - Eastern Africa, VL: 1.1 paromomycin sulfate 20 mg/kg (15 mg/kg base) IM daily plus miltefosine
//     (allometric dose) twice daily, both for 14 days; 1.2 if excluded, sodium stibogluconate (SSG) 20 mg/kg/day
//     IV or IM plus paromomycin sulfate 15 mg/kg (11 base) IM, both for 17 days (SSG alone for 30 days is the
//     weaker option); 1.3 liposomal amphotericin B (LAmB) 3-5 mg/kg a day over 6-10 days to a total of 30
//     mg/kg. Paromomycin-miltefosine exclusions include age under 4 or over 50, pregnancy or lactation,
//     relapse, severe malnutrition, Hb under 5 g/dL, severe VL, hearing loss, comorbidity or coinfection.
//   - South-East Asia, relapse: not single-dose LAmB 10 mg/kg again if that was the first treatment;
//     miltefosine plus paromomycin (15 mg/kg sulfate) for 10 days, LAmB 5 mg/kg once plus miltefosine for 7
//     days, or LAmB 5 mg/kg once plus paromomycin for 10 days; otherwise LAmB 15-20 mg/kg in total in 3-4
//     doses.
//   - Eastern Africa, PKDL: paromomycin 20 mg/kg IM daily for 14 days plus miltefosine twice daily for 42
//     days, rather than LAmB 5 mg/kg on days 1, 3, 5 and 7 plus miltefosine for 28 days; the shorter LAmB
//     regimen is preferred for children and the severely malnourished.
//   - South-East Asia, PKDL: LAmB 30 mg/kg as six doses of 5 mg/kg twice a week for 3 weeks; or LAmB 20 mg/kg
//     on days 1, 4, 8, 11 and 15 with or without miltefosine for 21 days; or LAmB 15 mg/kg on days 1, 8 and
//     15 with miltefosine 100 mg a day to day 45.
//   - Miltefosine is teratogenic: not in pregnancy; contraception during treatment and for 2 months after
//     (regimens under 28 days) or 5 months (28 days or more). Allometric daily doses (Annex 2): under 6 kg
//     20 mg; 6-9.99 kg 30; 10-14.99 50; 15-19.99 60; 20-24.99 70; 25-29.99 80; 30-44.99 100; 45 or more 150.
//
// Stated rather than hidden: Annex 2 gives a daily total while the recommendations say twice daily; the
// tile splits the daily total into two doses, as the text advises divided doses. Primary VL in South-East
// Asia and HIV coinfection are not covered by this guideline and are refused.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const REGION_OPTIONS = [{ value: 'eafrica', text: 'Eastern Africa' }, { value: 'sea', text: 'South-East Asia' }];
export const INDICATION_OPTIONS = [
  { value: 'primary', text: 'Primary VL' },
  { value: 'relapse', text: 'VL relapse' },
  { value: 'pkdl', text: 'PKDL' },
];
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

const NOTE = 'This follows WHO\'s July 2026 guidelines on visceral leishmaniasis and PKDL in eastern Africa and South-East Asia.';

export function miltefosineDaily(kg) {
  if (kg < 6) return 20;
  if (kg < 10) return 30;
  if (kg < 15) return 50;
  if (kg < 20) return 60;
  if (kg < 25) return 70;
  if (kg < 30) return 80;
  if (kg < 45) return 100;
  return 150;
}

export function visceralLeishmaniasis2026(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const region = REGION_OPTIONS.find((x) => x.value === o.region);
  if (!region) return { valid: false, message: 'Choose the region: eastern Africa or South-East Asia.' };
  const ind = INDICATION_OPTIONS.find((x) => x.value === o.indication);
  if (!ind) return { valid: false, message: 'Choose the indication: primary VL, relapse, or PKDL.' };
  if (o.hiv === 'yes') return { valid: false, message: 'Choose another source for HIV coinfection: WHO\'s 2022 VL-HIV guideline applies, not this one.' };
  const f = inputFault([['the weight', o.weight, 2, 200, 'kg'], ['the age', o.age, 0, 100, 'years']]);
  if (f) return { valid: false, message: f };
  const kg = Number(o.weight);
  const years = Number(o.age);
  const notes = [];
  const out = (band, label) => ({ valid: true, band, bandLabel: label, abnormal: true, notes, note: NOTE });
  const mf = miltefosineDaily(kg);
  const mfText = (days) => `miltefosine ${mf} mg a day (${mf / 2} mg twice a day) for ${days} days`;
  const pm20 = `paromomycin sulfate ${Math.round(20 * kg)} mg IM once a day (20 mg/kg = 15 mg/kg base)`;
  const pm15 = `paromomycin sulfate ${Math.round(15 * kg)} mg IM once a day (15 mg/kg = 11 mg/kg base)`;
  const preg = o.pregnant === 'yes';
  const noMf = preg || o.contraception === 'no';
  if (preg) notes.push('No miltefosine in pregnancy or breastfeeding: it is teratogenic.');
  else if (o.contraception === 'no') notes.push('No miltefosine for a woman who could become pregnant without reliable contraception.');
  else if (o.contraception === 'yes') notes.push('Keep contraception during treatment and for 2 months after miltefosine (5 months after regimens of 28 days or more).');
  else notes.push('Reliable contraception: not entered. A woman who could become pregnant needs it during miltefosine and for 2 months after (5 months after regimens of 28 days or more).');

  if (region.value === 'sea' && ind.value === 'primary') return { valid: false, message: 'Choose another source for primary VL in South-East Asia: this 2026 guideline covers relapse and PKDL there, not first treatment.' };
  if (region.value === 'eafrica' && ind.value === 'relapse') return { valid: false, message: 'Choose another source for VL relapse in eastern Africa: this guideline covers relapse in South-East Asia only.' };

  if (ind.value === 'primary') {
    const excluded = years < 4 || years > 50 || preg || o.exclusion === 'yes' || o.contraception === 'no';
    notes.push(`If paromomycin with miltefosine is excluded: SSG ${Math.round(20 * kg)} mg (20 mg/kg) IV or IM plus ${pm15}, both daily for 17 days. If that is excluded too: LAmB ${Math.round(3 * kg)}-${Math.round(5 * kg)} mg (3-5 mg/kg) a day over 6-10 days to a total of ${Math.round(30 * kg)} mg (30 mg/kg).`);
    if (o.exclusion !== 'yes' && o.exclusion !== 'no') notes.push('Other exclusions: not entered (relapse, severe malnutrition, Hb under 5 g/dL, severe VL, hearing loss, comorbidity or coinfection exclude paromomycin with miltefosine).');
    if (excluded) {
      const why = years < 4 ? 'under 4 years' : years > 50 ? 'over 50 years' : preg ? 'pregnancy or breastfeeding' : o.contraception === 'no' ? 'no reliable contraception' : 'an exclusion criterion';
      return out(`Eastern Africa, primary VL, paromomycin with miltefosine excluded (${why}): SSG ${Math.round(20 * kg)} mg plus ${pm15}, both daily for 17 days; or LAmB to a total of 30 mg/kg.`, 'SSG plus paromomycin');
    }
    return out(`Eastern Africa, primary VL: ${pm20} plus ${mfText(14)}, both for 14 days.`, 'Paromomycin plus miltefosine');
  }
  if (ind.value === 'relapse') {
    notes.push('Relapse should be confirmed parasitologically. If the first treatment was single-dose LAmB 10 mg/kg, do not repeat it.');
    const opts = noMf
      ? [`LAmB ${Math.round(5 * kg)} mg (5 mg/kg) once plus ${pm15} for 10 days`, `or LAmB ${Math.round(15 * kg)}-${Math.round(20 * kg)} mg in total (15-20 mg/kg) in 3-4 doses`]
      : [`${mfText(10)} plus ${pm15} for 10 days`, `or LAmB ${Math.round(5 * kg)} mg (5 mg/kg) once plus ${mfText(7)}`, `or LAmB 5 mg/kg once plus paromomycin 15 mg/kg for 10 days`, `or LAmB 15-20 mg/kg in total in 3-4 doses if no combination fits`];
    return out(`South-East Asia, VL relapse: ${opts.join('; ')}.`, noMf ? 'LAmB-based (no miltefosine)' : 'Combination options');
  }
  // PKDL.
  if (region.value === 'eafrica') {
    const shorter = years < 18 || o.malnourished === 'yes' || noMf;
    if (noMf) return out(`Eastern Africa, PKDL: both WHO regimens contain miltefosine, which is excluded here. LAmB 5 mg/kg (${Math.round(5 * kg)} mg) on days 1, 3, 5 and 7 is its non-miltefosine part; seek specialist advice.`, 'Specialist (no miltefosine)');
    if (shorter) notes.push(`The shorter regimen is preferred for ${years < 18 ? 'children (eye monitoring is harder)' : 'the severely malnourished'}.`);
    const long = `${pm20} for 14 days plus ${mfText(42)}`;
    const short = `LAmB ${Math.round(5 * kg)} mg (5 mg/kg) IV on days 1, 3, 5 and 7 plus ${mfText(28)}`;
    return out(`Eastern Africa, PKDL: ${shorter ? short : long}${shorter ? '' : `; the alternative is ${short}`}.`, shorter ? 'LAmB plus miltefosine' : 'Paromomycin plus miltefosine');
  }
  notes.push('Monitor potassium, electrolytes and kidney function on high cumulative LAmB doses.');
  return out(`South-East Asia, PKDL: LAmB ${Math.round(5 * kg)} mg (5 mg/kg) twice a week for 3 weeks (6 doses, 30 mg/kg). Alternatives: LAmB 20 mg/kg in total on days 1, 4, 8, 11 and 15${noMf ? '' : ` with or without ${mfText(21)}`}; or LAmB 15 mg/kg on days 1, 8 and 15${noMf ? '' : ' with miltefosine 100 mg a day to day 45'}.`, 'LAmB 30 mg/kg');
}
