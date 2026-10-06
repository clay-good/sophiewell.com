// spec-v1550 tool 3: the WHO deworming (preventive chemotherapy) dose and how often, by group and the local
// soil-transmitted helminth prevalence.
//
// Source: WHO. Guideline: preventive chemotherapy to control soil-transmitted helminth infections in at-risk
// population groups, 2017 (IRIS 10665/258983; CC BY-NC-SA 3.0 IGO, facts restated, nothing reproduced).
// Read October 6, 2026 (executive summary p. 3 and the recommendations): single-dose albendazole 400 mg or
// mebendazole 500 mg, yearly where any soil-transmitted helminth infection is 20% or more and twice a year
// where it is over 50%, for children 12-23 months (albendazole at half dose, 200 mg), preschool (24-59 months)
// and school-age children, and for non-pregnant adolescent girls (10-19) and women of reproductive age
// (15-49); for pregnant women after the first trimester only where hookworm or whipworm prevalence is 20% or
// more AND anemia affects 40% or more of pregnant women (a single dose; conditional).
//
// Stated rather than hidden: an unknown prevalence gives the dose and no frequency; under 12 months is not
// covered by the guideline and is refused.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const GROUP_OPTIONS = [
  { value: 'child', text: 'Child (12 months to school age)' },
  { value: 'woman', text: 'Non-pregnant adolescent girl (10-19) or woman (15-49)' },
  { value: 'pregnant', text: 'Pregnant woman' },
];
export const PREVALENCE_OPTIONS = [
  { value: 'lt20', text: 'Under 20%' },
  { value: '20to50', text: '20% to 50%' },
  { value: 'gt50', text: 'Over 50%' },
  { value: 'unknown', text: 'Not known' },
];
export const TRIMESTER_OPTIONS = [{ value: 'first', text: 'First trimester' }, { value: 'later', text: 'Second or third trimester' }];
export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];

const NOTE = 'This follows WHO\'s 2017 soil-transmitted helminth preventive chemotherapy guideline. Your national program sets the schedule; follow it.';

function frequency(prev) {
  if (prev === 'lt20') return { text: 'Not recommended as a mass intervention: the baseline prevalence is under 20%.', none: true };
  if (prev === 'gt50') return { text: 'Twice a year (prevalence over 50%).' };
  if (prev === '20to50') return { text: 'Once a year (prevalence 20% to 50%).' };
  return { text: 'The prevalence is not known, so no frequency is given: yearly at 20% or more, twice a year over 50%.' };
}

export function dewormingDoseWho(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const group = GROUP_OPTIONS.find((x) => x.value === o.group);
  if (!group) return { valid: false, message: 'Choose the group: child, non-pregnant girl or woman, or pregnant woman.' };

  if (group.value === 'pregnant') {
    if (!TRIMESTER_OPTIONS.some((x) => x.value === o.trimester)) return { valid: false, message: 'Choose the trimester: deworming is only after the first.' };
    if (o.trimester === 'first') return { valid: true, band: 'Not in the first trimester: WHO deworms pregnant women only after it.', bandLabel: 'Not now', abnormal: false, notes: [], note: NOTE };
    if (!YES_NO.some((x) => x.value === o.criteria)) return { valid: false, message: 'Choose whether both hold here: hookworm or whipworm prevalence of 20% or more, and anemia in 40% or more of pregnant women.' };
    if (o.criteria === 'no') return { valid: true, band: 'Not recommended here: WHO deworms pregnant women only where hookworm or whipworm prevalence is 20% or more and anemia affects 40% or more of pregnant women.', bandLabel: 'Not recommended', abnormal: false, notes: [], note: NOTE };
    return { valid: true, band: 'Albendazole 400 mg or mebendazole 500 mg, a single dose, after the first trimester.', bandLabel: 'Single dose', abnormal: false, notes: ['A conditional recommendation, for areas where both the worm and the anemia thresholds are met.'], note: NOTE };
  }

  const prev = PREVALENCE_OPTIONS.find((x) => x.value === o.prevalence);
  if (!prev) return { valid: false, message: 'Choose the local prevalence of soil-transmitted helminth infection: it sets how often, or whether, to deworm.' };
  const freq = frequency(prev.value);
  let band;
  let label;
  if (group.value === 'child') {
    const f = inputFault([['the age', o.age, 0, 228, 'months']]);
    if (f) return { valid: false, message: f };
    const m = Number(o.age);
    if (m < 12) return { valid: false, message: 'Under 12 months is not covered: WHO\'s deworming guideline starts at 12 months.' };
    const young = m < 24;
    band = `${young ? 'Albendazole 200 mg (half dose)' : 'Albendazole 400 mg'} or mebendazole 500 mg, a single dose.`;
    label = young ? 'Albendazole 200 mg or mebendazole 500 mg' : 'Albendazole 400 mg or mebendazole 500 mg';
  } else {
    band = 'Albendazole 400 mg or mebendazole 500 mg, a single dose.';
    label = 'Albendazole 400 mg or mebendazole 500 mg';
  }
  if (freq.none) return { valid: true, band: freq.text, bandLabel: 'Not recommended', abnormal: false, notes: [`The dose where it is recommended: ${band.replace(/\.$/, '')}.`], note: NOTE };
  return { valid: true, band, bandLabel: label, abnormal: false, notes: [freq.text], note: NOTE };
}
