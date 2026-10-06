// spec-v1557 tool 1: rabies post-exposure prophylaxis by WHO's 2018 categories and schedules.
//
// Source: WHO. Rabies vaccines: WHO position paper, April 2018. Wkly Epidemiol Rec 2018;93(16):201-220
// (IRIS 10665/272372; facts restated, nothing reproduced). Read October 5, 2026:
//   - p. 203: category I touching or feeding animals, licks on intact skin; II nibbling of uncovered skin,
//     minor scratches or abrasions without bleeding; III one or more transdermal bites or scratches, saliva
//     on mucous membrane or broken skin, any direct contact with bats.
//   - pp. 213-215 and Table 1: category I needs no PEP. Categories II and III: wash and flush every wound
//     at once; vaccinate at once. Not previously immunized: 1-week 2-site intradermal (days 0, 3, 7), 2-week
//     4-dose Essen 1-site IM (days 0, 3, 7 and one day from 14 to 28), or 3-week Zagreb (2 sites IM day 0,
//     1 site days 7 and 21); RIG for category III only. Previously immunized (documented PrEP or at least 2
//     PEP doses): 1-site ID days 0 and 3, 4-site ID day 0, or 1-site IM days 0 and 3; no RIG. A complete
//     PEP less than 3 months before: wound care only. A category III exposure is vaccinated even months or
//     years later. Vaccine is never withheld for lack of RIG. PEP may stop if the animal tests negative, or
//     a dog, cat or ferret stays healthy for 10 days from the bite.
//   - p. 215: RIG once, at or soon after the start of PEP, never after day 7 from the first vaccine dose;
//     maximum 40 IU/kg equine, 20 IU/kg human; infiltrated into and around the wound as much as is
//     anatomically feasible, no longer the remainder IM at a distance; no skin test before equine RIG;
//     monoclonal products encouraged where available; sutures delayed or loose; priority when RIG is
//     scarce: multiple bites, deep wounds, bites to the head, neck or hands, severe immunodeficiency, a
//     confirmed or probable rabid animal, bats.
//   - p. 217: immunocompromised (for example HIV not on ART, or below the CD4 criteria), category II or
//     III: a full course plus RIG in all cases even if previously immunized: 3 visits (days 0, 7, 21-28)
//     or 2 visits (days 0, 7) with antibody testing 2-4 weeks after the first dose.
//   - pp. 211, 213: one intradermal dose is 0.1 mL.
//
// Pure: no DOM, no clock. Dates are computed only from a day-0 date the user enters.

import { inputFault } from './num.js';

export const CATEGORY_OPTIONS = [
  { value: 'I', text: 'I: touching or feeding, licks on intact skin' },
  { value: 'II', text: 'II: nibbling of bare skin, minor scratch or abrasion without bleeding' },
  { value: 'III', text: 'III: bite or scratch through the skin, saliva on broken skin or mucosa, any bat contact' },
];
export const PRIOR_OPTIONS = [
  { value: 'none', text: 'Never vaccinated' },
  { value: 'prior', text: 'Previously vaccinated (documented PrEP, or 2 or more PEP doses)' },
  { value: 'recent', text: 'Completed PEP less than 3 months ago' },
  { value: 'unknown', text: 'Not known' },
];
export const RIG_OPTIONS = [
  { value: 'human', text: 'Human RIG' },
  { value: 'equine', text: 'Equine RIG' },
  { value: 'mab', text: 'Monoclonal antibody product' },
  { value: 'none', text: 'None available' },
];
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

const NOTE = 'This follows WHO\'s April 2018 rabies vaccine position paper. Your national protocol may differ; follow it.';
const STOP = 'PEP may stop if the animal tests negative for rabies, or if a dog, cat or ferret stays healthy for 10 days from the bite.';

function addDays(iso, n) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso));
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + n));
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}
const validDate = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso));
  if (!m) return false;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return d.getUTCFullYear() === Number(m[1]) && d.getUTCMonth() === Number(m[2]) - 1 && d.getUTCDate() === Number(m[3]);
};

export function whoRabiesPep(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const cat = o.category;
  if (!CATEGORY_OPTIONS.some((x) => x.value === cat)) return { valid: false, message: 'Choose the exposure category: I, II or III.' };
  if (!PRIOR_OPTIONS.some((x) => x.value === o.prior)) return { valid: false, message: 'Choose the person\'s rabies vaccination history.' };
  if (!YES_NO.some((x) => x.value === o.immuno)) return { valid: false, message: 'Choose whether the person is immunocompromised (for example HIV not on treatment): it changes the schedule and adds RIG.' };
  if (!(o.rig === undefined || o.rig === null || o.rig === '') && !RIG_OPTIONS.some((x) => x.value === o.rig)) return { valid: false, message: 'Choose the RIG available from the list.' };
  let w = null;
  if (!(o.weight === undefined || o.weight === null || String(o.weight).trim() === '')) {
    const f = inputFault([['the weight', o.weight, 0.5, 250, 'kg']]);
    if (f) return { valid: false, message: f };
    w = Number(o.weight);
  }
  const day0 = String(o.day0 || '').trim();
  if (day0 && !validDate(day0)) return { valid: false, message: 'Enter the date of the first vaccine dose as a date (year, month, day).' };
  const on = (n) => (day0 ? ` (${addDays(day0, n)})` : '');
  const notes = [];

  if (cat === 'I') {
    return { valid: true, band: 'Category I: wash the skin that was touched. No PEP is needed.', bandLabel: 'No PEP', abnormal: false, notes: [], note: NOTE };
  }
  notes.push('Wash and flush every bite and scratch at once with soap or detergent and plenty of water. Antibiotics, pain relief and a tetanus vaccine may be needed, depending on the wound.');

  let band;
  let label;
  let rig = false;
  if (o.immuno === 'yes') {
    rig = true;
    band = `Category ${cat}, immunocompromised: a full vaccine course plus RIG, even if previously vaccinated. Either 3 visits, ID or IM, on day 0${on(0)}, day 7${on(7)} and one day from day 21 to 28${day0 ? ` (${addDays(day0, 21)} to ${addDays(day0, 28)})` : ''}; or 2 visits, on day 0 and day 7, with an antibody test 2 to 4 weeks after the first dose.`;
    label = 'Full course + RIG';
    notes.push('WHO advises consulting an infectious disease specialist or immunologist.');
  } else if (o.prior === 'recent') {
    band = `Category ${cat}, after a complete PEP less than 3 months ago: wound care only. No vaccine and no RIG.`;
    label = 'Wound care only';
  } else if (o.prior === 'prior') {
    band = `Category ${cat}, previously vaccinated: vaccine only, no RIG. Any one of: 1-site ID on day 0${on(0)} and day 3${on(3)}; 4-site ID on day 0 only; or 1-site IM on day 0 and day 3.`;
    label = 'Vaccine, no RIG';
  } else {
    rig = cat === 'III';
    band = `Category ${cat}, ${o.prior === 'unknown' ? 'vaccination history not known (treated as never vaccinated)' : 'never vaccinated'}: vaccine${rig ? ' plus RIG' : ', no RIG'}. Any one schedule: 1-week ID, 2 sites on day 0${on(0)}, day 3${on(3)} and day 7${on(7)}; 4-dose Essen IM, 1 site on days 0, 3, 7 and one day from day 14 to 28${day0 ? ` (${addDays(day0, 14)} to ${addDays(day0, 28)})` : ''}; or Zagreb IM, 2 sites on day 0, then 1 site on day 7${on(7)} and day 21${on(21)}.`;
    label = rig ? 'Vaccine + RIG' : 'Vaccine, no RIG';
    if (o.prior === 'unknown') notes.push('A history that cannot be documented counts as none: WHO waives RIG only with documented PrEP or at least 2 earlier PEP doses.');
  }
  notes.push('One intradermal dose is 0.1 mL of vaccine.');

  if (rig) {
    const deadline = day0 ? ` Give it once, as soon as possible, and not after day 7 from the first vaccine dose (${addDays(day0, 7)}).` : ' Give it once, as soon as possible, and not after day 7 from the first vaccine dose.';
    if (o.rig === 'human' || o.rig === 'equine') {
      const perKg = o.rig === 'human' ? 20 : 40;
      notes.push(`RIG: ${o.rig === 'human' ? 'human' : 'equine'}, at most ${perKg} IU/kg${w !== null ? `, ${Math.round(w * perKg).toLocaleString('en-US')} IU for ${Math.round(w * 10) / 10} kg` : ''}. That is a ceiling, not a target: infiltrate into and around the wound as much as is anatomically feasible, and do not inject the rest at a distant site.${deadline}`);
      if (w === null) notes.push('No weight was entered, so the RIG ceiling is given per kg only.');
      if (o.rig === 'equine') notes.push('No skin test before equine RIG (it does not predict reactions); be ready for anaphylaxis.');
    } else if (o.rig === 'mab') {
      notes.push(`RIG: a monoclonal antibody product, which WHO encourages where available; WHO gives no IU/kg ceiling for it, so dose by the product label.${deadline}`);
    } else if (o.rig === 'none') {
      notes.push('No RIG available: give the vaccine anyway. Thorough washing plus the full vaccine course is highly effective, and vaccine is never withheld for lack of RIG.');
    } else {
      notes.push(`RIG: at most 20 IU/kg human or 40 IU/kg equine, infiltrated into and around the wound.${deadline} No RIG type was entered, so no IU amount is given.`);
    }
    notes.push('Delay suturing after RIG, or keep sutures loose. Where RIG is scarce, WHO puts first: multiple bites, deep wounds, bites to the head, neck or hands, severe immunodeficiency, a confirmed or probable rabid animal, and bats.');
  }
  if (cat === 'III') notes.push('A category III exposure is vaccinated even if it happened months or years ago.');
  if (label !== 'Wound care only') notes.push(STOP);
  return { valid: true, band, bandLabel: label, abnormal: true, notes, note: NOTE };
}
