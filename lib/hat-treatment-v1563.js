// spec-v1563 tool 1: sleeping sickness (human African trypanosomiasis, HAT): stage and first-choice drug
// (WHO 2024).
//
// Source: WHO. Guidelines for the treatment of human African trypanosomiasis, 2024 (IRIS 10665/378083; CC
// BY-NC-SA 3.0 IGO, facts restated). Read October 6, 2026: summaries (pp. vii-ix), sections 2.1.2-2.1.5
// (pp. 6-8), Table 2 (fexinidazole) and the NECT section:
//   - Stages: first, CSF 5 WBC/microL or fewer and no trypanosomes; second, more than 5 or trypanosomes;
//     severe second, 100 or more.
//   - Gambiense, 6 years or more and 20 kg or more: with a low suspicion of severe disease (none of the
//     listed neurological or psychiatric signs; sleep disorder alone does not count) and confident
//     follow-up, fexinidazole without a lumbar puncture; otherwise puncture: under 100 WBC fexinidazole, 100
//     or more NECT; puncture not done or unreliable, NECT. Under 6 years or under 20 kg: puncture;
//     pentamidine for first stage, NECT for second or when CSF is unavailable. Pregnancy: fexinidazole after
//     the first trimester; otherwise the former recommendations (TRS 984).
//   - Rhodesiense, 6 years or more and 20 kg or more: fexinidazole over suramin (first stage) and over
//     melarsoprol (second; melarsoprol may be preferred if unable to swallow, fexinidazole contraindicated,
//     persistent vomiting or doubtful absorption). Under 6 or under 20 kg: suramin (first), melarsoprol
//     (second). Pentamidine as immediate interim treatment while drugs are awaited. Pregnancy: fexinidazole
//     and pentamidine preferred.
//   - Fexinidazole 600 mg tablets once daily with a substantial meal, directly observed, 10 days: 35 kg or
//     more, 3 tablets days 1-4 then 2 days 5-10; 20-34 kg, 2 then 1.
//   - NECT: nifurtimox 15 mg/kg/day by mouth in 3 doses for 10 days with eflornithine 400 mg/kg/day IV in
//     two 2-hour infusions for 7 days.
//   - Hospitalize: psychiatric disorders, a child under 35 kg, 100 or more WBC treated with fexinidazole,
//     risk of poor compliance (rhodesiense also alcohol use disorder or vomiting).
//
// Stated rather than hidden: the spec gave eflornithine for 14 days, which is NECT-long (the rescue
// regimen); NECT is 7 days. Acoziborole is not in the 2024 guidelines and is not offered. Pentamidine,
// suramin and melarsoprol doses are not printed.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const FORM_OPTIONS = [{ value: 'gambiense', text: 'T. b. gambiense (West and Central Africa)' }, { value: 'rhodesiense', text: 'T. b. rhodesiense (East and southern Africa)' }];
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];
export const LP_OPTIONS = [
  { value: 'done', text: 'Done, results reliable' },
  { value: 'notdone', text: 'Not done' },
  { value: 'unreliable', text: 'Done, results unreliable (e.g. over 100 red cells/microL)' },
];
export const PREG_OPTIONS = [{ value: 'no', text: 'Not pregnant' }, { value: 'first', text: 'First trimester' }, { value: 'later', text: 'Second or third trimester' }];

const NOTE = 'This follows WHO\'s 2024 HAT treatment guidelines (acoziborole is not in them). Give fexinidazole after a substantial meal, every dose observed.';

function fexi(kg) {
  return kg >= 35
    ? 'Fexinidazole 600 mg tablets once daily with food: 3 tablets (1,800 mg) on days 1-4, then 2 tablets (1,200 mg) on days 5-10.'
    : 'Fexinidazole 600 mg tablets once daily with food: 2 tablets (1,200 mg) on days 1-4, then 1 tablet (600 mg) on days 5-10.';
}
const nect = (kg) => `NECT: nifurtimox ${Math.round(5 * kg)} mg by mouth three times a day (15 mg/kg/day) for 10 days, with eflornithine ${Math.round(200 * kg).toLocaleString('en-US')} mg IV twice a day as 2-hour infusions (400 mg/kg/day) for 7 days.`;

export function hatTreatment(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const form = FORM_OPTIONS.find((x) => x.value === o.form);
  if (!form) return { valid: false, message: 'Choose the form: gambiense or rhodesiense.' };
  const f = inputFault([['the age', o.age, 0, 120, 'years'], ['the weight', o.weight, 1, 250, 'kg']]);
  if (f) return { valid: false, message: f };
  const years = Number(o.age);
  const kg = Number(o.weight);
  const big = years >= 6 && kg >= 20;
  const notes = [];
  const out = (band, label, abnormal = true) => ({ valid: true, band, bandLabel: label, abnormal, notes, note: NOTE });

  // CSF stage, when a reliable puncture was done.
  let stage = null;
  if (o.lp === 'done') {
    if (String(o.csfWbc ?? '').trim() === '') return { valid: false, message: 'Enter the CSF white cell count (per microL): the puncture is marked done.' };
    const fc = inputFault([['the CSF white cell count', o.csfWbc, 0, 10000, 'cells/microL']]);
    if (fc) return { valid: false, message: fc };
    const w = Number(o.csfWbc);
    if (o.trypCsf !== 'yes' && o.trypCsf !== 'no') return { valid: false, message: 'Choose whether trypanosomes were seen in the CSF.' };
    stage = w >= 100 ? 'severe' : (w > 5 || o.trypCsf === 'yes') ? 'second' : 'first';
  }
  const stageText = { first: 'first stage (5 WBC/microL or fewer, no trypanosomes)', second: 'second stage (more than 5 WBC/microL or trypanosomes, under 100)', severe: 'severe second stage (100 WBC/microL or more)' };
  const preg = o.pregnant;

  if (form.value === 'gambiense') {
    if (preg === 'first') return out('Gambiense HAT in the first trimester: fexinidazole is given only after it; the former WHO recommendations (Technical Report Series 984) apply. Seek specialist advice.', 'First trimester: specialist');
    if (big) {
      if (stage === null) {
        if (o.severe !== 'yes' && o.severe !== 'no') return { valid: false, message: 'Choose whether any sign suggests severe disease (confusion, abnormal behavior, excessive talking, anxiety, poor coordination, tremor, weakness, speech or gait problems, abnormal movements, seizures). Sleep disorder alone does not count.' };
        if (o.severe === 'no' && o.followUp === 'yes' && o.lp !== 'unreliable') {
          notes.push(fexi(kg));
          if (!o.lp) notes.push('Lumbar puncture: not entered, and not needed on this path.');
          if (kg < 35) notes.push('Hospitalize: a child under 35 kg.');
          return out('Gambiense HAT, no sign of severe disease and reliable follow-up: fexinidazole without a lumbar puncture.', 'Fexinidazole, no LP');
        }
        if (o.lp === 'notdone' || o.lp === 'unreliable') {
          notes.push(nect(kg));
          return out(`Gambiense HAT needing a lumbar puncture (${o.severe === 'yes' ? 'signs of severe disease' : 'follow-up not assured'}), but no reliable CSF result: NECT.`, 'NECT');
        }
        if (o.followUp !== 'yes' && o.followUp !== 'no') notes.push('Reliable follow-up: not entered. Without it a lumbar puncture is needed.');
        return out(`Gambiense HAT: a lumbar puncture is needed (${o.severe === 'yes' ? 'signs of severe disease' : 'follow-up not assured'}). Fexinidazole under 100 WBC/microL; NECT at 100 or more or without a reliable result.`, 'Lumbar puncture needed');
      }
      if (stage === 'severe') { notes.push(nect(kg)); return out(`Gambiense HAT, ${stageText[stage]}: NECT.`, 'NECT'); }
      notes.push(fexi(kg));
      if (kg < 35) notes.push('Hospitalize: a child under 35 kg.');
      return out(`Gambiense HAT, ${stageText[stage]}: fexinidazole.`, 'Fexinidazole');
    }
    if (stage === null) {
      if (o.lp === 'notdone' || o.lp === 'unreliable') { notes.push(nect(kg)); return out('Gambiense HAT under 6 years or under 20 kg without a reliable CSF result: NECT.', 'NECT'); }
      return out('Gambiense HAT under 6 years or under 20 kg: a lumbar puncture decides. Pentamidine for first stage; NECT for second stage or without a reliable result.', 'Lumbar puncture needed');
    }
    if (stage === 'first') return out(`Gambiense HAT under 6 years or under 20 kg, ${stageText[stage]}: pentamidine (dose per the 2024 guidelines).`, 'Pentamidine');
    notes.push(nect(kg));
    return out(`Gambiense HAT under 6 years or under 20 kg, ${stageText[stage]}: NECT.`, 'NECT');
  }

  // Rhodesiense.
  notes.push('If the recommended drug is not at hand, start pentamidine at once as interim treatment and switch when it arrives: rhodesiense progresses fast.');
  if (preg === 'first' || preg === 'later') notes.push('In pregnancy fexinidazole and pentamidine are preferred; suramin and melarsoprol may be needed as rescue.');
  if (stage === null) return { valid: false, message: 'Enter the lumbar puncture result: rhodesiense treatment depends on the stage (CSF white cells and trypanosomes).' };
  if (!big) return out(`Rhodesiense HAT under 6 years or under 20 kg, ${stageText[stage]}: ${stage === 'first' ? 'suramin' : 'melarsoprol'} (dose per the 2024 guidelines).`, stage === 'first' ? 'Suramin' : 'Melarsoprol');
  if (stage !== 'first' && o.swallow === 'no') return out(`Rhodesiense HAT, ${stageText[stage]}, unable to take fexinidazole reliably by mouth: melarsoprol may be preferred.`, 'Melarsoprol');
  notes.unshift(fexi(kg));
  if (kg < 35) notes.push('Hospitalize: body weight under 35 kg.');
  if (stage !== 'first' && o.swallow !== 'yes') notes.push('Able to swallow and keep it down: not entered. Melarsoprol may be preferred if not, or with persistent vomiting.');
  return out(`Rhodesiense HAT, ${stageText[stage]}: fexinidazole (over ${stage === 'first' ? 'suramin' : 'melarsoprol'}).`, 'Fexinidazole');
}
