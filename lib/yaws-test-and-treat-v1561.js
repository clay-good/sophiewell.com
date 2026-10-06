// spec-v1561 tool 6: yaws: reading the rapid and DPP tests, the WHO case class, and the azithromycin dose.
//
// Sources, read October 6, 2026 (CC BY-NC-SA 3.0 IGO, facts restated):
//   - YAWS21: WHO. Eradication of yaws: surveillance, monitoring and evaluation manual, 2021 (IRIS
//     10665/351333), pp. viii-x: suspected (living or lived in an endemic area, with signs consistent with
//     yaws); treponemal positive (plus a positive treponemal RDT, TPHA or TPPA); serologically confirmed
//     (dual-positive DPP, or TPHA/TPPA plus RPR); PCR-confirmed. RDT: control and treponemal lines positive,
//     control only negative, no control invalid. DPP: all three lines dual positive; control and T only past
//     infection; control only non-reactive; no control, or control and non-treponemal without T, invalid
//     (repeat). Cure: complete or partial healing within 4 weeks. Treatment: single dose of azithromycin
//     30 mg/kg, maximum 2 g.
//   - YAWS18: WHO. Eradication of yaws: a guide for programme managers, 2018 (IRIS 10665/259902), pp. 8-9:
//     not under 6 months; allowed in pregnancy and breastfeeding; 500 mg tablets by age (under 6 years 1,
//     crushed in water, or syrup; 6-9 years 2; 10-14 years 3; 15 years or more 4); alternative benzathine
//     benzylpenicillin IM 1.2 million units (adults), 600,000 units (under 10), only when azithromycin
//     cannot be used.
//
// Stated rather than hidden: the "under 6 years, 1 tablet" band gives a small child far more than 30 mg/kg,
// so with a weight the tile gives 30 mg/kg and shows the age band beside it. A DPP with only the
// non-treponemal line is invalid, never active infection.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];
export const PCR_OPTIONS = [{ value: 'pos', text: 'Positive' }, { value: 'neg', text: 'Negative' }, { value: 'notdone', text: 'Not done' }];

const NOTE = 'This follows WHO\'s yaws eradication manual (2021) and programme guide (2018).';
const seen = (v) => (v === 'yes' ? true : v === 'no' ? false : null);

function readRdt(o) {
  const c = seen(o.rdtC);
  const t = seen(o.rdtT);
  if (c === null && t === null) return { r: 'notdone' };
  if (c === false) return { r: 'invalid' };
  if (c === null) return { ask: 'Choose whether the rapid test control line is visible.' };
  if (t === null) return { ask: 'Choose whether the rapid test treponemal line is visible.' };
  return { r: t ? 'pos' : 'neg' };
}
function readDpp(o) {
  const c = seen(o.dppC);
  const t = seen(o.dppT);
  const nt = seen(o.dppNT);
  if (c === null && t === null && nt === null) return { r: 'notdone' };
  if (c === false) return { r: 'invalid' };
  if (c === null || t === null || nt === null) return { ask: 'Choose whether each DPP line (control, T, non-treponemal) is visible.' };
  if (t && nt) return { r: 'dual' };
  if (t) return { r: 'past' };
  if (nt) return { r: 'invalid' };
  return { r: 'nonreactive' };
}

export function yawsTestAndTreat(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the age', o.age, 0, 120, 'years']]);
  if (f) return { valid: false, message: f };
  const years = Number(o.age);
  let kg = null;
  if (String(o.weight ?? '').trim() !== '') {
    const fw = inputFault([['the weight', o.weight, 2, 250, 'kg']]);
    if (fw) return { valid: false, message: fw };
    kg = Number(o.weight);
  }
  if (!YES_NO.some((x) => x.value === o.endemic)) return { valid: false, message: 'Choose whether the person lives or lived in an area where yaws is or was endemic.' };
  if (!YES_NO.some((x) => x.value === o.lesion)) return { valid: false, message: 'Choose whether there is a yaws-like skin lesion.' };
  const rdt = readRdt(o);
  if (rdt.ask) return { valid: false, message: rdt.ask };
  const dpp = readDpp(o);
  if (dpp.ask) return { valid: false, message: dpp.ask };
  const pcr = PCR_OPTIONS.some((x) => x.value === o.pcr) ? o.pcr : 'notdone';

  const notes = [];
  const rdtText = { notdone: 'not done', pos: 'positive', neg: 'negative', invalid: 'invalid (no control line): repeat it' }[rdt.r];
  const dppText = { notdone: 'not done', dual: 'dual positive (active infection)', past: 'positive for past infection', nonreactive: 'non-reactive', invalid: 'invalid: repeat it' }[dpp.r];
  if (rdt.r !== 'notdone') notes.push(`Rapid test: ${rdtText}.`);
  if (dpp.r !== 'notdone') notes.push(`DPP: ${dppText}.`);
  if (dpp.r === 'invalid' && seen(o.dppC) === true) notes.push('A DPP with the non-treponemal line but no treponemal line is invalid, not active infection.');

  const suspected = o.endemic === 'yes' && o.lesion === 'yes';
  let cls;
  if (pcr === 'pos') cls = 'PCR-confirmed yaws';
  else if (suspected && dpp.r === 'dual') cls = 'Serologically confirmed yaws';
  else if (suspected && rdt.r === 'pos') cls = 'Treponemal-positive case';
  else if (suspected) cls = 'Suspected yaws';
  else if (dpp.r === 'dual') cls = 'Latent yaws infection (dual positive, no lesion)';
  else if (dpp.r === 'past') cls = 'Past yaws infection';
  else cls = 'Not a yaws case';
  const treat = cls !== 'Not a yaws case' && cls !== 'Past yaws infection';

  let dose = '';
  if (treat) {
    if (years < 0.5) {
      dose = 'Azithromycin is not given under 6 months: use benzathine benzylpenicillin 600,000 units IM.';
    } else {
      const band = years < 6 ? '1 tablet of 500 mg, crushed in water (or syrup)' : years < 10 ? '2 tablets of 500 mg' : years < 15 ? '3 tablets of 500 mg' : '4 tablets of 500 mg';
      dose = kg !== null
        ? `Azithromycin ${Math.round(Math.min(2000, 30 * kg)).toLocaleString('en-US')} mg once by mouth (30 mg/kg${30 * kg > 2000 ? ', maximum 2 g' : ''}). The age band would give ${band}.`
        : `Azithromycin once by mouth, by age: ${band} (30 mg/kg, maximum 2 g). Weight: not entered; with a weight the dose is 30 mg/kg.`;
      notes.push(`Only if azithromycin cannot be used: benzathine benzylpenicillin IM, ${years < 10 ? '600,000 units' : '1.2 million units'}.`);
      notes.push('Azithromycin can be given in pregnancy and breastfeeding.');
    }
    notes.push('Treat the household and close contacts too. Expect complete or partial healing within 4 weeks; no improvement then is treatment failure.');
  } else if (cls === 'Not a yaws case') {
    notes.push(o.endemic === 'no' ? 'Yaws case definitions need residence in a previously or currently endemic area.' : 'No yaws-like lesion and no positive test.');
  }
  return { valid: true, band: `${cls}.${dose ? ` ${dose}` : ''}`, bandLabel: cls.replace(/ \(.*\)$/, ''), abnormal: treat, notes, note: NOTE };
}
