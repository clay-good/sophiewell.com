// spec-v1562 tool 6: hydatid cyst (cystic echinococcosis): the WHO ultrasound stage and the first-line
// treatment for an uncomplicated liver or lung cyst (WHO 2025).
//
// Source: WHO guidelines for the treatment of patients with cystic echinococcosis, June 2025 (IRIS
// 10665/381674; CC BY-NC-SA 3.0 IGO, facts restated). Read October 6, 2026: recommendations 1-7 (pp. viii-x),
// Fig. 1 and the tiers (p. x), the WHO-IWGE stage descriptors, and the implementation notes (pp. 11-12 and
// following):
//   - Liver, uncomplicated: CE1 or CE3a under 5 cm, albendazole (any tier); 5-10 cm, PAIR with albendazole
//     (tier 3-4), not with biliary communication; over 10 cm, percutaneous treatment with albendazole, PAIR
//     preferred over catheterization or surgery (tier 3-4), not with biliary communication. CE2 or CE3b 5 cm
//     or less, albendazole alone (any tier); over 5 cm, surgery with albendazole (open tier 2-4, laparoscopy
//     tier 3-4). Inactive CE4/CE5: not covered; current practice is watch and wait with imaging. Multiple
//     cysts, mixed stages or several organs: individualized.
//   - Lung: uncomplicated active cysts under 5 cm (heading: 5 cm or less), surgery (tier 4), no albendazole
//     before; albendazole after if spillage.
//   - Albendazole 10-15 mg/kg/day in two doses, up to 400 mg twice a day, with a fat-rich meal, continuously
//     for 3-6 months (around PAIR: 1-7 days before, 1-3 months after). Not in the first trimester or with a
//     cyst at risk of rupture. Imaging at 3-6 months, then yearly for at least 5 years.
//   - CL (a unilocular cyst without a double wall) is not a CE stage and needs further diagnosis.
//
// Stated rather than hidden: the text gives CE1/CE3a bands as under 5, 5-10 and over 10 cm while Fig. 1 says
// "over 5 and under 10"; exactly 5 and 10 cm follow the text (PAIR). Complicated cysts are outside these
// recommendations.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const ORGAN_OPTIONS = [{ value: 'liver', text: 'Liver' }, { value: 'lung', text: 'Lung' }, { value: 'other', text: 'Other organ' }];
export const STAGE_OPTIONS = [
  { value: 'CE1', text: 'CE1: single cyst with a double wall (active)' },
  { value: 'CE2', text: 'CE2: honeycomb of daughter cysts (active)' },
  { value: 'CE3a', text: 'CE3a: detached inner layer, "water lily" (transitional)' },
  { value: 'CE3b', text: 'CE3b: daughter cysts in solid content, "Swiss cheese" (active)' },
  { value: 'CE4', text: 'CE4: solid "ball of wool" (inactive)' },
  { value: 'CE5', text: 'CE5: as CE4 with a calcified wall (inactive)' },
  { value: 'CL', text: 'CL: simple cyst without a double wall (not a CE stage)' },
];
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];
export const TIER_OPTIONS = [
  { value: '1', text: 'Tier 1: doctor, basic lab, ultrasound by referral' },
  { value: '2', text: 'Tier 2: plus general surgery, theatre, on-site ultrasound' },
  { value: '3', text: 'Tier 3: plus laparoscopy, PAIR, catheterization, CT' },
  { value: '4', text: 'Tier 4: plus thoracic surgery, interventional radiology, MRI' },
];

const NOTE = 'This follows WHO\'s 2025 cystic echinococcosis treatment guidelines. Staging needs trained ultrasound; this is for district hospitals.';
const ALB_ONLY = 'Albendazole 10-15 mg/kg a day in two doses (up to 400 mg twice a day) with a fat-rich meal, continuously for 3-6 months.';

export function cysticEchinococcosisStage(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const organ = ORGAN_OPTIONS.find((x) => x.value === o.organ);
  if (!organ) return { valid: false, message: 'Choose the organ: liver, lung or other.' };
  const st = STAGE_OPTIONS.find((x) => x.value === o.stage);
  if (!st) return { valid: false, message: 'Choose the ultrasound stage (CE1, CE2, CE3a, CE3b, CE4, CE5 or CL).' };
  const f = inputFault([['the largest cyst diameter', o.diameter, 0.1, 50, 'cm']]);
  if (f) return { valid: false, message: f };
  const d = Number(o.diameter);
  if (o.complicated !== 'yes' && o.complicated !== 'no') return { valid: false, message: 'Choose whether the cyst is complicated (rupture, infection, biliary fistula, compression): complicated cysts are outside these recommendations.' };
  const notes = [];
  const out = (band, label, abnormal) => ({ valid: true, band, bandLabel: label, abnormal, notes, note: NOTE });
  const tier = TIER_OPTIONS.find((x) => x.value === o.tier);
  const need = (min) => { if (tier && Number(tier.value) < min) notes.push(`This needs tier ${min} or higher: refer from tier ${tier.value}.`); else if (!tier) notes.push(`Facility tier: not entered. This needs tier ${min} or higher.`); };
  let mg = null;
  if (String(o.weight ?? '').trim() !== '') {
    const fw = inputFault([['the weight', o.weight, 3, 250, 'kg']]);
    if (fw) return { valid: false, message: fw };
    const kg = Number(o.weight);
    mg = `For ${kg} kg: ${Math.min(400, Math.round(5 * kg))}-${Math.min(400, Math.round(7.5 * kg))} mg twice a day.`;
  }
  const alb = (text) => { notes.push(text); if (mg) notes.push(mg); notes.push('Not in the first trimester of pregnancy or with a cyst at risk of rupture; check liver enzymes and blood count. Imaging at 3-6 months, then yearly for at least 5 years.'); };

  if (st.value === 'CL') return out('CL is not a CE stage: a simple cyst without a double wall that could be an early echinococcal cyst or a biliary cyst. It needs further diagnostic steps before treatment.', 'Not a CE stage', false);
  if (o.complicated === 'yes') return out(`${st.value} with complications: outside WHO's first-line recommendations, which cover uncomplicated cysts. Manage individually at a higher tier.`, 'Complicated: individualized', true);
  if (o.multiple === 'yes') return out(`Multiple cysts, cysts in different stages, or several organs: management is individualized.`, 'Individualized', true);
  if (o.multiple !== 'no') notes.push('Multiple cysts or organs: not entered. Either makes management individualized.');
  if (st.value === 'CE4' || st.value === 'CE5') return out(`${st.value} (inactive): not covered by the 2025 recommendations; current practice is watch and wait, following with ultrasound or MRI. Avoid surgery unless the cyst causes complications.`, 'Watch and wait', false);

  if (organ.value === 'lung') {
    if (d <= 5) {
      need(4);
      if (d === 5) notes.push('The lung heading says 5 cm or less and its text under 5 cm; exactly 5 cm is read as covered.');
      notes.push('No albendazole before lung surgery; give it after if spillage is suspected or occurred.');
      return out(`Lung ${st.value}, ${d} cm, uncomplicated: surgery (tier 4).`, 'Surgery', true);
    }
    return out(`Lung ${st.value} over 5 cm: not covered by the 2025 recommendations; manage individually at tier 4.`, 'Individualized', true);
  }
  if (organ.value === 'other') return out(`${st.value} outside the liver and lung: not covered by the 2025 recommendations; manage individually.`, 'Individualized', true);

  if (st.value === 'CE1' || st.value === 'CE3a') {
    if (d < 5) { alb(ALB_ONLY); return out(`Liver ${st.value} under 5 cm: albendazole alone (any tier).`, 'Albendazole', true); }
    if (o.biliary === 'yes') return out(`Liver ${st.value} ${d} cm with biliary communication: PAIR must not be used. Manage individually (surgery or other options) at tier 3-4.`, 'No PAIR: individualized', true);
    if (o.biliary !== 'no') notes.push('Biliary communication: not entered. PAIR must not be used if it is present.');
    need(3);
    alb('Albendazole 10-15 mg/kg a day in two doses (up to 400 mg twice a day), 1-7 days before PAIR and for 1-3 months after.');
    if (d <= 10) {
      if (d === 5 || d === 10) notes.push('The text gives 5-10 cm (Fig. 1 says over 5 and under 10): exactly 5 or 10 cm follows the text.');
      return out(`Liver ${st.value} ${d} cm: PAIR (puncture, aspiration, injection, re-aspiration) with albendazole (tier 3-4).`, 'PAIR with albendazole', true);
    }
    return out(`Liver ${st.value} over 10 cm: percutaneous treatment with albendazole, PAIR preferred over catheterization or surgery (tier 3-4).`, 'Percutaneous with albendazole', true);
  }
  // CE2 or CE3b.
  if (d <= 5) { alb(ALB_ONLY); return out(`Liver ${st.value} 5 cm or less: albendazole alone to start (any tier).`, 'Albendazole', true); }
  need(2);
  alb('Albendazole 10-15 mg/kg a day in two doses (up to 400 mg twice a day), 1-7 days before surgery and for 1-3 months after.');
  return out(`Liver ${st.value} over 5 cm: surgery with albendazole (open surgery tier 2-4, laparoscopy tier 3-4).`, 'Surgery with albendazole', true);
}
