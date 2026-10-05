// spec-v1551 tool 3: how many 100 mg rectal artesunate suppositories a child under 6 gets before referral
// for suspected severe malaria, and whether rectal artesunate is the right choice at all.
//
// Sources, read October 5, 2026 (facts restated, nothing reproduced; all CC BY-NC-SA 3.0 IGO):
//   - WHO guidelines for malaria, 10 September 2026 (doi:10.2471/B09879), section 5.2.2.3, pp. 221-222:
//     pre-referral treatment unless referral takes under 6 hours; for children under 6 the order is IM
//     artesunate, rectal artesunate, IM artemether, IM quinine; rectal artesunate only under 6 years and
//     only when IM artesunate is not available (more deaths in older children and adults in the one
//     trial); a single 10 mg/kg dose; if expelled within 30 minutes, a second suppository and the buttocks
//     held together for 10 minutes; if referral is impossible, rectal treatment may continue until oral
//     treatment is tolerated, then a full ACT course.
//   - WHO information note, Rectal artesunate for pre-referral treatment of severe malaria, 2017 (rev.
//     2018), p. 5: the CHW danger signs (fever with convulsions, unusual sleepiness or unconsciousness,
//     inability to drink or feed, or vomiting everything); the weight rule, which over-doses on purpose
//     (up to 10 kg one 100 mg suppository, up to 20 kg two); an intact suppository that slips out is
//     reinserted, a burst or melted one replaced; the buttocks covered for 1-2 minutes.
//   - WHO, The use of rectal artesunate as a pre-referral treatment, 2023 update: the single dose must be
//     followed by immediate transfer, injectable artesunate and a full 3-day ACT.
//
// Edges stated rather than hidden:
//   - The weight rule stops at 20 kg. A child under 6 above 20 kg is refused, not given a third suppository.
//   - "Up to 10 kg" is read as including 10 kg (10.0 kg gets one suppository, 10.1 kg two).
//   - The 2012 WHO training manual's age bands are not used: that PDF is a scan without readable text.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const DANGER_OPTIONS = [
  { value: 'yes', text: 'Yes: fever with a danger sign' },
  { value: 'no', text: 'No danger sign' },
];
export const REFERRAL_OPTIONS = [
  { value: 'over6', text: '6 hours or more' },
  { value: 'under6', text: 'Under 6 hours' },
];
export const IM_OPTIONS = [
  { value: 'no', text: 'No' },
  { value: 'yes', text: 'Yes' },
];

const NOTE = 'This follows the WHO guidelines for malaria of 10 September 2026 and WHO\'s 2017 and 2023 notes on rectal artesunate. Your national protocol may differ; follow it.';
const r1 = (x) => String(Math.round(x * 10) / 10);
const pick = (opts, v) => opts.find((x) => x.value === v);

function answer(band, bandLabel, notes, abnormal = false) {
  return { valid: true, band, bandLabel, abnormal, notes, note: NOTE };
}

export function rectalArtesunatePrereferral(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the age', o.age, 0, 120, 'years'], ['the weight', o.weight, 0.5, 150, 'kg']]);
  if (f) return { valid: false, message: f };
  if (!pick(DANGER_OPTIONS, o.danger)) return { valid: false, message: 'Choose whether the child has fever with a danger sign: convulsions, unusual sleepiness or unconsciousness, unable to drink or feed, or vomiting everything.' };
  if (!pick(REFERRAL_OPTIONS, o.referral)) return { valid: false, message: 'Choose how long it will take to reach a facility that can give injectable treatment.' };
  if (!pick(IM_OPTIONS, o.imAvailable)) return { valid: false, message: 'Choose whether intramuscular artesunate is available here.' };
  const age = Number(o.age);
  const w = Number(o.weight);

  if (age >= 6) {
    return answer(
      'Do not give rectal artesunate: WHO uses it only in children under 6 years. In the one trial of it before referral, older children and adults given it died more often. Give one IM dose of artesunate (or IM artemether, or IM quinine, in that order) and refer now.',
      'Not for age 6 or over',
      ['The injectable dose by weight is in the severe malaria injectable dose calculator.'],
      true,
    );
  }
  if (o.danger === 'no') {
    return answer(
      'Do not give rectal artesunate: it is only for suspected severe malaria (fever with a danger sign). Never use it to treat uncomplicated malaria: a single artesunate dose without a full course risks treatment failure and resistance.',
      'No danger sign',
      ['If malaria is confirmed and there is no danger sign, treat it as uncomplicated malaria with a full 3-day ACT, by weight.'],
    );
  }
  if (o.referral === 'under6') {
    return answer(
      'Refer now. WHO advises pre-referral treatment when reaching a facility that can give injectable treatment takes 6 hours or more; under 6 hours, referral itself comes first.',
      'Refer now',
      ['If the transfer is delayed or turns out to take longer, the pre-referral options apply: IM artesunate, then rectal artesunate under 6 years.'],
    );
  }
  if (o.imAvailable === 'yes') {
    return answer(
      'Give one IM dose of artesunate instead and refer now: WHO prefers IM artesunate to rectal artesunate whenever it is available.',
      'IM artesunate preferred',
      ['The IM artesunate dose is 3 mg/kg under 20 kg; the severe malaria injectable dose calculator gives it by weight.'],
    );
  }
  if (w > 20) {
    return {
      valid: false,
      message: 'WHO\'s rule gives one 100 mg suppository up to 10 kg and two up to 20 kg, and none above 20 kg for a child under 6. Check the weight; if it is right, follow your national protocol.',
    };
  }
  const count = w <= 10 ? 1 : 2;
  const mg = count * 100;
  return answer(
    `Insert ${count === 1 ? 'one 100 mg rectal artesunate suppository' : 'two 100 mg rectal artesunate suppositories'} (${mg} mg) once, for ${r1(w)} kg, then refer immediately.`,
    count === 1 ? '1 suppository' : '2 suppositories',
    [
      `That is ${r1(mg / w)} mg/kg. WHO's dose is 10 mg/kg, and its rule rounds up to whole suppositories on purpose (one up to 10 kg, two up to 20 kg): a child with severe malaria is better over-dosed than under-dosed.`,
      'After inserting it, hold the buttocks closed for 1 to 2 minutes. If it slips out whole, put the same one back; if it has burst or partly melted, use a new one.',
      'If it comes out within 30 minutes, insert a new suppository and hold the buttocks together for 10 minutes.',
      'At the referral facility the child needs injectable artesunate for at least 24 hours, then a full 3-day ACT once they can swallow. Rectal artesunate alone is never the whole treatment.',
      'If referral is truly impossible, WHO allows rectal treatment to continue until the child can take oral medicine, then a full 3-day ACT.',
    ],
  );
}
