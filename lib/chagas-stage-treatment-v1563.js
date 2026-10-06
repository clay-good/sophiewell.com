// spec-v1563 tool 4: Chagas disease: the stage, whether to give trypanocidal treatment, and the
// benznidazole or nifurtimox dose.
//
// Sources, read October 6, 2026 (facts restated):
//   - SBC23: Marin-Neto JA, Rassi A Jr, et al. SBC guideline on the diagnosis and treatment of patients with
//     cardiomyopathy of Chagas disease, 2023. Arq Bras Cardiol 2023;120(6):e20230269 (PMC10344417; CC BY).
//     Table 5.2: A (indeterminate) normal ECG and imaging, LVEF 55% or more, no cardiac or digestive disease;
//     B1 abnormal ECG, LVEF 55% or more, no heart failure; B2 LVEF under 55%, no heart failure; C previous
//     or current heart failure; D heart failure at rest despite optimized treatment. Chart 9.2: acute or
//     congenital, any age, benznidazole first, nifurtimox second; chronic indeterminate or digestive,
//     children and adolescents to 18 benznidazole first, nifurtimox second; adults under 50 benznidazole, not
//     nifurtimox; 50 or older shared decision, benznidazole; non-advanced cardiac (B1) shared decision,
//     benznidazole; advanced cardiac or digestive disease, do not treat. Pregnant women with a severe acute
//     syndrome (myocarditis or meningoencephalitis) are treated (strong).
//   - PAHO19: PAHO. Guidelines for the diagnosis and treatment of Chagas disease, 2019 (iris.paho.org
//     10665.2/49653): recommendations 5-10 (adults without organ damage, suggested; children, recommended;
//     women of childbearing age who are not pregnant, recommended; adults with organ damage, suggest not
//     treating; acute or congenital, recommended; benznidazole or nifurtimox, either) and Annex 10 doses,
//     daily in 2-3 doses for 60 days: acute, 40 kg or less benznidazole 7.5-10 mg/kg or nifurtimox 10-15
//     mg/kg; over 40 kg benznidazole 5-7 or nifurtimox 8-10; congenital, benznidazole 10 or nifurtimox
//     10-15; recent chronic, benznidazole 7.5 (40 kg or less) or 5 (over 40 kg).
//
// Stated rather than hidden: PAHO accepts nifurtimox for adults and SBC does not; both are shown. SBC names
// only B1 as non-advanced cardiac disease, so B2-D are read as advanced. No daily maximum is printed (none
// is in these sources). In pregnancy, only the severe acute syndrome is addressed; no dose is printed.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const PHASE_OPTIONS = [
  { value: 'acute', text: 'Acute' },
  { value: 'congenital', text: 'Congenital' },
  { value: 'chronic', text: 'Chronic' },
];
export const ECG_OPTIONS = [{ value: 'normal', text: 'Normal' }, { value: 'abnormal', text: 'Abnormal' }];
export const HF_OPTIONS = [
  { value: 'none', text: 'Never' },
  { value: 'yes', text: 'Previous or current heart failure symptoms' },
  { value: 'rest', text: 'At rest despite optimized treatment' },
];
export const DIG_OPTIONS = [{ value: 'none', text: 'None' }, { value: 'early', text: 'Digestive form, not advanced' }, { value: 'advanced', text: 'Advanced digestive form' }];
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

const NOTE = 'This follows the 2023 SBC Chagas cardiomyopathy guideline and PAHO\'s 2019 Chagas guidelines (Annex 10 doses). Treatment lasts 60 days in 2-3 daily doses.';
const mg = (x) => Math.round(x);

export function chagasStageTreatment(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const phase = PHASE_OPTIONS.find((x) => x.value === o.phase);
  if (!phase) return { valid: false, message: 'Choose the phase: acute, congenital or chronic.' };
  const f = inputFault([['the age', o.age, 0, 110, 'years'], ['the weight', o.weight, 1, 200, 'kg']]);
  if (f) return { valid: false, message: f };
  const years = Number(o.age);
  const kg = Number(o.weight);
  const notes = [];
  const out = (band, label, abnormal = true) => ({ valid: true, band, bandLabel: label, abnormal, notes, note: NOTE });
  const range = (a, b) => `${mg(a * kg)}-${mg(b * kg)} mg a day (${a}-${b} mg/kg)`;

  if (o.pregnant === 'yes') {
    notes.push('SBC recommends treating a pregnant woman with a severe acute syndrome (myocarditis or meningoencephalitis). PAHO gives treatment to women of childbearing age who are not pregnant.');
    return out('Pregnancy: no dose is printed here; seek specialist advice. A severe acute syndrome in pregnancy is treated.', 'Pregnancy: specialist');
  }

  if (phase.value === 'acute') {
    const small = kg <= 40;
    notes.push(`Second line: nifurtimox ${small ? range(10, 15) : range(8, 10)}, in 2-3 doses for 60 days.`);
    return out(`Acute Chagas disease: treat (any age). Benznidazole ${small ? range(7.5, 10) : range(5, 7)}, in 2-3 doses for 60 days.`, 'Treat: benznidazole');
  }
  if (phase.value === 'congenital') {
    notes.push(`Alternative: nifurtimox ${range(10, 15)}, in 2-3 doses for 60 days.`);
    return out(`Congenital Chagas disease: treat. Benznidazole ${mg(10 * kg)} mg a day (10 mg/kg), in 2-3 doses for 60 days.`, 'Treat: benznidazole');
  }

  // Chronic: stage first.
  const ecg = ECG_OPTIONS.find((x) => x.value === o.ecg);
  const hf = HF_OPTIONS.find((x) => x.value === o.hf);
  if (!ecg || !hf) return { valid: false, message: 'Choose the ECG result and the heart failure history: chronic Chagas disease is staged by them.' };
  let lvef = null;
  if (String(o.lvef ?? '').trim() !== '') { const fl = inputFault([['the LVEF', o.lvef, 5, 85, '%']]); if (fl) return { valid: false, message: fl }; lvef = Number(o.lvef); }
  let stage;
  if (hf.value === 'rest') stage = 'D';
  else if (hf.value === 'yes') stage = 'C';
  else if (lvef !== null && lvef < 55) stage = 'B2';
  else if (ecg.value === 'abnormal') stage = 'B1';
  else stage = 'A';
  if (lvef === null && (stage === 'A' || stage === 'B1')) notes.push(`LVEF: not entered. Stage ${stage} assumes an LVEF of 55% or more; under 55% would make it B2.`);
  const dig = o.digestive;
  if (stage === 'A' && dig && dig !== 'none') notes.push('With a digestive form the infection is no longer indeterminate; it is managed as the digestive form.');
  const stageText = { A: 'indeterminate form (stage A)', B1: 'stage B1 (abnormal ECG, LVEF 55% or more, no heart failure)', B2: 'stage B2 (LVEF under 55%, no heart failure)', C: 'stage C (previous or current heart failure)', D: 'stage D (heart failure at rest despite treatment)' }[stage];

  notes.push('PAHO Annex 10 prints the chronic dose for a recent chronic infection; it is used here.');
  const bz = `benznidazole ${mg((kg <= 40 ? 7.5 : 5) * kg)} mg a day (${kg <= 40 ? '7.5' : '5'} mg/kg), in 2-3 doses for 60 days`;
  if (['B2', 'C', 'D'].includes(stage) || dig === 'advanced') {
    notes.push('SBC names only stage B1 as non-advanced heart disease; B2 to D are read as advanced.');
    return out(`Chronic Chagas disease, ${dig === 'advanced' && !['B2', 'C', 'D'].includes(stage) ? 'advanced digestive form' : stageText}: do not give trypanocidal treatment (advanced organ damage).`, 'Do not treat');
  }
  if (stage === 'B1') return out(`Chronic Chagas disease, ${stageText}: a shared decision; if treated, ${bz} (SBC: not nifurtimox).`, 'Shared decision');
  if (years <= 18) {
    notes.push(`Second line: nifurtimox (PAHO ${kg <= 40 ? '10-15' : '8-10'} mg/kg a day). A child 12 or younger with a recent chronic infection needs a full evaluation and a formal prescription.`);
    return out(`Chronic Chagas disease, ${stageText}, ${years} years: treat. ${bz[0].toUpperCase()}${bz.slice(1)}.`, 'Treat: benznidazole');
  }
  if (years < 50) {
    notes.push('PAHO suggests treating adults without organ damage and accepts benznidazole or nifurtimox; SBC says benznidazole, not nifurtimox.');
    return out(`Chronic Chagas disease, ${stageText}, adult under 50: treat. ${bz[0].toUpperCase()}${bz.slice(1)}.`, 'Treat: benznidazole');
  }
  return out(`Chronic Chagas disease, ${stageText}, 50 or older: a shared decision; if treated, ${bz} (SBC: not nifurtimox).`, 'Shared decision');
}
