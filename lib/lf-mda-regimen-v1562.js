// spec-v1562 tool 5: which lymphatic filariasis mass drug administration (MDA) regimen fits this area, and is
// this person eligible (WHO 2017)?
//
// Source: WHO. Guideline: alternative mass drug administration regimens to eliminate lymphatic filariasis,
// 2017 (IRIS 10665/259381; CC BY-NC-SA 3.0 IGO, facts restated). Read October 6, 2026, Table 1 (p. xvii),
// Box 1 (p. 2), the definitions (effective coverage 65% or more) and the IDA subgroup considerations:
//   - No onchocerciasis or loiasis: yearly DA (DEC 6 mg/kg with albendazole 400 mg); yearly IDA (ivermectin
//     200 micrograms/kg with DEC and albendazole) instead where MDA has not started or had fewer than four
//     effective rounds, where surveys failed despite coverage, or where infection reappeared after MDA or
//     validation.
//   - Onchocerciasis anywhere in the country: yearly IA (ivermectin 150-200 micrograms/kg with albendazole),
//     not IDA. Loiasis co-endemic with no ivermectin distributed yet: albendazole 400 mg twice a year.
//   - DEC is contraindicated where onchocerciasis or loiasis is co-endemic.
//   - Not eligible: DA, pregnancy, under 2 years, severely ill; IA, pregnancy, under 90 cm, severely ill;
//     albendazole alone, first trimester, under 2 years, a history of seizures or neurocysticercosis. In IDA
//     areas children 2-4 years and anyone under 90 cm get DA.
//
// Stated rather than hidden: the loiasis answer is required and never defaulted, because DEC there is
// dangerous. Tablet counts by height come from the dose-pole tile, not here.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];
export const STATUS_OPTIONS = [
  { value: 'routine', text: 'Four or more effective DA rounds, surveys passing' },
  { value: 'early', text: 'Not started, or fewer than four effective rounds' },
  { value: 'failed', text: 'Failed a survey despite meeting coverage' },
  { value: 'resurgence', text: 'Infection found after MDA stopped or after validation' },
];
export const PREG_OPTIONS = [
  { value: 'no', text: 'Not pregnant' },
  { value: 'first', text: 'Pregnant, first trimester' },
  { value: 'later', text: 'Pregnant, second or third trimester' },
];

const DOSE = {
  DA: 'DEC 6 mg/kg with albendazole 400 mg',
  IDA: 'ivermectin 200 micrograms/kg with DEC 6 mg/kg and albendazole 400 mg',
  IA: 'ivermectin 150-200 micrograms/kg with albendazole 400 mg',
  ALB: 'albendazole 400 mg',
};
const NOTE = 'This follows WHO\'s 2017 guideline on lymphatic filariasis MDA regimens. An effective round reaches 65% or more of the population; tablet counts by height are in the dose-pole tile.';
const known = (v) => v === 'yes' || v === 'no';

export function lfMdaRegimen(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (!known(o.oncho)) return { valid: false, message: 'Choose whether onchocerciasis is endemic anywhere in the country.' };
  if (!known(o.loiasis)) return { valid: false, message: 'Choose whether loiasis is co-endemic: DEC is dangerous there, so this is never assumed.' };
  const f = inputFault([['the age', o.age, 0, 120, 'years']]);
  if (f) return { valid: false, message: f };
  const years = Number(o.age);
  let cm = null;
  if (String(o.height ?? '').trim() !== '') {
    const fh = inputFault([['the height', o.height, 40, 230, 'cm']]);
    if (fh) return { valid: false, message: fh };
    cm = Number(o.height);
  }

  let area;
  let areaWhy;
  if (o.loiasis === 'yes') {
    if (!known(o.ivermectinGiven)) return { valid: false, message: 'Choose whether ivermectin has already been distributed here (for onchocerciasis or filariasis): with loiasis it decides the regimen.' };
    if (o.ivermectinGiven === 'no') { area = 'ALB'; areaWhy = 'albendazole 400 mg twice a year (loiasis co-endemic, no ivermectin distributed yet)'; }
    else { area = 'IA'; areaWhy = 'IA once a year (ivermectin already distributed); no DEC with loiasis'; }
  } else if (o.oncho === 'yes') {
    area = 'IA'; areaWhy = 'IA once a year (onchocerciasis endemic); not IDA, and no DEC';
  } else {
    const st = STATUS_OPTIONS.find((x) => x.value === o.status);
    if (!st) return { valid: false, message: 'Choose the program status: routine, early (fewer than four effective rounds), failed a survey, or resurgence. It decides DA or IDA.' };
    if (st.value === 'routine') { area = 'DA'; areaWhy = 'DA once a year (no onchocerciasis or loiasis)'; }
    else { area = 'IDA'; areaWhy = `IDA once a year (${st.text.toLowerCase()})`; }
  }

  const notes = [`Area regimen: ${DOSE[area]}${area === 'ALB' ? ', twice a year' : ', once a year'}.`];
  if (o.oncho === 'yes' || o.loiasis === 'yes') notes.push('DEC is contraindicated where onchocerciasis or loiasis is co-endemic.');
  if (cm !== null && (area === 'DA' || area === 'ALB')) notes.push(`Height is not used for ${area === 'DA' ? 'DA' : 'albendazole alone'} eligibility; it sets the tablet count on the dose pole.`);

  // The person.
  const preg = PREG_OPTIONS.find((x) => x.value === o.pregnant);
  const out = (band, label, abnormal) => ({ valid: true, band, bandLabel: label, abnormal, notes, note: NOTE });
  const no = (why) => out(`${areaWhy[0].toUpperCase()}${areaWhy.slice(1)}. This person is not eligible: ${why}.`, 'Not eligible', true);
  if (o.ill === 'yes' && area !== 'ALB') return no('severely ill');
  if (area === 'ALB') {
    if (years < 2) return no('under 2 years');
    if (preg?.value === 'first') return no('first trimester of pregnancy');
    if (o.seizures === 'yes') return no('a history of seizures or neurocysticercosis');
    if (o.seizures !== 'no') notes.push('Seizures or neurocysticercosis history: not entered. Either excludes albendazole-alone MDA.');
  } else {
    if (preg && preg.value !== 'no') return no('pregnancy');
    if (!preg) notes.push('Pregnancy: not entered. Pregnant women are excluded from this regimen.');
    if (area === 'DA' && years < 2) return no('under 2 years');
    if (area === 'IA' && cm !== null && cm < 90) return no('under 90 cm tall');
    if (area === 'IA' && cm === null) notes.push('Height: not entered. Ivermectin is not given under 90 cm (about 15 kg).');
    if (area === 'IDA') {
      if (years < 2) return no('under 2 years');
      if (years < 5 || (cm !== null && cm < 90)) return out(`${areaWhy[0].toUpperCase()}${areaWhy.slice(1)}. This person gets DA instead (${years < 5 ? 'aged 2-4 years' : 'under 90 cm'}): ${DOSE.DA}.`, 'Eligible for DA', false);
      if (cm === null) notes.push('Height: not entered. Under 90 cm gets DA instead of IDA.');
    }
  }
  if (o.ill !== 'yes' && o.ill !== 'no') notes.push('Severe illness: not entered. The severely ill are excluded.');
  return out(`${areaWhy[0].toUpperCase()}${areaWhy.slice(1)}. This person is eligible: ${DOSE[area]}.`, `Eligible for ${area === 'ALB' ? 'albendazole' : area}`, false);
}
