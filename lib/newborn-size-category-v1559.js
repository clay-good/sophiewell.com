// spec-v1559 tool 5: low birth weight and preterm categories (WHO 2022).
//
// Source: WHO recommendations for care of the preterm or low-birth-weight infant, 2022 (IRIS 10665/363697; CC
// BY-NC-SA 3.0 IGO, facts restated, nothing reproduced), glossary and recommendations A.1a and A.1b, read October
// 6, 2026: low birth weight below 2.5 kg, very low below 1.5 kg, extremely low below 1 kg; preterm before 37+0
// weeks, very preterm before 32+0, extremely preterm before 28+0; term 37+0 to 41+6; post-term 42+0 or more.
// Kangaroo mother care is routine for every preterm or low-birth-weight infant, 8-24 hours a day, started as soon
// as possible after birth; in a facility unless the infant cannot breathe on their own after resuscitation, is in
// shock or needs mechanical ventilation; at home only without danger signs.
//
// Not computed: small for gestational age, which needs centile tables WHO's licence does not allow bundling
// (INTERGROWTH-21st, Fenton).
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

const NOTE = 'This follows WHO\'s 2022 recommendations for care of the preterm or low-birth-weight infant.';

export function newbornSizeCategory(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the birth weight', o.weight, 300, 6000, 'g']]);
  if (f) return { valid: false, message: f };
  const g = Number(o.weight);
  const weightCat = g < 1000 ? 'extremely low birth weight (below 1,000 g)' : g < 1500 ? 'very low birth weight (below 1,500 g)' : g < 2500 ? 'low birth weight (below 2,500 g)' : 'not low birth weight (2,500 g or more)';
  const notes = [];
  let gaCat = null;
  const haveGa = !(o.weeks === undefined || o.weeks === null || String(o.weeks).trim() === '');
  if (haveGa) {
    const fw = inputFault([['the gestational age at birth', o.weeks, 20, 45, 'weeks']]);
    if (fw) return { valid: false, message: fw };
    const days = o.days === undefined || o.days === null || String(o.days).trim() === '' ? 0 : Number(o.days);
    if (!Number.isInteger(days) || days < 0 || days > 6) return { valid: false, message: 'Enter the extra days as a whole number from 0 to 6.' };
    const ga = Number(o.weeks) + days / 7;
    gaCat = ga < 28 ? 'extremely preterm (before 28+0 weeks)' : ga < 32 ? 'very preterm (before 32+0 weeks)' : ga < 37 ? 'preterm (before 37+0 weeks)' : ga < 42 ? 'term (37+0 to 41+6 weeks)' : 'post-term (42+0 weeks or more)';
  } else {
    notes.push('No gestational age was entered, so only the weight category is given.');
  }
  const preterm = gaCat !== null && /preterm/.test(gaCat);
  const lbw = g < 2500;
  if (lbw || preterm) notes.push('Kangaroo mother care is routine for every preterm or low-birth-weight baby: 8-24 hours a day, started as soon as possible after birth (in a facility unless the baby cannot breathe alone after resuscitation, is in shock or is ventilated; at home only without danger signs).');
  notes.push('Small for gestational age is not computed: it needs centile tables (INTERGROWTH-21st, Fenton) that cannot be bundled.');
  return {
    valid: true,
    band: `${g.toLocaleString('en-US')} g: ${weightCat}${gaCat ? `; ${gaCat}` : ''}.`,
    bandLabel: gaCat ? `${weightCat.split(' (')[0]}; ${gaCat.split(' (')[0]}` : weightCat.split(' (')[0],
    abnormal: lbw || preterm,
    notes,
    note: NOTE,
  };
}
