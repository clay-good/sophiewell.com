// spec-v1555 tool 4: has this snakebite patient met a criterion to repeat antivenom, and when? WHO SEARO,
// WHO AFRO, or India's national regimen.
//
// Sources, read October 6, 2026 (facts restated, nothing reproduced):
//   - SEARO16: Warrell DA, for WHO SEARO. Guidelines for the management of snakebites, 2nd ed., 2016 (IRIS
//     10665/249547), pp. 142-143: repeat the same dose if the blood is still incoagulable (20WBCT) 6 hours
//     after the initial dose; within 1-2 hours if bleeding briskly; after 1 hour if neurotoxic or
//     cardiovascular signs are worse; repeat doses after the patient is paralyzed and ventilated have no
//     proven value. Annex 3 (p. 191) quotes Indian manufacturers at 5 vials for Echis carinatus (10 for E. c.
//     sochureki in north and northwest India).
//   - AFRO10: WHO AFRO. Guidelines for the prevention and clinical management of snakebite in Africa, 2010
//     (IRIS 10665/204458), p. 80 (read as a page image): still incoagulable 6 hours after the first dose,
//     repeat, and so on every 6 hours until coagulability is restored. No timing rule for bleeding or
//     neurotoxic signs.
//   - INSTG16: Government of India, MoHFW. Standard treatment guidelines: management of snake bite, 2016,
//     pp. 36 and 39-41: neuroparalytic 10 vials, a second 10 after 1 hour if no improvement, maximum 20;
//     vasculotoxic low-dose 10 vials (Russell's viper) or 6 (saw-scaled viper), then 2 vials every 6 hours
//     until clotting normalizes or 3 days; high-dose 10 vials, then 6 every 6 hours; at 30 vials reconsider
//     whether more is helping, particularly without proven systemic bleeding; no Indian antivenom for sea
//     snakes or pit vipers.
//
// Never names or doses a commercial antivenom: outside India mode the initial dose is the user's, from the
// product insert or national protocol. A 20WBCT that was not done is never read as clotted.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const PROTOCOL_OPTIONS = [
  { value: 'searo', text: 'WHO South-East Asia (SEARO 2016)' },
  { value: 'afro', text: 'WHO Africa (AFRO 2010)' },
  { value: 'india', text: 'India national guideline (2016)' },
];
export const REGIMEN_OPTIONS = [
  { value: 'neuro', text: 'India: neuroparalytic (10 vials)' },
  { value: 'low-rv', text: 'India: vasculotoxic, low-dose, Russell\'s viper (10 vials)' },
  { value: 'low-ssv', text: 'India: vasculotoxic, low-dose, saw-scaled viper (6 vials)' },
  { value: 'high', text: 'India: vasculotoxic, high-dose (10 vials)' },
];
export const WBCT_OPTIONS = [
  { value: 'clots', text: 'Clots' },
  { value: 'noclot', text: 'Does not clot' },
  { value: 'notdone', text: 'Not done' },
];
export const NEURO_OPTIONS = [
  { value: 'none', text: 'None' },
  { value: 'better', text: 'Improving' },
  { value: 'same', text: 'Unchanged' },
  { value: 'worse', text: 'Worse' },
];
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

const INDIA = {
  neuro: { first: 10, repeat: 10, cap: 20 },
  'low-rv': { first: 10, repeat: 2, cap: 30 },
  'low-ssv': { first: 6, repeat: 2, cap: 30 },
  high: { first: 10, repeat: 6, cap: 30 },
};
const NOTE = {
  searo: 'This follows WHO SEARO\'s 2016 snakebite guidelines. The vial count is the initial dose from the product insert or national protocol; antivenom strength varies between products.',
  afro: 'This follows WHO AFRO\'s 2010 snakebite guidelines. The vial count is the initial dose from the product insert or national protocol; antivenom strength varies between products.',
  india: 'This follows India\'s 2016 national snakebite treatment guideline. Its vial counts are for Indian polyvalent antivenom and do not transfer to other products.',
};
const vials = (n) => `${n} vial${n === 1 ? '' : 's'}`;

export function antivenomRepeat(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const protocol = PROTOCOL_OPTIONS.find((x) => x.value === o.protocol);
  if (!protocol) return { valid: false, message: 'Choose the protocol: WHO SEARO, WHO AFRO, or India\'s national guideline.' };
  const india = protocol.value === 'india';
  const regimen = REGIMEN_OPTIONS.find((x) => x.value === o.regimen);
  if (india && !regimen) return { valid: false, message: 'Choose the India regimen: neuroparalytic, low-dose (Russell\'s or saw-scaled viper) or high-dose.' };
  const wbct = WBCT_OPTIONS.find((x) => x.value === o.wbct);
  if (!wbct) return { valid: false, message: 'Choose the 20WBCT result now: clots, does not clot, or not done.' };
  if (!YES_NO.some((x) => x.value === o.bleeding)) return { valid: false, message: 'Choose whether the patient is still bleeding briskly.' };
  const neuro = NEURO_OPTIONS.find((x) => x.value === o.neuro);
  if (!neuro) return { valid: false, message: 'Choose the neurotoxic or cardiovascular signs: none, improving, unchanged or worse.' };
  if (!YES_NO.some((x) => x.value === o.ventilated)) return { valid: false, message: 'Choose whether the patient is paralyzed and on a ventilator.' };
  const f = inputFault([['the hours since the initial dose ended', o.hours, 0, 48, 'hours']]);
  if (f) return { valid: false, message: f };
  const h = Number(o.hours);

  const notes = [];
  let dose;
  let plan = null;
  if (india) {
    plan = INDIA[regimen.value];
    dose = plan.repeat;
    if (String(o.dose ?? '').trim() !== '' && Number(o.dose) !== plan.first) notes.push(`India's regimen sets the vial counts; the ${o.dose} vials entered are not used.`);
    if (regimen.value === 'neuro' && wbct.value === 'noclot') return { valid: false, message: 'The blood does not clot, so there is vasculotoxic envenoming: choose a vasculotoxic regimen (the neuroparalytic one has no clotting repeat).' };
  } else {
    const fd = inputFault([['the initial dose in vials (from the product insert or national protocol)', o.dose, 1, 100, 'vials']]);
    if (fd) return { valid: false, message: fd };
    dose = Number(o.dose);
    if (o.regimen && regimen) notes.push('The India regimen chosen is not used outside India mode.');
  }

  let given = null;
  if (String(o.given ?? '').trim() !== '') {
    const fg = inputFault([['the vials given so far', o.given, 0, 200, 'vials']]);
    if (fg) return { valid: false, message: fg };
    given = Number(o.given);
    if (!india) notes.push('The vials given so far are checked only against India\'s limits; WHO sets no maximum.');
  } else if (india) {
    notes.push(`Vials given so far: not entered, so India's ${plan.cap}-vial limit is not checked.`);
  }

  const out = (band, bandLabel, abnormal) => ({ valid: true, band, bandLabel, abnormal, notes, note: NOTE[protocol.value] });

  // India's caps come first: past them, the guideline stops or reconsiders rather than repeating.
  if (india && given !== null && given >= plan.cap) {
    if (regimen.value === 'neuro') return out(`No more antivenom: ${vials(given)} given, and India's maximum for neuroparalytic envenoming is 20. Continue respiratory support.`, 'Maximum reached', true);
    notes.push('At 30 vials India\'s guideline says to reconsider whether more antivenom is helping, particularly without proven systemic bleeding. If clotting stays abnormal after large doses, it gives fresh frozen plasma or cryoprecipitate (or fresh whole blood).');
  }

  // The neurotoxic and cardiovascular rule.
  const neuroDue = india ? (regimen.value === 'neuro' && (neuro.value === 'same' || neuro.value === 'worse')) : neuro.value === 'worse';
  if (neuroDue && protocol.value !== 'afro') {
    if (o.ventilated === 'yes') {
      notes.push('Repeat doses for paralysis after the patient is paralyzed and ventilated have no proven value (SEARO); keep ventilating and give the anticholinesterase trial.');
    } else if (h >= 1) {
      if (india && given !== null && given + dose > plan.cap) return out(`No more than ${plan.cap - given} more vials: India's maximum for neuroparalytic envenoming is 20.`, 'Near the maximum', true);
      if (india) notes.push('More antivenom does not reverse drooping eyelids alone after a krait bite: stop once the swallowing and breathing weakness is over.');
      return out(`Repeat now: ${vials(dose)}${india ? ' (India\'s second neuroparalytic dose)' : ', the same as the initial dose'}. The ${neuro.value === 'worse' ? 'neurotoxic or cardiovascular signs are worse' : 'signs have not improved'} 1 hour or more after the dose.`, 'Repeat now', true);
    } else {
      return out(`Reassess at 1 hour after the dose (${Math.round((1 - h) * 60)} minutes from now): if the ${india ? 'signs have not improved' : 'signs are still worse'}, repeat ${vials(dose)}.`, 'Reassess at 1 hour', true);
    }
  } else if (india && regimen.value !== 'neuro' && neuro.value === 'worse') {
    notes.push('India\'s guideline repeats for worse neurotoxic or cardiovascular signs under its neuroparalytic regimen (a second 10 vials after 1 hour, maximum 20); use it if there is neurotoxic envenoming too.');
  } else if (neuro.value === 'worse' && protocol.value === 'afro') {
    notes.push('WHO AFRO gives no timing for repeating antivenom for worse neurotoxic or cardiovascular signs; WHO SEARO repeats the initial dose after 1 hour. Respiratory support is the only life-saving treatment for neurotoxic paralysis.');
  }

  // Brisk bleeding (SEARO only).
  if (o.bleeding === 'yes') {
    if (protocol.value === 'searo') {
      if (h >= 1) return out(`Repeat now: ${vials(dose)}, the same as the initial dose. The patient is still bleeding briskly 1 hour or more after the dose (SEARO: within 1 to 2 hours).`, 'Repeat now', true);
      return out(`Still bleeding briskly: repeat ${vials(dose)} at 1 to 2 hours after the dose (from ${Math.round((1 - h) * 60)} minutes from now) if it continues.`, 'Repeat at 1-2 hours', true);
    }
    notes.push(`${protocol.value === 'afro' ? 'WHO AFRO' : 'India\'s guideline'} gives no separate timing for brisk bleeding; WHO SEARO repeats the dose within 1 to 2 hours.`);
  }

  // The clotting rule.
  if (wbct.value === 'noclot') {
    if (h >= 6) {
      const tail = india
        ? (regimen.value === 'high' ? ' Repeat every 6 hours until clotting normalizes or the swelling subsides.' : ' Repeat every 6 hours until clotting normalizes or for 3 days, whichever is first.')
        : protocol.value === 'afro' ? ' Repeat every 6 hours until the blood clots.' : ' Repeat the 20WBCT 6 hours after this dose.';
      if (india && regimen.value === 'low-ssv') notes.push('SEARO\'s annex quotes Indian manufacturers at 5 vials for the saw-scaled viper (10 for the northern subspecies); India\'s guideline says 6 and is followed here.');
      return out(`Repeat now: ${vials(dose)}${india ? '' : ', the same as the initial dose'}. The blood still does not clot 6 hours or more after the dose.${tail}`, 'Repeat now', true);
    }
    notes.push('After a dose large enough to neutralize the venom, the liver takes about 3 to 9 hours to restore clotting factors, so a non-clotting test before 6 hours is not yet a reason to repeat.');
    return out(`Re-test the 20WBCT at 6 hours after the dose (in ${Math.round((6 - h) * 10) / 10} hours). If it still does not clot then, repeat ${vials(dose)}.`, 'Re-test at 6 hours', true);
  }
  if (wbct.value === 'notdone') {
    return out('Do a 20WBCT: without it this cannot say no repeat criterion is met. A test not done is never read as clotted.', 'Do the 20WBCT', true);
  }
  notes.push('Viper envenoming can come back 24 to 48 hours after a first response: keep re-testing the 20WBCT.');
  return out('No repeat criterion is met now: the blood clots, and no bleeding or neurotoxic rule calls for more antivenom.', 'No repeat criterion met', false);
}
