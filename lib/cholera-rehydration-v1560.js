// spec-v1560 tool 1: how dehydrated a patient with suspected cholera is, which GTFCC plan, how much fluid,
// and whether an antibiotic is indicated.
//
// Sources, read October 5, 2026 (gtfcc.org; no licence line, so facts restated and nothing reproduced):
//   - GTFCC job aids of 12 July 2024: Evaluating dehydration and admission criteria; Plan A, B and C. Severe:
//     any danger sign (lethargic or unconscious, absent or weak pulse, respiratory distress) or at least 2 of
//     sunken eyes, not able to drink or drinks poorly, skin pinch very slow; some: no danger sign and at
//     least 2 of irritable or restless, sunken eyes, rapid pulse, thirsty, skin pinch slow; both admitted.
//     Plan C Ringer's lactate 30 then 70 mL/kg, over 1 then 5 hours under 12 months and 30 minutes then 2.5
//     hours from 12 months, reassessed every 15-30 minutes. Plan B ORS over 4 hours by age or weight band,
//     reassessed at least hourly, plus ongoing losses. Plan A ORS per loose stool by age, packets for 500
//     mL, 1 L or 2 L a day. Zinc 10 days: 10 mg under 6 months, 20 mg from 6 months.
//   - GTFCC Cholera patient treatment flowchart v1.0, 9 September 2024: Plan B is 75 mL/kg over 4 hours;
//     its weight bands differ from the job aid's (8-10.9 vs 8-11.9 kg; 5-14 vs 4-14 years).
//   - GTFCC interim technical note on antibiotics, revised October 2022, Table 1: for severe dehydration, or
//     whatever the dehydration with high purging (at least one stool an hour over the first 4 hours), a
//     failed first 4 hours of rehydration, pregnancy, severe acute malnutrition, HIV or age over 60.
//     Adults and pregnant women doxycycline 300 mg once (azithromycin 1 g or ciprofloxacin 1 g once);
//     children under 12 doxycycline 2-4 mg/kg once (azithromycin or ciprofloxacin 20 mg/kg, max 1 g). Zinc
//     20 mg for 10 days at 6 months to 5 years; none for children on therapeutic food.
//   - GTFCC interim technical note, Treatment of cholera in pregnant women, 30 September 2020 (French edition
//     on gtfcc.org): in the 2nd and 3rd trimesters, systolic BP below 90 is a danger sign and a fetal heart
//     above 160 counts toward both severe and some; Plan C a 30 mL/kg Ringer's bolus over 30 minutes,
//     repeated while the pulse stays weak, systolic is 90 or below, or consciousness is not full, then 70
//     mL/kg over 3-4 hours, with about 250 mL ORS per stool; Plan B 75 mL/kg ORS over 4 hours plus about
//     250 mL per stool; Plan A about 250 mL per stool. First trimester: standard protocols. Every pregnant
//     woman gets an antibiotic.
//   - GTFCC job aid, Treatment of children with cholera and severe acute malnutrition (French edition):
//     severe is at least 2 of lethargic or unconscious, sunken eyes, absent or weak pulse, not able to drink
//     or drinks poorly, skin pinch very slow (no single-sign rule); IV only for circulatory collapse that
//     leaves the child lethargic or unconscious; standard low-osmolarity ORS, never ReSoMal; Plan A 50 mL
//     per loose stool up to 2 years, 100 mL over 2; Plan B 5 mL/kg every 30 minutes for 2 hours, then 5-10
//     mL/kg alternating with F-75 up to 10 hours; Plan C IV 15 mL/kg over 1 hour (Ringer's lactate or
//     half-strength Darrow's, each with 5% glucose, else 0.45% saline with 5% glucose), repeated once if
//     better, septic shock considered if not.
//
// Readings stated rather than hidden:
//   - A blank sign is "not assessed". The answer is given only when the best and worst readings of every
//     blank agree; otherwise the tile asks.
//   - The job aid's age bands overlap at 4 years ("2-4" and "4-14") and skip 14 to 15; they are read as 2 to
//     under 5 and 5 to under 15, as in the flowchart. Weight bands are read half-open (5 to under 8 kg).
//   - A sign found at a worse grade also meets the milder one: a very slow skin pinch is also slow, drinking
//     poorly also counts with "thirsty", lethargy with "irritable", a weak pulse with "rapid".
//   - Pregnancy: a systolic of exactly 90 is read with the danger signs (the note treats 90 or below).
//   - Severe malnutrition with no lethargy or unconsciousness: the job aid allows IV only for collapse, so
//     the tile gives its oral or nasogastric Plan B schedule and says why.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const POPULATION_OPTIONS = [
  { value: 'general', text: 'Child or adult (not pregnant, no severe malnutrition)' },
  { value: 'preg1', text: 'Pregnant, first trimester' },
  { value: 'preg23', text: 'Pregnant, second or third trimester' },
  { value: 'sam', text: 'Child under 5 with severe acute malnutrition' },
];
// Graded signs: options in order of severity (index 0 is normal).
export const SIGNS = {
  mental: { label: 'mental state', options: [{ value: 'alert', text: 'Awake and alert' }, { value: 'irritable', text: 'Irritable or restless' }, { value: 'lethargic', text: 'Lethargic or unconscious' }] },
  pulse: { label: 'pulse', options: [{ value: 'normal', text: 'Normal' }, { value: 'rapid', text: 'Rapid' }, { value: 'weak', text: 'Weak or absent' }] },
  breathing: { label: 'breathing', options: [{ value: 'normal', text: 'No respiratory distress' }, { value: 'distress', text: 'Respiratory distress' }] },
  eyes: { label: 'eyes', options: [{ value: 'normal', text: 'Not sunken' }, { value: 'sunken', text: 'Sunken' }] },
  drinking: { label: 'drinking', options: [{ value: 'normal', text: 'Normal thirst' }, { value: 'thirsty', text: 'Thirsty, drinks eagerly' }, { value: 'poorly', text: 'Not able to drink, or drinks poorly' }] },
  pinch: { label: 'skin pinch', options: [{ value: 'normal', text: 'Goes back normally' }, { value: 'slow', text: 'Goes back slowly' }, { value: 'veryslow', text: 'Goes back very slowly' }] },
  fetal: { label: 'fetal heart rate', options: [{ value: 'normal', text: '160 a minute or less' }, { value: 'over160', text: 'Above 160 a minute' }] },
};
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

const RANK = { none: 0, some: 1, severe: 2 };
const LABEL = { none: 'No dehydration: Plan A', some: 'Some dehydration: Plan B', severe: 'Severe dehydration: Plan C' };

// A sign found at a worse grade also meets the milder grade (a very slow skin pinch is also slow).
const atLeast = (k, s, v) => {
  const opts = SIGNS[k].options.map((x) => x.value);
  return s[k] !== undefined && opts.indexOf(s[k]) >= opts.indexOf(v);
};

function classify(pop, s) {
  const count = (arr) => arr.filter(Boolean).length;
  const some = (extra = []) => count([atLeast('mental', s, 'irritable'), s.eyes === 'sunken', atLeast('pulse', s, 'rapid'), atLeast('drinking', s, 'thirsty'), atLeast('pinch', s, 'slow'), ...extra]) >= 2;
  if (pop === 'sam') {
    if (count([s.mental === 'lethargic', s.eyes === 'sunken', s.pulse === 'weak', s.drinking === 'poorly', s.pinch === 'veryslow']) >= 2) return 'severe';
    return some() ? 'some' : 'none';
  }
  if (pop === 'preg23') {
    const danger = s.mental === 'lethargic' || s.pulse === 'weak' || s.sbp <= 90;
    if (danger || count([s.eyes === 'sunken', s.pinch === 'veryslow', s.drinking === 'poorly', s.fetal === 'over160']) >= 2) return 'severe';
    return some([s.fetal === 'over160']) ? 'some' : 'none';
  }
  const danger = s.mental === 'lethargic' || s.pulse === 'weak' || s.breathing === 'distress';
  if (danger || count([s.eyes === 'sunken', s.drinking === 'poorly', s.pinch === 'veryslow']) >= 2) return 'severe';
  return some() ? 'some' : 'none';
}

const mL = (x) => `${Math.round(x).toLocaleString('en-US')} mL`;
const perH = (vol, hours) => `${Math.round(vol / hours).toLocaleString('en-US')} mL/h`;
const r1 = (x) => String(Math.round(x * 10) / 10);
const blank = (v) => v === undefined || v === null || String(v).trim() === '';

// Plan B bands from the 12 July 2024 job aid: [weight lo kg, age lo years, volume].
const PLAN_B = [[0, 0, '200 to 400 mL'], [5, 4 / 12, '400 to 600 mL'], [8, 1, '600 to 800 mL'], [12, 2, '800 to 1,200 mL'], [16, 5, '1,200 to 2,200 mL'], [30, 15, '2,200 to 4,000 mL']];
const W_TEXT = ['under 5 kg', '5 to under 8 kg', '8 to under 12 kg', '12 to under 16 kg', '16 to under 30 kg', '30 kg or more'];
const A_TEXT = ['under 4 months', '4 to 11 months', '12 to 23 months', '2 to under 5 years', '5 to under 15 years', '15 years or more'];

export function choleraRehydration(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const pop = POPULATION_OPTIONS.find((p) => p.value === o.population);
  if (!pop) return { valid: false, message: 'Choose who the patient is: pregnancy in the second or third trimester and severe malnutrition each change the plan.' };
  const fa = inputFault([['the age', o.age, 0, 120, 'years']]);
  if (fa) return { valid: false, message: fa };
  const age = Number(o.age);
  if (pop.value === 'sam' && age >= 5) return { valid: false, message: 'The severe malnutrition protocol is for children under 5 years. Check the age, or choose another group.' };
  if ((pop.value === 'preg1' || pop.value === 'preg23') && (age < 10 || age > 60)) return { valid: false, message: 'Check the age: pregnancy was chosen.' };
  let w = null;
  if (!blank(o.weight)) {
    const fw = inputFault([['the weight', o.weight, 0.5, 250, 'kg']]);
    if (fw) return { valid: false, message: fw };
    w = Number(o.weight);
  }
  let sbp = null;
  if (pop.value === 'preg23' && !blank(o.sbp)) {
    const fs = inputFault([['the systolic blood pressure', o.sbp, 30, 250, 'mmHg']]);
    if (fs) return { valid: false, message: fs };
    sbp = Number(o.sbp);
  }

  // Which signs this population reads.
  const used = ['mental', 'pulse', 'eyes', 'drinking', 'pinch'];
  if (pop.value === 'general' || pop.value === 'preg1') used.push('breathing');
  if (pop.value === 'preg23') used.push('fetal');
  for (const k of used) {
    if (!blank(o[k]) && !SIGNS[k].options.some((x) => x.value === o[k])) return { valid: false, message: `Choose the ${SIGNS[k].label} from the list.` };
  }
  const missing = used.filter((k) => blank(o[k])).map((k) => SIGNS[k].label);
  if (pop.value === 'preg23' && sbp === null) missing.push('systolic blood pressure');
  const best = {};
  const worst = {};
  for (const k of used) {
    const opts = SIGNS[k].options;
    best[k] = blank(o[k]) ? opts[0].value : o[k];
    worst[k] = blank(o[k]) ? opts[opts.length - 1].value : o[k];
  }
  best.sbp = sbp === null ? 120 : sbp;
  worst.sbp = sbp === null ? 80 : sbp;
  const lo = classify(pop.value, best);
  const hi = classify(pop.value, worst);
  if (missing.length === used.length + (pop.value === 'preg23' ? 1 : 0)) {
    return { valid: false, message: 'Enter the signs: mental state, pulse, eyes, drinking and skin pinch at least.' };
  }
  if (RANK[lo] !== RANK[hi]) {
    return { valid: false, message: `Not enough is assessed to classify: enter the ${missing.join(', ')}. The dehydration level could be ${lo} or ${hi} depending on ${missing.length === 1 ? 'it' : 'them'}.` };
  }
  const level = lo;
  const notes = [];
  if (missing.length) notes.push(`Not assessed: ${missing.join(', ')}. The classification holds whatever ${missing.length === 1 ? 'it shows' : 'they show'}.`);

  const fluid = fluids(pop.value, level, age, w, worst, notes);
  if (fluid.refuse) return { valid: false, message: fluid.refuse };

  antibiotic(pop.value, level, age, w, o, notes);
  zinc(pop.value, age, notes);
  if (level !== 'none') notes.push('Admit to the cholera treatment center or unit.');

  return {
    valid: true,
    band: fluid.band,
    bandLabel: LABEL[level],
    abnormal: level !== 'none',
    notes,
    note: 'This follows the GTFCC cholera job aids (July and September 2024) and technical notes (2020, 2022). Your national protocol may differ; follow it.',
  };
}

function fluids(pop, level, age, w, signs, notes) {
  const infant = age < 1;
  if (pop === 'sam') {
    if (level === 'none') {
      notes.push('Start F-75 feeding as soon as possible, under the severe malnutrition protocol.');
      return { band: `No dehydration (severe malnutrition): standard ORS, ${age <= 2 ? '50 mL' : '100 mL'} after each loose stool. Use standard low-osmolarity ORS, not ReSoMal.` };
    }
    if (w === null) return { refuse: 'Enter the weight in kg: rehydration in severe malnutrition is given per kg.' };
    const stool = age < 2 ? '50 mL' : '100 mL';
    const oralB = `standard ORS by mouth or nasogastric tube, ${mL(w * 5)} (5 mL/kg) every 30 minutes for the first 2 hours; then, if still dehydrated, ${mL(w * 5)} to ${mL(w * 10)} (5 to 10 mL/kg) in alternate hours with F-75, up to 10 hours, plus ${stool} more after each loose stool`;
    if (level === 'some' || signs.mental !== 'lethargic') {
      notes.push('Check every 30 minutes for the first 2 hours, then hourly, for improvement or signs of overhydration (breathing and pulse both faster, swollen neck veins, growing edema, weight above the target). Stop ORS if they appear.');
      notes.push('Use standard low-osmolarity ORS, not ReSoMal. Keep breastfeeding and therapeutic milk going.');
      if (level === 'severe') notes.push('The job aid gives IV fluid in severe malnutrition only for circulatory collapse that leaves the child lethargic or unconscious; without it, rehydration is by mouth or tube.');
      return { band: `${level === 'severe' ? 'Severe' : 'Some'} dehydration (severe malnutrition): ${oralB}.` };
    }
    notes.push('Watch every 5 to 10 minutes for overhydration and heart failure, and stop the IV at once if they appear.');
    notes.push(`If the child is better after the first hour, give ${mL(w * 15)} more over a second hour, with standard ORS ${mL(w * 5)} to ${mL(w * 10)} (5 to 10 mL/kg) alternating with F-75 until rehydrated (up to 10 hours). If not better, treat as septic shock.`);
    notes.push('Start the oral antibiotic once vomiting stops.');
    return { band: `Severe dehydration with collapse (severe malnutrition): IV ${mL(w * 15)} over 1 hour (15 mL/kg, ${perH(w * 15, 1)}), as Ringer's lactate with 5% glucose or half-strength Darrow's with 5% glucose (else 0.45% saline with 5% glucose).` };
  }

  if (pop === 'preg23') {
    if (level === 'none') {
      notes.push('If she vomits often or cannot drink enough ORS, switch to IV.');
      return { band: 'No dehydration (pregnant, second or third trimester): about 250 mL of ORS after each stool.' };
    }
    if (w === null) return { refuse: 'Enter the weight in kg: her fluids are given per kg.' };
    if (level === 'some') {
      notes.push(`If she cannot drink the ORS or vomits 3 or more times an hour, switch to IV Ringer's lactate, ${mL(w * 75)} (75 mL/kg).`);
      notes.push('If systolic falls below 90, or danger or severe signs appear, move to Plan C. Check her blood pressure, pulse, breathing and the fetal heart every 30 minutes, and the signs of dehydration hourly.');
      return { band: `Some dehydration (pregnant, second or third trimester): ORS ${mL(w * 75)} over 4 hours (75 mL/kg, about ${perH(w * 75, 4)}), plus about 250 mL after each stool.` };
    }
    notes.push(`Repeat the ${mL(w * 30)} bolus while the pulse stays weak, systolic stays 90 or below, she is not fully conscious, or a new danger sign has not resolved. If two boluses do not help, check for low blood sugar.`);
    notes.push('Lay her on her left side, never flat on her back. Check her breathing, blood pressure and the fetal heart at least every 30 minutes.');
    notes.push('If she vomits 3 or more times an hour or cannot keep ORS down, replace ongoing losses with at least 250 mL of Ringer\'s lactate IV per stool.');
    return { band: `Severe dehydration (pregnant, second or third trimester): Ringer's lactate ${mL(w * 30)} bolus over 30 minutes (30 mL/kg, ${perH(w * 30, 0.5)}); once she is stable, ${mL(w * 70)} over 3 to 4 hours (70 mL/kg, ${perH(w * 70, 4)} to ${perH(w * 70, 3)}), with about 250 mL of ORS after each stool if she is not vomiting much.` };
  }

  // General population (and first trimester).
  if (level === 'none') {
    const [per, packs] = age < 2 ? ['50 to 100 mL', '500 mL'] : age < 10 ? ['100 to 200 mL', '1 L'] : ['as much as wanted', '2 L'];
    return { band: `No dehydration: ORS ${per} after each loose stool; give enough packets for ${packs} a day. Do not admit.` };
  }
  if (level === 'some') {
    let band;
    if (w !== null) {
      const i = PLAN_B.map((b) => b[0]).filter((lo) => w >= lo).length - 1;
      band = `Some dehydration: ORS ${mL(w * 75)} over 4 hours (75 mL/kg, about ${perH(w * 75, 4)}).`;
      notes.push(`The job aid's band for ${W_TEXT[i]} is ${PLAN_B[i][2]}.`);
    } else {
      const i = PLAN_B.map((b) => b[1]).filter((lo) => age >= lo).length - 1;
      band = `Some dehydration: ORS ${PLAN_B[i][2]} over 4 hours (the job aid's band for ${A_TEXT[i]}).`;
      notes.push('No weight was entered, so this is the age band. With a weight, the amount is 75 mL/kg.');
    }
    notes.push('Give more ORS to replace ongoing losses on top of this. Reassess at least every hour.');
    return { band };
  }
  if (w === null) return { refuse: 'Enter the weight in kg: Plan C fluids are given per kg.' };
  const [h1, h2] = infant ? [1, 5] : [0.5, 2.5];
  notes.push('Use large cannulas, or two IV lines when large volumes must go in fast, and write the start time on the bag.');
  notes.push('Reassess every 15 to 30 minutes. Watch for low blood sugar and treat it quickly. Give ORS for ongoing losses as soon as the patient can drink safely.');
  return { band: `Severe dehydration: Ringer's lactate ${mL(w * 100)} (100 mL/kg) started now: ${mL(w * 30)} over ${infant ? '1 hour' : '30 minutes'} (${perH(w * 30, h1)}), then ${mL(w * 70)} over ${infant ? '5 hours' : '2.5 hours'} (${perH(w * 70, h2)}). ${infant ? 'Under 12 months' : '12 months or older'}.` };
}

function antibiotic(pop, level, age, w, o, notes) {
  const pregnant = pop === 'preg1' || pop === 'preg23';
  const fixed = [];
  if (level === 'severe') fixed.push('severe dehydration');
  if (pregnant) fixed.push('pregnancy');
  if (pop === 'sam') fixed.push('severe acute malnutrition');
  if (age > 60) fixed.push('age over 60');
  const flags = [['high purging (at least one stool an hour over the first 4 hours)', o.purging], ['a failed first 4 hours of rehydration', o.failed], ['HIV', o.hiv]];
  for (const [label, v] of flags) if (v === 'yes') fixed.push(label);
  const unknown = flags.filter(([, v]) => v !== 'yes' && v !== 'no').map(([label]) => label);
  let dose;
  if (age >= 12) dose = 'doxycycline 300 mg by mouth once (if the local strain is sensitive); alternatives azithromycin 1 g or ciprofloxacin 1 g once';
  else if (w !== null) dose = `doxycycline 2 to 4 mg/kg by mouth once, ${r1(w * 2)} to ${r1(w * 4)} mg (if the local strain is sensitive); alternatives azithromycin or ciprofloxacin 20 mg/kg once, ${r1(Math.min(w * 20, 1000))} mg (maximum 1 g). The 2024 flowchart prints 200 mg of doxycycline for any child under 12`;
  else dose = 'doxycycline 2 to 4 mg/kg by mouth once (if the local strain is sensitive); alternatives azithromycin or ciprofloxacin 20 mg/kg once, maximum 1 g. No weight was entered, so no mg dose is given';
  if (fixed.length) notes.push(`Antibiotic indicated (${fixed.join(', ')}): ${dose}.`);
  else if (unknown.length) notes.push(`Antibiotic: not indicated by the dehydration level. Not assessed: ${unknown.join(', ')}; any of them would indicate ${dose}.`);
  else notes.push('Antibiotic: not indicated (no severe dehydration, high purging, failed rehydration, pregnancy, malnutrition, HIV or age over 60).');
}

function zinc(pop, age, notes) {
  if (pop === 'sam') { notes.push('No extra zinc: therapeutic foods (F-75, F-100, RUTF) already contain enough.'); return; }
  notes.push(`Zinc for 10 days: ${age < 0.5 ? '10 mg' : '20 mg'} once a day (the 2024 job aids).${age >= 5 ? ' The 2022 technical note gives zinc only from 6 months to 5 years.' : ''}`);
}
