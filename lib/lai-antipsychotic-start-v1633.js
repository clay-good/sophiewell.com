// spec-v1633 tool 17: long-acting injectable antipsychotic starting dose from the oral dose, by each label.
//
// Four label rows (spec-v1628 section 1), each re-read on October 11, 2026:
//   Invega Sustenna (Janssen, DailyMed version 41), section 2: "Recommended initiation ... is with a
//     dose of 234 mg on treatment day 1 and 156 mg one week later, both administered in the deltoid
//     muscle". Table 4, Invega extended-release tablets once daily to Invega Sustenna once every 4
//     weeks: 12 mg, 234 mg; 9 mg, 156 mg; 6 mg, 117 mg; 3 mg, 39-78 mg.
//   Invega Trinza (version 25), section 2.2: "only after the patient has been adequately treated with
//     the 1-month paliperidone palmitate ... for at least four months"; Table 1 (the 3.5-fold higher
//     dose): 78 mg, 273 mg; 117, 410; 156, 546; 234, 819; "Conversion from the INVEGA SUSTENNA 39 mg
//     dose was not studied"; "up to 7 days before or after the monthly time point of the next
//     scheduled ... dose".
//   Aristada (Alkermes, version 32), Table 2, by oral aripiprazole total daily dose: 10 mg per day,
//     441 mg every month; 15 mg per day, 662 mg every month, 882 mg every 6 weeks or 1064 mg every 2
//     months; 20 mg or higher per day, 882 mg every month. Initiation: "one intramuscular injection of
//     ARISTADA INITIO 675 mg ... and one dose of oral aripiprazole 30 mg", the first Aristada
//     injection "on the same day as ARISTADA INITIO or up to 10 days thereafter"; or "21 consecutive
//     days of oral aripiprazole".
//   Abilify Maintena (Otsuka, version 27), section 2.2: "400 mg monthly (no sooner than 26 days after
//     the previous injection)"; 1-day initiation, "two ... injections of ABILIFY MAINTENA 400 mg in
//     two different injection sites ... and one dose of oral aripiprazole 20 mg"; 14-day initiation,
//     one 400 mg injection and the oral antipsychotic "for 14 consecutive days".
//
// Starting doses only. Injection windows and missed doses are a different tool.
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';
import { parseDate } from './pa/date.js';

const SUSTENNA = { brand: 'Invega Sustenna', setId: '1af14e42-951d-414d-8564-5d5fce138554' };
const TRINZA = { brand: 'Invega Trinza', setId: 'c39e65d7-fa44-4e4c-8b12-a654d3ed0eae' };
const ARISTADA = { brand: 'Aristada', setId: '17a8d11b-73b0-4833-a0b4-cf1ef85edefb' };
const MAINTENA = { brand: 'Abilify Maintena', setId: 'ee49f3b1-1650-47ff-9fb1-ea53fe0b92b6' };
export const LABELS = { sustenna: SUSTENNA, trinza: TRINZA, aristada: ARISTADA, maintena: MAINTENA };
export const PRODUCTS = [
  { value: 'sustenna', text: 'Invega Sustenna, from oral paliperidone ER', label: SUSTENNA, ask: 'the oral paliperidone extended-release dose', unit: 'mg a day' },
  { value: 'trinza', text: 'Invega Trinza, from Invega Sustenna', label: TRINZA, ask: 'the last Invega Sustenna dose', unit: 'mg' },
  { value: 'aristada', text: 'Aristada, from oral aripiprazole', label: ARISTADA, ask: 'the oral aripiprazole dose', unit: 'mg a day' },
  { value: 'maintena-1-day', text: 'Abilify Maintena: 1-day initiation', label: MAINTENA },
  { value: 'maintena-14-day', text: 'Abilify Maintena: 14-day initiation', label: MAINTENA },
];
export const SUSTENNA_ROWS = [[12, '234 mg'], [9, '156 mg'], [6, '117 mg'], [3, '39 to 78 mg']]; // oral mg/day, monthly injection
export const TRINZA_ROWS = [[78, 273], [117, 410], [156, 546], [234, 819]]; // last Sustenna mg, Trinza mg
const NOTE = 'This reports the starting dose the label gives. It does not prescribe. Injection windows and missed doses are not covered here.';
const DAY = 86400000;
const iso = (d) => d.toISOString().slice(0, 10);
const plus = (d, n) => new Date(d.getTime() + n * DAY);
const blank = (v) => v === null || v === undefined || String(v).trim() === '';

export function laiAntipsychoticStart(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const product = PRODUCTS.find((p) => p.value === String(o.product ?? '').trim());
  if (!product) return { valid: false, message: 'Choose the product and start. Each label has its own table.' };
  let d = null;
  if (product.ask) {
    const f = inputFault([[product.ask, o.dose, null, 2000, product.unit.split(' ')[0]]]);
    if (f) return { valid: false, message: f };
    d = Number(o.dose);
  }
  let start = null;
  if (!blank(o.startDate)) { start = parseDate(o.startDate); if (!start) return { valid: false, message: 'Enter the date as YYYY-MM-DD, or leave it blank.' }; }
  const L = product.label; const lr = labelRow(L.setId, now, table);
  if (!lr.answers) return { valid: true, withheld: true, labelUrl: lr.url, band: `The ${L.brand} label's table is withheld, so nothing is reported.`, bandLabel: 'Withheld', notes: [`The ${L.brand} label rows are withheld: ${lr.why}.`, 'Read the dose from the label in hand.'], note: NOTE };
  const base = { valid: true, product: product.value, labelUrl: lr.url, note: NOTE };
  const tail = [`Label: ${lr.edition}.`];
  const notInTable = (band, notes = []) => ({ ...base, flag: 'not-in-table', abnormal: true, band, bandLabel: 'Not in the label\'s table', notes: [...notes, ...tail] });

  if (product.value === 'sustenna') {
    const row = SUSTENNA_ROWS.find((r) => r[0] === d);
    const init = `Initiation, by the label: 234 mg on day 1 and 156 mg one week later, both in the deltoid muscle${start ? ` (${iso(start)} and ${iso(plus(start, 7))})` : ''}.`;
    if (!row) return notInTable(`${d} mg a day is not in the Invega Sustenna label's table of oral and injection doses. Its rows are 3, 6, 9 and 12 mg a day of Invega extended-release tablets.`, [init]);
    return { ...base, flag: 'dose', abnormal: false, maintenance: row[1], band: `The Invega Sustenna label's table: oral paliperidone ER ${d} mg once daily corresponds to a maintenance dose of ${row[1]} once every 4 weeks.`, bandLabel: `${row[1]} monthly`, notes: [init, 'For patients who have never taken oral paliperidone or oral or injectable risperidone, the label establishes tolerability with an oral form first.', ...tail] };
  }
  if (product.value === 'trinza') {
    const need = 'The label uses Invega Trinza only after at least four months of adequate treatment with the 1-month injection.';
    if (d === 39) return notInTable('The Invega Trinza label says conversion from the Invega Sustenna 39 mg dose was not studied; it gives no Trinza dose for it.', [need]);
    const row = TRINZA_ROWS.find((r) => r[0] === d);
    if (!row) return notInTable(`${d} mg is not a row of the Invega Trinza label's table. Its rows are last Invega Sustenna doses of 78, 117, 156 and 234 mg.`, [need]);
    const win = start ? ` With the next monthly dose due ${iso(start)}, that is ${iso(plus(start, -7))} to ${iso(plus(start, 7))}.` : ' Enter the date the next monthly dose is due to see the window.';
    return { ...base, flag: 'dose', abnormal: false, doseMg: row[1], ...(start ? { windowFrom: iso(plus(start, -7)), windowTo: iso(plus(start, 7)) } : {}), band: `The Invega Trinza label's table: after a last Invega Sustenna dose of ${d} mg, initiate Invega Trinza at ${row[1]} mg (the 3.5-fold dose), then every 3 months.`, bandLabel: `${row[1]} mg every 3 months`, notes: [`Invega Trinza is given when the next monthly dose is due, up to 7 days before or after.${win}`, need, ...tail] };
  }
  if (product.value === 'aristada') {
    const options = d === 10 ? ['441 mg every month'] : d === 15 ? ['662 mg every month', '882 mg every 6 weeks', '1064 mg every 2 months'] : d >= 20 ? ['882 mg every month'] : null;
    const init = `With the first injection the label gives two options: one Aristada Initio 675 mg injection and one 30 mg oral aripiprazole dose (the first Aristada injection the same day or up to 10 days after the Initio), or 21 consecutive days of oral aripiprazole${start ? `, which runs through ${iso(plus(start, 20))} when the first injection is on ${iso(start)}` : ''}.`;
    if (!options) return notInTable(`${d} mg a day is not in the Aristada label's table. Its rows are 10 mg a day, 15 mg a day, and 20 mg a day or higher of oral aripiprazole.`, [init]);
    return { ...base, flag: 'dose', abnormal: false, options, band: options.length === 1 ? `The Aristada label's table: oral aripiprazole ${d >= 20 ? '20 mg a day or higher' : `${d} mg a day`} corresponds to ${options[0]}.` : `The Aristada label's table gives three choices for oral aripiprazole 15 mg a day: ${options.join(', ')}.`, bandLabel: options.length === 1 ? options[0] : '662 mg monthly, 882 mg every 6 weeks, or 1064 mg every 2 months', notes: [init, 'The label establishes tolerability with oral aripiprazole before the first injection in patients who have never taken it.', ...tail] };
  }
  const oneDay = product.value === 'maintena-1-day';
  const next = start ? ` With the first injection on ${iso(start)}, the next is no sooner than ${iso(plus(start, 26))}.` : '';
  return { ...base, flag: 'dose', abnormal: false, doseMg: 400, ...(start ? { nextNoSoonerThan: iso(plus(start, 26)) } : {}), ...(start && !oneDay ? { oralThrough: iso(plus(start, 13)) } : {}),
    band: oneDay ? 'The Abilify Maintena label, 1-day initiation: two 400 mg injections at two different injection sites and one 20 mg oral aripiprazole dose on the first day, then 400 mg monthly.' : `The Abilify Maintena label, 14-day initiation: one 400 mg injection, with oral aripiprazole 10 to 20 mg (or the current oral antipsychotic) continued for 14 consecutive days${start ? `, through ${iso(plus(start, 13))}` : ''}, then 400 mg monthly.`,
    bandLabel: '400 mg monthly',
    notes: [`Maintenance is 400 mg monthly, no sooner than 26 days after the previous injection.${next}`, 'The label allows a reduction to 300 mg monthly for adverse reactions, and gives separate doses for CYP2D6 poor metabolizers and for interacting drugs; those are not applied here.', ...(oneDay ? ['The two injections do not go into the same muscle.'] : []), ...tail] };
}
