// spec-v1639 tool 12: nicotine replacement, the label's starting strength and step-down calendar.
//
// Sources, re-read October 12, 2026 (Drug Facts on DailyMed, Directions):
//   NicoDerm CQ (Haleon; set id 93b2d1b9-83c1-40b5-b6af-90c38c8d6cef, version 14): "if you smoke
//     more than 10 cigarettes per day, use according to the following 10-week schedule: STEP 1 one
//     21 mg patch/day Weeks 1-6; STEP 2 one 14 mg patch/day Weeks 7-8; STEP 3 one 7 mg patch/day
//     Weeks 9-10". "if you smoke 10 or less cigarettes per day, do not use STEP 1 (21 mg). Start
//     with STEP 2 (14 mg) for 6 weeks, then STEP 3 (7 mg) for 2 weeks and then stop." "apply one new
//     patch every 24 hours"; "you may wear the patch for 16 or 24 hours"; "do not wear more than one
//     patch at a time".
//   Nicorette gum (Haleon; 673fd19f-69b3-4f73-b9b4-18b5f4cbf69c, version 27) and Habitrol gum
//     (Dr. Reddy's; 5c394758-1179-455a-a562-c8e954fb2258, version 4): first cigarette within 30
//     minutes of waking, 4 mg; more than 30 minutes after waking, 2 mg; "12 week schedule: Weeks 1
//     to 6, 1 piece every 1 to 2 hours; Weeks 7 to 9, 1 piece every 2 to 4 hours; Weeks 10 to 12, 1
//     piece every 4 to 8 hours"; "use at least 9 pieces per day for the first 6 weeks"; "do not use
//     more than 24 pieces a day".
//   Nicorette lozenge (Haleon; f350e050-2173-43e0-8738-848382ce0700, version 8): the same strength
//     rule and 12-week schedule; "at least 9 lozenges per day for the first 6 weeks"; "do not use
//     more than 5 lozenges in 6 hours. Do not use more than 20 lozenges per day."
//   All: "if you are under 18 years of age, ask a doctor before use".
//
// The patch program is 10 weeks (8 for 10 or fewer cigarettes a day); only gum and lozenge run 12.
//
// Pure: no DOM, no network. `now` is read only to check that each label edition still stands.

import { parseIsoStrict, addCalendarDaysUtc } from './deadline.js';
import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const PRODUCTS = [
  { value: 'nicotine-transdermal', text: 'Patch (NicoDerm CQ)', setId: '93b2d1b9-83c1-40b5-b6af-90c38c8d6cef', brand: 'NicoDerm CQ' },
  { value: 'nicotine-gum', text: 'Gum (Nicorette, Habitrol)', setId: '673fd19f-69b3-4f73-b9b4-18b5f4cbf69c', brand: 'Nicorette gum' },
  { value: 'nicotine-lozenge', text: 'Lozenge (Nicorette)', setId: 'f350e050-2173-43e0-8738-848382ce0700', brand: 'Nicorette lozenge' },
];
export const HABITROL = '5c394758-1179-455a-a562-c8e954fb2258';
export const AGES = [{ value: 'age-18-or-over', text: '18 or older' }, { value: 'under-age-18', text: 'Under 18' }];
const POSTURE = 'This is what the label states for these inputs. It is not advice for a particular patient.';
const say = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
const iso = (d) => d.toISOString().slice(0, 10);
function date(v) { try { return parseIsoStrict(String(v ?? '').trim()); } catch { return null; } }

export function nrtStepSchedule(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const p = PRODUCTS.find((x) => x.value === String(o.product ?? '').trim());
  if (!p) return { valid: false, message: 'Choose the product: patch, gum or lozenge.' };
  const age = AGES.find((a) => a.value === String(o.age ?? '').trim());
  if (!age) return { valid: false, message: 'Choose whether the user is 18 or older: under 18, the label says to ask a doctor before use.' };
  const lr = labelRow(p.setId, now, table);
  const base = { valid: true, product: p.value, labelUrl: lr.url };
  if (!lr.answers) {
    const notes = [`The ${p.brand} label rows are withheld: ${lr.why}.`, 'Read the Directions on the package in hand.', POSTURE];
    return { ...base, withheld: true, flag: 'withheld', abnormal: false, band: `The ${p.brand} label's schedule is withheld, so nothing is reported.`, bandLabel: 'Withheld', notes, note: notes.join(' ') };
  }
  if (age.value === 'under-age-18') {
    const notes = [`The ${p.brand} label: "if you are under 18 years of age, ask a doctor before use".`, 'No schedule is shown.', `Label: ${lr.edition}.`, POSTURE];
    return { ...base, flag: 'ask-a-doctor', abnormal: true, band: 'Under 18: the label says to ask a doctor before use.', bandLabel: 'Ask a doctor before use', notes, note: notes.join(' ') };
  }
  const patch = p.value === 'nicotine-transdermal';
  const f = inputFault([patch ? ['the cigarettes smoked per day', o.cigarettesPerDay, null, 200, ''] : ['the minutes from waking to the first cigarette', o.minutesToFirst, 0, 1440, 'minutes']]);
  if (f) return { valid: false, message: f };
  const quit = date(o.quitDate);
  if (!quit) return { valid: false, message: 'Enter the quit date: the label says to begin on the quit day.' };
  const notes = []; const steps = []; let day = 0;
  const add = (weeks, what, extra) => { const start = addCalendarDaysUtc(quit, day); const end = addCalendarDaysUtc(quit, day + weeks * 7 - 1); steps.push({ start: iso(start), end: iso(end), days: weeks * 7, what, ...extra }); day += weeks * 7; return `${say(start)} to ${say(end)}`; };
  let band; let strength;
  if (patch) {
    const heavy = Number(o.cigarettesPerDay) > 10;
    strength = heavy ? '21 mg' : '14 mg';
    if (heavy) {
      notes.push(`More than 10 cigarettes a day: the label's 10-week schedule. Step 1, one 21 mg patch a day, weeks 1 to 6: ${add(6, '21 mg patch', { patches: 42 })} (42 patches).`);
      notes.push(`Step 2, one 14 mg patch a day, weeks 7 and 8: ${add(2, '14 mg patch', { patches: 14 })} (14 patches).`);
      notes.push(`Step 3, one 7 mg patch a day, weeks 9 and 10: ${add(2, '7 mg patch', { patches: 14 })} (14 patches).`);
    } else {
      notes.push(`10 or fewer cigarettes a day: the label says not to use Step 1 (21 mg). Step 2, one 14 mg patch a day for 6 weeks: ${add(6, '14 mg patch', { patches: 42 })} (42 patches).`);
      notes.push(`Step 3, one 7 mg patch a day for 2 weeks, then stop: ${add(2, '7 mg patch', { patches: 14 })} (14 patches).`);
    }
    notes.push('The label: one new patch every 24 hours; the patch may be worn for 16 or 24 hours; not more than one patch at a time; not cut.');
    band = `Start at ${strength}; the program ends ${say(addCalendarDaysUtc(quit, day - 1))} (${day / 7} weeks).`;
  } else {
    const gum = p.value === 'nicotine-gum'; const piece = gum ? 'piece' : 'lozenge'; const max = gum ? 24 : 20;
    const early = Number(o.minutesToFirst) <= 30;
    strength = early ? '4 mg' : '2 mg';
    notes.push(early ? `First cigarette within 30 minutes of waking: the label says to use the 4 mg ${gum ? 'gum' : 'lozenge'}.` : `First cigarette more than 30 minutes after waking: the label says to use the 2 mg ${gum ? 'gum' : 'lozenge'}.`);
    notes.push(`Weeks 1 to 6, one ${piece} every 1 to 2 hours: ${add(6, `one ${piece} every 1 to 2 hours`, { minPieces: 9 * 42, maxPieces: max * 42 })}. The label says at least 9 a day for the first 6 weeks and not more than ${max} a day: ${9 * 42} to ${max * 42} ${piece}s.`);
    notes.push(`Weeks 7 to 9, one ${piece} every 2 to 4 hours: ${add(3, `one ${piece} every 2 to 4 hours`, { maxPieces: max * 21 })}. Not more than ${max} a day: at most ${max * 21}; the label states no minimum for these weeks.`);
    notes.push(`Weeks 10 to 12, one ${piece} every 4 to 8 hours: ${add(3, `one ${piece} every 4 to 8 hours`, { maxPieces: max * 21 })}. At most ${max * 21}; no minimum stated.`);
    if (!gum) notes.push('The lozenge label also says not more than 5 lozenges in 6 hours.');
    else {
      const hb = labelRow(HABITROL, now, table);
      if (hb.answers) notes.push(`The Habitrol gum label gives the same strength rule, schedule and limits (${hb.edition}).`);
    }
    band = `Start at ${strength}; the 12-week schedule ends ${say(addCalendarDaysUtc(quit, day - 1))}.`;
  }
  notes.push('The label says to begin on the quit day, and to talk to a health care provider about using the product for longer.');
  notes.push(`Label: ${lr.edition}.`);
  notes.push(POSTURE);
  return { ...base, startingStrength: strength, steps, endDate: iso(addCalendarDaysUtc(quit, day - 1)), flag: 'schedule', abnormal: false, band, bandLabel: `${strength} to start`, notes, note: notes.join(' ') };
}
