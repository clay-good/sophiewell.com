// spec-v1559 tool 2: tetanus-diphtheria (Td) doses in pregnancy by vaccination history (WHO 2017).
//
// Source: WHO. Tetanus vaccines: WHO position paper, February 2017. Wkly Epidemiol Rec 2017;92(6):53-76 (IRIS
// 10665/254583; facts restated, nothing reproduced), "Vaccination of pregnant women" and the summary table, read
// October 6, 2026. Full protection is 6 doses in childhood, or 5 if first vaccinated in adolescence or adulthood;
// a woman documented as fully protected is not vaccinated in pregnancy (more local reactions). No reliable record:
// at least 2 doses 4 weeks apart, the second at least 2 weeks before birth, a third at least 6 months later, a
// fourth and fifth at least 1 year apart or in later pregnancies. Three childhood DTP doses only: 2 Td doses 4
// weeks apart, the second at least 2 weeks before birth, then a sixth dose at least 1 year later. Four childhood
// doses: 1 booster at the first opportunity, then a sixth dose at least 1 year later or in the next pregnancy.
//
// Stated rather than hidden: the expected birth is taken as 40 weeks, so "at least 2 weeks before birth" means by
// 38 weeks; the 2016 ANC recommendations endorsed the older 5-dose schedule, which this 2017 table supersedes for
// women with childhood DTP doses.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const HISTORY_OPTIONS = [
  { value: 'none', text: 'None, or no reliable record' },
  { value: 'dtp3', text: '3 childhood DTP doses' },
  { value: 'dtp4', text: '4 childhood DTP doses' },
  { value: 'adult', text: 'Td doses as an adolescent or adult (enter how many)' },
  { value: 'full', text: 'Fully protected (6 childhood doses, or 5 from adolescence or adulthood)' },
];

const NOTE = 'This follows WHO\'s 2017 tetanus vaccine position paper. Your national schedule may differ; follow it.';

export function tdPregnancySchedule(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const hist = HISTORY_OPTIONS.find((x) => x.value === o.history);
  if (!hist) return { valid: false, message: 'Choose her documented tetanus vaccination history.' };
  const f = inputFault([['the gestational age', o.weeks, 4, 44, 'weeks']]);
  if (f) return { valid: false, message: f };
  const ga = Number(o.weeks);
  const notes = [];
  const twoBy38 = (dosesHere) => {
    if (dosesHere < 2) return;
    if (ga + 4 > 38) notes.push(`At ${ga} weeks a second dose 4 weeks later falls after 38 weeks, so it may not reach the "at least 2 weeks before birth" target: give the first now and the second as soon as 4 weeks have passed.`);
    else notes.push(`The second dose is due at ${ga + 4} weeks or later, and by 38 weeks so it lands at least 2 weeks before birth.`);
  };

  if (hist.value === 'full') {
    return { valid: true, band: 'No Td in this pregnancy: she is documented as fully protected, and extra doses only raise local reactions.', bandLabel: 'None needed', abnormal: false, notes, note: NOTE };
  }
  if (hist.value === 'dtp4') {
    notes.push('A sixth dose at least 1 year later, or in her next pregnancy, gives lifelong protection.');
    return { valid: true, band: 'One Td booster now, at the first opportunity.', bandLabel: '1 dose now', abnormal: false, notes, note: NOTE };
  }
  if (hist.value === 'dtp3') {
    twoBy38(2);
    notes.push('Then a sixth dose at least 1 year later, or in her next pregnancy, for lifelong protection.');
    return { valid: true, band: 'Two Td doses in this pregnancy: one now and one at least 4 weeks later, the second at least 2 weeks before birth.', bandLabel: '2 doses', abnormal: false, notes, note: NOTE };
  }
  if (hist.value === 'none') {
    twoBy38(2);
    notes.push('Then a third dose at least 6 months later, and a fourth and fifth at least 1 year apart or in later pregnancies, for lifelong protection.');
    notes.push('WHO sets this for countries where maternal and neonatal tetanus is still a public health problem; elsewhere follow the national schedule.');
    return { valid: true, band: 'At least two Td doses in this pregnancy: one now and one at least 4 weeks later, the second at least 2 weeks before birth.', bandLabel: '2 doses', abnormal: false, notes, note: NOTE };
  }
  const fn = inputFault([['the number of adolescent or adult Td doses', o.adultDoses, 1, 5]]);
  if (fn) return { valid: false, message: fn };
  const n = Math.floor(Number(o.adultDoses));
  if (n >= 5) return { valid: true, band: 'No Td in this pregnancy: 5 doses from adolescence or adulthood is full protection.', bandLabel: 'None needed', abnormal: false, notes, note: NOTE };
  const gap = { 1: 'at least 4 weeks', 2: 'at least 6 months', 3: 'at least 1 year', 4: 'at least 1 year' }[n];
  notes.push(`Dose ${n + 1} of 5 is given ${gap} after dose ${n}; if that interval has not passed, give it when it has.`);
  if (n === 1) notes.push('In pregnancy this second dose should land at least 2 weeks before birth (by 38 weeks).');
  return { valid: true, band: `Td dose ${n + 1} of 5 now (if ${gap} have passed since dose ${n}), continuing her adult course.`, bandLabel: `Dose ${n + 1} of 5`, abnormal: false, notes, note: NOTE };
}
