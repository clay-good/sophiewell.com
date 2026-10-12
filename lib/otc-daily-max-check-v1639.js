// spec-v1639 tool 11: an OTC 24-hour total against the maximum the label or the monograph states.
//
// Sources, re-read October 12, 2026.
// Drug Facts "Directions" on DailyMed:
//   Advil Liqui-Gels (Haleon; set id 1f01c10a-9434-91a4-2ee4-352315a6b610, version 37): "take 1
//     capsule every 4 to 6 hours while symptoms persist; if pain or fever does not respond to 1
//     capsule, 2 capsules may be used; do not exceed 6 capsules in 24 hours, unless directed by a
//     doctor; children under 12 years: ask a doctor".
//   Aleve (Bayer; 3c0ddd25-5a9a-4628-a971-65fe2a9775b5, version 12): "take 1 tablet every 8 to 12
//     hours while symptoms last; for the first dose you may take 2 tablets within the first hour; do
//     not exceed 2 tablets in any 8- to 12-hour period; do not exceed 3 tablets in a 24-hour period".
//   Bayer Genuine Aspirin (Bayer; 44a08904-68b9-4d06-a28d-21aae3d6140c, version 8): "take 1 or 2
//     tablets every 4 hours or 3 tablets every 6 hours, not to exceed 12 tablets in 24 hours".
//   Imodium A-D caplets (Kenvue; 01da76d0-1979-4c45-9d39-c72ae4e4ffe2, version 13): 12 years and
//     over, "no more than 4 caplets in 24 hours".
//   Delsym (Reckitt; e3e1d126-76c2-4776-8ce0-449625b7e6ba, version 15): 12 and over, 10 mL every 12
//     hours, not to exceed 20 mL in 24 hours; 6 to under 12, 5 mL, not to exceed 10 mL; 4 to under
//     6, 2.5 mL, not to exceed 5 mL; under 4, do not use.
//   MiraLAX (Bayer; d69ce3d4-7ca4-4fe3-b49e-6655e48d6963, version 24): 17 years and older, 17 g once
//     a day; "do not use no more than 7 days"; 16 years or under, ask a doctor.
// FDA OTC monographs (posted October 14, 2022; the same doses stand in 21 CFR part 341 as the eCFR
// carried it on October 8, 2026):
//   M012.72(d)(7) diphenhydramine HCl: 12 and over, 25 to 50 mg every 4 to 6 hours, not to exceed
//     300 mg in 24 hours; 6 to under 12, 12.5 to 25 mg, not to exceed 150 mg; under 6, consult a
//     doctor.
//   M012.74(d)(1)(iii) dextromethorphan HBr: 12 and over, 10 to 20 mg every 4 hours or 30 mg every
//     6 to 8 hours, not to exceed 120 mg; 6 to under 12, 5 to 10 mg every 4 hours or 15 mg every 6
//     to 8 hours, not to exceed 60 mg.
//   M012.78(d) guaifenesin: 12 and over, 200 to 400 mg every 4 hours, not to exceed 2,400 mg; 6 to
//     under 12, 100 to 200 mg, not to exceed 1,200 mg.
//   M012.80(d)(1)(ii) pseudoephedrine: 12 and over, 60 mg every 4 to 6 hours, not to exceed 240 mg;
//     6 to under 12, 30 mg, not to exceed 120 mg.
//   M013.50(d)(2) aspirin: adults, not to exceed 4,000 mg in 24 hours.
//
// The tool states the limit and stops; it never says a total is safe. It computes no cough-and-cold
// figure for a child under 6. Acetaminophen has its own tool (apap-24h-max).
//
// Pure: no DOM, no network. `now` is read only to check that a label edition still stands.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

const INF = Infinity;
// groups: [fromYears, toYears) with max per 24 hours and the single-dose tiers [{ upTo, everyH }].
export const INGREDIENTS = [
  { value: 'ibuprofen-200', text: 'Ibuprofen 200 mg capsules (Advil Liqui-Gels label)', brand: 'Advil Liqui-Gels', setId: '1f01c10a-9434-91a4-2ee4-352315a6b610', unit: 'capsule', mg: 200,
    groups: [{ a: [12, INF], max: 6, tiers: [{ upTo: 2, everyH: 4 }], say: '"take 1 capsule every 4 to 6 hours while symptoms persist; if pain or fever does not respond to 1 capsule, 2 capsules may be used; do not exceed 6 capsules in 24 hours, unless directed by a doctor"' }, { a: [0, 12], stop: 'children under 12 years: ask a doctor' }] },
  { value: 'naproxen-sodium-220', text: 'Naproxen sodium 220 mg tablets (Aleve label)', brand: 'Aleve', setId: '3c0ddd25-5a9a-4628-a971-65fe2a9775b5', unit: 'tablet', mg: 220,
    groups: [{ a: [12, INF], max: 3, tiers: [{ upTo: 1, everyH: 8 }, { upTo: 2, everyH: 8, note: 'Two tablets at once is the label\'s first-dose allowance ("for the first dose you may take 2 tablets within the first hour"); it also says not to exceed 2 tablets in any 8- to 12-hour period.' }], say: '"take 1 tablet every 8 to 12 hours while symptoms last; for the first dose you may take 2 tablets within the first hour; do not exceed 2 tablets in any 8- to 12-hour period; do not exceed 3 tablets in a 24-hour period"' }, { a: [0, 12], stop: 'children under 12 years of age: ask a doctor' }] },
  { value: 'acetylsalicylic-acid-325', text: 'Aspirin 325 mg tablets (Bayer Genuine Aspirin label)', brand: 'Bayer Genuine Aspirin', setId: '44a08904-68b9-4d06-a28d-21aae3d6140c', unit: 'tablet', mg: 325,
    groups: [{ a: [12, INF], max: 12, tiers: [{ upTo: 2, everyH: 4 }, { upTo: 3, everyH: 6 }], say: '"take 1 or 2 tablets every 4 hours or 3 tablets every 6 hours, not to exceed 12 tablets in 24 hours"', extra: 'The monograph\'s adult limit for aspirin is "not to exceed 4,000 milligrams in 24 hours" (M013.50(d)(2)); 12 tablets is 3,900 mg.' }, { a: [0, 12], stop: 'children under 12 years: consult a doctor' }] },
  { value: 'loperamide-2', text: 'Loperamide 2 mg caplets (Imodium A-D label)', brand: 'Imodium A-D caplets', setId: '01da76d0-1979-4c45-9d39-c72ae4e4ffe2', unit: 'caplet', mg: 2,
    groups: [{ a: [12, INF], max: 4, tiers: [{ upTo: 2, everyH: null }], say: '"2 caplets after the first loose stool; 1 caplet after each subsequent loose stool; but no more than 4 caplets in 24 hours"' }, { a: [0, 12], stop: 'the label\'s rows for children under 12 are by weight and age (6 to 8 years: no more than 2 caplets; 9 to 11 years: no more than 3; 2 to 5 years: ask a doctor; under 2: do not use). Use the children\'s chart tool for those rows' }] },
  { value: 'diphenhydramine-hcl', text: 'Diphenhydramine HCl, as an antihistamine (monograph)', unit: 'unit', mg: null, cite: 'OTC Monograph M012.72(d)(7)', coughCold: true,
    groups: [{ a: [12, INF], maxMg: 300, tiersMg: [{ upTo: 50, everyH: 4 }], say: '"25 to 50 milligrams every 4 to 6 hours, not to exceed 300 milligrams in 24 hours, or as directed by a doctor"' }, { a: [6, 12], maxMg: 150, tiersMg: [{ upTo: 25, everyH: 4 }], say: '"12.5 to 25 milligrams every 4 to 6 hours, not to exceed 150 milligrams in 24 hours, or as directed by a doctor"' }, { a: [0, 6], stop: 'children under 6 years of age: consult a doctor', extra: 'The Children\'s Benadryl Allergy label says "do not use" under 2 years and "do not use unless directed by a doctor" at 2 to 5 years.' }] },
  { value: 'dextromethorphan-hbr', text: 'Dextromethorphan HBr, immediate release (monograph)', unit: 'unit', mg: null, cite: 'OTC Monograph M012.74(d)(1)(iii)', coughCold: true,
    groups: [{ a: [12, INF], maxMg: 120, tiersMg: [{ upTo: 20, everyH: 4 }, { upTo: 30, everyH: 6 }], say: '"10 to 20 milligrams every 4 hours or 30 milligrams every 6 to 8 hours, not to exceed 120 milligrams in 24 hours, or as directed by a doctor"' }, { a: [6, 12], maxMg: 60, tiersMg: [{ upTo: 10, everyH: 4 }, { upTo: 15, everyH: 6 }], say: '"5 to 10 milligrams every 4 hours or 15 milligrams every 6 to 8 hours, not to exceed 60 milligrams in 24 hours, or as directed by a doctor"' }, { a: [0, 6], under6: 'The monograph prints a dextromethorphan dose for ages 2 to under 6, while the Delsym label says "do not use" under 4 years.' }] },
  { value: 'dextromethorphan-polistirex-er', text: 'Dextromethorphan polistirex extended release, 30 mg per 5 mL (Delsym label)', brand: 'Delsym', setId: 'e3e1d126-76c2-4776-8ce0-449625b7e6ba', unit: 'mL', mg: 6, coughCold: true,
    groups: [{ a: [12, INF], max: 20, tiers: [{ upTo: 10, everyH: 12 }], say: '"10 mL every 12 hours, not to exceed 20 mL in 24 hours"' }, { a: [6, 12], max: 10, tiers: [{ upTo: 5, everyH: 12 }], say: '"5 mL every 12 hours, not to exceed 10 mL in 24 hours"' }, { a: [0, 6], under6: 'The Delsym label says: children 4 to under 6 years of age, 2.5 mL every 12 hours, not to exceed 5 mL in 24 hours; children under 4 years of age, do not use.' }] },
  { value: 'guaifenesin-ir', text: 'Guaifenesin, immediate release (monograph)', unit: 'unit', mg: null, cite: 'OTC Monograph M012.78(d)', coughCold: true,
    groups: [{ a: [12, INF], maxMg: 2400, tiersMg: [{ upTo: 400, everyH: 4 }], say: '"200 to 400 milligrams every 4 hours not to exceed 2,400 milligrams in 24 hours"' }, { a: [6, 12], maxMg: 1200, tiersMg: [{ upTo: 200, everyH: 4 }], say: '"100 to 200 milligrams every 4 hours not to exceed 1,200 milligrams in 24 hours"' }, { a: [0, 6], under6: 'The monograph prints a guaifenesin dose for ages 2 to under 6 and says "consult a doctor" under 2.' }] },
  { value: 'oral-decongestant-pse', text: 'Pseudoephedrine HCl or sulfate (monograph)', unit: 'unit', mg: null, cite: 'OTC Monograph M012.80(d)(1)(ii)', coughCold: true,
    groups: [{ a: [12, INF], maxMg: 240, tiersMg: [{ upTo: 60, everyH: 4 }], say: '"60 milligrams every 4 to 6 hours not to exceed 240 milligrams in 24 hours"' }, { a: [6, 12], maxMg: 120, tiersMg: [{ upTo: 30, everyH: 4 }], say: '"30 milligrams every 4 to 6 hours not to exceed 120 milligrams in 24 hours"' }, { a: [0, 6], under6: 'The monograph prints a pseudoephedrine dose for ages 2 to under 6 and says "consult a doctor" under 2.' }] },
  { value: 'peg-3350', text: 'Polyethylene glycol 3350, 17 g doses (MiraLAX label)', brand: 'MiraLAX', setId: 'd69ce3d4-7ca4-4fe3-b49e-6655e48d6963', unit: 'dose', mg: 17000, peg: true,
    groups: [{ a: [17, INF], max: 1, tiers: [{ upTo: 1, everyH: 24 }], say: '"adults and children 17 years of age and older: use once a day" (17 g), and the label limits use to no more than 7 days' }, { a: [0, 17], stop: 'children 16 years of age or under: ask a doctor' }] },
];
const POSTURE = 'This states the limit on the label or in the monograph and stops. It does not say that a total is safe, and it is not advice for a particular patient.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const r2 = (n) => Math.round(n * 100) / 100;
const num = (n) => r2(n).toLocaleString('en-US');
const pl = (n, u) => (u === 'mL' ? `${num(n)} mL` : `${num(n)} ${u}${n === 1 ? '' : 's'}`);

export function otcDailyMaxCheck(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const ing = INGREDIENTS.find((x) => x.value === String(o.ingredient ?? '').trim());
  if (!ing) return { valid: false, message: 'Choose the active ingredient. Acetaminophen has its own tool.' };
  const f0 = inputFault([['the age', o.ageYears, 0, 120, 'years']]);
  if (f0) return { valid: false, message: f0 };
  const age = Number(o.ageYears);
  const g = ing.groups.find((x) => age >= x.a[0] && age < x.a[1]);
  const base = { valid: true, ingredient: ing.value };
  let lr = null;
  if (ing.setId) {
    lr = labelRow(ing.setId, now, table); base.labelUrl = lr.url;
    if (!lr.answers) {
      const w = [`The ${ing.brand} label's limit is withheld: ${lr.why}.`, 'Read the Directions on the package in hand.', POSTURE];
      return { ...base, withheld: true, flag: 'withheld', abnormal: false, band: `The ${ing.brand} label's limit is withheld, so nothing is compared.`, bandLabel: 'Withheld', notes: w, note: w.join(' ') };
    }
  }
  const source = ing.setId ? `${ing.brand} label` : ing.cite;
  const tail = [];
  if (ing.setId) tail.push(`Label: ${lr.edition}.`); else tail.push(`Source: FDA ${ing.cite}, posted October 14, 2022.`);
  tail.push(POSTURE);
  if (g.stop || g.under6) {
    const notes = [];
    if (g.stop) notes.push(`${source}: ${g.stop}.`);
    if (g.under6) { notes.push(g.under6); notes.push('No cough-and-cold figure is computed for a child under 6: the label on the package in hand decides.'); }
    if (g.extra) notes.push(g.extra);
    notes.push(...tail);
    return { ...base, flag: 'no-limit-computed', abnormal: true, band: g.stop ? `At this age: ${g.stop.split('.')[0].split(' (')[0]}.` : 'Under 6 years: no cough-and-cold figure is computed.', bandLabel: 'No limit computed at this age', notes, note: notes.join(' ') };
  }
  const fixed = ing.mg !== null;
  const fields = [[`the ${ing.unit === 'mL' ? 'mL' : `${ing.unit}s`} taken or planned in 24 hours`, o.amount24h, null, 1000, '']];
  if (!fixed) fields.push(['the milligrams in each unit', o.unitMg, null, 5000, 'mg']);
  const f = inputFault(fields);
  if (f) return { valid: false, message: f };
  const amount = Number(o.amount24h);
  const perUnit = fixed ? ing.mg : Number(o.unitMg);
  const totalMg = amount * perUnit;
  const maxMg = fixed ? g.max * ing.mg : g.maxMg;
  const notes = [`${source}, at this age: ${g.say}.`];
  const over = totalMg > maxMg + 1e-9;
  const diff = Math.abs(totalMg - maxMg);
  if (ing.peg) notes.push(`${pl(amount, 'dose')} of 17 g in 24 hours is ${num(totalMg / 1000)} g; the label's dose is 17 g once a day.`);
  else if (fixed) notes.push(`${pl(amount, ing.unit)} in 24 hours is ${num(totalMg)} mg${ing.unit === 'mL' ? ' of dextromethorphan HBr equivalent' : ''}; the label's maximum is ${pl(g.max, ing.unit)} (${num(maxMg)} mg).`);
  else notes.push(`${pl(amount, 'unit')} of ${num(perUnit)} mg in 24 hours is ${num(totalMg)} mg; the monograph's maximum is ${num(maxMg)} mg.`);
  notes.push(over ? `Over the stated maximum by ${ing.peg ? `${num(diff / 1000)} g` : `${num(diff)} mg`}${fixed && !ing.peg ? ` (${pl(r2(diff / ing.mg), ing.unit)})` : ''}.` : diff < 1e-9 ? 'At the stated maximum.' : `Under the stated maximum by ${ing.peg ? `${num(diff / 1000)} g` : `${num(diff)} mg`}.`);
  let singleOver = false; let intervalShort = false; let daysOver = false;
  const tiers = fixed ? g.tiers : g.tiersMg;
  const top = tiers[tiers.length - 1];
  let tier = null;
  if (!blank(o.singleDose)) {
    const sf = inputFault([[fixed ? `the ${ing.unit === 'mL' ? 'mL' : `${ing.unit}s`} in one dose` : 'the units in one dose', o.singleDose, null, 1000, '']]);
    if (sf) return { valid: false, message: sf };
    const single = Number(o.singleDose) * (fixed ? 1 : perUnit);
    tier = tiers.find((t) => single <= t.upTo + 1e-9) || null;
    const shown = fixed ? pl(Number(o.singleDose), ing.unit) : `${num(single)} mg`;
    if (!tier) { singleOver = true; notes.push(`One dose of ${shown} is more than the largest single dose stated (${fixed ? pl(top.upTo, ing.unit) : `${num(top.upTo)} mg`}).`); }
    else { notes.push(`One dose of ${shown} is within the single dose stated.`); if (tier.note) notes.push(tier.note); }
  } else notes.push('No single dose was entered, so the single dose is not checked.');
  if (!blank(o.intervalHours)) {
    const hf = inputFault([['the hours between doses', o.intervalHours, null, 168, 'hours']]);
    if (hf) return { valid: false, message: hf };
    const h = Number(o.intervalHours); const t = tier || tiers[0];
    if (t.everyH === null) notes.push('The label ties doses to each loose stool, not to a clock interval, so the interval is not checked.');
    else if (h + 1e-9 < t.everyH) { intervalShort = true; notes.push(`${num(h)} hours between doses is shorter than the ${t.everyH} hours stated${tier ? ' for that single dose' : ' for the smallest dose (no single dose was entered)'}.`); }
    else notes.push(`${num(h)} hours between doses is not shorter than the ${t.everyH} hours stated${tier ? ' for that single dose' : ''}.`);
  } else notes.push('No interval was entered, so the interval is not checked.');
  if (ing.peg) {
    if (!blank(o.days)) {
      const df = inputFault([['the days of use', o.days, null, 365, 'days']]);
      if (df) return { valid: false, message: df };
      daysOver = Number(o.days) > 7;
      notes.push(daysOver ? `${num(Number(o.days))} days of use is more than the 7 days the label states.` : `${num(Number(o.days))} days of use is within the 7 days the label states.`);
    } else notes.push('No days of use were entered, so the label\'s 7-day line is not checked.');
  }
  if (g.extra) notes.push(g.extra);
  if (ing.value === 'ibuprofen-200' || ing.value === 'naproxen-sodium-220' || ing.value === 'acetylsalicylic-acid-325' || ing.value === 'loperamide-2') notes.push('This row is the OTC strength named; a prescription strength has a different label and is not covered.');
  notes.push(...tail);
  const any = over || singleOver || intervalShort || daysOver;
  const what = [over && 'the 24-hour maximum', singleOver && 'the single dose', intervalShort && 'the interval', daysOver && 'the 7 days'].filter(Boolean);
  return { ...base, totalMg: r2(totalMg), maxMg, overByMg: over ? r2(diff) : 0, flag: any ? 'outside-the-stated-limit' : 'within-the-stated-limit', abnormal: any,
    band: any ? `Outside what the ${fixed ? 'label' : 'monograph'} states: ${what.join(', ')}.` : `${ing.peg ? `${num(totalMg / 1000)} g` : `${num(totalMg)} mg`} in 24 hours: not over the stated maximum of ${ing.peg ? '17 g' : `${num(maxMg)} mg`}.`,
    bandLabel: over ? `Over by ${ing.peg ? `${num(diff / 1000)} g` : `${num(diff)} mg`}` : any ? 'Outside a stated limit' : 'Not over the stated maximum', notes, note: notes.join(' ') };
}
