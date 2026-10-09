// spec-v1564 §3: foodborne-trematode-treatment. The WHO dose of praziquantel or triclabendazole for liver flukes
// (clonorchiasis, opisthorchiasis), fascioliasis and paragonimiasis, by weight, for treating a person or for
// preventive chemotherapy.
//
// Sources, read October 9, 2026 (WHO; facts restated, nothing reproduced):
//   FBT11  Report of the WHO expert consultation on foodborne trematode infections and taeniasis/cysticercosis,
//          Vientiane 2009 (WHO/HTM/NTD/PCT/2011.3, IRIS 10665/75209), chapter 5: clonorchiasis and
//          opisthorchiasis preventive chemotherapy praziquantel 40 mg/kg once (Table 5.1: yearly where the
//          district's prevalence is 20% or more; below it every 24 months, or yearly to people who habitually
//          eat raw fish); fascioliasis triclabendazole 10 mg/kg once, in both settings, and 20 mg/kg for a person
//          after treatment failure or when the physician judges it necessary; paragonimiasis, confirmed or
//          suspected, triclabendazole 20 mg/kg as two 10 mg/kg doses the same day, or praziquantel 25 mg/kg three
//          times a day for 3 days where the patient can be expected to finish it; paragonimiasis mass treatment
//          triclabendazole 20 mg/kg once. Children under 4 and the severely ill are left out of preventive
//          chemotherapy (they may be treated one by one under medical supervision); with triclabendazole so are
//          pregnant women, and for fascioliasis breastfeeding women; praziquantel may be given in pregnancy and
//          breastfeeding in both settings.
//   WMF08  WHO Model Formulary 2008 (IRIS 10665/44053), section 6.1.3: praziquantel 600 mg tablets, liver and lung
//          flukes 25 mg/kg three times a day for 2 consecutive days or 40 mg/kg once (longer for paragonimiasis);
//          triclabendazole 250 mg tablets, fascioliasis 10 mg/kg once, paragonimiasis 20 mg/kg in 2 doses; adults
//          and children over 4. Its praziquantel precautions differ from FBT11: delay in pregnancy unless treatment
//          cannot wait, and no breastfeeding during and for 72 hours after.
//   WMFC10 WHO Model Formulary for Children 2010 (IRIS 10665/44309): clonorchiasis and opisthorchiasis 25 mg/kg
//          three times a day, 5 hours apart, for 1 day; paragonimiasis praziquantel for 2 days.
// FBT11 names no praziquantel regimen for treating one person with a liver fluke, so that row is WMF08's, with
// WMFC10's 1-day course stated beside it: the two formularies disagree and neither is withdrawn.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const INFECTIONS = [
  { value: 'liver-fluke', text: 'Clonorchiasis or opisthorchiasis (liver fluke from raw fish)' },
  { value: 'fasciola', text: 'Fascioliasis (liver fluke from raw water plants)' },
  { value: 'paragonimus', text: 'Paragonimiasis (lung fluke from raw crab or crayfish)' },
];
export const USES = [
  { value: 'person', text: 'Treating a person (confirmed or suspected)' },
  { value: 'pc', text: 'Preventive chemotherapy (mass or targeted treatment)' },
];
export const PREGNANCY = [
  { value: 'no', text: 'Neither' },
  { value: 'pregnant', text: 'Pregnant' },
  { value: 'breastfeeding', text: 'Breastfeeding' },
];

const PZQ = { drug: 'Praziquantel', tablet: 600 };
const TCZ = { drug: 'Triclabendazole', tablet: 250 };
const NOTE = 'WHO doses (2011 expert consultation; Model Formulary 2008). Severely ill people are not treated in preventive chemotherapy. Follow your national program.';

const fmt = (n) => Math.round(n).toLocaleString('en-US');
const tabs = (mg, d) => `${(Math.round((mg / d.tablet) * 10) / 10).toLocaleString('en-US')} × ${d.tablet} mg tablets`;
// dose(d, mgPerKg, weight, times, days) -> the sentence for one regimen.
function dose(d, mgPerKg, kg, times, days) {
  const mg = mgPerKg * kg;
  const how = times === 1 && days === 1 ? 'once, as a single dose' : `${times === 2 ? 'twice' : 'three times'} a day${days > 1 ? ` for ${days} days` : ', the same day'}`;
  return { text: `${d.drug} ${fmt(mg)} mg (${mgPerKg} mg/kg, ${tabs(mg, d)}) ${how}`, label: `${d.drug} ${fmt(mg)} mg ${times === 1 && days === 1 ? 'once' : `${times}x/day${days > 1 ? ` × ${days} days` : ''}`}` };
}

export function foodborneTrematodeTreatment(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const inf = INFECTIONS.find((x) => x.value === o.infection);
  if (!inf) return { valid: false, message: 'Choose the infection: liver fluke from fish, fascioliasis, or paragonimiasis.' };
  const use = USES.find((x) => x.value === o.use);
  if (!use) return { valid: false, message: 'Choose whether this is treatment of a person or preventive chemotherapy.' };
  const f = inputFault([['the weight', o.weight, 3, 200, 'kg'], ['the age', o.age, 0, 120, 'years']]);
  if (f) return { valid: false, message: f };
  const kg = Number(o.weight); const age = Number(o.age);
  const preg = PREGNANCY.find((x) => x.value === o.pregnancy)?.value ?? null;
  const pc = use.value === 'pc';
  if (pc && age < 4) return { valid: true, band: 'Not given in preventive chemotherapy under 4 years: WHO leaves young children out. A physician may treat the child individually, under medical supervision.', bandLabel: 'Not in mass treatment', abnormal: false, notes: [], note: NOTE };
  const notes = [];
  if (!pc && age < 4) notes.push('The WHO formulary doses are for adults and children over 4; the 2011 consultation allows a younger child to be treated individually if the physician judges it acceptable, under medical supervision.');

  let main; let alt = null;
  if (inf.value === 'liver-fluke') {
    if (pc) {
      main = dose(PZQ, 40, kg, 1, 1);
      notes.push('How often: yearly where 20% or more of the district\'s sample is infected; below 20%, every 24 months for everyone or yearly for people who habitually eat raw fish.');
    } else {
      main = dose(PZQ, 25, kg, 3, 2);
      alt = dose(PZQ, 40, kg, 1, 1);
      notes.push('WHO\'s 2010 formulary for children gives 25 mg/kg three times, 5 hours apart, for 1 day instead of 2.');
    }
  } else if (inf.value === 'fasciola') {
    if (pc && (preg === 'pregnant' || preg === 'breastfeeding')) return { valid: true, band: `Not given in preventive chemotherapy to a ${preg} woman: triclabendazole mass treatment leaves pregnant and breastfeeding women out. She can be treated individually under medical supervision.`, bandLabel: 'Not in mass treatment', abnormal: false, notes: [], note: NOTE };
    main = dose(TCZ, 10, kg, 1, 1);
    if (!pc) alt = { ...dose(TCZ, 20, kg, 1, 1), why: 'after treatment failure, or if the physician judges it necessary' };
    if (!pc) notes.push('Severe fascioliasis: dying worms can block the bile ducts and cause biliary colic.');
  } else {
    if (pc && preg === 'pregnant') return { valid: true, band: 'Not given in preventive chemotherapy to a pregnant woman: triclabendazole mass treatment leaves pregnant women out. She can be treated individually under medical supervision.', bandLabel: 'Not in mass treatment', abnormal: false, notes: [], note: NOTE };
    if (pc) main = dose(TCZ, 20, kg, 1, 1);
    else {
      main = { ...dose(TCZ, 10, kg, 2, 1), text: `${dose(TCZ, 10, kg, 2, 1).text} (20 mg/kg in all)` };
      alt = { ...dose(PZQ, 25, kg, 3, 3), why: 'only if the patient can be expected to finish the course' };
      notes.push('WHO\'s formularies give praziquantel for 2 days, longer if needed. Treatment in hospital is recommended: the flukes can reach the brain.');
      notes.push('Suspected cases (from an endemic district, with raw crab or crayfish eaten, and a cough over 3 weeks, bloody or rusty sputum, smear-negative tuberculosis, or tuberculosis that does not respond to treatment) are treated as confirmed ones.');
    }
  }
  if (pc && !preg && inf.value !== 'liver-fluke') notes.push(inf.value === 'fasciola' ? 'Pregnancy and breastfeeding not assessed: triclabendazole mass treatment leaves both out.' : 'Pregnancy not assessed: triclabendazole mass treatment leaves pregnant women out.');
  const usesPzq = inf.value === 'liver-fluke' || (alt && alt.text.startsWith('Praziquantel'));
  if (usesPzq && (preg === 'pregnant' || preg === 'breastfeeding')) notes.push('Praziquantel in pregnancy and breastfeeding: the 2011 consultation allows it; the 2008 formulary advises delaying until after delivery unless treatment cannot wait, and no breastfeeding during and for 72 hours after.');
  if (alt) notes.unshift(`Or: ${alt.text}${alt.why ? `, ${alt.why}` : ''}.`);
  return { valid: true, band: `${main.text}.`, bandLabel: main.label, abnormal: false, notes, note: NOTE };
}
