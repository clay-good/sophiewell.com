// spec-v1561 tool 1: paucibacillary (PB) or multibacillary (MB) leprosy, and the WHO 2018 multidrug therapy (MDT).
//
// Source: WHO SEARO. Guidelines for the diagnosis, treatment and prevention of leprosy, 2018 (IRIS 10665/274127;
// CC BY-NC-SA 3.0 IGO, facts restated, nothing reproduced), pp. 1-2 (the 2017 case definitions) and Table 3 (p. 17),
// read October 6, 2026. PB: 1 to 5 skin lesions without bacilli on a skin smear. MB: more than five lesions; or
// nerve involvement (pure neuritis, or lesions with neuritis); or bacilli on a slit-skin smear, whatever the count.
// Table 3 gives the same three drugs for both, for 12 months (MB) or 6 months (PB): adults rifampicin 600 mg
// monthly, clofazimine 300 mg monthly and 50 mg daily, dapsone 100 mg daily; children 10-14 years rifampicin 450 mg
// monthly, clofazimine 150 mg monthly and 50 mg on alternate days, dapsone 50 mg daily; children under 10 or under
// 40 kg rifampicin 10 mg/kg monthly, clofazimine 100 mg monthly and 50 mg twice weekly, dapsone 2 mg/kg daily
// (single-drug formulations, since no blister pack fits).
//
// Stated rather than hidden: unassessed nerve involvement or an undone smear never defaults to PB; with 1-5
// lesions the answer is incomplete until both are known. The pre-2018 two-drug PB regimen is superseded.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const NERVE_OPTIONS = [{ value: 'no', text: 'No nerve involvement' }, { value: 'yes', text: 'Nerve involvement (thickened nerve with loss of feeling or weakness)' }];
export const SMEAR_OPTIONS = [{ value: 'negative', text: 'Negative' }, { value: 'positive', text: 'Positive' }, { value: 'notdone', text: 'Not done' }];

const NOTE = 'This follows WHO\'s 2018 leprosy guidelines. Your national program may differ; follow it.';

export function leprosyClassifyMdt(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the number of skin lesions', o.lesions, 0, 100], ['the age', o.age, 0, 120, 'years']]);
  if (f) return { valid: false, message: f };
  const lesions = Math.floor(Number(o.lesions));
  const age = Number(o.age);
  const nerve = NERVE_OPTIONS.find((x) => x.value === o.nerve);
  const smear = SMEAR_OPTIONS.find((x) => x.value === o.smear);
  if (lesions === 0 && (!nerve || nerve.value === 'no') && (!smear || smear.value !== 'positive')) {
    return { valid: false, message: 'Enter what was found: leprosy needs a skin lesion, nerve involvement, or a positive smear.' };
  }
  let group = null;
  const why = [];
  if (lesions > 5) why.push(`${lesions} skin lesions (more than 5)`);
  if (nerve && nerve.value === 'yes') why.push('nerve involvement');
  if (smear && smear.value === 'positive') why.push('a positive skin smear');
  if (why.length) group = 'MB';
  else if (!nerve) return { valid: false, message: 'Choose whether there is nerve involvement: with 1-5 lesions it decides PB or MB, and an unassessed nerve is never read as none.' };
  else group = 'PB';
  const notes = [];
  if (group === 'PB' && (!smear || smear.value === 'notdone')) notes.push('No smear result was entered: PB here rests on 1-5 lesions with no nerve involvement; a positive smear would make it MB.');
  let regimen;
  let w = null;
  if (age < 10 || !(o.weight === undefined || o.weight === null || String(o.weight).trim() === '')) {
    const fw = inputFault([['the weight', o.weight, 2, 250, 'kg']]);
    if (fw) return { valid: false, message: `${fw} Children under 10 years or under 40 kg are dosed by weight.` };
    w = Number(o.weight);
  }
  if (age < 10 || (w !== null && w < 40 && age < 15)) {
    regimen = `rifampicin ${Math.round(w * 10)} mg once a month (10 mg/kg), clofazimine 100 mg once a month and 50 mg twice a week, and dapsone ${Math.round(w * 2)} mg daily (2 mg/kg)`;
    notes.push('Under 40 kg no blister pack fits: use single-drug formulations (from 20 kg the operational manual explains partial use of MB-child packs).');
  } else if (age < 15) {
    regimen = 'rifampicin 450 mg once a month, clofazimine 150 mg once a month and 50 mg on alternate days, and dapsone 50 mg daily';
  } else {
    regimen = 'rifampicin 600 mg once a month, clofazimine 300 mg once a month and 50 mg daily, and dapsone 100 mg daily';
  }
  const months = group === 'MB' ? 12 : 6;
  notes.push('Since 2018, PB and MB take the same three drugs; only the duration differs. The older two-drug PB regimen is superseded.');
  return {
    valid: true,
    band: `${group === 'MB' ? 'Multibacillary (MB)' : 'Paucibacillary (PB)'} leprosy${why.length ? ` (${why.join(', ')})` : ' (1-5 lesions, no nerve involvement, no bacilli)'}: ${regimen}, for ${months} months (${months} packs of 28 days).`,
    bandLabel: `${group}, ${months} months`,
    abnormal: true,
    notes,
    note: NOTE,
  };
}
