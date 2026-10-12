// spec-v1636 tool 3: CroFab, Anavip and Anascorp: vials, volumes and the maintenance clock.
//
// Sources, DailyMed labels re-read October 12, 2026:
//   CROFAB, BTG (set 77abd784-..., version 21). 2.1: "the recommended initial dose is 4 to 6 vials;
//     however, the starting dose may vary from a minimum of 4 vials to a maximum of 12 vials"; "If
//     initial control is not achieved by the first dose, an additional dose of 4 to 6 vials should be
//     administered repeatedly until initial control"; "Once initial control has been achieved,
//     additional 2-vial doses of CROFAB every 6 hours for up to 18 hours (3 doses) are recommended."
//     2.2: reconstitute each vial with 18 mL of 0.9% sodium chloride; dilute to a total of 250 mL;
//     infuse over 60 minutes, the first 10 minutes at 25 to 50 mL/hour, then 250 mL/hour.
//   ANAVIP, Rare Disease Therapeutics (set a16596a5-..., version 24). Initial dose 10 vials;
//     "additional 10 vial doses if needed ... repeat every hour ... There is no known maximum dose";
//     "Monitor patients in a health care setting at least 18 hours following initial control";
//     re-emerging symptoms "may be suppressed with additional 4 vial doses". 10 mL of saline per
//     vial; dilute to 250 mL; 60 minutes, the first 10 at 25 to 50 mL/hour.
//   ANASCORP, Rare Disease Therapeutics (set 5cb65048-..., version 20). Initial dose 3 vials, 5 mL
//     of saline per vial, diluted to 50 mL, over 10 minutes; additional doses "one vial at a time at
//     intervals of 30 to 60 minutes", each diluted to 50 mL and infused over 10 minutes.
//
// Counts and clocks. Whether initial control has been achieved is the reader's finding, and the
// number of vials in a dose the label gives as a range is the reader's entry.
//
// Pure: the clock is a parameter (used only for the label rows).

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const PRODUCTS = [
  { value: 'crofab', text: 'CroFab (pit viper)', name: 'CROFAB', setId: '77abd784-3387-420d-abdc-4fe97215d233', diluentMl: 18, bagMl: 250, minutes: 60 },
  { value: 'anavip', text: 'Anavip (pit viper)', name: 'ANAVIP', setId: 'a16596a5-e87e-40c2-8e34-cea5839849c3', diluentMl: 10, bagMl: 250, minutes: 60 },
  { value: 'anascorp', text: 'Anascorp (scorpion)', name: 'ANASCORP', setId: '5cb65048-a30c-48e5-8bc8-897983d08068', diluentMl: 5, bagMl: 50, minutes: 10 },
];
export const LABELS = Object.fromEntries(PRODUCTS.map((p) => [p.value, { name: p.name, setId: p.setId }]));
export const DOSES = [
  { value: 'first-dose', text: 'The initial dose' },
  { value: 'repeat-dose', text: 'A further dose, initial control not yet achieved' },
  { value: 'later-dose', text: 'A dose after initial control (CroFab maintenance; Anavip for re-emerging signs)' },
];
// What the label gives for each product and dose: a fixed count, a range the reader picks within, or none.
const RULE = {
  crofab: { 'first-dose': { lo: 4, hi: 12, usual: '4 to 6 vials (the label allows 4 to 12 by severity)' }, 'repeat-dose': { lo: 4, hi: 6, usual: '4 to 6 vials, repeated until initial control' }, 'later-dose': { fixed: 2, usual: '2 vials every 6 hours for up to 18 hours (3 doses)' } },
  anavip: { 'first-dose': { fixed: 10, usual: '10 vials' }, 'repeat-dose': { fixed: 10, usual: '10 vials, repeated every hour as needed; the label states no known maximum' }, 'later-dose': { fixed: 4, usual: '4 vials for re-emerging signs' } },
  anascorp: { 'first-dose': { fixed: 3, usual: '3 vials' }, 'repeat-dose': { fixed: 1, usual: 'one vial at a time, at intervals of 30 to 60 minutes' }, 'later-dose': null },
};
const NOTE = 'Vial counts, volumes and times from the label for the dose described. Whether initial control has been achieved is a clinical finding, and the poison center is the label\'s own named resource; this does not decide either.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const HOUR = 3600000;

// 'YYYY-MM-DDTHH:MM' (a datetime-local value) -> a wall-clock instant, or null.
function parseWhen(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})$/.exec(String(v ?? '').trim());
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  const t = Date.UTC(y, mo - 1, d, h, mi);
  const back = new Date(t);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d || h > 23 || mi > 59) return null;
  return t;
}
const clock = (t) => new Date(t).toISOString().slice(0, 16).replace('T', ' ');

export function usAntivenomDose(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const p = PRODUCTS.find((x) => x.value === String(o.product ?? '').trim());
  if (!p) return { valid: false, message: 'Choose the product: CroFab, Anavip or Anascorp. Their vial counts and volumes differ.' };
  const dose = DOSES.find((x) => x.value === String(o.dose ?? '').trim());
  if (!dose) return { valid: false, message: 'Choose which dose this is: the initial dose, a further dose before control, or a dose after initial control.' };
  const rule = RULE[p.value][dose.value];
  let vials = null;
  if (rule && rule.fixed === undefined) {
    const vf = inputFault([['the number of vials in this dose', o.vials, rule.lo, rule.hi, '']]);
    if (vf) return { valid: false, message: `${vf} For this dose the label gives ${rule.usual}, and does not pick the number.` };
    vials = Number(o.vials);
    if (!Number.isInteger(vials)) return { valid: false, message: 'Enter the number of vials as a whole number.' };
  } else if (rule) {
    vials = rule.fixed;
    if (!blank(o.vials) && Number(o.vials) !== rule.fixed) return { valid: false, message: `For this dose the ${p.name} label gives ${rule.usual}. Clear the number of vials, or enter ${rule.fixed}.` };
  }
  let before = null;
  if (!blank(o.vialsBefore)) {
    const bf = inputFault([['the vials given before this dose', o.vialsBefore, 0, 200, '']]);
    if (bf) return { valid: false, message: bf };
    before = Number(o.vialsBefore);
  }
  let control = null;
  if (!blank(o.controlTime)) {
    control = parseWhen(o.controlTime);
    if (control === null) return { valid: false, message: 'Enter the time initial control was achieved as a date and time (YYYY-MM-DDTHH:MM).' };
  }
  const lr = labelRow(p.setId, now, table);
  if (!lr.answers) return { valid: true, withheld: true, flag: 'withheld', abnormal: true, labelUrl: lr.url, band: `The ${p.name} label figures are withheld: ${lr.why}. Read the dose and preparation from the label in hand.`, bandLabel: 'Withheld', notes: [], note: NOTE };
  const tail = [`Label: ${lr.edition}.`];
  if (!rule) return { valid: true, flag: 'not-in-label', abnormal: true, labelUrl: lr.url, band: 'The ANASCORP label has no separate dose after control: it gives 3 vials, then one vial at a time at intervals of 30 to 60 minutes as needed.', bandLabel: 'Not in the label', notes: tail, note: NOTE };

  const diluent = vials * p.diluentMl;
  const notes = [
    `Label dose: ${rule.usual}.`,
    `Reconstitute each vial with ${p.diluentMl} mL of 0.9% sodium chloride: ${diluent} mL for ${vials} vial${vials === 1 ? '' : 's'}. Combine and dilute to a total of ${p.bagMl} mL.`,
    p.minutes === 60 ? 'Infuse over 60 minutes: the first 10 minutes at 25 to 50 mL/hour, watching for a reaction, then up to 250 mL/hour to finish.' : 'Infuse over 10 minutes.',
  ];
  if (before !== null) notes.push(`Cumulative: ${before} vial${before === 1 ? '' : 's'} before + ${vials} = ${before + vials} vials.`);
  const out = { valid: true, flag: 'dose', abnormal: false, labelUrl: lr.url, vials, diluentMl: diluent, totalVolumeMl: p.bagMl, cumulativeVials: before === null ? null : before + vials };
  if (p.value === 'crofab') {
    if (control !== null) { out.maintenanceTimes = [6, 12, 18].map((h) => clock(control + h * HOUR)); notes.push(`Initial control at ${clock(control)}: the three 2-vial maintenance doses fall at ${out.maintenanceTimes.join(', ')} (6, 12 and 18 hours).`); }
    else notes.push('After initial control the label gives 2 vials every 6 hours for up to 18 hours (3 doses); enter the time of control for the three times.');
    notes.push('The label says dosing beyond the 18-hour dose has not been determined, and further 2-vial doses are the treating physician\'s decision.');
  } else if (p.value === 'anavip') {
    if (control !== null) { out.observeUntil = clock(control + 18 * HOUR); notes.push(`Initial control at ${clock(control)}: the label's observation of at least 18 hours runs to ${out.observeUntil}.`); }
    else notes.push('The label says to monitor for at least 18 hours after initial control; enter the time of control for the end of that period.');
  } else notes.push('The label says to monitor closely during and up to 60 minutes after the infusion.');
  if (control !== null) notes.push('Times are read as written; a daylight-saving change in between is not adjusted for.');
  notes.push(...tail);
  return { ...out, band: `${p.name}: ${vials} vial${vials === 1 ? '' : 's'}, reconstituted with ${diluent} mL of saline in all and diluted to ${p.bagMl} mL, over ${p.minutes} minutes.${before !== null ? ` Cumulative ${before + vials} vials.` : ''}`, bandLabel: `${vials} vial${vials === 1 ? '' : 's'}`, notes, note: NOTE };
}
